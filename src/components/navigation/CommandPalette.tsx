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
  const [categoriaAtiva, setCategoriaAtiva] = useState<'Todas' | 'Ações Rápidas' | 'Sistemas'>('Todas');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setBusca('');
      setCategoriaAtiva('Todas');
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
      action: () => onNavigate('hub'),
      badge: 'Core'
    },
    {
      id: 'modulo-frota',
      titulo: 'Ir para Gestão de Frotas & Veículos',
      subtitulo: 'Painel completo da frota e disponibilidade',
      categoria: 'Sistemas',
      icon: Car,
      action: () => onNavigate('frota'),
      badge: 'Módulo'
    },
    {
      id: 'modulo-chamados',
      titulo: 'Ir para Chamados Rápidos (Kanban)',
      subtitulo: 'Quadro interativo estilo Jira com controle de SLA',
      categoria: 'Sistemas',
      icon: Wrench,
      action: () => onNavigate('chamados'),
      badge: 'Módulo'
    },
    {
      id: 'modulo-salas',
      titulo: 'Ir para Reserva de Salas & Recursos',
      subtitulo: 'Régua horizontal 24h anti-choque',
      categoria: 'Sistemas',
      icon: Calendar,
      action: () => onNavigate('salas'),
      badge: 'Módulo'
    },
    {
      id: 'modulo-diarias',
      titulo: 'Ir para Diárias & Adiantamentos',
      subtitulo: 'Mapa interativo do Paraná e tabela do Decreto',
      categoria: 'Sistemas',
      icon: Plane,
      action: () => onNavigate('diarias'),
      badge: 'Módulo'
    },
    {
      id: 'modulo-ramais',
      titulo: 'Ir para Guia de Ramais & Organograma',
      subtitulo: 'Lista telefônica e estrutura hierárquica SEJU',
      categoria: 'Sistemas',
      icon: PhoneCall,
      action: () => onNavigate('ramais'),
      badge: 'Módulo'
    },
    {
      id: 'trilha-auditoria',
      titulo: 'Inspecionar Trilha Criptográfica SHA-256',
      subtitulo: 'Log imutável de todas as aprovações e assinaturas',
      categoria: 'Sistemas',
      icon: ShieldCheck,
      action: () => onNavigate('auditoria'),
      badge: 'SHA-256'
    }
  ];

  const filtrados = comandos.filter(c => {
    const matchCat = categoriaAtiva === 'Todas' || c.categoria === categoriaAtiva;
    const matchBusca =
      c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      c.subtitulo.toLowerCase().includes(busca.toLowerCase()) ||
      c.categoria.toLowerCase().includes(busca.toLowerCase()) ||
      (c.badge && c.badge.toLowerCase().includes(busca.toLowerCase()));
    return matchCat && matchBusca;
  });

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
      className="fixed inset-0 bg-slate-950/55 backdrop-blur-md z-50 flex items-start justify-center pt-8 sm:pt-20 p-3 sm:p-4 font-sans animate-in fade-in duration-150 pt-safe"
      onClick={onClose}
    >
      {/* Moldura Externa Dupla com Brilho Especular Sutil (Acabamento Raycast / Linear Pro) */}
      <div
        className="relative max-w-2xl w-full p-[1.5px] rounded-[22px] bg-gradient-to-b from-white/50 via-slate-300/40 to-slate-400/30 shadow-[0_32px_80px_-16px_rgba(15,23,42,0.48),0_0_0_1px_rgba(15,23,42,0.12),0_0_48px_-12px_rgba(0,114,187,0.22)] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white/96 backdrop-blur-2xl rounded-[20px] w-full max-h-[82vh] flex flex-col overflow-hidden border border-white/90 shadow-[inset_0_1px_0_0_#ffffff]">
          
          {/* Fio Luminoso Institucional no Topo do Spotlight */}
          <div className="h-[2.5px] w-full bg-gradient-to-r from-[#0072BB] via-[#009B54] to-[#C59B27]" />

          {/* Barra Superior de Busca estilo Raycast / Linear Pro */}
          <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-white to-slate-100 border border-slate-200/90 flex items-center justify-center text-[#0072BB] shrink-0 shadow-[0_2px_4px_rgba(15,23,42,0.06),inset_0_1px_0_0_#ffffff]">
                <Search size={17} strokeWidth={2.3} />
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
                placeholder="Digite um comando, veículo, módulo, sala ou CPF..."
                className="w-full text-sm sm:text-[15px] text-slate-900 placeholder:text-slate-400 font-semibold bg-transparent outline-hidden tracking-tight"
              />

              {busca && (
                <button
                  type="button"
                  onClick={() => {
                    setBusca('');
                    setSelectedIndex(0);
                    inputRef.current?.focus();
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 transition cursor-pointer shrink-0"
                >
                  Limpar
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 rounded-lg bg-gradient-to-b from-white to-slate-100 hover:from-slate-50 hover:to-slate-200/80 border border-slate-300/90 text-slate-600 hover:text-slate-900 text-[10px] font-mono font-extrabold tracking-tight shadow-[0_2px_0_0_#cbd5e1] active:translate-y-[1px] active:shadow-[0_1px_0_0_#cbd5e1] transition-all cursor-pointer shrink-0 flex items-center gap-1"
                title="Fechar Spotlight (ESC)"
              >
                <span>ESC</span>
                <X size={11} className="sm:hidden" />
              </button>
            </div>

            {/* Pílulas de Escopo & Contagem Rápida */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/60">
              <div className="flex items-center gap-1.5">
                {(['Todas', 'Ações Rápidas', 'Sistemas'] as const).map((cat) => {
                  const active = categoriaAtiva === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategoriaAtiva(cat);
                        setSelectedIndex(0);
                        inputRef.current?.focus();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight transition-all cursor-pointer border ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.2)]'
                          : 'bg-white/80 text-slate-500 border-slate-200/80 hover:text-slate-800 hover:bg-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] font-mono font-semibold text-slate-400">
                {filtrados.length} {filtrados.length === 1 ? 'comando disponível' : 'comandos disponíveis'}
              </span>
            </div>
          </div>

          {/* Lista de Resultados Categorizados */}
          <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2.5 space-y-1 scroll-smooth">
            {filtrados.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-white to-slate-100 border border-slate-200/80 shadow-xs flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Search size={19} />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Nenhum comando encontrado para "{busca}"
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Experimente buscar por frota, CENSE, diárias, auditório ou ramal.
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
                      <div className={`px-3 pt-2.5 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 select-none flex items-center gap-2 ${idx > 0 ? 'mt-2 border-t border-slate-100' : ''}`}>
                        <span>{item.categoria}</span>
                        <span className="flex-1 h-px bg-gradient-to-r from-slate-200/80 to-transparent" />
                      </div>
                    )}
                    <div
                      onClick={() => {
                        soundFX.playClick();
                        item.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group relative px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer border ${
                        isSelected 
                          ? 'bg-gradient-to-r from-[#0072BB]/[0.09] via-[#0072BB]/[0.04] to-transparent border-[#0072BB]/30 shadow-[0_2px_10px_-2px_rgba(0,114,187,0.12),inset_0_1px_0_0_rgba(255,255,255,0.8)]' 
                          : 'border-transparent hover:bg-slate-100/70'
                      }`}
                    >
                      {/* Indicador Lateral Luminoso + Cantoneiras Técnicas ao Focar */}
                      {isSelected && (
                        <>
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-[#0072BB] to-[#009B54] shadow-[0_0_8px_rgba(0,114,187,0.65)]"
                          />
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute top-1 right-1 w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-[#0072BB]/45 rounded-tr-sm"
                          />
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute bottom-1 right-1 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#0072BB]/45 rounded-br-sm"
                          />
                        </>
                      )}

                      <div className="flex items-center gap-3 min-w-0 pl-0.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                          isSelected 
                            ? 'bg-gradient-to-br from-[#0072BB] to-[#004C80] text-white shadow-[0_4px_10px_-2px_rgba(0,114,187,0.4),inset_0_1px_0_0_rgba(255,255,255,0.35)] scale-[1.03]' 
                            : 'bg-gradient-to-b from-white to-slate-100 text-slate-600 border border-slate-200/85 shadow-[inset_0_1px_0_0_#ffffff] group-hover:border-slate-300'
                        }`}>
                          <Icon size={17} strokeWidth={isSelected ? 2.2 : 1.9} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-[13px] font-semibold text-slate-900 leading-snug flex items-center gap-2 truncate">
                            <span className={isSelected ? 'text-[#004C80] font-extrabold' : 'font-bold text-slate-800'}>
                              {item.titulo}
                            </span>
                            {item.badge && (
                              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none shrink-0 ${
                                isSelected
                                  ? 'text-[#0072BB] bg-white border-[#0072BB]/30 shadow-2xs'
                                  : 'text-slate-500 bg-slate-100/90 border-slate-200/80'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] mt-0.5 truncate ${isSelected ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                            {item.subtitulo}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected ? (
                          <kbd className="text-[10px] font-mono font-extrabold text-[#0072BB] flex items-center gap-1 bg-gradient-to-b from-white to-slate-50 px-2 py-0.5 rounded-md border border-[#0072BB]/30 shadow-[0_2px_0_0_#cbd5e1]">
                            <span>Executar</span>
                            <CornerDownLeft size={10} strokeWidth={2.5} />
                          </kbd>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">
                            Selecionar
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

          {/* Rodapé Técnico de Comandos com Teclas kbd Esculpidas em 3D */}
          <div className="px-4 py-2.5 bg-gradient-to-b from-slate-50/95 to-slate-100/90 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-medium select-none">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1">
                  <kbd className="bg-gradient-to-b from-white to-slate-50 border border-slate-300/90 text-slate-700 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-[0_2px_0_0_#cbd5e1]">
                    ↑
                  </kbd>
                  <kbd className="bg-gradient-to-b from-white to-slate-50 border border-slate-300/90 text-slate-700 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-[0_2px_0_0_#cbd5e1]">
                    ↓
                  </kbd>
                </span>
                <span className="text-slate-600 font-semibold text-[10px]">Navegar</span>
              </span>

              <span className="w-px h-3.5 bg-slate-300/80" />

              <span className="flex items-center gap-1.5">
                <kbd className="bg-gradient-to-b from-white to-slate-50 border border-slate-300/90 text-slate-700 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-[0_2px_0_0_#cbd5e1] flex items-center gap-1">
                  <CornerDownLeft size={9} strokeWidth={2.4} /> Enter
                </kbd>
                <span className="text-slate-600 font-semibold text-[10px]">Abrir</span>
              </span>

              <span className="hidden sm:inline-block w-px h-3.5 bg-slate-300/80" />

              <span className="hidden sm:flex items-center gap-1.5">
                <kbd className="bg-gradient-to-b from-white to-slate-50 border border-slate-300/90 text-slate-700 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold shadow-[0_2px_0_0_#cbd5e1]">
                  ESC
                </kbd>
                <span className="text-slate-600 font-semibold text-[10px]">Sair</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#009B54] shadow-[0_0_6px_#009B54]" />
              <Command size={11} className="text-[#0072BB]" />
              <span className="tracking-tight">SEJU · SPOTLIGHT PR</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
