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
  FileCheck2,
  Lock,
  Focus,
  Sparkles
} from 'lucide-react';

interface CheckinCheckoutVistoriaProps {
  agendamentos: Agendamento[];
  veiculos: Veiculo[];
  vistorias: Vistoria[];
  currentUser: Usuario;
  onRegistrarVistoria: (vistoria: Vistoria, veiculoAtualizado: Partial<Veiculo>) => void;
}

const SLOTS_PERICIAIS: Array<{
  key: keyof VistoriaFotos;
  label: string;
  tag: string;
  lente: string;
}> = [
  { key: 'frente', label: 'Frente', tag: 'CAM-01 · FWD', lente: 'ISO 100 · f/2.8 · GPS PR' },
  { key: 'traseira', label: 'Traseira', tag: 'CAM-02 · AFT', lente: 'ISO 100 · f/2.8 · GPS PR' },
  { key: 'lateralDireita', label: 'Lateral Direita', tag: 'CAM-03 · STB', lente: 'ISO 100 · f/2.8 · GPS PR' },
  { key: 'lateralEsquerda', label: 'Lateral Esquerda', tag: 'CAM-04 · PRT', lente: 'ISO 100 · f/2.8 · GPS PR' }
];

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
    <div className="space-y-6">
      {/* Cabeçalho & Segmented Switcher */}
      <div className="bg-[var(--surface)] rounded-[18px] p-6 border border-[var(--border)]/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-[#0B1B2E]  " />

        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0B1B2E] text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-[#22324C]/10">
            <ShieldCheck size={21} className="text-[var(--brand)]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] tabular-nums uppercase tracking-wider text-[var(--text-muted)] font-bold">
                CONTROLE DE PÁTIO & PERÍCIA ÓPTICA
              </span>
              <span className="text-[10px] tabular-nums font-semibold bg-[var(--brand-soft)] text-[var(--brand)] px-2.5 py-0.5 rounded-full border border-[var(--brand-border)]/80">
                Viewfinder 360° · SHA-256
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight mt-0.5">
              Check-in, Check-out e Vistoria Pericial Cautelar
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Inspeção técnica de 4 quadrantes (Frente, Traseira, Lateral Direita e Lateral Esquerda) com telemetria e selo criptográfico.
            </p>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="flex bg-[var(--surface-2)]/90 rounded-xl p-1 border border-[var(--border)]/90 self-start lg:self-center w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setAbaAtiva('checkin');
              setAgendamentoId('');
            }}
            className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
              abaAtiva === 'checkin'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-2xs border border-[var(--border)]/80 font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Car size={14} />
            <span>Check-in (Saída)</span>
            <span className="text-[10px] tabular-nums bg-[var(--surface-3)]/75 text-[var(--text)] px-1.5 py-0.2 rounded font-bold">
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
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-2xs border border-[var(--border)]/80 font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <ArrowRight size={14} />
            <span>Check-out (Retorno)</span>
            <span className="text-[10px] tabular-nums bg-[var(--surface-3)]/75 text-[var(--text)] px-1.5 py-0.2 rounded font-bold">
              {agendamentosParaCheckout.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('historico')}
            className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
              abaAtiva === 'historico'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-2xs border border-[var(--border)]/80 font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <History size={14} />
            <span>Histórico</span>
            <span className="text-[10px] tabular-nums bg-[var(--surface-3)]/75 text-[var(--text)] px-1.5 py-0.2 rounded font-bold">
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
            <div className="bg-[var(--surface)] rounded-[18px] p-6 border border-[var(--border)]/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#0B1B2E] text-white tabular-nums text-xs font-bold flex items-center justify-center">
                    01
                  </span>
                  <h3 className="font-bold text-[var(--text)] text-sm">
                    {abaAtiva === 'checkin' ? 'Ordem de Saída Autorizada' : 'Viatura em Retorno de Missão'}
                  </h3>
                </div>
                <span className="text-[10px] tabular-nums uppercase font-semibold text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-md border border-[var(--border)]/70">
                  {abaAtiva === 'checkin' ? 'Liberação' : 'Devolução'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                  {abaAtiva === 'checkin'
                    ? 'Selecione a Missão Aprovada *'
                    : 'Selecione o Veículo em Missão *'}
                </label>
                <select
                  required
                  value={agendamentoId}
                  onChange={e => handleSelectAgendamento(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[var(--surface-2)]/80 border border-[var(--border)]/90 rounded-xl focus:ring-2 focus:ring-[#22324C]/10 focus:border-[#22324C] focus:bg-[var(--surface)] outline-hidden transition font-medium"
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
                  <div className="mt-3 text-xs text-[var(--warning)] bg-[var(--warning-soft)]/70 p-3 rounded-xl border border-[var(--warning-border)]/70 flex items-center gap-2">
                    <AlertTriangle size={15} className="text-[var(--warning)] shrink-0" />
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
                  <span className="text-[10px] tabular-nums uppercase font-semibold text-[var(--text-subtle)] block">
                    Seleção Rápida ({listaAtual.length})
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {listaAtual.map(a => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleSelectAgendamento(a.id)}
                        className="w-full p-3 rounded-xl border border-[var(--border)]/90 bg-[var(--surface-2)]/60 hover:bg-[var(--surface)] hover:border-[var(--brand)]/50 hover:shadow-2xs text-left transition flex items-center justify-between gap-2 cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--text)] truncate">{a.nome}</span>
                            <span className="text-[10px] tabular-nums text-[var(--brand)] bg-[var(--brand-soft)] px-1.5 py-0.5 rounded border border-[var(--brand-border)]/60">
                              {a.ticket}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                            {a.veiculoNome} ({a.veiculoPlaca})
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[var(--text-subtle)] group-hover:text-[var(--brand)] group-hover:translate-x-0.5 transition shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Snapshot do Carro Escolhido */}
              {agendamentoSel && veiculoSel && (
                <div className="p-4 bg-[var(--surface-2)]/90 rounded-xl border border-[var(--border)]/90 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] tabular-nums uppercase text-[var(--text-subtle)] block">Viatura Alocada</span>
                      <div className="font-bold text-sm text-[var(--text)] mt-0.5">{veiculoSel.modelo}</div>
                    </div>
                    <PlacaMercosul placa={veiculoSel.placa} uf="PR" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]/70 text-xs">
                    <div>
                      <span className="text-[10px] text-[var(--text-subtle)] block">Condutor Responsável</span>
                      <span className="font-semibold text-[var(--text)]">{agendamentoSel.nome}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-subtle)] block">Protocolo Oficial</span>
                      <span className="tabular-nums font-bold text-[var(--text)]">{agendamentoSel.ticket}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Telemetria de Bordo */}
            <div className="bg-[var(--surface)] rounded-[18px] p-6 border border-[var(--border)]/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#0B1B2E] text-white tabular-nums text-xs font-bold flex items-center justify-center">
                    02
                  </span>
                  <h3 className="font-bold text-[var(--text)] text-sm">
                    Telemetria & Instrumentos
                  </h3>
                </div>
                <Gauge size={16} className="text-[var(--text-subtle)]" />
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
                <div className="py-8 px-4 text-center text-xs text-[var(--text-subtle)] bg-[var(--surface-2)]/50 rounded-xl border border-dashed border-[var(--border)]">
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

                {/* Card 3: Matriz Viewfinder de Conferência Pericial + Parecer Técnico */}
                <div className="bg-[var(--surface)] rounded-[18px] p-6 border border-[var(--border)]/90 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#0B1B2E] text-white tabular-nums text-xs font-bold flex items-center justify-center">
                        03
                      </span>
                      <div>
                        <h3 className="font-bold text-[var(--text)] text-sm">
                          Viewfinder de Câmera Pericial & Homologação
                        </h3>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Conferência dos 4 ângulos periciais com metadados ópticos e assinatura SHA-256
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] tabular-nums bg-[var(--surface-2)] px-2.5 py-1 rounded-lg border border-[var(--border)]/80 text-[var(--text)]">
                      Slots: <strong>{totalFotosCapturadas}/4</strong>
                    </span>
                  </div>

                  {/* 4 Slots de Foto Pericial com Moldura Viewfinder (Frente, Traseira, Lateral Direita, Lateral Esquerda) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SLOTS_PERICIAIS.map(slot => {
                      const src = fotos[slot.key];
                      return (
                        <div
                          key={slot.key}
                          className={`rounded-xl p-2 border transition relative overflow-hidden ${
                            src
                              ? 'bg-[#0B1B2E] border-[var(--verde)]/60 shadow-2xs'
                              : 'bg-[#0B1B2E] border-[#22324C]'
                          }`}
                        >
                          {/* Viewfinder Frame com Cantoneiras L nos 4 Cantos */}
                          <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-[#0B1B2E] flex items-center justify-center">    

                            {/* Metadados Técnicos Simulados no Topo */}
                            <div className="absolute top-1.5 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                              <span className="text-[7.5px] tabular-nums text-[#DCEEFB] bg-[#0B1B2E]/80 px-1 py-0.2 rounded">
                                {slot.lente}
                              </span>
                            </div>

                            {src ? (
                              <>
                                <img
                                  src={src}
                                  alt={slot.label}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-1.5 right-2 z-20 bg-[#0B1B2E]/90 border border-[var(--verde)]/50 text-[#C6E86B] text-[8px] tabular-nums font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <Lock size={8} /> SHA-256
                                </div>
                              </>
                            ) : (
                              <div className="text-center p-2">
                                <Focus size={15} className="text-[var(--brand)]/60 mx-auto mb-1" />
                                <span className="text-[9px] tabular-nums text-[var(--text-subtle)] block">
                                  {slot.tag}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-1.5 flex items-center justify-between px-0.5">
                            <span className="text-[10px] font-bold text-white truncate">
                              {slot.label}
                            </span>
                            <span
                              className={`text-[8px] tabular-nums uppercase px-1.5 py-0.2 rounded ${
                                src
                                  ? 'bg-[#00A859]/20 text-[#C6E86B] border border-[var(--verde)]/30'
                                  : 'bg-[#0B1B2E] text-[var(--text-subtle)]'
                              }`}
                            >
                              {src ? 'SHA-256' : 'STANDBY'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                      Observações de Avarias Pré-Existentes / Pneus / Acessórios
                    </label>
                    <textarea
                      rows={2}
                      value={observacoes}
                      onChange={e => setObservacoes(e.target.value)}
                      placeholder="Ex: Sem avarias aparentes. Estepe, macaco e chave de roda conferidos..."
                      className="w-full text-xs px-3.5 py-2.5 bg-[var(--surface-2)]/70 border border-[var(--border)]/90 rounded-xl focus:ring-2 focus:ring-[#22324C]/10 focus:border-[#22324C] focus:bg-[var(--surface)] outline-hidden transition"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--border-subtle)]">
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 tabular-nums">
                      <Lock size={12} className="text-[var(--verde)]" />
                      Gera hash criptográfico SHA-256 vinculado ao CPF do agente
                    </span>
                    <button
                      type="submit"
                      disabled={processando}
                      className="bg-[#0B1B2E] hover:bg-[#005A9C] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
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
              /* Estado Inicial com Preview dos 4 Viewfinders de Câmera Pericial */
              <div className="bg-[var(--surface)] rounded-[18px] p-8 border border-[var(--border)]/90 shadow-2xs space-y-6">
                <div className="text-center space-y-2 max-w-lg mx-auto">
                  <div className="w-12 h-12 rounded-[18px] bg-[#0B1B2E] text-[var(--brand)] flex items-center justify-center mx-auto shadow-xs">
                    <Camera size={22} />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text)]">
                    Estúdio de Câmera Pericial 360° em Standby
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Selecione uma missão na coluna à esquerda para ativar os 4 Viewfinders ópticos (Frente, Traseira, Lateral Direita e Lateral Esquerda) com telemetria CAD.
                  </p>
                </div>

                {/* Preview dos 4 Slots Viewfinder em Standby */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SLOTS_PERICIAIS.map(slot => (
                    <div
                      key={slot.key}
                      className="rounded-xl p-2.5 bg-[#0B1B2E] border border-[#22324C] text-white space-y-2"
                    >
                      <div className="aspect-4/3 rounded-lg bg-[#0B1B2E]/90 relative flex flex-col items-center justify-center p-2 overflow-hidden">    

                        <span className="text-[7.5px] tabular-nums text-[#DCEEFB]/80 mb-1">
                          {slot.lente}
                        </span>
                        <Focus size={16} className="text-[var(--text-muted)] my-1" />
                        <span className="text-[8px] tabular-nums text-[var(--verde)]/80">
                          SHA-256 READY
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-white/90 truncate">{slot.label}</span>
                        <span className="tabular-nums text-[8px] text-[var(--brand)]">{slot.tag.split(' · ')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {listaAtual.length > 0 && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => handleSelectAgendamento(listaAtual[0].id)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#0B1B2E] hover:bg-[#005A9C] px-4 py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
                    >
                      <Sparkles size={14} className="text-[#FFE2A8]" />
                      Carregar Primeira Missão da Fila ({listaAtual[0].ticket})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      ) : (
        /* Histórico de Vistorias Auditadas com Viewfinders Periciais */
        <div className="bg-[var(--surface)] rounded-[18px] p-6 border border-[var(--border)]/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2.5">
              <FileCheck2 size={18} className="text-[var(--brand)]" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">
                  Registros Periciais de Vistoria Fotográfica
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Arquivo imutável de evidências de 4 ângulos com metadados de câmera e assinatura SHA-256
                </p>
              </div>
            </div>
            <span className="text-xs text-[var(--text)] tabular-nums font-bold bg-[var(--surface-2)] px-3 py-1 rounded-lg border border-[var(--border)]/80">
              {vistorias.length} {vistorias.length === 1 ? 'laudo' : 'laudos'}
            </span>
          </div>

          <div className="space-y-4">
            {vistorias.map(v => (
              <div
                key={v.id}
                className="p-5 bg-[var(--surface-2)]/70 rounded-[18px] border border-[var(--border)]/90 hover:border-[var(--border-strong)] transition space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        v.tipo === 'checkin'
                          ? 'bg-[#0B1B2E] text-white border-[#22324C]'
                          : 'bg-[var(--verde-soft)] text-[var(--verde)] border-[var(--verde-border)]/90'
                      }`}
                    >
                      {v.tipo === 'checkin' ? 'Check-in · Saída' : 'Check-out · Retorno'}
                    </span>
                    <span className="tabular-nums text-xs font-bold text-[var(--text)] bg-[var(--surface)] px-2.5 py-0.5 rounded-md border border-[var(--border)]/80">
                      {v.ticket}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] tabular-nums">
                    {new Date(v.dataHora).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[var(--text-muted)] bg-[var(--surface)] p-3.5 rounded-xl border border-[var(--border)]/80">
                  <div>
                    <span className="text-[10px] text-[var(--text-subtle)] block">Motorista</span>
                    <strong className="text-[var(--text)]">{v.motoristaNome}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-subtle)] block">Odômetro</span>
                    <strong className="text-[var(--text)] tabular-nums">{v.km.toLocaleString('pt-BR')} km</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-subtle)] block">Combustível</span>
                    <strong className="text-[var(--text)] tabular-nums">{v.nivelCombustivel}%</strong>
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-[var(--text-subtle)] block">Observações</span>
                    <span className="text-[var(--text)] font-medium">{v.observacoesAvarias || 'Sem avarias'}</span>
                  </div>
                </div>

                {/* Os 4 Slots de Foto Pericial Registrados com Viewfinder L */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SLOTS_PERICIAIS.map(slot => {
                    const src = v.fotos[slot.key];
                    if (!src) return null;
                    return (
                      <div
                        key={slot.key}
                        className="bg-[#0B1B2E] p-2 rounded-xl border border-[#22324C] shadow-2xs space-y-1.5 group"
                      >
                        <div className="relative h-28 rounded-lg overflow-hidden bg-[#0B1B2E]">    

                          {/* Metadados Técnicos Simulados */}
                          <div className="absolute top-1.5 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                            <span className="text-[8px] tabular-nums text-[#DCEEFB] bg-[#0B1B2E]/75 px-1.5 py-0.5 rounded border border-white/10">
                              {slot.lente}
                            </span>
                          </div>

                          <img
                            src={src}
                            alt={slot.label}
                            className="w-full h-full object-cover transition duration-500"
                          />

                          {/* Selo SHA-256 */}
                          <div className="absolute bottom-1.5 right-2 z-20 bg-[#0B1B2E]/90 border border-[var(--verde)]/40 text-[#C6E86B] text-[8.5px] tabular-nums font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Lock size={8} /> SHA-256
                          </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                          <span className="text-[11px] font-bold text-white truncate">
                            {slot.label}
                          </span>
                          <span className="text-[9px] tabular-nums text-[var(--brand)]">
                            {slot.tag}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)] border-t border-[var(--border)]/70">
                  <span className="flex items-center gap-1.5 font-medium text-[var(--text)]">
                    <ShieldCheck size={14} className="text-[var(--verde)]" /> Assinatura Criptográfica Selada no Cofre SEJU
                  </span>
                  <span className="tabular-nums text-[10px] font-semibold text-[var(--verde)] bg-[var(--verde-soft)] px-2.5 py-0.5 rounded-md border border-[var(--verde-border)]/80 select-none">
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
        <div className="fixed inset-0 bg-[#0B1B2E]/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-[18px] max-w-md w-full p-6 text-center border border-[var(--border)]/80 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-[var(--verde-soft)] text-[var(--verde)] border border-[var(--verde-border)]/80 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-base font-bold text-[var(--text)]">
              Vistoria Pericial Registrada & Protegida
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">
              Odômetro em <strong>{sucessoModal.km.toLocaleString('pt-BR')} km</strong> e registros fotográficos selados no cofre de segurança.
            </p>

            <div className="p-3.5 bg-[var(--surface-2)]/80 rounded-xl border border-[var(--border)]/80 text-left text-xs tabular-nums space-y-1.5 text-[var(--text-muted)] mb-5">
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Protocolo:</span>
                <strong className="text-[var(--text)]">{sucessoModal.ticket}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Operação:</span>
                <strong className="text-[var(--text)]">{sucessoModal.tipo === 'checkin' ? 'CHAVE LIBERADA' : 'CHAVE DEVOLVIDA'}</strong>
              </div>
              <div className="text-[10px] text-[var(--text)] bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]/80 mt-2 flex items-center justify-between">
                <span className="text-[var(--text-subtle)]">Selo SHA-256:</span>
                <span className="tracking-wider text-[var(--verde)] font-bold select-none">
                  {formatShortHash(sucessoModal.hashAuditoria)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSucessoModal(null)}
              className="w-full py-2.5 bg-[#0B1B2E] text-white text-xs font-semibold rounded-xl hover:bg-[#0B1B2E] transition cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
