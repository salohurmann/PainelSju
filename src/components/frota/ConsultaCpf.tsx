import React, { useState } from 'react';
import { Agendamento, Usuario } from '../../types';
import { formatShortHash } from '../../services/crypto';
import { PasseViagemOficial } from './PasseViagemOficial';
import { soundFX } from '../../services/soundFx';
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ShieldCheck, 
  Printer, 
  AlertCircle,
  QrCode,
  User,
  Sparkles,
  Ticket
} from 'lucide-react';

interface ConsultaCpfProps {
  agendamentos: Agendamento[];
  currentUser?: Usuario;
}

export const ConsultaCpf: React.FC<ConsultaCpfProps> = ({ agendamentos, currentUser }) => {
  const [cpfInput, setCpfInput] = useState('');
  const [resultado, setResultado] = useState<Agendamento[] | null>(null);
  const [passeSelecionado, setPasseSelecionado] = useState<Agendamento | null>(null);

  const formatarCpf = (v: string) => {
    let clean = v.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.slice(0, 11);
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const executarBuscaPorCpf = (cpfVal: string) => {
    const clean = cpfVal.replace(/\D/g, '');
    if (!clean) return;
    const encontrados = agendamentos.filter(
      a => a.cpf.replace(/\D/g, '') === clean
    );
    setResultado(encontrados);
  };

  const handleConsultar = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    executarBuscaPorCpf(cpfInput);
  };

  const handleSelecionarPresetCpf = (cpf: string) => {
    soundFX.playClick();
    const formatted = formatarCpf(cpf);
    setCpfInput(formatted);
    executarBuscaPorCpf(formatted);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-gov-card">
        <div className="max-w-xl mx-auto text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0072BB] border border-blue-200 flex items-center justify-center mx-auto font-bold shadow-2xs">
            <Search size={22} />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Acompanhamento de Solicitações por CPF
          </h2>
          <p className="text-xs text-slate-500">
            Digite seu CPF para consultar o andamento, acessar o Passe Oficial Digital com QR Code ou emitir comprovantes.
          </p>
        </div>

        <form onSubmit={handleConsultar} className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            required
            maxLength={14}
            value={cpfInput}
            onChange={e => setCpfInput(formatarCpf(e.target.value))}
            placeholder="000.000.000-00"
            className="flex-1 text-sm font-mono font-bold p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0072BB] focus:bg-white outline-hidden text-center"
          />
          <button
            type="submit"
            className="bg-[#0072BB] hover:bg-[#00538a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs transition cursor-pointer"
          >
            Consultar
          </button>
        </form>

        {/* Atalhos Rápidos de CPF em 1 Clique */}
        <div className="max-w-lg mx-auto mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400">Atalhos rápidos:</span>
          {currentUser && (
            <button
              type="button"
              onClick={() => handleSelecionarPresetCpf(currentUser.cpf)}
              className="text-[11px] font-bold text-[#0072BB] bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-xl border border-blue-200 transition cursor-pointer"
            >
              Meu CPF ({currentUser.nome.split(' ')[0]})
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSelecionarPresetCpf('02145878901')}
            className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl border border-slate-200 transition cursor-pointer"
          >
            Dra. Maria Helena
          </button>
          <button
            type="button"
            onClick={() => handleSelecionarPresetCpf('14589632144')}
            className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl border border-slate-200 transition cursor-pointer"
          >
            Carlos Silveira
          </button>
        </div>
      </div>

      {/* Resultados */}
      {resultado !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Resultados encontrados: <strong>{resultado.length}</strong></span>
          </div>

          {resultado.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 text-xs text-gray-400">
              Nenhuma solicitação encontrada para o CPF informado.
            </div>
          ) : (
            resultado.map(ag => (
              <div
                key={ag.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{ag.nome}</span>
                      <span className="font-mono text-xs font-bold text-[#0072BB] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {ag.ticket}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Registrado em: {new Date(ag.criadoEm).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div>
                    {ag.status === 'pendente' && (
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Clock size={14} /> Aguardando Validação da Chefia
                      </span>
                    )}
                    {ag.status === 'aprovado' && (
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Autorizado para Viagem
                      </span>
                    )}
                    {ag.status === 'reprovado' && (
                      <span className="text-xs font-bold bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <XCircle size={14} /> Solicitação Não Autorizada
                      </span>
                    )}
                    {ag.status === 'realizado' && (
                      <span className="text-xs font-bold bg-blue-100 text-[#0072BB] px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Viagem Realizada
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Veículo</span>
                    <strong className="text-gray-800">{ag.veiculoNome}</strong> ({ag.veiculoPlaca})
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Data(s)</span>
                    <strong className="text-gray-800">{ag.datas.map(d => d.split('-').reverse().join('/')).join(', ')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Destino</span>
                    <span className="text-gray-800 line-clamp-1">{ag.destino}</span>
                  </div>
                </div>

                {/* Carimbo de Auditoria */}
                {ag.hashAuditoria && (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      Assinado por {ag.aprovadorNome} ({ag.aprovadorCpf})
                    </span>
                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200">
                      SHA-256: {formatShortHash(ag.hashAuditoria)}
                    </span>
                  </div>
                )}

                {ag.status === 'reprovado' && ag.obs && (
                  <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 text-xs text-red-800">
                    <strong>Motivo:</strong> {ag.obs}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="text-xs font-bold text-slate-700 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer size={14} /> Imprimir Comprovante
                  </button>

                  {(ag.status === 'aprovado' || ag.status === 'em_andamento' || ag.status === 'realizado') && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setPasseSelecionado(ag);
                      }}
                      className="text-xs font-black text-white bg-[#0072BB] hover:bg-[#00538a] px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer"
                    >
                      <Ticket size={14} /> Visualizar Passe Oficial Digital (QR Code)
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal do Passe Oficial Digital (Apple Wallet / Credencial Oficial) */}
      {passeSelecionado && (
        <div 
          className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPasseSelecionado(null)}
        >
          <div 
            className="max-w-md w-full animate-in zoom-in-95 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setPasseSelecionado(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 flex items-center justify-center font-bold text-sm cursor-pointer transition shadow-lg"
              >
                ✕
              </button>
            </div>

            <PasseViagemOficial
              agendamento={passeSelecionado}
              currentUser={currentUser || { id: 'usr-1', nome: passeSelecionado.nome, username: 'servidor.seju', cpf: passeSelecionado.cpf, cargo: 'Servidor Solicitante', setor: 'SEJU/PR', email: passeSelecionado.email, role: 'servidor' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
