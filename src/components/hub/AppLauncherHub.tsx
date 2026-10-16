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
  Lock
} from 'lucide-react';
import { Usuario, Agendamento, Veiculo } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { BrasaoParana } from '../common/BrasaoParana';
import { soundFX } from '../../services/soundFx';
import { JornadaInterativaModal } from '../experiencia/JornadaInterativaModal';

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
  const [showJornadaModal, setShowJornadaModal] = useState(false);

  const pendentesFrota = agendamentos.filter(a => a.status === 'pendente').length;
  const disponiveisFrota = veiculos.filter(v => v.status === 'disponivel').length;
  const primeiroNome = currentUser.nome.split(' ')[0];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-12 font-sans">
      
      {/* 1. HERO EXECUTIVO — CLEAN, SOFISTICADO E DIRETO */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0A2239] via-[#00385E] to-[#005A96] text-white shadow-lg border border-white/10 p-5 sm:p-8">
        
        {/* Marca d'água sutil apenas no desktop */}
        <div className="hidden sm:block absolute right-8 -bottom-8 opacity-[0.06] pointer-events-none select-none">
          <BrasaoParana size="xl" className="w-64 h-72 brightness-200" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Saudação e Ações Principais */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>SEJU · Ambiente Corporativo</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Olá, {primeiroNome}
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/85 leading-relaxed">
              Acesse os sistemas integrados da Secretaria da Justiça e Cidadania ou acompanhe sua agenda operacional de hoje.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowJornadaModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#00385E] hover:bg-blue-50 font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Sparkles size={14} className="text-[#0072BB]" />
                <span>Simulador de Missão 360°</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCommandPalette?.()}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold text-xs transition-all cursor-pointer active:scale-95"
              >
                <Search size={14} className="text-blue-200" />
                <span>Busca Rápida</span>
                <kbd className="hidden sm:inline text-[10px] font-mono text-blue-200 bg-white/10 px-1.5 py-0.2 rounded">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>

          {/* Indicadores Rápidos Compactos (3 Colunas Mesmo no Celular) */}
          <div className="grid grid-cols-3 divide-x divide-white/10 bg-white/8 backdrop-blur-md rounded-2xl border border-white/15 p-3 sm:p-4 lg:w-88 shrink-0 text-center">
            <div className="px-2">
              <div className="text-lg sm:text-2xl font-black text-white">{disponiveisFrota}</div>
              <div className="text-[10px] font-medium text-blue-200 mt-0.5">Frota Livre</div>
            </div>
            <div className="px-2">
              <div className="text-lg sm:text-2xl font-black text-amber-300">{pendentesFrota}</div>
              <div className="text-[10px] font-medium text-blue-200 mt-0.5">Aprovações</div>
            </div>
            <div className="px-2">
              <div className="text-lg sm:text-2xl font-black text-emerald-300">98%</div>
              <div className="text-[10px] font-medium text-blue-200 mt-0.5">SLA Ativo</div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. MÓDULOS DO PORTAL — BENTO GRID LIMPO E ELEGANTE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Sistemas Integrados
            </h2>
            <p className="text-xs text-slate-500">
              Selecione um módulo para iniciar
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
            5 módulos ativos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* MÓDULO 1: GESTÃO DE FROTAS (FULL WIDTH NO DESKTOP) */}
          <div 
            onClick={() => onOpenApp('frota')}
            className="md:col-span-2 group bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#0072BB]/50 transition-all cursor-pointer"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#0072BB]/10 text-[#0072BB] flex items-center justify-center shrink-0 group-hover:bg-[#0072BB] group-hover:text-white transition-colors">
                    <Car size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#0072BB] transition-colors">
                        Gestão de Frotas & Veículos
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {disponiveisFrota} livres
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Agendamento de viagens, despacho da chefia em 1 clique e vistoria pericial com 4 fotos.
                    </p>
                  </div>
                </div>

                {/* Atalhos Diretos da Frota */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenApp('frota', 'nova-solicitacao');
                    }}
                    className="bg-[#0072BB] hover:bg-[#00538A] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <PlusCircle size={14} /> Solicitar Veículo
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenApp('frota', 'aprovacoes');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <CheckSquare size={14} className="text-amber-600" /> Aprovações ({pendentesFrota})
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenApp('frota', 'checkin-checkout');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ShieldCheck size={14} className="text-emerald-600" /> Vistoria 4 Fotos
                  </button>
                </div>
              </div>

              {/* Mini Preview de Veículos (Oculto em celulares pequenos para manter visual limpo) */}
              <div className="hidden sm:flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/70 shrink-0">
                {veiculos.slice(0, 2).map((v) => (
                  <div key={v.id} className="bg-white p-2.5 rounded-lg border border-slate-200/80 min-w-36">
                    <PlacaMercosul placa={v.placa} className="scale-75 origin-left -mb-1" />
                    <div className="text-xs font-bold text-slate-800 truncate mt-1">{v.modelo.split(' ')[0]} {v.modelo.split(' ')[1]}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">● Disponível</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MÓDULO 2: CHAMADOS TI */}
          <div 
            onClick={() => onOpenApp('chamados')}
            className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Wrench size={20} />
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Kanban & SLA
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Chamados & Suporte TI
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Abertura rápida de ordens de serviço de TI, manutenção predial e acompanhamento de fila técnica.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Abrir Central de Chamados</span>
              <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* MÓDULO 3: RESERVA DE SALAS */}
          <div 
            onClick={() => onOpenApp('salas')}
            className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Calendar size={20} />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Anti-Colisão
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Reserva de Salas & Auditório
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Régua visual de 10h para agendamento de reuniões, videoconferências e recursos de apoio.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Consultar Disponibilidade</span>
              <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* MÓDULO 4: CALCULADORA DE DIÁRIAS */}
          <div 
            onClick={() => onOpenApp('diarias')}
            className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Plane size={20} />
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Decreto 1.428/PR
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Calculadora de Diárias
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Simulação de custos de deslocamento no mapa do Paraná e emissão da nota oficial de empenho.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Calcular Diárias de Viagem</span>
              <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* MÓDULO 5: GUIA DE RAMAIS */}
          <div 
            onClick={() => onOpenApp('ramais')}
            className="group bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-sky-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <PhoneCall size={20} />
                </div>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                  Organograma
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                  Guia de Ramais & Setores
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Catálogo telefônico rápido por servidor, andar ou coordenação com indicador de presença.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700">
              <span>Buscar Contatos e Ramais</span>
              <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* 3. WIDGET "MINHA JORNADA HOJE" — FORMATO EXECUTIVO COMPACTO */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              Minha Jornada Hoje
            </h3>
            <span className="text-xs text-slate-400 hidden sm:inline">
              • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setShowJornadaModal(true);
            }}
            className="text-xs font-bold text-[#0072BB] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Tour 360°</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Item 1: Reunião */}
          <div 
            onClick={() => onOpenApp('salas')}
            className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-indigo-50/40 border border-slate-200/70 hover:border-indigo-200 transition cursor-pointer flex flex-col justify-between gap-2"
          >
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-indigo-600 flex items-center gap-1">
                <Clock size={11} /> 14:00 - 15:30
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                Confirmada
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 truncate">Alinhamento Plano Plurianual</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                <MapPin size={11} className="text-slate-400 shrink-0" /> Auditório Principal · 4º Andar
              </div>
            </div>
          </div>

          {/* Item 2: Missão Oficial */}
          <div 
            onClick={() => onOpenApp('frota')}
            className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-200/70 hover:border-emerald-200 transition cursor-pointer flex flex-col justify-between gap-2"
          >
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-emerald-700 flex items-center gap-1">
                <Car size={11} /> Saída às 16:30
              </span>
              <span className="font-mono text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                BCB-4A12
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 truncate">Missão Oficial: Paranaguá</div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                Corolla Híbrido · Despacho autorizado
              </div>
            </div>
          </div>

          {/* Item 3: Chamado TI */}
          <div 
            onClick={() => onOpenApp('chamados')}
            className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-amber-50/40 border border-slate-200/70 hover:border-amber-200 transition cursor-pointer flex flex-col justify-between gap-2"
          >
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="font-mono text-amber-800">TI-2026-441</span>
              <span className="text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                SLA: 38 min
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 truncate">Troca de Toner & Scanner</div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                Técnico Marcos atribuído · Em curso
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FAIXA DE AUDITORIA CRIPTOGRÁFICA COMPACTA */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Lock size={18} />
          </div>
          <div>
            <div className="font-bold text-xs text-white flex items-center gap-2">
              <span>Rastreabilidade Criptográfica SHA-256</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.2 rounded">
                ICP-PR
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Todas as operações são assinadas digitalmente com registro de CPF e IP.
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAuditoria}
          className="text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
        >
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Ver Trilha de Auditoria</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 5. MODAL DE EXPERIÊNCIA INTERATIVA 360° */}
      <JornadaInterativaModal 
        isOpen={showJornadaModal} 
        onClose={() => setShowJornadaModal(false)}
        onNavigateApp={(appId) => onOpenApp(appId as AppModuleId)}
      />

    </div>
  );
};
