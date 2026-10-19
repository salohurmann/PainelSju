import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  LogOut,
  Shield,
  Layers,
  Activity
} from 'lucide-react';
import { Usuario, Notificacao } from '../../types';
import { USUARIOS_MOCK } from '../../services/store';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { AppModuleId } from '../hub/AppLauncherHub';

export interface TopBarProps {
  currentUser: Usuario;
  onSwitchUser: (user: Usuario) => void;
  notificacoes: Notificacao[];
  onMarkNotificationRead: (id: string) => void;
  activeApp: 'hub' | AppModuleId | 'auditoria';
  onNavigateApp: (appId: 'hub' | AppModuleId | 'auditoria', subTab?: string) => void;
  onOpenCommandPalette: () => void;
  onOpenMobileSidebar: () => void;
  onOpenDiagnostico?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onSwitchUser,
  notificacoes,
  onMarkNotificationRead,
  activeApp,
  onNavigateApp,
  onOpenCommandPalette,
  onOpenMobileSidebar,
  onOpenDiagnostico
}) => {
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark') || document.body.classList.contains('theme-midnight'));

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Fecha dropdowns se clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('theme-midnight');
    if (isCurrentlyDark) {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('theme-midnight');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      document.body.classList.add('theme-midnight');
      setIsDark(true);
    }
  };

  const appBreadcrumbNames: Record<string, string> = {
    hub: 'Painel Geral',
    frota: 'Frotas Oficiais',
    chamados: 'Chamados & TI',
    salas: 'Reserva de Salas',
    diarias: 'Diárias & Viagens',
    cense: 'Fundo Rotativo CENSE',
    ramais: 'Telefonia & Ramais',
    auditoria: 'Trilha SHA-256'
  };

  const unreadCount = notificacoes.filter((n) => !n.lida).length;

  return (
    <header className="sticky top-0 z-30 h-14 bg-[var(--surface)] border-b border-[var(--border)] px-4 flex items-center justify-between gap-3 select-none">
      {/* Esquerda: Botão Menu Mobile + Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => onNavigateApp('hub')}
            className="text-[var(--text-muted)] hover:text-[var(--text)] font-medium transition-colors cursor-pointer hidden sm:inline"
          >
            SEJU
          </button>
          <ChevronRight size={13} className="text-[var(--border-strong)] hidden sm:inline" />
          <span className="font-semibold text-[var(--text)] truncate">
            {appBreadcrumbNames[activeApp] || 'Painel'}
          </span>
        </nav>
      </div>

      {/* Centro: Barra de Busca Global (Ctrl+K) */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full h-9 px-3 bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-[var(--text-muted)] border border-[var(--border)] rounded-[var(--radius-md)] flex items-center justify-between text-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search size={14} />
            <span className="truncate">Buscar módulo, placa, servidor ou diária...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text-muted)]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Direita: Ações Rápidas, Tema, Notificações e Perfil */}
      <div className="flex items-center gap-2">
        {/* Busca rápida no mobile */}
        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          title="Buscar (Ctrl+K)"
        >
          <Search size={18} />
        </button>

        {/* Alternador de Tema */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Midnight (Escuro)'}
          aria-label="Alternar tema"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notificações */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen((prev) => !prev)}
            className="relative p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            aria-label="Notificações"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--warning)]" />
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text)]">Notificações</span>
                {unreadCount > 0 && (
                  <Badge variant="warning">{unreadCount} pendente{unreadCount > 1 ? 's' : ''}</Badge>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                {notificacoes.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                    Nenhuma notificação recente.
                  </div>
                ) : (
                  notificacoes.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-[var(--surface-2)] ${
                        !n.lida ? 'bg-[var(--brand-subtle)]/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-[var(--text)] truncate">{n.titulo}</span>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
                          {new Date(n.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">{n.mensagem}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separador vertical sutil */}
        <div className="h-4 w-px bg-[var(--border)] mx-1" />

        {/* Dropdown de Usuário / Perfil */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          >
            <Avatar name={currentUser.nome} size="sm" />
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-[var(--text)] max-w-[120px] truncate">
                {currentUser.nome.split(' ')[0]}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] max-w-[120px] truncate">
                {currentUser.cargo}
              </span>
            </div>
            <ChevronDown size={14} className="text-[var(--text-muted)] hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-[var(--border)] bg-[var(--surface-2)]/40">
                <p className="text-xs font-bold text-[var(--text)]">{currentUser.nome}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{currentUser.cargo}</p>
                <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1">CPF: {currentUser.cpf}</p>
              </div>

              <div className="p-2 space-y-1">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Alternar Perfil de Teste
                </p>
                {USUARIOS_MOCK.map((u: Usuario) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold'
                          : 'text-[var(--text)] hover:bg-[var(--surface-2)]'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span>{u.nome}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{u.cargo}</span>
                      </div>
                      {isCurrent && <UserCheck size={14} className="text-[var(--brand)] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-[var(--border)] space-y-0.5">
                <button
                  onClick={() => {
                    onNavigateApp('auditoria');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                >
                  <Shield size={14} className="text-[var(--text-muted)]" />
                  <span>Segurança & Auditoria</span>
                </button>

                {onOpenDiagnostico && (
                  <button
                    onClick={() => {
                      onOpenDiagnostico();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  >
                    <Activity size={14} className="text-[var(--brand)]" />
                    <span>Diagnóstico de Suporte N1/N2</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
