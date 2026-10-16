import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Car, 
  Wrench, 
  Calendar, 
  Plane, 
  PhoneCall, 
  ShieldCheck, 
  ChevronRight,
  Command, 
  CornerDownLeft,
  X,
  PlusCircle,
  CheckSquare,
  Users,
  LayoutGrid,
  MapPin,
  Building2
} from 'lucide-react';
import { soundFX } from '../../services/soundFx';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (appId: 'hub' | 'frota' | 'chamados' | 'salas' | 'diarias' | 'cense' | 'ramais' | 'auditoria', subTab?: string) => void;
}

interface CommandItem {
  id: string;
  titulo: string;
  subtitulo: string;
  categoria: 'Ações Rápidas' | 'Sistemas' | 'Frota' | 'Infraestrutura';
  icon: any;
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [busca, setBusca] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setBusca('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Tecla de atalho global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          soundFX.playClick();
          // Chamado pelo parent
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const comandos: CommandItem[] = [
    // Ações Rápidas
    {
      id: 'fundo-rotativo-cense',
      titulo: 'Gestão Fiscal de Fundo Rotativo (CENSE)',
      subtitulo: 'Cotas trimestrais, notas fiscais NF-e, glosas e prestação de contas DEASE',
      categoria: 'Ações Rápidas',
      icon: Building2,
      action: () => onNavigate('cense'),
      badge: 'CENSE'
    },
    {
      id: 'solicitar-carro',
      titulo: 'Solicitar Veículo Oficial',
      subtitulo: 'Abrir formulário guiado com bloqueio de datas',
      categoria: 'Ações Rápidas',
      icon: PlusCircle,
      action: () => onNavigate('frota', 'nova-solicitacao'),
      badge: 'Frota'
    },
    {
      id: 'fila-chefia',
      titulo: 'Aprovações da Chefia de Gabinete',
      subtitulo: 'Deliberação de viagens em 1 clique com segurança blindada',
      categoria: 'Ações Rápidas',
      icon: CheckSquare,
      action: () => onNavigate('frota', 'aprovacoes'),
      badge: 'Chefia'
    },
    {
      id: 'vistoria-fotos',
      titulo: 'Vistoria 360° com 4 Fotos',
      subtitulo: 'Check-in e check-out pericial do veículo',
      categoria: 'Ações Rápidas',
      icon: ShieldCheck,
      action: () => onNavigate('frota', 'checkin-checkout'),
      badge: 'Frota'
    },
    {
      id: 'frota-patio',
      titulo: 'Ver Pátio e Disponibilidade de Carros',
      subtitulo: 'Status de Duster, Corolla, Spin, Toro e Ranger',
      categoria: 'Ações Rápidas',
      icon: Car,
      action: () => onNavigate('frota', 'frota'),
      badge: 'Frota'
    },
    {
      id: 'frota-cpf',
      titulo: 'Consultar Solicitação por CPF do Servidor',
      subtitulo: 'Rastrear status de aprovação de viagens com CPF',
      categoria: 'Ações Rápidas',
      icon: Users,
      action: () => onNavigate('frota', 'consultar'),
      badge: 'Consulta'
    },
    {
      id: 'novo-chamado-ti',
      titulo: 'Abrir Chamado / Ordem de Serviço TI',
      subtitulo: 'Suporte para impressoras, VPN, rede e computadores',
      categoria: 'Ações Rápidas',
      icon: Wrench,
      action: () => onNavigate('chamados'),
      badge: 'TI'
    },
    {
      id: 'reservar-auditorio',
      titulo: 'Reservar Auditório Principal (120 lugares)',
      subtitulo: 'Agendamento de salas com bloqueio anti-colisão',
      categoria: 'Ações Rápidas',
      icon: Calendar,
      action: () => onNavigate('salas'),
      badge: 'Salas'
    },
    {
      id: 'calcular-diaria',
      titulo: 'Calcular Diária de Viagem (Interior PR)',
      subtitulo: 'Roteirizador de distâncias e formulário oficial',
      categoria: 'Ações Rápidas',
      icon: Plane,
      action: () => onNavigate('diarias'),
      badge: 'Viagens'
    },
    {
      id: 'mapa-parana',
      titulo: 'Mapa Interativo de Rotas do Paraná',
      subtitulo: 'Calcular rotas de Curitiba a Londrina, Maringá, Foz e Cascavel',
      categoria: 'Ações Rápidas',
      icon: MapPin,
      action: () => onNavigate('diarias'),
      badge: 'Mapa PR'
    },
    {
      id: 'buscar-ramal',
      titulo: 'Consultar Ramal Telefônico',
      subtitulo: 'Catálogo institucional com status de presença',
      categoria: 'Ações Rápidas',
      icon: PhoneCall,
      action: () => onNavigate('ramais'),
      badge: 'Contatos'
    },

    // Sistemas
    {
      id: 'inicio-hub',
      titulo: 'Início · Central de Aplicativos SEJU',
      subtitulo: 'Visão geral com os 5 módulos e métricas em tempo real',
      categoria: 'Sistemas',
      icon: LayoutGrid,
      action: () => onNavigate('hub')
    },
    {
      id: 'modulo-frota',
      titulo: 'Ir para Gestão de Frotas & Veículos',
      subtitulo: 'Painel completo da frota e disponibilidade',
      categoria: 'Sistemas',
      icon: Car,
      action: () => onNavigate('frota')
    },
    {
      id: 'modulo-chamados',
      titulo: 'Ir para Chamados Rápidos (Kanban)',
      subtitulo: 'Quadro interativo estilo Jira com controle de SLA',
      categoria: 'Sistemas',
      icon: Wrench,
      action: () => onNavigate('chamados')
    },
    {
      id: 'modulo-salas',
      titulo: 'Ir para Reserva de Salas & Recursos',
      subtitulo: 'Régua horizontal 24h anti-choque',
      categoria: 'Sistemas',
      icon: Calendar,
      action: () => onNavigate('salas')
    },
    {
      id: 'modulo-diarias',
      titulo: 'Ir para Diárias & Adiantamentos',
      subtitulo: 'Mapa interativo do Paraná e tabela do Decreto',
      categoria: 'Sistemas',
      icon: Plane,
      action: () => onNavigate('diarias')
    },
    {
      id: 'modulo-ramais',
      titulo: 'Ir para Guia de Ramais & Organograma',
      subtitulo: 'Lista telefônica e estrutura hierárquica SEJU',
      categoria: 'Sistemas',
      icon: PhoneCall,
      action: () => onNavigate('ramais')
    },
    {
      id: 'trilha-auditoria',
      titulo: 'Inspecionar Trilha Criptográfica SHA-256',
      subtitulo: 'Log imutável de todas as aprovações e assinaturas',
      categoria: 'Sistemas',
      icon: ShieldCheck,
      action: () => onNavigate('auditoria')
    }
  ];

  const filtrados = comandos.filter(c => 
    c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    c.subtitulo.toLowerCase().includes(busca.toLowerCase()) ||
    c.categoria.toLowerCase().includes(busca.toLowerCase()) ||
    (c.badge && c.badge.toLowerCase().includes(busca.toLowerCase()))
  );

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtrados.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtrados.length) % Math.max(1, filtrados.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtrados[selectedIndex]) {
        soundFX.playClick();
        filtrados[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/45 backdrop-blur-md z-50 flex items-start justify-center pt-10 sm:pt-24 p-3 sm:p-4 font-sans animate-in fade-in duration-150 pt-safe"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 backdrop-blur-2xl rounded-2xl max-w-2xl w-full max-h-[82vh] flex flex-col shadow-[0_24px_64px_-12px_rgba(15,23,42,0.32),0_0_0_1px_rgba(15,23,42,0.08)] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Barra Superior de Busca estilo Raycast / Spotlight */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-slate-200/75 flex items-center gap-3.5 bg-white/60">
          <div className="w-8 h-8 rounded-lg bg-slate-100/90 border border-slate-200/80 flex items-center justify-center text-[#0072BB] shrink-0 shadow-2xs">
            <Search size={17} strokeWidth={2.2} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={busca}
            onChange={e => {
              setBusca(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            placeholder="Buscar serviço, veículo, sala ou módulo..."
            className="w-full text-sm sm:text-[15px] text-slate-900 placeholder:text-slate-400 font-medium bg-transparent outline-hidden tracking-tight"
          />
          {busca && (
            <button
              type="button"
              onClick={() => {
                setBusca('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-100 transition cursor-pointer shrink-0"
            >
              Limpar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded-md bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-slate-500 hover:text-slate-800 text-[10px] font-mono font-semibold tracking-tight transition cursor-pointer shrink-0 flex items-center gap-1"
            title="Fechar busca (ESC)"
          >
            <span>ESC</span>
            <X size={12} className="sm:hidden" />
          </button>
        </div>

        {/* Lista de Resultados Categorizados */}
        <div ref={listRef} className="max-h-[390px] overflow-y-auto p-2 space-y-0.5 scroll-smooth">
          {filtrados.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center mx-auto mb-2.5 text-slate-400">
                <Search size={18} />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Nenhum comando encontrado para "{busca}"
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Experimente buscar por frota, diárias, auditório ou ramal.
              </p>
            </div>
          ) : (
            filtrados.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === idx;
              const showCategoryHeader = idx === 0 || filtrados[idx - 1].categoria !== item.categoria;

              return (
                <React.Fragment key={item.id}>
                  {showCategoryHeader && (
                    <div className={`px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 select-none flex items-center justify-between ${idx > 0 ? 'mt-1.5 border-t border-slate-100' : ''}`}>
                      <span>{item.categoria}</span>
                    </div>
                  )}
                  <div
                    onClick={() => {
                      soundFX.playClick();
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`group px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all duration-100 cursor-pointer ${
                      isSelected 
                        ? 'bg-[#0072BB]/[0.08] ring-1 ring-[#0072BB]/25 shadow-2xs' 
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        isSelected 
                          ? 'bg-[#0072BB] text-white shadow-xs' 
                          : 'bg-slate-100/90 text-slate-600 border border-slate-200/70 group-hover:bg-white'
                      }`}>
                        <Icon size={17} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-[13px] font-semibold text-slate-900 leading-snug flex items-center gap-2 truncate">
                          <span className={isSelected ? 'text-[#004C80] font-bold' : ''}>{item.titulo}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border leading-none shrink-0 ${
                              isSelected
                                ? 'text-[#0072BB] bg-white border-[#0072BB]/25'
                                : 'text-slate-600 bg-slate-100 border-slate-200/80'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {item.subtitulo}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <span className="text-[10px] font-mono font-semibold text-[#0072BB] flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[#0072BB]/25 shadow-2xs">
                          Abrir <CornerDownLeft size={10} />
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">
                          Ir para
                        </span>
                      )}
                      <ChevronRight size={15} className={`transition-transform duration-150 ${isSelected ? 'text-[#0072BB] translate-x-0.5' : 'text-slate-300'}`} />
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Rodapé Glassmórfico com Atalhos estilo Raycast */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-200/75 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3.5">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5">
                <kbd className="bg-white border border-slate-200/90 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono shadow-2xs">↑</kbd>
                <kbd className="bg-white border border-slate-200/90 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono shadow-2xs">↓</kbd>
              </span>
              <span className="text-slate-500">Navegar</span>
            </span>
            <span className="w-px h-3 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <kbd className="bg-white border border-slate-200/90 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono shadow-2xs flex items-center gap-0.5">
                <CornerDownLeft size={9} /> Enter
              </kbd>
              <span className="text-slate-500">Executar</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <Command size={11} className="text-slate-400" />
            <span>SEJU · Paraná Digital</span>
          </div>
        </div>

      </div>
    </div>
  );
};
