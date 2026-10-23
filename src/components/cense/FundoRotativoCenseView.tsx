import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Janela } from '../ui/Janela';
import { imprimir } from '../../lib/imprimir';
import { Usuario } from '../../types';
import { soundFX } from '../../services/soundFx';
import { eventBus } from '../../services/eventBus';
import { temPermissao } from '../../services/rbac';
import { chaveNfeValida, cnpjValido } from '../../data/supabase/cense';
import { ModuloCabecalho, AcaoModulo, NumeroModulo } from '../modulo/ModuloCabecalho';
import { CENSES_INICIAIS, NotaFiscalFundo, RubricaFundo, StatusFiscalCense, UnidadeCenseFundo } from './dadosCense';
import { Plus, Download, FileText, Search, X, Check, AlertCircle, AlertTriangle, Paperclip, Printer, Ban, Info } from 'lucide-react';

export type { StatusFiscalCense, RubricaFundo, NotaFiscalFundo, UnidadeCenseFundo } from './dadosCense';

interface FundoRotativoCenseViewProps {
  currentUser: Usuario;
  onVoltarHub: () => void;
}

const STORAGE = 'seju_censes_fundo_v3';

const STATUS_UNIDADE: Record<StatusFiscalCense, { texto: string; cls: string }> = {
  regular: { texto: 'Em dia', cls: 'bg-[var(--verde-soft)] text-[var(--verde)]' },
  em_analise: { texto: 'Notas para analisar', cls: 'bg-[var(--warning-soft)] text-[var(--warning)]' },
  alerta_glosa: { texto: 'Nota recusada', cls: 'bg-[var(--danger-soft)] text-[var(--danger)]' },
};
const STATUS_NOTA: Record<NotaFiscalFundo['status'], { texto: string; cls: string }> = {
  pendente: { texto: 'Aguardando análise', cls: 'bg-[var(--warning-soft)] text-[var(--warning)]' },
  aprovada: { texto: 'Aprovada', cls: 'bg-[var(--verde-soft)] text-[var(--verde)]' },
  glosada: { texto: 'Recusada', cls: 'bg-[var(--danger-soft)] text-[var(--danger)]' },
};
const REGIONAIS: Array<UnidadeCenseFundo['regional']> = ['Curitiba & RMC', 'Campos Gerais & Litoral', 'Norte & Noroeste', 'Oeste & Sudoeste'];
const RUBRICAS: RubricaFundo[] = [
  'Material de Consumo & Higiene (33.90.30)',
  'Insumos Pedagógicos & Oficinas (33.90.30)',
  'Suprimento Emergencial Saúde (33.90.30)',
  'Manutenção Predial (33.90.39)',
  'Reparos Elétricos & Hidráulicos (33.90.39)',
];

const ehConsumo = (r: RubricaFundo) => r.includes('33.90.30');
const nomeRubrica = (r: RubricaFundo) => r.replace(/\s*\(.*\)/, '').replace('&', 'e');
const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const gasto = (u: UnidadeCenseFundo) => u.notas.filter(n => n.status !== 'glosada').reduce((s, n) => s + n.valor, 0);
const statusPelasNotas = (notas: NotaFiscalFundo[]): StatusFiscalCense =>
  notas.some(n => n.status === 'glosada') ? 'alerta_glosa' : notas.some(n => n.status === 'pendente') ? 'em_analise' : 'regular';
const formatarCnpj = (v: string) =>
  v.replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');

