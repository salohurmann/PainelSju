import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Car, Check, ClipboardCheck, ExternalLink, Headphones, Landmark, Loader2, Plus, Receipt, Search, X,
} from 'lucide-react';
import type { Agendamento, Usuario, Veiculo } from '../../types';
import type { AppModuleId } from '../hub/AppLauncherHub';
import { MODULOS_REGISTRY } from '../../modules/moduleRegistry';
import { temPermissao } from '../../services/rbac';
import { generateAuditHash } from '../../services/crypto';
import { useSessao } from '../../auth/contexto';
import { Pinheiral, Araucaria } from '../marca/Araucaria';
import { CatalogoSistemasModal } from '../hub/CatalogoSistemasModal';
import * as mesaApi from '../../data/supabase/mesa';
import * as frotaApi from '../../data/supabase/frota';
import * as diariasApi from '../../data/supabase/diarias';
import * as censeApi from '../../data/supabase/cense';
import * as chamadosApi from '../../data/supabase/chamados';
import * as salasApi from '../../data/supabase/salas';

// ---------------------------------------------------------------- tipos

type Urgencia = 'vencida' | 'alta' | 'media' | 'baixa';
type Destino = AppModuleId | 'auditoria';

interface ItemMesa {
  chave: string;
  tipo: 'frota' | 'diaria' | 'chamado' | 'cense' | 'vistoria' | 'meu_pedido';
  modulo: Destino;
  subTab?: string;
  rotuloModulo: string;
  titulo: string;
  detalhe: string;
  meta: string;
  prazo: string;
  urgencia: Urgencia;
  acaoSim?: string;
  acaoNao?: string;   // presente = pede motivo
  executar?: (aprovar: boolean, motivo?: string) => Promise<void>;
}

interface EventoHoje { hora: string; titulo: string; detalhe: string; alerta?: boolean }
interface Indicador { rotulo: string; valor: string; complemento?: string; nota: string; destino?: Destino; subTab?: string }

export interface MesaDespachoProps {
  currentUser: Usuario;
  veiculos: Veiculo[];
  agendamentos: Agendamento[];
  onOpenApp: (id: Destino, subTab?: string) => void;
  onOpenCommandPalette: () => void;
  onAprovarFrota: (agId: string, hash: string, aprovador: Usuario) => void | Promise<void>;
  onReprovarFrota: (agId: string, motivo: string, aprovador: Usuario) => void | Promise<void>;
}

// --------------------------------------------------------------- apoio

const ICONES: Record<ItemMesa['tipo'], React.ComponentType<{ size?: number; className?: string }>> = {
  frota: Car, vistoria: ClipboardCheck, meu_pedido: Car, diaria: Receipt, chamado: Headphones, cense: Landmark,
};

const ESTILO_URGENCIA: Record<Urgencia, string> = {
  vencida: 'bg-[var(--danger-soft)] text-[var(--danger)]',
  alta: 'bg-[var(--warning-soft)] text-[var(--warning)]',
  media: 'bg-[var(--brand-soft)] text-[var(--brand-hover)]',
  baixa: 'bg-[var(--surface-2)] text-[var(--text-muted)]',
};

const SISTEMAS_ESTADO = [
  { nome: 'e-Protocolo', url: 'https://www.eprotocolo.pr.gov.br' },
  { nome: 'GMS', url: 'https://www.gms.pr.gov.br' },
  { nome: 'Patrimônio', url: 'https://www.patrimonio.pr.gov.br' },
];

const so = (s: string) => s.replace(/\D/g, '');
const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const diasAte = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const alvo = new Date(y, m - 1, d).getTime();
  const h = new Date();
  const hoje = new Date(h.getFullYear(), h.getMonth(), h.getDate()).getTime();
  return Math.round((alvo - hoje) / 86400000);
};
const textoViagem = (n: number) =>
  n < 0 ? 'Data já passou' : n === 0 ? 'Viagem hoje' : n === 1 ? 'Viagem amanhã' : `Viagem em ${n} dias`;
