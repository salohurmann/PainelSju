import React, { useState } from 'react';
import { AuditoriaLog } from '../../types';
import { formatShortHash } from '../../services/crypto';
import { ShieldCheck, Download, CheckCircle2, Lock, FileCode2, Search } from 'lucide-react';

interface TrilhaAuditoriaProps {
  logs: AuditoriaLog[];
}

export const TrilhaAuditoria: React.FC<TrilhaAuditoriaProps> = ({ logs }) => {
  const [busca, setBusca] = useState('');
  const [verificandoHash, setVerificandoHash] = useState<string | null>(null);

  const logsFiltrados = logs.filter(l => 
    l.user.toLowerCase().includes(busca.toLowerCase()) ||
    l.action.toLowerCase().includes(busca.toLowerCase()) ||
    l.hash.toLowerCase().includes(busca.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(busca.toLowerCase()))
  );

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `auditoria-criptografica-seju-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleVerificarHash = (hash: string) => {
    setVerificandoHash(hash);
    setTimeout(() => {
      setVerificandoHash(null);
    }, 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner de Segurança Corporativa */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            <Lock size={15} /> Trilha de Auditoria Criptográfica
          </div>
          <h2 className="text-xl font-bold mt-1">Registros Imutáveis com Hash SHA-256</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Cada aprovação, check-in e saída de veículo gera uma assinatura digital atrelada ao CPF do servidor, carimbo de tempo e IP. Registros invioláveis contra alterações no banco de dados.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
        >
          <Download size={16} /> Exportar Auditoria (JSON)
        </button>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>Eventos Registrados ({logs.length})</span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Filtrar por usuário, ação ou hash..."
              className="w-full text-xs pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#0072BB]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100/75 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Servidor / CPF</th>
                <th className="py-3 px-4">IP</th>
                <th className="py-3 px-4">Ação</th>
                <th className="py-3 px-4">Detalhes</th>
                <th className="py-3 px-4">Assinatura SHA-256</th>
                <th className="py-3 px-4 text-center">Verificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {logsFiltrados.map(l => (
                <tr key={l.id} className="hover:bg-blue-50/30 transition">
                  <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap text-gray-500">
                    {new Date(l.time).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                    <div>{l.user}</div>
                    <div className="font-mono text-[10px] text-gray-400 font-normal">{l.cpf}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                    {l.ip}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="bg-blue-100 text-[#0072BB] text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                    {l.details || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-emerald-800 bg-emerald-50/50 rounded font-medium max-w-[130px] truncate" title={l.hash}>
                    {formatShortHash(l.hash)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleVerificarHash(l.hash)}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/70 px-2 py-1 rounded transition cursor-pointer"
                    >
                      {verificandoHash === l.hash ? '✓ Autêntico' : 'Validar Hash'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
