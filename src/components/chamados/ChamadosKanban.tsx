import { ModuloCabecalho, AcaoModulo, NumeroModulo } from '../modulo/ModuloCabecalho';
import React, { useState, useEffect } from 'react';
import { Usuario } from '../../types';
import { soundFX } from '../../services/soundFx';
import { eventBus } from '../../services/eventBus';
import { 
  
  Plus, 
  Clock, 
  CheckCircle2, 
  User, 
  
  GripVertical,
  Sparkles,
  Check,
  Search,
  MessageSquare,
  Send,
  X,
  FileText,
  
  SlidersHorizontal,
  ShieldCheck,
  ArrowUpRight,
  RotateCcw,
  
  
  Cpu,
  Zap,
  
  
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
    const chamadoAlvo = chamados.find(c => c.id === id);
    if (chamadoAlvo && chamadoAlvo.status !== novoStatus) {
      eventBus.emit('chamado.status_alterado', {
        chamadoId: chamadoAlvo.codigo,
        titulo: chamadoAlvo.titulo,
        statusAnterior: chamadoAlvo.status,
        novoStatus,
        responsavel: currentUser.nome
      });
    }

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

    eventBus.emit('chamado.criado', {
      chamadoId: novo.codigo,
      titulo: novo.titulo,
      prioridade: novo.prioridade,
      setor: novo.setor,
      solicitante: novo.solicitante
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
          badge: 'bg-[#C8372D]/10 text-[var(--danger)] border-[var(--danger)]/25 ',
          dot: 'bg-[#C8372D] ',
          solidDot: 'bg-[#B42318]',
          strip: 'bg-[#C8372D]  ',
          barColor: 'bg-[#C8372D]  ',
          hoverBorder: 'hover:border-[var(--danger-border)]/90 ',
          label: 'CRÍTICO · P1'
        };
      case 'alta':
        return {
          badge: 'bg-[#D98A00]/10 text-[var(--warning)] border-[var(--warning)]/25',
          dot: 'bg-[#D98A00]',
          solidDot: 'bg-[#D98A00]',
          strip: 'bg-[#D98A00]  ',
          barColor: 'bg-[#D98A00]  ',
          hoverBorder: 'hover:border-[var(--warning-border)]/90 ',
          label: 'ALTA · P2'
        };
      case 'media':
        return {
          badge: 'bg-[#0072BB]/10 text-[var(--brand)] border-[var(--brand)]/25',
          dot: 'bg-[#0072BB]',
          solidDot: 'bg-[#0072BB]',
          strip: 'bg-[#0072BB]  ',
          barColor: 'bg-[#0072BB]  ',
          hoverBorder: 'hover:border-[var(--brand-border)]/90 ',
          label: 'MÉDIA · P3'
        };
      default:
        return {
          badge: 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--border-strong)]/25',
          dot: 'bg-[var(--text-subtle)]',
          solidDot: 'bg-[var(--text-subtle)]',
          strip: 'bg-[var(--text-subtle)]  ',
          barColor: 'bg-[var(--text-muted)] ',
          hoverBorder: 'hover:border-[var(--border-strong)] ',
          label: 'BAIXA · P4'
        };
    }
  };

  return (
    <div className="space-y-5 font-sans">
      <ModuloCabecalho
        cor="noite"
        rotulo="Atendimento · TI, Manutenção e Almoxarifado"
        titulo="Chamados"
        descricao="Abra um pedido de suporte, acompanhe o prazo de atendimento e veja quem está cuidando do seu caso."
        onVoltar={onVoltarHub}
        acoes={
          <AcaoModulo
            destaque
            icone={<Plus size={15} />}
            onClick={() => {
              soundFX.playClick();
              setModalNovo(true);
            }}
          >
            Abrir chamado
          </AcaoModulo>
        }
      >
        <div className="flex flex-wrap gap-2">
          <NumeroModulo rotulo="Em aberto" valor={totalAtivos} detalhe={`de ${totalChamados} no total`} />
          <NumeroModulo rotulo="Prazo vencendo" valor={totalUrgentesSla} detalhe="menos de 1 hora" />
          <NumeroModulo rotulo="Em atendimento" valor={totalEmAndamento} />
          <NumeroModulo rotulo="Resolvidos" valor={`${taxaResolucao}%`} detalhe={`${totalConcluidos} chamados`} />
        </div>
      </ModuloCabecalho>

      <div className="relative bg-[var(--surface)] rounded-[18px] border border-[var(--border)] overflow-hidden">
        <div className="p-5 sm:p-6 space-y-6">
          {/* =================================================================
              SEÇÃO 2: BARRA DE BUSCA & FILTROS SEGMENTADOS (TACTILE MACHINED)
             ================================================================= */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5">
            
            {/* Busca Rápida Estilo Command Bar */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="text"
                value={buscaChamado}
                onChange={e => setBuscaChamado(e.target.value)}
                placeholder="Filtrar por #código, assunto, solicitante ou especialista..."
                className="w-full text-xs pl-9 pr-16 py-2.5 bg-[var(--surface-2)]/70 hover:bg-[var(--surface-2)] focus:bg-[var(--surface)] border border-[var(--border)]/90 rounded-xl outline-hidden focus:ring-2 focus:ring-[var(--brand)]/15 focus:border-[var(--brand)] transition-all text-[var(--text)] placeholder:text-[var(--text-subtle)] font-medium "
              />
              {buscaChamado ? (
                <button
                  onClick={() => setBuscaChamado('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text)] bg-[var(--surface-3)]/70 hover:bg-[var(--surface-3)] p-1 rounded-md cursor-pointer transition"
                >
                  <X size={12} />
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums text-[var(--text-subtle)] bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)]/80 shadow-2xs pointer-events-none">
                  ⌘K
                </span>
              )}
            </div>

            {/* Controles Segmentados Usinados com Contadores em Pílulas */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Filtro Segmentado de Categoria */}
              <div className="flex items-center gap-1 bg-[#0B1B2E]/[0.04] p-1 rounded-xl border border-[var(--border)]/90 ">
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
                          ? 'bg-[var(--surface)] text-[var(--text)] font-semibold  border border-[var(--border)]/90'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)] font-medium border border-transparent'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span
                        className={`text-[10px] tabular-nums px-1.5 py-0.2 rounded-full transition-colors ${
                          ativo
                            ? 'bg-[#0B1B2E] text-white font-bold'
                            : 'bg-[var(--surface-3)]/80 text-[var(--text-muted)]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Filtro Segmentado de Prioridade */}
              <div className="flex items-center gap-1 bg-[#0B1B2E]/[0.04] p-1 rounded-xl border border-[var(--border)]/90 ">
                {[
                  { id: 'todas', label: 'Prioridade', dot: 'bg-[var(--text-subtle)]' },
                  { id: 'urgente', label: 'Críticas', dot: 'bg-[#C8372D]' },
                  { id: 'alta', label: 'Altas', dot: 'bg-[#D98A00]' },
                  { id: 'media', label: 'Médias', dot: 'bg-[#0072BB]' }
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
                          ? 'bg-[var(--surface)] text-[var(--text)] font-semibold  border border-[var(--border)]/90'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)] font-medium border border-transparent'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                      <span>{p.label}</span>
                      <span
                        className={`text-[10px] tabular-nums px-1.5 py-0.2 rounded-full transition-colors ${
                          ativo
                            ? 'bg-[#0B1B2E] text-white font-bold'
                            : 'bg-[var(--surface-3)]/80 text-[var(--text-muted)]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Contador de Resultados Visíveis */}
              <div className="hidden 2xl:flex items-center gap-1.5 text-[11px] tabular-nums text-[var(--text-muted)] pl-2 border-l border-[var(--border)]">
                <SlidersHorizontal size={12} className="text-[var(--brand)]" />
                <span className="font-bold text-[var(--text)]">{chamadosFiltrados.length}</span>
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
      <div className="md:hidden flex bg-[var(--surface)] p-1.5 rounded-[18px] border border-[var(--border)]/90 shadow-2xs gap-1 text-xs">
        {[
          { id: 'a_fazer' as const, label: 'Triagem', dot: 'bg-[#D98A00]' },
          { id: 'em_andamento' as const, label: 'Atendimento', dot: 'bg-[#0072BB]' },
          { id: 'concluido' as const, label: 'Concluídos', dot: 'bg-[#00A859]' }
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
                  ? 'bg-[#0B1B2E] text-white font-semibold shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] font-medium'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
              <span>{col.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                active ? 'bg-white/20 text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
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
          className={`${colunaAtivaMobile === 'a_fazer' ? 'flex' : 'hidden md:flex'} relative rounded-[18px] border transition-all duration-200 flex-col justify-between min-h-[540px] overflow-hidden ${
            dragOverCol === 'a_fazer'
              ? 'bg-[var(--warning-soft)]/50 border-[var(--warning)] ring-2 ring-[var(--warning-border)]/50 '
              : 'bg-[var(--surface-2)]/70 border-[var(--border)]/90 shadow-2xs'
          }`}
        >
          {/* Barra de Acento Superior Esculpida */}
          <div className="h-1.5 w-full bg-[#D98A00]  " />

          <div className="p-4 space-y-3.5 flex-1">
            {/* Cabeçalho Esculpido da Coluna */}
            <div className="bg-[var(--surface)]/90 rounded-xl p-3 border border-[var(--border)]/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className=" absolute inline-flex h-full w-full rounded-full bg-[#D98A00] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D98A00]" />
                </span>
                <div>
                  <div className="text-[9px] tabular-nums font-bold uppercase tracking-widest text-[var(--warning)]">
                    Etapa 1 · Novos
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    Triagem & Despacho
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="tabular-nums text-xs font-bold bg-[#D98A00]/10 text-[var(--warning)] px-2.5 py-1 rounded-lg border border-[var(--warning)]/25 shadow-2xs">
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
                    className={`relative bg-[var(--surface)] rounded-xl p-4 pl-5 border border-[var(--border)]/90 shadow-2xs ${prio.hoverBorder} hover:-translate-y-0.5 transition-all duration-200 space-y-3 cursor-pointer select-none group overflow-hidden ${
                      draggingCardId === c.id ? 'opacity-40 scale-98' : ''
                    }`}
                  >
                    {/* Faixa Lateral de Prioridade */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${prio.strip}`} />

                    {/* Topo: Tag Monoespaçada + Prioridade */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical size={13} className="text-[var(--ink-muted)] group-hover:text-[var(--text-muted)] transition-colors" />
                        <span className="tabular-nums text-[11px] font-bold text-[var(--text)] bg-[var(--surface-2)] px-2 py-0.5 rounded-md border border-[var(--border)]/90 group-hover:border-[var(--border-strong)]">
                          #{c.codigo}
                        </span>
                        <span className="tabular-nums text-[10px] font-semibold text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]/70">
                          {c.tipo}
                        </span>
                      </div>

                      <span className={`text-[10px] tabular-nums font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${prio.badge}`}>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className={`absolute inline-flex h-full w-full rounded-full ${prio.dot} opacity-75`} />
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${prio.solidDot}`} />
                        </span>
                        {prio.label}
                      </span>
                    </div>

                    {/* Título & Descrição */}
                    <div>
                      <h4 className="font-bold text-xs sm:text-[13px] text-[var(--text)] leading-snug group-hover:text-[var(--brand)] transition-colors">
                        {c.titulo}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                        {c.descricao}
                      </p>
                    </div>

                    {/* Barra de Progresso de SLA Regressiva com Brilho */}
                    <div className="p-2.5 rounded-lg bg-[var(--surface-2)]/90 border border-[var(--border)]/70 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] tabular-nums">
                        <span className="text-[var(--text-muted)] flex items-center gap-1 font-semibold">
                          <Clock size={11} className={slaCritico ? 'text-[var(--danger)] ' : 'text-[var(--warning)]'} />
                          Prazo restante
                        </span>
                        <span className={`font-bold px-1.5 py-0.2 rounded ${
                          slaCritico ? 'text-[var(--danger)] bg-[var(--danger-soft)]/80' : 'text-[var(--warning)] bg-[var(--warning-soft)]/70'
                        }`}>
                          {formatarSLA(c.slaSegundosRestantes)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--surface-3)]/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${prio.barColor} transition-all duration-700`}
                          style={{ width: `${slaPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Solicitante & Status de Alocação */}
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] text-[var(--text)] tabular-nums text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--warning)]/70">
                            {getIniciais(c.solicitante)}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#D98A00] ring-1 ring-white" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-[var(--text)] truncate leading-tight">{c.solicitante}</div>
                          <div className="text-[10px] text-[var(--text-subtle)] truncate">{c.setor}</div>
                        </div>
                      </div>

                      <span className="text-[10px] tabular-nums text-[var(--warning)] bg-[var(--warning-soft)] border border-[var(--warning-border)]/70 px-1.5 py-0.5 rounded">
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
                        className="flex-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--surface-2)] hover:bg-[var(--surface-2)] py-1.5 rounded-lg border border-[var(--border)]/90 transition cursor-pointer flex items-center justify-center gap-1"
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
                        className="flex-1 text-[11px] font-semibold text-white bg-[#0B1B2E] hover:bg-[#0072BB] py-1.5 rounded-lg border border-[#22324C] hover:border-[var(--brand)] shadow-2xs transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        Assumir OS <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {chamadosFiltrados.filter(c => c.status === 'a_fazer').length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl bg-[var(--surface)]/60 border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-subtle)] tabular-nums">
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
          className={`${colunaAtivaMobile === 'em_andamento' ? 'flex' : 'hidden md:flex'} relative rounded-[18px] border transition-all duration-200 flex-col justify-between min-h-[540px] overflow-hidden ${
            dragOverCol === 'em_andamento'
              ? 'bg-[var(--brand-soft)]/50 border-[var(--brand)] ring-2 ring-[var(--brand-border)]/50 '
              : 'bg-[var(--surface-2)]/70 border-[var(--border)]/90 shadow-2xs'
          }`}
        >
          {/* Barra de Acento Superior Esculpida */}
          <div className="h-1.5 w-full bg-[#0072BB]  " />

          <div className="p-4 space-y-3.5 flex-1">
            {/* Cabeçalho Esculpido da Coluna */}
            <div className="bg-[var(--surface)]/90 rounded-xl p-3 border border-[var(--border)]/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className=" absolute inline-flex h-full w-full rounded-full bg-[#0072BB] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0072BB]" />
                </span>
                <div>
                  <div className="text-[9px] tabular-nums font-bold uppercase tracking-widest text-[var(--brand)]">
                    Etapa 2 · Em atendimento
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    Em Atendimento Técnico
                  </h3>
                </div>
              </div>

              <span className="tabular-nums text-xs font-bold bg-[#0072BB]/10 text-[var(--brand)] px-2.5 py-1 rounded-lg border border-[var(--brand)]/25 shadow-2xs">
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
                    className={`relative bg-[var(--surface)] rounded-xl p-4 pl-5 border border-[var(--border)]/90 shadow-2xs ${prio.hoverBorder} hover:-translate-y-0.5 transition-all duration-200 space-y-3 cursor-pointer select-none group overflow-hidden ${
                      draggingCardId === c.id ? 'opacity-40 scale-98' : ''
                    }`}
                  >
                    {/* Faixa Lateral de Prioridade */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${prio.strip}`} />

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical size={13} className="text-[var(--ink-muted)] group-hover:text-[var(--text-muted)] transition-colors" />
                        <span className="tabular-nums text-[11px] font-bold text-[var(--brand)] bg-[var(--brand-soft)] px-2 py-0.5 rounded-md border border-[var(--brand-border)]/80">
                          #{c.codigo}
                        </span>
                        <span className="tabular-nums text-[10px] font-semibold text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]/70">
                          {c.tipo}
                        </span>
                      </div>

                      <span className={`text-[10px] tabular-nums font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${prio.badge}`}>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className={`absolute inline-flex h-full w-full rounded-full ${prio.dot} opacity-75`} />
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${prio.solidDot}`} />
                        </span>
                        {prio.label}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs sm:text-[13px] text-[var(--text)] leading-snug group-hover:text-[var(--brand)] transition-colors">
                        {c.titulo}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                        {c.descricao}
                      </p>
                    </div>

                    {/* Barra de Progresso de SLA Regressiva com Brilho */}
                    <div className="p-2.5 rounded-lg bg-[var(--brand-soft)]/40 border border-[var(--brand-border)]/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] tabular-nums">
                        <span className="text-[var(--brand)] flex items-center gap-1 font-semibold">
                          <Zap size={11} className="text-[var(--brand)]" />
                          Prazo em andamento
                        </span>
                        <span className={`font-bold px-1.5 py-0.2 rounded ${
                          slaCritico ? 'text-[var(--danger)] bg-[var(--danger-soft)]' : 'text-[var(--brand)] bg-[var(--brand-soft)]/80'
                        }`}>
                          {formatarSLA(c.slaSegundosRestantes)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--surface-3)]/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${prio.barColor} transition-all duration-700`}
                          style={{ width: `${slaPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Avatar do Técnico com Anel de Status Luminoso */}
                    <div className="px-2.5 py-2 bg-[var(--surface-2)]/90 rounded-lg border border-[var(--border)]/80 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-6 h-6 rounded-full bg-[#0B1B2E] text-white tabular-nums text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--brand)] shadow-2xs">
                            {getIniciais(c.tecnico)}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00A859] ring-2 ring-white" title="Especialista Online em Campo" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-[var(--text)] truncate leading-tight">
                            {c.tecnico || 'Especialista Designado'}
                          </div>
                          <div className="text-[10px] text-[var(--text-subtle)] truncate">
                            Solic.: {c.solicitante}
                          </div>
                        </div>
                      </div>

                      <span className="tabular-nums text-[9px] font-bold text-[var(--brand)] bg-[var(--brand-soft)]/70 px-1.5 py-0.5 rounded shrink-0 ml-1">
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
                        className="flex-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--surface-2)] hover:bg-[var(--surface-2)] py-1.5 rounded-lg border border-[var(--border)]/90 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={12} /> Diário ({c.notas?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moverStatus(c.id, 'concluido');
                        }}
                        className="flex-1 text-[11px] font-semibold text-white bg-[#00703C] hover:bg-[#00A859] py-1.5 rounded-lg border border-[var(--verde)] shadow-2xs transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Resolver OS
                      </button>
                    </div>
                  </div>
                );
              })}

              {chamadosFiltrados.filter(c => c.status === 'em_andamento').length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl bg-[var(--surface)]/60 border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-subtle)] tabular-nums">
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
          className={`${colunaAtivaMobile === 'concluido' ? 'flex' : 'hidden md:flex'} relative rounded-[18px] border transition-all duration-200 flex-col justify-between min-h-[540px] overflow-hidden ${
            dragOverCol === 'concluido'
              ? 'bg-[var(--verde-soft)]/50 border-[var(--verde)] ring-2 ring-[var(--verde-border)]/50 '
              : 'bg-[var(--surface-2)]/70 border-[var(--border)]/90 shadow-2xs'
          }`}
        >
          {/* Barra de Acento Superior Esculpida */}
          <div className="h-1.5 w-full bg-[#00A859]  " />

          <div className="p-4 space-y-3.5 flex-1">
            {/* Cabeçalho Esculpido da Coluna */}
            <div className="bg-[var(--surface)]/90 rounded-xl p-3 border border-[var(--border)]/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00A859]" />
                </span>
                <div>
                  <div className="text-[9px] tabular-nums font-bold uppercase tracking-widest text-[var(--verde)]">
                    Etapa 3 · Encerrados
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    Concluídos no SLA
                  </h3>
                </div>
              </div>

              <span className="tabular-nums text-xs font-bold bg-[#00A859]/10 text-[var(--verde)] px-2.5 py-1 rounded-lg border border-[var(--verde)]/25 shadow-2xs">
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
                  className={`relative bg-[var(--surface)]/95 hover:bg-[var(--surface)] rounded-xl p-4 pl-5 border border-[var(--border)]/90 shadow-2xs hover:border-[var(--verde-border)] hover:-translate-y-0.5 transition-all duration-200 space-y-3 cursor-pointer select-none group overflow-hidden ${
                    draggingCardId === c.id ? 'opacity-40 scale-98' : ''
                  }`}
                >
                  {/* Faixa Lateral Esmeralda */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00A859] " />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="tabular-nums text-[11px] font-bold text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-md border border-[var(--border)]/80">
                        #{c.codigo}
                      </span>
                      <span className="tabular-nums text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]/60">
                        {c.tipo}
                      </span>
                    </div>

                    <span className="text-[10px] tabular-nums font-bold text-[var(--verde)] bg-[#00A859]/10 border border-[var(--verde)]/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={11} /> HOMOLOGADO
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs sm:text-[13px] text-[var(--text-muted)] line-through leading-snug group-hover:text-[var(--text)] transition-colors">
                      {c.titulo}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                      {c.solucao || c.descricao}
                    </p>
                  </div>

                  {/* Barra SLA 100% Concluída */}
                  <div className="space-y-1">
                    <div className="w-full h-1 bg-[var(--verde-soft)] rounded-full overflow-hidden">
                      <div className="h-full w-full bg-[#00A859] rounded-full" />
                    </div>
                    <div className="pt-1 flex items-center justify-between text-[10px] tabular-nums text-[var(--text-subtle)]">
                      <span className="flex items-center gap-1 text-[var(--verde)] font-semibold">
                        <ShieldCheck size={12} /> SLA CUMPRIDO
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#0B1B2E] text-[#C6E86B] text-[9px] font-bold flex items-center justify-center ring-1 ring-[var(--verde)]">
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
                      className="flex-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--surface-2)] hover:bg-[var(--surface-2)] py-1.5 rounded-lg border border-[var(--border)]/90 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <FileText size={12} /> Laudo Técnico
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moverStatus(c.id, 'em_andamento');
                      }}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg border border-[var(--border)]/90 transition cursor-pointer flex items-center gap-1"
                      title="Reabrir chamado"
                    >
                      <RotateCcw size={11} /> Reabrir
                    </button>
                  </div>
                </div>
              ))}

              {chamadosFiltrados.filter(c => c.status === 'concluido').length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl bg-[var(--surface)]/60 border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-subtle)] tabular-nums">
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
          className="fixed inset-0 bg-[#0B1B2E]/55 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
          onClick={() => setModalNovo(false)}
        >
          <div
            className="relative bg-[var(--surface)]/95 rounded-[18px] max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 border border-white/80 ring-1 ring-[#22324C]/10 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Barra Luminosa Superior */}
            <div className="absolute inset-x-0 top-0 h-1 bg-[#0072BB]  " />

            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]/80">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0072BB] " />
                  <span className="text-[10px] tabular-nums font-bold uppercase tracking-widest text-[var(--brand)]">
                    TERMINAL DE ABERTURA DE OS // NOC SEJU
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5">
                  Registrar Novo Chamado Técnico
                </h3>
              </div>
              <button
                onClick={() => setModalNovo(false)}
                className="p-2 rounded-xl text-[var(--text-subtle)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] border border-transparent hover:border-[var(--border)] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Atalhos de Preenchimento Rápido (1 Clique) */}
            <div className="py-4 border-b border-[var(--border)]/70">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] tabular-nums font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Presets de Diagnóstico Rápido (1-Clique)
                </span>
                <span className="text-[10px] tabular-nums text-[var(--brand)] font-semibold">
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
                    className="p-2.5 bg-[var(--surface-2)]/90 hover:bg-[var(--brand-soft)]/60 border border-[var(--border)]/90 hover:border-[var(--brand-border)] rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{diag.icon}</span>
                      <span className="text-[11px] font-semibold text-[var(--text)] group-hover:text-[var(--brand)] truncate">
                        {diag.label}
                      </span>
                    </div>
                    <span className="text-[9px] tabular-nums font-bold text-[var(--text-subtle)] group-hover:text-[var(--brand)] bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)]/80 shrink-0">
                      {diag.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCriarChamado} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block tabular-nums text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] mb-1.5">
                    Fila Operacional
                  </label>
                  <select
                    value={tipo}
                    onChange={e => setTipo(e.target.value as Chamado['tipo'])}
                    className="w-full p-2.5 bg-[var(--surface-2)] border border-[var(--border)]/90 rounded-xl font-semibold text-[var(--text)] outline-hidden focus:bg-[var(--surface)] focus:border-[var(--brand)] transition"
                  >
                    <option value="TI">TI & Redes (NOC)</option>
                    <option value="Manutenção">Manutenção Predial</option>
                    <option value="Almoxarifado">Almoxarifado Central</option>
                  </select>
                </div>

                <div>
                  <label className="block tabular-nums text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] mb-1.5">
                    Severidade & SLA
                  </label>
                  <select
                    value={prioridade}
                    onChange={e => setPrioridade(e.target.value as Chamado['prioridade'])}
                    className="w-full p-2.5 bg-[var(--surface-2)] border border-[var(--border)]/90 rounded-xl font-semibold text-[var(--text)] outline-hidden focus:bg-[var(--surface)] focus:border-[var(--brand)] transition"
                  >
                    <option value="urgente">P1 · Crítico (SLA 1h)</option>
                    <option value="alta">P2 · Alta (SLA 2h)</option>
                    <option value="media">P3 · Média (SLA 4h)</option>
                    <option value="baixa">P4 · Baixa (SLA 8h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block tabular-nums text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] mb-1.5">
                  Título da Ocorrência *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Configuração de certificado ICP-Brasil, falha de switch..."
                  className="w-full p-2.5 bg-[var(--surface-2)] border border-[var(--border)]/90 rounded-xl font-medium text-[var(--text)] outline-hidden focus:bg-[var(--surface)] focus:border-[var(--brand)] transition"
                />
              </div>

              <div>
                <label className="block tabular-nums text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] mb-1.5">
                  Especificação Técnica, Sala & Patrimônio *
                </label>
                <textarea
                  required
                  rows={3}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Informe o andar, sala, tag de patrimônio ou sintomas técnicos observados..."
                  className="w-full p-2.5 bg-[var(--surface-2)] border border-[var(--border)]/90 rounded-xl font-medium text-[var(--text)] outline-hidden focus:bg-[var(--surface)] focus:border-[var(--brand)] transition"
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-2 border-t border-[var(--border)]/80">
                <div className="text-[10px] tabular-nums text-[var(--text-subtle)]">
                  SOLICITANTE: <strong className="text-[var(--text)]">{currentUser.nome}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalNovo(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--border)]/90 text-[var(--text-muted)] font-semibold hover:bg-[var(--surface-2)] transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0B1B2E] hover:bg-[#0072BB] text-white font-semibold shadow-sm transition cursor-pointer flex items-center gap-1.5"
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
          className="fixed inset-0 bg-[#0B1B2E]/50 z-50 flex items-center justify-end animate-in fade-in"
          onClick={() => setChamadoSelecionado(null)}
        >
          <div
            className="relative bg-[var(--surface)]/95 w-full max-w-xl h-full border-l border-[var(--border)]/90 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-[#0072BB]  " />

            <div className="space-y-5">
              {/* Cabeçalho Técnico do Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]/80">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tabular-nums text-xs font-bold text-[var(--text)] bg-[var(--surface-2)] border border-[var(--border-strong)]/80 px-2.5 py-1 rounded-lg shadow-2xs">
                    #{chamadoInspecionado.codigo}
                  </span>
                  <span className={`text-[10px] tabular-nums font-bold px-2.5 py-1 rounded-full border ${getPrioridadeStyle(chamadoInspecionado.prioridade).badge}`}>
                    {getPrioridadeStyle(chamadoInspecionado.prioridade).label}
                  </span>
                  <span className="text-[10px] tabular-nums font-semibold text-[var(--text-muted)] bg-[var(--surface-2)]/80 border border-[var(--border)]/80 px-2.5 py-1 rounded-full">
                    {chamadoInspecionado.tipo}
                  </span>
                </div>

                <button
                  onClick={() => setChamadoSelecionado(null)}
                  className="p-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-subtle)] hover:text-[var(--text)] border border-transparent hover:border-[var(--border)] transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Título e Especificação */}
              <div>
                <div className="text-[10px] tabular-nums uppercase tracking-widest text-[var(--text-subtle)] font-bold mb-1">
                  ESPECIFICAÇÃO DA ORDEM DE SERVIÇO
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--text)] leading-snug">
                  {chamadoInspecionado.titulo}
                </h3>
                <div className="text-xs text-[var(--text-muted)] mt-2.5 leading-relaxed bg-[var(--surface-2)]/90 p-3.5 rounded-xl border border-[var(--border)]/90 ">
                  {chamadoInspecionado.descricao}
                </div>
              </div>

              {/* Grade de Metadados */}
              <div className="grid grid-cols-2 gap-3 text-xs p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]/90 shadow-2xs">
                <div>
                  <div className="text-[10px] tabular-nums font-bold text-[var(--text-subtle)] uppercase">Solicitante</div>
                  <div className="font-bold text-[var(--text)] mt-0.5 flex items-center gap-1.5">
                    <User size={12} className="text-[var(--brand)]" />
                    {chamadoInspecionado.solicitante}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] tabular-nums font-bold text-[var(--text-subtle)] uppercase">Unidade / Lotação</div>
                  <div className="font-bold text-[var(--text)] mt-0.5 flex items-center gap-1.5">
                    <Building2 size={12} className="text-[var(--brand)]" />
                    {chamadoInspecionado.setor}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] tabular-nums font-bold text-[var(--text-subtle)] uppercase">Timestamp Abertura</div>
                  <div className="tabular-nums text-[11px] font-semibold text-[var(--text)] mt-0.5">{chamadoInspecionado.abertoEm}</div>
                </div>
                <div>
                  <div className="text-[10px] tabular-nums font-bold text-[var(--text-subtle)] uppercase">Estágio Operacional</div>
                  <div className="tabular-nums text-[11px] font-bold uppercase mt-0.5 text-[var(--brand)]">
                    {chamadoInspecionado.status === 'a_fazer' ? '01 · EM TRIAGEM' : chamadoInspecionado.status === 'em_andamento' ? '02 · EM ATENDIMENTO' : '03 · CONCLUÍDO'}
                  </div>
                </div>
              </div>

              {/* Designação de Especialista com Avatar e Anel de Status */}
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/90 border border-[var(--border)]/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] tabular-nums font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <Cpu size={13} className="text-[var(--brand)]" /> Especialista Responsável (N2/N3)
                  </label>
                  {chamadoInspecionado.tecnico && (
                    <span className="inline-flex items-center gap-1 text-[10px] tabular-nums font-semibold text-[var(--verde)] bg-[#00A859]/10 px-2 py-0.5 rounded-full border border-[var(--verde)]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A859] " />
                      ALOCADO
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#0B1B2E] text-white tabular-nums text-xs font-bold flex items-center justify-center ring-2 ring-[var(--brand)]">
                      {getIniciais(chamadoInspecionado.tecnico)}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      chamadoInspecionado.tecnico ? 'bg-[#00A859]' : 'bg-[#D98A00]'
                    }`} />
                  </div>

                  <select
                    value={chamadoInspecionado.tecnico || ''}
                    onChange={(e) => handleAtribuirTecnico(e.target.value)}
                    className="flex-1 p-2.5 bg-[var(--surface)] border border-[var(--border)]/90 rounded-xl text-xs font-semibold text-[var(--text)] outline-hidden focus:border-[var(--brand)] shadow-2xs cursor-pointer"
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
              <div className="p-3.5 bg-[#0B1B2E] text-white rounded-xl border border-[#22324C] space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="tabular-nums text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)] flex items-center gap-1.5">
                    <Clock size={13} className="text-[var(--brand)]" /> Cronômetro de SLA Regressivo
                  </span>
                  <span className="tabular-nums text-sm font-bold text-[var(--verde)]">
                    {chamadoInspecionado.status === 'concluido' ? 'FINALIZADO NO PRAZO' : formatarSLA(chamadoInspecionado.slaSegundosRestantes)}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#0B1B2E] rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      chamadoInspecionado.status === 'concluido'
                        ? ' bg-[#00A859]  '
                        : chamadoInspecionado.slaSegundosRestantes > 3600
                        ? ' bg-[#00A859]  '
                        : chamadoInspecionado.slaSegundosRestantes > 1800
                        ? ' bg-[#D98A00]  '
                        : ' bg-[#C8372D]  '
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
                  <span className="text-[11px] tabular-nums font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-[var(--brand)]" /> Timeline de Pareceres Técnicos
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] tabular-nums bg-[var(--surface-2)] px-2 py-0.5 rounded-md border border-[var(--border)]/80">
                    {chamadoInspecionado.notas?.length || 0} eventos
                  </span>
                </div>

                <div className="relative pl-6 space-y-3 max-h-56 overflow-y-auto pr-1 py-1">
                  {/* Linha Vertical Luminosa Conectando os Eventos */}
                  <div className="absolute left-2.5 top-2 bottom-2 w-[2px] bg-[#0072BB]   " />

                  {(!chamadoInspecionado.notas || chamadoInspecionado.notas.length === 0) ? (
                    <div className="relative p-3.5 bg-[var(--surface-2)]/70 rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--text-subtle)] tabular-nums">
                      <span className="absolute -left-[19px] top-4 w-2.5 h-2.5 rounded-full bg-[var(--border-strong)] ring-4 ring-white" />
                      Nenhum parecer técnico registrado nesta OS.
                    </div>
                  ) : (
                    chamadoInspecionado.notas.map((n, idx) => (
                      <div
                        key={n.id}
                        className="relative p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]/90 shadow-2xs text-xs space-y-1 hover:border-[var(--brand-border)] transition-colors"
                      >
                        {/* Nó Luminoso da Timeline */}
                        <span
                          className={`absolute -left-[19px] top-3.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                            idx === (chamadoInspecionado.notas?.length || 1) - 1
                              ? 'bg-[#0072BB] '
                              : 'bg-[#0072BB]'
                          }`}
                        />
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[var(--text)] flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#0B1B2E] text-white tabular-nums text-[8px] flex items-center justify-center">
                              {getIniciais(n.autor)}
                            </span>
                            {n.autor}
                          </span>
                          <span className="tabular-nums text-[var(--text-subtle)]">{n.dataHora}</span>
                        </div>
                        <p className="text-[var(--text-muted)] leading-relaxed pl-5">{n.texto}</p>
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
                    className="flex-1 p-2.5 bg-[var(--surface-2)] border border-[var(--border)]/90 rounded-xl text-xs font-medium outline-hidden focus:bg-[var(--surface)] focus:border-[var(--brand)] transition"
                  />
                  <button
                    type="submit"
                    className="bg-[#0B1B2E] hover:bg-[#0072BB] text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Send size={13} /> Registrar
                  </button>
                </form>
              </div>
            </div>

            {/* Rodapé de Ações do Drawer */}
            <div className="pt-4 border-t border-[var(--border)]/80 mt-4 flex items-center gap-2.5">
              {chamadoInspecionado.status !== 'concluido' ? (
                <>
                  {chamadoInspecionado.status === 'a_fazer' && (
                    <button
                      type="button"
                      onClick={() => {
                        moverStatus(chamadoInspecionado.id, 'em_andamento');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-[#0072BB] hover:bg-[#005A9C] text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <ArrowUpRight size={15} /> Iniciar Atendimento
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      moverStatus(chamadoInspecionado.id, 'concluido');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#00703C] hover:bg-[#00A859] text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 size={15} /> Homologar & Concluir OS
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 p-2.5 bg-[#00A859]/10 rounded-xl border border-[var(--verde)]/25 text-center text-xs tabular-nums font-bold text-[var(--verde)] flex items-center justify-center gap-2">
                    <CheckCircle2 size={15} className="text-[var(--verde)]" /> OS HOMOLOGADA E ARQUIVADA
                  </div>
                  <button
                    type="button"
                    onClick={() => moverStatus(chamadoInspecionado.id, 'em_andamento')}
                    className="px-3.5 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] transition cursor-pointer flex items-center gap-1.5"
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
