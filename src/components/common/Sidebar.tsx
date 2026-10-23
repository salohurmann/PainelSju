import React from 'react';
import { Usuario } from '../../types';
import { 
  Car, 
  Calendar, 
  Wrench, 
  Plane, 
  PhoneCall, 
  ShieldCheck, 
  PlusCircle, 
  CheckSquare, 
  ClipboardCheck, 
  Search, 
  LayoutDashboard,
  Layers
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard'
  | 'nova-solicitacao'
  | 'aprovacoes'
  | 'checkin-checkout'
  | 'frota'
  | 'consultar'
  | 'auditoria'
  | 'modulo-salas'
  | 'modulo-chamados'
  | 'modulo-diarias'
  | 'modulo-ramais';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: Usuario;
  pendentesCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  pendentesCount,
  isOpen,
  onClose
}) => {
  const isChefe = currentUser.role === 'chefe_gabinete' || currentUser.role === 'admin';
  const isTransporte = currentUser.role === 'gestor_frota' || currentUser.role === 'admin';

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden transition"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 lg:top-[97px] left-0 h-screen lg:h-[calc(100vh-97px)] 
        w-68 bg-white border-r border-gray-200 z-40 flex flex-col justify-between 
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 overflow-y-auto space-y-6">
          {/* Seção 1: Geral */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Principal
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { onSelectTab('dashboard'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#0072BB] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Painel Inicial & Mural</span>
              </button>
            </div>
          </div>

          {/* Seção 2: Módulo Piloto - Frota e Carros */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold text-[#0072BB] uppercase tracking-wider flex items-center gap-1.5">
                <Car size={14} /> Frota & Veículos
              </span>
              <span className="text-[9px] bg-blue-100 text-[#0072BB] font-extrabold px-1.5 py-0.5 rounded">
                PILOTO
              </span>
            </div>

            <div className="space-y-1">
              {/* Solicitar Carro (Acesso Universal) */}
              <button
                onClick={() => { onSelectTab('nova-solicitacao'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'nova-solicitacao'
                    ? 'bg-[#0072BB] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <PlusCircle size={18} />
                <span>Solicitar Veículo</span>
              </button>

              {/* Fila de Aprovação (Destaque para Chefia) */}
              <button
                onClick={() => { onSelectTab('aprovacoes'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'aprovacoes'
                    ? 'bg-[#0072BB] text-white shadow-xs'
                    : isChefe 
                    ? 'text-amber-900 bg-amber-50/60 hover:bg-amber-100/60' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckSquare size={18} className={isChefe && activeTab !== 'aprovacoes' ? 'text-amber-600' : ''} />
                  <span>Aprovações Chefia</span>
                </div>
                {pendentesCount > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'aprovacoes' 
                      ? 'bg-white text-[#0072BB]' 
                      : 'bg-amber-500 text-white'
                  }`}>
                    {pendentesCount}
                  </span>
                )}
              </button>

              {/* Check-in / Check-out (Transporte e Motoristas) */}
              <button
                onClick={() => { onSelectTab('checkin-checkout'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'checkin-checkout'
                    ? 'bg-[#0072BB] text-white shadow-xs'
                    : isTransporte
                    ? 'text-emerald-900 bg-emerald-50/60 hover:bg-emerald-100/60'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ClipboardCheck size={18} className={isTransporte && activeTab !== 'checkin-checkout' ? 'text-emerald-600' : ''} />
                <span>Vistoria & Chaves (Fotos)</span>
              </button>

              {/* Frota Ativa */}
              <button
                onClick={() => { onSelectTab('frota'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'frota'
                    ? 'bg-[#0072BB] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Car size={18} />
                <span>Painel da Frota</span>
              </button>

              {/* Consulta por CPF */}
              <button
                onClick={() => { onSelectTab('consultar'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'consultar'
                    ? 'bg-[#0072BB] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Search size={18} />
                <span>Consultar por CPF</span>
              </button>
            </div>
          </div>

          {/* Seção 3: Auditoria Criptográfica */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Segurança & Integridade
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { onSelectTab('auditoria'); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'auditoria'
                    ? 'bg-[#0072BB] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>Trilha SHA-256</span>
              </button>
            </div>
          </div>

          {/* Seção 4: Outros Módulos da Proposta (Roadmap Plug & Play) */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
              <Layers size={14} /> Módulos Corporativos
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { onSelectTab('modulo-salas'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition cursor-pointer ${
                  activeTab === 'modulo-salas'
                    ? 'bg-[#0072BB] text-white font-semibold'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar size={17} />
                  <span>Reserva de Salas</span>
                </div>
                <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                  Módulo 2
                </span>
              </button>

              <button
                onClick={() => { onSelectTab('modulo-chamados'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition cursor-pointer ${
                  activeTab === 'modulo-chamados'
                    ? 'bg-[#0072BB] text-white font-semibold'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench size={17} />
                  <span>Chamados & OS TI</span>
                </div>
                <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                  Módulo 3
                </span>
              </button>

              <button
                onClick={() => { onSelectTab('modulo-diarias'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition cursor-pointer ${
                  activeTab === 'modulo-diarias'
                    ? 'bg-[#0072BB] text-white font-semibold'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Plane size={17} />
                  <span>Diárias & Missões</span>
                </div>
                <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                  Módulo 4
                </span>
              </button>

              <button
                onClick={() => { onSelectTab('modulo-ramais'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition cursor-pointer ${
                  activeTab === 'modulo-ramais'
                    ? 'bg-[#0072BB] text-white font-semibold'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PhoneCall size={17} />
                  <span>Lista de Ramais</span>
                </div>
                <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                  Módulo 5
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé Interno da Sidebar */}
        <div className="p-3.5 border-t border-gray-200 bg-gray-50 text-[11px] text-gray-500">
          <div className="font-semibold text-gray-700">Central SEJU v2.5</div>
          <div>Ambiente Homologado</div>
        </div>
      </aside>
    </>
  );
};
