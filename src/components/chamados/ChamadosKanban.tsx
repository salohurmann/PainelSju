import React, { useEffect, useState } from 'react';
import { Janela } from '../ui/Janela';
import { Usuario } from '../../types';
import { soundFX } from '../../services/soundFx';
import { eventBus } from '../../services/eventBus';
import { temPermissao } from '../../services/rbac';
import { ModuloCabecalho, AcaoModulo, NumeroModulo, AbasModulo } from '../modulo/ModuloCabecalho';
import { Plus, Search, Check, RotateCcw, Send, Clock, UserRound, Monitor, Wrench, Package, AlertCircle } from 'lucide-react';

export interface NotaChamado {
  id: string;
  autor: string;
  texto: string;
  dataHora: string;
}

type Tipo = 'TI' | 'Manutenção' | 'Almoxarifado';
type Prioridade = 'urgente' | 'alta' | 'media' | 'baixa';
type Status = 'a_fazer' | 'em_andamento' | 'concluido';

export interface Chamado {
  id: string;
  codigo: string;
  tipo: Tipo;
  titulo: string;
  descricao: string;
  solicitante: string;
  setor: string;
  prioridade: Prioridade;
  status: Status;
  tecnico?: string;
  /** Prazo de atendimento (ISO). Mesma regra do banco: urgente 4h, alta 8h, média 24h, baixa 72h. */
  prazo: string;
  abertoEm: string;
  concluidoEm?: string;
  notas: NotaChamado[];
  solucao?: string;
}

const HORAS_PRAZO: Record<Prioridade, number> = { urgente: 4, alta: 8, media: 24, baixa: 72 };

const PRIORIDADE: Record<Prioridade, { texto: string; cls: string; barra: string }> = {
  urgente: { texto: 'Urgente', cls: 'bg-[var(--danger-soft)] text-[var(--danger)]', barra: 'bg-[#C8372D]' },
  alta: { texto: 'Alta', cls: 'bg-[var(--warning-soft)] text-[var(--warning)]', barra: 'bg-[#D98A00]' },
  media: { texto: 'Média', cls: 'bg-[var(--brand-soft)] text-[var(--brand)]', barra: 'bg-[#0072BB]' },
  baixa: { texto: 'Baixa', cls: 'bg-[var(--surface-2)] text-[var(--text-muted)]', barra: 'bg-[var(--text-subtle)]' },
};

const TIPOS: Array<{ id: Tipo; rotulo: string; sub: string; icone: React.ReactNode }> = [
  { id: 'TI', rotulo: 'Informática', sub: 'Computador, impressora, rede, sistemas', icone: <Monitor size={20} /> },
  { id: 'Manutenção', rotulo: 'Manutenção', sub: 'Elétrica, ar-condicionado, móveis, prédio', icone: <Wrench size={20} /> },
  { id: 'Almoxarifado', rotulo: 'Material', sub: 'Papel, toner, material de escritório', icone: <Package size={20} /> },
];

const COLUNAS: Array<{ id: Status; titulo: string; vazio: string; cor: string }> = [
  { id: 'a_fazer', titulo: 'Novos', vazio: 'Nenhum chamado esperando.', cor: 'bg-[#D98A00]' },
  { id: 'em_andamento', titulo: 'Em atendimento', vazio: 'Ninguém sendo atendido agora.', cor: 'bg-[#0072BB]' },
  { id: 'concluido', titulo: 'Resolvidos', vazio: 'Nada resolvido ainda.', cor: 'bg-[#00A859]' },
];

const TECNICOS = [
  'Rodrigo Mendonça (Redes)',
  'Patrícia Lima (Sistemas)',
  'Lucas Silveira (Hardware e impressoras)',
  'Equipe de Manutenção Predial',
  'Almoxarifado Central',
];

