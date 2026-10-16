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
  Gauge,
  Camera,
  FileCheck2
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

  const listaAtual = abaAtiva === 'checkin' ? agendamentosParaCheckin : agendamentosParaCheckout;
  const totalFotosCapturadas = Object.values(fotos).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho & Segmented Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                CONTROLE DE PÁTIO & AUDITORIA
              </span>
              <span className="text-[10px] font-mono font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/80">
                Vistoria 360°
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5">
              Check-in, Check-out e Vistoria Pericial
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro fotográfico de 4 ângulos e leitura de telemetria com carimbo criptográfico SHA-256.
            </p>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/80 self-start lg:self-center w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setAbaAtiva('checkin');
              setAgendamentoId('');
            }}
            className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
              abaAtiva === 'checkin'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car size={14} />
            <span>Check-in (Saída)</span>
            <span className="text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded">
              {agendamentosParaCheckin.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAbaAtiva('checkout');
              setAgendamentoId('');
            }}
            className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
              abaAtiva === 'checkout'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRight size={14} />
            <span>Check-out (Retorno)</span>
            <span className="text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded">
              {agendamentosParaCheckout.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('historico')}
            className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
              abaAtiva === 'historico'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History size={14} />
            <span>Histórico</span>
            <span className="text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded">
              {vistorias.length}
            </span>
          </button>
        </div>
      </div>

      {abaAtiva !== 'historico' ? (
        /* DIVIDED SPLIT VIEW: Coluna Esquerda (Ordem & Telemetria) + Coluna Direita (Vistoria 360° & Parecer) */
        <form onSubmit={handleSubmitVistoria} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Painel Esquerdo: Seleção da Missão e Telemetria de Bordo */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card 1: Seleção da Missão */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-800 font-mono text-xs font-bold flex items-center justify-center">
                    01
                  </span>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {abaAtiva === 'checkin' ? 'Ordem de Saída Autorizada' : 'Viatura em Retorno de Missão'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  {abaAtiva === 'checkin' ? 'Liberação' : 'Devolução'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  {abaAtiva === 'checkin'
                    ? 'Selecione a Missão Aprovada *'
                    : 'Selecione o Veículo em Missão *'}
                </label>
                <select
                  required
                  value={agendamentoId}
                  onChange={e => handleSelectAgendamento(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden transition"
                >
                  <option value="">
                    {abaAtiva === 'checkin'
                      ? 'Selecione uma solicitação autorizada...'
                      : 'Selecione o veículo retornando...'}
                  </option>
                  {listaAtual.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.ticket} — {a.nome} · {a.veiculoNome} ({a.veiculoPlaca})
                    </option>
                  ))}
                </select>

                {listaAtual.length === 0 && (
                  <div className="mt-3 text-xs text-amber-800 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70 flex items-center gap-2">
                    <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                    <span>
                      {abaAtiva === 'checkin'
                        ? 'Nenhuma viagem aprovada aguardando saída.'
                        : 'Nenhum veículo em missão ativa no momento.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Atalhos Rápidos de Seleção se houver missões */}
              {!agendamentoSel && listaAtual.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Seleção Rápida ({listaAtual.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {listaAtual.map(a => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleSelectAgendamento(a.id)}
                        className="w-full p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 text-left transition flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 truncate">{a.nome}</span>
                            <span className="text-[10px] font-mono text-slate-500">{a.ticket}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {a.veiculoNome} ({a.veiculoPlaca})
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Snapshot do Carro Escolhido */}
              {agendamentoSel && veiculoSel && (
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Viatura Alocada</span>
                      <div className="font-semibold text-sm text-slate-900 mt-0.5">{veiculoSel.modelo}</div>
                    </div>
                    <PlacaMercosul placa={veiculoSel.placa} uf="PR" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Condutor</span>
                      <span className="font-medium text-slate-800">{agendamentoSel.nome}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Protocolo</span>
                      <span className="font-mono font-medium text-slate-800">{agendamentoSel.ticket}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Telemetria de Bordo */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-800 font-mono text-xs font-bold flex items-center justify-center">
                    02
                  </span>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Telemetria & Instrumentos
                  </h3>
                </div>
                <Gauge size={16} className="text-slate-400" />
              </div>

              {agendamentoSel ? (
                <PainelOdometroCombustivel
                  kmAtual={km}
                  nivelCombustivel={combustivel}
                  onChangeKm={setKm}
                  onChangeCombustivel={setCombustivel}
                  interativo={true}
                />
              ) : (
                <div className="py-8 px-4 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  Selecione uma ordem de viagem acima para calibrar o odômetro e o nível de combustível.
                </div>
              )}
            </div>
          </div>

          {/* Painel Direito: Inspeção Visual 360° & Conclusão */}
          <div className="lg:col-span-7 space-y-6">
            {agendamentoSel ? (
              <>
                <CarroBlueprintVistoria
                  fotos={fotos}
                  onCapturarFoto={handleCapturarFoto}
                  onSimularTodas={handleSimularTodasFotos}
                />

                {/* Card de Observações e Assinatura */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                        03
                      </span>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        Parecer Técnico & Liberação
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Fotos: <strong>{totalFotosCapturadas}/4</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Observações de Avarias Pré-Existentes / Pneus / Acessórios
                    </label>
                    <textarea
                      rows={2}
                      value={observacoes}
                      onChange={e => setObservacoes(e.target.value)}
                      placeholder="Ex: Sem avarias aparentes. Estepe, macaco e chave de roda conferidos..."
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden transition"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      Gera hash criptográfico SHA-256 vinculado ao CPF do agente
                    </span>
                    <button
                      type="submit"
                      disabled={processando}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      {processando
                        ? 'Autenticando Vistoria...'
                        : abaAtiva === 'checkin'
                        ? 'Concluir Vistoria e Liberar Chave'
                        : 'Concluir Devolução e Finalizar Missão'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-2xs text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-500 flex items-center justify-center mx-auto">
                  <Camera size={22} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Módulo de Inspeção Fotográfica 360°
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Selecione uma missão na coluna à esquerda para habilitar o diagrama pericial de 4 ângulos (Frente, Traseira, Lateral Direita e Lateral Esquerda) e registrar a vistoria.
                </p>
              </div>
            )}
          </div>
        </form>
      ) : (
        /* Histórico de Vistorias Auditadas */
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <FileCheck2 size={18} className="text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                Registros Periciais de Vistoria Fotográfica
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
              {vistorias.length} {vistorias.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          <div className="space-y-4">
            {vistorias.map(v => (
              <div key={v.id} className="p-5 bg-slate-50/60 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                      v.tipo === 'checkin'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                    }`}>
                      {v.tipo === 'checkin' ? 'Check-in · Saída' : 'Check-out · Retorno'}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900">{v.ticket}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(v.dataHora).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200/70">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Motorista</span>
                    <strong className="text-slate-900">{v.motoristaNome}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Odômetro</span>
                    <strong className="text-slate-900 font-mono">{v.km.toLocaleString('pt-BR')} km</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Combustível</span>
                    <strong className="text-slate-900 font-mono">{v.nivelCombustivel}%</strong>
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block">Observações</span>
                    <span className="text-slate-800">{v.observacoesAvarias || 'Sem avarias'}</span>
                  </div>
                </div>

                {/* As 4 fotos registradas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(v.fotos).map(([ang, src]) => src && (
                    <div key={ang} className="space-y-1 bg-white p-1.5 rounded-xl border border-slate-200/70">
                      <img src={src} alt={ang} className="w-full h-20 object-cover rounded-lg" />
                      <span className="text-[10px] text-slate-500 block truncate capitalize font-mono px-1">{ang}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" /> Assinatura Digital Imutável
                  </span>
                  <span className="font-mono text-[10px] text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200/80">
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
        <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-xl border border-slate-200/80 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Vistoria Registrada & Auditada
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Odômetro em <strong>{sucessoModal.km.toLocaleString('pt-BR')} km</strong> e registros fotográficos gravados com carimbo criptográfico.
            </p>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-left text-xs font-mono space-y-1.5 text-slate-600 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Protocolo:</span>
                <strong className="text-slate-900">{sucessoModal.ticket}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Operação:</span>
                <strong className="text-slate-900">{sucessoModal.tipo === 'checkin' ? 'CHAVE LIBERADA' : 'CHAVE DEVOLVIDA'}</strong>
              </div>
              <div className="text-[10px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80 break-all mt-2">
                <span className="text-slate-400 block mb-0.5">Hash SHA-256:</span>
                {sucessoModal.hashAuditoria}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSucessoModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
