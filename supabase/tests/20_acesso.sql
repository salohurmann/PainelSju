-- Acesso, perfis, papéis e módulos por setor
\ir vars.psql

-- Visitante sem login
:como_anon
select teste.falha('select * from public.perfis', 'permission denied', 'anon não lê perfis');
select teste.falha('select * from public.veiculos', 'permission denied', 'anon não lê veículos');
select teste.falha('select public.contexto_sessao()', 'permission denied', 'anon não chama funções do domínio');

-- Conta desativada
:como_inativo
select teste.ok(not public.tem_permissao('frotas:aprovar'), 'conta inativa perde todas as permissões');
select teste.ok((select count(*) from public.veiculos) = 0, 'conta inativa não vê veículos');
select teste.ok(public.contexto_sessao()->'modulos' = '[]'::jsonb, 'conta inativa não tem módulos');

-- Servidor comum
:como_lucia
select teste.ok((select count(*) from public.perfis) = 1, 'servidor vê apenas o próprio perfil (CPF protegido)');
select teste.ok((select count(*) from public.diretorio) = 7, 'diretório mostra pessoas ativas sem CPF');
select teste.ok(not exists (select 1 from information_schema.columns where table_name = 'diretorio' and column_name = 'cpf'), 'diretório não expõe CPF');
select teste.falha($$update public.perfis set papel_id = 'admin' where id = '11111111-1111-1111-1111-111111111111'$$,
  'Somente a administração', 'servidor não se promove a admin');
select teste.falha($$update public.perfis set setor_id = null where id = '11111111-1111-1111-1111-111111111111'$$,
  'Somente a administração', 'servidor não troca de setor');
update public.perfis set telefone = '(41) 99999-0000' where id = '11111111-1111-1111-1111-111111111111';
select teste.ok((select telefone from public.perfis) = '(41) 99999-0000', 'servidor altera o próprio telefone');
update public.perfis set nome = 'Hack' where id = '22222222-2222-2222-2222-222222222222';
select teste.ok((select count(*) from public.diretorio where nome = 'Hack') = 0, 'servidor não altera perfil de outra pessoa');
select teste.falha($$insert into public.papel_permissoes values ('servidor', 'frotas:aprovar')$$,
  'row-level security', 'servidor não altera a matriz de permissões');
select teste.falha($$select public.registrar_auditoria('X_Y_Z', 'teste', null, '{}')$$,
  'permission denied', 'cliente não escreve na auditoria diretamente');
select teste.falha($$select public.notificar('22222222-2222-2222-2222-222222222222', 'spam', 'spam')$$,
  'permission denied', 'cliente não dispara notificações arbitrárias');

-- Módulo restrito por setor (CENSE só para o financeiro, NFS, no seed)
select teste.ok(not public.tem_permissao('cense:ver'), 'servidor de outro setor não tem permissão do módulo restrito');
select teste.ok((select count(*) from public.cense_unidades) = 0, 'servidor de outro setor não lê dados do módulo restrito');
select teste.ok(not (public.contexto_sessao()->'modulos' @> '[{"id":"cense"}]'), 'módulo restrito não aparece no menu');
select teste.ok(public.contexto_sessao()->'modulos' @> '[{"id":"frota"}]', 'módulos livres aparecem no menu');
select teste.ok(not (public.contexto_sessao()->'modulos' @> '[{"id":"admin"}]'), 'servidor não vê o módulo admin');

:como_diretor
select teste.ok(public.tem_permissao('cense:ver'), 'setor liberado tem a permissão');
select teste.ok((select count(*) from public.cense_unidades) = 19, 'setor liberado lê as 19 unidades');

-- Administração
:como_admin
select teste.ok((select count(*) from public.perfis) = 8, 'admin vê todos os perfis');
update public.perfis set papel_id = 'tecnico_ti' where id = '22222222-2222-2222-2222-222222222222';
select teste.ok((select papel_id from public.perfis where id = '22222222-2222-2222-2222-222222222222') = 'tecnico_ti', 'admin troca papel de outra pessoa');
update public.perfis set papel_id = 'servidor' where id = '22222222-2222-2222-2222-222222222222';
select teste.falha($$update public.perfis set papel_id = 'servidor' where id = '77777777-7777-7777-7777-777777777777'$$,
  'próprio acesso de administrador', 'admin não remove o próprio acesso por engano');
select teste.falha($$delete from public.papeis where id = 'servidor'$$, 'é de sistema', 'papel de sistema não pode ser apagado');

-- Desligar um módulo bloqueia os dados, não só o menu
update public.modulos set ativo = false where id = 'salas';
:como_lucia
select teste.ok(not public.tem_permissao('salas:reservar'), 'módulo desligado remove a permissão');
select teste.ok((select count(*) from public.salas) = 0, 'módulo desligado bloqueia a leitura dos dados');
:como_admin
update public.modulos set ativo = true where id = 'salas';
:como_lucia
select teste.ok((select count(*) from public.salas) = 4, 'módulo religado volta a funcionar');

-- Alterações de acesso ficam auditadas
:como_sistema
select teste.ok((select count(*) from public.auditoria where acao = 'PERFIL_ALTERADO') >= 2, 'troca de papel gera registro de auditoria');
select teste.ok((select count(*) from public.auditoria where acao = 'MODULO_ALTERADO') = 2, 'ligar/desligar módulo gera auditoria');
select teste.ok(not exists (select 1 from public.auditoria where detalhes::text like '%11144477735%'), 'CPF nunca vai para a auditoria');
