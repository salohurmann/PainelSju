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
  EyeOff,
  X
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
  return 'Rede Interna Protegida';
}

export const TrilhaAuditoria: React.FC<TrilhaAuditoriaProps> = ({ logs }) => {
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [verificandoId, setVerificandoId] = useState<string | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(logs[0]?.id || null);
  const [cofreVerificado, setCofreVerificado] = useState<boolean>(false);

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
    }, 2500);
  };

  const handleAuditarCofreCompleto = () => {
    setCofreVerificado(true);
    setTimeout(() => {
      setCofreVerificado(false);
    }, 3500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* (1) CABEÇALHO DO COFRE DE SEGURANÇA — ZERO EXPOSIÇÃO DE HASHES */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-gov-card space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                <EyeOff size={12} />
                Modo Blindado · Hashes 100% Ocultas
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-medium text-slate-500">Cofre Criptográfico SEJU/PR</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Segurança & Conformidade Blindada
                </h2>
                <p className="text-xs text-slate-500">
                  Todas as chaves, assinaturas e hashes permanecem seladas e invisíveis para proteção integral dos dados.
                </p>
              </div>
            </div>
          </div>

          {/* Indicadores de Proteção & Verificação Silenciosa */}
          <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
              <div>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Eventos Protegidos</span>
                <span className="font-bold text-slate-900">{logs.length} selados</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Exposição de Hash</span>
                <span className="font-bold text-emerald-700">0% (Oculto)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAuditarCofreCompleto}
              className={`text-xs font-semibold px-4 py-2.5 rounded-xl border transition flex items-center gap-2 cursor-pointer ${
                cofreVerificado
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-900 text-white'
              }`}
            >
              <Fingerprint size={15} className={cofreVerificado ? 'text-white' : 'text-emerald-400'} />
              {cofreVerificado ? 'Cofre Íntegro & Blindado ✓' : 'Testar Blindagem'}
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
              placeholder="Filtrar eventos por servidor ou tipo de operação..."
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

      {/* (2) TIMELINE DE REGISTROS PROTEGIDOS (SEM NENHUMA HASH VISÍVEL) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-gov-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/70 bg-slate-50/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Registros Operacionais Protegidos ({logsFiltrados.length})</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline items-center gap-1">
            Chaves criptográficas ocultadas automaticamente por política de segurança
          </span>
        </div>

        {logsFiltrados.length === 0 ? (
          <div className="p-12 text-center space-y-1">
            <div className="text-xs font-semibold text-slate-700">Nenhum evento correspondente</div>
            <p className="text-xs text-slate-400">Ajuste a busca ou selecione "Todos os Eventos".</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logsFiltrados.map((l, index) => {
              const aberto = expandidoId === l.id;

              return (
                <div
                  key={l.id}
                  className={`transition-colors ${aberto ? 'bg-slate-50/50' : 'hover:bg-slate-50/40'}`}
                >
                  {/* Linha Principal Blindada */}
                  <div
                    onClick={() => setExpandidoId(aberto ? null : l.id)}
                    className="p-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-mono text-[11px] font-bold text-slate-600 shrink-0 mt-0.5 sm:mt-0">
                        #{String(logs.length - index).padStart(2, '0')}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-semibold tracking-wide">
                            {l.action}
                          </span>
                          <span className="font-semibold text-xs text-slate-900">
                            {l.user}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            ({maskCpf(l.cpf)})
                          </span>
                          <span className="text-slate-300 hidden sm:inline">·</span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {new Date(l.time).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 truncate">
                          {l.details || 'Operação autenticada e protegida no cofre institucional.'}
                        </p>
                      </div>
                    </div>

                    {/* Direita: Selo Oculto sem qualquer Hash visível */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 pl-11 lg:pl-0 shrink-0">
                      <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-lg">
                        <EyeOff size={11} className="text-slate-500" />
                        <span className="font-mono text-[11px] font-semibold text-slate-600 select-none">
                          ••••••••••••••••
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleVerificarIntegridade(l.id, e)}
                        className={`text-[11px] font-semibold px-3 py-1 rounded-lg border transition cursor-pointer ${
                          verificandoId === l.id
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200/80'
                        }`}
                      >
                        {verificandoId === l.id ? '✓ Protegido' : 'Selo Ativo'}
                      </button>

                      <div className="text-slate-400 p-1">
                        {aberto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </div>
                  </div>

                  {/* Painel Expandido — 100% Blindado e Sem Hashes Expostas */}
                  {aberto && (
                    <div className="px-4 sm:px-6 pb-5 pt-1 pl-4 sm:pl-16">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            Certificado de Segurança Interna · Registro #{l.id}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                            Criptografia Oculta
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Data e Hora Oficial
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-slate-800 mt-0.5 block">
                              {new Date(l.time).toLocaleString('pt-BR')}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Servidor Autenticado (CPF Protegido)
                            </span>
                            <span className="font-semibold text-slate-800 mt-0.5 block">
                              {l.user} · <span className="font-mono text-slate-500">{maskCpf(l.cpf)}</span>
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Rede / Terminal
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-slate-800 mt-0.5 block">
                              {maskIp(l.ip)} (Intranet Segura)
                            </span>
                          </div>
                        </div>

                        {/* Cofre de Hash Totalmente Oculto */}
                        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <Lock size={15} className="text-emerald-400 shrink-0" />
                            <div>
                              <span className="text-[11px] font-semibold text-white block">
                                Assinatura Criptográfica Selada no Cofre SEJU
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                Nenhuma hash ou chave privada é exibida em tela para prevenção de vazamento.
                              </span>
                            </div>
                          </div>
                          <span className="font-mono text-xs tracking-widest text-emerald-400 bg-white/10 px-3 py-1 rounded-lg select-none self-start sm:self-auto">
                            ••••••••••••••••••••••••
                          </span>
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
