import React, { useState } from 'react';
import { 
  Car, 
  Wrench, 
  Calendar, 
  Plane, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Search,
  Sparkles,
  ChevronRight,
  PlusCircle,
  FileText,
  Lock,
  Compass,
  AlertCircle,
  CheckSquare,
  Users,
  ExternalLink,
  MapPin,
  Flame,
  Check
} from 'lucide-react';
import { Usuario, Agendamento, Veiculo } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { BrasaoParana } from '../common/BrasaoParana';

export type AppModuleId = 'frota' | 'chamados' | 'salas' | 'diarias' | 'ramais';

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
  const [busca, setBusca] = useState('');

  const pendentesFrota = agendamentos.filter(a => a.status === 'pendente').length;
  const emMissaoFrota = veiculos.filter(v => v.status === 'em_missao').length;
  const disponiveisFrota = veiculos.filter(v => v.status === 'disponivel').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* 1. HERO INSTITUCIONAL DO GOVERNO DO ESTADO DO PARANÁ */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#00385E] via-[#00538A] to-[#0072BB] text-white shadow-xl border border-blue-900/60 p-6 sm:p-8 lg:p-10">
        
        {/* Marca d'água sutil com Brasão do Estado */}
        <div className="absolute right-6 -bottom-10 opacity-10 pointer-events-none select-none">
          <BrasaoParana size="xl" className="w-80 h-96 brightness-200" />
        </div>

        {/* Círculo luminoso de fundo */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Topo do Banner: Brasão, Tag Oficial e Identificação */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/15 text-white px-3 py-1 rounded-full border border-white/20 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Governo do Paraná · SEJU
                </span>
                <span className="text-xs text-blue-200">|</span>
                <span className="text-xs text-blue-100 font-medium">
                  Portal Corporativo Unificado
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Olá, {currentUser.nome.split(' ')[0]} 👋
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed font-normal">
                Bem-vindo ao ambiente oficial de gestão e apoio operacional da Secretaria da Justiça e Cidadania. Selecione uma ferramenta abaixo ou acompanhe suas solicitações em tempo real.
              </p>
            </div>

            {/* Cartão de Credencial do Servidor Conectado */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-3.5 self-start md:self-auto shrink-0 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-white text-[#0072BB] flex items-center justify-center font-black text-lg shadow-md">
                {currentUser.nome.charAt(0)}
              </div>
              <div>
                <div className="font-extrabold text-xs text-white flex items-center gap-1.5">
                  <span>{currentUser.nome}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                </div>
                <div className="text-[11px] font-semibold text-blue-200 mt-0.5">{currentUser.cargo}</div>
                <div className="text-[10px] text-blue-300/90 font-mono mt-0.5">{currentUser.setor.slice(0, 32)}</div>
              </div>
            </div>
          </div>

          {/* 3 Métricas Rápidas Oficiais do Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15">
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider flex items-center justify-between">
                <span>Frota Oficial SEJU</span>
                <Car size={16} className="text-blue-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {disponiveisFrota} <span className="text-xs font-semibold text-emerald-300">disponíveis</span>
              </div>
              <div className="text-[11px] text-blue-200/80 mt-1">
                {emMissaoFrota} em missão oficial · {veiculos.length} veículos totais
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15">
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider flex items-center justify-between">
                <span>Fila de Aprovação (Chefia)</span>
                <CheckSquare size={16} className="text-amber-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {pendentesFrota} <span className="text-xs font-semibold text-amber-300">aguardando</span>
              </div>
              <div className="text-[11px] text-blue-200/80 mt-1">
                Deliberação em 1 clique com assinatura digital
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15">
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider flex items-center justify-between">
                <span>Conformidade & SLA</span>
                <ShieldCheck size={16} className="text-emerald-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                98.5% <span className="text-xs font-semibold text-emerald-300">no prazo</span>
              </div>
              <div className="text-[11px] text-blue-200/80 mt-1">
                Rastreabilidade e auditoria criptográfica SHA-256
              </div>
            </div>
          </div>

          {/* Barra de Busca Integrada (Spotlight Command Palette) */}
          <div 
            onClick={() => onOpenCommandPalette ? onOpenCommandPalette() : undefined}
            className="relative group cursor-pointer"
          >
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400 group-hover:text-[#0072BB] transition-colors" />
            <div className="w-full text-xs sm:text-sm pl-11 pr-4 py-3.5 bg-white text-slate-500 font-medium rounded-2xl shadow-lg border border-transparent group-hover:border-blue-400 transition flex items-center justify-between">
              <span>O que você precisa fazer hoje? (ex: pedir carro, aprovar viagem, chamado de TI, reservar auditório, ramal...)</span>
              <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 group-hover:text-[#0072BB] group-hover:border-blue-300 transition">
                <kbd>Ctrl</kbd> + <kbd>K</kbd>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. ETAPAS OFICIAIS DO FLUXO (Resgate do Projeto Original SEJU) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-gov-card">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0072BB]">
              Fluxo Operacional Padrão
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              Como Funciona a Solicitação e Gestão Integrada
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:inline">
            Normativa SEJU/PR
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 hover:bg-blue-50/50 hover:border-blue-200 transition">
            <div className="w-8 h-8 rounded-full bg-[#0072BB] text-white font-black text-xs flex items-center justify-center shadow-xs">
              1
            </div>
            <strong className="block text-sm font-bold text-[#0072BB]">
              Solicitação Guiada
            </strong>
            <p className="text-xs text-slate-600 leading-relaxed">
              O servidor informa motivo oficial, itinerário, passageiros e datas com checagem automática anti-colisão.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 hover:bg-amber-50/50 hover:border-amber-200 transition">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              2
            </div>
            <strong className="block text-sm font-bold text-amber-800">
              Validação da Chefia
            </strong>
            <p className="text-xs text-slate-600 leading-relaxed">
              Notificação automática via e-mail corporativo (Brevo). Aprovação ou reprovação em 1 clique pelo celular.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 hover:bg-emerald-50/50 hover:border-emerald-200 transition">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
              3
            </div>
            <strong className="block text-sm font-bold text-emerald-800">
              Vistoria Pericial 4 Fotos
            </strong>
            <p className="text-xs text-slate-600 leading-relaxed">
              Check-in e check-out com registro de km, nível de combustível e 4 fotos para evitar divergências de avarias.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 hover:bg-indigo-50/50 hover:border-indigo-200 transition">
            <div className="w-8 h-8 rounded-full bg-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
              4
            </div>
            <strong className="block text-sm font-bold text-indigo-800">
              Auditoria Criptográfica
            </strong>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada etapa gera um hash SHA-256 vinculando CPF, data/hora e IP para controle orçamentário e ministerial.
            </p>
          </div>
        </div>
      </div>

      {/* 3. SUÍTE DOS 5 SISTEMAS CORPORATIVOS — DESIGN ELABORADO DE ALTO PADRÃO */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0072BB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Sistemas Oficiais
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-semibold">Paraná Governo Digital</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              Módulos Integrados da Secretaria
            </h2>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hidden sm:inline">
            5 Ferramentas Homologadas
          </span>
        </div>

        {/* GRID DOS APLICATIVOS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* CARD 1: CARRO-CHEFE — GESTÃO DE FROTA E VEÍCULOS (DESTAQUE NOBRE) */}
          <div 
            onClick={() => onOpenApp('frota')}
            className="lg:col-span-12 group bg-white rounded-3xl border-2 border-slate-200/90 shadow-gov-card hover:shadow-gov-card-hover hover:border-[#0072BB] transition-all duration-300 cursor-pointer overflow-hidden relative"
          >
            {/* Faixa Superior Institucional Azul Paraná */}
            <div className="h-2 bg-linear-to-r from-[#0072BB] via-[#00538A] to-[#00385E]" />

            <div className="p-7 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Lado Esquerdo: Apresentação do Módulo */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#0072BB] to-[#00385E] text-white flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
                      <Car size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#0072BB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          Módulo Piloto Oficial
                        </span>
                        {pendentesFrota > 0 && (
                          <span className="text-[10px] font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                            {pendentesFrota} na fila da chefia
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#0072BB] transition-colors mt-1">
                        Gestão de Frota & Solicitação de Veículos
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Fluxo oficial completo: requisição com validação de datas, aprovação ágil da chefia com assinatura digital <strong>SHA-256</strong>, vistoria de saída/devolução com <strong>4 fotos do veículo</strong> para evitar discussões sobre danos e hodômetro digital.
                  </p>

                  {/* Botões Rápidos e Diretos */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenApp('frota', 'nova-solicitacao');
                      }}
                      className="bg-[#0072BB] hover:bg-[#00538A] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <PlusCircle size={15} /> Solicitar Veículo Oficial
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenApp('frota', 'aprovacoes');
                      }}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <CheckSquare size={15} className="text-amber-700" /> Aprovação Chefia ({pendentesFrota})
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenApp('frota', 'checkin-checkout');
                      }}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck size={15} className="text-emerald-700" /> Vistoria (4 Fotos)
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenApp('frota', 'frota');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      Todos os Carros →
                    </button>
                  </div>
                </div>

                {/* Lado Direito: Amostra da Frota com Placas Mercosul Reais */}
                <div className="lg:col-span-5 bg-slate-50/90 rounded-2xl p-5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
                    <span className="flex items-center gap-1.5 font-black text-[#0072BB]">
                      <Car size={15} /> Veículos Disponíveis no Pátio
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      ● {disponiveisFrota} Livres
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {veiculos.slice(0, 2).map((v) => (
                      <div key={v.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                        <div>
                          <div className="font-extrabold text-xs text-slate-900">{v.modelo}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{v.capacidade} lugares · {v.kmAtual.toLocaleString('pt-BR')} km</div>
                        </div>
                        <PlacaMercosul placa={v.placa} className="scale-90 origin-right" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Notificações Brevo Ativas
                    </span>
                    <span className="font-mono font-bold text-[#0072BB]">SHA-256 Validado</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* CARD 2: CHAMADOS RÁPIDOS E OS TI */}
          <div
            onClick={() => onOpenApp('chamados')}
            className="lg:col-span-6 group bg-white rounded-3xl border-2 border-slate-200/90 shadow-gov-card hover:shadow-gov-card-hover hover:border-indigo-500 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="h-2 bg-indigo-600" />
            
            <div className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Wrench size={26} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                  Kanban em Tempo Real
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Suporte & Manutenção Predial
                </span>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-700 transition-colors mt-0.5">
                  Chamados Rápidos & Ordem de Serviço
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Troca de toner, reparos de rede, VPN, ar-condicionado e remanejamento de mesas. Quadro Kanban com anéis de contagem regressiva de SLA e métricas de tempo de resposta.
                </p>
              </div>

              {/* Indicadores */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">SLA Médio</div>
                  <div className="font-black text-slate-900 font-mono">28 min</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Na Fila</div>
                  <div className="font-black text-indigo-700 font-mono">2 abertos</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Resolução</div>
                  <div className="font-black text-emerald-700 font-mono">98.5%</div>
                </div>
              </div>
            </div>

            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700 group-hover:text-indigo-800">
              <span>Abrir Quadro de Chamados TI</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {/* CARD 3: RESERVA INTELIGENTE DE SALAS */}
          <div
            onClick={() => onOpenApp('salas')}
            className="lg:col-span-6 group bg-white rounded-3xl border-2 border-slate-200/90 shadow-gov-card hover:shadow-gov-card-hover hover:border-emerald-600 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="h-2 bg-[#009B54]" />
            
            <div className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Calendar size={26} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Anti-Colisão 24h
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Espaços, Auditório & Recursos
                </span>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-800 transition-colors mt-0.5">
                  Reserva Inteligente de Salas
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Fim dos conflitos de agenda. Agendamento do Auditório Principal (120 lugares), salas de reunião do Gabinete, projetores e kits de videoconferência com bloqueio automático contra sobreposição.
                </p>
              </div>

              {/* Indicadores */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Auditório</div>
                  <div className="font-black text-slate-900 font-mono">120 lugares</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Reuniões</div>
                  <div className="font-black text-emerald-800 font-mono">4 salas</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Choque</div>
                  <div className="font-black text-emerald-600 font-mono">Zero conflitos</div>
                </div>
              </div>
            </div>

            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:text-emerald-900">
              <span>Acessar Régua Cronológica de Salas</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {/* CARD 4: CONTROLE DE DIÁRIAS E VIAGENS */}
          <div
            onClick={() => onOpenApp('diarias')}
            className="lg:col-span-6 group bg-white rounded-3xl border-2 border-slate-200/90 shadow-gov-card hover:shadow-gov-card-hover hover:border-amber-500 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="h-2 bg-amber-600" />
            
            <div className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Plane size={26} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                  Decreto Oficial PR
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Gestão Financeira & Adiantamentos
                </span>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-800 transition-colors mt-0.5">
                  Controle de Viagens & Diárias
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Calculadora guiada para servidores em missão oficial no interior do estado: rotas conectando Curitiba aos polos regionais, cálculo exato conforme a tabela do estado e comprovante oficial fazendário pronto para assinatura.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Cálculo</div>
                  <div className="font-black text-slate-900 font-mono">Automático</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Interior PR</div>
                  <div className="font-black text-amber-800 font-mono">R$ 380/dia</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Documento</div>
                  <div className="font-black text-slate-900 font-mono">Guia Sefaz</div>
                </div>
              </div>
            </div>

            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800 group-hover:text-amber-900">
              <span>Calcular Diária e Emitir Guia Oficial</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {/* CARD 5: GUIA DE RAMAIS E CONTATOS SEJU */}
          <div
            onClick={() => onOpenApp('ramais')}
            className="lg:col-span-6 group bg-white rounded-3xl border-2 border-slate-200/90 shadow-gov-card hover:shadow-gov-card-hover hover:border-sky-500 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div className="h-2 bg-sky-600" />
            
            <div className="p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <PhoneCall size={26} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                  Catálogo Atualizado
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Comunicação Institucional
                </span>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-sky-800 transition-colors mt-0.5">
                  Mural de Ramais e Contatos SEJU
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Diretório telefônico e institucional com status de presença em tempo real (No Posto / Em Reunião / Em Missão) e árvore visual de organograma de departamentos e coordenações.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Gabinete</div>
                  <div className="font-black text-slate-900 font-mono">8201 / 8202</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Transporte</div>
                  <div className="font-black text-sky-700 font-mono">Ramal 8245</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Suporte TI</div>
                  <div className="font-black text-slate-900 font-mono">Ramal 8299</div>
                </div>
              </div>
            </div>

            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700 group-hover:text-sky-800">
              <span>Consultar Ramais e Organograma</span>
              <ChevronRight size={16} />
            </div>
          </div>

        </div>
      </div>

      {/* 4. BANNER DE SEGURANÇA E AUDITORIA CRIPTOGRÁFICA DO ESTADO */}
      <div className="p-6 sm:p-7 bg-linear-to-r from-slate-900 via-[#00385E] to-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Lock size={24} />
          </div>
          <div>
            <div className="font-black text-sm text-white flex items-center gap-2">
              <span>Infraestrutura com Rastreabilidade Criptográfica SHA-256</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                ICP-PR
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Cada aprovação de viagem, ordem de serviço ou vistoria de veículo gera uma assinatura imutável atrelada ao CPF do servidor e IP da rede governamental.
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAuditoria}
          className="text-xs font-bold text-emerald-300 hover:text-emerald-200 bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl border border-white/15 transition flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
        >
          <ShieldCheck size={16} /> Inspecionar Trilha de Auditoria
        </button>
      </div>

    </div>
  );
};
