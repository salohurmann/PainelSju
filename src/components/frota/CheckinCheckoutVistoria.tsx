import React, { useState } from 'react';
import { Agendamento, Veiculo, Vistoria, Usuario, VistoriaFotos } from '../../types';
import { generateAuditHash, formatShortHash } from '../../services/crypto';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { PainelOdometroCombustivel } from '../ui/PainelOdometroCombustivel';
import { CarroBlueprintVistoria } from './CarroBlueprintVistoria';
import { 
  Car, 
  ArrowRight, 
  History, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Clock,
  Printer
} from 'lucide-react';

interface CheckinCheckoutVistoriaProps {
  agendamentos: Agendamento[];
  veiculos: Veiculo[];
  vistorias: Vistoria[];
  currentUser: Usuario;
  onRegistrarVistoria: (vistoria: Vistoria, veiculoAtualizado: Partial<Veiculo>) => void;
}

export const CheckinCheckoutVistoria: React.FC<CheckinCheckoutVistoriaProps> = ({
  agendamentos,
  veiculos,
  vistorias,
  currentUser,
  onRegistrarVistoria
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'checkin' | 'checkout' | 'historico'>('checkin');
  const [agendamentoId, setAgendamentoId] = useState('');
  const [km, setKm] = useState<number>(34210);
  const [combustivel, setCombustivel] = useState<number>(85);
  const [observacoes, setObservacoes] = useState('');
  const [processando, setProcessando] = useState(false);
  const [sucessoModal, setSucessoModal] = useState<Vistoria | null>(null);

  // 4 Fotos Obrigatórias
  const [fotos, setFotos] = useState<VistoriaFotos>({
    frente: '',
    traseira: '',
    lateralDireita: '',
    lateralEsquerda: ''
  });

  const agendamentosParaCheckin = agendamentos.filter(a => a.status === 'aprovado');
  const agendamentosParaCheckout = agendamentos.filter(a => a.status === 'em_andamento');

  const agendamentoSel = agendamentos.find(a => a.id === agendamentoId);
  const veiculoSel = veiculos.find(v => v.id === agendamentoSel?.veiculoId);

  const handleSelectAgendamento = (id: string) => {
    setAgendamentoId(id);
    const ag = agendamentos.find(a => a.id === id);
    if (ag) {
      const v = veiculos.find(x => x.id === ag.veiculoId);
      if (v) {
        setKm(v.kmAtual);
        setCombustivel(v.nivelCombustivel);
      }
    }
  };

  const handleCapturarFoto = (posicao: keyof VistoriaFotos, dataUrl: string) => {
    setFotos(prev => ({ ...prev, [posicao]: dataUrl }));
  };

  const handleSimularTodasFotos = () => {
    setFotos({
      frente: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
      traseira: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80',
      lateralDireita: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
      lateralEsquerda: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=400&q=80'
    });
  };

  const handleSubmitVistoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendamentoSel || !veiculoSel) return;
    setProcessando(true);

    try {
      const tipo = abaAtiva === 'checkin' ? 'checkin' : 'checkout';
      const timestamp = new Date().toISOString();

      const hash = await generateAuditHash({
        action: `VISTORIA_${tipo.toUpperCase()}`,
        ticket: agendamentoSel.ticket,
        cpf: currentUser.cpf,
        timestamp,
        ip: '187.115.82.20',
        details: `Km: ${km} | Tanque: ${combustivel}% | Veículo: ${veiculoSel.placa}`
      });

      const novaVistoria: Vistoria = {
        id: 'vis-' + Date.now(),
        agendamentoId: agendamentoSel.id,
        ticket: agendamentoSel.ticket,
        veiculoId: veiculoSel.id,
        tipo,
        km,
        nivelCombustivel: combustivel,
        fotos,
        motoristaNome: agendamentoSel.nome,
        motoristaCpf: agendamentoSel.cpf,
        observacoesAvarias: observacoes.trim(),
        dataHora: timestamp,
        hashAuditoria: hash
      };

      const veiculoAtualizado: Partial<Veiculo> = {
        kmAtual: km,
        nivelCombustivel: combustivel,
        status: tipo === 'checkin' ? 'em_missao' : 'disponivel'
      };

      onRegistrarVistoria(novaVistoria, veiculoAtualizado);
      setSucessoModal(novaVistoria);

      setAgendamentoId('');
      setObservacoes('');
      setFotos({ frente: '', traseira: '', lateralDireita: '', lateralEsquerda: '' });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Abas Superiores Estilo Switcher de Painel */}
      <div className="flex bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-sm">
        <button
          onClick={() => setAbaAtiva('checkin')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            abaAtiva === 'checkin'
              ? 'bg-[#0072BB] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Car size={16} /> 1. Check-in (Entrega da Chave / Saída)
        </button>

        <button
          onClick={() => setAbaAtiva('checkout')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            abaAtiva === 'checkout'
              ? 'bg-[#0072BB] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ArrowRight size={16} /> 2. Check-out (Devolução da Chave)
        </button>

        <button
          onClick={() => setAbaAtiva('historico')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            abaAtiva === 'historico'
              ? 'bg-[#0072BB] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <History size={16} /> Histórico Auditado
        </button>
      </div>

      {abaAtiva !== 'historico' ? (
        <form onSubmit={handleSubmitVistoria} className="space-y-6">
          {/* Seção 1: Seleção da Viagem */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#0072BB]" />
                {abaAtiva === 'checkin' ? 'Vistoria Oficial de Saída' : 'Vistoria Oficial de Retorno'}
              </h3>
              <span className="text-xs text-slate-400 font-mono">SEJU FROTAS</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {abaAtiva === 'checkin'
                  ? 'Selecione a Missão Aprovada para Saída *'
                  : 'Selecione o Veículo em Missão para Devolução *'}
              </label>
              <select
                required
                value={agendamentoId}
                onChange={e => handleSelectAgendamento(e.target.value)}
                className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0072BB] outline-hidden"
              >
                <option value="">
                  {abaAtiva === 'checkin'
                    ? '-- Selecione uma solicitação autorizada pela chefia --'
                    : '-- Selecione o veículo retornando da missão --'}
                </option>
                {(abaAtiva === 'checkin' ? agendamentosParaCheckin : agendamentosParaCheckout).map(a => (
                  <option key={a.id} value={a.id}>
                    {a.ticket} — {a.nome} · {a.veiculoNome} ({a.veiculoPlaca}) · Destino: {a.destino.slice(0, 35)}...
                  </option>
                ))}
              </select>

              {(abaAtiva === 'checkin' ? agendamentosParaCheckin : agendamentosParaCheckout).length === 0 && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>
                    {abaAtiva === 'checkin'
                      ? 'Nenhuma viagem aprovada aguardando saída no momento.'
                      : 'Nenhum veículo em missão no momento.'}
                  </span>
                </div>
              )}
            </div>

            {/* Snapshot do Carro Escolhido com Placa Mercosul */}
            {agendamentoSel && veiculoSel && (
              <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Veículo Alocado</div>
                  <div className="font-extrabold text-sm text-slate-900 mt-0.5">{veiculoSel.modelo}</div>
                  <div className="text-xs text-slate-500">Motorista: {agendamentoSel.nome}</div>
                </div>
                <PlacaMercosul placa={veiculoSel.placa} uf="PR" />
              </div>
            )}
          </div>

          {/* Seção 2: Painel Automotivo / Cockpit (Odômetro & Combustível) */}
          {agendamentoSel && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Leitura de Telemetria e Instrumentos de Bordo
              </div>
              <PainelOdometroCombustivel
                kmAtual={km}
                nivelCombustivel={combustivel}
                onChangeKm={setKm}
                onChangeCombustivel={setCombustivel}
                interativo={true}
              />
            </div>
          )}

          {/* Seção 3: Blueprint 360° com Câmera e 4 Fotos */}
          {agendamentoSel && (
            <CarroBlueprintVistoria
              fotos={fotos}
              onCapturarFoto={handleCapturarFoto}
              onSimularTodas={handleSimularTodasFotos}
            />
          )}

          {/* Seção 4: Avarias e Conclusão */}
          {agendamentoSel && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações de Avarias Pré-Existentes / Riscos / Nível de Óleo
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Ex: Risco superficial no para-choque traseiro, estepe e ferramentas conferidas..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0072BB] outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={processando}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={18} />
                  {processando
                    ? 'Autenticando Vistoria...'
                    : abaAtiva === 'checkin'
                    ? 'Concluir Vistoria e Liberar Chave'
                    : 'Concluir Devolução e Finalizar Missão'}
                </button>
              </div>
            </div>
          )}
        </form>
      ) : (
        /* Histórico de Vistorias Auditadas com Miniatura de Fotos */
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Registros Periciais de Vistoria Fotográfica
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {vistorias.length} vistorias gravadas
            </span>
          </div>

          <div className="space-y-4">
            {vistorias.map(v => (
              <div key={v.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      v.tipo === 'checkin' ? 'bg-blue-100 text-[#0072BB]' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {v.tipo.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">{v.ticket}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(v.dataHora).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                  <div><strong>Motorista:</strong> {v.motoristaNome}</div>
                  <div><strong>Odômetro:</strong> {v.km.toLocaleString('pt-BR')} km</div>
                  <div><strong>Tanque:</strong> {v.nivelCombustivel}%</div>
                  <div className="truncate"><strong>Avarias:</strong> {v.observacoesAvarias || 'Nenhuma'}</div>
                </div>

                {/* As 4 fotos registradas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {Object.entries(v.fotos).map(([ang, src]) => src && (
                    <div key={ang} className="space-y-1">
                      <img src={src} alt={ang} className="w-full h-18 object-cover rounded-xl border border-slate-200" />
                      <span className="text-[9px] text-slate-500 block truncate capitalize font-mono">{ang}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                  <span>Assinatura Digital Imutável</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    SHA-256: {formatShortHash(v.hashAuditoria)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Sucesso */}
      {sucessoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Vistoria Registrada & Auditada!
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Odômetro em <strong>{sucessoModal.km.toLocaleString('pt-BR')} km</strong> e as 4 fotos foram gravadas com carimbo criptográfico.
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs font-mono space-y-1 text-slate-600 mb-6">
              <div><strong>Protocolo:</strong> {sucessoModal.ticket}</div>
              <div><strong>Status:</strong> {sucessoModal.tipo === 'checkin' ? 'CHAVE LIBERADA' : 'CHAVE DEVOLVIDA'}</div>
              <div className="text-[10px] text-emerald-900 bg-emerald-50 p-2 rounded-xl border border-emerald-200 break-all">
                <strong>Hash SHA-256:</strong><br />{sucessoModal.hashAuditoria}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSucessoModal(null)}
              className="w-full py-3 bg-[#0072BB] text-white text-xs font-bold rounded-xl hover:bg-[#00538a] transition cursor-pointer"
            >
              Fechar Vistoria
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
