-- Diárias, Fundo Rotativo CENSE, Mesa de Despacho e Auditoria
\ir vars.psql

-- =========================== DIÁRIAS ================================
:como_lucia
select teste.ok(public.calcular_diaria('superior', 2, true) =
  '{"valor_dia": 380.00, "valor_total": 760.00, "parcela_hospedagem": 380.00, "parcela_alimentacao": 266.00, "parcela_locomocao": 114.00}'::jsonb,
  'cálculo com pernoite: total e partição 50/35/15');
select teste.ok((public.calcular_diaria('medio', 1, false)->>'valor_total')::numeric = 140, 'sem pernoite paga meia diária');
select teste.falha($$select public.calcular_diaria('superior', 0.3, true)$$, 'múltiplos de 0,5', 'dias fracionados inválidos são recusados');
insert into public.solicitacoes_diaria (nivel, destino, data_ida, data_volta, dias, com_pernoite, motivo, valor_total)
values ('superior', 'Londrina', current_date + 10, current_date + 11, 2, true, 'Inspeção na unidade', 99999);
select teste.ok((select valor_total from public.solicitacoes_diaria) = 760, 'valor enviado pelo navegador é ignorado e recalculado');
select teste.ok((select protocolo from public.solicitacoes_diaria) ~ '^DI-\d{4}-\d{6}$', 'protocolo DI-AAAA-NNNNNN');
select teste.falha($$insert into public.solicitacoes_diaria (nivel, destino, data_ida, data_volta, dias, com_pernoite, motivo)
  values ('superior', 'Foz', current_date + 1, current_date + 1, 3, true, 'Viagem curta')$$,
  'excede o período', 'mais diárias que dias de viagem é bloqueado');
select teste.falha($$select public.avancar_diaria((select id from public.solicitacoes_diaria))$$,
  'não pode movimentar', 'servidor não movimenta etapas financeiras');

:como_chefe
insert into public.solicitacoes_diaria (nivel, destino, data_ida, data_volta, dias, com_pernoite, motivo)
values ('direcao', 'Brasília', current_date + 20, current_date + 21, 2, true, 'Reunião no Ministério');
select teste.falha($$select public.decidir_diaria((select id from public.solicitacoes_diaria where servidor_id = '44444444-4444-4444-4444-444444444444'), true)$$,
  'Segregação de funções', 'chefia não aprova a própria diária');
select teste.ok(exists (select 1 from public.minhas_pendencias() where tipo = 'diaria_aprovacao'), 'diária pendente aparece na Mesa da chefia');
select teste.ok(not exists (select 1 from public.minhas_pendencias() p join public.solicitacoes_diaria d on d.id = p.referencia
                            where d.servidor_id = '44444444-4444-4444-4444-444444444444'), 'a própria diária não aparece na Mesa (segregação)');
select public.decidir_diaria((select id from public.solicitacoes_diaria where servidor_id = '11111111-1111-1111-1111-111111111111'), true);

:como_lucia
select teste.ok((select status from public.solicitacoes_diaria) = 'aprovada', 'diária aprovada');
select teste.falha($$select public.cancelar_diaria((select id from public.solicitacoes_diaria))$$, 'enquanto pendente', 'não cancela diária já aprovada');

:como_admin
select public.avancar_diaria((select id from public.solicitacoes_diaria where servidor_id = '11111111-1111-1111-1111-111111111111'));
select teste.ok((select status from public.solicitacoes_diaria where servidor_id = '11111111-1111-1111-1111-111111111111') = 'empenhada', 'etapa financeira avança para empenhada');

-- =========================== CENSE ==================================
:como_admin
-- O seed libera o CENSE só para o financeiro (NFS); aqui o admin libera também a
-- Chefia de Gabinete, que fiscaliza as notas no teste.
insert into public.modulo_setores (modulo_id, setor_id) select 'cense', id from public.setores where sigla = 'GAB';
update public.cense_unidades set responsavel_id = '66666666-6666-6666-6666-666666666666' where slug = 'cense-curitiba';
update public.cense_unidades set responsavel_id = '77777777-7777-7777-7777-777777777777' where slug = 'cense-maringa';

:como_diretor
select teste.ok(public.cnpj_valido('11.222.333/0001-81') and not public.cnpj_valido('11.222.333/0001-82'), 'validação real de CNPJ');
select teste.ok(public.chave_nfe_valida('41261011222333000181550010000012341123456784')
                and not public.chave_nfe_valida('41261011222333000181550010000012341123456785'), 'validação real do DV da chave NF-e');
insert into public.cense_notas (unidade_id, competencia, numero_nf, chave_acesso, data_emissao, fornecedor, cnpj, rubrica, descricao, valor)
select id, competencia, '1234', '4126 1011 2223 3300 0181 5500 1000 0012 3411 2345 6784', current_date, 'Ferragens Exemplo', '11.222.333/0001-81',
       '33.90.30', 'Material de manutenção', 1500
from public.cense_unidades where slug = 'cense-curitiba';
select teste.ok((select chave_acesso from public.cense_notas) = '41261011222333000181550010000012341123456784', 'chave de acesso é normalizada');
select teste.falha($$insert into public.cense_notas (unidade_id, competencia, numero_nf, chave_acesso, data_emissao, fornecedor, cnpj, rubrica, valor)
  select id, competencia, '1', '41261011222333000181550010000012341123456784', current_date, 'Dup', '11222333000181', '33.90.30', 10
  from public.cense_unidades where slug = 'cense-curitiba'$$, 'duplicate key', 'mesma nota não é lançada duas vezes');
