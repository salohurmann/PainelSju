import React, { useRef, useState } from 'react';
import { useJanela } from '../ui/Janela';
import { imprimir } from '../../lib/imprimir';
import { Usuario } from '../../types';
import { soundFX } from '../../services/soundFx';
import { eventBus } from '../../services/eventBus';
import { ModuloCabecalho, AcaoModulo, NumeroModulo } from '../modulo/ModuloCabecalho';
import { MapaParanaInterativo, CIDADES_PARANA, DestinoParana } from './MapaParanaInterativo';
import { Send, Minus, Plus, Check, Printer, AlertCircle, Info, Clock, Route } from 'lucide-react';

interface CalculadoraDiariasViewProps {
  currentUser: Usuario;
  onVoltarHub: () => void;
}

type Nivel = 'medio' | 'superior' | 'direcao';
type StatusDiaria = 'pendente' | 'aprovada' | 'reprovada' | 'empenhada' | 'prestacao_contas' | 'encerrada';

/**
 * Mesma tabela e mesma conta do banco (diarias_tabela + calcular_diaria).
 * Os valores são de demonstração: a administração cadastra a tabela oficial.
 */
const TABELA: Record<Nivel, { rotulo: string; valor: number }> = {
  medio: { rotulo: 'Apoio / nível médio', valor: 280 },
  superior: { rotulo: 'Técnico / nível superior', valor: 380 },
  direcao: { rotulo: 'Direção / gabinete', valor: 520 },
};

const calcular = (nivel: Nivel, dias: number, pernoite: boolean) => {
  const total = Math.round(TABELA[nivel].valor * dias * (pernoite ? 1 : 0.5) * 100) / 100;
  const r = (v: number) => Math.round(v * 100) / 100;
  const hospedagem = pernoite ? r(total * 0.5) : 0;
  const alimentacao = pernoite ? r(total * 0.35) : r(total * 0.7);
  return { total, hospedagem, alimentacao, locomocao: r(total - hospedagem - alimentacao) };
};

const STATUS: Record<StatusDiaria, { texto: string; cls: string }> = {
  pendente: { texto: 'Aguardando a chefia', cls: 'bg-[var(--warning-soft)] text-[var(--warning)]' },
  aprovada: { texto: 'Aprovada', cls: 'bg-[var(--verde-soft)] text-[var(--verde)]' },
  reprovada: { texto: 'Não aprovada', cls: 'bg-[var(--danger-soft)] text-[var(--danger)]' },
  empenhada: { texto: 'Pagamento empenhado', cls: 'bg-[var(--brand-soft)] text-[var(--brand)]' },
  prestacao_contas: { texto: 'Prestar contas', cls: 'bg-[var(--warning-soft)] text-[var(--warning)]' },
  encerrada: { texto: 'Encerrada', cls: 'bg-[var(--surface-2)] text-[var(--text-muted)]' },
};

const MOTIVOS = [
  { titulo: 'Visita a unidade', texto: 'Visita técnica às unidades socioeducativas e acompanhamento dos programas de atendimento no município.' },
  { titulo: 'Rede de proteção', texto: 'Reunião com Conselhos Tutelares e a rede de proteção do município.' },
  { titulo: 'Capacitação', texto: 'Capacitação presencial de servidores estaduais e municipais ligados à Secretaria.' },
  { titulo: 'Fiscalização', texto: 'Fiscalização no local da aplicação de recursos de convênio estadual.' },
];

interface PedidoDiaria {
  id: string;
  protocolo: string;
  servidor: string;
  destino: string;
  ida: string;
  volta: string;
  dias: number;
  pernoite: boolean;
  nivel: Nivel;
  total: number;
  status: StatusDiaria;
  motivo: string;
}

const isoMais = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const br = (d: string) => d.split('-').reverse().join('/');
const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PEDIDOS_INICIAIS = (nome: string): PedidoDiaria[] => [
  { id: 'd1', protocolo: 'DI-2026-000214', servidor: 'Carlos Silveira', destino: 'Londrina', ida: isoMais(-9), volta: isoMais(-7), dias: 2.5, pernoite: true, nivel: 'superior', total: 950, status: 'empenhada', motivo: MOTIVOS[0].texto },
  { id: 'd2', protocolo: 'DI-2026-000209', servidor: nome, destino: 'Foz do Iguaçu', ida: isoMais(6), volta: isoMais(8), dias: 3, pernoite: true, nivel: 'direcao', total: 1560, status: 'aprovada', motivo: MOTIVOS[1].texto },
  { id: 'd3', protocolo: 'DI-2026-000198', servidor: 'Marcos Viana', destino: 'Ponta Grossa', ida: isoMais(-15), volta: isoMais(-15), dias: 1, pernoite: false, nivel: 'superior', total: 190, status: 'prestacao_contas', motivo: MOTIVOS[3].texto },
];

