-- Pessoas de teste e funções de asserção (executado como superusuário)
\ir vars.psql

create schema if not exists teste;
grant usage on schema teste to authenticated, anon;

create or replace function teste.ok(p_cond boolean, p_msg text) returns void language plpgsql as $$
begin
  if p_cond is distinct from true then
    raise exception 'FALHOU: %', p_msg;
  end if;
  raise notice 'ok - %', p_msg;
end $$;

-- Executa p_sql esperando erro cuja mensagem contenha p_padrao.
create or replace function teste.falha(p_sql text, p_padrao text, p_msg text) returns void language plpgsql as $$
declare v_err text;
begin
  begin
    execute p_sql;
  exception when others then
    v_err := sqlerrm;
  end;
  if v_err is null then
    raise exception 'FALHOU: % (nenhum erro foi lançado)', p_msg;
  end if;
  if v_err not ilike '%' || p_padrao || '%' then
    raise exception 'FALHOU: % (erro inesperado: %)', p_msg, v_err;
  end if;
  raise notice 'ok - %', p_msg;
end $$;
grant execute on all functions in schema teste to authenticated, anon;

insert into auth.users (id, email, raw_user_meta_data) values
  (:lucia,   'lucia@teste.gov',   '{"nome":"Lúcia Teste","setor_sigla":"NAS","cpf":"111.444.777-35"}'),
  (:otavio,  'otavio@teste.gov',  '{"nome":"Otávio Teste","setor_sigla":"UTEC"}'),
  (:tecnico, 'tecnico@teste.gov', '{"nome":"Técnico Teste","setor_sigla":"UTEC","papel_id":"tecnico_ti"}'),
  (:chefe,   'chefe@teste.gov',   '{"nome":"Chefe Teste","setor_sigla":"GS","papel_id":"chefe_gabinete"}'),
  (:frota,   'frota@teste.gov',   '{"nome":"Frota Teste","setor_sigla":"NAS","papel_id":"gestor_frota"}'),
  (:diretor, 'diretor@teste.gov', '{"nome":"Diretor Teste","setor_sigla":"NFS","papel_id":"diretor_cense"}'),
  (:admin,   'admin@teste.gov',   '{"nome":"Admin Teste","setor_sigla":"UTEC","papel_id":"admin"}'),
  (:inativo, 'inativo@teste.gov', '{"nome":"Inativo Teste","setor_sigla":"NAS","papel_id":"chefe_gabinete"}');

update public.perfis set ativo = false where id = :inativo;

select teste.ok((select count(*) from public.perfis) = 8, 'trigger cria perfil para cada usuário do Auth');
select teste.ok((select papel_id from public.perfis where id = :chefe) = 'chefe_gabinete', 'papel vem dos metadados');
select teste.ok((select cpf from public.perfis where id = :lucia) = '11144477735', 'CPF é normalizado para dígitos');
select teste.ok((select s.sigla from public.perfis p join public.setores s on s.id = p.setor_id where p.id = :diretor) = 'NFS', 'setor vem da sigla');
