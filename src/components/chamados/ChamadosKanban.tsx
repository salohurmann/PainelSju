import React, { useState, useEffect } from 'react';
import { Usuario } from '../../types';
import confetti from 'canvas-confetti';
import { soundFX } from '../../services/soundFx';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle2, 
  User, 
  Flame, 
  GripVertical,
  Sparkles,
  Check,
  Search,
  MessageSquare,
  Send,
  X,
  FileText,
  ArrowLeft,
  SlidersHorizontal,
  ShieldCheck,
  ArrowUpRight,
  RotateCcw
} from 'lucide-react';

export interface NotaChamado {
  id: string;
  autor: string;
  texto: string;
  dataHora: string;
}

export interface Chamado {
  id: string;
  codigo: string;
  tipo: 'TI' | 'Manutenção' | 'Almoxarifado';
  titulo: string;
  descricao: string;
  solicitante: string;
  setor: string;
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa';
  status: 'a_fazer' | 'em_andamento' | 'concluido';
  tecnico?: string;
  slaSegundosRestantes: number;
  abertoEm: string;
  notas?: NotaChamado[];
  solucao?: string;
}

const CHAMADOS_INICIAIS: Chamado[] = [
  {
    id: 'ch-1',
    codigo: 'TI-2026-441',
    tipo: 'TI',
    titulo: 'Troca de toner da impressora do Gabinete',
    descricao: 'A impressora laser HP da recepção do gabinete está indicando toner preto esgotado.',
    solicitante: 'Dra. Maria Helena',
    setor: 'Chefia de Gabinete',
    prioridade: 'urgente',
    status: 'a_fazer',
    slaSegundosRestantes: 2700, // 45 min
    abertoEm: '15/10/2026 09:15',
    notas: [
      {
        id: 'n-1',
        autor: 'Helpdesk SEJU',
        texto: 'Chamado recebido e triado para reposição emergencial.',
        dataHora: '15/10/2026 09:20'
      }
    ]
  },
  {
    id: 'ch-2',
    codigo: 'MANUT-2026-102',
    tipo: 'Manutenção',
    titulo: 'Reparo de ar-condicionado na sala 204',
    descricao: 'Aparelho fazendo ruído anormal e não resfriando adequadamente.',
    solicitante: 'Fernando Dias',
    setor: 'Recursos Humanos',
    prioridade: 'media',
    status: 'a_fazer',
    slaSegundosRestantes: 10800, // 3h
    abertoEm: '15/10/2026 09:40',
    notas: []
  },
  {
    id: 'ch-3',
    codigo: 'TI-2026-439',
    tipo: 'TI',
    titulo: 'Instalação de certificado digital e VPN Gov.PR',
    descricao: 'Configuração da VPN institucional para trabalho remoto de auditoria externa.',
    solicitante: 'Eduardo Ramos',
    setor: 'Assessoria de Planejamento',
    prioridade: 'alta',
    status: 'em_andamento',
    tecnico: 'Rodrigo Mendonça (TI)',
    slaSegundosRestantes: 5400, // 1h30
    abertoEm: '15/10/2026 08:30',
    notas: [
      {
        id: 'n-2',
        autor: 'Rodrigo Mendonça',
        texto: 'Acesso remoto concedido via AnyDesk institucional. Instalando cadeia v5.',
        dataHora: '15/10/2026 09:05'
      }
    ]
  },
  {
    id: 'ch-4',
    codigo: 'ALMOX-2026-088',
    tipo: 'Almoxarifado',
    titulo: 'Reposição de resmas de papel A4 e pastas',
    descricao: 'Suprimento semanal para o protocolo e arquivo geral.',
    solicitante: 'Juliana Costa',
    setor: 'Protocolo Geral',
    prioridade: 'baixa',
    status: 'concluido',
    tecnico: 'Almoxarifado Central',
    slaSegundosRestantes: 0,
    abertoEm: '14/10/2026 14:00',
    solucao: 'Entregues 10 caixas de papel A4 e 50 pastas suspensas com recibo assinado.',
    notas: [
      {
        id: 'n-3',
        autor: 'Almoxarifado Central',
        texto: 'Separado no estoque térreo.',
        dataHora: '14/10/2026 14:30'
      },
      {
        id: 'n-4',
        autor: 'Almoxarifado Central',
        texto: 'Material entregue no protocolo às 15:15.',
        dataHora: '14/10/2026 15:15'
      }
    ]
  }
];

