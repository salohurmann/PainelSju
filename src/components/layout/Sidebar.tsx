import React from 'react';
import { ChevronLeft, ChevronRight, Inbox, X } from 'lucide-react';
import { BrasaoParana } from '../common/BrasaoParana';
import { AppModuleId } from '../hub/AppLauncherHub';
import { Usuario } from '../../types';
import { MODULOS_REGISTRY } from '../../modules/moduleRegistry';
import { temPermissao } from '../../services/rbac';

type Destino = 'hub' | AppModuleId | 'auditoria';

export interface NavItem {
  id: Destino;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  badge?: number;
}

export interface NavSection {
  title: string | null;
  items: NavItem[];
}

export interface SidebarProps {
  activeApp: Destino;
  onNavigate: (appId: Destino) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendentesFrotaCount?: number;
  /** Total de decisões pendentes para quem está logado (selo da Mesa). */
  pendentesMesaCount?: number;
  currentUser?: Usuario;
  modoDemo?: boolean;
}

const TITULOS_GRUPO: Record<string, string> = {
  operacao: 'Operação',
  gestao: 'Gestão',
  seguranca: 'Registro',
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeApp,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  pendentesFrotaCount = 0,
  pendentesMesaCount = 0,
  currentUser,
  modoDemo = false,
}) => {
  const permitidos = MODULOS_REGISTRY.filter((m) => !currentUser || temPermissao(currentUser, m.permissaoMinima));

  const secoes: NavSection[] = [
    { title: null, items: [{ id: 'hub', label: 'Mesa', icon: Inbox, badge: pendentesMesaCount || undefined }] },
    ...(['operacao', 'gestao', 'seguranca'] as const)
      .map((grupo) => ({
        title: TITULOS_GRUPO[grupo],
        items: permitidos
          .filter((m) => m.grupo === grupo)
          .map((m) => ({
            id: m.id as Destino,
            label: m.nome,
            icon: m.icone,
            badge: m.id === 'frota' && pendentesFrotaCount > 0 ? pendentesFrotaCount : undefined,
          })),
      }))
      .filter((s) => s.items.length > 0),
  ];

  const ir = (id: Destino) => {
    onNavigate(id);
    if (mobileOpen) onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-[#0A1424]/55 z-40 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />
      )}

      <aside
        aria-label="Menu principal"
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[var(--ink)] text-[var(--ink-text)] transition-[width,transform] duration-200 select-none ${
          collapsed ? 'w-[72px]' : 'w-[248px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className={`h-16 flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
          <button
            type="button"
            onClick={() => ir('hub')}
            className="flex items-center gap-3 min-w-0 cursor-pointer text-left rounded-[var(--radius-md)]"
            aria-label="Ir para a Mesa"
          >
            <span className="w-7 h-8 shrink-0 flex items-center justify-center">
              <BrasaoParana size="sm" />
            </span>
            {!collapsed && (
              <span className="flex flex-col min-w-0 leading-tight">
                <span className="text-[10.5px] tracking-[0.12em] uppercase text-[var(--ink-muted)]">SEJU · Paraná</span>
                <span className="text-[13.5px] font-semibold truncate">Painel de Gestão</span>
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto p-2 rounded-[var(--radius-md)] text-[var(--ink-muted)] hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-4 space-y-6">
          {secoes.map((secao, i) => (
            <div key={i} className="space-y-0.5">
              {secao.title && !collapsed && (
                <p className="px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-muted)]">
                  {secao.title}
                </p>
              )}
              {secao.title && collapsed && <div className="mx-3 mb-2 border-t border-white/10" aria-hidden="true" />}
              {secao.items.map((item) => {
                const Icone = item.icon;
                const ativo = activeApp === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => ir(item.id)}
                    aria-current={ativo ? 'page' : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`relative w-full flex items-center gap-3 h-10 rounded-[var(--radius-md)] text-[13.5px] transition-colors cursor-pointer ${
                      collapsed ? 'justify-center px-0' : 'px-3'
                    } ${
                      ativo
                        ? 'bg-[var(--ink-2)] text-white font-semibold'
                        : 'text-[#D9E4EE] hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {ativo && !collapsed && (
                      <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#7CC0F0]" />
                    )}
                    <Icone size={17} strokeWidth={ativo ? 2 : 1.7} className="shrink-0" />
                    {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                    {item.badge !== undefined && !collapsed && (
                      <span
                        className={`min-w-[22px] h-[20px] px-1.5 rounded-[var(--radius-sm)] text-[11.5px] font-semibold tabular-nums flex items-center justify-center ${
                          ativo ? 'bg-white text-[var(--ink)]' : 'bg-white/[0.12] text-white'
                        }`}
                        aria-label={`${item.badge} pendente${item.badge > 1 ? 's' : ''}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.badge !== undefined && collapsed && (
                      <span aria-hidden="true" className="absolute top-2 right-3 w-2 h-2 rounded-full bg-[#F3C178]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-3 pb-4 pt-3 border-t border-white/10 space-y-2">
          {!collapsed && (
            <div className="px-3 text-[12px] leading-snug text-[var(--ink-muted)]">
              {currentUser?.setor && <div className="truncate text-[#D9E4EE]">{currentUser.setor}</div>}
              {modoDemo && <div className="mt-0.5">Modo demonstração · dados fictícios</div>}
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full hidden lg:flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius-md)] text-[12.5px] text-[var(--ink-muted)] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight size={16} /> : (<><ChevronLeft size={15} /><span>Recolher</span></>)}
          </button>
        </div>
      </aside>
    </>
  );
};