select teste.falha($$insert into public.cense_notas (unidade_id, competencia, numero_nf, chave_acesso, data_emissao, fornecedor, cnpj, rubrica, valor)
  select id, competencia, '2', '41261011222333000181550010000056781876543212', current_date, 'Outro', '06.990.590/0001-23', '33.90.30', 10
  from public.cense_unidades where slug = 'cense-curitiba'$$, 'não corresponde ao emitente', 'CNPJ precisa bater com o emitente da chave');
select teste.falha($$insert into public.cense_notas (unidade_id, competencia, numero_nf, data_emissao, fornecedor, cnpj, rubrica, valor)
  select id, competencia, '3', current_date, 'X', '11222333000181', '33.90.30', 10 from public.cense_unidades where slug = 'cense-maringa'$$,
  'row-level security', 'diretor não lança nota em unidade de outro responsável');
select teste.ok((select utilizado from public.cense_saldos where slug = 'cense-curitiba') = 1500, 'saldo da unidade considera a nota lançada');

:como_admin
insert into public.cense_notas (unidade_id, competencia, numero_nf, data_emissao, fornecedor, cnpj, rubrica, valor)
select id, competencia, '777', current_date, 'Serviços Exemplo', '11222333000181', '33.90.39', 800 from public.cense_unidades where slug = 'cense-maringa';
select teste.falha($$select public.analisar_nota_cense((select id from public.cense_notas where numero_nf = '777'), true)$$,
  'Segregação de funções', 'quem lançou a nota não a analisa');

:como_chefe
select teste.ok((select count(*) from public.minhas_pendencias() where tipo = 'cense_analise') = 2, 'notas pendentes aparecem na Mesa do fiscal');
select public.analisar_nota_cense((select id from public.cense_notas where numero_nf = '1234'), false, 'Sem os três orçamentos');
select teste.ok((select status_fiscal from public.cense_unidades where slug = 'cense-curitiba') = 'alerta_glosa', 'glosa coloca a unidade em alerta');
select teste.ok((select utilizado from public.cense_saldos where slug = 'cense-curitiba') = 0, 'nota glosada não consome a cota');
:como_diretor
select teste.ok((select count(*) from public.notificacoes where titulo like 'Nota glosada%') = 1, 'quem lançou é avisado da glosa');

-- =========================== MESA ===================================
:como_otavio
insert into public.agendamentos (veiculo_id, datas, periodo, modalidade, destino)
select id, array[current_date + 8], 'manha', 'sem_motorista', 'Cascavel' from public.veiculos where placa = 'RHZ9D88';
:como_chefe
select teste.ok(exists (select 1 from public.minhas_pendencias() where tipo = 'frota_aprovacao'), 'solicitação de veículo aparece na Mesa da chefia');
:como_tecnico
select teste.ok(exists (select 1 from public.minhas_pendencias() where tipo = 'chamado'), 'chamado aberto aparece na Mesa do técnico');
:como_lucia
select teste.ok((select count(*) from public.minhas_pendencias()) = 0, 'servidor sem pendências tem Mesa vazia');
select teste.ok((public.contexto_sessao()->>'notificacoes_nao_lidas')::int >= 1, 'contexto da sessão traz contador de notificações');

-- =========================== AUDITORIA ==============================
:como_lucia
select public.registrar_acesso_dado_pessoal('Fila de aprovação de frota', '22222222-2222-2222-2222-222222222222');
select teste.ok((select count(*) from public.auditoria) = 0, 'servidor não lê a auditoria');
select teste.falha($$select public.verificar_auditoria()$$, 'Sem permissão', 'servidor não verifica a auditoria');

:como_chefe
select teste.ok((select ator_nome from public.auditoria where acao = 'DADO_PESSOAL_REVELADO') = 'Lúcia Teste', 'revelação de dado pessoal registrada com o autor real');
select teste.ok((select count(*) from public.auditoria where acao = 'AGENDAMENTO_ALTERADO') >= 3, 'mudanças de status ficam auditadas');
select teste.ok((public.verificar_auditoria()->>'integra')::boolean, 'cadeia de hash íntegra');

:como_sistema
select teste.falha($$update public.auditoria set acao = 'X_X_X' where id = 1$$, 'não pode ser alterada', 'nem o superusuário altera a auditoria com triggers ativos');
select teste.falha($$delete from public.auditoria where id = 1$$, 'não pode ser alterada', 'nem o superusuário apaga registros');
select teste.falha($$truncate public.auditoria$$, 'não pode ser alterada', 'truncate também é bloqueado');

-- Simula adulteração por quem tem acesso direto ao servidor de banco
alter table public.auditoria disable trigger auditoria_sem_update;
update public.auditoria set detalhes = '{"adulterado": true}' where id = 5;
alter table public.auditoria enable trigger auditoria_sem_update;
:como_chefe
select teste.ok(public.verificar_auditoria() @> '{"integra": false, "primeiro_invalido": 5}', 'verificação detecta e localiza a adulteração');
