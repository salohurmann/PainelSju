-- =====================================================================
-- Painel SJU · Auditoria encadeada, notificações e fila de e-mails
-- =====================================================================
-- Auditoria:
--   * Cada registro guarda o hash do anterior (cadeia SHA-256).
--   * Ninguém altera nem apaga registros (trigger bloqueia UPDATE/DELETE/
--     TRUNCATE, inclusive para o service_role).
--   * verificar_auditoria() recalcula a cadeia e aponta o primeiro registro
--     adulterado, se houver.
--   * O ator vem sempre de auth.uid(); não é possível registrar em nome de
--     outra pessoa.
-- Limite honesto: um superusuário do banco ainda pode desligar triggers.
-- Para prova jurídica seria preciso ancorar o hash em sistema externo.
-- =====================================================================

create table public.auditoria (
  id             bigint generated always as identity primary key,
  ocorrido_em    timestamptz not null default now(),
  ator_id        uuid references public.perfis(id) on delete set null,
  ator_nome      text,
  acao           text not null check (acao ~ '^[A-Z_]{3,60}$'),
  entidade       text not null,
  entidade_id    text,
  detalhes       jsonb not null default '{}'::jsonb,
  hash_anterior  text,
  hash           text not null
);
create index auditoria_entidade_idx on public.auditoria(entidade, entidade_id);
create index auditoria_ator_idx on public.auditoria(ator_id);
create index auditoria_ocorrido_idx on public.auditoria(ocorrido_em desc);

create or replace function public.auditoria_calcular_hash(
  p_hash_anterior text, p_ocorrido_em timestamptz, p_ator_id uuid,
  p_acao text, p_entidade text, p_entidade_id text, p_detalhes jsonb
) returns text
language sql immutable set search_path = public, extensions
as $$
  select encode(extensions.digest(
    coalesce(p_hash_anterior, 'GENESIS') || '|' ||
    (extract(epoch from p_ocorrido_em) * 1000000)::bigint::text || '|' ||
    coalesce(p_ator_id::text, '-') || '|' ||
    p_acao || '|' || p_entidade || '|' || coalesce(p_entidade_id, '-') || '|' ||
    p_detalhes::text,
    'sha256'), 'hex');
$$;

-- Função interna: único caminho de escrita na auditoria.
create or replace function public.registrar_auditoria(
  p_acao text, p_entidade text, p_entidade_id text, p_detalhes jsonb default '{}'::jsonb
) returns bigint
language plpgsql security definer set search_path = public
as $$
declare
  v_ant   text;
  v_agora timestamptz := clock_timestamp();
  v_nome  text;
  v_id    bigint;
begin
  -- Serializa inserções para manter a cadeia linear
  perform pg_advisory_xact_lock(hashtext('public.auditoria'));
  select hash into v_ant from public.auditoria order by id desc limit 1;
  select nome into v_nome from public.perfis where id = auth.uid();

  insert into public.auditoria (ocorrido_em, ator_id, ator_nome, acao, entidade, entidade_id, detalhes, hash_anterior, hash)
  values (
    v_agora, auth.uid(), coalesce(v_nome, 'Sistema'), p_acao, p_entidade, p_entidade_id,
    coalesce(p_detalhes, '{}'::jsonb), v_ant,
    public.auditoria_calcular_hash(v_ant, v_agora, auth.uid(), p_acao, p_entidade, p_entidade_id, coalesce(p_detalhes, '{}'::jsonb))
  )
  returning id into v_id;
  return v_id;
end $$;
revoke execute on function public.registrar_auditoria(text, text, text, jsonb) from public, anon, authenticated;

-- Imutabilidade
create or replace function public.tg_auditoria_imutavel()
returns trigger language plpgsql as $$
begin
  raise exception 'A trilha de auditoria não pode ser alterada nem apagada.' using errcode = '42501';
end $$;
create trigger auditoria_sem_update before update or delete on public.auditoria
  for each row execute function public.tg_auditoria_imutavel();
create trigger auditoria_sem_truncate before truncate on public.auditoria
  for each statement execute function public.tg_auditoria_imutavel();

-- Verificação da cadeia
create or replace function public.verificar_auditoria()
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  r       record;
  v_ant   text := null;
  v_total bigint := 0;
