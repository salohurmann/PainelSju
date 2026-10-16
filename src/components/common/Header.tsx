import React, { useState, useEffect } from 'react';
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
  ArrowUpRight
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
    titulo: 'CENSE Londrina I · Glosa Fiscal Ativa',
    detalhe: 'Nota NF-e 005.412 (R$ 6.750,00) aguarda regularização de certidão.',
    tempo: 'Prazo: 4 dias'
  },
  {
    id: 'pred-cense-saldo',
    modulo: 'cense' as const,
    nivel: 'alerta',
    titulo: 'CENSE Foz do Iguaçu · Cota Abaixo de 18%',
    detalhe: 'Recomendada liberação de repasse complementar para o trimestre.',
    tempo: 'Automático'
  },
  {
    id: 'pred-frota-revisao',
    modulo: 'frota' as const,
    nivel: 'info',
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

  const unreadCount = notificacoes.filter(n => !n.lida).length + ALERTAS_PREDITIVOS.length;
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
    <header className="sticky top-0 z-40 glass-surface border-b border-slate-200/70 font-sans transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* 1. Identidade Institucional Compacta */}
        <div 
          onClick={() => onNavigateApp('hub')} 
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="p-1 rounded-xl bg-white shadow-2xs border border-slate-200/80 group-hover:border-[#0072BB]/40 transition-colors">
            <BrasaoParana size="sm" />
          </div>

          <div className="leading-none">
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#0072BB]">
              Governo do Paraná
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mt-0.5 group-hover:text-[#0072BB] transition-colors">
              <span className="sm:hidden">SEJU Digital</span>
              <span className="hidden sm:inline">SEJU · Gestão Integrada</span>
            </div>
          </div>
        </div>

        {/* 2. Navegação Central Integrada (Desktop lg+) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeApp === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onNavigateApp(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#0072BB]' : 'text-slate-400'} />
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

        {/* 3. Ações Rápidas: Busca + Dark Mode + Estúdio de Design + Alertas Preditivos + Perfil */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Busca Spotlight */}
          <button
            onClick={() => {
              setShowNotifs(false);
              setShowRoleMenu(false);
              setShowDesignMenu(false);
              onOpenCommandPalette?.();
            }}
            className="flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 border border-slate-200/60 transition cursor-pointer active:scale-95"
            title="Busca Rápida (Ctrl+K)"
          >
            <Search size={15} className="text-slate-500" />
            <span className="hidden md:inline text-xs font-medium text-slate-500">Buscar</span>
            <kbd className="hidden md:inline text-[10px] font-mono font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>

          {/* Alternador 1 Clique de Modo Escuro Executivo */}
          <button
            onClick={() => setDesignTheme(isDark ? 'clean' : 'midnight')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 border-slate-200/60'
            }`}
            title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro Executivo'}
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
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition cursor-pointer active:scale-95 ${
                showDesignMenu
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 border-slate-200/60'
              }`}
              title="Estrutura de Design & Aparência"
            >
              <Palette size={15} />
            </button>

            {showDesignMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 p-3.5 space-y-3.5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900">Design & Atmosfera</span>
                  <span className="text-[10px] font-semibold text-[#0072BB] bg-blue-50 px-2 py-0.5 rounded-full">
                    UI Studio
                  </span>
                </div>

                {/* Paleta de Superfície */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Acabamento de Superfície
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'clean', label: 'Clean Claro', dot: 'bg-[#0072BB]' },
                      { id: 'midnight', label: 'Modo Escuro', dot: 'bg-indigo-400' },
                      { id: 'pearl', label: 'Pérola', dot: 'bg-amber-500' },
                      { id: 'nordic', label: 'Nórdico', dot: 'bg-slate-600' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setDesignTheme(t.id as DesignTheme)}
                        className={`px-2.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                          designTheme === t.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Espaçamento & Respiração */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Densidade Visual
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'comfortable', label: 'Arejado' },
                      { id: 'compact', label: 'Compacto' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDesignDensity(d.id as DesignDensity)}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                          designDensity === d.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Central de Alertas Preditivos & Notificações */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowRoleMenu(false);
                setShowDesignMenu(false);
              }}
              className="relative w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 flex items-center justify-center border border-slate-200/60 transition cursor-pointer active:scale-95"
              title="Central de Alertas Preditivos & Notificações"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in">
                <div className="p-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAbaNotif('preditivos')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                        abaNotif === 'preditivos'
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      Radar Preditivo ({ALERTAS_PREDITIVOS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAbaNotif('notificacoes')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                        abaNotif === 'notificacoes'
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      Avisos ({notificacoes.length})
                    </button>
                  </div>
                </div>

                {abaNotif === 'preditivos' ? (
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {ALERTAS_PREDITIVOS.map((al) => (
                      <div
                        key={al.id}
                        onClick={() => {
                          onNavigateApp(al.modulo);
                          setShowNotifs(false);
                        }}
                        className="p-3.5 text-xs hover:bg-slate-50 transition cursor-pointer flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle
                            size={15}
                            className={`mt-0.5 shrink-0 ${
                              al.nivel === 'critico' ? 'text-red-500' : al.nivel === 'alerta' ? 'text-amber-500' : 'text-[#0072BB]'
                            }`}
                          />
                          <div>
                            <div className="font-bold text-slate-900">{al.titulo}</div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{al.detalhe}</p>
                            <span className="inline-block text-[10px] font-semibold text-slate-400 mt-1">
                              {al.tempo}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      </div>
                    ))}
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
                          className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            !n.lida ? 'bg-blue-50/30' : ''
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
                                <span className="font-semibold text-slate-900 truncate">{n.titulo}</span>
                                <span className="text-[10px] text-slate-400 shrink-0">{n.data}</span>
                              </div>
                              <p className="text-slate-500 mt-0.5 line-clamp-2 text-[11px]">{n.mensagem}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seletor de Perfil */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifs(false);
                setShowDesignMenu(false);
              }}
              className="flex items-center gap-2 h-9 pl-1.5 pr-2 sm:pr-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/60 transition cursor-pointer active:scale-95"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.nome.charAt(0)}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-24 truncate">
                {currentUser.nome.split(' ')[0]}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] sm:w-68 max-w-xs bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 p-1.5 animate-in fade-in">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Alternar Perfil (RBAC)
                </div>
                <div className="space-y-0.5 mt-1">
                  {USUARIOS_MOCK.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition cursor-pointer ${
                        currentUser.id === u.id
                          ? 'bg-slate-100 text-slate-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold truncate">{u.nome}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.cargo}</div>
                      </div>
                      {currentUser.id === u.id && (
                        <CheckCircle2 size={15} className="text-[#0072BB] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
