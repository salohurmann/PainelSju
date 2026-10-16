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
  Palette
} from 'lucide-react';

interface HeaderProps {
  currentUser: Usuario;
  onSwitchUser: (user: Usuario) => void;
  notificacoes: Notificacao[];
  onMarkNotificationRead: (id: string) => void;
  activeApp: string;
  onNavigateApp: (appId: 'hub' | 'frota' | 'chamados' | 'salas' | 'diarias' | 'ramais' | 'auditoria', subTab?: string) => void;
  onOpenCommandPalette?: () => void;
  pendentesFrotaCount?: number;
  veiculosLivresCount?: number;
}

type DesignTheme = 'clean' | 'pearl' | 'nordic';
type DesignDensity = 'comfortable' | 'compact';

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
  const [designTheme, setDesignTheme] = useState<DesignTheme>('clean');
  const [designDensity, setDesignDensity] = useState<DesignDensity>('comfortable');

  useEffect(() => {
    document.documentElement.setAttribute('data-design-theme', designTheme);
    document.documentElement.setAttribute('data-design-density', designDensity);
  }, [designTheme, designDensity]);

  const unreadCount = notificacoes.filter(n => !n.lida).length;

  const navItems = [
    { id: 'hub', label: 'Início', icon: LayoutGrid },
    { id: 'frota', label: 'Frotas', icon: Car, badge: pendentesFrotaCount },
    { id: 'chamados', label: 'Chamados', icon: Wrench },
    { id: 'salas', label: 'Salas', icon: Calendar },
    { id: 'diarias', label: 'Diárias', icon: Plane },
    { id: 'ramais', label: 'Ramais', icon: PhoneCall },
    { id: 'auditoria', label: 'Auditoria', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 glass-surface border-b border-slate-200/70 font-sans transition-all">
      {/* Barra Principal Unificada — 64px de puro minimalismo */}
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

        {/* 3. Ações Rápidas: Busca + Estúdio de Design + Notificações + Perfil */}
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

          {/* Estúdio de Design & Aparência Visual */}
          <div className="relative">
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
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'clean', label: 'Clean', dot: 'bg-[#0072BB]' },
                      { id: 'pearl', label: 'Pérola', dot: 'bg-amber-500' },
                      { id: 'nordic', label: 'Nórdico', dot: 'bg-slate-700' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setDesignTheme(t.id as DesignTheme)}
                        className={`px-2.5 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
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
                      { id: 'comfortable', label: 'Arejado (Padrão)' },
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

          {/* Notificações */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowRoleMenu(false);
                setShowDesignMenu(false);
              }}
              className="relative w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 flex items-center justify-center border border-slate-200/60 transition cursor-pointer active:scale-95"
              title="Notificações"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0072BB] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] sm:w-88 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in">
                <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Notificações</span>
                  <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {notificacoes.length}
                  </span>
                </div>

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
