import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Usuario } from '../../types';
import { temPermissao } from '../../services/rbac';
import { soundFX } from '../../services/soundFx';
import { eventBus } from '../../services/eventBus';
import { useSessao } from '../../auth/contexto';
import { imprimir } from '../../lib/imprimir';
import { ModuloCabecalho, AcaoModulo, NumeroModulo, AbasModulo } from '../modulo/ModuloCabecalho';
import { Janela } from '../ui/Janela';
import { apiVotacaoDemo } from '../../data/votacao/demo';
import { apiVotacaoSupabase, loginsDeEntidade } from '../../data/votacao/supabase';
import type { ApiVotacao, Eleicao, Entidade, NovaEleicao, Resultado, SituacaoEleicao } from '../../data/votacao/tipos';
import { Plus, Check, Vote, Users, CalendarClock, BarChart3, Pencil, Trash2, AlertCircle, Printer, Building2, Search, Lock } from 'lucide-react';

interface VotacaoViewProps {
  currentUser: Usuario;
  onVoltarHub?: () => void;
  /** Pessoas que podem virar login de entidade (papel "entidade votante"). */
  pessoasLogin?: Array<{ id: string; nome: string; email: string }>;
}

type Aba = 'eleicoes' | 'entidades';

const SITUACAO: Record<SituacaoEleicao, { texto: string; cls: string }> = {
  aberta: { texto: 'Aberta', cls: 'bg-[var(--verde-soft)] text-[var(--verde)]' },
  agendada: { texto: 'Agendada', cls: 'bg-[var(--warning-soft)] text-[var(--warning)]' },
  encerrada: { texto: 'Encerrada', cls: 'bg-[var(--surface-2)] text-[var(--text-muted)]' },
};

const ORDEM: Record<SituacaoEleicao, number> = { aberta: 0, agendada: 1, encerrada: 2 };
const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const paraInput = (iso: string) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const deInput = (v: string) => new Date(v).toISOString();
const mensagem = (e: unknown) => (e instanceof Error ? e.message : 'Não foi possível concluir. Tente de novo.');

