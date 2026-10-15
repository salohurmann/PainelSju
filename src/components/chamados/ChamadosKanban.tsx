import React, { useState, useEffect } from 'react';
import { Usuario } from '../../types';
import confetti from 'canvas-confetti';
import { soundFX } from '../../services/soundFx';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Tag, 
  Flame, 
  ShieldCheck, 
  ChevronRight, 
  Filter,
  Layers,
  ArrowRight,
  GripVertical,
  Sparkles,
  Check,
  Search,
  MessageSquare,
  Send,
  Printer,
  X,
  FileText
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Barra de Topo do Módulo Kanban */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <button onClick={onVoltarHub} className="hover:text-[#0072BB] font-semibold cursor-pointer">
              ← Central de Aplicativos
            </button>
            <span>/</span>
            <span className="font-bold text-slate-800">Chamados & OS TI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Wrench size={26} className="text-indigo-600" />
            Central Interativa de Atendimento & Ordem de Serviço
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Arraste os cards entre as colunas ou clique para inspecionar timeline, notas técnicas e atribuir especialistas.
          </p>
        </div>

        <button
          onClick={() => setModalNovo(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} /> Abrir Novo Chamado
        </button>
      </div>

      {/* 4 Cards de Métricas e Telemetria em Tempo Real */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Demandas</div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{totalChamados}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Triadas na pasta</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
            <Flame size={12} /> Chamados Urgentes
          </div>
          <div className="text-2xl font-black text-red-600 mt-0.5">{totalUrgentes}</div>
          <div className="text-[11px] text-red-500/80 mt-0.5">SLA prioritário &lt; 1h</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[10px] font-bold text-[#0072BB] uppercase tracking-wider">Em Atendimento</div>
          <div className="text-2xl font-black text-[#0072BB] mt-0.5">{totalEmAndamento}</div>
          <div className="text-[11px] text-blue-600/80 mt-0.5">Técnicos em campo</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Concluídos</div>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">{totalConcluidos}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">100% resolvidos</div>
        </div>
      </div>

      {/* Barra de Filtros e Busca Rápida Dentro do Kanban */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Campo de Busca */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={buscaChamado}
            onChange={e => setBuscaChamado(e.target.value)}
            placeholder="Buscar por código, título, solicitante ou técnico..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-indigo-400 transition"
          />
        </div>

        {/* Filtros por Categoria e Prioridade */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Categoria */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">
            {['todos', 'TI', 'Manutenção', 'Almoxarifado'].map(t => (
              <button
                key={t}
                onClick={() => {
                  soundFX.playClick();
                  setFiltroTipo(t);
                }}
                className={`px-2.5 py-1 rounded-lg transition capitalize cursor-pointer text-[11px] ${
                  filtroTipo === t ? 'bg-white text-indigo-700 shadow-xs font-black' : 'hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Prioridade */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'urgente', label: '🔥 Urgentes' },
              { id: 'alta', label: 'Altas' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => {
                  soundFX.playClick();
                  setFiltroPrioridade(p.id);
                }}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                  filtroPrioridade === p.id ? 'bg-white text-indigo-700 shadow-xs font-black' : 'hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dica de Interatividade Drag and Drop */}
      <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-indigo-600 animate-pulse" />
          <span className="font-bold">Interatividade Completa:</span>
          <span>Arraste os cards entre colunas ou <strong>clique em qualquer card</strong> para inspecionar timeline, atribuir técnico ou adicionar notas técnicas.</span>
        </div>
        <span className="font-mono text-[11px] font-bold text-indigo-700 hidden sm:inline">
          {chamadosFiltrados.length} chamados filtrados
        </span>
      </div>

      {/* AS 3 COLUNAS KANBAN DRAG & DROP REAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUNA 1: A FAZER / TRIAGEM */}
        <div 
          onDragOver={(e) => handleDragOver(e, 'a_fazer')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleDrop(e, 'a_fazer')}
          className={`rounded-3xl p-5 border-2 transition-all duration-200 flex flex-col justify-between min-h-[550px] ${
            dragOverCol === 'a_fazer' 
              ? 'bg-amber-50/80 border-amber-400 ring-4 ring-amber-100' 
              : 'bg-slate-100/90 border-slate-200/90'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between font-extrabold text-xs text-slate-800 pb-3 border-b border-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> A Fazer / Triagem
              </span>
              <span className="font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 text-[11px]">
                {chamadosFiltrados.filter(c => c.status === 'a_fazer').length}
              </span>
            </div>

            <div className="space-y-3.5">
              {chamadosFiltrados.filter(c => c.status === 'a_fazer').map(c => (
                <div 
                  key={c.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, c.id)}
                  onDragEnd={() => setDraggingCardId(null)}
                  onClick={() => {
                    soundFX.playClick();
                    setChamadoSelecionado(c);
                  }}
                  className={`bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all space-y-3 cursor-pointer select-none group hover:border-indigo-300 ${
                    draggingCardId === c.id ? 'opacity-40 scale-95' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <GripVertical size={12} className="text-slate-400" />
                      {c.codigo}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      c.prioridade === 'urgente' ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse' :
                      c.prioridade === 'alta' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {c.prioridade === 'urgente' && <Flame size={10} />}
                      {c.prioridade}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-xs text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors">{c.titulo}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{c.descricao}</p>
                  </div>

                  {/* SLA Countdown Timer Vivo com segundos */}
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">SLA Vivo:</span>
                    <span className="font-mono font-bold text-amber-700 flex items-center gap-1">
                      <Clock size={12} className="text-amber-500 animate-spin" /> {formatarSLA(c.slaSegundosRestantes)}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>{c.solicitante}</span>
                    <span>{c.abertoEm.split(' ')[1]}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFX.playClick();
                        setChamadoSelecionado(c);
                      }}
                      className="flex-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <FileText size={12} /> Detalhes
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moverStatus(c.id, 'em_andamento');
                      }}
                      className="flex-1 text-[11px] font-black text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50 py-2 rounded-xl border border-indigo-200 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      Iniciar →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA 2: EM ANDAMENTO */}
        <div 
          onDragOver={(e) => handleDragOver(e, 'em_andamento')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleDrop(e, 'em_andamento')}
          className={`rounded-3xl p-5 border-2 transition-all duration-200 flex flex-col justify-between min-h-[550px] ${
            dragOverCol === 'em_andamento' 
              ? 'bg-blue-50/80 border-[#0072BB] ring-4 ring-blue-100' 
              : 'bg-slate-100/90 border-slate-200/90'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between font-extrabold text-xs text-slate-800 pb-3 border-b border-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0072BB] animate-ping" /> Em Atendimento
              </span>
              <span className="font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 text-[11px]">
                {chamadosFiltrados.filter(c => c.status === 'em_andamento').length}
              </span>
            </div>

            <div className="space-y-3.5">
              {chamadosFiltrados.filter(c => c.status === 'em_andamento').map(c => (
                <div 
                  key={c.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, c.id)}
                  onDragEnd={() => setDraggingCardId(null)}
                  onClick={() => {
                    soundFX.playClick();
                    setChamadoSelecionado(c);
                  }}
                  className={`bg-white rounded-2xl p-4 border-2 border-indigo-300 shadow-md ring-2 ring-indigo-50 space-y-3 cursor-pointer select-none group hover:border-indigo-400 ${
                    draggingCardId === c.id ? 'opacity-40 scale-95' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <GripVertical size={12} className="text-slate-400" />
                      {c.codigo}
                    </span>
                    <span className="text-[10px] font-bold text-[#0072BB] bg-blue-50 px-2 py-0.5 rounded">
                      ● Em Execução
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-xs text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors">{c.titulo}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{c.descricao}</p>
                  </div>

                  <div className="p-2 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs">
                    <div className="text-[10px] text-indigo-900 font-bold uppercase">Técnico Responsável</div>
                    <div className="text-xs font-semibold text-slate-800">{c.tecnico}</div>
                  </div>

                  {/* SLA Countdown Timer Vivo com segundos */}
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Tempo Restante:</span>
                    <span className="font-mono font-bold text-indigo-700 flex items-center gap-1">
                      <Clock size={12} className="text-indigo-500 animate-spin" /> {formatarSLA(c.slaSegundosRestantes)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFX.playClick();
                        setChamadoSelecionado(c);
                      }}
                      className="flex-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <FileText size={12} /> Detalhes & Notas
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moverStatus(c.id, 'concluido');
                      }}
                      className="flex-1 text-xs font-black text-emerald-800 hover:text-white hover:bg-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-200 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 size={15} /> Finalizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA 3: CONCLUÍDOS */}
        <div 
          onDragOver={(e) => handleDragOver(e, 'concluido')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleDrop(e, 'concluido')}
          className={`rounded-3xl p-5 border-2 transition-all duration-200 flex flex-col justify-between min-h-[550px] ${
            dragOverCol === 'concluido' 
              ? 'bg-emerald-50/80 border-emerald-400 ring-4 ring-emerald-100' 
              : 'bg-slate-100/90 border-slate-200/90'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between font-extrabold text-xs text-slate-800 pb-3 border-b border-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Concluídos
              </span>
              <span className="font-mono bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 text-[11px]">
                {chamadosFiltrados.filter(c => c.status === 'concluido').length}
              </span>
            </div>

            <div className="space-y-3.5">
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
                  className={`bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-3 cursor-pointer select-none opacity-90 hover:opacity-100 transition group hover:border-emerald-400 ${
                    draggingCardId === c.id ? 'opacity-40 scale-95' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                      {c.codigo}
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={12} /> Resolvido
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-700 line-through leading-snug group-hover:text-emerald-800 transition-colors">{c.titulo}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">{c.descricao}</p>
                  </div>

                  <div className="p-2 bg-emerald-50/60 rounded-xl text-[10px] text-emerald-800 flex justify-between font-mono">
                    <span>Atendido no Prazo</span>
                    <span>100% SLA</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFX.playClick();
                        setChamadoSelecionado(c);
                      }}
                      className="flex-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <FileText size={12} /> Ver Relatório
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moverStatus(c.id, 'em_andamento');
                      }}
                      className="flex-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                    >
                      Reabrir ↩
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal de Abertura de Novo Chamado */}
      {modalNovo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" />
                Abertura de Chamado / Ordem de Serviço
              </h3>
              <button 
                onClick={() => setModalNovo(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Atalhos de Diagnóstico Rápido em 1 Clique */}
            <div className="pt-3 pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Atalhos de Diagnóstico Rápido (1 Clique):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    icon: '🖨️',
                    label: 'Toner da Impressora',
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
                    label: 'Ar-Condicionado / Manutenção',
                    tipo: 'Manutenção',
                    prioridade: 'alta',
                    titulo: 'Falha ou gotejamento no ar-condicionado',
                    desc: 'Aparelho de ar-condicionado da sala está gotejando e não climatiza adequadamente o ambiente de trabalho.'
                  },
                  {
                    icon: '📦',
                    label: 'Resmas de Papel A4',
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
                      setTipo(diag.tipo as any);
                      setPrioridade(diag.prioridade as any);
                      setTitulo(diag.titulo);
                      setDescricao(diag.desc);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition cursor-pointer flex items-center gap-2 group"
                  >
                    <span className="text-base shrink-0">{diag.icon}</span>
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-800 leading-tight">
                      {diag.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCriarChamado} className="space-y-4 pt-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Setor de Atendimento *</label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-hidden"
                  >
                    <option value="TI">Suporte de TI & Informática</option>
                    <option value="Manutenção">Manutenção Predial & Ar</option>
                    <option value="Almoxarifado">Almoxarifado & Materiais</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prioridade *</label>
                  <select
                    value={prioridade}
                    onChange={e => setPrioridade(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-hidden"
                  >
                    <option value="urgente">🔥 Urgente (SLA 1h)</option>
                    <option value="alta">Alta (SLA 2h)</option>
                    <option value="media">Média (SLA 4h)</option>
                    <option value="baixa">Baixa (SLA 8h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Chamado *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Teclado quebrado no gabinete, impressora sem toner..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição Detalhada do Problema *</label>
                <textarea
                  required
                  rows={3}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Informe o número da sala, ramal de contato e detalhes do equipamento..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={16} /> Registrar Chamado no Kanban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer de Inspeção Detalhada do Chamado */}
      {chamadoSelecionado && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-end backdrop-blur-xs animate-in fade-in"
          onClick={() => setChamadoSelecionado(null)}
        >
          <div 
            className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-slate-200 p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            
            {/* Topo do Drawer */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                    {chamadoSelecionado.codigo}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    chamadoSelecionado.prioridade === 'urgente' ? 'bg-red-100 text-red-800 border border-red-200' :
                    chamadoSelecionado.prioridade === 'alta' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {chamadoSelecionado.prioridade}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {chamadoSelecionado.tipo}
                  </span>
                </div>

                <button
                  onClick={() => setChamadoSelecionado(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Título e Descrição */}
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {chamadoSelecionado.titulo}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {chamadoSelecionado.descricao}
                </p>
              </div>

              {/* Informações do Solicitante */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Solicitante</div>
                  <div className="font-bold text-slate-800 mt-0.5">{chamadoSelecionado.solicitante}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Setor / Lotação</div>
                  <div className="font-bold text-slate-800 mt-0.5">{chamadoSelecionado.setor}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Aberto em</div>
                  <div className="font-semibold text-slate-600 mt-0.5">{chamadoSelecionado.abertoEm}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Status Atual</div>
                  <div className="font-bold capitalize mt-0.5 text-indigo-700">
                    {chamadoSelecionado.status.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Atribuição de Especialista */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User size={14} className="text-indigo-600" /> Atribuir Técnico / Especialista:
                </label>
                <select
                  value={chamadoSelecionado.tecnico || ''}
                  onChange={(e) => handleAtribuirTecnico(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">-- Selecione o especialista --</option>
                  <option value="Rodrigo Mendonça (TI / Redes)">Rodrigo Mendonça (TI / Redes)</option>
                  <option value="Patrícia Lima (Sistemas & Web)">Patrícia Lima (Sistemas & Web)</option>
                  <option value="Lucas Silveira (Hardware & Impressoras)">Lucas Silveira (Hardware & Impressoras)</option>
                  <option value="Almoxarifado Central">Almoxarifado Central</option>
                  <option value="Manutenção Predial">Manutenção Predial</option>
                </select>
              </div>

              {/* SLA Bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Controle de SLA:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {formatarSLA(chamadoSelecionado.slaSegundosRestantes)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      chamadoSelecionado.slaSegundosRestantes > 3600 ? 'bg-emerald-500' :
                      chamadoSelecionado.slaSegundosRestantes > 1200 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (chamadoSelecionado.slaSegundosRestantes / 7200) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Thread de Notas e Atualizações */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-indigo-600" /> Histórico & Notas Técnicas
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {chamadoSelecionado.notas?.length || 0} registros
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {(!chamadoSelecionado.notas || chamadoSelecionado.notas.length === 0) ? (
                    <div className="text-center p-4 bg-slate-50 rounded-xl text-xs text-slate-400">
                      Nenhuma nota técnica registrada ainda.
                    </div>
                  ) : (
                    chamadoSelecionado.notas.map(n => (
                      <div key={n.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-indigo-700">{n.autor}</span>
                          <span className="text-slate-400">{n.dataHora}</span>
                        </div>
                        <p className="text-slate-700">{n.texto}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Adicionar Nota */}
                <form onSubmit={handleAdicionarNota} className="flex gap-2">
                  <input
                    type="text"
                    value={novaNota}
                    onChange={e => setNovaNota(e.target.value)}
                    placeholder="Adicionar nota técnica ou andamento..."
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Send size={13} />
                  </button>
                </form>
              </div>
            </div>

            {/* Ações de Transição de Status no Rodapé do Drawer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              {chamadoSelecionado.status !== 'concluido' ? (
                <button
                  onClick={() => {
                    moverStatus(chamadoSelecionado.id, 'concluido');
                    setChamadoSelecionado({ ...chamadoSelecionado, status: 'concluido' });
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 size={16} /> Finalizar e Entregar Solução
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Chamado Concluído com Sucesso
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
