-- Frotas: solicitação, conflito, segregação de funções e vistorias
\ir vars.psql

:como_sistema
create temp table ids (nome text primary key, id uuid);
grant all on ids to authenticated;
insert into ids select 'corolla', id from public.veiculos where placa = 'BCB4A12';
insert into ids select 'toro', id from public.veiculos where placa = 'RHD1H45';

-- Solicitação
:como_lucia
insert into public.agendamentos (veiculo_id, datas, periodo, modalidade, destino, solicitante_id)
values ((select id from ids where nome = 'corolla'), array[current_date + 3], 'dia_todo', 'com_motorista',
        'Paranaguá — inspeção', '22222222-2222-2222-2222-222222222222');
insert into ids select 'ag_lucia', id from public.agendamentos order by criado_em desc limit 1;
select teste.ok((select solicitante_id from public.agendamentos where id = (select id from ids where nome = 'ag_lucia'))
                = '11111111-1111-1111-1111-111111111111', 'solicitante é sempre quem está logado (não dá para se passar por outra pessoa)');
select teste.ok((select protocolo from public.agendamentos where id = (select id from ids where nome = 'ag_lucia')) ~ '^AG-\d{4}-\d{6}$', 'protocolo no formato AG-AAAA-NNNNNN');
select teste.ok((select status from public.agendamentos where id = (select id from ids where nome = 'ag_lucia')) = 'pendente', 'nova solicitação começa pendente');
select teste.falha($$insert into public.agendamentos (veiculo_id, datas, periodo, modalidade, destino)
  values ((select id from public.veiculos where placa = 'BCB4A12'), array[current_date - 1], 'manha', 'sem_motorista', 'Ontem')$$,
  'data passada', 'não aceita data passada');

:como_otavio
select teste.falha($$insert into public.agendamentos (veiculo_id, datas, periodo, modalidade, destino)
  values ((select id from public.veiculos where placa = 'BCB4A12'), array[current_date + 3], 'manha', 'sem_motorista', 'Conflito')$$,
  'já está reservado', 'mesmo veículo, mesma data, período sobreposto: bloqueado');
insert into public.agendamentos (veiculo_id, datas, periodo, modalidade, destino)
values ((select id from public.veiculos where placa = 'BCB4A12'), array[current_date + 4], 'tarde', 'sem_motorista', 'Ponta Grossa');
insert into ids select 'ag_otavio', id from public.agendamentos order by criado_em desc limit 1;
select teste.ok((select count(*) from public.agendamentos) = 1, 'servidor vê só as próprias solicitações');
select teste.ok(not exists (select 1 from public.veiculos_disponiveis(array[current_date + 3], 'manha') v where v.placa = 'BCB4A12'),
  'veiculos_disponiveis esconde veículo ocupado');
select teste.ok(exists (select 1 from public.veiculos_disponiveis(array[current_date + 3], 'manha') v where v.placa = 'RHZ9D88'),
  'veiculos_disponiveis mostra veículo livre');

-- Veículo em manutenção
:como_frota
update public.veiculos set status = 'manutencao' where placa = 'RHD1H45';
:como_lucia
select teste.falha($$insert into public.agendamentos (veiculo_id, datas, periodo, modalidade, destino)
  values ((select id from public.veiculos where placa = 'RHD1H45'), array[current_date + 5], 'manha', 'sem_motorista', 'Manut')$$,
  'indisponível', 'veículo em manutenção não pode ser solicitado');
update public.veiculos set status = 'disponivel' where placa = 'RHD1H45';
:como_sistema
select teste.ok((select status from public.veiculos where placa = 'RHD1H45') = 'manutencao', 'servidor não altera veículos');

-- Decisão
:como_lucia
select teste.falha($$select public.decidir_agendamento((select id from public.agendamentos limit 1), true)$$,
  'não pode decidir', 'servidor não aprova solicitações');

:como_chefe
select teste.ok((select count(*) from public.agendamentos) = 2, 'chefia vê todas as solicitações');
select teste.ok((select count(*) from public.notificacoes where tipo = 'acao_necessaria') = 2, 'chefia é notificada de cada nova solicitação');
insert into public.agendamentos (veiculo_id, datas, periodo, modalidade, destino)
values ((select id from public.veiculos where placa = 'BDF3J21'), array[current_date + 6], 'manha', 'com_motorista', 'Londrina');
select teste.falha($$select public.decidir_agendamento((select id from public.agendamentos where solicitante_id = '44444444-4444-4444-4444-444444444444'), true)$$,
  'Segregação de funções', 'chefia não aprova a própria solicitação');
select teste.falha($$select public.decidir_agendamento((select id from ids where nome = 'ag_otavio'), false, 'não')$$,
  'motivo da reprovação', 'reprovar exige motivo');