export const FundoRotativoCenseView: React.FC<FundoRotativoCenseViewProps> = ({ currentUser, onVoltarHub }) => {
  const fiscaliza = temPermissao(currentUser, 'cense:fiscalizar');
  const lanca = temPermissao(currentUser, 'cense:lancar_nfe') || fiscaliza;
  const [unidades, setUnidades] = useState<UnidadeCenseFundo[]>(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(STORAGE) ?? 'null');
      if (Array.isArray(salvo) && salvo.length >= 19) return salvo;
    } catch {
      /* usa os dados de demonstração */
    }
    // A situação da unidade sempre segue as notas dela.
    return CENSES_INICIAIS.map(u => ({ ...u, statusFiscal: statusPelasNotas(u.notas) }));
  });
  const [selecionadaId, setSelecionadaId] = useState(CENSES_INICIAIS[0].id);
  const [busca, setBusca] = useState('');
  const [regional, setRegional] = useState<'todas' | UnidadeCenseFundo['regional']>('todas');
  const [soPendencias, setSoPendencias] = useState(false);
  const [lancando, setLancando] = useState(false);
  const [recusando, setRecusando] = useState<NotaFiscalFundo | null>(null);
  const [relatorio, setRelatorio] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const relatorioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(unidades));
    } catch {
      /* sem espaço: segue só em memória */
    }
  }, [unidades]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  const unidade = unidades.find(u => u.id === selecionadaId) ?? unidades[0];
  const totalCota = unidades.reduce((s, u) => s + u.cotaTrimestral, 0);
  const totalGasto = unidades.reduce((s, u) => s + gasto(u), 0);
  const comPendencia = unidades.filter(u => u.statusFiscal !== 'regular').length;
  const notasParaAnalisar = unidades.reduce((s, u) => s + u.notas.filter(n => n.status === 'pendente').length, 0);

  const termo = busca.trim().toLowerCase();
  const lista = useMemo(
    () =>
      unidades.filter(
        u =>
          (regional === 'todas' || u.regional === regional) &&
          (!soPendencias || u.statusFiscal !== 'regular') &&
          (!termo || [u.nome, u.cidade, u.diretorSuprido].some(x => x.toLowerCase().includes(termo))),
      ),
    [unidades, regional, soPendencias, termo],
  );

  const gastoUnidade = gasto(unidade);
  const saldoUnidade = Math.max(0, unidade.cotaTrimestral - gastoUnidade);
  const pctUnidade = unidade.cotaTrimestral ? Math.min(100, (gastoUnidade / unidade.cotaTrimestral) * 100) : 0;
  const consumo = unidade.notas.filter(n => n.status !== 'glosada' && ehConsumo(n.rubrica)).reduce((s, n) => s + n.valor, 0);
  const servicos = gastoUnidade - consumo;
  const pendentesUnidade = unidade.notas.filter(n => n.status === 'pendente').length;

  const mudarUnidade = (mudar: (u: UnidadeCenseFundo) => UnidadeCenseFundo) =>
    setUnidades(prev => prev.map(u => (u.id === unidade.id ? mudar(u) : u)));

  const analisar = (nota: NotaFiscalFundo, aprovar: boolean, motivo?: string) => {
    mudarUnidade(u => {
      const notas = u.notas.map(n =>
        n.id === nota.id ? { ...n, status: aprovar ? ('aprovada' as const) : ('glosada' as const), motivoGlosa: aprovar ? undefined : motivo } : n,
      );
      return { ...u, notas, statusFiscal: statusPelasNotas(notas) };
    });
    soundFX.playClick();
    setAviso(aprovar ? `Nota ${nota.numeroNf} aprovada.` : `Nota ${nota.numeroNf} recusada. O responsável foi avisado.`);
  };

  const fecharPrestacao = () => {
    mudarUnidade(u => ({ ...u, statusFiscal: statusPelasNotas(u.notas), ultimaPrestacao: new Date().toLocaleDateString('pt-BR'), diasRestantesPrestacao: 60 }));
    soundFX.playSuccess();
    setAviso(`Prestação de contas do ${unidade.nome} registrada. Próximo prazo em 60 dias.`);
  };

  const lancar = (nota: NotaFiscalFundo) => {
    mudarUnidade(u => {
      const notas = [nota, ...u.notas];
      return { ...u, notas, statusFiscal: statusPelasNotas(notas) };
    });
    eventBus.emit('cense.nfe_lancada', {
      chaveAcesso: nota.chaveAcesso ?? '',
      unidade: unidade.nome,
      valor: nota.valor,
      rubrica: nota.rubrica,
      gestor: unidade.diretorSuprido,
    });
    soundFX.playSuccess();
    setLancando(false);
    setAviso(`Nota ${nota.numeroNf} lançada no ${unidade.nome}. Agora aguarda análise.`);
  };

  const exportar = () => {
    const cab = ['Unidade', 'Cidade', 'Regional', 'Responsável', 'Cota', 'Gasto', 'Saldo', 'Situação', 'Nota', 'Emissão', 'Fornecedor', 'CNPJ', 'Natureza', 'Valor', 'Situação da nota'];
    const linhas: string[][] = [];
    unidades.forEach(u => {
      const g = gasto(u);
      const base = [u.nome, u.cidade, u.regional, u.diretorSuprido, u.cotaTrimestral.toFixed(2), g.toFixed(2), Math.max(0, u.cotaTrimestral - g).toFixed(2), STATUS_UNIDADE[u.statusFiscal].texto];
      if (!u.notas.length) linhas.push([...base, '', '', '', '', '', '', '']);
      u.notas.forEach(n => linhas.push([...base, n.numeroNf, n.dataEmissao, n.fornecedor, n.cnpj, n.rubrica, n.valor.toFixed(2), STATUS_NOTA[n.status].texto]));
    });
    const csv = '﻿' + [cab, ...linhas].map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `fundo-rotativo-cense-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setAviso('Planilha baixada.');
  };

  return (
    <div className="space-y-5 font-sans">
      <ModuloCabecalho
        cor="tinta"
        rotulo="DEASE · Fundo rotativo das unidades"
        titulo="CENSE"
        descricao="Acompanhe a verba de cada unidade, lance as notas fiscais de compra e prepare a prestação de contas."
        onVoltar={onVoltarHub}
        acoes={
          <>
            {lanca && (
              <AcaoModulo destaque icone={<Plus size={15} />} onClick={() => setLancando(true)}>
                Lançar nota
              </AcaoModulo>
            )}
            <AcaoModulo icone={<Download size={15} />} onClick={exportar}>
              Planilha
            </AcaoModulo>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <NumeroModulo rotulo="Verba do trimestre" valor={moeda(totalCota)} detalhe={`${unidades.length} unidades`} />
          <NumeroModulo rotulo="Gasto" valor={moeda(totalGasto)} detalhe={`${Math.round((totalGasto / (totalCota || 1)) * 100)}% da verba`} />
          <NumeroModulo rotulo="Notas para analisar" valor={notasParaAnalisar} detalhe={`${comPendencia} unidades com pendência`} />
        </div>
      </ModuloCabecalho>

      {aviso && (
        <div role="status" className="flex items-center gap-2 rounded-full bg-[#00385E] px-5 py-3 text-sm font-medium text-white">
          <Check size={16} className="shrink-0 text-[#C6E86B]" strokeWidth={3} /> {aviso}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        {/* Unidades */}
        <section className="lg:col-span-4 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <label className="relative block">
            <span className="sr-only">Buscar unidade</span>
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Unidade, cidade ou responsável"
              className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface-2)] pl-11 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none focus:border-[var(--brand)]"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(['todas', ...REGIONAIS] as const).map(r => (
              <button
                key={r}
                type="button"
                aria-pressed={regional === r}
                onClick={() => setRegional(r)}
                className={`h-8 rounded-full px-3 text-xs font-semibold cursor-pointer ${
                  regional === r ? 'bg-[#00385E] text-white' : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]'
                }`}
              >
                {r === 'todas' ? 'Todas' : r.replace(' & ', ' e ')}
              </button>
            ))}
          </div>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13px] text-[var(--text)]">
            <input type="checkbox" checked={soPendencias} onChange={e => setSoPendencias(e.target.checked)} className="h-4 w-4 accent-[#00385E]" />
            Só unidades com pendência
          </label>

          <ul className="mt-3 max-h-[640px] space-y-1.5 overflow-y-auto pr-1">
            {lista.length === 0 && <li className="px-2 py-6 text-center text-sm text-[var(--text-muted)]">Nenhuma unidade encontrada.</li>}
            {lista.map(u => {
              const g = gasto(u);
              const pct = u.cotaTrimestral ? Math.min(100, (g / u.cotaTrimestral) * 100) : 0;
              const ativo = u.id === unidade.id;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setSelecionadaId(u.id)}
                    className={`w-full rounded-[18px] p-3.5 text-left transition-colors cursor-pointer ${
                      ativo ? 'bg-[var(--brand-soft)] ring-2 ring-[var(--brand)]' : 'hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-[var(--text)]">{u.nome}</span>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${u.statusFiscal === 'regular' ? 'bg-[#00A859]' : u.statusFiscal === 'em_analise' ? 'bg-[#D98A00]' : 'bg-[#C8372D]'}`} aria-label={STATUS_UNIDADE[u.statusFiscal].texto} />
                    </div>
                    <div className="truncate text-xs text-[var(--text-muted)]">{u.cidade} · {u.diretorSuprido}</div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                      <div className="h-full rounded-full bg-[#0072BB]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] tabular-nums text-[var(--text-muted)]">
                      <span>Gasto {moeda(g)}</span>
                      <span>Saldo {moeda(Math.max(0, u.cotaTrimestral - g))}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Unidade selecionada */}
        <section className="lg:col-span-8 space-y-5">
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_UNIDADE[unidade.statusFiscal].cls}`}>{STATUS_UNIDADE[unidade.statusFiscal].texto}</span>
                <h3 className="font-display mt-2 text-3xl font-bold leading-tight text-[var(--text)]">{unidade.nome}</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {unidade.cidade} · {unidade.regional.replace(' & ', ' e ')} · Responsável: <strong className="text-[var(--text)]">{unidade.diretorSuprido}</strong>
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-subtle)]">{unidade.contaBancoBrasil} · {unidade.competencia}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button type="button" onClick={() => setRelatorio(true)} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--surface-2)] px-4 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer">
                  <FileText size={15} /> Relatório
                </button>
                {fiscaliza && (
                  <button
                    type="button"
                    disabled={pendentesUnidade > 0}
                    title={pendentesUnidade > 0 ? 'Analise as notas pendentes antes' : undefined}
                    onClick={fecharPrestacao}
                    className="h-10 rounded-full bg-[#00703C] px-4 text-[13px] font-semibold text-white hover:bg-[#005C31] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Registrar prestação de contas
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Dado rotulo="Verba" valor={moeda(unidade.cotaTrimestral)} />
              <Dado rotulo="Gasto" valor={moeda(gastoUnidade)} />
              <Dado rotulo="Saldo" valor={moeda(saldoUnidade)} destaque />
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--surface-3)]" role="img" aria-label={`${Math.round(pctUnidade)}% da verba gasta`}>
              <div className="h-full rounded-full bg-[#0072BB]" style={{ width: `${pctUnidade}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--text-muted)]">
              <span>Material de consumo (33.90.30): <strong className="tabular-nums text-[var(--text)]">{moeda(consumo)}</strong></span>
              <span>Serviços (33.90.39): <strong className="tabular-nums text-[var(--text)]">{moeda(servicos)}</strong></span>
              <span>Prazo da prestação: <strong className={`tabular-nums ${unidade.diasRestantesPrestacao <= 10 ? 'text-[var(--danger)]' : 'text-[var(--text)]'}`}>{unidade.diasRestantesPrestacao} dias</strong></span>
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-display text-xl font-bold text-[var(--text)]">Notas fiscais</h4>
              {lanca && (
                <button type="button" onClick={() => setLancando(true)} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#00385E] px-4 text-[13px] font-semibold text-white cursor-pointer">
                  <Plus size={15} /> Lançar nota
                </button>
              )}
            </div>
            {unidade.notas.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--text-muted)]">Nenhuma nota lançada neste trimestre.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {unidade.notas.map(n => (
                  <li key={n.id} className="rounded-[18px] border border-[var(--border)] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_NOTA[n.status].cls}`}>{STATUS_NOTA[n.status].texto}</span>
                          <span className="text-xs font-semibold tabular-nums text-[var(--text-muted)]">{n.numeroNf} · {n.dataEmissao}</span>
                        </div>
                        <div className="mt-1.5 text-[15px] font-semibold text-[var(--text)]">{n.fornecedor}</div>
                        <div className="text-xs tabular-nums text-[var(--text-muted)]">CNPJ {n.cnpj}</div>
                        <p className="mt-1.5 text-[13px] text-[var(--text)]">{n.descricao}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                          <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 font-semibold text-[var(--text)]">{nomeRubrica(n.rubrica)} · {ehConsumo(n.rubrica) ? '33.90.30' : '33.90.39'}</span>
                          {n.tresOrcamentos ? (
                            <span className="rounded-full bg-[var(--verde-soft)] px-2.5 py-0.5 font-semibold text-[var(--verde)]">3 orçamentos</span>
                          ) : (
                            <span className="rounded-full bg-[var(--warning-soft)] px-2.5 py-0.5 font-semibold text-[var(--warning)]">Sem 3 orçamentos</span>
                          )}
                          {n.comprovanteNome && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-[var(--text-muted)]">
                              <Paperclip size={11} /> {n.comprovanteNome}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-display shrink-0 text-xl font-bold tabular-nums text-[var(--text)]">{moeda(n.valor)}</div>
                    </div>
                    {n.status === 'glosada' && n.motivoGlosa && (
                      <p className="mt-3 rounded-[12px] bg-[var(--danger-soft)] px-3 py-2 text-[13px] text-[var(--danger)]">
                        <strong>Motivo da recusa:</strong> {n.motivoGlosa}
                      </p>
                    )}
                    {fiscaliza && n.status === 'pendente' && (
                      <div className="mt-3 flex justify-end gap-2">
                        <button type="button" onClick={() => setRecusando(n)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-4 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
                          <Ban size={14} /> Recusar
                        </button>
                        <button type="button" onClick={() => analisar(n, true)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#00703C] px-4 text-[13px] font-semibold text-white hover:bg-[#005C31] cursor-pointer">
                          <Check size={14} strokeWidth={3} /> Aprovar
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {lancando && <LancarNota unidade={unidade} saldo={saldoUnidade} onFechar={() => setLancando(false)} onLancar={lancar} />}

      {recusando && (
        <Janela titulo="Recusar nota" onFechar={() => setRecusando(null)}>
          <RecusarNota
            nota={recusando}
            onCancelar={() => setRecusando(null)}
            onConfirmar={motivo => {
              analisar(recusando, false, motivo);
              setRecusando(null);
            }}
          />
        </Janela>
      )}

      {relatorio && (
        <Janela titulo={`Relatório · ${unidade.nome}`} onFechar={() => setRelatorio(false)} largura="xl">
          <div ref={relatorioRef}>
          <h4 className="hidden font-display text-2xl font-bold print:block">Relatório · {unidade.nome}</h4>
          <p className="text-sm text-[var(--text-muted)]">
            {unidade.competencia} · Responsável {unidade.diretorSuprido} · {unidade.contaBancoBrasil}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Dado rotulo="Verba" valor={moeda(unidade.cotaTrimestral)} />
            <Dado rotulo="Gasto aprovado e pendente" valor={moeda(gastoUnidade)} />
            <Dado rotulo="Saldo" valor={moeda(saldoUnidade)} destaque />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="text-xs text-[var(--text-muted)]">
                <tr className="border-b border-[var(--border)]">
                  <th className="py-2 pr-3 font-semibold">Nota</th>
                  <th className="py-2 pr-3 font-semibold">Fornecedor</th>
                  <th className="py-2 pr-3 font-semibold">Natureza</th>
                  <th className="py-2 pr-3 font-semibold">Situação</th>
                  <th className="py-2 text-right font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
                {unidade.notas.map(n => (
                  <tr key={n.id}>
                    <td className="py-2 pr-3 tabular-nums whitespace-nowrap">{n.numeroNf}<div className="text-xs text-[var(--text-muted)]">{n.dataEmissao}</div></td>
                    <td className="py-2 pr-3">{n.fornecedor}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{ehConsumo(n.rubrica) ? '33.90.30' : '33.90.39'}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{STATUS_NOTA[n.status].texto}</td>
                    <td className="py-2 text-right tabular-nums whitespace-nowrap">{moeda(n.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => imprimir(relatorioRef.current, `Relatório ${unidade.nome}`)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#00385E] text-sm font-semibold text-white cursor-pointer">
              <Printer size={15} /> Imprimir
            </button>
            <button type="button" onClick={() => setRelatorio(false)} className="h-11 flex-1 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
              Fechar
            </button>
          </div>
        </Janela>
      )}
    </div>
  );
};

const Dado: React.FC<{ rotulo: string; valor: string; destaque?: boolean }> = ({ rotulo, valor, destaque }) => (
  <div className={`rounded-[18px] px-3.5 py-3 ${destaque ? 'bg-[#00385E] text-white' : 'bg-[var(--surface-2)] text-[var(--text)]'}`}>
    <div className={`text-[11px] ${destaque ? 'text-white/65' : 'text-[var(--text-muted)]'}`}>{rotulo}</div>
    <div className="font-display text-base font-bold tabular-nums sm:text-xl">{valor}</div>
  </div>
);


const RecusarNota: React.FC<{ nota: NotaFiscalFundo; onCancelar: () => void; onConfirmar: (motivo: string) => void }> = ({ nota, onCancelar, onConfirmar }) => {
  const [motivo, setMotivo] = useState('');
  return (
    <>
      <p className="text-sm text-[var(--text-muted)]">
        {nota.numeroNf} · {nota.fornecedor} · {moeda(nota.valor)}. O valor volta para o saldo da unidade e o responsável recebe o motivo.
      </p>
      <label htmlFor="motivo-glosa" className="mt-4 block text-[13px] font-semibold text-[var(--text)]">Motivo</label>
      <textarea
        id="motivo-glosa"
        rows={3}
        autoFocus
        value={motivo}
        onChange={e => setMotivo(e.target.value)}
        placeholder="Ex.: faltam os três orçamentos anexados ao processo."
        className="mt-1.5 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]"
      />
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onCancelar} className="h-11 flex-1 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
          Voltar
        </button>
        <button type="button" disabled={motivo.trim().length < 5} onClick={() => onConfirmar(motivo.trim())} className="h-11 flex-1 rounded-full bg-[#B42318] text-sm font-semibold text-white hover:bg-[#9B1C12] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
          Recusar nota
        </button>
      </div>
    </>
  );
};

/** Lê os campos que a própria chave de acesso da NF-e carrega (layout oficial de 44 dígitos). */
const lerChave = (chave: string) => {
  const d = chave.replace(/\D/g, '');
  return {
    aamm: d.slice(2, 6),
    cnpj: d.slice(6, 20),
    modelo: d.slice(20, 22),
    serie: String(Number(d.slice(22, 25))),
    numero: String(Number(d.slice(25, 34))).padStart(6, '0').replace(/(\d{3})(\d{3})$/, '$1.$2'),
  };
};

const LancarNota: React.FC<{
  unidade: UnidadeCenseFundo;
  saldo: number;
  onFechar: () => void;
  onLancar: (n: NotaFiscalFundo) => void;
}> = ({ unidade, saldo, onFechar, onLancar }) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const [chave, setChave] = useState('');
  const [numero, setNumero] = useState('');
  const [emissao, setEmissao] = useState(hoje);
  const [fornecedor, setFornecedor] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [rubrica, setRubrica] = useState<RubricaFundo>(RUBRICAS[0]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tresOrcamentos, setTresOrcamentos] = useState(false);
  const [arquivo, setArquivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const digitosChave = chave.replace(/\D/g, '');
  const chaveOk = digitosChave.length === 44 && chaveNfeValida(digitosChave);
  const lida = chaveOk ? lerChave(digitosChave) : null;
  const valorNum = Number(valor.replace(/\./g, '').replace(',', '.')) || 0;
  const campo = 'h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]';
  const rotulo = 'mb-1.5 block text-[13px] font-semibold text-[var(--text)]';

  const usarChave = () => {
    if (!lida) return;
    setCnpj(formatarCnpj(lida.cnpj));
    setNumero(lida.numero);
  };

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (digitosChave && !chaveOk) return setErro('A chave de acesso não confere. Confira os 44 números no topo da nota.');
    if (!numero.trim()) return setErro('Informe o número da nota.');
    if (emissao > hoje) return setErro('A data de emissão não pode ser futura.');
    if (fornecedor.trim().length < 2) return setErro('Informe o fornecedor.');
    if (!cnpjValido(cnpj)) return setErro('CNPJ inválido. Confira os números.');
    if (lida && lida.cnpj !== cnpj.replace(/\D/g, '')) return setErro('O CNPJ não é o mesmo que está na chave de acesso.');
    if (valorNum <= 0) return setErro('Informe o valor da nota.');
    onLancar({
      id: 'nf-' + Date.now(),
      numeroNf: numero.toUpperCase().startsWith('NF') ? numero : `NF-e ${numero}`,
      chaveAcesso: digitosChave || undefined,
      dataEmissao: emissao.split('-').reverse().join('/'),
      fornecedor: fornecedor.trim(),
      cnpj: formatarCnpj(cnpj),
      rubrica,
      descricao: descricao.trim() || nomeRubrica(rubrica),
      valor: Math.round(valorNum * 100) / 100,
      status: 'pendente',
      tresOrcamentos,
      comprovanteNome: arquivo || undefined,
    });
  };

  return (
    <Janela titulo={`Lançar nota · ${unidade.nome}`} onFechar={onFechar} largura="xl">
      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label htmlFor="nf-chave" className={rotulo}>
            Chave de acesso <span className="font-normal text-[var(--text-subtle)]">(44 números no topo da nota · opcional)</span>
          </label>
          <div className="flex gap-2">
            <input
              id="nf-chave"
              inputMode="numeric"
              value={chave}
              onChange={e => setChave(e.target.value.replace(/[^\d ]/g, '').slice(0, 54))}
              placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
              className={`${campo} tabular-nums ${digitosChave.length === 44 ? (chaveOk ? 'border-[var(--verde)]' : 'border-[var(--danger)]') : ''}`}
            />
            <button type="button" disabled={!lida} onClick={usarChave} className="h-11 shrink-0 rounded-full bg-[#00385E] px-4 text-[13px] font-semibold text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
              Preencher
            </button>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {digitosChave.length === 0
              ? 'Com a chave, o CNPJ e o número da nota são lidos direto dela.'
              : digitosChave.length < 44
                ? `${digitosChave.length} de 44 números.`
                : chaveOk
                  ? `Chave válida · nota ${lida?.numero}, série ${lida?.serie}, emitida em ${lida?.aamm.slice(2)}/20${lida?.aamm.slice(0, 2)}.`
                  : 'Chave inválida: o dígito final não confere.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="nf-num" className={rotulo}>Número da nota</label>
            <input id="nf-num" value={numero} onChange={e => setNumero(e.target.value.slice(0, 20))} placeholder="000.123" className={`${campo} tabular-nums`} />
          </div>
          <div>
            <label htmlFor="nf-data" className={rotulo}>Emissão</label>
            <input id="nf-data" type="date" max={hoje} value={emissao} onChange={e => setEmissao(e.target.value)} className={`${campo} tabular-nums`} />
          </div>
          <div>
            <label htmlFor="nf-valor" className={rotulo}>Valor (R$)</label>
            <input id="nf-valor" inputMode="decimal" value={valor} onChange={e => setValor(e.target.value.replace(/[^\d.,]/g, '').slice(0, 12))} placeholder="0,00" className={`${campo} tabular-nums`} />
          </div>
        </div>
        {valorNum > saldo && (
          <p className="flex items-start gap-2 text-[13px] text-[var(--warning)]">
            <AlertTriangle size={15} className="mt-px shrink-0" /> O valor passa do saldo da unidade ({moeda(saldo)}). A nota fica registrada, mas a fiscalização vai ver o aviso.
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="nf-forn" className={rotulo}>Fornecedor</label>
            <input id="nf-forn" value={fornecedor} onChange={e => setFornecedor(e.target.value)} placeholder="Razão social" className={campo} />
          </div>
          <div>
            <label htmlFor="nf-cnpj" className={rotulo}>CNPJ</label>
            <input
              id="nf-cnpj"
              inputMode="numeric"
              value={cnpj}
              onChange={e => setCnpj(formatarCnpj(e.target.value))}
              placeholder="00.000.000/0000-00"
              className={`${campo} tabular-nums ${cnpj.replace(/\D/g, '').length === 14 ? (cnpjValido(cnpj) ? 'border-[var(--verde)]' : 'border-[var(--danger)]') : ''}`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="nf-rub" className={rotulo}>O que foi comprado</label>
          <select id="nf-rub" value={rubrica} onChange={e => setRubrica(e.target.value as RubricaFundo)} className={`${campo} cursor-pointer`}>
            <optgroup label="Material de consumo (33.90.30)">
              {RUBRICAS.filter(ehConsumo).map(r => <option key={r} value={r}>{nomeRubrica(r)}</option>)}
            </optgroup>
            <optgroup label="Serviços de terceiros (33.90.39)">
              {RUBRICAS.filter(r => !ehConsumo(r)).map(r => <option key={r} value={r}>{nomeRubrica(r)}</option>)}
            </optgroup>
          </select>
        </div>
        <div>
          <label htmlFor="nf-desc" className={rotulo}>Descrição</label>
          <textarea id="nf-desc" rows={2} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex.: troca das lâmpadas do pátio" className={`${campo} h-auto py-3`} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
            <input type="checkbox" checked={tresOrcamentos} onChange={e => setTresOrcamentos(e.target.checked)} className="h-4 w-4 accent-[#00385E]" />
            Tenho os três orçamentos
          </label>
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--surface-2)] px-4 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--surface-3)]">
            <Paperclip size={15} /> {arquivo || 'Anexar a nota (PDF ou foto)'}
            <input type="file" accept="application/pdf,image/*,.xml" className="sr-only" onChange={e => setArquivo(e.target.files?.[0]?.name ?? '')} />
          </label>
        </div>
        {!tresOrcamentos && (
          <p className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
            <Info size={14} className="mt-px shrink-0" /> Sem os três orçamentos a nota pode ser recusada na análise.
          </p>
        )}

        {erro && (
          <p role="alert" className="flex items-start gap-2 rounded-[14px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
            <AlertCircle size={16} className="mt-px shrink-0" /> {erro}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onFechar} className="h-11 flex-1 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="h-11 flex-[1.4] rounded-full bg-[#00385E] text-sm font-bold text-white cursor-pointer">
            Lançar nota
          </button>
        </div>
      </form>
    </Janela>
  );
};
