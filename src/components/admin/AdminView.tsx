import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { agruparSetores, GRUPOS_SETOR } from '../../data/setoresSeju';
import { useSessao } from '../../auth/contexto';
import { ModuloCabecalho, AcaoModulo, NumeroModulo, AbasModulo } from '../modulo/ModuloCabecalho';
import { Janela } from '../ui/Janela';
import { apiAdminDemo, apiAdminSupabase, modulosDaPessoa, type DadosAdmin, type PessoaAdm, type SetorAdm } from '../../data/admin/api';
import { restaurarAcessoPadrao } from '../../services/acessoDemo';
import { Search, UserPlus, Check, AlertCircle, Users, LayoutGrid, KeyRound, Building, Lock, RotateCcw, Plus } from 'lucide-react';

interface AdminViewProps {
  onVoltar?: () => void;
  /** id da pessoa logada (não pode tirar o próprio acesso de admin). */
  usuarioId: string;
  /** Subaba vinda do endereço (#/modulo/subaba). */
  aba?: string;
  onAba?: (aba: string) => void;
}

type Aba = 'pessoas' | 'modulos' | 'papeis' | 'setores';
const ABAS: Aba[] = ['pessoas', 'modulos', 'papeis', 'setores'];

const ROTULO_MODULO: Record<string, string> = {
  frota: 'Frotas', chamados: 'Chamados', salas: 'Salas', diarias: 'Diárias', cense: 'CENSE', ramais: 'Ramais', votacao: 'Votação', auditoria: 'Auditoria', admin: 'Administração',
};
const mensagem = (e: unknown) => (e instanceof Error ? e.message : 'Não foi possível salvar. Tente de novo.');