select public.decidir_agendamento((select id from ids where nome = 'ag_lucia'), true);
select public.decidir_agendamento((select id from ids where nome = 'ag_otavio'), false, 'Agenda institucional conflitante');
select teste.ok((select status from public.agendamentos where id = (select id from ids where nome = 'ag_lucia')) = 'aprovado', 'aprovação registrada');
select teste.ok((select decidido_por from public.agendamentos where id = (select id from ids where nome = 'ag_lucia')) = '44444444-4444-4444-4444-444444444444', 'quem decidiu fica registrado');
select teste.falha($$select public.decidir_agendamento((select id from ids where nome = 'ag_lucia'), false, 'mudei de ideia')$$,
  'já foi decidida', 'não decide duas vezes');
update public.agendamentos set status = 'realizado' where id = (select id from ids where nome = 'ag_lucia');
select teste.ok((select status from public.agendamentos where id = (select id from ids where nome = 'ag_lucia')) = 'aprovado', 'status não muda por UPDATE direto');

:como_lucia
select teste.ok((select count(*) from public.notificacoes where tipo = 'aprovado') = 1, 'solicitante é notificado da aprovação');
:como_otavio
select teste.ok((select count(*) from public.notificacoes where tipo = 'reprovado' and mensagem like '%Agenda institucional%') = 1, 'solicitante recebe o motivo da reprovação');
:como_sistema
select teste.ok((select count(*) from public.email_outbox where assunto like '%aprovada%') = 1, 'aprovação enfileira e-mail (enviado pelo servidor, sem chave no navegador)');

-- Vistorias
:como_lucia
select teste.falha($$select public.registrar_vistoria((select id from ids where nome = 'ag_lucia'), 'saida', 34300, 80,
  '{"frente":"a","traseira":"b","lateral_direita":"c","lateral_esquerda":"d"}')$$,
  'não pode registrar vistorias', 'servidor não registra vistoria');

:como_frota
select teste.falha($$select public.registrar_vistoria((select id from ids where nome = 'ag_lucia'), 'saida', 34300, 80,
  '{"frente":"a","traseira":"b","lateral_direita":"c"}')$$,
  'vistorias_quatro_fotos', 'vistoria exige as 4 fotos');
select teste.falha($$select public.registrar_vistoria((select id from ids where nome = 'ag_lucia'), 'saida', 1000, 80,
  '{"frente":"a","traseira":"b","lateral_direita":"c","lateral_esquerda":"d"}')$$,
  'menor que a registrada', 'km de saída não pode ser menor que o do veículo');
select teste.falha($$select public.registrar_vistoria((select id from ids where nome = 'ag_lucia'), 'retorno', 34300, 80,
  '{"frente":"a","traseira":"b","lateral_direita":"c","lateral_esquerda":"d"}')$$,
  'exige vistoria de saída', 'retorno sem saída é bloqueado');
select public.registrar_vistoria((select id from ids where nome = 'ag_lucia'), 'saida', 34300, 80,
  '{"frente":"a","traseira":"b","lateral_direita":"c","lateral_esquerda":"d"}');
select teste.ok((select status from public.agendamentos where id = (select id from ids where nome = 'ag_lucia')) = 'em_andamento', 'saída coloca a missão em andamento');
select teste.ok((select status || ':' || km_atual from public.veiculos where placa = 'BCB4A12') = 'em_missao:34300', 'saída atualiza veículo e km');
select teste.falha($$select public.registrar_vistoria((select id from ids where nome = 'ag_lucia'), 'retorno', 34000, 50,
  '{"frente":"a","traseira":"b","lateral_direita":"c","lateral_esquerda":"d"}')$$,
  'menor que a de saída', 'km de retorno não pode ser menor que o de saída');
select public.registrar_vistoria((select id from ids where nome = 'ag_lucia'), 'retorno', 34580, 50,
  '{"frente":"a","traseira":"b","lateral_direita":"c","lateral_esquerda":"d"}', 'Sem avarias');
select teste.ok((select status from public.agendamentos where id = (select id from ids where nome = 'ag_lucia')) = 'realizado', 'retorno conclui a missão');
select teste.ok((select status || ':' || km_atual || ':' || nivel_combustivel from public.veiculos where placa = 'BCB4A12') = 'disponivel:34580:50',
  'retorno libera o veículo com km e combustível atualizados');

:como_lucia
select teste.ok((select count(*) from public.vistorias) = 2, 'solicitante vê as vistorias da própria missão');

-- Cancelamento
:como_lucia
select teste.falha($$select public.cancelar_agendamento((select id from public.agendamentos where solicitante_id = '44444444-4444-4444-4444-444444444444'))$$,
  'não encontrada', 'servidor não cancela solicitação que não enxerga');
:como_chefe
select public.cancelar_agendamento((select id from public.agendamentos where solicitante_id = '44444444-4444-4444-4444-444444444444'), 'Viagem adiada');
select teste.ok((select status from public.agendamentos where solicitante_id = '44444444-4444-4444-4444-444444444444') = 'cancelado', 'solicitante cancela a própria solicitação');
