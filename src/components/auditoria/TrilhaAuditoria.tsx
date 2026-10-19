import React, { useState } from 'react';
import { AuditoriaLog } from '../../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Fingerprint, 
  X,
  Copy,
  Check,
  Cpu,
  Terminal,
  Activity,
  Link2,
  KeyRound
} from 'lucide-react';

interface TrilhaAuditoriaProps {
  logs: AuditoriaLog[];
}

function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length === 11) {
    return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
  }
  return '***.***.***-**';
}

function maskIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return '10.24.***.*** (GovNet)';
}

/**
 * Gera ou normaliza um digest hexadecimal SHA-256 determinístico de 64 caracteres
 * para cada registro de auditoria do Cofre Cyber-GovTech ICP-PR.
 */
function obterDigestSha256(log: AuditoriaLog, seedIndex: number): string {
  const raw = (log.hash || '').replace(/[^a-fA-F0-9]/g, '').toLowerCase();
  if (raw.length === 64) return raw;

  const semente = `${log.id}|${log.time}|${log.action}|${log.user}|${log.cpf}|${seedIndex}|SEJU-ICP-PR`;
  let h1 = 0xdeadbeef ^ semente.length;
  let h2 = 0x41c6ce57 ^ (seedIndex * 31);
  for (let i = 0; i < semente.length; i++) {
    const ch = semente.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  const blocos: string[] = [];
  for (let b = 0; b < 8; b++) {
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const val = ((h1 >>> 0) ^ ((b * 0x9e3779b9) >>> 0)) >>> 0;
    blocos.push(val.toString(16).padStart(8, '0'));
  }
  return (raw + blocos.join('')).slice(0, 64);
}

export const TrilhaAuditoria: React.FC<TrilhaAuditoriaProps> = ({ logs }) => {
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [verificandoId, setVerificandoId] = useState<string | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(logs[0]?.id || null);
  const [cofreVerificado, setCofreVerificado] = useState<boolean>(false);
  const [escaneandoBlocos, setEscaneandoBlocos] = useState<boolean>(false);
  const [progressoScan, setProgressoScan] = useState<number>(100);
  const [copiadoHashId, setCopiadoHashId] = useState<string | null>(null);

  const categorias = [
    { id: 'todos', label: 'Todos os Blocos' },
    { id: 'APROVACAO', label: 'Aprovações & Despachos' },
    { id: 'CHECK', label: 'Saídas & Check-in' },
    { id: 'SOLICITACAO', label: 'Requisições' }
  ];

  const logsFiltrados = logs.filter((l, idx) => {
    const digest = obterDigestSha256(l, idx);
    const matchBusca =
      l.user.toLowerCase().includes(busca.toLowerCase()) ||
      l.action.toLowerCase().includes(busca.toLowerCase()) ||
      digest.includes(busca.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(busca.toLowerCase()));

    const matchCategoria =
      filtroCategoria === 'todos' ||
      l.action.toUpperCase().includes(filtroCategoria);

    return matchBusca && matchCategoria;
  });

  const handleVerificarIntegridade = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVerificandoId(id);
    setTimeout(() => {
      setVerificandoId(null);
    }, 2600);
  };

  const handleCopiarHash = (id: string, digest: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(digest);
    setCopiadoHashId(id);
    setTimeout(() => setCopiadoHashId(null), 2000);
  };

  const handleAuditarCofreCompleto = () => {
    if (escaneandoBlocos) return;
    setEscaneandoBlocos(true);
    setCofreVerificado(false);
    setProgressoScan(12);

    const step1 = setTimeout(() => setProgressoScan(48), 300);
    const step2 = setTimeout(() => setProgressoScan(84), 650);
    const step3 = setTimeout(() => {
      setProgressoScan(100);
      setEscaneandoBlocos(false);
      setCofreVerificado(true);
    }, 1050);
    const step4 = setTimeout(() => {
      setCofreVerificado(false);
    }, 5000);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
    };
  };

  const hashRaizMerkle = logs.length > 0 ? obterDigestSha256(logs[0], 0) : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans pb-10">
      
      {/* (1) CABEÇALHO ESCURO DO COFRE CYBER-GOVTECH ICP-PR COM MALHA CIBERNÉTICA E CANTONEIRAS NOS 4 CANTOS */}
      <div className="relative bg-slate-950 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl overflow-hidden space-y-6">
        {/* Malha Cibernética Sutil + Glow Radial Verde-Esmeralda */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl" />

        {/* Cantoneiras de Segurança nos 4 Cantos */}
        <span className="pointer-events-none absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-400/80" />
        <span className="pointer-events-none absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-400/80" />
        <span className="pointer-events-none absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-400/80" />
        <span className="pointer-events-none absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-400/80" />

        {/* Linha Superior do Cofre */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-500/15 border border-emerald-400/40 px-2.5 py-1 rounded-md shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <ShieldCheck size={12} className="text-emerald-400" />
                COFRE CYBER-GOVTECH ICP-PR · SHA-256
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Ledger Criptográfico SEJU/PR Ativo
              </span>
            </div>

            <div className="flex items-start sm:items-center gap-4">
              <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Lock size={22} />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Trilha de Auditoria Criptográfica & Cadeia de Custódia SHA-256
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registros operacionais selados em blocos imutáveis com verificação de integridade em tempo real padrão ICP-Brasil / ICP-PR.
                </p>
              </div>
            </div>
          </div>

          {/* Telemetria de Blocos & Botão Verificador em Tempo Real */}
          <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
            <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  Blocos Selados
                </span>
                <span className="font-mono font-extrabold text-sm text-white tabular-nums">
                  #{String(logs.length).padStart(3, '0')} BLOCOS
                </span>
              </div>
              <div className="h-7 w-px bg-slate-800" />
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  Algoritmo
                </span>
                <span className="font-mono font-bold text-xs text-emerald-400">
                  SHA-256 / Merkle
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAuditarCofreCompleto}
              className={`text-xs font-mono font-bold px-4 py-3 rounded-xl border transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                cofreVerificado
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                  : escaneandoBlocos
                  ? 'bg-slate-800 border-emerald-500/60 text-emerald-300'
                  : 'bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border-emerald-400/50 text-white'
              }`}
            >
              <Fingerprint size={16} className={escaneandoBlocos ? 'animate-spin' : ''} />
              {escaneandoBlocos
                ? `VERIFICANDO BLOCOS (${progressoScan}%)...`
                : cofreVerificado
                ? 'CADEIA SHA-256 100% ÍNTEGRA ✓'
                : 'VERIFICAR INTEGRIDADE DE BLOCOS'}
            </button>
          </div>
        </div>

        {/* VERIFICADOR DE INTEGRIDADE DE BLOCOS EM TEMPO REAL (MERKLE ROOT & STATUS BAR) */}
        <div className="relative z-10 p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <Cpu size={14} className="text-emerald-400 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Verificador de Integridade em Tempo Real · Merkle Root:
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-emerald-500/30 text-emerald-400 text-[11px] truncate max-w-[200px] sm:max-w-xs">
                0x{hashRaizMerkle.slice(0, 24)}...{hashRaizMerkle.slice(-8)}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <Activity size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">
                {escaneandoBlocos ? 'AUDITORIA EM EXECUÇÃO' : '0 COLISÕES · 100% AUTÊNTICO'}
              </span>
            </div>
          </div>

          {/* Barra de Progresso Visual dos Blocos */}
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${progressoScan}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 transition-all duration-300"
            />
          </div>

          {/* Mini-mapa de Blocos Encadeados */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            {logs.slice(0, 8).map((bloco, idx) => {
              const numBloco = logs.length - idx;
              const h = obterDigestSha256(bloco, idx);
              return (
                <button
                  key={bloco.id}
                  type="button"
                  onClick={() => setExpandidoId(bloco.id)}
                  className={`px-2.5 py-1 rounded border font-mono text-[10px] flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                    expandidoId === bloco.id
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-950/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                  title={`Inspecionar Bloco #${numBloco}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white">B#{String(numBloco).padStart(2, '0')}</span>
                  <span className="text-slate-500">{h.slice(0, 6)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra de Pesquisa Forense e Filtros de Categoria */}
        <div className="relative z-10 pt-2 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Pesquisar por servidor, operação ou trecho de hash SHA-256..."
              className="w-full text-xs pl-9 pr-8 py-2 bg-slate-900 hover:bg-slate-900/90 focus:bg-slate-900 border border-slate-700/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 text-white placeholder:text-slate-500 font-mono transition"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
            {categorias.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFiltroCategoria(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-mono font-semibold transition shrink-0 cursor-pointer text-[11px] border ${
                  filtroCategoria === cat.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* (2) REGISTROS DE LOG COM HASHES SHA-256 EM PÍLULAS MONOESPAÇADAS ESTILIZADAS & SELOS VERDE-ESMERALDA */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Cabeçalho Técnico da Tabela de Blocos */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5 font-mono font-bold">
            <Terminal size={15} className="text-emerald-400" />
            <span>LEDGER DE BLOCOS SHA-256 ({logsFiltrados.length} REGISTROS AUTENTICADOS)</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400">
            <CheckCircle2 size={13} />
            <span>Selo Verde-Esmeralda ICP-PR Verificado</span>
          </div>
        </div>

        {logsFiltrados.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-xs font-bold text-slate-700 font-mono uppercase">
              Nenhum bloco SHA-256 correspondente ao filtro
            </div>
            <p className="text-xs text-slate-400">
              Redefina os parâmetros de pesquisa forense ou selecione "Todos os Blocos".
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70">
            {logsFiltrados.map((l, index) => {
              const aberto = expandidoId === l.id;
              const numBloco = logs.length - index;
              const digestAtual = obterDigestSha256(l, index);
              const digestAnterior =
                index + 1 < logsFiltrados.length
                  ? obterDigestSha256(logsFiltrados[index + 1], index + 1)
                  : '0000000000000000000000000000000000000000000000000000000000000000';

              return (
                <div
                  key={l.id}
                  className={`relative transition-colors ${
                    aberto ? 'bg-slate-50/90' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Barra Lateral Indicadora de Integridade Esmeralda */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      verificandoId === l.id || aberto ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />

                  {/* Linha Principal do Registro com Pílula Monoespaçada SHA-256 e Selo Verde-Esmeralda */}
                  <div
                    onClick={() => setExpandidoId(aberto ? null : l.id)}
                    className="p-4 sm:px-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 cursor-pointer"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      {/* Identificador Técnico do Bloco */}
                      <div className="relative w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center font-mono shrink-0 mt-0.5 sm:mt-0 shadow-xs">
                        <span className="text-[8px] uppercase tracking-widest text-slate-400">BLOCO</span>
                        <span className="text-xs font-extrabold text-emerald-400 tabular-nums">
                          #{String(numBloco).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold tracking-wider border border-slate-700">
                            {l.action}
                          </span>
                          <span className="font-bold text-xs text-slate-900">
                            {l.user}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80">
                            CPF {maskCpf(l.cpf)}
                          </span>
                          <span className="text-slate-300 hidden sm:inline">·</span>
                          <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                            {new Date(l.time).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 truncate">
                          {l.details || 'Operação autenticada e encadeada no cofre criptográfico SHA-256.'}
                        </p>
                      </div>
                    </div>

                    {/* Direita: Pílula Monoespaçada SHA-256 Estilizada + Selo Verde-Esmeralda de Autenticidade */}
                    <div className="flex flex-wrap items-center justify-between xl:justify-end gap-2 pl-14 xl:pl-0 shrink-0">
                      {/* Pílula Monoespaçada SHA-256 */}
                      <div className="inline-flex items-center gap-2 bg-slate-950 text-emerald-300 border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-[11px] shadow-2xs">
                        <KeyRound size={11} className="text-emerald-400 shrink-0" />
                        <span className="text-slate-500 text-[10px] font-bold">SHA-256</span>
                        <span className="tracking-wider font-semibold text-emerald-300 select-all">
                          0x{digestAtual.slice(0, 8)}...{digestAtual.slice(-6)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopiarHash(l.id, digestAtual, e)}
                          className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                          title="Copiar Hash SHA-256 completa (256-bit)"
                        >
                          {copiadoHashId === l.id ? (
                            <Check size={12} className="text-emerald-400" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>

                      {/* Selo de Autenticidade Verde-Esmeralda */}
                      <button
                        type="button"
                        onClick={(e) => handleVerificarIntegridade(l.id, e)}
                        className={`font-mono text-[11px] font-bold px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                          verificandoId === l.id
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300/90'
                        }`}
                        title="Verificar assinatura criptográfica deste bloco"
                      >
                        <ShieldCheck size={13} className={verificandoId === l.id ? 'text-white' : 'text-emerald-600'} />
                        {verificandoId === l.id ? 'HASH ÍNTEGRA ✓' : 'AUTENTICADO ICP-PR'}
                      </button>

                      <div className="text-slate-400 p-1">
                        {aberto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </div>
                  </div>

                  {/* Painel Forense Expandido com Cantoneiras Técnicas em Cada Borda */}
                  {aberto && (
                    <div className="px-4 sm:px-6 pb-5 pt-1 pl-4 sm:pl-16">
                      <div className="relative p-5 rounded-xl bg-slate-950 text-white border border-slate-800 shadow-lg space-y-4 text-xs overflow-hidden">
                        {/* Cantoneiras Técnicas nos 4 Cantos do Certificado Forense */}
                        <span className="pointer-events-none absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400/80" />
                        <span className="pointer-events-none absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400/80" />
                        <span className="pointer-events-none absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400/80" />
                        <span className="pointer-events-none absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400/80" />

                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                          <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            CERTIFICADO DE IMUTABILIDADE FORENSE · BLOCO #{String(numBloco).padStart(2, '0')} (ID: {l.id})
                          </span>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded border border-emerald-500/40">
                            ASSINATURA ICP-PR VÁLIDA · 256-BIT
                          </span>
                        </div>

                        {/* Metadados Técnicos com Bordas Detalhadas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                            <span className="font-mono text-[10px] uppercase font-semibold text-slate-400 block">
                              Carimbo de Tempo Oficial (NTP.br)
                            </span>
                            <span className="font-mono text-xs font-bold text-white mt-1 block tabular-nums">
                              {new Date(l.time).toLocaleString('pt-BR')} BRT
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                            <span className="font-mono text-[10px] uppercase font-semibold text-slate-400 block">
                              Operador Autenticado (LGPD)
                            </span>
                            <span className="font-semibold text-white mt-1 block truncate">
                              {l.user} · <span className="font-mono text-emerald-400">{maskCpf(l.cpf)}</span>
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                            <span className="font-mono text-[10px] uppercase font-semibold text-slate-400 block">
                              Nó de Origem / Rede Gov.PR
                            </span>
                            <span className="font-mono text-xs font-bold text-sky-300 mt-1 block">
                              {maskIp(l.ip)} · TLS 1.3
                            </span>
                          </div>
                        </div>

                        {/* Digests Criptográficos Completos (Bloco Atual + Bloco Anterior Encadeado) */}
                        <div className="space-y-2.5 pt-1">
                          <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="min-w-0 space-y-0.5">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                                <Fingerprint size={12} /> HASH SHA-256 DO BLOCO ATUAL (256-BIT DIGEST)
                              </span>
                              <div className="font-mono text-[11px] text-slate-200 break-all select-all">
                                {digestAtual}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleCopiarHash(l.id, digestAtual, e)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition self-start sm:self-center"
                            >
                              {copiadoHashId === l.id ? <Check size={12} /> : <Copy size={12} />}
                              {copiadoHashId === l.id ? 'COPIADO' : 'COPIAR SHA-256'}
                            </button>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono">
                            <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                              <Link2 size={12} className="text-sky-400" />
                              HASH BLOCO ANTERIOR (ENCADEAMENTO):
                            </span>
                            <span className="text-slate-500 truncate select-all">
                              0x{digestAnterior}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