export const AdminView: React.FC<AdminViewProps> = ({ onVoltar, usuarioId, aba: abaRota, onAba }) => {
  const { estado } = useSessao();
  const real = estado.fase === 'autenticado';
  const api = real ? apiAdminSupabase : apiAdminDemo;
  const [abaLocal, setAbaLocal] = useState<Aba>('pessoas');
  const aba: Aba = ABAS.includes(abaRota as Aba) ? (abaRota as Aba) : onAba ? 'pessoas' : abaLocal;
  const setAba = (a: Aba) => (onAba ? onAba(a) : setAbaLocal(a));
  const [dados, setDados] = useState<DadosAdmin | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [convidando, setConvidando] = useState(false);
  const [senhaGerada, setSenhaGerada] = useState<{ nome: string; login: string; senha: string } | null>(null);

  const carregar = useCallback(async () => {
    try {
      setDados(await api.carregar());
    } catch (e) {
      setErro(mensagem(e));
    }
  }, [api]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  /** Salva, recarrega e avisa. Erros aparecem no topo. */
  const salvar = async (f: () => Promise<void>, ok: string) => {
    setErro(null);
    try {
      await f();
      await carregar();
      setAviso(ok);
    } catch (e) {
      setErro(mensagem(e));
    }
  };

  const restritos = dados?.modulos.filter(m => m.setores.length).length ?? 0;

  return (
    <div className="space-y-5 font-sans">
      <ModuloCabecalho
        cor="noite"
        rotulo="Administração · Acessos"
        titulo="Admin"
        descricao="Escolha o setor e o papel de cada pessoa, quais setores veem cada aba e o que cada papel pode fazer. Vale na hora para todo mundo."
        onVoltar={onVoltar}
        acoes={
          api.podeConvidar ? (
            <AcaoModulo destaque icone={<UserPlus size={15} />} onClick={() => setConvidando(true)}>
              Convidar pessoa
            </AcaoModulo>
          ) : (
            <AcaoModulo
              icone={<RotateCcw size={15} />}
              onClick={() => {
                if (window.confirm('Voltar todos os acessos da demonstração ao padrão?')) {
                  restaurarAcessoPadrao();
                  void carregar();
                  setAviso('Acessos voltaram ao padrão.');
                }
              }}
            >
              Voltar ao padrão
            </AcaoModulo>
          )
        }
      >
        <div className="flex flex-wrap gap-2">
          <NumeroModulo rotulo="Pessoas" valor={dados?.pessoas.length ?? '—'} detalhe={`${dados?.pessoas.filter(p => p.ativo).length ?? 0} ativas`} />
          <NumeroModulo rotulo="Setores" valor={dados?.setores.length ?? '—'} />
          <NumeroModulo rotulo="Abas restritas" valor={restritos} detalhe="só alguns setores veem" />
        </div>
        <AbasModulo<Aba>
          ativa={aba}
          onChange={setAba}
          itens={[
            { id: 'pessoas', rotulo: 'Pessoas', icone: <Users size={14} /> },
            { id: 'modulos', rotulo: 'Quem vê cada aba', icone: <LayoutGrid size={14} /> },
            { id: 'papeis', rotulo: 'Papéis e permissões', icone: <KeyRound size={14} /> },
            { id: 'setores', rotulo: 'Setores', icone: <Building size={14} /> },
          ]}
        />
      </ModuloCabecalho>

      {!real && (
        <p className="flex items-start gap-2 rounded-[18px] bg-[var(--brand-soft)] px-4 py-3 text-sm text-[var(--text)]">
          <AlertCircle size={16} className="mt-px shrink-0 text-[var(--brand)]" />
          Modo demonstração: as mudanças ficam salvas neste navegador. Troque de perfil no menu da conta para ver o efeito. Com o banco ligado, valem para todos.
        </p>
      )}
      {aviso && (
        <div role="status" className="flex items-center gap-2 rounded-full bg-[#0B1B2E] px-5 py-3 text-sm font-medium text-white">
          <Check size={16} className="shrink-0 text-[#C6E86B]" strokeWidth={3} /> {aviso}
        </div>
      )}
      {erro && (
        <p role="alert" className="flex items-start gap-2 rounded-[18px] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          <AlertCircle size={16} className="mt-px shrink-0" /> {erro}
        </p>
      )}

      {!dados ? (
        <div className="h-64 animate-pulse rounded-[28px] bg-[var(--surface-2)]" />
      ) : aba === 'pessoas' ? (
        <Pessoas
          dados={dados}
          usuarioId={usuarioId}
          onMudar={(id, m, ok) => salvar(() => api.atualizarPessoa(id, m), ok)}
          onSenhaProvisoria={
            real
              ? async p => {
                  setErro(null);
                  try {
                    const senha = await api.senhaProvisoria(p.email);
                    setSenhaGerada({ nome: p.nome, login: p.email.endsWith('@painel.seju') ? p.email.split('@')[0].toUpperCase() : p.email, senha });
                  } catch (e) {
                    setErro(e instanceof Error ? e.message : 'Não foi possível gerar a senha provisória.');
                  }
                }
              : undefined
          }
        />
      ) : aba === 'modulos' ? (
        <Modulos
          dados={dados}
          onSetores={(id, siglas) => salvar(() => api.definirSetoresDoModulo(id, siglas), `Acesso a ${ROTULO_MODULO[id] ?? id} atualizado.`)}
          onAtivar={(id, ativo) => salvar(() => api.ativarModulo(id, ativo), ativo ? 'Aba ligada.' : 'Aba desligada para todos.')}
        />
      ) : aba === 'papeis' ? (
        <Papeis dados={dados} onDefinir={(p, perm, sim) => salvar(() => api.definirPermissao(p, perm, sim), 'Permissão atualizada.')} />
      ) : (
        <Setores dados={dados} onSalvar={s => salvar(() => api.salvarSetor(s), 'Setor salvo.')} />
      )}

      {senhaGerada && (
        <Janela titulo="Senha provisória" onFechar={() => setSenhaGerada(null)}>
          <p className="text-sm text-[var(--text-muted)]">Repasse para {senhaGerada.nome}. Ao entrar, o Painel pede uma senha nova.</p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-[18px] bg-[var(--surface-2)] p-4 text-sm">
            <dt className="text-[var(--text-muted)]">Login</dt>
            <dd className="font-semibold text-[var(--text)]">{senhaGerada.login}</dd>
            <dt className="text-[var(--text-muted)]">Senha</dt>
            <dd className="font-mono text-lg font-bold tracking-wider text-[var(--text)] select-all">{senhaGerada.senha}</dd>
          </dl>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(senhaGerada.senha)}
              className="h-10 rounded-full border border-[var(--border)] px-4 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
            >
              Copiar senha
            </button>
            <button type="button" onClick={() => setSenhaGerada(null)} className="h-10 rounded-full bg-[#00385E] px-5 text-[13px] font-semibold text-white cursor-pointer">
              Pronto
            </button>
          </div>
        </Janela>
      )}

      {convidando && (
        <Convidar
          dados={dados}
          onFechar={() => setConvidando(false)}
          onConvidar={async p => {
            await api.convidar(p);
            setConvidando(false);
            await carregar();
            setAviso(`Convite enviado para ${p.email}.`);
          }}
        />
      )}
    </div>
  );
};

