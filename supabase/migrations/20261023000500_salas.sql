-- =====================================================================
-- Painel SJU · Reserva de Salas & Auditórios
-- =====================================================================
-- A anti-colisão é uma restrição de exclusão do Postgres: duas reservas
-- ativas da mesma sala com horários sobrepostos são impossíveis, mesmo com
-- duas pessoas clicando ao mesmo tempo.
-- =====================================================================

create table public.salas (
  id            uuid primary key default gen_random_uuid(),
  codigo        text not null unique,
  nome          text not null,
  andar         text not null default '',
  capacidade    integer not null check (capacidade between 1 and 2000),
  layout        text not null default '',
  equipamentos  text not null default '',
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now()
);
create trigger auditar_salas after insert or update or delete on public.salas
  for each row execute function public.tg_auditar('sala');

alter table public.salas enable row level security;
create policy salas_ler on public.salas for select to authenticated
  using (public.tem_permissao('salas:ver'));
create policy salas_gerenciar on public.salas for all to authenticated
  using (public.tem_permissao('salas:gerenciar')) with check (public.tem_permissao('salas:gerenciar'));

create sequence public.reservas_protocolo_seq;

create table public.reservas (
  id                uuid primary key default gen_random_uuid(),
  protocolo         text not null unique default public.gerar_protocolo('RS', 'public.reservas_protocolo_seq'),
  sala_id           uuid not null references public.salas(id),
  responsavel_id    uuid not null default auth.uid() references public.perfis(id),
  responsavel_nome  text not null default '',
  motivo            text not null check (length(trim(motivo)) between 3 and 300),
  participantes     integer check (participantes is null or participantes between 1 and 2000),
  inicio            timestamptz not null,
  fim               timestamptz not null,
  recursos_extras   text[] not null default '{}'
                    check (recursos_extras <@ array['copa', 'transmissao_hibrida', 'suporte_ti', 'gravacao']),
  status            text not null default 'ativa' check (status in ('ativa', 'cancelada')),
  cancelada_por     uuid references public.perfis(id),
  cancelada_em      timestamptz,
  motivo_cancelamento text,
  criado_em         timestamptz not null default now(),
  constraint reservas_intervalo_valido check (fim > inicio and fim - inicio <= interval '12 hours'),
  constraint reservas_sem_sobreposicao exclude using gist (
    sala_id with =,
    tstzrange(inicio, fim, '[)') with &&
  ) where (status = 'ativa')
);
create index reservas_sala_inicio_idx on public.reservas(sala_id, inicio) where status = 'ativa';
create index reservas_responsavel_idx on public.reservas(responsavel_id, inicio desc);

create or replace function public.tg_reservas_antes_inserir()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_sala   public.salas;
  v_ini_l  timestamp := new.inicio at time zone 'America/Sao_Paulo';
  v_fim_l  timestamp := new.fim at time zone 'America/Sao_Paulo';
begin
  if auth.uid() is not null then
    new.responsavel_id := auth.uid();
    if new.inicio < now() - interval '5 minutes' then
      raise exception 'Não é possível reservar horário no passado.' using errcode = 'P0001';
    end if;
  end if;
  select nome into new.responsavel_nome from public.perfis where id = new.responsavel_id;
  new.status := 'ativa'; new.cancelada_por := null; new.cancelada_em := null;

  select * into v_sala from public.salas where id = new.sala_id;
  if not found or not v_sala.ativo then
    raise exception 'Sala indisponível para reservas.' using errcode = 'P0001';
  end if;
  if new.participantes is not null and new.participantes > v_sala.capacidade then
    raise exception 'A sala % comporta até % pessoas.', v_sala.nome, v_sala.capacidade using errcode = 'P0001';
  end if;
  if v_ini_l::date <> (v_fim_l - interval '1 microsecond')::date
     or v_ini_l::time < time '07:00' or v_fim_l::time > time '22:00' then
    raise exception 'Reservas devem ocorrer no mesmo dia, entre 07h e 22h.' using errcode = 'P0001';
  end if;
  new.recursos_extras := array(select distinct r from unnest(new.recursos_extras) r order by r);
  return new;
end $$;
create trigger reservas_antes_inserir before insert on public.reservas
  for each row execute function public.tg_reservas_antes_inserir();

create or replace function public.tg_reservas_notificar_suporte()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_sala text;
begin
  if 'suporte_ti' = any(new.recursos_extras) or 'transmissao_hibrida' = any(new.recursos_extras) then
    select nome into v_sala from public.salas where id = new.sala_id;
    perform public.notificar_quem_pode('chamados:atender',
      'Apoio técnico solicitado · ' || v_sala,
      new.responsavel_nome || ' reservou ' || v_sala || ' em ' ||
        to_char(new.inicio at time zone 'America/Sao_Paulo', 'DD/MM "às" HH24:MI') ||
        ' com ' || array_to_string(new.recursos_extras, ', ') || '.',
      'info', '#/salas/' || new.id, new.responsavel_id);
  end if;
  return new;
end $$;
create trigger reservas_notificar_suporte after insert on public.reservas
  for each row execute function public.tg_reservas_notificar_suporte();
create trigger auditar_reservas after insert or update on public.reservas
  for each row execute function public.tg_auditar('reserva');

alter table public.reservas enable row level security;
-- A agenda é pública para quem usa o módulo (é preciso ver o que está ocupado).
create policy reservas_ler on public.reservas for select to authenticated
  using (public.tem_permissao('salas:ver'));
create policy reservas_inserir on public.reservas for insert to authenticated
  with check (public.tem_permissao('salas:reservar') and responsavel_id = auth.uid());
-- Sem UPDATE/DELETE direto: use cancelar_reserva().

create or replace function public.cancelar_reserva(p_id uuid, p_motivo text default null)
returns public.reservas
language plpgsql security definer set search_path = public
as $$
declare r public.reservas;
begin
  select * into r from public.reservas where id = p_id for update;
  if not found then
    raise exception 'Reserva não encontrada.' using errcode = 'P0002';
  end if;
  if r.responsavel_id <> auth.uid() and not public.tem_permissao('salas:cancelar_qualquer') then
    raise exception 'Só o responsável ou a administração pode cancelar esta reserva.' using errcode = '42501';
  end if;
  if r.status <> 'ativa' then
    raise exception 'A reserva já está cancelada.' using errcode = 'P0001';
  end if;
  update public.reservas
     set status = 'cancelada', cancelada_por = auth.uid(), cancelada_em = now(),
         motivo_cancelamento = nullif(trim(coalesce(p_motivo, '')), '')
   where id = p_id returning * into r;
  if r.responsavel_id <> auth.uid() then
    perform public.notificar(r.responsavel_id, 'Reserva cancelada · ' || r.protocolo,
      coalesce('Motivo: ' || r.motivo_cancelamento, 'Sua reserva foi cancelada pela administração.'),
      'alerta', '#/salas/' || r.id, true);
  end if;
  return r;
end $$;
