import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Car, Check, ClipboardCheck, ExternalLink, Headphones, Landmark, Loader2, Plus, Receipt, X,
} from 'lucide-react';
import type { Agendamento, Usuario, Veiculo } from '../../types';
import type { AppModuleId } from '../hub/AppLauncherHub';
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
  currentUser, veiculos, agendamentos, onOpenApp, onAprovarFrota, onReprovarFrota,
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

  const [filtro, setFiltro] = useState<ItemMesa['tipo'] | 'todos'>('todos');
  const [dataHoje] = useState(() => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));

  const chavesFeitas = new Set(feitos.map((f) => f.item.chave));
  const fila = (itens ?? []).filter((i) => !chavesFeitas.has(i.chave));
  const totalPendente = acompanhando ? 0 : fila.length;
  const filaVisivel = filtro === 'todos' ? fila : fila.filter((i) => i.tipo === filtro);
  const ORDEM: Record<Urgencia, number> = { vencida: 0, alta: 1, media: 2, baixa: 3 };
  const maisUrgente = [...fila].sort((a, b) => ORDEM[a.urgencia] - ORDEM[b.urgencia])[0];
  const tiposPresentes = Array.from(new Set(fila.map((i) => i.tipo)));
  const ROTULO_TIPO: Record<ItemMesa['tipo'], string> = {
    frota: 'Frota', vistoria: 'Vistoria', meu_pedido: 'Pedidos', diaria: 'Diárias', chamado: 'Chamados', cense: 'CENSE',
  };
  const COR_ICONE: Record<ItemMesa['tipo'], string> = {
    frota: 'bg-[var(--ceu)] text-[var(--brand)]', vistoria: 'bg-[var(--ceu)] text-[var(--brand)]', meu_pedido: 'bg-[var(--ceu)] text-[var(--brand)]',
    diaria: 'bg-[var(--verde-soft)] text-[var(--verde)]', chamado: 'bg-[#FFE7D9] text-[#9A3412] dark:bg-[#3A2418] dark:text-[#FFB48A]',
    cense: 'bg-[var(--lima-soft)] text-[#4A5E12] dark:text-[var(--lima)]',
  };

  const podeSolicitar = real ? pode('frotas:solicitar') : temPermissao(currentUser, 'frotas:solicitar');

  const pilula = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer transition-colors disabled:opacity-60';

  // ============================================================== tela
  return (
    <div className="space-y-6 pb-10">
      {/* ---------------- Destaque */}
      <section className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[#0072BB] text-white dark:bg-[#0A3A63] lg:min-h-[500px] flex flex-wrap">
        <div className="relative z-10 flex-1 basis-[520px] px-6 py-10 sm:px-12 sm:py-14 flex flex-col justify-center gap-5">
          <p className="flex items-center gap-2.5 text-[12.5px] font-semibold tracking-[0.12em] uppercase text-[#CFE7FA]">
            <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-[var(--lima)]" />
            <span className="first-letter:uppercase">{dataHoje}</span>
          </p>
          <h1 className="font-display text-[48px] sm:text-[72px] xl:text-[82px] leading-[0.95] font-extrabold">
            {saudacao()},<br />{primeiroNome(currentUser.nome)}<span className="text-[var(--lima)]">.</span>
          </h1>
          <p className="font-display text-[20px] sm:text-[26px] leading-tight font-medium text-[#E3F1FC]">
            {acompanhando ? (
              <>{fila.length || 'Nenhum'} pedido{fila.length === 1 ? '' : 's'} <span className="text-[var(--lima)]">/</span> em andamento</>
            ) : itens === null ? (
              <>Carregando sua fila<span className="text-[var(--lima)]">…</span></>
            ) : totalPendente > 0 ? (
              <>{totalPendente} {totalPendente === 1 ? 'decisão' : 'decisões'} <span className="text-[var(--lima)]">/</span> {totalPendente === 1 ? 'espera' : 'esperam'} por você</>
            ) : (
              <>Tudo em dia <span className="text-[var(--lima)]">/</span> nada pendente</>
            )}
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <a href="#fila" className={`${pilula} h-[54px] px-7 text-[15.5px] font-bold bg-[var(--lima)] text-[var(--noite)] hover:bg-[#D6F28A]`}>
              {acompanhando ? 'Ver meus pedidos' : 'Resolver agora'} <ArrowRight size={18} strokeWidth={2.4} />
            </a>
            {podeSolicitar && (
              <button type="button" onClick={() => onOpenApp('frota', 'nova-solicitacao')}
                className={`${pilula} h-[54px] px-7 text-[15.5px] border-2 border-white/55 text-white hover:bg-white/10`}>
                <Plus size={18} /> Solicitar veículo
              </button>
            )}
          </div>
        </div>

        <div className="relative hidden lg:block flex-1 basis-[420px] min-h-[460px]">
          <Pinheiral className="absolute inset-x-6 top-8 bottom-0" />
        </div>

        {maisUrgente && !acompanhando && (
          <div className="relative lg:absolute z-20 mx-6 mb-6 lg:m-0 lg:right-10 lg:bottom-9 w-auto lg:w-[310px] bg-[var(--surface)] text-[var(--text)] rounded-[22px] p-5 shadow-[0_24px_48px_rgba(0,40,80,0.28)]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11.5px] font-bold tracking-[0.08em] uppercase text-[var(--text-muted)]">Vence primeiro</span>
              <span className={`text-[12px] font-bold rounded-full px-2.5 py-0.5 ${ESTILO_URGENCIA[maisUrgente.urgencia]}`}>{maisUrgente.prazo}</span>
            </div>
            <p className="mt-2.5 font-bold text-[16px] leading-snug">{maisUrgente.titulo}</p>
            <p className="text-[13px] text-[var(--text-muted)]">{maisUrgente.rotuloModulo}</p>
            {maisUrgente.executar ? (
              <button type="button" disabled={fase[maisUrgente.chave] === 'enviando'} onClick={() => void decidir(maisUrgente, true)}
                className={`${pilula} mt-4 w-full h-11 bg-[var(--noite)] text-white hover:bg-black dark:bg-white dark:text-[var(--noite)]`}>
                {fase[maisUrgente.chave] === 'enviando' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {maisUrgente.acaoSim}
              </button>
            ) : (
              <button type="button" onClick={() => onOpenApp(maisUrgente.modulo, maisUrgente.subTab)}
                className={`${pilula} mt-4 w-full h-11 bg-[var(--noite)] text-white hover:bg-black dark:bg-white dark:text-[var(--noite)]`}>
                Abrir <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </section>

      {/* ---------------- Situação em blocos de cor */}
      <section aria-label="Situação" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {(indicadores ?? [null, null, null, null]).map((ind, i) => {
          const estilo = [
            'bg-[#00703C] text-white',
            'bg-[var(--lima)] text-[var(--noite)]',
            'bg-[var(--surface)] text-[var(--text)] border-[1.5px] border-[var(--border)]',
            'bg-[#DCEEFB] text-[#00385E]',
          ][i];
          const suave = ['text-[#D5F2E2]', 'text-[var(--noite)]/80', 'text-[var(--text-muted)]', 'text-[#0B4A75]'][i];
          if (!ind) return <div key={i} className={`h-[180px] rounded-[var(--radius-xl)] animate-pulse ${estilo}`} />;
          const corpo = (
            <>
              <span className={`text-[14px] font-semibold ${suave}`}>{ind.rotulo}</span>
              <span className="font-display block mt-1 text-[48px] sm:text-[64px] leading-none font-extrabold tabular-nums">
                {ind.valor}
                {ind.complemento && <span className={`ml-1 text-[22px] sm:text-[26px] font-bold ${suave}`}>{ind.complemento.replace('de ', '/')}</span>}
              </span>
              <span className={`mt-auto pt-4 block text-[13.5px] ${suave}`}>{ind.nota}</span>
            </>
          );
          const base = `rounded-[var(--radius-xl)] p-6 sm:p-7 min-h-[180px] flex flex-col text-left ${estilo}`;
          return ind.destino ? (
            <button key={i} type="button" onClick={() => onOpenApp(ind.destino!, ind.subTab)} className={`${base} cursor-pointer transition-transform hover:-translate-y-0.5`}>{corpo}</button>
          ) : (
            <div key={i} className={base}>{corpo}</div>
          );
        })}
      </section>

      {erroCarga && (
        <div role="alert" className="rounded-[22px] border border-[var(--danger-border)] bg-[var(--danger-soft)] px-5 py-3.5 text-[13.5px] text-[var(--danger)] flex items-center justify-between gap-3">
          <span>{erroCarga}</span>
          <button type="button" onClick={() => void carregarReal()} className="font-semibold underline underline-offset-2 cursor-pointer">Tentar de novo</button>
        </div>
      )}

      {/* ---------------- Fila + lateral */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <section id="fila" aria-labelledby="t-fila" className="scroll-mt-28 rounded-[32px] bg-[var(--surface)] px-5 sm:px-8 pt-7 pb-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="t-fila" className="font-display text-[26px] sm:text-[30px] font-bold">{acompanhando ? 'Seus pedidos' : 'Precisa de você'}</h2>
            {!acompanhando && fila.length > 0 && (
              <div role="group" aria-label="Filtrar por módulo" className="flex flex-wrap gap-1.5">
                {(['todos', ...tiposPresentes] as Array<ItemMesa['tipo'] | 'todos'>).map((tp) => {
                  const ativo = filtro === tp;
                  const qtd = tp === 'todos' ? fila.length : fila.filter((i) => i.tipo === tp).length;
                  return (
                    <button key={tp} type="button" aria-pressed={ativo} onClick={() => setFiltro(tp)}
                      className={`h-9 px-3.5 rounded-full text-[13px] cursor-pointer ${ativo ? 'bg-[var(--noite)] text-white font-semibold dark:bg-white dark:text-[var(--noite)]' : 'border-[1.5px] border-[var(--border)] font-medium hover:border-[var(--text)]'}`}>
                      {tp === 'todos' ? 'Tudo' : ROTULO_TIPO[tp]} {qtd}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <ul className="mt-4">
            {itens === null && (
              <li className="py-6 flex items-center gap-2 text-[14px] text-[var(--text-muted)] border-t-[1.5px] border-[var(--border)]" role="status">
                <Loader2 size={16} className="animate-spin" /> Carregando sua fila…
              </li>
            )}

            {itens !== null && fila.length === 0 && feitos.length === 0 && (
              <li className="py-10 flex items-center gap-6 border-t-[1.5px] border-[var(--border)]">
                <Araucaria className="w-16 h-24 shrink-0" />
                <div>
                  <p className="font-display text-[20px] font-bold">{acompanhando ? 'Nenhum pedido em andamento.' : 'Nada pendente agora.'}</p>
                  <p className="mt-1 text-[14px] text-[var(--text-muted)]">
                    {acompanhando ? 'Quando você solicitar um veículo, ele aparece aqui com a etapa atual.' : 'Quando alguém precisar da sua decisão, o pedido aparece aqui.'}
                  </p>
                </div>
              </li>
            )}

            {filaVisivel.map((item) => {
              const Icone = ICONES[item.tipo];
              const f = fase[item.chave];
              return (
                <li key={item.chave} className="py-5 border-t-[1.5px] border-[var(--border)]">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                    <span aria-hidden="true" className={`w-14 h-14 shrink-0 rounded-[18px] flex items-center justify-center ${COR_ICONE[item.tipo]}`}>
                      <Icone size={24} />
                    </span>
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${ESTILO_URGENCIA[item.urgencia]}`}>{item.prazo}</span>
                        <span className="text-[12.5px] text-[var(--text-muted)]">{item.rotuloModulo}</span>
                      </div>
                      <h3 className="mt-1.5 text-[17px] font-bold leading-snug">{item.titulo}</h3>
                      <p className="text-[13.5px] text-[var(--text-muted)]">{item.detalhe}</p>
                      <p className="text-[12.5px] text-[var(--text-subtle)]">{item.meta}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.executar && f !== 'motivo' && (
                        <>
                          <button type="button" disabled={f === 'enviando'} onClick={() => void decidir(item, true)}
                            className={`${pilula} h-[46px] px-6 text-[14px] font-bold bg-[#00703C] hover:bg-[#005C31] text-white`}>
                            {f === 'enviando' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {item.acaoSim}
                          </button>
                          {item.acaoNao && (
                            <button type="button" disabled={f === 'enviando'} onClick={() => setFase((x) => ({ ...x, [item.chave]: 'motivo' }))}
                              className={`${pilula} h-[46px] px-5 text-[14px] border-[1.5px] border-[var(--border-strong)] hover:border-[var(--text)]`}>
                              <X size={16} /> {item.acaoNao}
                            </button>
                          )}
                        </>
                      )}
                      <button type="button" onClick={() => onOpenApp(item.modulo, item.subTab)}
                        className={`${pilula} h-[46px] px-4 text-[14px] font-medium text-[var(--brand-hover)] hover:bg-[var(--brand-soft)]`}>
                        Abrir <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>

                  {f === 'motivo' && (
                    <div className="mt-4 sm:ml-[76px] flex flex-col gap-2">
                      <label htmlFor={`motivo-${item.chave}`} className="text-[13.5px] font-semibold">
                        Motivo — a pessoa vai receber este texto
                      </label>
                      <textarea id={`motivo-${item.chave}`} rows={2} value={motivos[item.chave] ?? ''}
                        onChange={(e) => setMotivos((m) => ({ ...m, [item.chave]: e.target.value }))}
                        className="w-full rounded-[16px] border-[1.5px] border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[14.5px] focus:outline-none focus:border-[var(--brand)]" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => void decidir(item, false)} className={`${pilula} h-10 px-5 text-[13.5px] bg-[var(--danger)] text-white`}>
                          Confirmar {item.acaoNao?.toLowerCase()}
                        </button>
                        <button type="button" onClick={() => setFase((x) => ({ ...x, [item.chave]: undefined }))} className={`${pilula} h-10 px-5 text-[13.5px] font-medium hover:bg-[var(--surface-2)]`}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                  {erros[item.chave] && <p role="alert" className="mt-3 sm:ml-[76px] text-[13.5px] text-[var(--danger)]">{erros[item.chave]}</p>}
                </li>
              );
            })}

            {feitos.map(({ item, aprovou }) => (
              <li key={`feito-${item.chave}`} role="status" className="py-4 border-t-[1.5px] border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
                <span className="text-[14px] flex items-center gap-2.5">
                  <span className={`text-[12px] font-bold rounded-full px-2.5 py-0.5 ${aprovou ? 'bg-[var(--verde-soft)] text-[var(--verde)]' : 'bg-[var(--danger-soft)] text-[var(--danger)]'}`}>
                    {aprovou ? (item.acaoSim === 'Assumir' ? 'Assumido' : 'Aprovado') : item.acaoNao === 'Glosar' ? 'Glosada' : 'Reprovado'}
                  </span>
                  {item.titulo}
                </span>
                <button type="button" onClick={() => onOpenApp(item.modulo, item.subTab)} className="text-[13.5px] text-[var(--brand-hover)] underline underline-offset-2 cursor-pointer">
                  Ver no módulo
                </button>
              </li>
            ))}
          </ul>
          {!acompanhando && <p className="py-4 text-[12.5px] text-[var(--text-muted)] border-t-[1.5px] border-[var(--border)]">Quem pede não aprova o próprio pedido.</p>}
        </section>

        <aside className="space-y-4">
          <section aria-labelledby="t-hoje" className="rounded-[32px] bg-[var(--noite)] text-white p-7">
            <h2 id="t-hoje" className="font-display text-[26px] font-bold">Hoje</h2>
            {hojeEventos.length === 0 ? (
              <p className="mt-3 text-[14px] text-[#A9BDD0]">Nenhuma viagem, reunião ou prazo registrado para hoje.</p>
            ) : (
              <ol className="mt-5 space-y-4">
                {hojeEventos.map((e, i) => (
                  <li key={i} className="grid grid-cols-[76px_1fr] gap-3">
                    <span className={`font-bold text-[14px] ${e.alerta ? 'text-[#FFB48A]' : 'text-[var(--lima)]'}`}>{e.hora}</span>
                    <span>
                      <strong className="block font-semibold text-[14.5px] leading-snug">{e.titulo}</strong>
                      <span className="text-[13px] text-[#A9BDD0]">{e.detalhe}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-labelledby="t-sistemas" className="rounded-[32px] bg-[var(--surface)] p-7">
            <h2 id="t-sistemas" className="font-display text-[20px] font-bold">Sistemas do Estado</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SISTEMAS_ESTADO.map((s) => (
                <li key={s.nome}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-[var(--surface-2)] text-[14px] font-semibold hover:bg-[var(--surface-3)]">
                    {s.nome} <ExternalLink size={14} aria-hidden="true" /><span className="sr-only">(abre em nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setCatalogo(true)} className="mt-4 text-[13.5px] font-semibold text-[var(--brand-hover)] underline underline-offset-2 cursor-pointer">
              Ver todos os sistemas
            </button>
          </section>
        </aside>
      </div>

      <CatalogoSistemasModal isOpen={catalogo} onClose={() => setCatalogo(false)} onOpenApp={(id) => onOpenApp(id as Destino)} setor={currentUser.setor} />
    </div>
  );
};