// ------------------------------------------------------------------ pessoas
const Pessoas: React.FC<{
  dados: DadosAdmin;
  usuarioId: string;
  onMudar: (id: string, m: Partial<Pick<PessoaAdm, 'setorSigla' | 'papel' | 'ativo'>>, ok: string) => void;
  /** Só com o banco ligado. */
  onSenhaProvisoria?: (p: PessoaAdm) => void;
}> = ({ dados, usuarioId, onMudar, onSenhaProvisoria }) => {
  const [busca, setBusca] = useState('');
  const [setor, setSetor] = useState('todos');
  const t = busca.trim().toLowerCase();
  const lista = dados.pessoas.filter(
    p => (setor === 'todos' || p.setorSigla === setor) && (!t || `${p.nome} ${p.email} ${p.cargo}`.toLowerCase().includes(t)),
  );
  const sel = 'h-10 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Buscar pessoa</span>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Nome, e-mail ou cargo" className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface-2)] pl-11 pr-4 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]" />
        </label>
        <label className="sr-only" htmlFor="fl-setor">Filtrar por setor</label>
        <select id="fl-setor" value={setor} onChange={e => setSetor(e.target.value)} className={`${sel} h-11 sm:w-64`}>
          <option value="todos">Todos os setores</option>
          <OpcoesSetor setores={dados.setores} rotulo={s => `${s.sigla} · ${s.nome}`} />
        </select>
      </div>

      <ul className="mt-4 divide-y divide-[var(--border)]">
        {lista.map(p => {
          const eu = p.id === usuarioId;
          const veem = modulosDaPessoa(p, dados);
          return (
            <li key={p.id} className="grid grid-cols-1 gap-3 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold text-[var(--text)]">{p.nome}</span>
                  {eu && <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--brand)]">você</span>}
                  {!p.ativo && <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--danger)]">sem acesso</span>}
                </div>
                <div className="truncate text-xs text-[var(--text-muted)]">{p.email} · {p.cargo}</div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {veem.length === 0 ? (
                    <span className="text-xs text-[var(--text-subtle)]">Não vê nenhuma aba.</span>
                  ) : (
                    veem.map(m => (
                      <span key={m} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${m === 'cense' || m === 'votacao' ? 'bg-[#C6E86B] text-[#0B1B2E]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                        {ROTULO_MODULO[m] ?? m}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`setor-${p.id}`}>Setor de {p.nome}</label>
                <select
                  id={`setor-${p.id}`}
                  value={p.setorSigla ?? ''}
                  onChange={e => onMudar(p.id, { setorSigla: e.target.value || null }, `${p.nome} agora é do setor ${e.target.value || '—'}.`)}
                  className={`${sel} w-[140px]`}
                >
                  <option value="">Sem setor</option>
                  <OpcoesSetor setores={dados.setores} rotulo={s => s.sigla} />
                </select>
                <label className="sr-only" htmlFor={`papel-${p.id}`}>Papel de {p.nome}</label>
                <select
                  id={`papel-${p.id}`}
                  value={p.papel}
                  disabled={eu}
                  title={eu ? 'Você não pode mudar o próprio papel' : undefined}
                  onChange={e => onMudar(p.id, { papel: e.target.value }, `Papel de ${p.nome} atualizado.`)}
                  className={`${sel} w-[200px]`}
                >
                  {dados.papeis.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                </select>
                <button
                  type="button"
                  disabled={eu}
                  onClick={() => onMudar(p.id, { ativo: !p.ativo }, p.ativo ? `${p.nome} perdeu o acesso.` : `${p.nome} voltou a ter acesso.`)}
                  className={`h-10 rounded-full px-4 text-[13px] font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed ${
                    p.ativo ? 'border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]' : 'bg-[#00703C] text-white'
                  }`}
                >
                  {p.ativo ? 'Bloquear' : 'Liberar'}
                </button>
                {onSenhaProvisoria && !eu && (
                  <button
                    type="button"
                    onClick={() => onSenhaProvisoria(p)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[var(--border)] px-4 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
                  >
                    <KeyRound size={14} aria-hidden="true" /> Senha provisória
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {lista.length === 0 && <p className="py-8 text-center text-sm text-[var(--text-muted)]">Ninguém encontrado.</p>}
    </section>
  );
};

// ------------------------------------------------------------------ módulos
const Modulos: React.FC<{
  dados: DadosAdmin;
  onSetores: (id: string, siglas: string[]) => void;
  onAtivar: (id: string, ativo: boolean) => void;
}> = ({ dados, onSetores, onAtivar }) => (
  <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    {dados.modulos.map(m => {
      const restrito = m.setores.length > 0;
      const pessoasQueVeem = dados.pessoas.filter(p => modulosDaPessoa(p, dados).includes(m.id)).length;
      return (
        <li key={m.id} className={`rounded-[28px] border bg-[var(--surface)] p-5 sm:p-6 ${m.ativo ? 'border-[var(--border)]' : 'border-dashed border-[var(--border-strong)] opacity-80'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-[var(--text)]">{ROTULO_MODULO[m.id] ?? m.nome}</h3>
              <p className="text-xs text-[var(--text-muted)]">
                {m.ativo ? (restrito ? `Só ${m.setores.join(', ')}` : 'Todos os setores') : 'Desligada para todos'} · {pessoasQueVeem} pessoa{pessoasQueVeem === 1 ? '' : 's'} veem
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-[var(--text)]">
              <input type="checkbox" checked={m.ativo} onChange={e => onAtivar(m.id, e.target.checked)} className="h-4 w-4 accent-[#00703C]" />
              Ligada
            </label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={!restrito}
              onClick={() => onSetores(m.id, [])}
              className={`h-10 rounded-full text-[13px] font-semibold cursor-pointer ${!restrito ? 'bg-[#00385E] text-white' : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]'}`}
            >
              Todos os setores
            </button>
            <button
              type="button"
              aria-pressed={restrito}
              onClick={() => !restrito && onSetores(m.id, dados.setores.slice(0, 1).map(s => s.sigla))}
              className={`h-10 rounded-full text-[13px] font-semibold cursor-pointer ${restrito ? 'bg-[#00385E] text-white' : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]'}`}
            >
              <Lock size={13} className="mr-1 inline" /> Só alguns setores
            </button>
          </div>
          {restrito && (
            <div className="mt-3 space-y-2.5" role="group" aria-label={`Setores que veem ${m.nome}`}>
              {agruparSetores(dados.setores).map(g => (
              <div key={g.grupo}>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">{g.grupo}</div>
              <div className="flex flex-wrap gap-1.5">
              {g.itens.map(s => {
                const marcado = m.setores.includes(s.sigla);
                return (
                  <button
                    key={s.sigla}
                    type="button"
                    aria-pressed={marcado}
                    title={s.nome}
                    onClick={() => {
                      const nova = marcado ? m.setores.filter(x => x !== s.sigla) : [...m.setores, s.sigla];
                      onSetores(m.id, nova.length ? nova : m.setores);
                    }}
                    className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold cursor-pointer ${
                      marcado ? 'bg-[#C6E86B] text-[#0B1B2E]' : 'border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {marcado && <Check size={12} strokeWidth={3} />} {s.sigla}
                  </button>
                );
              })}
              </div>
              </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-[var(--text-subtle)]">A Administração sempre vê todas as abas. Para alguém ver, o papel dele também precisa ter permissão nesta aba.</p>
        </li>
      );
    })}
  </ul>
);

// ------------------------------------------------------------------- papéis
const Papeis: React.FC<{ dados: DadosAdmin; onDefinir: (papel: string, perm: string, sim: boolean) => void }> = ({ dados, onDefinir }) => {
  const papeis = dados.papeis.filter(p => p.id !== 'admin');
  const grupos = useMemo(() => {
    const g = new Map<string, typeof dados.permissoes>();
    dados.permissoes.filter(p => p.modulo !== 'admin').forEach(p => g.set(p.modulo, [...(g.get(p.modulo) ?? []), p]));
    return [...g.entries()];
  }, [dados.permissoes]);
  return (
    <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="sticky top-0 bg-[var(--surface)]">
            <tr className="border-b border-[var(--border)]">
              <th className="px-5 py-3 text-xs font-semibold text-[var(--text-muted)]">Permissão</th>
              {papeis.map(p => (
                <th key={p.id} className="px-2 py-3 text-center text-xs font-semibold text-[var(--text)]" title={p.descricao}>
                  {p.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grupos.map(([modulo, perms]) => (
              <React.Fragment key={modulo}>
                <tr className="bg-[var(--surface-2)]">
                  <th colSpan={papeis.length + 1} className="px-5 py-2 font-display text-sm font-bold text-[var(--text)]">{ROTULO_MODULO[modulo] ?? modulo}</th>
                </tr>
                {perms.map(perm => (
                  <tr key={perm.id} className="border-b border-[var(--border)]">
                    <td className="px-5 py-2.5 text-[var(--text)]">{perm.descricao}</td>
                    {papeis.map(p => {
                      const tem = (dados.matriz[p.id] ?? []).includes(perm.id);
                      return (
                        <td key={p.id} className="px-2 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={tem}
                            aria-label={`${p.nome}: ${perm.descricao}`}
                            onChange={e => onDefinir(p.id, perm.id, e.target.checked)}
                            className="h-4 w-4 cursor-pointer accent-[#00385E]"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-5 py-3 text-xs text-[var(--text-subtle)]">A Administração tem todas as permissões e não aparece na tabela.</p>
    </section>
  );
};

/** Opções de setor agrupadas pelos blocos do organograma. */
const OpcoesSetor: React.FC<{ setores: SetorAdm[]; rotulo: (s: SetorAdm) => string }> = ({ setores, rotulo }) => (
  <>
    {agruparSetores(setores).map(g => (
      <optgroup key={g.grupo} label={g.grupo}>
        {g.itens.map(s => <option key={s.sigla} value={s.sigla}>{rotulo(s)}</option>)}
      </optgroup>
    ))}
  </>
);

// ------------------------------------------------------------------ setores
const Setores: React.FC<{ dados: DadosAdmin; onSalvar: (s: SetorAdm) => void }> = ({ dados, onSalvar }) => {
  const [sigla, setSigla] = useState('');
  const [nome, setNome] = useState('');
  const [grupo, setGrupo] = useState<string>(GRUPOS_SETOR[0]);
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={e => {
          e.preventDefault();
          onSalvar({ sigla, nome, grupo });
          setSigla('');
          setNome('');
        }}
      >
        <label className="sr-only" htmlFor="st-sigla">Sigla</label>
        <input id="st-sigla" value={sigla} onChange={e => setSigla(e.target.value.toUpperCase().slice(0, 12))} placeholder="Sigla" className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 text-sm uppercase text-[var(--text)] outline-none focus:border-[var(--brand)] sm:w-36" />
        <label className="sr-only" htmlFor="st-nome">Nome</label>
        <input id="st-nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do setor" className="h-11 flex-1 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]" />
        <label className="sr-only" htmlFor="st-grupo">Bloco do organograma</label>
        <select id="st-grupo" value={grupo} onChange={e => setGrupo(e.target.value)} className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)] cursor-pointer sm:w-56">
          {GRUPOS_SETOR.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#00385E] px-5 text-sm font-semibold text-white cursor-pointer">
          <Plus size={16} /> Adicionar ou renomear
        </button>
      </form>
      {agruparSetores(dados.setores).map(g => (
      <section key={g.grupo} className="mt-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{g.grupo}</h3>
      <ul className="mt-1 divide-y divide-[var(--border)]">
        {g.itens.map(s => {
          const n = dados.pessoas.filter(p => p.setorSigla === s.sigla).length;
          const abas = dados.modulos.filter(m => m.setores.includes(s.sigla)).map(m => ROTULO_MODULO[m.id] ?? m.nome);
          return (
            <li key={s.sigla} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <span className="font-display mr-2 font-bold text-[var(--text)]">{s.sigla}</span>
                <span className="text-sm text-[var(--text)]">{s.nome}</span>
                {abas.length > 0 && <span className="ml-2 text-xs text-[var(--text-muted)]">· vê {abas.join(', ')}</span>}
              </div>
              <span className="text-xs tabular-nums text-[var(--text-muted)]">{n} pessoa{n === 1 ? '' : 's'}</span>
            </li>
          );
        })}
      </ul>
      </section>
      ))}
    </section>
  );
};

// ----------------------------------------------------------------- convidar
const Convidar: React.FC<{
  dados: DadosAdmin | null;
  onFechar: () => void;
  onConvidar: (p: { email: string; nome: string; setorSigla: string; papel: string; cargo?: string }) => Promise<void>;
}> = ({ dados, onFechar, onConvidar }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [setor, setSetor] = useState(dados?.setores[0]?.sigla ?? '');
  const [papel, setPapel] = useState('servidor');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const campo = 'h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]';
  return (
    <Janela titulo="Convidar pessoa" onFechar={onFechar}>
      <form
        className="space-y-3"
        onSubmit={async e => {
          e.preventDefault();
          setErro(null);
          if (nome.trim().length < 3) return setErro('Informe o nome.');
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErro('E-mail inválido.');
          setEnviando(true);
          try {
            await onConvidar({ nome: nome.trim(), email: email.trim().toLowerCase(), setorSigla: setor, papel, cargo: cargo.trim() || undefined });
          } catch (er) {
            setErro(mensagem(er));
          } finally {
            setEnviando(false);
          }
        }}
      >
        <p className="text-sm text-[var(--text-muted)]">A pessoa recebe um e-mail para criar a própria senha. Para uma entidade da votação, use o papel “Entidade votante” e o setor UTSC.</p>
        <input aria-label="Nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" className={campo} />
        <input aria-label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e-mail" className={campo} />
        <input aria-label="Cargo" value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Cargo (opcional)" className={campo} />
        <div className="grid grid-cols-2 gap-2">
          <select aria-label="Setor" value={setor} onChange={e => setSetor(e.target.value)} className={`${campo} cursor-pointer`}>
            <OpcoesSetor setores={dados?.setores ?? []} rotulo={s => `${s.sigla} · ${s.nome}`} />
          </select>
          <select aria-label="Papel" value={papel} onChange={e => setPapel(e.target.value)} className={`${campo} cursor-pointer`}>
            {dados?.papeis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        {erro && (
          <p role="alert" className="flex items-start gap-2 rounded-[14px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
            <AlertCircle size={16} className="mt-px shrink-0" /> {erro}
          </p>
        )}
        <button type="submit" disabled={enviando} className="h-11 w-full rounded-full bg-[#00385E] text-sm font-bold text-white disabled:opacity-50 cursor-pointer">
          {enviando ? 'Enviando…' : 'Enviar convite'}
        </button>
      </form>
    </Janela>
  );
};
