import React, { useState, useEffect, useRef } from 'react';
import { Usuario, Notificacao } from '../../types';
import { USUARIOS_MOCK } from '../../services/store';
import { BrasaoParana } from './BrasaoParana';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  ChevronDown,
  ShieldCheck,
  LayoutGrid,
  Car,
  Wrench,
  Calendar,
  Plane,
  PhoneCall,
  Palette,
  Building2,
  Moon,
  Sun,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Layers,
  Fingerprint
} from 'lucide-react';

interface HeaderProps {
  currentUser: Usuario;
  onSwitchUser: (user: Usuario) => void;
  notificacoes: Notificacao[];
  onMarkNotificationRead: (id: string) => void;
  activeApp: string;
  onNavigateApp: (appId: 'hub' | 'frota' | 'chamados' | 'salas' | 'diarias' | 'cense' | 'ramais' | 'auditoria', subTab?: string) => void;
  onOpenCommandPalette?: () => void;
  pendentesFrotaCount?: number;
  veiculosLivresCount?: number;
}

type DesignTheme = 'clean' | 'pearl' | 'nordic' | 'midnight';
type DesignDensity = 'comfortable' | 'compact';

const ALERTAS_PREDITIVOS = [
  {
    id: 'pred-cense-glosa',
    modulo: 'cense' as const,
    nivel: 'critico',
    tag: 'CRÍTICO',
    titulo: 'CENSE Londrina I · Glosa Fiscal Ativa',
    detalhe: 'Nota NF-e 005.412 (R$ 6.750,00) aguarda regularização de certidão.',
    tempo: 'Prazo: 4 dias'
  },
  {
    id: 'pred-cense-saldo',
    modulo: 'cense' as const,
    nivel: 'alerta',
    tag: 'ATENÇÃO',
    titulo: 'CENSE Foz do Iguaçu · Cota Abaixo de 18%',
    detalhe: 'Recomendada liberação de repasse complementar para o trimestre.',
    tempo: 'Automático'
  },
  {
    id: 'pred-frota-revisao',
    modulo: 'frota' as const,
    nivel: 'info',
    tag: 'PREVENTIVO',
    titulo: 'Revisão Preventiva · Renault Duster',
    detalhe: 'Faltam 420 km para o ciclo de revisão programada (Detran/PR).',
    tempo: 'Manutenção'
  }
];

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  notificacoes,
  onMarkNotificationRead,
  activeApp,
  onNavigateApp,
  onOpenCommandPalette,
  pendentesFrotaCount = 0
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showDesignMenu, setShowDesignMenu] = useState(false);
  const [abaNotif, setAbaNotif] = useState<'preditivos' | 'notificacoes'>('preditivos');

  const actionsRef = useRef<HTMLDivElement>(null);

  const [designTheme, setDesignTheme] = useState<DesignTheme>(() => {
    const saved = localStorage.getItem('seju_design_theme_v1') as DesignTheme | null;
    return saved || 'clean';
  });
  const [designDensity, setDesignDensity] = useState<DesignDensity>(() => {
    const saved = localStorage.getItem('seju_design_density_v1') as DesignDensity | null;
    return saved || 'comfortable';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-design-theme', designTheme);
    localStorage.setItem('seju_design_theme_v1', designTheme);
  }, [designTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-design-density', designDensity);
    localStorage.setItem('seju_design_density_v1', designDensity);
  }, [designDensity]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
        setShowRoleMenu(false);
        setShowDesignMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadNotifsOnly = notificacoes.filter(n => !n.lida).length;
  const unreadCount = unreadNotifsOnly + ALERTAS_PREDITIVOS.length;
  const isDark = designTheme === 'midnight';

  const navItems = [
    { id: 'hub', label: 'Início', icon: LayoutGrid },
    { id: 'frota', label: 'Frotas', icon: Car, badge: pendentesFrotaCount },
    { id: 'cense', label: 'Fundo CENSE', icon: Building2 },
    { id: 'chamados', label: 'Chamados', icon: Wrench },
    { id: 'salas', label: 'Salas', icon: Calendar },
    { id: 'diarias', label: 'Diárias', icon: Plane },
    { id: 'ramais', label: 'Ramais', icon: PhoneCall },
    { id: 'auditoria', label: 'Segurança', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 glass-surface border-b border-slate-200/80 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06),inset_0_1px_0_0_rgba(255,255,255,0.85)] font-sans transition-all">
      {/* Linha Fina Superior de Gradiente Institucional do Estado do Paraná */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-[#0072BB] via-[#009B54] to-[#C59B27] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* 1. Identidade Institucional Compacta com Acabamento de Joalheria */}
        <div 
          onClick={() => onNavigateApp('hub')} 
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="relative p-1.5 rounded-xl bg-gradient-to-b from-white to-slate-50/95 border border-slate-200/90 shadow-[0_2px_6px_-1px_rgba(15,23,42,0.08),inset_0_1px_0_0_#ffffff] group-hover:border-[#0072BB]/45 group-hover:shadow-[0_4px_12px_-2px_rgba(0,114,187,0.18),inset_0_1px_0_0_#ffffff] transition-all duration-200">
            <BrasaoParana size="sm" />
          </div>

          <div className="leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0072BB]">
                Governo do Paraná
              </span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[#009B54]" />
              <span className="hidden sm:inline-block text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200/70">
                GOV.PR
              </span>
            </div>
            <div className="text-sm sm:text-[15px] font-extrabold text-slate-900 tracking-tight mt-0.5 group-hover:text-[#0072BB] transition-colors">
              <span className="sm:hidden">SEJU Digital</span>
              <span className="hidden sm:inline">SEJU · Gestão Integrada</span>
            </div>
          </div>
        </div>

        {/* 2. Navegação Central Integrada (Desktop lg+) */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeApp === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onNavigateApp(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200/90'
                    : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? 'text-[#0072BB]' : 'text-slate-400'}
                />
                <span>{tab.label}</span>

                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. Ações Rápidas: Busca + Dark Mode + Estúdio + Alertas + Perfil */}
        <div ref={actionsRef} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Busca Spotlight (⌘K) */}
          <button
            onClick={() => {
              setShowNotifs(false);
              setShowRoleMenu(false);
              setShowDesignMenu(false);
              onOpenCommandPalette?.();
            }}
            className="group flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-600 border border-slate-200/80 transition-all cursor-pointer active:scale-95"
            title="Busca Rápida (Ctrl+K)"
          >
            <Search size={14} className="text-slate-500 group-hover:text-[#0072BB] transition-colors" />
            <span className="hidden md:inline text-xs font-medium text-slate-600">
              Buscar
            </span>
            <kbd className="hidden md:inline-flex items-center text-[10px] font-mono font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>

          {/* Alternador de Tema Escuro */}
          <button
            onClick={() => setDesignTheme(isDark ? 'clean' : 'midnight')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600 border-slate-200/80'
            }`}
            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Estúdio de Design & Aparência Visual */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                setShowDesignMenu(!showDesignMenu);
                setShowNotifs(false);
                setShowRoleMenu(false);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 cursor-pointer active:scale-95 ${
                showDesignMenu
                  ? 'bg-gradient-to-b from-slate-800 to-slate-950 text-white border-slate-900 shadow-[0_4px_12px_-2px_rgba(15,23,42,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                  : 'bg-gradient-to-b from-white to-slate-100/90 hover:from-white hover:to-slate-50 text-slate-600 hover:text-slate-900 border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.05),inset_0_1px_0_0_#ffffff]'
              }`}
              title="Estúdio de Design & Atmosfera Visual"
            >
              <Palette size={15} strokeWidth={2.1} />
            </button>

            {showDesignMenu && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white/95 rounded-2xl shadow-[0_24px_48px_-12px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.08)] border border-white/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="h-[2px] w-full bg-gradient-to-r from-[#0072BB] via-[#009B54] to-[#C59B27]" />
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#0072BB]/10 border border-[#0072BB]/20 flex items-center justify-center text-[#0072BB]">
                        <Sparkles size={13} />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 leading-none">Estúdio de Design</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">Calibragem de Superfície SEJU</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#0072BB] bg-blue-50/90 border border-blue-200/60 px-2 py-0.5 rounded-full">
                      UI PRO
                    </span>
                  </div>

                  {/* Paleta de Superfície */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>Acabamento de Superfície</span>
                      <Layers size={11} className="text-slate-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'clean', label: 'Clean Claro', sub: 'Institucional', dot: 'bg-[#0072BB] ring-blue-200' },
                        { id: 'midnight', label: 'Modo Escuro', sub: 'OLED Nocturne', dot: 'bg-indigo-500 ring-indigo-200' },
                        { id: 'pearl', label: 'Pérola', sub: 'Quente Suave', dot: 'bg-amber-500 ring-amber-200' },
                        { id: 'nordic', label: 'Nórdico', sub: 'Cinza Frio', dot: 'bg-slate-600 ring-slate-200' },
                      ].map((t) => {
                        const active = designTheme === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setDesignTheme(t.id as DesignTheme)}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 cursor-pointer transition-all ${
                              active
                                ? 'bg-gradient-to-b from-slate-800 to-slate-950 text-white border-slate-900 shadow-[0_4px_10px_-2px_rgba(15,23,42,0.25),inset_0_1px_0_0_rgba(255,255,255,0.18)]'
                                : 'bg-gradient-to-b from-white to-slate-50/90 text-slate-700 border-slate-200/90 hover:border-slate-300 shadow-[inset_0_1px_0_0_#ffffff]'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold leading-tight truncate">{t.label}</div>
                              <div className={`text-[9px] mt-0.5 truncate ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                                {t.sub}
                              </div>
                            </div>
                            <span className={`w-2.5 h-2.5 rounded-full ring-2 shrink-0 ${t.dot}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Espaçamento & Respiração em Trilho Usinado */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Densidade Visual & Espaçamento
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 shadow-inner">
                      {[
                        { id: 'comfortable', label: 'Arejado (Padrão)' },
                        { id: 'compact', label: 'Compacto (Alta Densidade)' },
                      ].map((d) => {
                        const active = designDensity === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setDesignDensity(d.id as DesignDensity)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                              active
                                ? 'bg-white text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.12),inset_0_1px_0_#ffffff] border border-slate-200/80'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Central de Alertas Preditivos & Notificações com Indicador Pulsante */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowRoleMenu(false);
                setShowDesignMenu(false);
              }}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-150 cursor-pointer active:scale-95 ${
                showNotifs
                  ? 'bg-gradient-to-b from-slate-800 to-slate-950 text-white border-slate-900 shadow-[0_4px_12px_-2px_rgba(15,23,42,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                  : 'bg-gradient-to-b from-white to-slate-100/90 hover:from-white hover:to-slate-50 text-slate-600 hover:text-slate-900 border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.05),inset_0_1px_0_0_#ffffff]'
              }`}
              title="Central de Alertas Preditivos & Notificações"
            >
              <Bell size={15} strokeWidth={2.1} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 min-w-4 px-1 bg-gradient-to-b from-amber-400 to-amber-600 text-white text-[9px] font-extrabold items-center justify-center ring-2 ring-white shadow-xs">
                    {unreadCount}
                  </span>
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2.5 w-[calc(100vw-24px)] sm:w-96 max-w-sm bg-white/95 rounded-2xl shadow-[0_24px_48px_-12px_rgba(15,23,42,0.24),0_0_0_1px_rgba(15,23,42,0.08)] border border-white/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="h-[2px] w-full bg-gradient-to-r from-[#0072BB] via-[#009B54] to-[#C59B27]" />

                {/* Cabeçalho com Abas em Trilho Usinado */}
                <div className="p-3 bg-slate-50/90 border-b border-slate-200/70">
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-200/60 border border-slate-300/50 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setAbaNotif('preditivos')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        abaNotif === 'preditivos'
                          ? 'bg-white text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.12),inset_0_1px_0_#ffffff]'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Radar Preditivo ({ALERTAS_PREDITIVOS.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAbaNotif('notificacoes')}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        abaNotif === 'notificacoes'
                          ? 'bg-white text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.12),inset_0_1px_0_#ffffff]'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Avisos ({notificacoes.length})</span>
                    </button>
                  </div>
                </div>

                {abaNotif === 'preditivos' ? (
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {ALERTAS_PREDITIVOS.map((al) => {
                      const isCritico = al.nivel === 'critico';
                      const isAlerta = al.nivel === 'alerta';
                      return (
                        <div
                          key={al.id}
                          onClick={() => {
                            onNavigateApp(al.modulo);
                            setShowNotifs(false);
                          }}
                          className="group relative p-3.5 text-xs hover:bg-slate-50/90 transition-all cursor-pointer flex items-start justify-between gap-3"
                        >
                          {/* Barra lateral de severidade */}
                          <span
                            className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                              isCritico ? 'bg-red-500' : isAlerta ? 'bg-amber-500' : 'bg-[#0072BB]'
                            }`}
                          />
                          <div className="flex items-start gap-2.5 pl-1.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                                isCritico
                                  ? 'bg-red-50 text-red-600 border-red-200/70'
                                  : isAlerta
                                  ? 'bg-amber-50 text-amber-600 border-amber-200/70'
                                  : 'bg-blue-50 text-[#0072BB] border-blue-200/70'
                              }`}
                            >
                              <AlertTriangle size={14} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded border ${
                                    isCritico
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : isAlerta
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-blue-50 text-[#0072BB] border-blue-200'
                                  }`}
                                >
                                  {al.tag}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400">{al.tempo}</span>
                              </div>
                              <div className="font-bold text-slate-900 mt-1 group-hover:text-[#0072BB] transition-colors">
                                {al.titulo}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{al.detalhe}</p>
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-[#0072BB] group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                            <ArrowUpRight size={13} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notificacoes.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Nenhuma notificação recente.
                      </div>
                    ) : (
                      notificacoes.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            !n.lida ? 'bg-blue-50/35' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0">
                              {n.tipo === 'aprovado' && <CheckCircle2 size={15} className="text-emerald-600" />}
                              {n.tipo === 'reprovado' && <AlertCircle size={15} className="text-red-600" />}
                              {n.tipo === 'nova_solicitacao' && <ShieldCheck size={15} className="text-[#0072BB]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-900 truncate">{n.titulo}</span>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0">{n.data}</span>
                              </div>
                              <p className="text-slate-500 mt-0.5 line-clamp-2 text-[11px]">{n.mensagem}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="px-3.5 py-2 bg-slate-50/90 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>MOTOR DE TELEMETRIA SEJU</span>
                  <span className="text-[#009B54] font-bold">● TEMPO REAL</span>
                </div>
              </div>
            )}
          </div>

          {/* Seletor de Perfil do Servidor com Borda Chanfrada e Dropdown RBAC Ultra-Sofisticado */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifs(false);
                setShowDesignMenu(false);
              }}
              className={`flex items-center gap-2 h-9 pl-1.5 pr-2 sm:pr-2.5 rounded-xl border transition-all duration-150 cursor-pointer active:scale-95 ${
                showRoleMenu
                  ? 'bg-gradient-to-b from-slate-800 to-slate-950 text-white border-slate-900 shadow-[0_4px_12px_-2px_rgba(15,23,42,0.3),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                  : 'bg-gradient-to-b from-white to-slate-100/90 hover:from-white hover:to-slate-50 text-slate-800 border-slate-200/90 shadow-[0_1px_2px_rgba(15,23,42,0.05),inset_0_1px_0_0_#ffffff]'
              }`}
              title="Credenciais do Servidor & Alternador de Perfil RBAC"
            >
              <div className="relative">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#0072BB] to-[#004C80] text-white flex items-center justify-center font-extrabold text-xs shadow-2xs ring-1 ring-white/50">
                  {currentUser.nome.charAt(0)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#009B54] ring-1 ring-white" />
              </div>
              <span className={`hidden sm:inline text-xs font-bold max-w-24 truncate ${showRoleMenu ? 'text-white' : 'text-slate-800'}`}>
                {currentUser.nome.split(' ')[0]}
              </span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${
                  showRoleMenu ? 'rotate-180 text-slate-300' : 'text-slate-400'
                }`}
              />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2.5 w-[calc(100vw-24px)] sm:w-76 max-w-xs bg-white/95 rounded-2xl shadow-[0_24px_48px_-12px_rgba(15,23,42,0.24),0_0_0_1px_rgba(15,23,42,0.08)] border border-white/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="h-[2px] w-full bg-gradient-to-r from-[#0072BB] via-[#009B54] to-[#C59B27]" />
                <div className="p-2">
                  <div className="px-2.5 py-2 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      <Fingerprint size={13} className="text-[#0072BB]" />
                      <span>Alternar Perfil (RBAC)</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-[#009B54] bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded">
                      GOV.BR · NÍVEL OURO
                    </span>
                  </div>
                  <div className="space-y-1 mt-1.5">
                    {USUARIOS_MOCK.map((u) => {
                      const isSelected = currentUser.id === u.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2.5 text-xs transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#0072BB]/[0.09] to-transparent border-[#0072BB]/25 text-slate-900 shadow-2xs'
                              : 'border-transparent hover:bg-slate-50 hover:border-slate-200/70 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#0072BB] to-[#004C80] text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200/80'
                              }`}
                            >
                              {u.nome.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className={`truncate ${isSelected ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-800'}`}>
                                {u.nome}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">{u.cargo}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 size={15} className="text-[#0072BB] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
