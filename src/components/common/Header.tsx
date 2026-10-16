import React, { useState } from 'react';
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
  PhoneCall
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
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 font-sans transition-all">
      {/* Faixa superior institucional minimalista (apenas desktop) */}
      <div className="hidden sm:block bg-slate-900 text-slate-300 text-[10px] py-1 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-bold text-white uppercase tracking-wider">Governo do Estado do Paraná</span>
            <span className="text-slate-600">•</span>
            <span>Secretaria da Justiça e Cidadania (SEJU)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://www.transparencia.pr.gov.br" target="_blank" rel="noreferrer" className="hover:text-white transition">
              Transparência
            </a>
            <a href="https://www.pr.gov.br" target="_blank" rel="noreferrer" className="hover:text-white transition">
              pr.gov.br
            </a>
          </div>
        </div>
      </div>

      {/* Barra Principal Unificada — Linha Única Elegante (Mobile & Desktop) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* 1. Identidade Institucional Compacta */}
        <div 
          onClick={() => onNavigateApp('hub')} 
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="p-1 rounded-xl bg-slate-50 border border-slate-200/80 group-hover:border-[#0072BB]/40 transition-colors">
            <BrasaoParana size="sm" />
          </div>

          <div className="leading-none">
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#0072BB]">
              Governo do Paraná
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight mt-0.5 group-hover:text-[#0072BB] transition-colors">
              <span className="sm:hidden">SEJU · Portal Digital</span>
              <span className="hidden sm:inline">Secretaria da Justiça e Cidadania</span>
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
                    ? 'bg-white text-[#0072BB] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#0072BB]' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. Ações Rápidas: Busca + Notificações + Perfil (Mesma Linha no Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Busca Spotlight */}
          <button
            onClick={() => {
              setShowNotifs(false);
              setShowRoleMenu(false);
              onOpenCommandPalette?.();
            }}
            className="flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 border border-slate-200/70 transition cursor-pointer active:scale-95"
            title="Busca Rápida (Ctrl+K)"
          >
            <Search size={15} className="text-slate-500" />
            <span className="hidden md:inline text-xs font-medium text-slate-500">Buscar...</span>
            <kbd className="hidden md:inline text-[10px] font-mono font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>

          {/* Notificações */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowRoleMenu(false);
              }}
              className="relative w-9 h-9 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 flex items-center justify-center border border-slate-200/70 transition cursor-pointer active:scale-95"
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
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] sm:w-88 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
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
              }}
              className="flex items-center gap-2 h-9 pl-1.5 pr-2 sm:pr-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/70 transition cursor-pointer active:scale-95"
            >
              <div className="w-6 h-6 rounded-lg bg-[#00385E] text-white flex items-center justify-center font-bold text-xs">
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
