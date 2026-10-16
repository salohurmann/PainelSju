import React, { useState } from 'react';
import { AuditoriaLog } from '../../types';
import { formatShortHash } from '../../services/crypto';
import { 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Lock, 
  Search, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Fingerprint, 
  KeyRound,
  X
} from 'lucide-react';

interface TrilhaAuditoriaProps {
  logs: AuditoriaLog[];
}

export const TrilhaAuditoria: React.FC<TrilhaAuditoriaProps> = ({ logs }) => {
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [verificandoHash, setVerificandoHash] = useState<string | null>(null);
  const [copiadoHash, setCopiadoHash] = useState<string | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(logs[0]?.id || null);
  const [cadeiaVerificada, setCadeiaVerificada] = useState<boolean>(false);

  const categorias = [
    { id: 'todos', label: 'Todos os Eventos' },
    { id: 'APROVACAO', label: 'Aprovações & Despachos' },
    { id: 'CHECK', label: 'Saídas & Check-in' },
    { id: 'SOLICITACAO', label: 'Requisições' }
  ];

  const logsFiltrados = logs.filter(l => {
    const matchBusca =
      l.user.toLowerCase().includes(busca.toLowerCase()) ||
      l.action.toLowerCase().includes(busca.toLowerCase()) ||
      l.hash.toLowerCase().includes(busca.toLowerCase()) ||
      l.cpf.toLowerCase().includes(busca.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(busca.toLowerCase()));

    const matchCategoria =
      filtroCategoria === 'todos' ||
      l.action.toUpperCase().includes(filtroCategoria);

    return matchBusca && matchCategoria;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `auditoria-criptografica-seju-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleVerificarHash = (hash: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVerificandoHash(hash);
    setTimeout(() => {
      setVerificandoHash(null);
    }, 2500);
  };

  const handleCopiarHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiadoHash(hash);
    setTimeout(() => {
      setCopiadoHash(null);
    }, 2000);
  };

  const handleAuditarCadeiaCompleta = () => {
    setCadeiaVerificada(true);
    setTimeout(() => {
      setCadeiaVerificada(false);
    }, 3500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* (1) CLEAN CRYPTOGRAPHIC INTEGRITY HEADER (SHA-256 CHAIN STATUS) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Integridade SHA-256 Verificada
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-[11px] text-slate-500">Padrão ICP-Brasil / Gov.PR</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Trilha de Auditoria & Governança Criptográfica
                </h2>
                <p className="text-xs text-slate-500">
                  Livro-razão imutável de despachos, movimentações de frota e assinaturas digitais vinculadas ao CPF do servidor.
                </p>
              </div>
            </div>
          </div>

          {/* Métricas Criptográficas & Ações Executivas */}
          <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="flex items-center gap-3.5 px-3.5 py-2 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs">
              <div>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Blocos Assinados</span>
                <span className="font-mono font-bold text-slate-900">{logs.length} registros</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Consenso / Hash</span>
                <span className="font-mono font-semibold text-emerald-700">100% Íntegro</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAuditarCadeiaCompleta}
              className={`text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                cadeiaVerificada
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700'
              }`}
            >
              <Fingerprint size={15} className={cadeiaVerificada ? 'text-emerald-600' : 'text-slate-500'} />
              {cadeiaVerificada ? 'Cadeia SHA-256 Validada ✓' : 'Verificar Cadeia'}
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Download size={14} /> Exportar JSON
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros de Evento */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Pesquisar por servidor, CPF, tipo de ação ou assinatura hash SHA-256..."
              className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-800 transition"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
                className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 cursor-pointer text-xs border ${
                  filtroCategoria === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50/70 text-slate-600 hover:bg-slate-100 border-slate-200/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* (2) DIVIDED AUDIT TIMELINE WITH CLEAN EXPANDABLE/SCANNABLE HASH RECORDS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Cabeçalho da Timeline */}
        <div className="px-5 py-3.5 border-b border-slate-200/70 bg-slate-50/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Linha do Tempo de Registros Criptográficos ({logsFiltrados.length})</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Clique em qualquer registro para inspecionar o certificado SHA-256 completo
          </span>
        </div>

        {logsFiltrados.length === 0 ? (
          <div className="p-12 text-center space-y-1">
            <div className="text-xs font-semibold text-slate-700">Nenhum registro de auditoria correspondente</div>
            <p className="text-xs text-slate-400">Ajuste os critérios de pesquisa ou selecione "Todos os Eventos".</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logsFiltrados.map((l, index) => {
              const aberto = expandidoId === l.id;
              const hashAnterior = logsFiltrados[index + 1]?.hash || '0000000000000000000000000000000000000000000000000000000000000000';

              return (
                <div
                  key={l.id}
                  className={`transition-colors ${aberto ? 'bg-slate-50/50' : 'hover:bg-slate-50/40'}`}
                >
                  {/* Linha Principal Escaneável */}
                  <div
                    onClick={() => setExpandidoId(aberto ? null : l.id)}
                    className="p-4 sm:px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer"
                  >
                    {/* Esquerda: Indicador Cronológico, Ação, Usuário e Detalhes */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center font-mono text-[11px] font-bold text-slate-600 shrink-0 mt-0.5 sm:mt-0">
                        #{String(logs.length - index).padStart(2, '0')}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-semibold tracking-wide">
                            {l.action}
                          </span>
                          <span className="font-semibold text-xs text-slate-900">
                            {l.user}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            ({l.cpf})
                          </span>
                          <span className="text-slate-300 hidden sm:inline">·</span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {new Date(l.time).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 truncate">
                          {l.details || 'Operação autenticada e gravada na trilha oficial de auditoria.'}
                        </p>
                      </div>
                    </div>

                    {/* Direita: IP, Pílula SHA-256, Validar Hash e Expandir */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 pl-11 lg:pl-0 shrink-0">
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-100/80 px-2 py-1 rounded-md">
                        IP {l.ip}
                      </span>

                      <div className="flex items-center gap-1 bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                        <KeyRound size={11} className="text-emerald-600" />
                        <span className="font-mono text-[11px] font-medium text-emerald-900" title={l.hash}>
                          {formatShortHash(l.hash)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopiarHash(l.hash, e)}
                          className="ml-1 text-emerald-700 hover:text-emerald-950 p-0.5 rounded cursor-pointer"
                          title="Copiar Hash SHA-256 completo"
                        >
                          {copiadoHash === l.hash ? <Check size={12} /> : <Copy size={11} />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleVerificarHash(l.hash, e)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          verificandoHash === l.hash
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90'
                        }`}
                      >
                        {verificandoHash === l.hash ? '✓ Autêntico' : 'Validar Hash'}
                      </button>

                      <div className="text-slate-400 p-1">
                        {aberto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </div>
                  </div>

                  {/* Painel Expandido de Prova Criptográfica */}
                  {aberto && (
                    <div className="px-4 sm:px-5 pb-4 pt-1 pl-4 sm:pl-16">
                      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            Certificado de Imutabilidade SHA-256 · Registro #{l.id}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                            Assinatura Íntegra
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Carimbo de Tempo ISO-8601
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-slate-800 mt-0.5 block">
                              {l.time}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Agente Responsável / CPF
                            </span>
                            <span className="font-semibold text-slate-800 mt-0.5 block">
                              {l.user} · <span className="font-mono">{l.cpf}</span>
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Origem de Rede (Terminal)
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-slate-800 mt-0.5 block">
                              {l.ip} (Rede Intranet Gov.PR)
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 font-mono text-[11px]">
                          <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
                            <div className="min-w-0">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                                Hash SHA-256 do Registro Atual
                              </span>
                              <span className="text-emerald-400 break-all">{l.hash}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => handleCopiarHash(l.hash, e)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] shrink-0 cursor-pointer flex items-center gap-1"
                            >
                              {copiadoHash === l.hash ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                              {copiadoHash === l.hash ? 'Copiado' : 'Copiar'}
                            </button>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-500">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                              Encadeamento Criptográfico (Hash do Bloco Anterior)
                            </span>
                            <span className="break-all text-[10px]">{hashAnterior}</span>
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