export const VotacaoView: React.FC<VotacaoViewProps> = ({ currentUser, onVoltarHub, pessoasLogin = [] }) => {
  const { estado } = useSessao();
  const api: ApiVotacao = useMemo(
    () => (estado.fase === 'autenticado' ? apiVotacaoSupabase : apiVotacaoDemo(currentUser)),
    [estado.fase, currentUser],
  );
  const gerencia = temPermissao(currentUser, 'votacao:gerenciar');
  const vota = temPermissao(currentUser, 'votacao:votar');

  const [aba, setAba] = useState<Aba>('eleicoes');
  const [eleicoes, setEleicoes] = useState<Eleicao[] | null>(null);
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [minha, setMinha] = useState<Entidade | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [votando, setVotando] = useState<Eleicao | null>(null);
  const [vendo, setVendo] = useState<Eleicao | null>(null);
  const [editando, setEditando] = useState<Partial<NovaEleicao> | null>(null);
  const [editEntidade, setEditEntidade] = useState<Partial<Entidade> | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [loginsBanco, setLoginsBanco] = useState<Array<{ id: string; nome: string; email: string }>>([]);
  const logins = estado.fase === 'autenticado' ? loginsBanco : pessoasLogin;

  useEffect(() => {
    if (estado.fase === 'autenticado' && gerencia) loginsDeEntidade().then(setLoginsBanco).catch(() => setLoginsBanco([]));
  }, [estado.fase, gerencia]);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const [el, en, mi] = await Promise.all([api.listarEleicoes(), api.listarEntidades(), api.minhaEntidade()]);
      setEleicoes(el);
      setEntidades(en);
      setMinha(mi);
    } catch (e) {
      setErro(mensagem(e));
      setEleicoes([]);
    }
  }, [api]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  const abertas = (eleicoes ?? []).filter(e => e.situacao === 'aberta');
  const pendentesParaMim = vota ? abertas.filter(e => !e.ja_votou && e.candidatas.length > 0).length : 0;

  const excluirEleicao = async (e: Eleicao) => {
    if (!window.confirm(`Apagar a eleição "${e.titulo}"?`)) return;
    try {
      await api.excluirEleicao(e.id);
      setAviso('Eleição apagada.');
      void carregar();
    } catch (err) {
      setAviso(mensagem(err));
    }
  };

  return (
    <div className="space-y-5 font-sans">
      <ModuloCabecalho
        cor="mata"
        rotulo="UTSC · Eleições de entidades"
        titulo="Votação"
        descricao={
          vota
            ? `Você vota em nome de ${minha?.nome ?? 'sua entidade'}. Cada entidade vota uma vez por eleição, na quantidade de candidatas que a eleição pede.`
            : 'Organize as eleições das entidades, acompanhe a participação e publique o resultado quando a votação encerrar.'
        }
        onVoltar={onVoltarHub}
        acoes={
          gerencia ? (
            <AcaoModulo destaque icone={<Plus size={15} />} onClick={() => setEditando({ votos_por_entidade: 3, candidatas: [] })}>
              Nova eleição
            </AcaoModulo>
          ) : undefined
        }
      >
        <div className="flex flex-wrap gap-2">
          {vota && <NumeroModulo rotulo="Esperando seu voto" valor={pendentesParaMim} />}
          <NumeroModulo rotulo="Abertas agora" valor={abertas.length} />
          <NumeroModulo rotulo="Eleições" valor={eleicoes?.length ?? '—'} />
          {gerencia && <NumeroModulo rotulo="Entidades" valor={entidades.length} detalhe={`${entidades.filter(e => e.ativa).length} ativas`} />}
        </div>
        {gerencia && (
          <AbasModulo<Aba>
            ativa={aba}
            onChange={setAba}
            itens={[
              { id: 'eleicoes', rotulo: 'Eleições', icone: <Vote size={14} /> },
              { id: 'entidades', rotulo: 'Entidades', icone: <Building2 size={14} /> },
            ]}
          />
        )}
      </ModuloCabecalho>

      {aviso && (
        <div role="status" className="flex items-center gap-2 rounded-full bg-[#0E4D32] px-5 py-3 text-sm font-medium text-white">
          <Check size={16} className="shrink-0 text-[#C6E86B]" strokeWidth={3} /> {aviso}
        </div>
      )}
      {erro && (
        <p role="alert" className="flex items-start gap-2 rounded-[18px] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          <AlertCircle size={16} className="mt-px shrink-0" /> {erro}
        </p>
      )}
      {vota && !minha && eleicoes && (
        <p className="flex items-start gap-2 rounded-[18px] bg-[var(--warning-soft)] px-4 py-3 text-sm text-[var(--warning)]">
          <AlertCircle size={16} className="mt-px shrink-0" /> Seu login ainda não está ligado a uma entidade. Peça à UTSC para fazer a ligação.
        </p>
      )}

      {aba === 'eleicoes' || !gerencia ? (
        eleicoes === null ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[0, 1].map(i => <div key={i} className="h-56 animate-pulse rounded-[28px] bg-[var(--surface-2)]" />)}
          </div>
        ) : eleicoes.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-14 text-center">
            <div className="font-display text-xl font-bold text-[var(--text)]">Nenhuma eleição por aqui.</div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{gerencia ? 'Crie a primeira em "Nova eleição".' : 'Quando a UTSC abrir uma eleição, ela aparece aqui.'}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[...eleicoes].sort((a, b) => ORDEM[a.situacao] - ORDEM[b.situacao] || b.abre_em.localeCompare(a.abre_em)).map(e => {
              const sit = SITUACAO[e.situacao];
              const pct = e.total_aptas ? Math.round((e.total_eleitoras_votaram / e.total_aptas) * 100) : 0;
              const podeVotar = vota && !!minha && e.situacao === 'aberta' && !e.ja_votou;
              const podeVerResultado = gerencia || e.situacao === 'encerrada';
              return (
                <li key={e.id} className="flex flex-col rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sit.cls}`}>{sit.texto}</span>
                    {e.ja_votou && <span className="rounded-full bg-[#C6E86B] px-3 py-1 text-xs font-bold text-[#0B1B2E]">Sua entidade já votou</span>}
                  </div>
                  <h3 className="font-display mt-3 text-xl font-bold leading-tight text-[var(--text)]">{e.titulo}</h3>
                  <dl className="mt-3 grid grid-cols-1 gap-1.5 text-[13px] text-[var(--text-muted)] sm:grid-cols-2">
                    <div className="flex items-center gap-1.5"><CalendarClock size={14} /> <span className="tabular-nums">{dataHora(e.abre_em)} → {dataHora(e.fecha_em)}</span></div>
                    <div className="flex items-center gap-1.5"><Vote size={14} /> {e.votos_por_entidade} voto{e.votos_por_entidade > 1 ? 's' : ''} por entidade</div>
                    <div className="flex items-center gap-1.5"><Users size={14} /> {e.total_candidatas} entidades candidatas</div>
                  </dl>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>Participação</span>
                      <span className="tabular-nums">{e.total_eleitoras_votaram} de {e.total_aptas} entidades · {pct}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
                      <div className="h-full rounded-full bg-[#00A859]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    {podeVotar && (
                      <button type="button" onClick={() => setVotando(e)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#0E4D32] px-5 text-sm font-bold text-white hover:opacity-90 cursor-pointer">
                        <Vote size={16} /> Votar
                      </button>
                    )}
                    {podeVerResultado ? (
                      <button type="button" onClick={() => setVendo(e)} className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--surface-2)] px-5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer">
                        <BarChart3 size={16} /> {e.situacao === 'encerrada' ? 'Resultado' : 'Parcial'}
                      </button>
                    ) : (
                      !podeVotar && (
                        <span className="inline-flex h-11 items-center gap-2 text-[13px] text-[var(--text-muted)]">
                          <Lock size={14} /> O resultado sai em {dataHora(e.fecha_em)}
                        </span>
                      )
                    )}
                    {gerencia && (
                      <>
                        <button
                          type="button"
                          aria-label={`Editar ${e.titulo}`}
                          onClick={() => setEditando({ id: e.id, titulo: e.titulo, abre_em: e.abre_em, fecha_em: e.fecha_em, votos_por_entidade: e.votos_por_entidade, candidatas: e.candidatas.map(c => c.id) })}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
                        >
                          <Pencil size={15} />
                        </button>
                        {e.total_eleitoras_votaram === 0 && (
                          <button type="button" aria-label={`Apagar ${e.titulo}`} onClick={() => excluirEleicao(e)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] text-[var(--danger)] hover:bg-[var(--danger-soft)] cursor-pointer">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <ListaEntidades entidades={entidades} pessoasLogin={logins} onEditar={setEditEntidade} />
      )}

      {votando && minha && (
        <TelaVoto
          eleicao={votando}
          minha={minha}
          onFechar={() => setVotando(null)}
          onVotar={async ids => {
            await api.votar(votando.id, ids);
            eventBus.emit('votacao.voto_registrado', { eleicaoId: votando.id, titulo: votando.titulo, entidade: minha.nome });
            soundFX.playSuccess();
            void carregar();
          }}
        />
      )}
      {vendo && <TelaResultado eleicao={vendo} api={api} onFechar={() => setVendo(null)} />}
      {editando && (
        <EditarEleicao
          valor={editando}
          entidades={entidades.filter(e => e.ativa && e.pode_ser_candidata)}
          onFechar={() => setEditando(null)}
          onSalvar={async v => {
            await api.salvarEleicao(v);
            setEditando(null);
            setAviso(v.id ? 'Eleição atualizada.' : 'Eleição criada.');
            void carregar();
          }}
        />
      )}
      {editEntidade && (
        <EditarEntidade
          valor={editEntidade}
          pessoasLogin={logins}
          onFechar={() => setEditEntidade(null)}
          onExcluir={
            editEntidade.id
              ? async () => {
                  await api.excluirEntidade(editEntidade.id!);
                  setEditEntidade(null);
                  setAviso('Entidade apagada.');
                  void carregar();
                }
              : undefined
          }
          onSalvar={async v => {
            await api.salvarEntidade(v);
            setEditEntidade(null);
            setAviso('Entidade salva.');
            void carregar();
          }}
        />
      )}
    </div>
  );
};

// ------------------------------------------------------------------ Votar
const TelaVoto: React.FC<{ eleicao: Eleicao; minha: Entidade; onFechar: () => void; onVotar: (ids: string[]) => Promise<void> }> = ({
  eleicao,
  minha,
  onFechar,
  onVotar,
}) => {
  const [escolhidas, setEscolhidas] = useState<string[]>([]);
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [feito, setFeito] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const n = eleicao.votos_por_entidade;

  const alternar = (id: string) => {
    setErro(null);
    setEscolhidas(v => (v.includes(id) ? v.filter(x => x !== id) : v.length >= n ? v : [...v, id]));
  };

  if (feito) {
    return (
      <Janela titulo="Voto registrado" onFechar={onFechar} largura="md">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C6E86B] text-[#0B1B2E]">
          <Check size={28} strokeWidth={3} />
        </span>
        <p className="mt-4 text-[15px] text-[var(--text)]">
          O voto de <strong>{minha.nome}</strong> em “{eleicao.titulo}” foi registrado. Ele não pode ser mudado.
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">O resultado sai quando a eleição encerrar, em {dataHora(eleicao.fecha_em)}.</p>
        <button type="button" onClick={onFechar} className="mt-5 h-11 w-full rounded-full bg-[#0E4D32] text-sm font-semibold text-white cursor-pointer">
          Pronto
        </button>
      </Janela>
    );
  }

  return (
    <Janela titulo={eleicao.titulo} onFechar={onFechar} largura="xl">
      <p className="text-sm text-[var(--text-muted)]">
        Escolha exatamente <strong className="text-[var(--text)]">{n}</strong> entidade{n > 1 ? 's' : ''}. Pode incluir a sua. Cada candidata recebe no máximo um voto seu. Encerra em {dataHora(eleicao.fecha_em)}.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {eleicao.candidatas.map(c => {
          const marcada = escolhidas.includes(c.id);
          const cheia = !marcada && escolhidas.length >= n;
          return (
            <li key={c.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={marcada}
                disabled={cheia}
                onClick={() => alternar(c.id)}
                className={`flex w-full items-center gap-3 rounded-[18px] border-2 p-3.5 text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 ${
                  marcada ? 'border-[#0E4D32] bg-[var(--verde-soft)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${marcada ? 'border-[#0E4D32] bg-[#0E4D32] text-white' : 'border-[var(--border-strong)]'}`}>
                  {marcada && <Check size={15} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--text)]">
                  {c.nome}
                  {c.id === minha.id && <span className="ml-2 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">sua entidade</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex flex-col gap-3 rounded-[18px] bg-[var(--surface-2)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-[var(--text)]">
          Escolhidas: <strong className="font-display text-xl tabular-nums">{escolhidas.length}</strong> de {n}
        </span>
        {confirmando ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirmando(false)} className="h-11 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--text)] cursor-pointer">
              Revisar
            </button>
            <button
              type="button"
              disabled={enviando}
              onClick={async () => {
                setEnviando(true);
                try {
                  await onVotar(escolhidas);
                  setFeito(true);
                } catch (e) {
                  setErro(mensagem(e));
                  setConfirmando(false);
                } finally {
                  setEnviando(false);
                }
              }}
              className="h-11 rounded-full bg-[#0E4D32] px-5 text-sm font-bold text-white disabled:opacity-50 cursor-pointer"
            >
              {enviando ? 'Registrando…' : 'Confirmar voto'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={escolhidas.length !== n}
            onClick={() => setConfirmando(true)}
            className="h-11 rounded-full bg-[#0E4D32] px-6 text-sm font-bold text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        )}
      </div>
      {confirmando && <p className="mt-3 text-sm text-[var(--warning)]">Depois de confirmar, o voto não pode ser mudado.</p>}
      {erro && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-[14px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
          <AlertCircle size={16} className="mt-px shrink-0" /> {erro}
        </p>
      )}
    </Janela>
  );
};

// -------------------------------------------------------------- Resultado
const TelaResultado: React.FC<{ eleicao: Eleicao; api: ApiVotacao; onFechar: () => void }> = ({ eleicao, api, onFechar }) => {
  const [r, setR] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    api.resultado(eleicao.id).then(setR).catch(e => setErro(mensagem(e)));
  }, [api, eleicao.id]);
  const maximo = Math.max(1, ...(r?.candidatas.map(c => c.votos) ?? [1]));

  return (
    <Janela titulo={r?.eleicao.situacao === 'encerrada' ? 'Resultado' : 'Parcial (só a gestão vê)'} onFechar={onFechar} largura="xl">
      {erro ? (
        <p className="text-sm text-[var(--danger)]">{erro}</p>
      ) : !r ? (
        <div className="h-48 animate-pulse rounded-[18px] bg-[var(--surface-2)]" />
      ) : (
        <>
          <div ref={ref}>
            <h4 className="font-display text-xl font-bold text-[var(--text)]">{r.eleicao.titulo}</h4>
            <p className="text-sm text-[var(--text-muted)]">
              {dataHora(r.eleicao.abre_em)} a {dataHora(r.eleicao.fecha_em)} · {r.eleicao.votos_por_entidade} voto(s) por entidade
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ['Aptas a votar', r.total_entidades],
                ['Votaram', r.total_votaram],
                ['Participação', `${String(r.participacao).replace('.', ',')}%`],
              ].map(([rot, v]) => (
                <div key={rot as string} className="rounded-[18px] bg-[var(--surface-2)] px-3.5 py-3">
                  <div className="text-[11px] text-[var(--text-muted)]">{rot}</div>
                  <div className="font-display text-xl font-bold tabular-nums text-[var(--text)]">{v}</div>
                </div>
              ))}
            </div>
            <ol className="mt-5 space-y-3">
              {r.candidatas.map((c, i) => (
                <li key={c.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-[var(--text)]">
                      <span className="mr-2 font-display font-bold tabular-nums text-[var(--text-subtle)]">{i + 1}º</span>
                      <strong className="font-semibold">{c.nome}</strong>
                    </span>
                    <span className="font-display text-lg font-bold tabular-nums text-[var(--text)]">{c.votos}</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <div className="h-full rounded-full bg-[#00A859]" style={{ width: `${(c.votos / maximo) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-6 flex gap-2">
            <button type="button" onClick={() => imprimir(ref.current, `Resultado · ${r.eleicao.titulo}`)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#0E4D32] text-sm font-semibold text-white cursor-pointer">
              <Printer size={15} /> Imprimir ou salvar PDF
            </button>
            <button type="button" onClick={onFechar} className="h-11 flex-1 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
              Fechar
            </button>
          </div>
        </>
      )}
    </Janela>
  );
};

// ------------------------------------------------------- Editar eleição
const EditarEleicao: React.FC<{
  valor: Partial<NovaEleicao>;
  entidades: Entidade[];
  onFechar: () => void;
  onSalvar: (v: NovaEleicao) => Promise<void>;
}> = ({ valor, entidades, onFechar, onSalvar }) => {
  const amanha9 = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  };
  const [titulo, setTitulo] = useState(valor.titulo ?? '');
  const [abre, setAbre] = useState(paraInput(valor.abre_em ?? amanha9()));
  const [fecha, setFecha] = useState(paraInput(valor.fecha_em ?? new Date(new Date(amanha9()).getTime() + 7 * 86_400_000).toISOString()));
  const [votos, setVotos] = useState(String(valor.votos_por_entidade ?? 3));
  const [candidatas, setCandidatas] = useState<string[]>(valor.candidatas ?? entidades.map(e => e.id));
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const campo = 'h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]';
  const rotulo = 'mb-1.5 block text-[13px] font-semibold text-[var(--text)]';

  return (
    <Janela titulo={valor.id ? 'Editar eleição' : 'Nova eleição'} onFechar={onFechar} largura="xl">
      <form
        className="space-y-4"
        onSubmit={async ev => {
          ev.preventDefault();
          setErro(null);
          setSalvando(true);
          try {
            await onSalvar({ id: valor.id, titulo: titulo.trim(), abre_em: deInput(abre), fecha_em: deInput(fecha), votos_por_entidade: Number(votos) || 0, candidatas });
          } catch (e) {
            setErro(mensagem(e));
          } finally {
            setSalvando(false);
          }
        }}
      >
        <div>
          <label htmlFor="el-titulo" className={rotulo}>Título</label>
          <input id="el-titulo" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex.: Conselho Estadual · sociedade civil" className={campo} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="el-abre" className={rotulo}>Abre em</label>
            <input id="el-abre" type="datetime-local" value={abre} onChange={e => setAbre(e.target.value)} className={`${campo} tabular-nums`} />
          </div>
          <div>
            <label htmlFor="el-fecha" className={rotulo}>Encerra em</label>
            <input id="el-fecha" type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} className={`${campo} tabular-nums`} />
          </div>
          <div>
            <label htmlFor="el-votos" className={rotulo}>Votos por entidade</label>
            <input id="el-votos" inputMode="numeric" value={votos} onChange={e => setVotos(e.target.value.replace(/\D/g, '').slice(0, 2))} className={`${campo} tabular-nums`} />
          </div>
        </div>
        <fieldset>
          <legend className="mb-2 flex w-full items-baseline justify-between text-[13px] font-semibold text-[var(--text)]">
            Entidades candidatas
            <span className="font-normal text-[var(--text-muted)]">
              {candidatas.length} de {entidades.length} ·{' '}
              <button type="button" className="font-semibold text-[var(--brand)] hover:underline cursor-pointer" onClick={() => setCandidatas(candidatas.length === entidades.length ? [] : entidades.map(e => e.id))}>
                {candidatas.length === entidades.length ? 'tirar todas' : 'marcar todas'}
              </button>
            </span>
          </legend>
          <ul className="grid max-h-64 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
            {entidades.map(e => (
              <li key={e.id}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]">
                  <input
                    type="checkbox"
                    checked={candidatas.includes(e.id)}
                    onChange={ev => setCandidatas(v => (ev.target.checked ? [...v, e.id] : v.filter(x => x !== e.id)))}
                    className="h-4 w-4 accent-[#0E4D32]"
                  />
                  {e.nome}
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Votam todas as entidades ativas e habilitadas; as candidatas são as que podem receber voto. Depois do primeiro voto, só dá para mudar o título ou adiar o encerramento.</p>
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
          <button type="submit" disabled={salvando} className="h-11 flex-[1.4] rounded-full bg-[#0E4D32] text-sm font-bold text-white disabled:opacity-50 cursor-pointer">
            {salvando ? 'Salvando…' : 'Salvar eleição'}
          </button>
        </div>
      </form>
    </Janela>
  );
};

// ------------------------------------------------------------- Entidades
const ListaEntidades: React.FC<{
  entidades: Entidade[];
  pessoasLogin: Array<{ id: string; nome: string; email: string }>;
  onEditar: (e: Partial<Entidade>) => void;
}> = ({ entidades, pessoasLogin, onEditar }) => {
  const [busca, setBusca] = useState('');
  const t = busca.trim().toLowerCase();
  const lista = entidades.filter(e => !t || `${e.nome} ${e.responsavel}`.toLowerCase().includes(t));
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:w-80">
          <span className="sr-only">Buscar entidade</span>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar entidade" className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface-2)] pl-11 pr-4 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]" />
        </label>
        <button type="button" onClick={() => onEditar({ ativa: true, pode_votar: true, pode_ser_candidata: true, perfil_id: null })} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0E4D32] px-5 text-sm font-semibold text-white cursor-pointer">
          <Plus size={16} /> Nova entidade
        </button>
      </div>
      <ul className="mt-4 divide-y divide-[var(--border)]">
        {lista.map(e => {
          const login = pessoasLogin.find(p => p.id === e.perfil_id);
          return (
            <li key={e.id} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold text-[var(--text)]">{e.nome}</span>
                  {!e.ativa && <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">Inativa</span>}
                  {e.ativa && !e.pode_votar && <span className="rounded-full bg-[var(--warning-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--warning)]">Não vota</span>}
                  {e.ativa && !e.pode_ser_candidata && <span className="rounded-full bg-[var(--warning-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--warning)]">Não se candidata</span>}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Responsável: {e.responsavel || '—'} · Login: {login ? `${login.nome} (${login.email})` : e.perfil_id ? 'ligado' : <span className="text-[var(--warning)]">sem login</span>}
                </div>
              </div>
              <button type="button" onClick={() => onEditar(e)} className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full bg-[var(--surface-2)] px-4 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer sm:self-center">
                <Pencil size={14} /> Editar
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const EditarEntidade: React.FC<{
  valor: Partial<Entidade>;
  pessoasLogin: Array<{ id: string; nome: string; email: string }>;
  onFechar: () => void;
  onSalvar: (e: Omit<Entidade, 'id'> & { id?: string }) => Promise<void>;
  onExcluir?: () => Promise<void>;
}> = ({ valor, pessoasLogin, onFechar, onSalvar, onExcluir }) => {
  const [nome, setNome] = useState(valor.nome ?? '');
  const [responsavel, setResponsavel] = useState(valor.responsavel ?? '');
  const [perfil, setPerfil] = useState(valor.perfil_id ?? '');
  const [ativa, setAtiva] = useState(valor.ativa ?? true);
  const [podeVotar, setPodeVotar] = useState(valor.pode_votar ?? true);
  const [podeCandidatar, setPodeCandidatar] = useState(valor.pode_ser_candidata ?? true);
  const [erro, setErro] = useState<string | null>(null);
  const campo = 'h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]';
  const tentar = async (f: () => Promise<void>) => {
    setErro(null);
    try {
      await f();
    } catch (e) {
      setErro(mensagem(e));
    }
  };
  return (
    <Janela titulo={valor.id ? 'Editar entidade' : 'Nova entidade'} onFechar={onFechar}>
      <form
        className="space-y-4"
        onSubmit={ev => {
          ev.preventDefault();
          void tentar(() => onSalvar({ id: valor.id, nome: nome.trim(), responsavel: responsavel.trim(), perfil_id: perfil || null, ativa, pode_votar: podeVotar, pode_ser_candidata: podeCandidatar }));
        }}
      >
        <div>
          <label htmlFor="en-nome" className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Nome</label>
          <input id="en-nome" value={nome} onChange={e => setNome(e.target.value)} className={campo} />
        </div>
        <div>
          <label htmlFor="en-resp" className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Responsável</label>
          <input id="en-resp" value={responsavel} onChange={e => setResponsavel(e.target.value)} className={campo} />
        </div>
        <div>
          <label htmlFor="en-login" className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Login que vota por ela</label>
          <select id="en-login" value={perfil} onChange={e => setPerfil(e.target.value)} className={`${campo} cursor-pointer`}>
            <option value="">Sem login</option>
            {pessoasLogin.map(p => (
              <option key={p.id} value={p.id}>{p.nome} · {p.email}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            O login é criado na Administração, com o papel “Entidade votante” e o setor UTSC.
          </p>
        </div>
        <div className="space-y-2">
          {[
            ['Ativa', ativa, setAtiva],
            ['Pode votar', podeVotar, setPodeVotar],
            ['Pode ser candidata', podeCandidatar, setPodeCandidatar],
          ].map(([r, v, f]) => (
            <label key={r as string} className="flex cursor-pointer items-center justify-between rounded-[12px] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text)]">
              {r as string}
              <input type="checkbox" checked={v as boolean} onChange={e => (f as (b: boolean) => void)(e.target.checked)} className="h-4 w-4 accent-[#0E4D32]" />
            </label>
          ))}
        </div>
        {erro && (
          <p role="alert" className="flex items-start gap-2 rounded-[14px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
            <AlertCircle size={16} className="mt-px shrink-0" /> {erro}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          {onExcluir && (
            <button type="button" onClick={() => window.confirm('Apagar esta entidade?') && void tentar(onExcluir)} className="h-11 rounded-full border border-[var(--danger-border)] px-4 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)] cursor-pointer">
              Apagar
            </button>
          )}
          <button type="button" onClick={onFechar} className="h-11 flex-1 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="h-11 flex-[1.4] rounded-full bg-[#0E4D32] text-sm font-bold text-white cursor-pointer">
            Salvar
          </button>
        </div>
      </form>
    </Janela>
  );
};
