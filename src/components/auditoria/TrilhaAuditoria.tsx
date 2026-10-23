import React, { useEffect, useMemo, useState } from 'react';
import { AuditoriaLog } from '../../types';
import { ModuloCabecalho, AcaoModulo, NumeroModulo, AbasModulo } from '../modulo/ModuloCabecalho';
import { Search, Copy, Check, Download, Link2, ShieldCheck } from 'lucide-react';

interface TrilhaAuditoriaProps {
  logs: AuditoriaLog[];
  onVoltar?: () => void;
}

type Categoria = 'todos' | 'frota' | 'chamados' | 'salas' | 'cense' | 'lgpd';

/** Tradução das ações gravadas para linguagem de gente. */
const ACOES: Array<{ teste: RegExp; texto: string; categoria: Exclude<Categoria, 'todos'> }> = [
  { teste: /^SOLICITACAO_CRIADA/, texto: 'Pediu um veículo', categoria: 'frota' },
  { teste: /^(SOLICITACAO_APROVADA|APROVACAO)/, texto: 'Autorizou um pedido de veículo', categoria: 'frota' },
  { teste: /REPROV/, texto: 'Recusou um pedido de veículo', categoria: 'frota' },
  { teste: /VISTORIA_CHECKIN|CHECKIN_VISTORIA/, texto: 'Registrou a saída de um veículo', categoria: 'frota' },
  { teste: /VISTORIA_CHECKOUT|CHECKOUT/, texto: 'Registrou a volta de um veículo', categoria: 'frota' },
  { teste: /^CHAMADO/, texto: 'Abriu um chamado', categoria: 'chamados' },
  { teste: /^RESERVA_SALA/, texto: 'Reservou uma sala', categoria: 'salas' },
  { teste: /^NFE_CENSE/, texto: 'Lançou uma nota no CENSE', categoria: 'cense' },
  { teste: /^LGPD_CPF_REVELADO/, texto: 'Viu um CPF completo', categoria: 'lgpd' },
];
const traduzir = (acao: string) => ACOES.find(a => a.teste.test(acao)) ?? { texto: acao.replace(/_/g, ' ').toLowerCase(), categoria: 'frota' as const };

const mascararCpf = (cpf: string) => {
  const d = cpf.replace(/\D/g, '');
  return d.length === 11 ? `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**` : '—';
};

async function sha256(texto: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encadeia os registros do mais antigo para o mais novo: cada elo é o SHA-256
 * do elo anterior + os dados do registro. Mudar qualquer registro antigo muda
 * todos os elos seguintes — é a mesma ideia da tabela de auditoria do banco,
 * que confere a corrente no servidor (verificar_auditoria).
 */
async function encadear(logs: AuditoriaLog[]): Promise<Record<string, string>> {
  const ordem = [...logs].sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id));
  const elos: Record<string, string> = {};
  let anterior = 'inicio';
  for (const l of ordem) {
    anterior = await sha256([anterior, l.id, l.time, l.user, l.cpf.replace(/\D/g, ''), l.action, l.details ?? ''].join('|'));
    elos[l.id] = anterior;
  }
  return elos;
}

