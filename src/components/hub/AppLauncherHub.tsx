import React, { useState } from 'react';
import { 
  Car, 
  Wrench, 
  Calendar, 
  Plane, 
  PhoneCall, 
  ShieldCheck, 
  ArrowUpRight, 
  Clock, 
  Search,
  Sparkles,
  PlusCircle,
  CheckSquare,
  MapPin,
  Lock,
  ClipboardCheck,
  Building2
} from 'lucide-react';
import { Usuario, Agendamento, Veiculo } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { soundFX } from '../../services/soundFx';
import { JornadaInterativaModal } from '../experiencia/JornadaInterativaModal';

export type AppModuleId = 'frota' | 'chamados' | 'salas' | 'diarias' | 'cense' | 'ramais';
type CategoriaDesign = 'todos' | 'mobilidade' | 'espacos' | 'gestao';

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
  const [categoria, setCategoria] = useState<CategoriaDesign>('todos');

  const pendentesFrota = agendamentos.filter(a => a.status === 'pendente').length;
  const disponiveisFrota = veiculos.filter(v => v.status === 'disponivel').length;
  const primeiroNome = currentUser.nome.split(' ')[0];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-12 font-sans">
      
      {/* 1. HERO MINIMALISTA DE ALTO IMPACTO VISUAL */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-gov-card p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute right-20 -bottom-24 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{currentUser.setor} · {currentUser.cargo}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Olá, {primeiroNome}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Tudo pronto para sua rotina na Secretaria da Justiça e Cidadania.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowJornadaModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <Sparkles size={14} className="text-blue-400" />
                <span>Experiência 360°</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCommandPalette?.()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 text-slate-700 font-semibold text-xs transition-all cursor-pointer active:scale-95"
              >
                <Search size={14} className="text-slate-400" />
                <span>Busca Rápida</span>
                <kbd className="hidden sm:inline text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>

          {/* Métricas Esculpidas em Vidro */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:w-96 shrink-0">
            <div 
              onClick={() => onOpenApp('frota', 'frota')}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200/70 transition cursor-pointer text-center"
            >
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{disponiveisFrota}</div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Frota Livre</div>
            </div>

            <div 
              onClick={() => onOpenApp('frota', 'aprovacoes')}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200/70 transition cursor-pointer text-center"
            >
              <div className="text-xl sm:text-2xl font-extrabold text-amber-600">{pendentesFrota}</div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Despachos</div>
            </div>

            <div 
              onClick={() => onOpenApp('chamados')}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200/70 transition cursor-pointer text-center"
            >
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">98%</div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5">SLA Ativo</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTRO SEGMENTADO ULTRA-CLEAN + BENTO GRID VISUAL */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Ambientes Digitais
          </h2>

          <div className="inline-flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl self-start sm:self-auto">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'mobilidade', label: 'Mobilidade' },
              { id: 'espacos', label: 'TI & Salas' },
              { id: 'gestao', label: 'Diárias & Ramais' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setCategoria(tab.id as CategoriaDesign);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  categoria === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* BENTO GRID SOFISTICADO */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* CARD 1: FROTA & MOBILIDADE (DESTAQUE 12 COLUNAS) */}
          {(categoria === 'todos' || categoria === 'mobilidade') && (
            <div 
              onClick={() => onOpenApp('frota')}
              className="md:col-span-12 group bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-gov-card hover:shadow-gov-card-hover hover:border-slate-300 design-card-lift cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4 max-w-xl">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0072BB] text-white flex items-center justify-center shadow-sm shrink-0">
                      <Car size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                          Frota & Veículos Oficiais
                        </h3>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          {disponiveisFrota} livres
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Requisição digital, aprovação de gabinete e vistoria fotográfica em 4 ângulos.
                      </p>
                    </div>
                  </div>

                  {/* Ações Rápidas Esculpidas */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenApp('frota', 'nova-solicitacao');
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <PlusCircle size={14} /> Solicitar Carro
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenApp('frota', 'aprovacoes');
                      }}
                      className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <CheckSquare size={14} className="text-amber-600" /> Aprovações ({pendentesFrota})
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenApp('frota', 'checkin-checkout');
                      }}
                      className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <ClipboardCheck size={14} className="text-emerald-600" /> Vistoria 4 Fotos
                    </button>
                  </div>
                </div>

                {/* Vitrine Minimalista dos Carros no Pátio */}
                <div className="hidden sm:grid grid-cols-2 gap-3 shrink-0">
                  {veiculos.slice(0, 2).map((v) => (
                    <div key={v.id} className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/70 min-w-44">
                      <PlacaMercosul placa={v.placa} className="scale-75 origin-left -mb-1" />
                      <div className="text-xs font-bold text-slate-900 truncate mt-1.5">
                        {v.modelo.split(' ').slice(0, 2).join(' ')}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>{v.nivelCombustivel}% tanque</span>
                        <span className="text-emerald-600 font-semibold">● Livre</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CARD 2: CHAMADOS & SUPORTE TI (6 COLUNAS) */}
          {(categoria === 'todos' || categoria === 'espacos') && (
            <div 
              onClick={() => onOpenApp('chamados')}
              className="md:col-span-6 group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-gov-card hover:shadow-gov-card-hover hover:border-slate-300 design-card-lift cursor-pointer flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Wrench size={20} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowUpRight size={15} />
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Chamados & Suporte TI
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Quadro Kanban em tempo real para suporte técnico, redes e manutenção predial.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                <span>Fila inteligente com SLA</span>
                <span className="text-indigo-600 font-bold">Tempo médio: 38m</span>
              </div>
            </div>
          )}

          {/* CARD 3: RESERVA DE SALAS (6 COLUNAS) */}
          {(categoria === 'todos' || categoria === 'espacos') && (
            <div 
              onClick={() => onOpenApp('salas')}
              className="md:col-span-6 group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-gov-card hover:shadow-gov-card-hover hover:border-slate-300 design-card-lift cursor-pointer flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Calendar size={20} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowUpRight size={15} />
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Salas & Auditórios
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Planta interativa de ocupação com bloqueio automático de conflitos de horário.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                <span>5 espaços corporativos</span>
                <span className="text-emerald-600 font-bold">Grade 08h–18h</span>
              </div>
            </div>
          )}

          {/* CARD 4: CALCULADORA DE DIÁRIAS (6 COLUNAS) */}
          {(categoria === 'todos' || categoria === 'gestao') && (
            <div 
              onClick={() => onOpenApp('diarias')}
              className="md:col-span-6 group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-gov-card hover:shadow-gov-card-hover hover:border-slate-300 design-card-lift cursor-pointer flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Plane size={20} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowUpRight size={15} />
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Calculadora de Diárias
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Mapa interativo das regionais do Paraná e emissão automática de nota de empenho.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                <span>Decreto Estadual 1.428/PR</span>
                <span className="text-amber-700 font-bold">Anexo I Oficial</span>
              </div>
            </div>
          )}

          {/* CARD 5: GUIA DE RAMAIS (6 COLUNAS) */}
          {(categoria === 'todos' || categoria === 'gestao') && (
            <div 
              onClick={() => onOpenApp('ramais')}
              className="md:col-span-6 group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-gov-card hover:shadow-gov-card-hover hover:border-slate-300 design-card-lift cursor-pointer flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <PhoneCall size={20} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowUpRight size={15} />
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Guia de Ramais & Unidades
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Catálogo instantâneo de servidores, gabinetes e coordenações com status ao vivo.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                <span>Diretório & Organograma</span>
                <span className="text-sky-600 font-bold">Discagem 1 clique</span>
              </div>
            </div>
          )}

          {/* CARD 6: GESTÃO FISCAL DE FUNDO ROTATIVO DOS CENSES (12 COLUNAS) */}
          {(categoria === 'todos' || categoria === 'gestao') && (
            <div 
              onClick={() => onOpenApp('cense')}
              className="md:col-span-12 group bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-gov-card hover:shadow-gov-card-hover hover:border-slate-300 design-card-lift cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="flex items-start sm:items-center gap-4 max-w-2xl">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Building2 size={22} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      Fundo Rotativo · Unidades CENSE
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                      Gestão Fiscal DEASE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Controle de cotas trimestrais, lançamento e auditoria de Notas Fiscais (NF-e), glosas e prestação de contas individual de cada Centro de Socioeducação.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start lg:self-auto shrink-0">
                <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/70 text-right hidden sm:block">
                  <div className="text-[10px] font-semibold text-slate-400">Unidades CENSE</div>
                  <div className="text-xs font-extrabold text-slate-900">8 Polos Regionais</div>
                </div>
                <span className="px-4 py-2.5 rounded-xl bg-slate-900 group-hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition">
                  <span>Abrir Gestão Fiscal</span>
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. AGENDA DO DIA + AUDITORIA CRIPTOGRÁFICA EM LINHA ELEGANTE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-gov-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900">Agenda de Hoje</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div 
              onClick={() => onOpenApp('salas')}
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/60 transition cursor-pointer space-y-1.5"
            >
              <div className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                <Clock size={11} /> 14:00 – 15:30
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">Plano Plurianual</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                <MapPin size={10} /> Auditório · 4º Andar
              </div>
            </div>

            <div 
              onClick={() => onOpenApp('frota')}
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/60 transition cursor-pointer space-y-1.5"
            >
              <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                <Car size={11} /> Saída 16:30
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">Missão Paranaguá</div>
              <div className="text-[11px] text-slate-500 truncate">Corolla · BCB-4A12</div>
            </div>

            <div 
              onClick={() => onOpenApp('chamados')}
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/60 transition cursor-pointer space-y-1.5"
            >
              <div className="text-[10px] font-bold text-amber-700 font-mono">
                #TI-2026-441
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">Revisão de Scanner</div>
              <div className="text-[11px] text-slate-500 truncate">SLA ativo · 38 min</div>
            </div>
          </div>
        </div>

        {/* Card Escuro Minimalista de Segurança Blindada */}
        <div 
          onClick={onOpenAuditoria}
          className="lg:col-span-4 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl p-6 shadow-gov-card design-card-lift cursor-pointer flex flex-col justify-between gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full">
              Cofre Blindado
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Segurança & Privacidade</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Assinaturas e chaves permanecem 100% ocultas e protegidas no cofre.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 pt-2 border-t border-white/10">
            <span>Painel de Segurança</span>
            <ShieldCheck size={15} />
          </div>
        </div>
      </div>

      {/* MODAL DE EXPERIÊNCIA INTERATIVA 360° */}
      <JornadaInterativaModal 
        isOpen={showJornadaModal} 
        onClose={() => setShowJornadaModal(false)}
        onNavigateApp={(appId) => onOpenApp(appId as AppModuleId)}
      />

    </div>
  );
};