interface ChamadosKanbanProps {
  currentUser: Usuario;
  onVoltarHub: () => void;
}

export const ChamadosKanban: React.FC<ChamadosKanbanProps> = ({ currentUser, onVoltarHub }) => {
  const [chamados, setChamados] = useState<Chamado[]>(CHAMADOS_INICIAIS);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todas');
  const [buscaChamado, setBuscaChamado] = useState('');
  const [colunaAtivaMobile, setColunaAtivaMobile] = useState<'a_fazer' | 'em_andamento' | 'concluido'>('a_fazer');
  const [dragOverCol, setDragOverCol] = useState<'a_fazer' | 'em_andamento' | 'concluido' | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);

  // Drawer de Inspeção do Chamado Selecionado
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [novaNota, setNovaNota] = useState('');

  // Modal Novo Chamado
  const [modalNovo, setModalNovo] = useState(false);
  const [tipo, setTipo] = useState<'TI' | 'Manutenção' | 'Almoxarifado'>('TI');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<'urgente' | 'alta' | 'media' | 'baixa'>('alta');

  // Cronômetro em tempo real do SLA (reduz a cada segundo para efeito vivo!)
  useEffect(() => {
    const timer = setInterval(() => {
      setChamados(prev => prev.map(c => {
        if (c.status !== 'concluido' && c.slaSegundosRestantes > 0) {
          return { ...c, slaSegundosRestantes: c.slaSegundosRestantes - 1 };
        }
        return c;
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatarSLA = (segundos: number) => {
    if (segundos <= 0) return 'SLA Expirado';
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const moverStatus = (id: string, novoStatus: 'a_fazer' | 'em_andamento' | 'concluido') => {
    setChamados(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: novoStatus,
          tecnico: novoStatus === 'em_andamento' && !c.tecnico ? `${currentUser.nome} (Atribuído)` : c.tecnico
        };
      }
      return c;
    }));

    if (novoStatus === 'concluido') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggingCardId(id);
  };

  const handleDragOver = (e: React.DragEvent, col: 'a_fazer' | 'em_andamento' | 'concluido') => {
    e.preventDefault();
    if (dragOverCol !== col) {
      setDragOverCol(col);
    }
  };

  const handleDrop = (e: React.DragEvent, col: 'a_fazer' | 'em_andamento' | 'concluido') => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggingCardId;
    if (id) {
      moverStatus(id, col);
    }
    setDragOverCol(null);
    setDraggingCardId(null);
  };

  const handleCriarChamado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !descricao) return;

    const novo: Chamado = {
      id: 'ch-' + Date.now(),
      codigo: `${tipo === 'TI' ? 'TI' : tipo === 'Manutenção' ? 'MANUT' : 'ALMOX'}-2026-${Math.floor(100 + Math.random() * 900)}`,
      tipo,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      solicitante: currentUser.nome,
      setor: currentUser.setor,
      prioridade,
      status: 'a_fazer',
      slaSegundosRestantes: prioridade === 'urgente' ? 3600 : prioridade === 'alta' ? 7200 : 14400,
      abertoEm: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    };

    setChamados([novo, ...chamados]);
    setModalNovo(false);
    setTitulo('');
    setDescricao('');

    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.8 }
    });
  };

  const handleAdicionarNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaNota.trim() || !chamadoSelecionado) return;
    const notaObj: NotaChamado = {
      id: 'n-' + Date.now(),
      autor: currentUser.nome,
      texto: novaNota.trim(),
      dataHora: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    };
    const atualizado: Chamado = {
      ...chamadoSelecionado,
      notas: [...(chamadoSelecionado.notas || []), notaObj]
    };
    setChamados(prev => prev.map(c => c.id === atualizado.id ? atualizado : c));
    setChamadoSelecionado(atualizado);
    setNovaNota('');
    soundFX.playClick();
  };

  const handleAtribuirTecnico = (tecnicoNome: string) => {
    if (!chamadoSelecionado) return;
    const atualizado: Chamado = {
      ...chamadoSelecionado,
      tecnico: tecnicoNome,
      status: chamadoSelecionado.status === 'a_fazer' ? 'em_andamento' : chamadoSelecionado.status
    };
    setChamados(prev => prev.map(c => c.id === atualizado.id ? atualizado : c));
    setChamadoSelecionado(atualizado);
    soundFX.playClick();
  };

  const chamadosFiltrados = chamados.filter(c => {
    const matchTipo = filtroTipo === 'todos' || c.tipo === filtroTipo;
    const matchPrioridade = filtroPrioridade === 'todas' || c.prioridade === filtroPrioridade;
    const q = buscaChamado.toLowerCase();
    const matchBusca = !q || 
      c.codigo.toLowerCase().includes(q) || 
      c.titulo.toLowerCase().includes(q) || 
      c.solicitante.toLowerCase().includes(q) || 
      c.descricao.toLowerCase().includes(q) ||
      (c.tecnico && c.tecnico.toLowerCase().includes(q));
    return matchTipo && matchPrioridade && matchBusca;
  });

  const totalChamados = chamados.length;
  const totalUrgentes = chamados.filter(c => c.prioridade === 'urgente' && c.status !== 'concluido').length;
  const totalEmAndamento = chamados.filter(c => c.status === 'em_andamento').length;
  const totalConcluidos = chamados.filter(c => c.status === 'concluido').length;

  const getPrioridadeStyle = (p: Chamado['prioridade']) => {
    switch (p) {
      case 'urgente':
        return {
          badge: 'bg-red-50 text-red-700 border-red-200/80',
          dot: 'bg-red-500 animate-pulse',
          label: 'Urgente'
        };
      case 'alta':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
          label: 'Alta'
        };
      case 'media':
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-500',
          label: 'Média'
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-600 border-slate-200/80',
          dot: 'bg-slate-400',
          label: 'Baixa'
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 font-sans">
      
      {/* =====================================================================
          SEÇÃO 1: TOP EXECUTIVE BAR & QUICK FILTERS
         ===================================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-5">
        {/* Linha Superior: Back Button + Título + KPI Pills + Botão Primário */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              onClick={onVoltarHub}
              className="mt-0.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition cursor-pointer shrink-0"
              title="Voltar à Central de Aplicativos"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Estrutura 2 · Suporte & Operações
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> SLA Ativo
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
                <Wrench size={20} className="text-slate-700" />
                Atendimento TI & Ordem de Serviço
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quadros operacionais com telemetria de SLA em tempo real, triagem por arraste e histórico técnico.
              </p>
            </div>
          </div>

          {/* KPI Pills Compactos + Primary Action */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-medium text-slate-500">Total</span>
              <span className="text-xs font-bold text-slate-900 font-mono">{totalChamados}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50/70 border border-red-200/70">
              <Flame size={13} className="text-red-600" />
              <span className="text-[11px] font-medium text-red-700">Urgentes</span>
              <span className="text-xs font-bold text-red-700 font-mono">{totalUrgentes}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span className="text-[11px] font-medium text-blue-700">Em Curso</span>
              <span className="text-xs font-bold text-blue-800 font-mono">{totalEmAndamento}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="text-[11px] font-medium text-emerald-700">Resolvidos</span>
              <span className="text-xs font-bold text-emerald-800 font-mono">{totalConcluidos}</span>
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                setModalNovo(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto sm:ml-1"
            >
              <Plus size={15} /> Novo Chamado
            </button>
          </div>
        </div>

        {/* Divisor Sutil & Barra de Filtros Rápidos */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Busca Rápida */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={buscaChamado}
              onChange={e => setBuscaChamado(e.target.value)}
              placeholder="Buscar por código, título, solicitante ou especialista..."
              className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition text-slate-800 placeholder:text-slate-400"
            />
            {buscaChamado && (
              <button
                onClick={() => setBuscaChamado('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Pílulas de Categoria + Prioridade + SLA Status */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'TI', label: 'TI & Redes' },
                { id: 'Manutenção', label: 'Manutenção' },
                { id: 'Almoxarifado', label: 'Almoxarifado' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    soundFX.playClick();
                    setFiltroTipo(t.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] font-medium ${
                    filtroTipo === t.id
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
              {[
                { id: 'todas', label: 'Prioridade: Todas' },
                { id: 'urgente', label: 'Urgentes' },
                { id: 'alta', label: 'Altas' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    soundFX.playClick();
                    setFiltroPrioridade(p.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] font-medium ${
                    filtroPrioridade === p.id
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-500 pl-2 border-l border-slate-200">
              <SlidersHorizontal size={12} className="text-slate-400" />
              <span className="font-mono font-semibold text-slate-700">{chamadosFiltrados.length}</span>
              <span>exibidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SEÇÃO 2: MOBILE SEGMENTED SELECTOR + DESKTOP 3-COLUMN CLEAN KANBAN
         ===================================================================== */}
      
      {/* Seletor Segmentado Mobile */}
      <div className="md:hidden flex bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs gap-1 text-xs">
        {[
          { id: 'a_fazer' as const, label: 'Triagem', dot: 'bg-amber-500' },
          { id: 'em_andamento' as const, label: 'Em Curso', dot: 'bg-blue-600' },
          { id: 'concluido' as const, label: 'Concluídos', dot: 'bg-emerald-500' }
        ].map(col => {
          const count = chamadosFiltrados.filter(c => c.status === col.id).length;
          const active = colunaAtivaMobile === col.id;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => {
                soundFX.playClick();
                setColunaAtivaMobile(col.id);
              }}
              className={`flex-1 py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
              <span>{col.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quadro Kanban de 3 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* COLUNA 1: A FAZER / TRIAGEM */}
        <div
          onDragOver={(e) => handleDragOver(e, 'a_fazer')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleDrop(e, 'a_fazer')}
          className={`${colunaAtivaMobile === 'a_fazer' ? 'flex' : 'hidden md:flex'} rounded-2xl p-4 border transition-all duration-150 flex-col justify-between min-h-[480px] ${
            dragOverCol === 'a_fazer'
              ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-200/60'
              : 'bg-slate-50/70 border-slate-200/80'
          }`}
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1 pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Fila de Triagem
                </h3>
              </div>
              <span className="font-mono text-[11px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200/80 text-slate-600">
                {chamadosFiltrados.filter(c => c.status === 'a_fazer').length}
              </span>
            </div>

            <div className="space-y-3">
              {chamadosFiltrados.filter(c => c.status === 'a_fazer').map(c => {
                const prio = getPrioridadeStyle(c.prioridade);
                return (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    onDragEnd={() => setDraggingCardId(null)}
                    onClick={() => {
                      soundFX.playClick();
                      setChamadoSelecionado(c);
                    }}
                    className={`bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all space-y-3 cursor-pointer select-none group ${
                      draggingCardId === c.id ? 'opacity-40 scale-98' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical size={13} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {c.codigo}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/60">
                          {c.tipo}
                        </span>
                      </div>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${prio.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
                        {prio.label}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs sm:text-[13px] text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {c.titulo}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {c.descricao}
                      </p>
                    </div>

                    {/* Meta & SLA Bar */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="text-slate-500 truncate max-w-[140px]" title={`${c.solicitante} · ${c.setor}`}>
                        <span className="font-medium text-slate-700">{c.solicitante}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <Clock size={11} className="text-amber-600" />
                        {formatarSLA(c.slaSegundosRestantes)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFX.playClick();
                          setChamadoSelecionado(c);
                        }}
                        className="flex-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/80 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <FileText size={12} /> Inspecionar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFX.playClick();
                          moverStatus(c.id, 'em_andamento');
                        }}
                        className="flex-1 text-[11px] font-semibold text-slate-900 hover:text-white bg-white hover:bg-slate-900 py-1.5 rounded-lg border border-slate-300 hover:border-slate-900 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        Atender <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {chamadosFiltrados.filter(c => c.status === 'a_fazer').length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  Nenhum chamado aguardando triagem.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA 2: EM ATENDIMENTO */}
        <div
          onDragOver={(e) => handleDragOver(e, 'em_andamento')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleDrop(e, 'em_andamento')}
          className={`${colunaAtivaMobile === 'em_andamento' ? 'flex' : 'hidden md:flex'} rounded-2xl p-4 border transition-all duration-150 flex-col justify-between min-h-[480px] ${
            dragOverCol === 'em_andamento'
              ? 'bg-blue-50/40 border-blue-400 ring-2 ring-blue-200/60'
              : 'bg-slate-50/70 border-slate-200/80'
          }`}
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1 pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Em Atendimento
                </h3>
              </div>
              <span className="font-mono text-[11px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200/80 text-slate-600">
                {chamadosFiltrados.filter(c => c.status === 'em_andamento').length}
              </span>
            </div>

            <div className="space-y-3">
              {chamadosFiltrados.filter(c => c.status === 'em_andamento').map(c => {
                const prio = getPrioridadeStyle(c.prioridade);
                return (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    onDragEnd={() => setDraggingCardId(null)}
                    onClick={() => {
                      soundFX.playClick();
                      setChamadoSelecionado(c);
                    }}
                    className={`bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all space-y-3 cursor-pointer select-none group ${
                      draggingCardId === c.id ? 'opacity-40 scale-98' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical size={13} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/60">
                          {c.codigo}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${prio.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
                        {prio.label}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs sm:text-[13px] text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {c.titulo}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {c.descricao}
                      </p>
                    </div>

                    {/* Especialista Responsável */}
                    <div className="px-2.5 py-2 bg-slate-50 rounded-lg border border-slate-200/70 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                        <User size={12} className="text-blue-600 shrink-0" />
                        <span className="truncate">{c.tecnico || 'Especialista Designado'}</span>
                      </div>
                      <span className="font-mono text-[10px] font-semibold text-blue-700 shrink-0 ml-2">
                        {formatarSLA(c.slaSegundosRestantes)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFX.playClick();
                          setChamadoSelecionado(c);
                        }}
                        className="flex-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/80 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={12} /> Notas ({c.notas?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moverStatus(c.id, 'concluido');
                        }}
                        className="flex-1 text-[11px] font-semibold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 py-1.5 rounded-lg border border-emerald-200 hover:border-emerald-600 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Concluir
                      </button>
                    </div>
                  </div>
                );
              })}

              {chamadosFiltrados.filter(c => c.status === 'em_andamento').length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  Arraste um chamado para iniciar o atendimento.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA 3: CONCLUÍDOS */}
        <div
          onDragOver={(e) => handleDragOver(e, 'concluido')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleDrop(e, 'concluido')}
          className={`${colunaAtivaMobile === 'concluido' ? 'flex' : 'hidden md:flex'} rounded-2xl p-4 border transition-all duration-150 flex-col justify-between min-h-[480px] ${
            dragOverCol === 'concluido'
              ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-200/60'
              : 'bg-slate-50/70 border-slate-200/80'
          }`}
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1 pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Concluídos
                </h3>
              </div>
              <span className="font-mono text-[11px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200/80 text-slate-600">
                {chamadosFiltrados.filter(c => c.status === 'concluido').length}
              </span>
            </div>

            <div className="space-y-3">
              {chamadosFiltrados.filter(c => c.status === 'concluido').map(c => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, c.id)}
                  onDragEnd={() => setDraggingCardId(null)}
                  onClick={() => {
                    soundFX.playClick();
                    setChamadoSelecionado(c);
                  }}
                  className={`bg-white/90 hover:bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer select-none group ${
                    draggingCardId === c.id ? 'opacity-40 scale-98' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {c.codigo}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={11} /> Resolvido
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-xs sm:text-[13px] text-slate-600 line-through leading-snug group-hover:text-slate-900 transition-colors">
                      {c.titulo}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {c.solucao || c.descricao}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-emerald-700 font-sans font-medium">
                      <ShieldCheck size={12} /> Dentro do SLA
                    </span>
                    <span>{c.abertoEm.split(' ')[0]}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFX.playClick();
                        setChamadoSelecionado(c);
                      }}
                      className="flex-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/80 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <FileText size={12} /> Relatório
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moverStatus(c.id, 'em_andamento');
                      }}
                      className="px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition cursor-pointer flex items-center gap-1"
                      title="Reabrir chamado"
                    >
                      <RotateCcw size={11} /> Reabrir
                    </button>
                  </div>
                </div>
              ))}

              {chamadosFiltrados.filter(c => c.status === 'concluido').length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  Nenhum chamado concluído neste filtro.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* =====================================================================
          SEÇÃO 3: CLEAN MODAL FOR NEW TICKET & DRAWER DE INSPEÇÃO
         ===================================================================== */}
      {modalNovo && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200/80 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Ordem de Serviço Interna
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Abrir Novo Chamado Técnico
                </h3>
              </div>
              <button
                onClick={() => setModalNovo(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Atalhos de Preenchimento Rápido */}
            <div className="py-3.5 border-b border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Modelos Rápidos (1 Clique):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    icon: '🖨️',
                    label: 'Toner de Impressora',
                    tipo: 'TI',
                    prioridade: 'media',
                    titulo: 'Troca de toner da impressora HP',
                    desc: 'A impressora do setor está acusando nível de toner esgotado ou impressão falhada. Solicita-se substituição do cartucho preto.'
                  },
                  {
                    icon: '🌐',
                    label: 'Queda de Link / VPN PR',
                    tipo: 'TI',
                    prioridade: 'urgente',
                    titulo: 'Queda de conexão de rede e acesso à intranet',
                    desc: 'Estação de trabalho sem conectividade com a rede corporativa do Estado e falha de handshake da VPN Celepar.'
                  },
                  {
                    icon: '❄️',
                    label: 'Climatização / Ar',
                    tipo: 'Manutenção',
                    prioridade: 'alta',
                    titulo: 'Falha ou gotejamento no ar-condicionado',
                    desc: 'Aparelho de ar-condicionado da sala está gotejando e não climatiza adequadamente o ambiente de trabalho.'
                  },
                  {
                    icon: '📦',
                    label: 'Insumos & Papel A4',
                    tipo: 'Almoxarifado',
                    prioridade: 'baixa',
                    titulo: 'Reposição de resmas de papel sulfite A4',
                    desc: 'Almoxarifado do setor com estoque zerado de papel sulfite A4 timbrado para processos e expedientes.'
                  }
                ].map((diag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setTipo(diag.tipo as Chamado['tipo']);
                      setPrioridade(diag.prioridade as Chamado['prioridade']);
                      setTitulo(diag.titulo);
                      setDescricao(diag.desc);
                    }}
                    className="p-2.5 bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left transition cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-sm shrink-0">{diag.icon}</span>
                    <span className="text-[11px] font-medium text-slate-700 leading-tight">
                      {diag.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCriarChamado} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Categoria de Suporte</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as Chamado['tipo'])}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-slate-400"
                  >
                    <option value="TI">Suporte de TI & Redes</option>
                    <option value="Manutenção">Manutenção Predial</option>
                    <option value="Almoxarifado">Almoxarifado & Insumos</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Nível de Prioridade</label>
                  <select
                    value={prioridade}
                    onChange={e => setPrioridade(e.target.value as Chamado['prioridade'])}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-slate-400"
                  >
                    <option value="urgente">Urgente (SLA 1h)</option>
                    <option value="alta">Alta (SLA 2h)</option>
                    <option value="media">Média (SLA 4h)</option>
                    <option value="baixa">Baixa (SLA 8h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Assunto Principal *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Configuração de estação de trabalho, reparo de impressora..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Especificação Técnica / Localização *</label>
                <textarea
                  required
                  rows={3}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Informe o andar, sala, patrimônio do equipamento ou detalhes do ocorrido..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-slate-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200/90 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Registrar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer Lateral de Inspeção do Chamado */}
      {chamadoSelecionado && (
        <div
          className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-end backdrop-blur-xs animate-in fade-in"
          onClick={() => setChamadoSelecionado(null)}
        >
          <div
            className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-slate-200/80 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-5">
              {/* Cabeçalho do Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                    {chamadoSelecionado.codigo}
                  </span>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${getPrioridadeStyle(chamadoSelecionado.prioridade).badge}`}>
                    {getPrioridadeStyle(chamadoSelecionado.prioridade).label}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-full">
                    {chamadoSelecionado.tipo}
                  </span>
                </div>

                <button
                  onClick={() => setChamadoSelecionado(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Título e Descrição */}
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {chamadoSelecionado.titulo}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                  {chamadoSelecionado.descricao}
                </p>
              </div>

              {/* Metadados do Solicitante */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3.5 bg-white rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Solicitante</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{chamadoSelecionado.solicitante}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Unidade / Setor</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{chamadoSelecionado.setor}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Abertura</div>
                  <div className="font-mono text-[11px] text-slate-600 mt-0.5">{chamadoSelecionado.abertoEm}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Etapa Atual</div>
                  <div className="font-semibold capitalize mt-0.5 text-slate-900">
                    {chamadoSelecionado.status.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Designação de Especialista */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User size={13} className="text-slate-500" /> Especialista Responsável
                </label>
                <select
                  value={chamadoSelecionado.tecnico || ''}
                  onChange={(e) => handleAtribuirTecnico(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-800 outline-hidden focus:bg-white focus:border-slate-400"
                >
                  <option value="">-- Aguardando designação --</option>
                  <option value="Rodrigo Mendonça (TI / Redes)">Rodrigo Mendonça (TI / Redes)</option>
                  <option value="Patrícia Lima (Sistemas & Web)">Patrícia Lima (Sistemas & Web)</option>
                  <option value="Lucas Silveira (Hardware & Impressoras)">Lucas Silveira (Hardware & Impressoras)</option>
                  <option value="Almoxarifado Central">Almoxarifado Central</option>
                  <option value="Manutenção Predial">Manutenção Predial</option>
                </select>
              </div>

              {/* Barra de Progresso SLA */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-500" /> Telemetria de SLA
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatarSLA(chamadoSelecionado.slaSegundosRestantes)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      chamadoSelecionado.slaSegundosRestantes > 3600 ? 'bg-emerald-500' :
                      chamadoSelecionado.slaSegundosRestantes > 1200 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (chamadoSelecionado.slaSegundosRestantes / 7200) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Histórico de Notas Técnicas */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-slate-500" /> Diário de Bordo & Notas
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {chamadoSelecionado.notas?.length || 0} registros
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(!chamadoSelecionado.notas || chamadoSelecionado.notas.length === 0) ? (
                    <div className="text-center p-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                      Nenhuma anotação técnica registrada.
                    </div>
                  ) : (
                    chamadoSelecionado.notas.map(n => (
                      <div key={n.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-slate-800">{n.autor}</span>
                          <span className="font-mono text-slate-400">{n.dataHora}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{n.texto}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAdicionarNota} className="flex gap-2">
                  <input
                    type="text"
                    value={novaNota}
                    onChange={e => setNovaNota(e.target.value)}
                    placeholder="Registrar evolução técnica ou parecer..."
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs outline-hidden focus:bg-white focus:border-slate-400"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Send size={13} />
                  </button>
                </form>
              </div>
            </div>

            {/* Rodapé do Drawer */}
            <div className="pt-4 border-t border-slate-100 mt-4">
              {chamadoSelecionado.status !== 'concluido' ? (
                <button
                  onClick={() => {
                    moverStatus(chamadoSelecionado.id, 'concluido');
                    setChamadoSelecionado({ ...chamadoSelecionado, status: 'concluido' });
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <CheckCircle2 size={15} /> Concluir Chamado e Arquivar OS
                </button>
              ) : (
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                  <CheckCircle2 size={15} /> Ordem de Serviço Finalizada
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
