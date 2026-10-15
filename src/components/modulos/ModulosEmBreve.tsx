import React from 'react';
import { Calendar, Wrench, Plane, PhoneCall, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';

interface ModuloPreviewProps {
  tipo: 'salas' | 'chamados' | 'diarias' | 'ramais';
}

export const ModulosEmBreve: React.FC<ModuloPreviewProps> = ({ tipo }) => {
  if (tipo === 'salas') {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <div className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
                Módulo 2 · Arquitetura Modular
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                Reserva Inteligente de Salas & Equipamentos
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Fim do conflito de agendamento do auditório e salas de reunião do gabinete. Bloqueio automático por horário.
              </p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-full border border-indigo-200">
              Pronto para Conectar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { nome: 'Auditório Principal SEJU', cap: '120 pessoas', equip: 'Projetor 4K, 4 mics sem fio, ar', status: 'Livre às 14h' },
              { nome: 'Sala de Reuniões do Gabinete', cap: '18 pessoas', equip: 'Kit Videoconferência Teams, TV 75"', status: 'Ocupada até 11h30' },
              { nome: 'Sala Técnica de Conciliação', cap: '8 pessoas', equip: 'Quadro branco, notebook apoio', status: 'Disponível' }
            ].map((s, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-xs">{s.nome}</h4>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {s.cap}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">{s.equip}</p>
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold text-[11px]">● {s.status}</span>
                  <button className="text-[11px] font-bold text-indigo-600 hover:underline">
                    Reservar Horário →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tipo === 'chamados') {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <div className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
                Módulo 3 · Suporte & Manutenção
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                Chamados Rápidos & Ordem de Serviço (Kanban)
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Abertura de chamados para TI, manutenção predial e almoxarifado com quadro de status e SLA.
              </p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-700 font-bold px-3 py-1.5 rounded-full border border-amber-200">
              Pronto para Conectar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-gray-700 border-b border-gray-200 pb-2">
                <span>A Fazer (Novos)</span>
                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">2</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs shadow-2xs space-y-1">
                <span className="text-[10px] font-mono text-gray-400">TI-2026-441</span>
                <div className="font-bold text-gray-800">Troca de toner da impressora do Gabinete</div>
                <div className="text-[11px] text-gray-500">Solicitante: Ana Clara · Gabinete</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs shadow-2xs space-y-1">
                <span className="text-[10px] font-mono text-gray-400">MANUT-2026-102</span>
                <div className="font-bold text-gray-800">Reparo de ar-condicionado na sala 204</div>
                <div className="text-[11px] text-gray-500">Solicitante: Fernando · Recursos Humanos</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-gray-700 border-b border-gray-200 pb-2">
                <span>Em Andamento</span>
                <span className="bg-blue-100 text-[#0072BB] px-1.5 py-0.5 rounded font-mono">1</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs shadow-2xs space-y-1">
                <span className="text-[10px] font-mono text-gray-400">TI-2026-439</span>
                <div className="font-bold text-gray-800">Configuração de token certificado digital A3</div>
                <div className="text-[11px] text-gray-500">Técnico responsável: Lucas (TI)</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-xs text-gray-700 border-b border-gray-200 pb-2">
                <span>Concluídos Hoje</span>
                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">3</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs opacity-75 space-y-1">
                <span className="text-[10px] font-mono text-gray-400">TI-2026-435</span>
                <div className="font-bold text-gray-800 line-through">Liberação de acesso VPN institucional</div>
                <div className="text-[11px] text-emerald-700 font-semibold">✓ Resolvido em 25min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tipo === 'diarias') {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <div className="text-xs font-mono font-bold text-sky-600 uppercase tracking-wider">
                Módulo 4 · Finanças & Prestação de Contas
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                Controle de Viagens, Diárias & Adiantamentos
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Cálculo automático de diárias pela tabela oficial do Paraná, prestação de contas e geração de PDF assinado.
              </p>
            </div>
            <span className="text-xs bg-sky-50 text-sky-700 font-bold px-3 py-1.5 rounded-full border border-sky-200">
              Pronto para Conectar
            </span>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <h4 className="text-xs font-bold uppercase text-gray-500">Calculadora de Diárias Estimadas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500">Destino da Missão</div>
                <div className="text-sm font-bold text-gray-800 mt-1">Maringá / Londrina</div>
                <div className="text-[11px] text-gray-400">Deslocamento &gt; 300km</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500">Duração Prevista</div>
                <div className="text-sm font-bold text-gray-800 mt-1">2,5 Diárias (com pernoite)</div>
                <div className="text-[11px] text-gray-400">Tabela Nível Superior</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500">Valor Estimado Total</div>
                <div className="text-sm font-bold text-emerald-600 mt-1">R$ 1.150,00</div>
                <div className="text-[11px] text-gray-400">Pronto para empenho</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ramais
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <div className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider">
              Módulo 5 · Comunicação Institucional
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-1">
              Guia Telefônico & Ramais Internos SEJU
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Lista telefônica e contatos de todas as coordenações e departamentos em tempo real.
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-full border border-emerald-200">
            Pronto para Conectar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { setor: 'Gabinete do Secretário', resp: 'Dra. Maria Helena (Chefe de Gabinete)', ramal: '3310-8201 / 8202', email: 'gabinete@seju.pr.gov.br' },
            { setor: 'Setor de Transporte & Frota', resp: 'Marcos Viana (Gestor de Frotas)', ramal: '3310-8245', email: 'transporte.seju@pr.gov.br' },
            { setor: 'Coordenação de Direitos Humanos', resp: 'Carlos Silveira', ramal: '3310-8230', email: 'direitoshumanos@seju.pr.gov.br' },
            { setor: 'Departamento de TI & Suporte', resp: 'Central de Chamados', ramal: '3310-8299', email: 'suporte.ti@seju.pr.gov.br' },
            { setor: 'Recursos Humanos / Gestão de Pessoas', resp: 'Atendimento Funcional', ramal: '3310-8215', email: 'rh@seju.pr.gov.br' },
            { setor: 'Protocolo Geral & Ouvidoria', resp: 'Recepção Central', ramal: '3310-8200', email: 'ouvidoria@seju.pr.gov.br' }
          ].map((r, i) => (
            <div key={i} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900">{r.setor}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{r.resp} · {r.email}</div>
              </div>
              <div className="font-mono font-bold text-[#0072BB] bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-right">
                {r.ramal}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
