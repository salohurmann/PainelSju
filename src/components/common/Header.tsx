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
  PhoneCall,
  ExternalLink,
  PlusCircle,
  CheckSquare
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
  pendentesFrotaCount = 0,
  veiculosLivresCount = 0
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [buscaGlobal, setBuscaGlobal] = useState('');

  const unreadCount = notificacoes.filter(n => !n.lida).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = buscaGlobal.toLowerCase();
    if (q.includes('carro') || q.includes('frota') || q.includes('veículo') || q.includes('viagem')) {
      onNavigateApp('frota');
    } else if (q.includes('chamado') || q.includes('ti') || q.includes('suporte') || q.includes('mouse') || q.includes('computador')) {
      onNavigateApp('chamados');
    } else if (q.includes('sala') || q.includes('auditório') || q.includes('reunião')) {
      onNavigateApp('salas');
    } else if (q.includes('diária') || q.includes('adiantamento') || q.includes('reembolso')) {
      onNavigateApp('diarias');
    } else if (q.includes('ramal') || q.includes('telefone') || q.includes('contato')) {
      onNavigateApp('ramais');
    } else {
      onNavigateApp('hub');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm font-sans">
      {/* 1. BARRA DE ACESSIBILIDADE OFICIAL DO GOVERNO DO PARANÁ (35px) */}
      <div className="bg-[#F7F7F7] border-b border-slate-200/90 text-xs text-slate-600 px-4 h-9 flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-extrabold tracking-wider text-[#0072BB]">
              ESTADO DO PARANÁ
            </span>
            <span className="text-slate-300">|</span>
            <span className="hidden sm:inline text-slate-500 font-medium">
              Secretaria da Justiça e Cidadania (SEJU)
            </span>
            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="hidden md:flex items-center gap-2 text-slate-500">
              <span className="hover:text-[#0072BB] cursor-pointer font-bold">A+</span>
              <span className="hover:text-[#0072BB] cursor-pointer font-bold">A-</span>
              <span className="text-slate-300">•</span>
              <span className="hover:text-[#0072BB] cursor-pointer">Contraste</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
            <a 
              href="https://www.transparencia.pr.gov.br" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#0072BB] flex items-center gap-1 transition"
            >
              <span>Portal da Transparência</span>
              <ExternalLink size={11} className="text-slate-400" />
            </a>
            <span className="text-slate-300">|</span>
            <a 
              href="https://www.pr.gov.br" 
              target="_blank" 
              rel="noreferrer" 
              className="font-bold text-[#009B54] hover:text-[#068833] transition"
            >
              Governo do Paraná
            </a>
          </div>
        </div>
      </div>

      {/* 2. BARRA NOBRE DE LOGOMARCA E IDENTIDADE INSTITUCIONAL (110px) */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brasão Oficial e Títulos Governamentais */}
          <div 
            onClick={() => onNavigateApp('hub')} 
            className="flex items-center gap-3 sm:gap-4 cursor-pointer select-none group"
          >
            <div className="shrink-0 p-1 bg-white rounded-xl border border-slate-200/80 shadow-xs group-hover:border-[#0072BB] transition-colors">
              <BrasaoParana size="md" className="group-hover:scale-105 transition-transform" />
            </div>

            <div className="border-l-2 border-slate-200 pl-3 sm:pl-4 space-y-0.5">
              <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#0072BB]">
                Governo do Estado do Paraná
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-[#0072BB] transition-colors">
                Secretaria da Justiça e Cidadania
              </h1>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 flex items-center gap-2">
                <span className="text-slate-700 font-bold">SEJU</span>
                <span className="text-slate-300">•</span>
                <span className="text-[#009B54] font-bold">Portal de Gestão Integrada</span>
              </div>
            </div>
          </div>

          {/* Barra de Busca Institucional + Perfil Conectado */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Barra de Busca rápida no estilo Spotlight (Ctrl + K) */}
            <div 
              onClick={() => onOpenCommandPalette ? onOpenCommandPalette() : undefined}
              className="relative hidden sm:flex items-center justify-between w-64 lg:w-72 px-3.5 py-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-300/90 rounded-xl cursor-pointer transition shadow-2xs group hover:border-[#0072BB]"
              title="Buscar serviço, carro, sala ou ramal (Ctrl+K)"
            >
              <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-800 text-xs">
                <Search size={14} className="text-slate-400 group-hover:text-[#0072BB] transition-colors" />
                <span className="font-medium text-slate-500 group-hover:text-slate-700">Busca rápida global...</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 shadow-2xs group-hover:text-[#0072BB] group-hover:border-blue-300 transition">
                <span>Ctrl</span>
                <span>K</span>
              </div>
            </div>

            {/* Botão de Busca Rápida Mobile */}
            <button
              onClick={() => onOpenCommandPalette ? onOpenCommandPalette() : undefined}
              className="sm:hidden p-2.5 rounded-xl text-slate-600 hover:text-[#0072BB] hover:bg-blue-50/80 transition cursor-pointer border border-slate-200 shadow-2xs"
              title="Busca rápida (Ctrl+K)"
            >
              <Search size={18} />
            </button>

            {/* Central de Notificações */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-[#0072BB] hover:bg-blue-50/80 transition cursor-pointer border border-slate-200 shadow-2xs"
                title="Notificações e E-mails Oficiais"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown de Notificações */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                      <Bell size={15} className="text-[#0072BB]" />
                      Mensagens & Notificações Brevo API
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {notificacoes.length} alertas
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notificacoes.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Nenhuma notificação recente.
                      </div>
                    ) : (
                      notificacoes.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-3.5 text-xs transition cursor-pointer hover:bg-blue-50/50 ${
                            !n.lida ? 'bg-blue-50/40 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5">
                              {n.tipo === 'aprovado' && <CheckCircle2 size={16} className="text-emerald-600" />}
                              {n.tipo === 'reprovado' && <AlertCircle size={16} className="text-red-600" />}
                              {n.tipo === 'nova_solicitacao' && <ShieldCheck size={16} className="text-blue-600" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{n.titulo}</span>
                                <span className="text-[10px] text-slate-400">{n.data}</span>
                              </div>
                              <p className="text-slate-600 mt-1 line-clamp-2 text-[11px]">{n.mensagem}</p>
                              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500">
                                <span>Para: {n.destinatario}</span>
                                {n.ticket && <span className="font-mono bg-slate-100 px-1 rounded">{n.ticket}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
                    Integrado ao serviço Brevo & WebPush Oficial do Estado
                  </div>
                </div>
              )}
            </div>

            {/* Chip de Identificação do Servidor (Estilo Oficial SEJU) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300/80 px-2.5 sm:px-3 py-1.5 rounded-xl transition text-left cursor-pointer shadow-2xs active:scale-95"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-[#0072BB] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {currentUser.nome.charAt(0)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                </div>

                <div className="hidden sm:block">
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">
                    {currentUser.nome.split(' ')[0]} {currentUser.nome.split(' ')[1] || ''}
                  </div>
                  <div className="text-[10px] font-bold text-[#0072BB] uppercase tracking-wider">
                    {currentUser.role === 'servidor' && '👤 Servidor'}
                    {currentUser.role === 'chefe_gabinete' && '👔 Chefe de Gabinete'}
                    {currentUser.role === 'gestor_frota' && '🚗 Gestor de Frotas'}
                    {currentUser.role === 'admin' && '🛡️ Administrador / TI'}
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Menu RBAC de Alternância de Perfil */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-72 max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 animate-in fade-in">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Simular Perfil de Acesso (RBAC)
                  </div>
                  <div className="space-y-1 mt-1">
                    {USUARIOS_MOCK.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between text-xs transition cursor-pointer ${
                          currentUser.id === u.id
                            ? 'bg-blue-50 text-[#0072BB] font-bold border border-blue-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{u.nome}</div>
                          <div className="text-[11px] text-slate-500">{u.cargo}</div>
                        </div>
                        {currentUser.id === u.id && (
                          <CheckCircle2 size={16} className="text-[#0072BB]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 3. BARRA DE MENU PRINCIPAL INSTITUCIONAL (#0072BB - AZUL PARANÁ) */}
      <nav className="bg-[#0072BB] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between overflow-x-auto no-scrollbar touch-pan-x">
          <div className="flex items-stretch h-11 shrink-0">
            {[
              { id: 'hub', label: 'Início · Hub', icon: LayoutGrid },
              { id: 'frota', label: 'Frota & Veículos', icon: Car, badge: pendentesFrotaCount },
              { id: 'chamados', label: 'Chamados TI', icon: Wrench },
              { id: 'salas', label: 'Reserva de Salas', icon: Calendar },
              { id: 'diarias', label: 'Diárias & Viagens', icon: Plane },
              { id: 'ramais', label: 'Guia de Ramais', icon: PhoneCall },
              { id: 'auditoria', label: 'Auditoria SHA-256', icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeApp === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigateApp(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-b-3 ${
                    isActive
                      ? 'bg-[#00538A] border-white text-white shadow-inner font-extrabold'
                      : 'border-transparent text-blue-100 hover:bg-[#005E9B] hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 4. BARRA DE DESTAQUES E SERVIÇOS (#009B54 - VERDE BANDEIRA DO PARANÁ) */}
      <div className="bg-[#009B54] text-white px-4 py-2 border-b border-emerald-700 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold tracking-wide">
            <span className="uppercase text-[11px] bg-white/20 px-2 py-0.5 rounded font-black">
              Serviços Rápidos
            </span>
            <span className="hidden md:inline text-white/90 font-medium">
              Acesso direto aos fluxos operacionais da pasta
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateApp('frota', 'nova-solicitacao')}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1 rounded-lg border border-white/25 transition cursor-pointer flex items-center gap-1.5 text-[11px]"
            >
              <PlusCircle size={13} /> Solicitar Veículo
            </button>

            <button
              onClick={() => onNavigateApp('frota', 'aprovacoes')}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1 rounded-lg border border-white/25 transition cursor-pointer flex items-center gap-1.5 text-[11px]"
            >
              <CheckSquare size={13} /> Fila Chefia {pendentesFrotaCount > 0 && `(${pendentesFrotaCount})`}
            </button>

            <button
              onClick={() => onNavigateApp('frota', 'checkin-checkout')}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1 rounded-lg border border-white/25 transition cursor-pointer flex items-center gap-1.5 text-[11px]"
            >
              <ShieldCheck size={13} /> Vistoria 4 Fotos
            </button>

            <button
              onClick={() => onNavigateApp('chamados')}
              className="bg-white/10 hover:bg-white/25 text-white/90 hover:text-white font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px]"
            >
              Abrir OS TI
            </button>

            <button
              onClick={() => onNavigateApp('salas')}
              className="bg-white/10 hover:bg-white/25 text-white/90 hover:text-white font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px]"
            >
              Auditório
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