begin
  if not public.tem_permissao('seguranca:auditar') then
    raise exception 'Sem permissão para verificar a auditoria.' using errcode = '42501';
  end if;
  for r in select * from public.auditoria order by id loop
    v_total := v_total + 1;
    if r.hash_anterior is distinct from v_ant
       or r.hash <> public.auditoria_calcular_hash(r.hash_anterior, r.ocorrido_em, r.ator_id, r.acao, r.entidade, r.entidade_id, r.detalhes) then
      return jsonb_build_object('integra', false, 'total', v_total, 'primeiro_invalido', r.id);
    end if;
    v_ant := r.hash;
  end loop;
  return jsonb_build_object('integra', true, 'total', v_total, 'primeiro_invalido', null);
end $$;

-- Registro de acesso a dado pessoal (ex.: revelar CPF mascarado na tela)
create or replace function public.registrar_acesso_dado_pessoal(p_contexto text, p_titular_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.meu_perfil_ativo() then
    raise exception 'Sessão inválida.' using errcode = '42501';
  end if;
  perform public.registrar_auditoria('DADO_PESSOAL_REVELADO', 'perfis', p_titular_id::text,
    jsonb_build_object('contexto', left(coalesce(p_contexto, ''), 200)));
end $$;

-- Trigger genérico de auditoria de tabelas de domínio.
-- TG_ARGV[0] = nome da entidade. Campos sensíveis são omitidos do diff.
create or replace function public.tg_auditar()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ent    text := coalesce(TG_ARGV[0], TG_TABLE_NAME);
  v_antigo jsonb;
  v_novo   jsonb;
  v_diff   jsonb := '{}'::jsonb;
  k        text;
  v_ocultos text[] := array['cpf', 'atualizado_em', 'fotos'];
begin
  if TG_OP = 'INSERT' then
    v_novo := to_jsonb(new) - v_ocultos;
    perform public.registrar_auditoria(upper(v_ent) || '_CRIADO', v_ent, v_novo->>'id', jsonb_build_object('registro', v_novo));
    return new;
  elsif TG_OP = 'UPDATE' then
    v_antigo := to_jsonb(old) - v_ocultos;
    v_novo   := to_jsonb(new) - v_ocultos;
    for k in select jsonb_object_keys(v_novo) loop
      if v_novo->k is distinct from v_antigo->k then
        v_diff := v_diff || jsonb_build_object(k, jsonb_build_object('de', v_antigo->k, 'para', v_novo->k));
      end if;
    end loop;
    if v_diff <> '{}'::jsonb then
      perform public.registrar_auditoria(upper(v_ent) || '_ALTERADO', v_ent, v_novo->>'id', jsonb_build_object('alteracoes', v_diff));
    end if;
    return new;
  else
    v_antigo := to_jsonb(old) - v_ocultos;
    perform public.registrar_auditoria(upper(v_ent) || '_REMOVIDO', v_ent, v_antigo->>'id', jsonb_build_object('registro', v_antigo));
    return old;
  end if;
end $$;

-- Auditoria das tabelas de acesso
create trigger auditar_perfis after update on public.perfis
  for each row execute function public.tg_auditar('perfil');
create trigger auditar_papel_permissoes after insert or delete on public.papel_permissoes
  for each row execute function public.tg_auditar('papel_permissao');
create trigger auditar_modulos after insert or update or delete on public.modulos
  for each row execute function public.tg_auditar('modulo');
create trigger auditar_modulo_setores after insert or delete on public.modulo_setores
  for each row execute function public.tg_auditar('modulo_setor');
create trigger auditar_setores after insert or update or delete on public.setores
  for each row execute function public.tg_auditar('setor');

alter table public.auditoria enable row level security;
create policy auditoria_ler on public.auditoria for select to authenticated
  using (public.tem_permissao('seguranca:auditar'));
-- Sem políticas de escrita: só registrar_auditoria() (SECURITY DEFINER) insere.

-- =====================================================================
-- Notificações in-app
-- =====================================================================
create table public.notificacoes (
  id              uuid primary key default gen_random_uuid(),
  destinatario_id uuid not null references public.perfis(id) on delete cascade,
  titulo          text not null,
  mensagem        text not null default '',
  tipo            text not null default 'info'
                  check (tipo in ('info', 'acao_necessaria', 'aprovado', 'reprovado', 'alerta')),
  link            text,          -- rota do front, ex.: #/frota/aprovacoes/<id>
  lida            boolean not null default false,
  criado_em       timestamptz not null default now()
);
create index notificacoes_dest_idx on public.notificacoes(destinatario_id, lida, criado_em desc);

alter table public.notificacoes enable row level security;
create policy notificacoes_ler on public.notificacoes for select to authenticated
  using (destinatario_id = auth.uid());
create policy notificacoes_marcar on public.notificacoes for update to authenticated
  using (destinatario_id = auth.uid()) with check (destinatario_id = auth.uid());
create policy notificacoes_apagar on public.notificacoes for delete to authenticated
  using (destinatario_id = auth.uid());

-- O destinatário só pode mudar "lida"
create or replace function public.tg_notificacoes_so_lida()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and (
       new.titulo is distinct from old.titulo or new.mensagem is distinct from old.mensagem
    or new.tipo is distinct from old.tipo or new.link is distinct from old.link
    or new.destinatario_id is distinct from old.destinatario_id) then
    raise exception 'Só é possível marcar a notificação como lida.' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger notificacoes_so_lida before update on public.notificacoes
  for each row execute function public.tg_notificacoes_so_lida();

-- =====================================================================
-- Fila de e-mails (enviada por Edge Function com a chave no servidor)
-- =====================================================================
create table public.email_outbox (
  id                 uuid primary key default gen_random_uuid(),
  destinatario_email text not null,
  assunto            text not null,
  corpo              text not null,
  status             text not null default 'pendente' check (status in ('pendente', 'enviado', 'erro')),
  tentativas         integer not null default 0,
  ultimo_erro        text,
  criado_em          timestamptz not null default now(),
  enviado_em         timestamptz
);
create index email_outbox_pendentes_idx on public.email_outbox(status, criado_em) where status <> 'enviado';
alter table public.email_outbox enable row level security;
create policy email_outbox_ler_admin on public.email_outbox for select to authenticated
  using (public.tem_permissao('admin:configurar'));
-- Escrita: apenas funções internas e service_role.

-- Função interna para notificar uma pessoa (e opcionalmente enfileirar e-mail)
create or replace function public.notificar(
  p_destinatario uuid, p_titulo text, p_mensagem text,
  p_tipo text default 'info', p_link text default null, p_email boolean default true
) returns void
language plpgsql security definer set search_path = public
as $$
declare v_email text;
begin
  if p_destinatario is null then return; end if;
  insert into public.notificacoes (destinatario_id, titulo, mensagem, tipo, link)
  values (p_destinatario, p_titulo, coalesce(p_mensagem, ''), p_tipo, p_link);
  if p_email then
    select email into v_email from public.perfis where id = p_destinatario and ativo;
    if v_email is not null then
      insert into public.email_outbox (destinatario_email, assunto, corpo)
      values (v_email, '[SEJU] ' || p_titulo, coalesce(p_mensagem, ''));
    end if;
  end if;
end $$;

-- Notifica todos os servidores ativos que têm uma permissão (ex.: aprovadores)
create or replace function public.notificar_quem_pode(
  p_permissao text, p_titulo text, p_mensagem text,
  p_tipo text default 'acao_necessaria', p_link text default null, p_exceto uuid default null
) returns void
language plpgsql security definer set search_path = public
as $$
declare r record;
begin
  for r in
    select pf.id from public.perfis pf
    where pf.ativo
      and pf.id is distinct from p_exceto
      -- Só quem tem a permissão de forma explícita (admin não é notificado
      -- de tudo; para isso, conceda a permissão ao papel admin na matriz).
      and exists (select 1 from public.papel_permissoes pp
                  where pp.papel_id = pf.papel_id and pp.permissao_id = p_permissao)
  loop
    perform public.notificar(r.id, p_titulo, p_mensagem, p_tipo, p_link, true);
  end loop;
end $$;

revoke execute on function public.notificar(uuid, text, text, text, text, boolean) from public, anon, authenticated;
revoke execute on function public.notificar_quem_pode(text, text, text, text, text, uuid) from public, anon, authenticated;
revoke execute on function public.tg_auditar() from public, anon, authenticated;
