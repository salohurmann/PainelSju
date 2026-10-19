import React from 'react';
import {
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X
} from 'lucide-react';
import { BrasaoParana } from '../common/BrasaoParana';
import { AppModuleId } from '../hub/AppLauncherHub';
import { Usuario } from '../../types';
import { MODULOS_REGISTRY } from '../../modules/moduleRegistry';
import { temPermissao } from '../../services/rbac';

export interface NavItem {
  id: 'hub' | AppModuleId | 'auditoria';
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  badge?: number | string;
  badgeVariant?: 'brand' | 'warning' | 'danger' | 'neutral';
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface SidebarProps {
  activeApp: 'hub' | AppModuleId | 'auditoria';
  onNavigate: (appId: 'hub' | AppModuleId | 'auditoria') => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendentesFrotaCount?: number;
  currentUser?: Usuario;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeApp,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  pendentesFrotaCount = 0,
  currentUser
}) => {
  // Constrói as seções filtradas por permissão RBAC a partir do registro de manifestos
  const modulosPermitidos = MODULOS_REGISTRY.filter(m => 
    !currentUser || temPermissao(currentUser, m.permissaoMinima)
  );

  const operacaoItems: NavItem[] = modulosPermitidos
    .filter(m => m.grupo === 'operacao')
    .map(m => ({
      id: m.id as any,
      label: m.nome,
      icon: m.icone,
      badge: m.id === 'frota' && pendentesFrotaCount > 0 ? pendentesFrotaCount : undefined,
      badgeVariant: 'warning'
    }));

  const gestaoItems: NavItem[] = modulosPermitidos
    .filter(m => m.grupo === 'gestao')
    .map(m => ({
      id: m.id as any,
      label: m.nome,
      icon: m.icone
    }));

  const segurancaItems: NavItem[] = modulosPermitidos
    .filter(m => m.grupo === 'seguranca')
    .map(m => ({
      id: m.id as any,
      label: m.nome,
      icon: m.icone
    }));

  const sections: NavSection[] = [
    {
      title: 'Principal',
      items: [
        { id: 'hub', label: 'Painel Geral', icon: LayoutGrid }
      ]
    },
    ...(operacaoItems.length > 0 ? [{ title: 'Operação & Logística', items: operacaoItems }] : []),
    ...(gestaoItems.length > 0 ? [{ title: 'Administração & Finanças', items: gestaoItems }] : []),
    ...(segurancaItems.length > 0 ? [{ title: 'Segurança & Controle', items: segurancaItems }] : [])
  ];

  const handleItemClick = (id: 'hub' | AppModuleId | 'auditoria') => {
    onNavigate(id);
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Backdrop para mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Container da Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-all duration-200 select-none ${
          collapsed ? 'w-[72px]' : 'w-[264px]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Topo Institucional da Sidebar */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border)]">
          <div
            onClick={() => handleItemClick('hub')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-8 h-8 shrink-0 flex items-center justify-center">
              <BrasaoParana size="sm" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold tracking-tight text-[var(--text)] uppercase truncate leading-none font-heading">
                  Justiça 2.0
                </span>
                <span className="text-[10px] text-[var(--text-muted)] truncate leading-tight mt-0.5">
                  Portal de Sistemas · SEJU-PR
                </span>
              </div>
            )}
          </div>

          {/* Botão fechar mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] lg:hidden cursor-pointer"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de Navegação com Seções Semânticas */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!collapsed && (
                <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeApp === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-xs font-medium transition-all duration-150 cursor-pointer text-left ${
                        isActive
                          ? 'bg-[var(--brand-subtle)] text-[var(--brand)] font-semibold shadow-2xs border border-[var(--brand-border)]/50'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2.2 : 1.75}
                        className={`shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? 'text-[var(--brand)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'
                        }`}
                      />

                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                                item.badgeVariant === 'warning'
                                  ? 'bg-[var(--warning-subtle)] text-[var(--warning)] border border-[var(--warning)]/20'
                                  : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé Institucional da Sidebar */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-2)]/40 space-y-2">
          {!collapsed ? (
            <div className="text-[11px] text-[var(--text-muted)] space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-[var(--text)]">
                <MapPin size={12} className="text-[var(--brand)] shrink-0" />
                <span className="truncate">Sede Hauer · Curitiba/PR</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-[10px]">
                <span className="flex items-center gap-1 text-[var(--success)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                  GovCloud PR
                </span>
                <span className="font-mono text-[var(--text-muted)]">v2.4.0</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-2 h-2 rounded-full bg-[var(--success)]" title="GovCloud PR Online" />
            </div>
          )}

          {/* Botão de colapsar no desktop */}
          <button
            onClick={onToggleCollapse}
            className="w-full hidden lg:flex items-center justify-center p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer text-xs"
            title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {collapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-1.5"><ChevronLeft size={14} /><span>Recolher</span></div>}
          </button>
        </div>
      </aside>
    </>
  );
};