export const TrilhaAuditoria: React.FC<TrilhaAuditoriaProps> = ({ logs, onVoltar }) => {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('todos');
  const [elos, setElos] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    encadear(logs).then(e => vivo && setElos(e));
    return () => {
      vivo = false;
    };
  }, [logs]);

  const termo = busca.trim().toLowerCase();
  const lista = useMemo(
    () =>
      [...logs]
        .sort((a, b) => b.time.localeCompare(a.time))
        .filter(l => {
          const t = traduzir(l.action);
          return (
            (categoria === 'todos' || t.categoria === categoria) &&
            (!termo || [l.user, t.texto, l.details ?? '', l.action].some(c => c.toLowerCase().includes(termo)))
          );
        }),
    [logs, categoria, termo],
  );

  const porDia = useMemo(() => {
    const grupos = new Map<string, AuditoriaLog[]>();
    lista.forEach(l => {
      const dia = l.time.slice(0, 10);
      grupos.set(dia, [...(grupos.get(dia) ?? []), l]);
    });
    return [...grupos.entries()];
  }, [lista]);

  const pessoas = new Set(logs.map(l => l.user)).size;
  const contar = (c: Categoria) => (c === 'todos' ? logs.length : logs.filter(l => traduzir(l.action).categoria === c).length);

  const copiar = async (id: string) => {
    try {
      await navigator.clipboard.writeText(elos[id] ?? '');
      setCopiado(id);
      setTimeout(() => setCopiado(c => (c === id ? null : c)), 1600);
    } catch {
      /* sem permissão de área de transferência */
    }
  };

  const exportar = () => {
    const cab = ['Quando', 'Quem', 'CPF', 'O que fez', 'Detalhes', 'Código da ação', 'Elo SHA-256'];
    const linhas = lista.map(l => [new Date(l.time).toLocaleString('pt-BR'), l.user, mascararCpf(l.cpf), traduzir(l.action).texto, l.details ?? '', l.action, elos[l.id] ?? '']);
    const csv = '﻿' + [cab, ...linhas].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-seju-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dataDia = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5 font-sans">
      <ModuloCabecalho
        cor="noite"
        rotulo="Segurança · Registro de ações"
        titulo="Auditoria"
        descricao="Tudo o que foi pedido, autorizado ou visto no Painel, com quem fez e quando. Os registros não podem ser apagados nem editados."
        onVoltar={onVoltar}
        acoes={
          <AcaoModulo icone={<Download size={15} />} onClick={exportar}>
            Planilha
          </AcaoModulo>
        }
      >
        <div className="flex flex-wrap gap-2">
          <NumeroModulo rotulo="Registros" valor={logs.length} />
          <NumeroModulo rotulo="Pessoas" valor={pessoas} />
          <NumeroModulo rotulo="CPFs revelados" valor={contar('lgpd')} detalhe="acessos a dado pessoal" />
        </div>
        <AbasModulo<Categoria>
          ativa={categoria}
          onChange={setCategoria}
          itens={[
            { id: 'todos', rotulo: 'Tudo', contagem: contar('todos') },
            { id: 'frota', rotulo: 'Frotas', contagem: contar('frota') },
            { id: 'chamados', rotulo: 'Chamados', contagem: contar('chamados') },
            { id: 'salas', rotulo: 'Salas', contagem: contar('salas') },
            { id: 'cense', rotulo: 'CENSE', contagem: contar('cense') },
            { id: 'lgpd', rotulo: 'Dados pessoais', contagem: contar('lgpd') },
          ]}
        />
      </ModuloCabecalho>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:w-[420px]">
          <span className="sr-only">Buscar no registro</span>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pessoa, ação ou protocolo"
            className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none focus:border-[var(--brand)]"
          />
        </label>
        <p className="flex items-start gap-2 text-xs text-[var(--text-muted)] lg:max-w-md">
          <Link2 size={15} className="mt-px shrink-0" />
          Cada registro guarda um código (SHA-256) ligado ao anterior. Se alguém mudar um registro antigo, os códigos seguintes deixam de bater.
        </p>
      </div>

      {porDia.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-14 text-center">
          <div className="font-display text-xl font-bold text-[var(--text)]">Nada encontrado.</div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Tente outra busca ou outra categoria.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {porDia.map(([dia, itens]) => (
            <section key={dia} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
              <h3 className="font-display text-lg font-bold first-letter:uppercase text-[var(--text)]">{dataDia(dia)}</h3>
              <ol className="mt-3 divide-y divide-[var(--border)]">
                {itens.map(l => {
                  const t = traduzir(l.action);
                  const elo = elos[l.id];
                  return (
                    <li key={l.id} className="grid grid-cols-1 gap-2 py-3.5 sm:grid-cols-[72px_1fr_auto] sm:items-center sm:gap-4">
                      <time dateTime={l.time} className="text-sm font-semibold tabular-nums text-[var(--text-muted)]">
                        {new Date(l.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </time>
                      <div className="min-w-0">
                        <div className="text-[15px] text-[var(--text)]">
                          <strong className="font-semibold">{l.user}</strong> <span className="text-[var(--text-muted)]">·</span> {t.texto}
                          {t.categoria === 'lgpd' && (
                            <span className="ml-2 rounded-full bg-[var(--warning-soft)] px-2 py-0.5 align-middle text-[11px] font-semibold text-[var(--warning)]">Dado pessoal</span>
                          )}
                        </div>
                        {l.details && <div className="mt-0.5 truncate text-[13px] text-[var(--text-muted)]">{l.details}</div>}
                        <div className="mt-0.5 text-xs tabular-nums text-[var(--text-subtle)]">CPF {mascararCpf(l.cpf)} · {l.action}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copiar(l.id)}
                        disabled={!elo}
                        title={elo}
                        className="inline-flex h-9 items-center gap-1.5 justify-self-start rounded-full bg-[var(--surface-2)] px-3.5 text-xs font-semibold tabular-nums text-[var(--text)] hover:bg-[var(--surface-3)] disabled:opacity-50 cursor-pointer sm:justify-self-end"
                      >
                        {copiado === l.id ? <Check size={13} strokeWidth={3} className="text-[var(--verde)]" /> : <Copy size={13} />}
                        {elo ? `${elo.slice(0, 6)}…${elo.slice(-4)}` : 'calculando'}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}

      <p className="flex items-center justify-center gap-2 text-xs text-[var(--text-subtle)]">
        <ShieldCheck size={14} /> No sistema com banco de dados, a corrente é conferida no servidor e ninguém consegue alterar ou apagar registros.
      </p>
    </div>
  );
};
