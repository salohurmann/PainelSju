import React, { useState } from 'react';
import { 
  Car, 
  Wrench, 
  Calendar, 
  Plane, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Search,
  Sparkles,
  ChevronRight,
  PlusCircle,
  CheckSquare,
  MapPin,
  Lock,
  Layers,
  Building2,
  Wallet,
  ClipboardCheck
} from 'lucide-react';
import { Usuario, Agendamento, Veiculo } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { soundFX } from '../../services/soundFx';
import { JornadaInterativaModal } from '../experiencia/JornadaInterativaModal';

export type AppModuleId = 'frota' | 'chamados' | 'salas' | 'diarias' | 'ramais';
type EstruturaFiltro = 'todas' | 'mobilidade' | 'infraestrutura' | 'pessoas' | 'governanca';

interface AppLauncherHubProps {
  currentUser: Usuario;
  veiculos: Veiculo[];
  agendamentos: Agendamento[];
  onOpenApp: (appId: AppModuleId, subTab?: string) => void;
  onOpenAuditoria: () => void;
  onOpenCommandPalette?: () => void;
}

export const AppLauncherHub: React.FC<AppLauncherHubProps> = ({
  currentUser,
  veiculos,
  agendamentos,
  onOpenApp,
  onOpenAuditoria,
  onOpenCommandPalette
}) => {
  const [showJornadaModal, setShowJornadaModal] = useState(false);
  const [estruturaAtiva, setEstruturaAtiva] = useState<EstruturaFiltro>('todas');

  const pendentesFrota = agendamentos.filter(a => a.status === 'pendente').length;
  const disponiveisFrota = veiculos.filter(v => v.status === 'disponivel').length;
  const emUsoFrota = veiculos.filter(v => v.status === 'em_missao').length;
  const primeiroNome = currentUser.nome.split(' ')[0];

  const estruturasNav: { id: EstruturaFiltro; num: string; label: string; foco: string; icon: React.ElementType }[] = [
    { id: 'todas', num: '360°', label: 'Todas as Estruturas', foco: 'Visão dividida completa', icon: Layers },
    { id: 'mobilidade', num: '01', label: 'Mobilidade & Frota', foco: 'Veículos, despachos e vistorias', icon: Car },
    { id: 'infraestrutura', num: '02', label: 'Atendimento & Espaços', foco: 'Suporte TI e salas de reunião', icon: Building2 },
    { id: 'pessoas', num: '03', label: 'Diárias & Comunicação', foco: 'Custeio de viagem e ramais', icon: Wallet },
    { id: 'governanca', num: '04', label: 'Governança & Jornada', foco: 'Agenda diária e auditoria SHA-256', icon: ShieldCheck },
  ];

  const exibirMobilidade = estruturaAtiva === 'todas' || estruturaAtiva === 'mobilidade';
  const exibirInfra = estruturaAtiva === 'todas' || estruturaAtiva === 'infraestrutura';
  const exibirPessoas = estruturaAtiva === 'todas' || estruturaAtiva === 'pessoas';
  const exibirGovernanca = estruturaAtiva === 'todas' || estruturaAtiva === 'governanca';

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-12 font-sans">
      
      {/* CABEÇALHO EXECUTIVO CLEAN + NAVEGADOR DE ESTRUTURAS DIVIDIDAS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Arquitetura Dividida por Domínios · SEJU/PR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Bom trabalho, {primeiroNome}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              O portal está organizado em <strong className="text-slate-700 font-semibold">4 estruturas independentes</strong>. Cada bloco foca em uma área operacional específica para agilizar sua rotina.
            </p>
          </div>

          {/* Ações Rápidas + Resumo Executivo */}
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="grid grid-cols-3 divide-x divide-slate-200/80 bg-slate-50 rounded-2xl border border-slate-200/70 px-3 py-2.5 text-center">
              <div className="px-3">
                <div className="text-base sm:text-lg font-bold text-slate-900">{disponiveisFrota}</div>
                <div className="text-[10px] font-medium text-slate-500">Frota Livre</div>
              </div>
              <div className="px-3">
                <div className="text-base sm:text-lg font-bold text-amber-600">{pendentesFrota}</div>
                <div className="text-[10px] font-medium text-slate-500">Despachos</div>
              </div>
              <div className="px-3">
                <div className="text-base sm:text-lg font-bold text-emerald-600">98%</div>
                <div className="text-[10px] font-medium text-slate-500">SLA Geral</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowJornadaModal(true);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs transition cursor-pointer active:scale-95"
              >
                <Sparkles size={14} className="text-blue-400" />
                <span>Simulador 360°</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCommandPalette?.()}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition cursor-pointer active:scale-95"
                title="Busca Global (Ctrl+K)"
              >
                <Search size={14} className="text-slate-500" />
                <span className="hidden sm:inline">Buscar</span>
                <kbd className="hidden md:inline text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>
        </div>

        {/* BARRA SELETORA DAS 4 ESTRUTURAS (FILTRO DE FOCO) */}
        <div className="bg-slate-50/80 border-t border-slate-200/70 px-4 sm:px-7 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {estruturasNav.map((est) => {
              const Icon = est.icon;
              const isAtiva = estruturaAtiva === est.id;
              return (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setEstruturaAtiva(est.id);
                  }}
                  className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left transition-all shrink-0 cursor-pointer border ${
                    isAtiva
                      ? 'bg-white text-slate-900 border-slate-300 shadow-2xs'
                      : 'bg-transparent hover:bg-white/60 text-slate-600 border-transparent'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    isAtiva ? 'bg-slate-900 text-white' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    <Icon size={13} />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-none flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400">{est.num}</span>
                      <span>{est.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                      {est.foco}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          ESTRUTURA 01: MOBILIDADE & LOGÍSTICA DE FROTA OFICIAL
          Foco: Requisição rápida de veículos, aprovação de chefia e vistoria 4 fotos
         ===================================================================== */}
      {exibirMobilidade && (
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Cabeçalho da Estrutura 01 */}
          <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#0072BB]/10 text-[#0072BB] border border-[#0072BB]/20">
                Estrutura 01
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Mobilidade & Frota Oficial
                </h2>
                <p className="text-[11px] text-slate-500">
                  Foco em agilidade de despacho, controle patrimonial de veículos e segurança jurídica na saída e retorno
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px]">
                {disponiveisFrota} disponíveis
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 text-[11px]">
                {emUsoFrota} em missão
              </span>
            </div>
          </div>

          {/* Corpo Dividido da Estrutura 01 */}
          <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Sub-bloco 1A: 4 Ações Focadas de Frota */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onOpenApp('frota', 'nova-solicitacao')}
                className="group p-4 rounded-2xl border border-slate-200/80 hover:border-[#0072BB] bg-white hover:bg-blue-50/20 text-left transition-all flex flex-col justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#0072BB]/10 text-[#0072BB] flex items-center justify-center group-hover:bg-[#0072BB] group-hover:text-white transition-colors">
                    <PlusCircle size={18} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#0072BB] bg-blue-50 px-2 py-0.5 rounded-md">
                    Passo 1
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-[#0072BB]">
                    Solicitar Veículo Oficial
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Agende saída com escolha de carro, horário e justificativa de missão.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenApp('frota', 'aprovacoes')}
                className="group p-4 rounded-2xl border border-slate-200/80 hover:border-amber-500 bg-white hover:bg-amber-50/20 text-left transition-all flex flex-col justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <CheckSquare size={18} />
                  </div>
                  {pendentesFrota > 0 ? (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      {pendentesFrota} pendente(s)
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">Em dia</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-amber-700">
                    Despacho da Chefia
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Aprovação em 1 clique com geração imediata do QR Code de portaria.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenApp('frota', 'checkin-checkout')}
                className="group p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 text-left transition-all flex flex-col justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ClipboardCheck size={18} />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    4 Fotos + Mapa
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                    Vistoria Check-in / Out
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Registro fotográfico dos 4 ângulos, hodômetro e marcação de avarias.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenApp('frota', 'frota')}
                className="group p-4 rounded-2xl border border-slate-200/80 hover:border-slate-400 bg-white hover:bg-slate-50 text-left transition-all flex flex-col justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Car size={18} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {veiculos.length} veículos
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Catálogo & Telemetria
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Consulte quilometragem, combustível, revisões e histórico por CPF.
                  </p>
                </div>
              </button>
            </div>

            {/* Sub-bloco 1B: Painel de Prontidão dos Veículos em Tempo Real */}
            <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl border border-slate-200/70 p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Prontidão no Pátio SEJU
                </span>
                <button
                  type="button"
                  onClick={() => onOpenApp('frota', 'frota')}
                  className="text-[11px] font-semibold text-[#0072BB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver todos</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="space-y-2">
                {veiculos.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    onClick={() => onOpenApp('frota', 'nova-solicitacao')}
                    className="bg-white p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 flex items-center justify-between gap-3 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <PlacaMercosul placa={v.placa} className="scale-75 origin-left -mr-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{v.modelo}</div>
                        <div className="text-[10px] text-slate-400">
                          {v.kmAtual.toLocaleString('pt-BR')} km · {v.nivelCombustivel}% tanque
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      v.status === 'disponivel'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {v.status === 'disponivel' ? 'Livre' : 'Em uso'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          ESTRUTURA 02: ATENDIMENTO TÉCNICO & ESPAÇOS COMPARTILHADOS
          Foco: Resolução de chamados de TI/Predial e agendamento sem conflito de salas
         ===================================================================== */}
      {exibirInfra && (
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                Estrutura 02
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Suporte Técnico & Infraestrutura Predial
                </h2>
                <p className="text-[11px] text-slate-500">
                  Foco em continuidade operacional de TI, manutenção e ocupação inteligente de salas e auditórios
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              2 módulos operacionais
            </span>
          </div>

          <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sub-bloco 2A: Chamados & OS TI */}
            <div
              onClick={() => onOpenApp('chamados')}
              className="group rounded-2xl border border-slate-200/80 hover:border-indigo-400 p-5 bg-white hover:bg-indigo-50/10 transition-all cursor-pointer flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Wrench size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    Quadro Kanban · SLA
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Central de Chamados & Suporte TI
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Abertura e acompanhamento de ordens de serviço de informática, rede, impressoras e infraestrutura predial divididas por etapa de atendimento.
                  </p>
                </div>

                {/* Mini indicadores internos do módulo */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
                    <div className="text-xs font-bold text-slate-900">Triagem</div>
                    <div className="text-[10px] text-slate-500">Fila imediata</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
                    <div className="text-xs font-bold text-indigo-600">Em Curso</div>
                    <div className="text-[10px] text-slate-500">Técnico ativo</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
                    <div className="text-xs font-bold text-emerald-600">38 min</div>
                    <div className="text-[10px] text-slate-500">Tempo médio</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Acessar Quadro de Chamados</span>
                <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Sub-bloco 2B: Reserva Inteligente de Salas */}
            <div
              onClick={() => onOpenApp('salas')}
              className="group rounded-2xl border border-slate-200/80 hover:border-emerald-400 p-5 bg-white hover:bg-emerald-50/10 transition-all cursor-pointer flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Calendar size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    Planta Interativa · Anti-Colisão
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Reserva de Salas & Auditórios
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Visualização espacial dos ambientes da SEJU com bloqueio automático de conflitos de horário e checklist de videoconferência e copa.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
                    <div className="text-xs font-bold text-slate-900">5 Espaços</div>
                    <div className="text-[10px] text-slate-500">Salas & Auditório</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
                    <div className="text-xs font-bold text-emerald-600">08h–18h</div>
                    <div className="text-[10px] text-slate-500">Grade horária</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
                    <div className="text-xs font-bold text-slate-900">4K + Vídeo</div>
                    <div className="text-[10px] text-slate-500">Kit multimídia</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Reservar Sala ou Auditório</span>
                <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          ESTRUTURA 03: FINANCEIRO DE VIAGENS & COMUNICAÇÃO INTERNA
          Foco: Cálculo transparente de diárias no Paraná e diretório de ramais
         ===================================================================== */}
      {exibirPessoas && (
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80">
                Estrutura 03
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Custeio de Missões & Diretório de Pessoas
                </h2>
                <p className="text-[11px] text-slate-500">
                  Foco em conformidade orçamentária de diárias (Decreto 1.428/PR) e conexão direta entre setores
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Mapa Interativo + Catálogo
            </span>
          </div>

          <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sub-bloco 3A: Calculadora de Diárias */}
            <div
              onClick={() => onOpenApp('diarias')}
              className="group rounded-2xl border border-slate-200/80 hover:border-amber-400 p-5 bg-white hover:bg-amber-50/10 transition-all cursor-pointer flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Plane size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Decreto Estadual 1.428/PR
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    Calculadora Oficial de Diárias
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Selecione a regional no mapa interativo do Paraná, simule pernoites, alimentação e gere o demonstrativo financeiro pronto para empenho.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Simular Custo de Viagem</span>
                <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Sub-bloco 3B: Guia de Ramais */}
            <div
              onClick={() => onOpenApp('ramais')}
              className="group rounded-2xl border border-slate-200/80 hover:border-sky-400 p-5 bg-white hover:bg-sky-50/10 transition-all cursor-pointer flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <PhoneCall size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                    Busca Instantânea
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    Guia de Ramais & Unidades SEJU
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Localize rapidamente servidores, chefias, gabinetes e departamentos por andar, com cópia rápida de ramal e e-mail institucional.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700">
                <span>Consultar Diretório de Ramais</span>
                <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          ESTRUTURA 04: GOVERNANÇA CRIPTOGRÁFICA & JORNADA DO SERVIDOR
          Foco: Agenda integrada do dia e trilha de auditoria imutável SHA-256
         ===================================================================== */}
      {exibirGovernanca && (
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                Estrutura 04
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Governança Digital & Agenda do Servidor
                </h2>
                <p className="text-[11px] text-slate-500">
                  Foco em acompanhamento dos compromissos de hoje e rastreabilidade criptográfica SHA-256
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAuditoria}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              <Lock size={13} />
              <span>Abrir Trilha SHA-256</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="p-5 sm:p-7 space-y-5">
            {/* Linha de Compromissos do Dia */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div 
                onClick={() => onOpenApp('salas')}
                className="p-4 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-slate-300 transition cursor-pointer flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-indigo-600 flex items-center gap-1">
                    <Clock size={11} /> 14:00 – 15:30
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Sala Confirmada
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Alinhamento Plano Plurianual</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-slate-400 shrink-0" /> Auditório Principal · 4º Andar
                  </div>
                </div>
              </div>

              <div 
                onClick={() => onOpenApp('frota')}
                className="p-4 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-slate-300 transition cursor-pointer flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <Car size={11} /> Saída às 16:30
                  </span>
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    BCB-4A12
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Missão Oficial: Paranaguá</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Corolla Híbrido · Despacho autorizado
                  </div>
                </div>
              </div>

              <div 
                onClick={() => onOpenApp('chamados')}
                className="p-4 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-slate-300 transition cursor-pointer flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="font-mono text-amber-800">OS #TI-2026-441</span>
                  <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    SLA: 38 min
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Manutenção de Scanner & Rede</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Técnico Marcos atribuído · Em atendimento
                  </div>
                </div>
              </div>
            </div>

            {/* Faixa de Auditoria Imutável */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Lock size={17} />
                </div>
                <div>
                  <div className="font-bold text-xs text-white flex items-center gap-2">
                    <span>Ledger de Auditoria Criptográfica SHA-256</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.2 rounded">
                      ICP-PR
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cada solicitação, despacho e vistoria gera um hash encadeado auditável em tempo real.
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenAuditoria}
                className="text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
              >
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Inspecionar Hashes</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* MODAL DE EXPERIÊNCIA INTERATIVA 360° */}
      <JornadaInterativaModal 
        isOpen={showJornadaModal} 
        onClose={() => setShowJornadaModal(false)}
        onNavigateApp={(appId) => onOpenApp(appId as AppModuleId)}
      />

    </div>
  );
};