const urgenciaPorDias = (n: number): Urgencia => (n < 0 ? 'vencida' : n <= 1 ? 'alta' : n <= 3 ? 'media' : 'baixa');
const quando = (iso: string) => {
  const d = new Date(iso);
  const n = diasAte(iso);
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (n === 0) return `hoje às ${hora}`;
  if (n === -1) return `ontem às ${hora}`;
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${hora}`;
};
const primeiroNome = (nome: string) => nome.replace(/^(Dra?\.|Sr\.|Sra\.)\s+/i, '').split(' ')[0];
const saudacao = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
};

// ============================================================== componente

export const MesaDespacho: React.FC<MesaDespachoProps> = ({
  currentUser, veiculos, agendamentos, onOpenApp, onOpenCommandPalette, onAprovarFrota, onReprovarFrota,
}) => {
  const { estado, pode } = useSessao();
  const real = estado.fase === 'autenticado';
  const [catalogo, setCatalogo] = useState(false);

  // ---- modo real (Supabase)
  const [itensReais, setItensReais] = useState<ItemMesa[] | null>(null);
  const [hojeReal, setHojeReal] = useState<EventoHoje[]>([]);
  const [indReais, setIndReais] = useState<Indicador[] | null>(null);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const carregarReal = useCallback(async () => {
    try {
      const pend = await mesaApi.minhasPendencias();
      setErroCarga(null);
      const itens: ItemMesa[] = pend.map((p) => {
        const meta = [p.solicitante, `desde ${quando(p.desde)}`].filter(Boolean).join(' · ');
        const prazo = p.prazo
          ? p.urgencia === 'vencida' ? 'Prazo vencido' : `Prazo ${quando(p.prazo)}`
          : 'Sem prazo';
        switch (p.tipo) {
          case 'frota_aprovacao':
            return { chave: p.referencia, tipo: 'frota', modulo: 'frota', subTab: 'aprovacoes', rotuloModulo: `Frotas · ${p.protocolo}`,
              titulo: 'Solicitação de veículo', detalhe: p.descricao ?? '', meta, prazo, urgencia: p.urgencia,
              acaoSim: 'Aprovar', acaoNao: 'Reprovar',
              executar: async (sim, motivo) => { await frotaApi.decidirAgendamento(p.referencia, sim, motivo); } };
          case 'diaria_aprovacao':
            return { chave: p.referencia, tipo: 'diaria', modulo: 'diarias', rotuloModulo: `Diárias · ${p.protocolo}`,
              titulo: p.titulo, detalhe: p.descricao ?? '', meta, prazo, urgencia: p.urgencia,
              acaoSim: 'Aprovar', acaoNao: 'Reprovar',
              executar: async (sim, motivo) => { await diariasApi.decidirDiaria(p.referencia, sim, motivo); } };
          case 'cense_analise':
            return { chave: p.referencia, tipo: 'cense', modulo: 'cense', rotuloModulo: `Fundo CENSE · ${p.protocolo}`,
              titulo: p.titulo, detalhe: p.descricao ?? '', meta, prazo, urgencia: p.urgencia,
              acaoSim: 'Aprovar', acaoNao: 'Glosar',
              executar: async (sim, motivo) => { await censeApi.analisarNota(p.referencia, sim, motivo); } };
          case 'chamado':
            return { chave: p.referencia, tipo: 'chamado', modulo: 'chamados', rotuloModulo: `Chamados · ${p.protocolo}`,
              titulo: p.titulo, detalhe: `Prioridade ${p.descricao ?? ''}`, meta, prazo, urgencia: p.urgencia,
              acaoSim: 'Assumir',
              executar: async () => { await chamadosApi.assumirChamado(p.referencia); } };
          default:
            return { chave: p.referencia, tipo: 'vistoria', modulo: 'frota', subTab: 'checkin-checkout', rotuloModulo: `Frotas · ${p.protocolo}`,
              titulo: p.titulo, detalhe: p.descricao ?? '', meta, prazo, urgencia: p.urgencia };
        }
      });
      setItensReais(itens);

      const hoje = hojeISO();
      const [vs, chs, rs, ags] = await Promise.all([
        pode('frotas:ver') ? frotaApi.listarVeiculos() : Promise.resolve([]),
        pode('chamados:ver') ? chamadosApi.listarChamados({ status: ['a_fazer', 'em_andamento'] }) : Promise.resolve([]),
        pode('salas:ver') ? salasApi.listarReservas(salasApi.horarioBrasilia(hoje, 0), salasApi.horarioBrasilia(hoje, 23, 59)) : Promise.resolve([]),
        pode('frotas:ver') ? frotaApi.listarAgendamentos({ status: ['aprovado', 'em_andamento'] }) : Promise.resolve([]),
      ]);
      const ev: EventoHoje[] = [
        ...rs.map((r) => ({
          hora: `${new Date(r.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} – ${new Date(r.fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          titulo: r.motivo, detalhe: `Reserva de sala · ${r.responsavel_nome}`, ordem: r.inicio,
        })),
        ...ags.filter((a) => a.datas.includes(hoje)).map((a) => ({
          hora: a.periodo === 'tarde' ? 'Tarde' : a.periodo === 'manha' ? 'Manhã' : 'Dia todo',
          titulo: `Viagem · ${a.destino.split('—')[0].trim()}`, detalhe: a.solicitante_nome, ordem: `${hoje}T00:00`,
        })),
        ...chs.filter((c) => c.prazo_sla.slice(0, 10) === hoje).map((c) => ({
          hora: `${new Date(c.prazo_sla).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · SLA`,
          titulo: c.titulo, detalhe: c.protocolo, alerta: true, ordem: c.prazo_sla,
        })),
      ].sort((a, b) => a.ordem.localeCompare(b.ordem)).map(({ ordem: _o, ...e }) => e);
      setHojeReal(ev);

      const disponiveis = vs.filter((v) => v.status === 'disponivel').length;
      const emRisco = chs.filter((c) => new Date(c.prazo_sla).getTime() - Date.now() < 4 * 3600000).length;
      setIndReais([
        { rotulo: 'Veículos disponíveis', valor: String(disponiveis), complemento: `de ${vs.length}`, nota: `${vs.filter((v) => v.status === 'em_missao').length} em missão agora`, destino: 'frota', subTab: 'frota' },
        { rotulo: 'Decisões pendentes', valor: String(itens.length), nota: itens.length ? 'na sua fila' : 'nada esperando você' },
        { rotulo: 'Chamados abertos', valor: String(chs.length), nota: emRisco ? `${emRisco} perto do prazo de SLA` : 'todos dentro do prazo', destino: 'chamados' },
        { rotulo: 'Reservas hoje', valor: String(rs.length), nota: rs.length ? 'salas e auditório' : 'nenhuma sala reservada', destino: 'salas' },
      ]);
    } catch (e) {
      setErroCarga(e instanceof Error ? e.message : 'Não foi possível carregar a Mesa.');
    }
  }, [pode]);

  useEffect(() => { if (real) void carregarReal(); }, [real, carregarReal]);

  // ---- modo demonstração (dados locais)
  const itensDemo = useMemo<ItemMesa[]>(() => {
    if (real) return [];
    const meuCpf = so(currentUser.cpf);
    if (temPermissao(currentUser, 'frotas:aprovar')) {
      return agendamentos
        .filter((a) => a.status === 'pendente' && so(a.cpf) !== meuCpf)
        .sort((a, b) => a.datas[0].localeCompare(b.datas[0]))
        .map((a) => {
          const n = diasAte(a.datas[0]);
          return {
            chave: a.id, tipo: 'frota', modulo: 'frota', subTab: 'aprovacoes', rotuloModulo: `Frotas · ${a.ticket}`,
            titulo: `Veículo para ${a.destino.split(/[—–-]/)[0].trim()}`,
            detalhe: `${a.veiculoNome.split(' ').slice(0, 2).join(' ')} ${a.veiculoPlaca} · ${a.datas.length > 1 ? `${a.datas.length} dias` : a.periodo === 'dia_todo' ? 'dia todo' : a.periodo === 'manha' ? 'manhã' : 'tarde'} · ${a.modalidade === 'com_motorista' ? 'com motorista' : 'sem motorista'}`,
            meta: `${a.nome} · pedido ${quando(a.criadoEm)}`,
            prazo: textoViagem(n), urgencia: urgenciaPorDias(n),
            acaoSim: 'Aprovar', acaoNao: 'Reprovar',
            executar: async (sim, motivo) => {
              if (sim) {
                const hash = await generateAuditHash({ action: 'APROVACAO', ticket: a.ticket, cpf: currentUser.cpf, timestamp: new Date().toISOString() });
                await onAprovarFrota(a.id, hash, currentUser);
              } else {
                await onReprovarFrota(a.id, motivo ?? '', currentUser);
              }
            },
          } satisfies ItemMesa;
        });
    }
    // Quem não aprova acompanha os próprios pedidos
    return agendamentos
      .filter((a) => so(a.cpf) === meuCpf && ['pendente', 'aprovado', 'em_andamento'].includes(a.status))
      .map((a) => {
        const n = diasAte(a.datas[0]);
        const st = a.status === 'pendente' ? 'Aguardando a chefia' : a.status === 'aprovado' ? 'Aprovado · aguarda vistoria' : 'Em missão';
        return {
          chave: a.id, tipo: 'meu_pedido', modulo: 'frota', subTab: 'consultar', rotuloModulo: `Seu pedido · ${a.ticket}`,
          titulo: `Veículo para ${a.destino.split(/[—–-]/)[0].trim()}`, detalhe: st,
          meta: `pedido ${quando(a.criadoEm)}`, prazo: textoViagem(n), urgencia: urgenciaPorDias(n),
        } satisfies ItemMesa;
      });
  }, [real, agendamentos, currentUser, onAprovarFrota, onReprovarFrota]);

  const hojeDemo = useMemo<EventoHoje[]>(() => {
    const hoje = hojeISO();
    return agendamentos
      .filter((a) => a.datas.includes(hoje) && ['aprovado', 'em_andamento', 'pendente'].includes(a.status))
      .map((a) => ({
        hora: a.periodo === 'tarde' ? 'Tarde' : a.periodo === 'manha' ? 'Manhã' : 'Dia todo',
        titulo: `Viagem · ${a.destino.split(/[—–-]/)[0].trim()}`,
        detalhe: `${a.veiculoPlaca} · ${a.nome}${a.status === 'em_andamento' ? ' · em missão' : ''}`,
        alerta: a.status === 'pendente',
      }));
  }, [agendamentos]);

  const indDemo = useMemo<Indicador[]>(() => {
    const disp = veiculos.filter((v) => v.status === 'disponivel').length;
    const missao = veiculos.filter((v) => v.status === 'em_missao').length;
    const pend = agendamentos.filter((a) => a.status === 'pendente').length;
    const realizados = agendamentos.filter((a) => a.status === 'realizado').length;
    return [
      { rotulo: 'Veículos disponíveis', valor: String(disp), complemento: `de ${veiculos.length}`, nota: `${missao} em missão agora`, destino: 'frota', subTab: 'frota' },
      { rotulo: 'Solicitações pendentes', valor: String(pend), nota: pend ? 'aguardando a chefia' : 'nenhuma esperando', destino: 'frota', subTab: 'aprovacoes' },
      { rotulo: 'Em missão', valor: String(missao), nota: missao ? 'veículos na estrada' : 'frota no pátio', destino: 'frota', subTab: 'checkin-checkout' },
      { rotulo: 'Viagens concluídas', valor: String(realizados), nota: 'com vistoria de retorno', destino: 'frota', subTab: 'consultar' },
    ];
  }, [veiculos, agendamentos]);

  const itens = real ? itensReais : itensDemo;
  const hojeEventos = real ? hojeReal : hojeDemo;
  const indicadores = real ? indReais : indDemo;
  const acompanhando = !real && !temPermissao(currentUser, 'frotas:aprovar');

  // ---- decisões na linha
  const [fase, setFase] = useState<Record<string, 'motivo' | 'enviando' | undefined>>({});
  const [motivos, setMotivos] = useState<Record<string, string>>({});
  const [feitos, setFeitos] = useState<Array<{ item: ItemMesa; aprovou: boolean }>>([]);
  const [erros, setErros] = useState<Record<string, string>>({});

  const decidir = async (item: ItemMesa, aprovar: boolean) => {
    if (!item.executar) return;
    const motivo = (motivos[item.chave] ?? '').trim();
    if (!aprovar && item.acaoNao && motivo.length < 5) {
      setErros((e) => ({ ...e, [item.chave]: 'Escreva o motivo (mínimo de 5 caracteres).' }));
      return;
    }
    setErros((e) => ({ ...e, [item.chave]: '' }));
    setFase((f) => ({ ...f, [item.chave]: 'enviando' }));
    try {
      await item.executar(aprovar, aprovar ? undefined : motivo);
      setFeitos((fs) => [{ item, aprovou: aprovar }, ...fs]);
      setFase((f) => ({ ...f, [item.chave]: undefined }));
      if (real) await carregarReal();
    } catch (e) {
      setFase((f) => ({ ...f, [item.chave]: aprovar ? undefined : 'motivo' }));
      setErros((er) => ({ ...er, [item.chave]: e instanceof Error ? e.message : 'Não foi possível concluir.' }));
    }
  };

  const chavesFeitas = new Set(feitos.map((f) => f.item.chave));
  const fila = (itens ?? []).filter((i) => !chavesFeitas.has(i.chave));
  const totalPendente = acompanhando ? 0 : fila.length;

  const modulos = real && estado.fase === 'autenticado'
    ? MODULOS_REGISTRY.filter((m) => estado.contexto.modulos.some((x) => x.id === m.id))
    : MODULOS_REGISTRY.filter((m) => temPermissao(currentUser, m.permissaoMinima));

  const podeSolicitar = real ? pode('frotas:solicitar') : temPermissao(currentUser, 'frotas:solicitar');
  const [dataHoje] = useState(() => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));

  // ============================================================== tela
  return (
    <div className="space-y-8 pb-10">
      {/* ---------------- Destaque */}
      <section className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--ink)] text-white">
        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-11 lg:pr-[42%]">
          <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-[#9FC3E2] first-letter:uppercase">{dataHoje}</p>
          <h1 className="font-display mt-3 text-[40px] sm:text-[56px] leading-[0.98] font-bold">
            {saudacao()}, {primeiroNome(currentUser.nome)}.
          </h1>
          <p className="font-display mt-4 text-[24px] sm:text-[30px] leading-tight font-semibold text-[#DCEBF7]">
            {acompanhando ? (
              <>{fila.length || 'Nenhum'} pedido{fila.length === 1 ? '' : 's'} <span className="text-[#3CC27F]">/</span> em andamento</>
            ) : totalPendente > 0 ? (
              <>{totalPendente} {totalPendente === 1 ? 'decisão' : 'decisões'} <span className="text-[#3CC27F]">/</span> {totalPendente === 1 ? 'espera' : 'esperam'} por você</>
            ) : itens === null ? (
              <>Carregando sua fila<span className="text-[#3CC27F]">…</span></>
            ) : (
              <>Tudo em dia <span className="text-[#3CC27F]">/</span> nada pendente</>
            )}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#fila"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-[var(--ink)] text-[14px] font-semibold hover:bg-[#E6F0F8] transition-colors"
            >
              {acompanhando ? 'Ver meus pedidos' : 'Ir para a fila'} <ArrowRight size={16} />
            </a>
            {podeSolicitar && (
              <button
                type="button"
                onClick={() => onOpenApp('frota', 'nova-solicitacao')}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-white/40 text-white text-[14px] font-semibold hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Solicitar veículo
              </button>
            )}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-full text-[#CFE2F2] text-[14px] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Search size={16} /> Buscar
            </button>
          </div>
        </div>
        <Pinheiral className="hidden lg:block absolute right-6 bottom-0 w-[40%] h-[86%]" />
      </section>

      {/* ---------------- Indicadores em blocos de cor */}
      <section aria-label="Situação" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {(indicadores ?? [null, null, null, null]).map((ind, i) => {
          const estilo = [
            'bg-[var(--verde)] text-white',
            'bg-[var(--brand)] text-white',
            'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]',
            'bg-[var(--ceu)] text-[var(--ink)] dark:text-[var(--text)]',
          ][i];
          const notaCor = i < 2 ? 'text-white/85' : 'text-[var(--text-muted)]';
          if (!ind) {
            return <div key={i} className={`h-[140px] rounded-[var(--radius-xl)] animate-pulse ${estilo}`} />;
          }
          const conteudo = (
            <>
              <span className={`text-[13px] font-medium ${i < 2 ? 'text-white/90' : 'text-[var(--text-muted)]'}`}>{ind.rotulo}</span>
              <span className="font-display mt-2 block text-[44px] sm:text-[52px] leading-none font-bold tabular-nums">
                {ind.valor}
                {ind.complemento && <span className={`ml-2 tracking-normal text-[20px] font-semibold ${i < 2 ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>{ind.complemento}</span>}
              </span>
              <span className={`mt-3 block text-[13px] ${notaCor}`}>{ind.nota}</span>
            </>
          );
          return ind.destino ? (
            <button
              key={i}
              type="button"
              onClick={() => onOpenApp(ind.destino!, ind.subTab)}
              className={`group text-left rounded-[var(--radius-xl)] p-5 sm:p-6 cursor-pointer transition-transform hover:-translate-y-0.5 ${estilo}`}
            >
              {conteudo}
            </button>
          ) : (
            <div key={i} className={`rounded-[var(--radius-xl)] p-5 sm:p-6 ${estilo}`}>{conteudo}</div>
          );
        })}
      </section>

      {erroCarga && (
        <div role="alert" className="rounded-[var(--radius-lg)] border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-[13px] text-[var(--danger)] flex items-center justify-between gap-3">
          <span>{erroCarga}</span>
          <button type="button" onClick={() => void carregarReal()} className="font-semibold underline underline-offset-2 cursor-pointer">Tentar de novo</button>
        </div>
      )}

      {/* ---------------- Fila + Hoje */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <section id="fila" aria-labelledby="t-fila" className="scroll-mt-24 space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="t-fila" className="font-display text-[26px] font-bold">
              {acompanhando ? 'Seus pedidos' : 'Precisa de você'}
            </h2>
            {!acompanhando && <span className="text-[12.5px] text-[var(--text-muted)]">Quem pede não aprova o próprio pedido.</span>}
          </div>

          <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] border border-[var(--border)] divide-y divide-[var(--border)]">
            {itens === null && (
              <div className="p-6 flex items-center gap-2 text-[13.5px] text-[var(--text-muted)]" role="status">
                <Loader2 size={16} className="animate-spin" /> Carregando sua fila…
              </div>
            )}

            {itens !== null && fila.length === 0 && feitos.length === 0 && (
              <div className="px-6 py-10 flex items-center gap-6">
                <Araucaria className="w-12 h-[72px] shrink-0 text-[var(--ink)]" />
                <div>
                  <p className="font-display text-[20px] font-bold">{acompanhando ? 'Nenhum pedido em andamento.' : 'Nada pendente agora.'}</p>
                  <p className="mt-1 text-[13.5px] text-[var(--text-muted)]">
                    {acompanhando ? 'Quando você solicitar um veículo, ele aparece aqui com a etapa atual.' : 'Quando alguém precisar da sua decisão, o pedido aparece aqui.'}
                  </p>
                </div>
              </div>
            )}

            {fila.map((item) => {
              const Icone = ICONES[item.tipo];
              const f = fase[item.chave];
              return (
                <article key={item.chave} className="p-5 sm:p-6">
                  <div className="flex flex-wrap gap-4 items-start">
                    <span className="hidden sm:flex w-11 h-11 shrink-0 rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand-hover)] items-center justify-center">
                      <Icone size={20} />
                    </span>
                    <div className="flex-1 min-w-[220px] space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-[var(--radius-sm)] ${ESTILO_URGENCIA[item.urgencia]}`}>{item.prazo}</span>
                        <span className="text-[12.5px] text-[var(--text-muted)]">{item.rotuloModulo}</span>
                      </div>
                      <h3 className="text-[16px] font-semibold leading-snug">{item.titulo}</h3>
                      <p className="text-[13.5px] text-[var(--text-muted)]">{item.detalhe}</p>
                      <p className="text-[12.5px] text-[var(--text-subtle)]">{item.meta}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:pt-1">
                      {item.executar && f !== 'motivo' && (
                        <>
                          <button
                            type="button"
                            disabled={f === 'enviando'}
                            onClick={() => void decidir(item, true)}
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-[var(--verde)] hover:bg-[var(--verde-hover)] text-white text-[13.5px] font-semibold cursor-pointer disabled:opacity-60"
                          >
                            {f === 'enviando' ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} {item.acaoSim}
                          </button>
                          {item.acaoNao && (
                            <button
                              type="button"
                              disabled={f === 'enviando'}
                              onClick={() => setFase((x) => ({ ...x, [item.chave]: 'motivo' }))}
                              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[13.5px] font-semibold cursor-pointer disabled:opacity-60"
                            >
                              <X size={15} /> {item.acaoNao}
                            </button>
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenApp(item.modulo, item.subTab)}
                        className="inline-flex items-center gap-1 h-10 px-3 rounded-full text-[13.5px] font-medium text-[var(--brand-hover)] hover:bg-[var(--brand-soft)] cursor-pointer"
                      >
                        Abrir <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                  {f === 'motivo' && (
                    <div className="mt-4 sm:ml-[60px] flex flex-col gap-2">
                      <label htmlFor={`motivo-${item.chave}`} className="text-[13px] font-medium">
                        Motivo ({item.acaoNao?.toLowerCase()}) — a pessoa vai receber este texto
                      </label>
                      <textarea
                        id={`motivo-${item.chave}`}
                        rows={2}
                        value={motivos[item.chave] ?? ''}
                        onChange={(e) => setMotivos((m) => ({ ...m, [item.chave]: e.target.value }))}
                        className="w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--brand)]"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => void decidir(item, false)}
                          className="h-9 px-4 rounded-full bg-[var(--danger)] text-white text-[13px] font-semibold cursor-pointer">
                          Confirmar
                        </button>
                        <button type="button" onClick={() => setFase((x) => ({ ...x, [item.chave]: undefined }))}
                          className="h-9 px-4 rounded-full text-[13px] font-medium hover:bg-[var(--surface-2)] cursor-pointer">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                  {erros[item.chave] && (
                    <p role="alert" className="mt-3 sm:ml-[60px] text-[13px] text-[var(--danger)]">{erros[item.chave]}</p>
                  )}
                </article>
              );
            })}

            {feitos.map(({ item, aprovou }) => (
              <div key={`feito-${item.chave}`} role="status" className="px-6 py-4 flex flex-wrap items-center justify-between gap-2 bg-[var(--surface-2)]">
                <span className="text-[13.5px]">
                  <span className={`font-semibold ${aprovou ? 'text-[var(--verde)]' : 'text-[var(--danger)]'}`}>
                    {aprovou ? (item.acaoSim === 'Assumir' ? 'Assumido' : 'Aprovado') : item.acaoNao === 'Glosar' ? 'Glosada' : 'Reprovado'}
                  </span>{' '}
                  · {item.titulo}
                </span>
                <button type="button" onClick={() => onOpenApp(item.modulo, item.subTab)}
                  className="text-[13px] text-[var(--brand-hover)] underline underline-offset-2 cursor-pointer">
                  Ver no módulo
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="t-hoje" className="rounded-[var(--radius-xl)] bg-[var(--surface)] border border-[var(--border)] p-6">
            <h2 id="t-hoje" className="font-display text-[22px] font-bold">Hoje</h2>
            {hojeEventos.length === 0 ? (
              <p className="mt-3 text-[13.5px] text-[var(--text-muted)]">Nenhuma viagem, reunião ou prazo registrado para hoje.</p>
            ) : (
              <ol className="mt-4 space-y-4 border-l-2 border-[var(--border)]">
                {hojeEventos.map((e, i) => (
                  <li key={i} className="relative pl-5">
                    <span aria-hidden="true" className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full ring-4 ring-[var(--surface)] ${e.alerta ? 'bg-[#C2410C]' : 'bg-[var(--verde-vivo)]'}`} />
                    <p className={`text-[12px] font-semibold ${e.alerta ? 'text-[var(--warning)]' : 'text-[var(--verde)]'}`}>{e.hora}</p>
                    <p className="text-[14px] font-medium leading-snug">{e.titulo}</p>
                    <p className="text-[12.5px] text-[var(--text-muted)]">{e.detalhe}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-labelledby="t-sistemas" className="rounded-[var(--radius-xl)] bg-[var(--verde-soft)] border border-[var(--verde-border)] p-6">
            <h2 id="t-sistemas" className="font-display text-[20px] font-bold text-[var(--verde)]">Sistemas do Estado</h2>
            <ul className="mt-3 space-y-1">
              {SISTEMAS_ESTADO.map((s) => (
                <li key={s.nome}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between h-10 px-3 -mx-3 rounded-[var(--radius-md)] text-[14px] font-medium hover:bg-white/60 dark:hover:bg-white/5">
                    {s.nome} <ExternalLink size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
                    <span className="sr-only">(abre em nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setCatalogo(true)}
              className="mt-2 text-[13px] font-semibold text-[var(--verde)] underline underline-offset-2 cursor-pointer">
              Ver todos os sistemas
            </button>
          </section>
        </aside>
      </div>

      {/* ---------------- Módulos */}
      <section aria-labelledby="t-modulos" className="space-y-3">
        <h2 id="t-modulos" className="font-display text-[26px] font-bold">Módulos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modulos.map((m) => {
            const Icone = m.icone;
            return (
              <button key={m.id} type="button" onClick={() => onOpenApp(m.id as Destino)}
                className="group flex items-center gap-4 p-4 rounded-[var(--radius-xl)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--brand)] text-left cursor-pointer transition-colors">
                <span className="w-11 h-11 shrink-0 rounded-[var(--radius-lg)] bg-[var(--ink)] text-white flex items-center justify-center group-hover:bg-[var(--brand)] transition-colors">
                  <Icone size={19} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-semibold">{m.nome}</span>
                  <span className="block text-[12.5px] text-[var(--text-muted)] truncate">{m.descricao}</span>
                </span>
                <ArrowRight size={16} className="ml-auto shrink-0 text-[var(--text-subtle)] group-hover:text-[var(--brand)] transition-colors" />
              </button>
            );
          })}
        </div>
      </section>

      <CatalogoSistemasModal isOpen={catalogo} onClose={() => setCatalogo(false)} onOpenApp={(id) => onOpenApp(id as Destino)} setor={currentUser.setor} />
    </div>
  );
};

