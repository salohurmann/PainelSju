-- =====================================================================
-- Painel SJU · Troca obrigatória de senha e logins por setor
-- =====================================================================
-- * perfis.trocar_senha: a conta só usa o Painel depois de criar uma senha
--   nova. O próprio banco libera, quando a senha muda de verdade
--   (gatilho em auth.users), então não dá para "pular" pela API.
-- * Contas criadas com app_metadata.trocar_senha = true já nascem assim
--   (logins de setor com senha inicial compartilhada).
-- * Papel novo "fazendario" para o Núcleo Fazendário Setorial (NFS).
-- =====================================================================

alter table public.perfis add column if not exists trocar_senha boolean not null default false;
comment on column public.perfis.trocar_senha is 'Precisa criar senha nova antes de usar o Painel (senha inicial ou provisória).';

-- Conta nova: além de papel/setor, aceita trocar_senha vindo do app_metadata.
create or replace function public.tg_novo_usuario()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_meta  jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_app   jsonb := coalesce(new.raw_app_meta_data, '{}'::jsonb);
  v_conf  jsonb;
  v_setor uuid;
  v_papel text;
begin
  v_conf := case
    when v_app ? 'papel_id' or v_app ? 'setor_sigla' then v_app
    when new.invited_at is not null then v_meta
    else '{}'::jsonb
  end;
  v_papel := coalesce(nullif(v_conf->>'papel_id', ''), 'servidor');
  select id into v_setor from public.setores where sigla = upper(v_conf->>'setor_sigla') and ativo;
  if not exists (select 1 from public.papeis where id = v_papel) then
    v_papel := 'servidor';
  end if;
  insert into public.perfis (id, nome, email, cpf, telefone, cargo, setor_id, papel_id, trocar_senha)
  values (
    new.id,
    coalesce(nullif(trim(v_meta->>'nome'), ''), split_part(new.email, '@', 1)),
    lower(new.email),
    nullif(regexp_replace(coalesce(v_meta->>'cpf', ''), '\D', '', 'g'), ''),
    nullif(v_meta->>'telefone', ''),
    coalesce(v_meta->>'cargo', ''),
    v_setor,
    v_papel,
    coalesce((v_app->>'trocar_senha')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- Senha mudou de verdade → libera a conta.
create or replace function public.tg_senha_trocada()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.encrypted_password is distinct from old.encrypted_password then
    update public.perfis set trocar_senha = false where id = new.id and trocar_senha;
  end if;
  return new;
end $$;
create or replace trigger on_auth_user_senha
  after update of encrypted_password on auth.users
  for each row execute function public.tg_senha_trocada();
revoke execute on function public.tg_senha_trocada() from public, anon, authenticated;

-- A própria pessoa não pode desligar a exigência (só a administração ou o gatilho acima).
create or replace function public.tg_perfis_proteger_campos()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return new;  -- service_role / migrations / gatilho de troca de senha
  end if;
  if public.tem_permissao('usuarios:gerenciar') then
    if new.id = auth.uid() and (new.papel_id <> 'admin' or not new.ativo) and old.papel_id = 'admin' then
      raise exception 'Você não pode remover o próprio acesso de administrador.'
        using errcode = 'P0001';
    end if;
    return new;
  end if;
  if new.papel_id is distinct from old.papel_id
     or new.setor_id is distinct from old.setor_id
     or new.ativo    is distinct from old.ativo
     or new.email    is distinct from old.email
     or new.cpf      is distinct from old.cpf
     or new.cargo    is distinct from old.cargo
     or new.trocar_senha is distinct from old.trocar_senha then
    raise exception 'Somente a administração pode alterar papel, setor, cargo, situação, e-mail ou CPF.'
      using errcode = '42501';
  end if;
  return new;
end $$;

-- Enquanto precisa trocar a senha, a conta não tem permissão nenhuma (nem lê dados).
create or replace function public.meu_perfil_ativo()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select ativo and not trocar_senha from public.perfis where id = auth.uid()), false);
$$;

create or replace function public.meu_papel()
returns text
language sql stable security definer set search_path = public
as $$
  select papel_id from public.perfis where id = auth.uid() and ativo and not trocar_senha;
$$;

create or replace function public.meu_setor()
returns uuid
language sql stable security definer set search_path = public
as $$
  select setor_id from public.perfis where id = auth.uid() and ativo and not trocar_senha;
$$;

-- Contexto da sessão informa a exigência (o front abre a tela de nova senha).
create or replace function public.contexto_sessao()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select case when pf.id is null then null else jsonb_build_object(
    'perfil', jsonb_build_object(
      'id', pf.id, 'nome', pf.nome, 'email', pf.email, 'cargo', pf.cargo,
      'telefone', pf.telefone, 'papel_id', pf.papel_id, 'ativo', pf.ativo,
      'trocar_senha', pf.trocar_senha,
      'setor', case when s.id is null then null
                    else jsonb_build_object('id', s.id, 'sigla', s.sigla, 'nome', s.nome) end
    ),
    'permissoes', coalesce((select jsonb_agg(p) from public.minhas_permissoes() p), '[]'::jsonb),
    'modulos', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'nome', m.nome, 'descricao', m.descricao) order by m.ordem)
                         from public.meus_modulos() m), '[]'::jsonb),
    'notificacoes_nao_lidas', (select count(*) from public.notificacoes n where n.destinatario_id = pf.id and not n.lida)
  ) end
  from (select auth.uid() as uid) x
  left join public.perfis pf on pf.id = x.uid
  left join public.setores s on s.id = pf.setor_id;
$$;

-- Papel do Núcleo Fazendário Setorial
insert into public.papeis (id, nome, descricao, sistema) values
  ('fazendario', 'Núcleo Fazendário', 'Analisa notas do CENSE e movimenta as etapas financeiras das diárias', false)
on conflict (id) do update set nome = excluded.nome, descricao = excluded.descricao;

insert into public.papel_permissoes (papel_id, permissao_id)
select 'fazendario', p from unnest(array[
  'frotas:ver', 'frotas:solicitar', 'chamados:ver', 'chamados:abrir', 'salas:ver', 'salas:reservar',
  'diarias:ver', 'diarias:solicitar', 'diarias:gerenciar', 'cense:ver', 'cense:fiscalizar', 'ramais:ver'
]) as p
where exists (select 1 from public.permissoes where id = p)
on conflict do nothing;