export const CalculadoraDiariasView: React.FC<CalculadoraDiariasViewProps> = ({ currentUser, onVoltarHub }) => {
  const [cidade, setCidade] = useState<DestinoParana>(CIDADES_PARANA[4]);
  const [ida, setIda] = useState(isoMais(7));
  const [volta, setVolta] = useState(isoMais(8));
  const [pernoite, setPernoite] = useState(true);
  const [dias, setDias] = useState(1.5);
  const [nivel, setNivel] = useState<Nivel>('superior');
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<PedidoDiaria[]>(() => PEDIDOS_INICIAIS(currentUser.nome));
  const [enviado, setEnviado] = useState<PedidoDiaria | null>(null);
  const enviadoRef = useRef<HTMLDivElement>(null);
  const enviadoJanela = useJanela(Boolean(enviado), () => setEnviado(null));
  const resumoRef = useRef<HTMLDivElement>(null);

  const conta = calcular(nivel, dias, pernoite);
  const noites = Math.max(0, Math.round((new Date(volta).getTime() - new Date(ida).getTime()) / 86_400_000));

  const mudarDatas = (novaIda: string, novaVolta: string) => {
    setIda(novaIda);
    setVolta(novaVolta < novaIda ? novaIda : novaVolta);
    const n = Math.max(0, Math.round((new Date(novaVolta < novaIda ? novaIda : novaVolta).getTime() - new Date(novaIda).getTime()) / 86_400_000));
    setPernoite(n > 0);
    // Sugestão: uma diária por noite fora e meia no dia da volta; sem pernoite, uma por dia.
    setDias(n > 0 ? n + 0.5 : 1);
  };

  const enviar = () => {
    setErro(null);
    if (volta < ida) return setErro('A volta não pode ser antes da ida.');
    if (ida < isoMais(0)) return setErro('A data de ida já passou.');
    if (motivo.trim().length < 5) return setErro('Escreva o motivo da viagem.');
    if (dias <= 0 || dias > 30) return setErro('A quantidade de diárias deve ficar entre 0,5 e 30.');
    const pedido: PedidoDiaria = {
      id: 'd-' + Date.now(),
      protocolo: `DI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      servidor: currentUser.nome,
      destino: cidade.nome,
      ida,
      volta,
      dias,
      pernoite,
      nivel,
      total: conta.total,
      status: 'pendente',
      motivo: motivo.trim(),
    };
    setPedidos(prev => [pedido, ...prev]);
    eventBus.emit('diaria.calculada', { municipio: cidade.nome, dias, valorTotal: conta.total, solicitante: currentUser.nome });
    soundFX.playSuccess();
    setEnviado(pedido);
    setMotivo('');
  };

  const campo = 'h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]';

  return (
    <div className="space-y-5 font-sans">
      <ModuloCabecalho
        cor="lima"
        rotulo="Viagens a serviço · Diárias"
        titulo="Diárias"
        descricao="Escolha o destino, as datas e o seu cargo. O valor sai na hora e o pedido vai para a chefia aprovar."
        onVoltar={onVoltarHub}
        acoes={
          <AcaoModulo destaque icone={<Send size={15} />} onClick={() => resumoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
            Fazer pedido
          </AcaoModulo>
        }
      >
        <div className="flex flex-wrap gap-2">
          <NumeroModulo rotulo="Destino" valor={cidade.nome} detalhe="saindo de Curitiba" />
          <NumeroModulo rotulo="Valor" valor={moeda(conta.total)} detalhe={`${String(dias).replace('.', ',')} diária${dias === 1 ? '' : 's'}`} />
        </div>
      </ModuloCabecalho>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8 space-y-5">
          <Bloco numero={1} titulo="Para onde">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-5 md:items-center">
              <div className="md:col-span-3 rounded-[18px] bg-[var(--surface-2)] p-3">
                <MapaParanaInterativo cidadeSelecionada={cidade} onSelectCidade={c => { soundFX.playClick(); setCidade(c); }} />
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {CIDADES_PARANA.slice(1).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={cidade.id === c.id}
                      onClick={() => setCidade(c)}
                      className={`h-9 rounded-full px-3.5 text-[13px] font-semibold transition-colors cursor-pointer ${
                        cidade.id === c.id ? 'bg-[#00385E] text-white' : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]'
                      }`}
                    >
                      {c.nome}
                    </button>
                  ))}
                </div>
                <div className="rounded-[18px] border border-[var(--border)] p-4">
                  <div className="text-xs text-[var(--text-muted)]">Região {cidade.regiao}</div>
                  <div className="font-display text-2xl font-bold text-[var(--text)]">{cidade.nome}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-[var(--text)]"><Route size={15} className="text-[var(--text-subtle)]" /> <strong className="tabular-nums">{cidade.distanciaKm} km</strong></span>
                    <span className="inline-flex items-center gap-1.5 text-[var(--text)]"><Clock size={15} className="text-[var(--text-subtle)]" /> <strong className="tabular-nums">~{String(cidade.tempoHoras).replace('.', ',')}h</strong></span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">Ida, pela {cidade.rodovias}. Distâncias aproximadas.</div>
                </div>
              </div>
            </div>
          </Bloco>

          <Bloco numero={2} titulo="Quando">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="di-ida" className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Ida</label>
                <input id="di-ida" type="date" min={isoMais(0)} value={ida} onChange={e => mudarDatas(e.target.value, volta)} className={`${campo} tabular-nums`} />
              </div>
              <div>
                <label htmlFor="di-volta" className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Volta</label>
                <input id="di-volta" type="date" min={ida} value={volta} onChange={e => mudarDatas(ida, e.target.value)} className={`${campo} tabular-nums`} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Vai dormir fora?</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: true, t: 'Sim' },
                    { v: false, t: 'Não, volto no dia' },
                  ].map(o => (
                    <button
                      key={String(o.v)}
                      type="button"
                      aria-pressed={pernoite === o.v}
                      onClick={() => setPernoite(o.v)}
                      className={`h-11 rounded-full text-[13px] font-semibold cursor-pointer ${
                        pernoite === o.v ? 'bg-[#00385E] text-white' : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]'
                      }`}
                    >
                      {o.t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span id="di-qtd" className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Quantidade de diárias</span>
                <div className="flex items-center gap-2" role="group" aria-labelledby="di-qtd">
                  <button type="button" aria-label="Menos meia diária" onClick={() => setDias(d => Math.max(0.5, d - 0.5))} className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
                    <Minus size={16} />
                  </button>
                  <output className="font-display flex-1 text-center text-2xl font-bold tabular-nums text-[var(--text)]" aria-live="polite">
                    {String(dias).replace('.', ',')}
                  </output>
                  <button type="button" aria-label="Mais meia diária" onClick={() => setDias(d => Math.min(30, d + 0.5))} className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-[var(--text-muted)]">
              <Info size={14} className="mt-px shrink-0" />
              {noites > 0
                ? `${noites} noite${noites > 1 ? 's' : ''} fora. Sugerimos ${String(noites + 0.5).replace('.', ',')} diárias (meia no dia da volta); ajuste se a regra do seu caso for outra.`
                : 'Viagem de um dia só. Sem pernoite, cada diária vale metade.'}
            </p>
          </Bloco>

          <Bloco numero={3} titulo="Seu cargo">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(Object.keys(TABELA) as Nivel[]).map(n => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={nivel === n}
                  onClick={() => setNivel(n)}
                  className={`rounded-[18px] border-2 p-4 text-left transition-colors cursor-pointer ${
                    nivel === n ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="text-sm font-semibold text-[var(--text)]">{TABELA[n].rotulo}</div>
                  <div className="font-display mt-1 text-lg font-bold tabular-nums text-[var(--text)]">{moeda(TABELA[n].valor)}<span className="text-xs font-normal text-[var(--text-muted)]"> por dia</span></div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">Valores de demonstração. A tabela oficial é cadastrada pela administração.</p>
          </Bloco>

          <Bloco numero={4} titulo="Por quê">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {MOTIVOS.map(m => (
                <button key={m.titulo} type="button" onClick={() => setMotivo(m.texto)} className="h-9 rounded-full bg-[var(--surface-2)] px-3.5 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer">
                  {m.titulo}
                </button>
              ))}
            </div>
            <label htmlFor="di-motivo" className="sr-only">Motivo da viagem</label>
            <textarea
              id="di-motivo"
              rows={3}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Conte o que vai fazer na viagem, ou escolha um dos modelos acima."
              className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]"
            />
          </Bloco>
        </div>

        <aside ref={resumoRef} className="lg:col-span-4 lg:sticky lg:top-24 rounded-[28px] bg-[#00385E] p-6 text-white">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Você vai receber</div>
          <div className="font-display mt-1 text-[44px] font-bold leading-none tabular-nums text-[#C6E86B]">{moeda(conta.total)}</div>
          <div className="mt-2 text-sm text-white/70">
            {String(dias).replace('.', ',')} × {moeda(TABELA[nivel].valor)}{!pernoite && ' × ½ (sem pernoite)'}
          </div>
          <dl className="mt-5 space-y-2.5 text-sm">
            {[
              { r: 'Hospedagem', v: conta.hospedagem, p: pernoite ? '50%' : '—' },
              { r: 'Alimentação', v: conta.alimentacao, p: pernoite ? '35%' : '70%' },
              { r: 'Transporte local', v: conta.locomocao, p: pernoite ? '15%' : '30%' },
            ].map(l => (
              <div key={l.r} className="flex items-center justify-between gap-3">
                <dt className="text-white/70">{l.r} <span className="text-white/40">{l.p}</span></dt>
                <dd className="font-semibold tabular-nums">{moeda(l.v)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <span className="bg-[#C6E86B]" style={{ width: `${(conta.hospedagem / (conta.total || 1)) * 100}%` }} />
            <span className="bg-[#3CC27F]" style={{ width: `${(conta.alimentacao / (conta.total || 1)) * 100}%` }} />
            <span className="bg-[#7CC0F0]" style={{ width: `${(conta.locomocao / (conta.total || 1)) * 100}%` }} />
          </div>
          <dl className="mt-5 space-y-1.5 border-t border-white/15 pt-4 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-white/60">Destino</dt><dd className="font-semibold">{cidade.nome}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-white/60">Período</dt><dd className="font-semibold tabular-nums">{br(ida)}{volta !== ida && ` a ${br(volta)}`}</dd></div>
          </dl>
          {erro && (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-[14px] bg-[#FFD3CC] p-3 text-[13px] font-medium text-[#7A160E]">
              <AlertCircle size={16} className="mt-px shrink-0" /> {erro}
            </p>
          )}
          <button type="button" onClick={enviar} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#C6E86B] text-sm font-bold text-[#0B1B2E] hover:opacity-90 cursor-pointer">
            Enviar para a chefia <Send size={15} />
          </button>
          <p className="mt-3 text-center text-xs text-white/55">O valor é conferido de novo no servidor ao salvar.</p>
        </aside>
      </div>

      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h3 className="font-display text-xl font-bold text-[var(--text)]">Pedidos de diária</h3>
        <ul className="mt-3 divide-y divide-[var(--border)]">
          {pedidos.map(p => (
            <li key={p.id} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text)]">Curitiba → {p.destino}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS[p.status].cls}`}>{STATUS[p.status].texto}</span>
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {p.servidor} · <span className="tabular-nums">{br(p.ida)}{p.volta !== p.ida && ` a ${br(p.volta)}`}</span> · {String(p.dias).replace('.', ',')} diária{p.dias === 1 ? '' : 's'} · <span className="tabular-nums">{p.protocolo}</span>
                </div>
              </div>
              <div className="font-display text-lg font-bold tabular-nums text-[var(--text)]">{moeda(p.total)}</div>
            </li>
          ))}
        </ul>
      </section>

      {enviado && (
        <div ref={enviadoJanela} tabIndex={-1} className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B1B2E]/60 outline-none sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="di-ok">
          <div ref={enviadoRef} className="w-full max-w-md rounded-t-[28px] bg-[var(--surface)] p-6 sm:rounded-[28px] sm:p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C6E86B] text-[#0B1B2E]">
              <Check size={24} strokeWidth={3} />
            </span>
            <h3 id="di-ok" className="font-display mt-4 text-2xl font-bold text-[var(--text)]">Pedido enviado.</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Protocolo <strong className="tabular-nums text-[var(--text)]">{enviado.protocolo}</strong>. A chefia vai avaliar na Mesa.
            </p>
            <dl className="mt-5 space-y-2 rounded-[18px] bg-[var(--surface-2)] p-4 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">Destino</dt><dd className="font-semibold text-[var(--text)]">{enviado.destino}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">Período</dt><dd className="font-semibold tabular-nums text-[var(--text)]">{br(enviado.ida)}{enviado.volta !== enviado.ida && ` a ${br(enviado.volta)}`}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">Valor</dt><dd className="font-semibold tabular-nums text-[var(--text)]">{moeda(enviado.total)}</dd></div>
            </dl>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => imprimir(enviadoRef.current, `Pedido de diária ${enviado.protocolo}`)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
                <Printer size={15} /> Imprimir
              </button>
              <button type="button" onClick={() => setEnviado(null)} className="h-11 flex-1 rounded-full bg-[#00385E] text-sm font-semibold text-white cursor-pointer">
                Pronto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Bloco: React.FC<{ numero: number; titulo: string; children: React.ReactNode }> = ({ numero, titulo, children }) => (
  <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C6E86B] text-sm font-bold text-[#0B1B2E]">{numero}</span>
      <h3 className="font-display text-xl font-bold text-[var(--text)]">{titulo}</h3>
    </div>
    {children}
  </section>
);