const agoraIso = () => new Date().toISOString();
const daqui = (min: number) => new Date(Date.now() + min * 60_000).toISOString();
const atras = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const CHAMADOS_INICIAIS = (): Chamado[] => [
  {
    id: 'ch-1', codigo: 'TI-2026-441', tipo: 'TI', prioridade: 'urgente', status: 'a_fazer',
    titulo: 'Impressora do Gabinete sem toner',
    descricao: 'A impressora da recepção do Gabinete avisa toner preto vazio e não imprime.',
    solicitante: 'Dra. Maria Helena', setor: 'Chefia de Gabinete',
    abertoEm: atras(195), prazo: daqui(45), notas: [],
  },
  {
    id: 'ch-2', codigo: 'MANUT-2026-102', tipo: 'Manutenção', prioridade: 'media', status: 'a_fazer',
    titulo: 'Ar-condicionado da sala 204 fazendo barulho',
    descricao: 'O aparelho faz um ruído forte e não está gelando.',
    solicitante: 'Fernando Dias', setor: 'Recursos Humanos',
    abertoEm: atras(300), prazo: daqui(1140), notas: [],
  },
  {
    id: 'ch-3', codigo: 'TI-2026-439', tipo: 'TI', prioridade: 'alta', status: 'em_andamento',
    titulo: 'Instalar certificado digital e VPN',
    descricao: 'Preciso do certificado digital e da VPN para assinar no e-Protocolo de casa.',
    solicitante: 'Eduardo Ramos', setor: 'Assessoria de Planejamento',
    tecnico: 'Rodrigo Mendonça (Redes)', abertoEm: atras(390), prazo: daqui(90),
    notas: [{ id: 'n-2', autor: 'Rodrigo Mendonça', texto: 'Acessei a máquina remotamente. Instalando o certificado.', dataHora: atras(60) }],
  },
  {
    id: 'ch-5', codigo: 'TI-2026-440', tipo: 'TI', prioridade: 'urgente', status: 'em_andamento',
    titulo: 'Internet caindo no 3º andar',
    descricao: 'Os computadores da Diretoria Geral perdem a conexão várias vezes por hora.',
    solicitante: 'Carlos Alberto Nogueira', setor: 'Diretoria Geral',
    tecnico: 'Patrícia Lima (Sistemas)', abertoEm: atras(207), prazo: daqui(33),
    notas: [{ id: 'n-5', autor: 'Patrícia Lima', texto: 'Achei um problema numa porta do switch. Isolando para testar.', dataHora: atras(20) }],
  },
  {
    id: 'ch-4', codigo: 'ALMOX-2026-088', tipo: 'Almoxarifado', prioridade: 'baixa', status: 'concluido',
    titulo: 'Papel A4 e pastas suspensas',
    descricao: 'Reposição semanal para o Protocolo Geral.',
    solicitante: 'Juliana Costa', setor: 'Protocolo Geral',
    tecnico: 'Almoxarifado Central', abertoEm: atras(1500), prazo: atras(-2820), concluidoEm: atras(1400),
    solucao: 'Entregues 10 caixas de papel A4 e 50 pastas suspensas, com guia assinada.',
    notas: [],
  },
  {
    id: 'ch-6', codigo: 'TI-2026-435', tipo: 'TI', prioridade: 'alta', status: 'concluido',
    titulo: 'Computador desligando sozinho',
    descricao: 'O computador desliga do nada quando abro planilhas grandes.',
    solicitante: 'Marcos Vinícius', setor: 'Núcleo Financeiro',
    tecnico: 'Lucas Silveira (Hardware e impressoras)', abertoEm: atras(1300), prazo: atras(820), concluidoEm: atras(1000),
    solucao: 'Fonte trocada e máquina limpa. Testado por 1 hora sem desligar.',
    notas: [],
  },
];

