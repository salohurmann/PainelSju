import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Car, 
  Wrench, 
  Calendar, 
  Plane, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight,
  Sparkles, 
  Command, 
  CornerDownLeft,
  X,
  PlusCircle,
  CheckSquare,
  Users,
  LayoutGrid,
  MapPin,
  FileText
} from 'lucide-react';
import { soundFX } from '../../services/soundFx';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (appId: 'hub' | 'frota' | 'chamados' | 'salas' | 'diarias' | 'ramais' | 'auditoria', subTab?: string) => void;
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
      subtitulo: 'Deliberação de viagens em 1 clique com SHA-256',
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
      id: 'mapa-parana',
      titulo: 'Mapa Interativo de Rotas do Paraná',
      subtitulo: 'Calcular rotas de Curitiba a Londrina, Maringá, Foz e Cascavel',
      categoria: 'Ações Rápidas',
      icon: MapPin,
      action: () => onNavigate('diarias'),
      badge: 'Mapa PR'
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
    c.categoria.toLowerCase().includes(busca.toLowerCase())
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
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-start justify-center pt-8 sm:pt-28 p-3 sm:p-4 font-sans animate-in fade-in duration-150 pt-safe"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Barra de Entrada de Pesquisa */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center gap-3">
          <Search size={22} className="text-[#0072BB] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={busca}
            onChange={e => {
              setBusca(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            placeholder="Buscar serviço, carro, sala ou chamado..."
            className="w-full text-base sm:text-base text-slate-800 placeholder:text-slate-400 font-medium outline-hidden"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
            title="Fechar busca (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de Resultados Categorizados */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {filtrados.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhuma ação encontrada para "{busca}". Tente outra busca.
            </div>
          ) : (
            filtrados.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundFX.playClick();
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-2xl flex items-center justify-between transition cursor-pointer ${
                    isSelected ? 'bg-blue-50/80 border border-blue-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow-2xs ${
                      isSelected ? 'bg-[#0072BB] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight flex items-center gap-2">
                        <span>{item.titulo}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold text-[#0072BB] bg-blue-100/70 px-2 py-0.2 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-normal">
                        {item.subtitulo}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="text-[10px] font-mono font-bold text-[#0072BB] flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                        Enter <CornerDownLeft size={10} />
                      </span>
                    )}
                    <ChevronRight size={16} className={`transition ${isSelected ? 'text-[#0072BB] translate-x-0.5' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé do Command Palette */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium px-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs text-[10px]">↑</kbd>
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs text-[10px]">↓</kbd>
              Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs text-[10px]">Enter</kbd>
              Executar
            </span>
          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            SEJU · Paraná Governo Digital
          </div>
        </div>

      </div>
    </div>
  );
};
