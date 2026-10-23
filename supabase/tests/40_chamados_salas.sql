-- Chamados e Reserva de Salas
\ir vars.psql

-- =========================== CHAMADOS ===============================
:como_lucia
insert into public.chamados (tipo, titulo, descricao, prioridade, status, tecnico_id)
values ('ti', 'Impressora do NAS sem rede', 'Não imprime desde ontem', 'urgente', 'concluido', '33333333-3333-3333-3333-333333333333');
select teste.ok((select status from public.chamados) = 'a_fazer', 'chamado novo sempre começa "a fazer"');
select teste.ok((select tecnico_id from public.chamados) is null, 'solicitante não escolhe o técnico');
select teste.ok((select prazo_sla - aberto_em from public.chamados) = interval '4 hours', 'SLA urgente = 4h, calculado no banco');
select teste.ok((select protocolo from public.chamados) ~ '^CH-\d{4}-\d{6}$', 'protocolo CH-AAAA-NNNNNN');
select teste.falha($$update public.chamados set status = 'em_andamento'$$, 'só pode editar', 'solicitante não muda status');
update public.chamados set titulo = 'Impressora do NAS fora da rede';
select teste.ok((select titulo from public.chamados) = 'Impressora do NAS fora da rede', 'solicitante edita o título enquanto "a fazer"');
insert into public.chamado_notas (chamado_id, texto) select id, 'Já reiniciei a impressora.' from public.chamados;
select teste.falha($$insert into public.chamado_notas (chamado_id, texto, interna) select id, 'interna?', true from public.chamados$$,
  'row-level security', 'solicitante não cria nota interna');

:como_otavio
select teste.ok((select count(*) from public.chamados) = 0, 'outro servidor não vê o chamado');

:como_tecnico
select teste.ok((select count(*) from public.notificacoes where titulo like 'Novo chamado%') = 1, 'equipe técnica é notificada');
update public.chamados set status = 'em_andamento';
select teste.ok((select tecnico_id from public.chamados) = '33333333-3333-3333-3333-333333333333', 'quem assume vira o técnico responsável');
select teste.ok((select iniciado_em from public.chamados) is not null, 'início do atendimento registrado');
insert into public.chamado_notas (chamado_id, texto, interna) select id, 'Cabo de rede rompido no rack 2', true from public.chamados;
update public.chamados set prioridade = 'baixa';
select teste.ok((select prazo_sla - aberto_em from public.chamados) = interval '72 hours', 'mudar prioridade recalcula o SLA');
select teste.falha($$update public.chamados set status = 'concluido'$$, 'Descreva a solução', 'concluir exige solução');
update public.chamados set status = 'concluido', solucao = 'Cabo de rede substituído';
select teste.ok((select concluido_em from public.chamados) is not null, 'conclusão registrada');
select teste.falha($$update public.chamados set status = 'a_fazer'$$, 'Somente a gestão', 'técnico não reabre chamado encerrado');

:como_lucia
select teste.falha($$update public.chamados set titulo = 'x x x'$$, 'já está em atendimento', 'solicitante não edita chamado em atendimento');
select teste.ok((select count(*) from public.chamado_notas) = 1, 'solicitante não vê notas internas');
select teste.ok((select count(*) from public.notificacoes where titulo like 'Chamado%concluído') = 1, 'solicitante é avisado da conclusão');

:como_admin
update public.chamados set status = 'em_andamento';
select teste.ok((select status from public.chamados) = 'em_andamento', 'gestão reabre chamado');

-- =========================== SALAS ==================================
:como_sistema
create temp table t (k text primary key, v timestamptz);
grant all on t to authenticated;
insert into t values
  ('d10', ((current_date + 1) + time '10:00') at time zone 'America/Sao_Paulo'),
  ('d11', ((current_date + 1) + time '11:00') at time zone 'America/Sao_Paulo'),
  ('d12', ((current_date + 1) + time '12:00') at time zone 'America/Sao_Paulo'),
  ('d13', ((current_date + 1) + time '13:00') at time zone 'America/Sao_Paulo'),
  ('d06', ((current_date + 1) + time '06:00') at time zone 'America/Sao_Paulo'),
  ('d08', ((current_date + 1) + time '08:00') at time zone 'America/Sao_Paulo');

:como_lucia
insert into public.reservas (sala_id, motivo, inicio, fim)
select id, 'Reunião do NAS', (select v from t where k = 'd10'), (select v from t where k = 'd12')
from public.salas where codigo = 'SEJU-AUD-01';
select teste.ok((select count(*) from public.reservas) = 1, 'reserva criada');

:como_otavio
select teste.falha($$insert into public.reservas (sala_id, motivo, inicio, fim)
  select id, 'Choque', (select v from t where k = 'd11'), (select v from t where k = 'd13') from public.salas where codigo = 'SEJU-AUD-01'$$,
  'reservas_sem_sobreposicao', 'anti-colisão: horário sobreposto é bloqueado pelo banco');
insert into public.reservas (sala_id, motivo, inicio, fim, recursos_extras)
select id, 'Treinamento', (select v from t where k = 'd12'), (select v from t where k = 'd13'), array['suporte_ti']
from public.salas where codigo = 'SEJU-AUD-01';
select teste.ok((select count(*) from public.reservas) = 2, 'horário encostado (12h–13h) é permitido');
select teste.falha($$insert into public.reservas (sala_id, motivo, inicio, fim)
  select id, 'Cedo', (select v from t where k = 'd06'), (select v from t where k = 'd08') from public.salas where codigo = 'SEJU-LAB-01'$$,
  'entre 07h e 22h', 'fora do horário de funcionamento é bloqueado');
select teste.falha($$insert into public.reservas (sala_id, motivo, inicio, fim, participantes)
  select id, 'Lotado', (select v from t where k = 'd10'), (select v from t where k = 'd11'), 50 from public.salas where codigo = 'SEJU-MED-02'$$,
  'comporta até', 'capacidade da sala é respeitada');
select teste.falha($$select public.cancelar_reserva((select id from public.reservas where motivo = 'Reunião do NAS'))$$,
  'Só o responsável', 'não cancela reserva de outra pessoa');

:como_tecnico
select teste.ok((select count(*) from public.notificacoes where titulo like 'Apoio técnico%') = 1, 'pedido de suporte técnico na reserva avisa a TI');

:como_chefe
select public.cancelar_reserva((select id from public.reservas where motivo = 'Reunião do NAS'), 'Evento do Secretário');
:como_lucia
select teste.ok((select count(*) from public.notificacoes where titulo like 'Reserva cancelada%') = 1, 'responsável é avisado quando a chefia cancela');
:como_otavio
insert into public.reservas (sala_id, motivo, inicio, fim)
select id, 'Reaproveitando horário', (select v from t where k = 'd10'), (select v from t where k = 'd11')
from public.salas where codigo = 'SEJU-AUD-01';
select teste.ok((select count(*) from public.reservas where status = 'ativa') = 2, 'horário de reserva cancelada fica livre');