/** Tempo que falta (ou passou) até o prazo, em texto curto. */
const tempoRestante = (prazo: string, agora: number) => {
  const min = Math.round((new Date(prazo).getTime() - agora) / 60_000);
  const abs = Math.abs(min);
  const txt = abs >= 1440 ? `${Math.floor(abs / 1440)}d ${Math.floor((abs % 1440) / 60)}h` : abs >= 60 ? `${Math.floor(abs / 60)}h ${abs % 60}min` : `${abs} min`;
  return { vencido: min < 0, texto: min < 0 ? `Atrasado ${txt}` : `Faltam ${txt}`, min };
};

interface ChamadosKanbanProps {
  currentUser: Usuario;
  onVoltarHub: () => void;
}

export const ChamadosKanban: React.FC<ChamadosKanbanProps> = ({ currentUser, onVoltarHub }) => {
  const atende = temPermissao(currentUser, 'chamados:atender') || temPermissao(currentUser, 'chamados:gerenciar');
  const [chamados, setChamados] = useState<Chamado[]>(CHAMADOS_INICIAIS);
  const [agora, setAgora] = useState(() => Date.now());
  const [filtroTipo, setFiltroTipo] = useState<'todos' | Tipo>('todos');
  const [busca, setBusca] = useState('');
  const [colunaMobile, setColunaMobile] = useState<Status>('a_fazer');
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<Status | null>(null);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);
  const [concluindo, setConcluindo] = useState<Chamado | null>(null);

  // O prazo é recalculado a cada 30 s — suficiente para minutos, sem renderizar a cada segundo.
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const visiveis = atende ? chamados : chamados.filter(c => c.solicitante === currentUser.nome);
  const termo = busca.trim().toLowerCase();
  const filtrados = visiveis.filter(
    c =>
      (filtroTipo === 'todos' || c.tipo === filtroTipo) &&
      (!termo || [c.codigo, c.titulo, c.solicitante, c.setor, c.tecnico ?? ''].some(x => x.toLowerCase().includes(termo))),
  );
  const daColuna = (s: Status) =>
    filtrados
      .filter(c => c.status === s)
      .sort((a, b) => (s === 'concluido' ? (b.concluidoEm ?? '').localeCompare(a.concluidoEm ?? '') : a.prazo.localeCompare(b.prazo)));

  const abertos = visiveis.filter(c => c.status !== 'concluido');
  const totalAtivos = abertos.length;
  const totalUrgentesSla = abertos.filter(c => tempoRestante(c.prazo, agora).min < 60).length;
  const totalEmAndamento = visiveis.filter(c => c.status === 'em_andamento').length;
  const totalConcluidos = visiveis.filter(c => c.status === 'concluido').length;

  const atualizar = (id: string, mudar: (c: Chamado) => Chamado) =>
    setChamados(prev => prev.map(c => (c.id === id ? mudar(c) : c)));

  const mudarStatus = (c: Chamado, novo: Status, solucao?: string) => {
    if (c.status === novo) return;
    if (novo === 'concluido' && !solucao) {
      setConcluindo(c);
      return;
    }
    eventBus.emit('chamado.status_alterado', {
      chamadoId: c.codigo,
      titulo: c.titulo,
      statusAnterior: c.status,
      novoStatus: novo,
      responsavel: currentUser.nome,
    });
    atualizar(c.id, x => ({
      ...x,
      status: novo,
      tecnico: novo === 'em_andamento' && !x.tecnico ? currentUser.nome : x.tecnico,
      solucao: novo === 'concluido' ? solucao : novo === 'a_fazer' ? undefined : x.solucao,
      concluidoEm: novo === 'concluido' ? agoraIso() : undefined,
    }));
    soundFX.playClick();
  };

  const soltar = (e: React.DragEvent, col: Status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || arrastando;
    const c = chamados.find(x => x.id === id);
    if (c) mudarStatus(c, col);
    setArrastando(null);
    setAlvo(null);
  };

  const criar = (dados: { tipo: Tipo; titulo: string; descricao: string; prioridade: Prioridade }) => {
    const sigla = dados.tipo === 'TI' ? 'TI' : dados.tipo === 'Manutenção' ? 'MANUT' : 'ALMOX';
    const novo: Chamado = {
      id: 'ch-' + Date.now(),
      codigo: `${sigla}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      ...dados,
      solicitante: currentUser.nome,
      setor: currentUser.setor,
      status: 'a_fazer',
      abertoEm: agoraIso(),
      prazo: daqui(HORAS_PRAZO[dados.prioridade] * 60),
      notas: [],
    };
    setChamados(prev => [novo, ...prev]);
    eventBus.emit('chamado.criado', {
      chamadoId: novo.codigo,
      titulo: novo.titulo,
      prioridade: novo.prioridade,
      setor: novo.setor,
      solicitante: novo.solicitante,
    });
    soundFX.playSuccess();
    setNovoAberto(false);
    setAbertoId(novo.id);
  };

  const aberto = chamados.find(c => c.id === abertoId) ?? null;

  const tiposFiltro: Array<{ id: 'todos' | Tipo; rotulo: string; contagem?: number }> = [
    { id: 'todos', rotulo: 'Todos', contagem: visiveis.length },
    ...TIPOS.map(t => ({ id: t.id, rotulo: t.rotulo, contagem: visiveis.filter(c => c.tipo === t.id).length })),
  ];

  return (
    <div className="space-y-5 font-sans">
      <ModuloCabecalho
        cor="noite"
        rotulo="Atendimento · TI, Manutenção e Almoxarifado"
        titulo="Chamados"
        descricao="Abra um pedido de suporte, acompanhe o prazo de atendimento e veja quem está cuidando do seu caso."
        onVoltar={onVoltarHub}
        acoes={
          <AcaoModulo destaque icone={<Plus size={15} />} onClick={() => setNovoAberto(true)}>
            Abrir chamado
          </AcaoModulo>
        }
      >
        <div className="flex flex-wrap gap-2">
          <NumeroModulo rotulo={atende ? 'Em aberto' : 'Seus abertos'} valor={totalAtivos} />
          <NumeroModulo rotulo="Prazo vencendo" valor={totalUrgentesSla} detalhe="menos de 1 hora" />
          <NumeroModulo rotulo="Em atendimento" valor={totalEmAndamento} />
          <NumeroModulo rotulo="Resolvidos" valor={totalConcluidos} />
        </div>
        <AbasModulo
          itens={tiposFiltro.map(t => ({ id: t.id, rotulo: t.rotulo, contagem: t.contagem }))}
          ativa={filtroTipo}
          onChange={setFiltroTipo}
        />
      </ModuloCabecalho>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:w-96">
          <span className="sr-only">Buscar chamado</span>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por número, assunto, pessoa ou setor"
            className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none focus:border-[var(--brand)]"
          />
        </label>
        {atende && <p className="hidden text-xs text-[var(--text-muted)] md:block">Arraste um cartão entre as colunas ou use os botões.</p>}
      </div>

      {/* No celular, uma coluna por vez */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 md:hidden" role="tablist" aria-label="Coluna">
        {COLUNAS.map(col => (
          <button
            key={col.id}
            type="button"
            role="tab"
            aria-selected={colunaMobile === col.id}
            onClick={() => setColunaMobile(col.id)}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-semibold cursor-pointer ${
              colunaMobile === col.id ? 'bg-[#00385E] text-white' : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]'
            }`}
          >
            {col.titulo}
            <span className="tabular-nums opacity-70">{daColuna(col.id).length}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUNAS.map(col => {
          const itens = daColuna(col.id);
          return (
            <section
              key={col.id}
              aria-label={col.titulo}
              onDragOver={e => {
                if (!atende) return;
                e.preventDefault();
                if (alvo !== col.id) setAlvo(col.id);
              }}
              onDragLeave={() => setAlvo(null)}
              onDrop={e => atende && soltar(e, col.id)}
              className={`${colunaMobile === col.id ? 'flex' : 'hidden md:flex'} min-h-[420px] flex-col rounded-[28px] p-3 transition-colors ${
                alvo === col.id ? 'bg-[var(--brand-soft)] ring-2 ring-[var(--brand)]' : 'bg-[var(--surface-2)]'
              }`}
            >
              <header className="flex items-center justify-between px-3 pb-3 pt-2">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--text)]">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.cor}`} /> {col.titulo}
                </h3>
                <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[var(--text)]">{itens.length}</span>
              </header>
              {itens.length === 0 ? (
                <p className="m-1 rounded-[18px] border border-dashed border-[var(--border-strong)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">{col.vazio}</p>
              ) : (
                <ul className="space-y-2.5">
                  {itens.map(c => (
                    <CartaoChamado
                      key={c.id}
                      chamado={c}
                      agora={agora}
                      atende={atende}
                      arrastando={arrastando === c.id}
                      onArrastar={e => {
                        e.dataTransfer.setData('text/plain', c.id);
                        setArrastando(c.id);
                      }}
                      onAbrir={() => setAbertoId(c.id)}
                      onMudar={s => mudarStatus(c, s)}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {aberto && (
        <DetalheChamado
          chamado={aberto}
          agora={agora}
          atende={atende}
          onFechar={() => setAbertoId(null)}
          onMudar={s => mudarStatus(aberto, s)}
          onAtribuir={tecnico =>
            atualizar(aberto.id, x => ({ ...x, tecnico, status: x.status === 'a_fazer' ? 'em_andamento' : x.status }))
          }
          onPrioridade={p => atualizar(aberto.id, x => ({ ...x, prioridade: p, prazo: new Date(new Date(x.abertoEm).getTime() + HORAS_PRAZO[p] * 3_600_000).toISOString() }))}
          onNota={texto =>
            atualizar(aberto.id, x => ({
              ...x,
              notas: [...x.notas, { id: 'n-' + Date.now(), autor: currentUser.nome, texto, dataHora: agoraIso() }],
            }))
          }
        />
      )}
      {novoAberto && <NovoChamado onFechar={() => setNovoAberto(false)} onCriar={criar} />}
      {concluindo && (
        <ConcluirChamado
          chamado={concluindo}
          onFechar={() => setConcluindo(null)}
          onConcluir={solucao => {
            mudarStatus(concluindo, 'concluido', solucao);
            setConcluindo(null);
          }}
        />
      )}
    </div>
  );
};

const CartaoChamado: React.FC<{
  chamado: Chamado;
  agora: number;
  atende: boolean;
  arrastando: boolean;
  onArrastar: (e: React.DragEvent) => void;
  onAbrir: () => void;
  onMudar: (s: Status) => void;
}> = ({ chamado: c, agora, atende, arrastando, onArrastar, onAbrir, onMudar }) => {
  const p = PRIORIDADE[c.prioridade];
  const prazo = tempoRestante(c.prazo, agora);
  const total = HORAS_PRAZO[c.prioridade] * 60;
  const pct = Math.max(4, Math.min(100, (prazo.min / total) * 100));
  return (
    <li
      draggable={atende}
      onDragStart={onArrastar}
      className={`rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4 transition-opacity ${arrastando ? 'opacity-40' : ''} ${
        atende ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      <button type="button" onClick={onAbrir} className="block w-full text-left cursor-pointer">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold tabular-nums text-[var(--text-muted)]">{c.codigo}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${p.cls}`}>{p.texto}</span>
        </div>
        <div className={`mt-1.5 text-[15px] font-semibold leading-snug text-[var(--text)] ${c.status === 'concluido' ? 'text-[var(--text-muted)]' : ''}`}>
          {c.titulo}
        </div>
        <div className="mt-1 truncate text-xs text-[var(--text-muted)]">
          {c.solicitante} · {c.setor}
        </div>
      </button>

      {c.status === 'concluido' ? (
        <p className="mt-3 line-clamp-2 rounded-[12px] bg-[var(--verde-soft)] px-3 py-2 text-xs text-[var(--verde)]">
          <Check size={12} className="mr-1 inline" strokeWidth={3} />
          {c.solucao}
        </p>
      ) : (
        <div className="mt-3">
          <div className={`flex items-center gap-1.5 text-xs font-semibold tabular-nums ${prazo.vencido || prazo.min < 60 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>
            <Clock size={12} /> {prazo.texto}
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div className={`h-full rounded-full ${prazo.vencido ? 'bg-[#C8372D]' : p.barra}`} style={{ width: `${prazo.vencido ? 100 : pct}%` }} />
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <UserRound size={13} className="shrink-0" />
          <span className="truncate">{c.tecnico ?? 'Sem responsável'}</span>
        </span>
        {atende && c.status === 'a_fazer' && (
          <button type="button" onClick={() => onMudar('em_andamento')} className="h-8 shrink-0 rounded-full bg-[#0072BB] px-3.5 text-xs font-semibold text-white hover:bg-[#005A9C] cursor-pointer">
            Assumir
          </button>
        )}
        {atende && c.status === 'em_andamento' && (
          <button type="button" onClick={() => onMudar('concluido')} className="h-8 shrink-0 rounded-full bg-[#00703C] px-3.5 text-xs font-semibold text-white hover:bg-[#005C31] cursor-pointer">
            Resolver
          </button>
        )}
      </div>
    </li>
  );
};


const DetalheChamado: React.FC<{
  chamado: Chamado;
  agora: number;
  atende: boolean;
  onFechar: () => void;
  onMudar: (s: Status) => void;
  onAtribuir: (tecnico: string) => void;
  onPrioridade: (p: Prioridade) => void;
  onNota: (texto: string) => void;
}> = ({ chamado: c, agora, atende, onFechar, onMudar, onAtribuir, onPrioridade, onNota }) => {
  const [nota, setNota] = useState('');
  const prazo = tempoRestante(c.prazo, agora);
  const tipo = TIPOS.find(t => t.id === c.tipo);
  const coluna = COLUNAS.find(x => x.id === c.status);
  return (
    <Janela titulo={c.titulo} onFechar={onFechar} lateral>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold tabular-nums text-[var(--text-muted)]">{c.codigo}</span>
        <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 font-semibold text-[var(--text)]">{tipo?.rotulo}</span>
        <span className={`rounded-full px-2.5 py-0.5 font-semibold ${PRIORIDADE[c.prioridade].cls}`}>{PRIORIDADE[c.prioridade].texto}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 font-semibold text-[var(--text)]">
          <span className={`h-1.5 w-1.5 rounded-full ${coluna?.cor}`} /> {coluna?.titulo}
        </span>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-[var(--text)]">{c.descricao}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 rounded-[18px] bg-[var(--surface-2)] p-4 text-sm">
        <div>
          <dt className="text-xs text-[var(--text-muted)]">Pedido por</dt>
          <dd className="font-semibold text-[var(--text)]">{c.solicitante}</dd>
          <dd className="text-xs text-[var(--text-muted)]">{c.setor}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--text-muted)]">Aberto em</dt>
          <dd className="font-semibold tabular-nums text-[var(--text)]">{dataHora(c.abertoEm)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--text-muted)]">Prazo</dt>
          <dd className="font-semibold tabular-nums text-[var(--text)]">{dataHora(c.prazo)}</dd>
          {c.status !== 'concluido' && (
            <dd className={`text-xs font-semibold ${prazo.vencido || prazo.min < 60 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>{prazo.texto}</dd>
          )}
        </div>
        <div>
          <dt className="text-xs text-[var(--text-muted)]">Responsável</dt>
          <dd className="font-semibold text-[var(--text)]">{c.tecnico ?? 'Ninguém ainda'}</dd>
        </div>
      </dl>

      {atende && c.status !== 'concluido' && (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Responsável</span>
            <select
              value={c.tecnico ?? ''}
              onChange={e => e.target.value && onAtribuir(e.target.value)}
              className="h-11 w-full cursor-pointer rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]"
            >
              <option value="">Escolher…</option>
              {[...new Set([...(c.tecnico ? [c.tecnico] : []), ...TECNICOS])].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Prioridade</span>
            <select
              value={c.prioridade}
              onChange={e => onPrioridade(e.target.value as Prioridade)}
              className="h-11 w-full cursor-pointer rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]"
            >
              {(Object.keys(PRIORIDADE) as Prioridade[]).map(p => (
                <option key={p} value={p}>{PRIORIDADE[p].texto} · prazo de {HORAS_PRAZO[p]}h</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {c.solucao && (
        <div className="mt-5 rounded-[18px] bg-[var(--verde-soft)] p-4">
          <div className="text-xs font-semibold text-[var(--verde)]">Solução{c.concluidoEm && ` · ${dataHora(c.concluidoEm)}`}</div>
          <p className="mt-1 text-sm text-[var(--text)]">{c.solucao}</p>
        </div>
      )}

      <div className="mt-6">
        <h4 className="font-display text-lg font-bold text-[var(--text)]">Conversa</h4>
        {c.notas.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--text-muted)]">Nenhuma mensagem ainda.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {c.notas.map(n => (
              <li key={n.id} className="rounded-[14px] bg-[var(--surface-2)] px-4 py-3">
                <div className="flex justify-between gap-2 text-xs">
                  <span className="font-semibold text-[var(--text)]">{n.autor}</span>
                  <span className="tabular-nums text-[var(--text-subtle)]">{dataHora(n.dataHora)}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--text)]">{n.texto}</p>
              </li>
            ))}
          </ul>
        )}
        <form
          className="mt-3 flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            if (!nota.trim()) return;
            onNota(nota.trim());
            setNota('');
          }}
        >
          <label className="sr-only" htmlFor="nota-chamado">Escrever mensagem</label>
          <input
            id="nota-chamado"
            value={nota}
            onChange={e => setNota(e.target.value)}
            placeholder="Escrever uma mensagem"
            className="h-11 flex-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]"
          />
          <button type="submit" aria-label="Enviar mensagem" disabled={!nota.trim()} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0072BB] text-white disabled:opacity-40 cursor-pointer">
            <Send size={16} />
          </button>
        </form>
      </div>

      {atende && (
        <div className="mt-auto flex gap-2 pt-6">
          {c.status === 'a_fazer' && (
            <button type="button" onClick={() => onMudar('em_andamento')} className="h-12 flex-1 rounded-full bg-[#0072BB] text-sm font-bold text-white hover:bg-[#005A9C] cursor-pointer">
              Assumir o chamado
            </button>
          )}
          {c.status === 'em_andamento' && (
            <>
              <button type="button" onClick={() => onMudar('a_fazer')} className="h-12 rounded-full border border-[var(--border)] px-5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
                Devolver para a fila
              </button>
              <button type="button" onClick={() => onMudar('concluido')} className="h-12 flex-1 rounded-full bg-[#00703C] text-sm font-bold text-white hover:bg-[#005C31] cursor-pointer">
                Marcar como resolvido
              </button>
            </>
          )}
          {c.status === 'concluido' && (
            <button type="button" onClick={() => onMudar('em_andamento')} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
              <RotateCcw size={16} /> Reabrir
            </button>
          )}
        </div>
      )}
    </Janela>
  );
};

const NovoChamado: React.FC<{
  onFechar: () => void;
  onCriar: (d: { tipo: Tipo; titulo: string; descricao: string; prioridade: Prioridade }) => void;
}> = ({ onFechar, onCriar }) => {
  const [tipo, setTipo] = useState<Tipo>('TI');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<Prioridade>('media');
  const [erro, setErro] = useState<string | null>(null);
  const campo = 'w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]';

  return (
    <Janela titulo="Abrir chamado" onFechar={onFechar}>
      <form
        className="space-y-4"
        onSubmit={e => {
          e.preventDefault();
          if (titulo.trim().length < 3) return setErro('Escreva um assunto curto, como "Impressora sem toner".');
          if (descricao.trim().length < 5) return setErro('Conte em uma ou duas frases o que está acontecendo.');
          onCriar({ tipo, titulo: titulo.trim(), descricao: descricao.trim(), prioridade });
        }}
      >
        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-[var(--text)]">Que tipo de ajuda?</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {TIPOS.map(t => (
              <button
                key={t.id}
                type="button"
                aria-pressed={tipo === t.id}
                onClick={() => setTipo(t.id)}
                className={`rounded-[18px] border-2 p-3.5 text-left transition-colors cursor-pointer ${
                  tipo === t.id ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                <span className="text-[var(--brand)]">{t.icone}</span>
                <div className="mt-1.5 text-sm font-semibold text-[var(--text)]">{t.rotulo}</div>
                <div className="text-[11px] leading-snug text-[var(--text-muted)]">{t.sub}</div>
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="nc-titulo" className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Assunto</label>
          <input id="nc-titulo" value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={160} placeholder="Ex.: Impressora sem toner" className={`${campo} h-11`} />
        </div>
        <div>
          <label htmlFor="nc-desc" className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">O que está acontecendo</label>
          <textarea id="nc-desc" rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Onde fica, desde quando, o que já tentou." className={`${campo} py-3`} />
        </div>
        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-[var(--text)]">Urgência</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(PRIORIDADE) as Prioridade[]).map(p => (
              <button
                key={p}
                type="button"
                aria-pressed={prioridade === p}
                onClick={() => setPrioridade(p)}
                className={`rounded-[14px] border-2 px-2 py-2.5 text-center cursor-pointer ${
                  prioridade === p ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="text-sm font-semibold text-[var(--text)]">{PRIORIDADE[p].texto}</div>
                <div className="text-[11px] text-[var(--text-muted)]">até {HORAS_PRAZO[p]}h</div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Urgente é quando o trabalho parou. A equipe pode ajustar depois.</p>
        </fieldset>
        {erro && (
          <p role="alert" className="flex items-start gap-2 rounded-[14px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
            <AlertCircle size={16} className="mt-px shrink-0" /> {erro}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onFechar} className="h-11 flex-1 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="h-11 flex-[1.4] rounded-full bg-[#0072BB] text-sm font-bold text-white hover:bg-[#005A9C] cursor-pointer">
            Abrir chamado
          </button>
        </div>
      </form>
    </Janela>
  );
};

const ConcluirChamado: React.FC<{ chamado: Chamado; onFechar: () => void; onConcluir: (solucao: string) => void }> = ({
  chamado,
  onFechar,
  onConcluir,
}) => {
  const [solucao, setSolucao] = useState('');
  return (
    <Janela titulo="O que foi feito?" onFechar={onFechar}>
      <p className="text-sm text-[var(--text-muted)]">
        {chamado.solicitante} vai ver esta resposta. Escreva em linguagem simples.
      </p>
      <label htmlFor="solucao" className="sr-only">Solução</label>
      <textarea
        id="solucao"
        rows={4}
        autoFocus
        value={solucao}
        onChange={e => setSolucao(e.target.value)}
        placeholder="Ex.: toner trocado e impressora testada."
        className="mt-3 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]"
      />
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onFechar} className="h-11 flex-1 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
          Voltar
        </button>
        <button
          type="button"
          disabled={solucao.trim().length < 5}
          onClick={() => onConcluir(solucao.trim())}
          className="h-11 flex-[1.4] rounded-full bg-[#00703C] text-sm font-bold text-white hover:bg-[#005C31] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          Marcar como resolvido
        </button>
      </div>
    </Janela>
  );
};
