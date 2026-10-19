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
  RotateCcw,
  Activity,
  Terminal,
  Cpu,
  Zap,
  Radio,
  AlertTriangle,
  Building2
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
    descricao: 'A impressora laser HP Enterprise da recepção do gabinete está indicando toner preto esgotado com fila retida.',
    solicitante: 'Dra. Maria Helena',
    setor: 'Chefia de Gabinete',
    prioridade: 'urgente',
    status: 'a_fazer',
    slaSegundosRestantes: 2700, // 45 min
    abertoEm: '15/10/2026 09:15',
    notas: [
      {
        id: 'n-1',
        autor: 'NOC Helpdesk SEJU',
        texto: 'Chamado recebido na fila prioritária e triado para reposição emergencial de insumo.',
        dataHora: '15/10/2026 09:20'
      }
    ]
  },
  {
    id: 'ch-2',
    codigo: 'MANUT-2026-102',
    tipo: 'Manutenção',
    titulo: 'Reparo de ar-condicionado inverter na sala 204',
    descricao: 'Aparelho apresentando ruído mecânico anormal na turbina e não resfriando adequadamente o setor.',
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
    titulo: 'Instalação de certificado digital ICP-Brasil e VPN Gov.PR',
    descricao: 'Configuração de túnel criptografado da VPN institucional para auditoria externa e assinatura no e-Protocolo.',
    solicitante: 'Eduardo Ramos',
    setor: 'Assessoria de Planejamento',
    prioridade: 'alta',
    status: 'em_andamento',
    tecnico: 'Rodrigo Mendonça (TI / Redes)',
    slaSegundosRestantes: 5400, // 1h30
    abertoEm: '15/10/2026 08:30',
    notas: [
      {
        id: 'n-2',
        autor: 'Rodrigo Mendonça',
        texto: 'Acesso remoto seguro estabelecido. Instalando cadeia ICP-Brasil v5 e validando handshake Celepar.',
        dataHora: '15/10/2026 09:05'
      }
    ]
  },
  {
    id: 'ch-5',
    codigo: 'TI-2026-440',
    tipo: 'TI',
    titulo: 'Latência intermitente no switch PoE do 3º Andar',
    descricao: 'Oscilação de pacotes nas portas VLAN 40 atendendo as estações da Diretoria Geral.',
    solicitante: 'Carlos Alberto Nogueira',
    setor: 'Diretoria Geral',
    prioridade: 'urgente',
    status: 'em_andamento',
    tecnico: 'Patrícia Lima (Sistemas & Web)',
    slaSegundosRestantes: 1980, // 33 min
    abertoEm: '15/10/2026 09:10',
    notas: [
      {
        id: 'n-5',
        autor: 'Patrícia Lima',
        texto: 'Telemetria SNMP apontou loop de broadcast na porta Gi1/0/14. Isolando segmento e reconfigurando STP.',
        dataHora: '15/10/2026 09:22'
      }
    ]
  },
  {
    id: 'ch-4',
    codigo: 'ALMOX-2026-088',
    tipo: 'Almoxarifado',
    titulo: 'Reposição de resmas de papel A4 e pastas suspensas',
    descricao: 'Suprimento semanal de expediente para o protocolo central e arquivo geral.',
    solicitante: 'Juliana Costa',
    setor: 'Protocolo Geral',
    prioridade: 'baixa',
    status: 'concluido',
    tecnico: 'Almoxarifado Central',
    slaSegundosRestantes: 0,
    abertoEm: '14/10/2026 14:00',
    solucao: 'Entregues 10 caixas de papel A4 alcalino e 50 pastas suspensas plastificadas com guia assinada.',
    notas: [
      {
        id: 'n-3',
        autor: 'Almoxarifado Central',
        texto: 'Material separado e conferido na doca do estoque térreo.',
        dataHora: '14/10/2026 14:30'
      },
      {
        id: 'n-4',
        autor: 'Almoxarifado Central',
        texto: 'Ordem de fornecimento entregue no protocolo às 15:15.',
        dataHora: '14/10/2026 15:15'
      }
    ]
  },
  {
    id: 'ch-6',
    codigo: 'TI-2026-435',
    tipo: 'TI',
    titulo: 'Substituição de fonte ATX e limpeza de workstation Dell',
    descricao: 'Estação de trabalho desligando subitamente durante compilação de relatórios.',
    solicitante: 'Marcos Vinícius',
    setor: 'Núcleo Financeiro',
    prioridade: 'alta',
    status: 'concluido',
    tecnico: 'Lucas Silveira (Hardware & Impressoras)',
    slaSegundosRestantes: 0,
    abertoEm: '14/10/2026 16:10',
    solucao: 'Fonte substituída por unidade 500W 80Plus Bronze e pasta térmica renovada. Testes de stress aprovados.',
    notas: [
      {
        id: 'n-6',
        autor: 'Lucas Silveira',
        texto: 'Equipamento recolhido ao laboratório técnico para troca da fonte e diagnóstico térmico.',
        dataHora: '14/10/2026 16:40'
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

  // Sincroniza o chamado selecionado com o cronômetro ao vivo
  const chamadoInspecionado = chamadoSelecionado
    ? chamados.find(c => c.id === chamadoSelecionado.id) || chamadoSelecionado
    : null;

  const formatarSLA = (segundos: number) => {
    if (segundos <= 0) return 'SLA Expirado';
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (h > 0) return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
    return `${pad(m)}m ${pad(s)}s`;
  };

  const getSlaMaxSegundos = (p: Chamado['prioridade']) => {
    switch (p) {
      case 'urgente': return 3600;
      case 'alta': return 7200;
      case 'media': return 14400;
      default: return 28800;
    }
  };

  const getSlaPercent = (c: Chamado) => {
    if (c.status === 'concluido') return 100;
    const max = getSlaMaxSegundos(c.prioridade);
    return Math.max(5, Math.min(100, Math.round((c.slaSegundosRestantes / max) * 100)));
  };

  const getIniciais = (nome?: string) => {
    if (!nome) return 'TI';
    const limpo = nome.split('(')[0].trim();
    const partes = limpo.split(' ').filter(Boolean);
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  const moverStatus = (id: string, novoStatus: 'a_fazer' | 'em_andamento' | 'concluido') => {
    setChamados(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: novoStatus,
          tecnico: novoStatus === 'em_andamento' && !c.tecnico ? `${currentUser.nome} (Especialista)` : c.tecnico
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
      slaSegundosRestantes: getSlaMaxSegundos(prioridade),
      abertoEm: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      notas: [
        {
          id: 'n-init-' + Date.now(),
          autor: 'Motor de Triagem NOC',
          texto: `Ordem de serviço registrada via terminal com SLA inicial de ${prioridade === 'urgente' ? '1h' : prioridade === 'alta' ? '2h' : prioridade === 'media' ? '4h' : '8h'}.`,
          dataHora: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
        }
      ]
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
    if (!novaNota.trim() || !chamadoInspecionado) return;
    const notaObj: NotaChamado = {
      id: 'n-' + Date.now(),
      autor: currentUser.nome,
      texto: novaNota.trim(),
      dataHora: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    };
    const atualizado: Chamado = {
      ...chamadoInspecionado,
      notas: [...(chamadoInspecionado.notas || []), notaObj]
    };
    setChamados(prev => prev.map(c => c.id === atualizado.id ? atualizado : c));
    setChamadoSelecionado(atualizado);
    setNovaNota('');
    soundFX.playClick();
  };

  const handleAtribuirTecnico = (tecnicoNome: string) => {
    if (!chamadoInspecionado) return;
    const atualizado: Chamado = {
      ...chamadoInspecionado,
      tecnico: tecnicoNome,
      status: chamadoInspecionado.status === 'a_fazer' && tecnicoNome ? 'em_andamento' : chamadoInspecionado.status
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
      c.setor.toLowerCase().includes(q) ||
      c.descricao.toLowerCase().includes(q) ||
      (c.tecnico && c.tecnico.toLowerCase().includes(q));
    return matchTipo && matchPrioridade && matchBusca;
  });

  // Métricas de Telemetria NOC
  const totalChamados = chamados.length;
  const totalAtivos = chamados.filter(c => c.status !== 'concluido').length;
  const totalUrgentesSla = chamados.filter(
    c => c.status !== 'concluido' && (c.prioridade === 'urgente' || c.slaSegundosRestantes <= 3600)
  ).length;
  const totalEmAndamento = chamados.filter(c => c.status === 'em_andamento').length;
  const totalConcluidos = chamados.filter(c => c.status === 'concluido').length;
  const taxaResolucao = totalChamados > 0 ? Math.round((totalConcluidos / totalChamados) * 100) : 100;

  // Contadores para Pílulas de Filtro
  const countPorTipo = (t: string) =>
    t === 'todos' ? chamados.length : chamados.filter(c => c.tipo === t).length;
  const countPorPrioridade = (p: string) =>
    p === 'todas' ? chamados.length : chamados.filter(c => c.prioridade === p).length;

  const getPrioridadeStyle = (p: Chamado['prioridade']) => {
    switch (p) {
      case 'urgente':
        return {
          badge: 'bg-red-500/10 text-red-700 border-red-500/25 shadow-[0_0_10px_rgba(239,68,68,0.12)]',
          dot: 'bg-red-500 animate-ping',
          solidDot: 'bg-red-600',
          strip: 'from-red-500 via-rose-500 to-orange-500',
          barColor: 'from-red-500 to-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
          hoverBorder: 'hover:border-red-300/90 hover:shadow-[0_12px_28px_-8px_rgba(239,68,68,0.16)]',
          label: 'CRÍTICO · P1'
        };
      case 'alta':
        return {
          badge: 'bg-amber-500/10 text-amber-800 border-amber-500/25',
          dot: 'bg-amber-500',
          solidDot: 'bg-amber-500',
          strip: 'from-amber-500 via-orange-400 to-yellow-400',
          barColor: 'from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
          hoverBorder: 'hover:border-amber-300/90 hover:shadow-[0_12px_28px_-8px_rgba(245,158,11,0.15)]',
          label: 'ALTA · P2'
        };
      case 'media':
        return {
          badge: 'bg-blue-500/10 text-blue-700 border-blue-500/25',
          dot: 'bg-blue-500',
          solidDot: 'bg-blue-500',
          strip: 'from-blue-600 via-indigo-500 to-cyan-400',
          barColor: 'from-blue-600 to-cyan-400 shadow-[0_0_8px_rgba(37,99,235,0.35)]',
          hoverBorder: 'hover:border-blue-300/90 hover:shadow-[0_12px_28px_-8px_rgba(37,99,235,0.15)]',
          label: 'MÉDIA · P3'
        };
      default:
        return {
          badge: 'bg-slate-500/10 text-slate-600 border-slate-400/25',
          dot: 'bg-slate-400',
          solidDot: 'bg-slate-400',
          strip: 'from-slate-400 via-slate-300 to-slate-200',
          barColor: 'from-slate-500 to-slate-400',
          hoverBorder: 'hover:border-slate-300 hover:shadow-md',
          label: 'BAIXA · P4'
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 font-sans">
      
      {/* =====================================================================
          SEÇÃO 1: CABEÇALHO NOC & PAINEL DE TELEMETRIA DE TI (LINEAR / VERCEL)
         ===================================================================== */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.07)] overflow-hidden">
        {/* Brilho Especular Superior Estilo Vercel */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-600/60 to-transparent" />

        {/* Sub-Header de Comando NOC */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <button
                onClick={onVoltarHub}
                className="mt-0.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white border border-slate-200/90 hover:border-slate-900 shadow-2xs transition-all duration-200 cursor-pointer shrink-0 group"
                title="Voltar à Central de Aplicativos"
              >
                <ArrowLeft size={17} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-700 bg-slate-100 border border-slate-200/90 px-2.5 py-0.5 rounded-md">
                    <Terminal size={11} className="text-blue-600" />
                    SEJU // NOC-TI COMMAND CENTER
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    TELEMETRIA SLA · 99.98% ONLINE
                  </span>

                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <Radio size={11} className="text-blue-500" /> SYNC 1.0s
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-bold text-slate-950 tracking-tight mt-1.5 flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-slate-900 text-white shadow-xs">
                    <Wrench size={17} />
                  </span>
                  Quadro Kanban de TI & Ordens de Serviço
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                  Central de Operações de Rede e Infraestrutura com monitoramento regressivo de SLA, despacho técnico em tempo real e diário de bordo auditável.
                </p>
              </div>
            </div>

            {/* Ação Primária Linear-Grade */}
            <div className="flex items-center gap-2.5 self-start lg:self-center">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600">
                <Cpu size={13} className="text-blue-600" />
                <span>OPERADOR:</span>
                <span className="font-bold text-slate-900">{currentUser.nome.split(' ')[0].toUpperCase()}</span>
              </div>

              <button
                onClick={() => {
                  soundFX.playClick();
                  setModalNovo(true);
                }}
                className="relative overflow-hidden bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 group"
              >
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70" />
                <Plus size={15} className="text-blue-400 group-hover:rotate-90 transition-transform duration-200" />
                <span>Abrir Ordem de Serviço</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] font-mono bg-white/10 text-slate-300 rounded border border-white/15">
                  OS+
                </kbd>
              </button>
            </div>
          </div>

          {/* =================================================================
              4 CARTÕES DE TELEMETRIA NOC (CANTONEIRAS, BORDAS DUPLAS E LEDS)
             ================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* CARD 1: TOTAL DE DEMANDAS */}
            <div className="relative rounded-xl bg-gradient-to-b from-slate-50/90 to-white p-4 border border-slate-200/90 ring-1 ring-inset ring-white shadow-2xs overflow-hidden group hover:border-slate-300 transition-all">
              {/* Brilho Superior Duplo */}
              <div className="absolute inset-x-4 top-0 h-[2px] bg-gradient-to-r from-transparent via-slate-900/50 to-transparent" />
              {/* Cantoneiras Técnicas NOC */}
              <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-slate-400/70 rounded-tl-[2px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-slate-400/70 rounded-tr-[2px]" />
              <span className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-[1.5px] border-l-[1.5px] border-slate-400/70 rounded-bl-[2px]" />
              <span className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-slate-400/70 rounded-br-[2px]" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  01 // Total de Demandas
                </span>
                <span className="relative flex h-2.5 w-2.5" title="Fila Monitorada">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600" />
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono tracking-tight text-slate-950">
                    {String(totalChamados).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    ({totalAtivos} ativos)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-md">
                  FILA GLOBAL
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>TI · MANUT · ALMOX</span>
                <span className="text-slate-600 font-semibold">100% RASTREADO</span>
              </div>
            </div>

            {/* CARD 2: URGENTES SLA < 1H */}
            <div className="relative rounded-xl bg-gradient-to-b from-red-50/40 via-white to-white p-4 border border-red-200/80 ring-1 ring-inset ring-white shadow-2xs overflow-hidden group hover:border-red-300 transition-all">
              {/* Brilho Superior Duplo Vermelho */}
              <div className="absolute inset-x-4 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
              {/* Cantoneiras Técnicas NOC */}
              <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-red-400/80 rounded-tl-[2px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-red-400/80 rounded-tr-[2px]" />
              <span className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-[1.5px] border-l-[1.5px] border-red-400/80 rounded-bl-[2px]" />
              <span className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-red-400/80 rounded-br-[2px]" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
                  <Flame size={12} className="text-red-600" />
                  02 // Urgentes SLA &lt; 1h
                </span>
                <span className="relative flex h-2.5 w-2.5" title="Alerta de Prioridade P1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono tracking-tight text-red-600">
                    {String(totalUrgentesSla).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] font-mono text-red-600/80">
                    críticos P1
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-red-700 bg-red-100/80 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertTriangle size={10} /> ESCALONAMENTO
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-red-100/80 flex items-center justify-between text-[10px] font-mono text-red-700/80">
                <span>RESPOSTA IMEDIATA</span>
                <span className="font-bold">TARGET &lt; 60m</span>
              </div>
            </div>

            {/* CARD 3: TÉCNICOS EM CAMPO */}
            <div className="relative rounded-xl bg-gradient-to-b from-blue-50/40 via-white to-white p-4 border border-blue-200/80 ring-1 ring-inset ring-white shadow-2xs overflow-hidden group hover:border-blue-300 transition-all">
              {/* Brilho Superior Duplo Azul */}
              <div className="absolute inset-x-4 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
              {/* Cantoneiras Técnicas NOC */}
              <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-blue-400/80 rounded-tl-[2px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-blue-400/80 rounded-tr-[2px]" />
              <span className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-[1.5px] border-l-[1.5px] border-blue-400/80 rounded-bl-[2px]" />
              <span className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-blue-400/80 rounded-br-[2px]" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                  <Activity size={12} className="text-blue-600" />
                  03 // Técnicos em Campo
                </span>
                <span className="relative flex h-2.5 w-2.5" title="Especialistas em Atendimento">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono tracking-tight text-slate-950">
                    {String(totalEmAndamento).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] font-mono text-blue-700">
                    alocados agora
                  </span>
                </div>

                {/* Mini Avatares Empilhados com Anel de Status */}
                <div className="flex -space-x-1.5">
                  {['RM', 'PL', 'LS'].map((ini, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full bg-slate-900 text-white text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white border border-blue-400 shadow-2xs"
                      title="Especialista N2 Ativo"
                    >
                      {ini}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-blue-100/80 flex items-center justify-between text-[10px] font-mono text-blue-800/80">
                <span>EQUIPE N1 / N2 / N3</span>
                <span className="font-bold text-blue-700">DESPACHO ATIVO</span>
              </div>
            </div>

            {/* CARD 4: TAXA DE RESOLUÇÃO */}
            <div className="relative rounded-xl bg-gradient-to-b from-emerald-50/40 via-white to-white p-4 border border-emerald-200/80 ring-1 ring-inset ring-white shadow-2xs overflow-hidden group hover:border-emerald-300 transition-all">
              {/* Brilho Superior Duplo Esmeralda */}
              <div className="absolute inset-x-4 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
              {/* Cantoneiras Técnicas NOC */}
              <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-emerald-400/80 rounded-tl-[2px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-emerald-400/80 rounded-tr-[2px]" />
              <span className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-[1.5px] border-l-[1.5px] border-emerald-400/80 rounded-bl-[2px]" />
              <span className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-emerald-400/80 rounded-br-[2px]" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  04 // Taxa de Resolução
                </span>
                <span className="relative flex h-2.5 w-2.5" title="Conformidade de SLA">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono tracking-tight text-emerald-700">
                    {taxaResolucao}%
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700/80">
                    ({totalConcluidos}/{totalChamados} OS)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-md">
                  SLA COMPLIANT
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-emerald-100/80 flex items-center justify-between gap-2">
                <div className="flex-1 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${taxaResolucao}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700">META 95%</span>
              </div>
            </div>

          </div>

          {/* =================================================================
              SEÇÃO 2: BARRA DE BUSCA & FILTROS SEGMENTADOS (TACTILE MACHINED)
             ================================================================= */}
          <div className="pt-4 border-t border-slate-200/70 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5">
            
            {/* Busca Rápida Estilo Command Bar */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={buscaChamado}
                onChange={e => setBuscaChamado(e.target.value)}
                placeholder="Filtrar por #código, assunto, solicitante ou especialista..."
                className="w-full text-xs pl-9 pr-16 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 font-medium shadow-inner"
              />
              {buscaChamado ? (
                <button
                  onClick={() => setBuscaChamado('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-slate-200/70 hover:bg-slate-200 p-1 rounded-md cursor-pointer transition"
                >
                  <X size={12} />
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200/80 shadow-2xs pointer-events-none">
                  ⌘K
                </span>
              )}
            </div>

            {/* Controles Segmentados Usinados com Contadores em Pílulas */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Filtro Segmentado de Categoria */}
              <div className="flex items-center gap-1 bg-slate-900/[0.04] p-1 rounded-xl border border-slate-200/90 shadow-inner">
                {[
                  { id: 'todos', label: 'Todas Áreas' },
                  { id: 'TI', label: 'TI & Redes' },
                  { id: 'Manutenção', label: 'Manutenção' },
                  { id: 'Almoxarifado', label: 'Almoxarifado' }
                ].map(t => {
                  const ativo = filtroTipo === t.id;
                  const count = countPorTipo(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        soundFX.playClick();
                        setFiltroTipo(t.id);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-[11px] flex items-center gap-1.5 ${
                        ativo
                          ? 'bg-white text-slate-950 font-semibold shadow-[0_1px_3px_rgba(15,23,42,0.12)] border border-slate-200/90'
                          : 'text-slate-600 hover:text-slate-900 font-medium border border-transparent'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors ${
                          ativo
                            ? 'bg-slate-900 text-white font-bold'
                            : 'bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Filtro Segmentado de Prioridade */}
              <div className="flex items-center gap-1 bg-slate-900/[0.04] p-1 rounded-xl border border-slate-200/90 shadow-inner">
                {[
                  { id: 'todas', label: 'Prioridade', dot: 'bg-slate-400' },
                  { id: 'urgente', label: 'Críticas', dot: 'bg-red-500' },
                  { id: 'alta', label: 'Altas', dot: 'bg-amber-500' },
                  { id: 'media', label: 'Médias', dot: 'bg-blue-500' }
                ].map(p => {
                  const ativo = filtroPrioridade === p.id;
                  const count = countPorPrioridade(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        soundFX.playClick();
                        setFiltroPrioridade(p.id);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-[11px] flex items-center gap-1.5 ${
                        ativo
                          ? 'bg-white text-slate-950 font-semibold shadow-[0_1px_3px_rgba(15,23,42,0.12)] border border-slate-200/90'
                          : 'text-slate-600 hover:text-slate-900 font-medium border border-transparent'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                      <span>{p.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full transition-colors ${
                          ativo
                            ? 'bg-slate-900 text-white font-bold'
                            : 'bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Contador de Resultados Visíveis */}
              <div className="hidden 2xl:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 pl-2 border-l border-slate-200">
                <SlidersHorizontal size={12} className="text-blue-600" />
                <span className="font-bold text-slate-900">{chamadosFiltrados.length}</span>
                <span>OS visíveis</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================================
          SELETOR MOBILE + QUADRO KANBAN DE 3 COLUNAS ESCULPIDAS
         ===================================================================== */}
      
      {/* Seletor Segmentado Mobile */}
      <div className="md:hidden flex bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs gap-1 text-xs">
        {[
          { id: 'a_fazer' as const, label: 'Triagem', dot: 'bg-amber-500' },
          { id: 'em_andamento' as const, label: 'Atendimento', dot: 'bg-blue-600' },
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
        
        {/* =================================================================
            COLUNA 1: FILA DE TRIAGEM (A FAZER)
           ================================================================= */}
        <div
          onDragOver={(e) => handleDragOver(e, 'a_fazer')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleDrop(e, 'a_fazer')}
          style={{
            backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.055) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
          className={`${colunaAtivaMobile === 'a_fazer' ? 'flex' : 'hidden md:flex'} relative rounded-2xl border transition-all duration-200 flex-col justify-between min-h-[540px] overflow-hidden ${
            dragOverCol === 'a_fazer'
              ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-300/50 shadow-lg'
              : 'bg-slate-100/70 border-slate-200/90 shadow-2xs'
          }`}
        >
          {/* Barra de Acento Superior Esculpida */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300" />

          <div className="p-4 space-y-3.5 flex-1">
            {/* Cabeçalho Esculpido da Coluna */}
            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-700">
                    STAGE 01 // INTAKE QUEUE
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Triagem & Despacho
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold bg-amber-500/10 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-500/25 shadow-2xs">
                  {String(chamadosFiltrados.filter(c => c.status === 'a_fazer').length).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Lista de Cartões */}
            <div className="space-y-3">
              {chamadosFiltrados.filter(c => c.status === 'a_fazer').map(c => {
                const prio = getPrioridadeStyle(c.prioridade);
                const slaPercent = getSlaPercent(c);
                const slaCritico = c.slaSegundosRestantes <= 3600;
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
                    className={`relative bg-white rounded-xl p-4 pl-5 border border-slate-200/90 shadow-2xs ${prio.hoverBorder} hover:-translate-y-0.5 transition-all duration-200 space-y-3 cursor-pointer select-none group overflow-hidden ${
                      draggingCardId === c.id ? 'opacity-40 scale-98' : ''
                    }`}
                  >
                    {/* Faixa Lateral de Prioridade */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${prio.strip}`} />

                    {/* Topo: Tag Monoespaçada + Prioridade */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical size={13} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                        <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/90 group-hover:border-slate-300">
                          #{c.codigo}
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-slate-600 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/70">
                          {c.tipo}
                        </span>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${prio.badge}`}>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className={`absolute inline-flex h-full w-full rounded-full ${prio.dot} opacity-75`} />
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${prio.solidDot}`} />
                        </span>
                        {prio.label}
                      </span>
                    </div>

                    {/* Título & Descrição */}
                    <div>
                      <h4 className="font-bold text-xs sm:text-[13px] text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {c.titulo}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {c.descricao}
                      </p>
                    </div>

                    {/* Barra de Progresso de SLA Regressiva com Brilho */}
                    <div className="p-2.5 rounded-lg bg-slate-50/90 border border-slate-200/70 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-500 flex items-center gap-1 font-semibold">
                          <Clock size={11} className={slaCritico ? 'text-red-500 animate-pulse' : 'text-amber-600'} />
                          SLA REGRESSIVO
                        </span>
                        <span className={`font-bold px-1.5 py-0.2 rounded ${
                          slaCritico ? 'text-red-700 bg-red-100/80' : 'text-amber-800 bg-amber-100/70'
                        }`}>
                          {formatarSLA(c.slaSegundosRestantes)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${prio.barColor} transition-all duration-700`}
                          style={{ width: `${slaPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Solicitante & Status de Alocação */}
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center ring-2 ring-amber-400/70">
                            {getIniciais(c.solicitante)}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 truncate leading-tight">{c.solicitante}</div>
                          <div className="text-[10px] text-slate-400 truncate">{c.setor}</div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 rounded">
                        AGUARDANDO N1
                      </span>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFX.playClick();
                          setChamadoSelecionado(c);
                        }}
                        className="flex-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/90 transition cursor-pointer flex items-center justify-center gap-1"
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
                        className="flex-1 text-[11px] font-semibold text-white bg-slate-900 hover:bg-blue-600 py-1.5 rounded-lg border border-slate-900 hover:border-blue-600 shadow-2xs transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        Assumir OS <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {chamadosFiltrados.filter(c => c.status === 'a_fazer').length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl bg-white/60 border border-dashed border-slate-300 text-xs text-slate-400 font-mono">
                  [QUEUE EMPTY] · Nenhum chamado aguardando triagem.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =================================================================
            COLUNA 2: EM ATENDIMENTO (ACTIVE OPS)
           ================================================================= */}
        <div
          onDragOver={(e) => handleDragOver(e, 'em_andamento')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleDrop(e, 'em_andamento')}
          style={{
            backgroundImage: 'radial-gradient(rgba(37, 99, 235, 0.06) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
          className={`${colunaAtivaMobile === 'em_andamento' ? 'flex' : 'hidden md:flex'} relative rounded-2xl border transition-all duration-200 flex-col justify-between min-h-[540px] overflow-hidden ${
            dragOverCol === 'em_andamento'
              ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-300/50 shadow-lg'
              : 'bg-slate-100/70 border-slate-200/90 shadow-2xs'
          }`}
        >
          {/* Barra de Acento Superior Esculpida */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

          <div className="p-4 space-y-3.5 flex-1">
            {/* Cabeçalho Esculpido da Coluna */}
            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                </span>
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-blue-700">
                    STAGE 02 // ACTIVE FIELD OPS
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Em Atendimento Técnico
                  </h3>
                </div>
              </div>

              <span className="font-mono text-xs font-bold bg-blue-500/10 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-500/25 shadow-2xs">
                {String(chamadosFiltrados.filter(c => c.status === 'em_andamento').length).padStart(2, '0')}
              </span>
            </div>

            {/* Lista de Cartões */}
            <div className="space-y-3">
              {chamadosFiltrados.filter(c => c.status === 'em_andamento').map(c => {
                const prio = getPrioridadeStyle(c.prioridade);
                const slaPercent = getSlaPercent(c);
                const slaCritico = c.slaSegundosRestantes <= 2400;
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
                    className={`relative bg-white rounded-xl p-4 pl-5 border border-slate-200/90 shadow-2xs ${prio.hoverBorder} hover:-translate-y-0.5 transition-all duration-200 space-y-3 cursor-pointer select-none group overflow-hidden ${
                      draggingCardId === c.id ? 'opacity-40 scale-98' : ''
                    }`}
                  >
                    {/* Faixa Lateral de Prioridade */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${prio.strip}`} />

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical size={13} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                        <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                          #{c.codigo}
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-slate-600 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/70">
                          {c.tipo}
                        </span>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${prio.badge}`}>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className={`absolute inline-flex h-full w-full rounded-full ${prio.dot} opacity-75`} />
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${prio.solidDot}`} />
                        </span>
                        {prio.label}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs sm:text-[13px] text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {c.titulo}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {c.descricao}
                      </p>
                    </div>

                    {/* Barra de Progresso de SLA Regressiva com Brilho */}
                    <div className="p-2.5 rounded-lg bg-blue-50/40 border border-blue-200/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-blue-800 flex items-center gap-1 font-semibold">
                          <Zap size={11} className="text-blue-600" />
                          TELEMETRIA SLA ATIVA
                        </span>
                        <span className={`font-bold px-1.5 py-0.2 rounded ${
                          slaCritico ? 'text-red-700 bg-red-100' : 'text-blue-800 bg-blue-100/80'
                        }`}>
                          {formatarSLA(c.slaSegundosRestantes)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${prio.barColor} transition-all duration-700`}
                          style={{ width: `${slaPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Avatar do Técnico com Anel de Status Luminoso */}
                    <div className="px-2.5 py-2 bg-slate-50/90 rounded-lg border border-slate-200/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center ring-2 ring-blue-500 shadow-2xs">
                            {getIniciais(c.tecnico)}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" title="Especialista Online em Campo" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-slate-900 truncate leading-tight">
                            {c.tecnico || 'Especialista Designado'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            Solic.: {c.solicitante}
                          </div>
                        </div>
                      </div>

                      <span className="font-mono text-[9px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded shrink-0 ml-1">
                        EM CAMPO
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
                        className="flex-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/90 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={12} /> Diário ({c.notas?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moverStatus(c.id, 'concluido');
                        }}
                        className="flex-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 py-1.5 rounded-lg border border-emerald-600 shadow-2xs transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Resolver OS
                      </button>
                    </div>
                  </div>
                );
              })}

              {chamadosFiltrados.filter(c => c.status === 'em_andamento').length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl bg-white/60 border border-dashed border-slate-300 text-xs text-slate-400 font-mono">
                  [IDLE] · Arraste um chamado para iniciar atendimento.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =================================================================
            COLUNA 3: CONCLUÍDOS & HOMOLOGADOS
           ================================================================= */}
        <div
          onDragOver={(e) => handleDragOver(e, 'concluido')}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleDrop(e, 'concluido')}
          style={{
            backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.06) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
          className={`${colunaAtivaMobile === 'concluido' ? 'flex' : 'hidden md:flex'} relative rounded-2xl border transition-all duration-200 flex-col justify-between min-h-[540px] overflow-hidden ${
            dragOverCol === 'concluido'
              ? 'bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-300/50 shadow-lg'
              : 'bg-slate-100/70 border-slate-200/90 shadow-2xs'
          }`}
        >
          {/* Barra de Acento Superior Esculpida */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300" />

          <div className="p-4 space-y-3.5 flex-1">
            {/* Cabeçalho Esculpido da Coluna */}
            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <div>
                  <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-700">
                    STAGE 03 // VERIFIED & ARCHIVED
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Concluídos no SLA
                  </h3>
                </div>
              </div>

              <span className="font-mono text-xs font-bold bg-emerald-500/10 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-500/25 shadow-2xs">
                {String(chamadosFiltrados.filter(c => c.status === 'concluido').length).padStart(2, '0')}
              </span>
            </div>

            {/* Lista de Cartões */}
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
                  className={`relative bg-white/95 hover:bg-white rounded-xl p-4 pl-5 border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-[0_12px_28px_-8px_rgba(16,185,129,0.15)] hover:-translate-y-0.5 transition-all duration-200 space-y-3 cursor-pointer select-none group overflow-hidden ${
                    draggingCardId === c.id ? 'opacity-40 scale-98' : ''
                  }`}
                >
                  {/* Faixa Lateral Esmeralda */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-500 to-teal-400" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                        #{c.codigo}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/60">
                        {c.tipo}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={11} /> HOMOLOGADO
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs sm:text-[13px] text-slate-600 line-through leading-snug group-hover:text-slate-900 transition-colors">
                      {c.titulo}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {c.solucao || c.descricao}
                    </p>
                  </div>

                  {/* Barra SLA 100% Concluída */}
                  <div className="space-y-1">
                    <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                    </div>
                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <ShieldCheck size={12} /> SLA CUMPRIDO
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-200 text-[9px] font-bold flex items-center justify-center ring-1 ring-emerald-500">
                          {getIniciais(c.tecnico)}
                        </span>
                        <span>{c.abertoEm.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFX.playClick();
                        setChamadoSelecionado(c);
                      }}
                      className="flex-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg border border-slate-200/90 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <FileText size={12} /> Laudo Técnico
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moverStatus(c.id, 'em_andamento');
                      }}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200/90 transition cursor-pointer flex items-center gap-1"
                      title="Reabrir chamado"
                    >
                      <RotateCcw size={11} /> Reabrir
                    </button>
                  </div>
                </div>
              ))}

              {chamadosFiltrados.filter(c => c.status === 'concluido').length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl bg-white/60 border border-dashed border-slate-300 text-xs text-slate-400 font-mono">
                  [NO RECORDS] · Nenhum chamado concluído neste filtro.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* =====================================================================
          SEÇÃO 3: MODAL DE NOVO CHAMADO (ACABAMENTO DE VIDRO & ATALHOS NOC)
         ===================================================================== */}
      {modalNovo && (
        <div
          className="fixed inset-0 bg-slate-950/55 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setModalNovo(false)}
        >
          <div
            className="relative bg-white/95 backdrop-blur-xl rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-[0_24px_64px_-12px_rgba(15,23,42,0.45)] border border-white/80 ring-1 ring-slate-900/10 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Barra Luminosa Superior */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-700">
                    TERMINAL DE ABERTURA DE OS // NOC SEJU
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 mt-0.5">
                  Registrar Novo Chamado Técnico
                </h3>
              </div>
              <button
                onClick={() => setModalNovo(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Atalhos de Preenchimento Rápido (1 Clique) */}
            <div className="py-4 border-b border-slate-200/70">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Presets de Diagnóstico Rápido (1-Clique)
                </span>
                <span className="text-[10px] font-mono text-blue-600 font-semibold">
                  AUTO-SLA
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    icon: '🖨️',
                    code: 'PRN-01',
                    label: 'Toner / Impressora',
                    tipo: 'TI',
                    prioridade: 'media',
                    titulo: 'Troca de toner da impressora laser HP',
                    desc: 'A impressora do setor está acusando nível de toner esgotado ou falha de fusor. Solicita-se substituição do suprimento preto.'
                  },
                  {
                    icon: '🌐',
                    code: 'NET-P1',
                    label: 'Queda de Link / VPN PR',
                    tipo: 'TI',
                    prioridade: 'urgente',
                    titulo: 'Queda de conectividade de rede e túnel VPN',
                    desc: 'Estação de trabalho sem acesso à rede corporativa do Estado e falha de autenticação no gateway VPN Celepar.'
                  },
                  {
                    icon: '❄️',
                    code: 'HVAC-02',
                    label: 'Climatização / Split',
                    tipo: 'Manutenção',
                    prioridade: 'alta',
                    titulo: 'Falha de refrigeração ou gotejamento no ar-condicionado',
                    desc: 'Aparelho de ar-condicionado da sala apresentando gotejamento interno e baixa eficiência térmica.'
                  },
                  {
                    icon: '📦',
                    code: 'SUP-04',
                    label: 'Insumos & Papel A4',
                    tipo: 'Almoxarifado',
                    prioridade: 'baixa',
                    titulo: 'Reposição de resmas de papel sulfite A4',
                    desc: 'Solicitação de reposição de resmas de papel sulfite A4 alcalino e materiais de expediente para o setor.'
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
                    className="p-2.5 bg-slate-50/90 hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{diag.icon}</span>
                      <span className="text-[11px] font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                        {diag.label}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-blue-600 bg-white px-1.5 py-0.5 rounded border border-slate-200/80 shrink-0">
                      {diag.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCriarChamado} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider font-bold text-slate-600 mb-1.5">
                    Fila Operacional
                  </label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as Chamado['tipo'])}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-semibold text-slate-800 outline-hidden focus:bg-white focus:border-blue-500 transition"
                  >
                    <option value="TI">TI & Redes (NOC)</option>
                    <option value="Manutenção">Manutenção Predial</option>
                    <option value="Almoxarifado">Almoxarifado Central</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider font-bold text-slate-600 mb-1.5">
                    Severidade & SLA
                  </label>
                  <select
                    value={prioridade}
                    onChange={e => setPrioridade(e.target.value as Chamado['prioridade'])}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-semibold text-slate-800 outline-hidden focus:bg-white focus:border-blue-500 transition"
                  >
                    <option value="urgente">P1 · Crítico (SLA 1h)</option>
                    <option value="alta">P2 · Alta (SLA 2h)</option>
                    <option value="media">P3 · Média (SLA 4h)</option>
                    <option value="baixa">P4 · Baixa (SLA 8h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider font-bold text-slate-600 mb-1.5">
                  Título da Ocorrência *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Configuração de certificado ICP-Brasil, falha de switch..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider font-bold text-slate-600 mb-1.5">
                  Especificação Técnica, Sala & Patrimônio *
                </label>
                <textarea
                  required
                  rows={3}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Informe o andar, sala, tag de patrimônio ou sintomas técnicos observados..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-blue-500 transition"
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-200/80">
                <div className="text-[10px] font-mono text-slate-400">
                  SOLICITANTE: <strong className="text-slate-700">{currentUser.nome}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalNovo(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200/90 text-slate-600 font-semibold hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-blue-600 text-white font-semibold shadow-sm transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles size={14} /> Despachar OS
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 4: GAVETA LATERAL DE INSPEÇÃO TÉCNICA (GLASS DRAWER + TIMELINE)
         ===================================================================== */}
      {chamadoInspecionado && (
        <div
          className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-end backdrop-blur-xs animate-in fade-in"
          onClick={() => setChamadoSelecionado(null)}
        >
          <div
            className="relative bg-white/95 backdrop-blur-2xl w-full max-w-xl h-full shadow-[-24px_0_64px_-12px_rgba(15,23,42,0.35)] border-l border-slate-200/90 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Brilho Superior no Drawer */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400" />

            <div className="space-y-5">
              {/* Cabeçalho Técnico do Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-950 bg-slate-100 border border-slate-300/80 px-2.5 py-1 rounded-lg shadow-2xs">
                    #{chamadoInspecionado.codigo}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${getPrioridadeStyle(chamadoInspecionado.prioridade).badge}`}>
                    {getPrioridadeStyle(chamadoInspecionado.prioridade).label}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100/80 border border-slate-200/80 px-2.5 py-1 rounded-full">
                    {chamadoInspecionado.tipo}
                  </span>
                </div>

                <button
                  onClick={() => setChamadoSelecionado(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 border border-transparent hover:border-slate-200 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Título e Especificação */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
                  ESPECIFICAÇÃO DA ORDEM DE SERVIÇO
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                  {chamadoInspecionado.titulo}
                </h3>
                <div className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/90 shadow-inner">
                  {chamadoInspecionado.descricao}
                </div>
              </div>

              {/* Grade de Metadados */}
              <div className="grid grid-cols-2 gap-3 text-xs p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Solicitante</div>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <User size={12} className="text-blue-600" />
                    {chamadoInspecionado.solicitante}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Unidade / Lotação</div>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <Building2 size={12} className="text-indigo-600" />
                    {chamadoInspecionado.setor}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Timestamp Abertura</div>
                  <div className="font-mono text-[11px] font-semibold text-slate-700 mt-0.5">{chamadoInspecionado.abertoEm}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Estágio Operacional</div>
                  <div className="font-mono text-[11px] font-bold uppercase mt-0.5 text-blue-700">
                    {chamadoInspecionado.status === 'a_fazer' ? '01 · EM TRIAGEM' : chamadoInspecionado.status === 'em_andamento' ? '02 · EM ATENDIMENTO' : '03 · CONCLUÍDO'}
                  </div>
                </div>
              </div>

              {/* Designação de Especialista com Avatar e Anel de Status */}
              <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Cpu size={13} className="text-blue-600" /> Especialista Responsável (N2/N3)
                  </label>
                  {chamadoInspecionado.tecnico && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ALOCADO
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center ring-2 ring-blue-500">
                      {getIniciais(chamadoInspecionado.tecnico)}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      chamadoInspecionado.tecnico ? 'bg-emerald-500' : 'bg-amber-400'
                    }`} />
                  </div>

                  <select
                    value={chamadoInspecionado.tecnico || ''}
                    onChange={(e) => handleAtribuirTecnico(e.target.value)}
                    className="flex-1 p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 outline-hidden focus:border-blue-500 shadow-2xs cursor-pointer"
                  >
                    <option value="">-- Aguardando designação de engenheiro --</option>
                    <option value="Rodrigo Mendonça (TI / Redes)">Rodrigo Mendonça (TI / Redes)</option>
                    <option value="Patrícia Lima (Sistemas & Web)">Patrícia Lima (Sistemas & Web)</option>
                    <option value="Lucas Silveira (Hardware & Impressoras)">Lucas Silveira (Hardware & Impressoras)</option>
                    <option value="Almoxarifado Central">Almoxarifado Central</option>
                    <option value="Manutenção Predial">Manutenção Predial</option>
                  </select>
                </div>
              </div>

              {/* Barra de Progresso SLA Luminosa */}
              <div className="p-3.5 bg-slate-950 text-white rounded-xl border border-slate-800 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Clock size={13} className="text-blue-400" /> Cronômetro de SLA Regressivo
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {chamadoInspecionado.status === 'concluido' ? 'FINALIZADO NO PRAZO' : formatarSLA(chamadoInspecionado.slaSegundosRestantes)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      chamadoInspecionado.status === 'concluido'
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                        : chamadoInspecionado.slaSegundosRestantes > 3600
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        : chamadoInspecionado.slaSegundosRestantes > 1800
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                    }`}
                    style={{ width: `${getSlaPercent(chamadoInspecionado)}%` }}
                  />
                </div>
              </div>

              {/* =============================================================
                  TIMELINE DE PARECERES TÉCNICOS COM LINHA VERTICAL LUMINOSA
                 ============================================================= */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-blue-600" /> Timeline de Pareceres Técnicos
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                    {chamadoInspecionado.notas?.length || 0} eventos
                  </span>
                </div>

                <div className="relative pl-6 space-y-3 max-h-56 overflow-y-auto pr-1 py-1">
                  {/* Linha Vertical Luminosa Conectando os Eventos */}
                  <div className="absolute left-2.5 top-2 bottom-2 w-[2px] bg-gradient-to-b from-blue-500 via-indigo-400 to-slate-200 shadow-[0_0_8px_rgba(59,130,246,0.45)]" />

                  {(!chamadoInspecionado.notas || chamadoInspecionado.notas.length === 0) ? (
                    <div className="relative p-3.5 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 font-mono">
                      <span className="absolute -left-[19px] top-4 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                      Nenhum parecer técnico registrado nesta OS.
                    </div>
                  ) : (
                    chamadoInspecionado.notas.map((n, idx) => (
                      <div
                        key={n.id}
                        className="relative p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs text-xs space-y-1 hover:border-blue-300 transition-colors"
                      >
                        {/* Nó Luminoso da Timeline */}
                        <span
                          className={`absolute -left-[19px] top-3.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                            idx === (chamadoInspecionado.notas?.length || 1) - 1
                              ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]'
                              : 'bg-indigo-400'
                          }`}
                        />
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-900 text-white font-mono text-[8px] flex items-center justify-center">
                              {getIniciais(n.autor)}
                            </span>
                            {n.autor}
                          </span>
                          <span className="font-mono text-slate-400">{n.dataHora}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-5">{n.texto}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Input de Novo Parecer Técnico */}
                <form onSubmit={handleAdicionarNota} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={novaNota}
                    onChange={e => setNovaNota(e.target.value)}
                    placeholder="Adicionar parecer técnico, comando executado ou peça trocada..."
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-medium outline-hidden focus:bg-white focus:border-blue-500 transition"
                  />
                  <button
                    type="submit"
                    className="bg-slate-950 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Send size={13} /> Registrar
                  </button>
                </form>
              </div>
            </div>

            {/* Rodapé de Ações do Drawer */}
            <div className="pt-4 border-t border-slate-200/80 mt-4 flex items-center gap-2.5">
              {chamadoInspecionado.status !== 'concluido' ? (
                <>
                  {chamadoInspecionado.status === 'a_fazer' && (
                    <button
                      type="button"
                      onClick={() => {
                        moverStatus(chamadoInspecionado.id, 'em_andamento');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <ArrowUpRight size={15} /> Iniciar Atendimento
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      moverStatus(chamadoInspecionado.id, 'concluido');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 size={15} /> Homologar & Concluir OS
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/25 text-center text-xs font-mono font-bold text-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600" /> OS HOMOLOGADA E ARQUIVADA
                  </div>
                  <button
                    type="button"
                    onClick={() => moverStatus(chamadoInspecionado.id, 'em_andamento')}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} /> Reabrir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
