import React, { useState } from 'react';
import { Agendamento, Usuario } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { formatShortHash } from '../../services/crypto';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Printer, 
  MapPin, 
  Calendar, 
  Clock, 
  QrCode, 
  Car,
  User,
  Building2,
  Sparkles
} from 'lucide-react';

interface PasseViagemOficialProps {
  agendamento: Agendamento;
  currentUser: Usuario;
  onAprovar?: (hash: string) => void;
  onReprovar?: (motivo: string) => void;
  modoAprovacao?: boolean;
}

export const PasseViagemOficial: React.FC<PasseViagemOficialProps> = ({
  agendamento,
  currentUser,
  onAprovar,
  onReprovar,
  modoAprovacao = false
}) => {
  const [aprovando, setAprovando] = useState(false);
  const [modalReprovar, setModalReprovar] = useState(false);
  const [motivo, setMotivo] = useState('');

  const isAprovado = agendamento.status === 'aprovado' || agendamento.status === 'em_andamento' || agendamento.status === 'realizado';

  const handleAprovarClique = () => {
    if (!onAprovar) return;
    setAprovando(true);
    setTimeout(() => {
      onAprovar(agendamento.hashAuditoria || 'SHA256-MOCK-HASH');
      setAprovando(false);
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto relative select-none">
      {/* O PASSE OFICIAL DIGITAL (Estilo Carteira Executiva / Apple Wallet) */}
      <div className="bg-linear-to-b from-[#00385E] via-[#00538A] to-[#0072BB] text-white rounded-3xl shadow-2xl overflow-hidden border border-blue-400/30 font-sans relative">
        {/* Marca d'água de fundo */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Building2 size={240} />
        </div>

        {/* Topo do Passe */}
        <div className="p-6 border-b border-white/15 relative z-10">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-blue-200">
            <span>GOVERNO DO PARANÁ · SEJU</span>
            <span className="font-extrabold text-emerald-300">DOCUMENTO OFICIAL</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight text-white">
              PASSE DE MISSÃO OFICIAL
            </h3>
            <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded-lg border border-white/20">
              {agendamento.ticket}
            </span>
          </div>
        </div>

        {/* Corpo do Passe */}
        <div className="p-6 space-y-5 relative z-10 bg-slate-900/40 backdrop-blur-xs">
          {/* Veículo & Placa Mercosul */}
          <div className="flex items-center justify-between gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/15">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-200 block">
                Veículo Autorizado
              </span>
              <div className="font-extrabold text-sm text-white mt-0.5">
                {agendamento.veiculoNome}
              </div>
              <div className="text-[11px] text-blue-200 mt-0.5">
                Modalidade: {agendamento.modalidade === 'com_motorista' ? 'Com Motorista' : 'Sem Motorista'}
              </div>
            </div>

            <PlacaMercosul placa={agendamento.veiculoPlaca} uf="PR" />
          </div>

          {/* Dados do Servidor e Missão */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-200 block">
                Servidor Solicitante
              </span>
              <div className="font-bold text-white text-sm mt-0.5">{agendamento.nome}</div>
              <div className="text-[11px] text-blue-200 font-mono mt-0.5">CPF: {agendamento.cpf}</div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-blue-200 block">
                Data(s) Autorizada(s)
              </span>
              <div className="font-bold text-white text-sm mt-0.5">
                {agendamento.datas.map(d => d.split('-').reverse().join('/')).join(', ')}
              </div>
              <div className="text-[11px] text-blue-200 mt-0.5 uppercase">
                Período: {agendamento.periodo.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Destino */}
          <div className="pt-2 border-t border-white/15">
            <span className="text-[10px] uppercase font-bold text-blue-200 block">
              Destino / Finalidade da Missão
            </span>
            <div className="text-xs text-white font-medium mt-1 leading-snug line-clamp-2">
              {agendamento.destino}
            </div>
          </div>

          {/* Selo Criptográfico de Autenticação */}
          <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center font-bold">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="font-bold text-[11px] text-emerald-300">
                  {isAprovado ? 'AUTORIZAÇÃO VÁLIDA' : 'AGUARDANDO APROVAÇÃO'}
                </div>
                <div className="text-[9px] font-mono text-blue-200 truncate max-w-[170px]" title={agendamento.hashAuditoria}>
                  SHA-256: {formatShortHash(agendamento.hashAuditoria || 'PENDENTE')}
                </div>
              </div>
            </div>

            {/* QR Code Simulado de Verificação em Blitz/Guarita */}
            <div className="w-12 h-12 bg-white rounded-xl p-1 shadow-md flex items-center justify-center">
              <QrCode size={40} className="text-slate-900" />
            </div>
          </div>
        </div>

        {/* Rodapé de Ações do Passe */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-between gap-2">
          {modoAprovacao && !isAprovado ? (
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => setModalReprovar(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <X size={15} /> Reprovar
              </button>

              <button
                type="button"
                onClick={handleAprovarClique}
                disabled={aprovando}
                className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 transition cursor-pointer animate-pulse"
              >
                <Check size={16} />
                {aprovando ? 'Autenticando...' : 'Aprovar com 1 Clique'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                <Check size={14} /> Homologado pelo Gabinete
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="text-white hover:text-blue-200 font-bold flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <Printer size={15} /> Imprimir Passe
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Justificativa Reprovar */}
      {modalReprovar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-slate-800 shadow-2xl animate-in zoom-in-95">
            <h4 className="font-bold text-sm text-slate-900 mb-1">Reprovar Solicitação</h4>
            <p className="text-xs text-slate-500 mb-3">Informe o motivo da não autorização:</p>
            <textarea
              rows={3}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ex: Veículo em revisão preventiva..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-red-500 outline-hidden"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setModalReprovar(false)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onReprovar) onReprovar(motivo);
                  setModalReprovar(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
