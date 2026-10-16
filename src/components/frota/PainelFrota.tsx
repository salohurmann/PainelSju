import React, { useState } from 'react';
import { Veiculo, Agendamento } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { soundFX } from '../../services/soundFx';
import confetti from 'canvas-confetti';
import { 
  Car, 
  Fuel, 
  Gauge, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Search, 
  Wrench,
  FileText,
  X,
  ChevronRight,
  Users
} from 'lucide-react';

interface PainelFrotaProps {
  veiculos: Veiculo[];
  agendamentos: Agendamento[];
  onAdicionarVeiculo: (v: Veiculo) => void;
  onAtualizarVeiculo?: (vId: string, dados: Partial<Veiculo>) => void;
}

export const PainelFrota: React.FC<PainelFrotaProps> = ({
  veiculos,
  agendamentos,
  onAdicionarVeiculo,
  onAtualizarVeiculo
}) => {
  const [modalNovo, setModalNovo] = useState(false);
  const [veiculoInspecionado, setVeiculoInspecionado] = useState<Veiculo | null>(null);
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('');
  const [capacidade, setCapacidade] = useState(5);
  const [kmAtual, setKmAtual] = useState(15000);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelo || !placa) return;

    const novo: Veiculo = {
      id: 'v-' + Date.now(),
      modelo: modelo.trim(),
      placa: placa.trim().toUpperCase(),
      cor: cor.trim() || 'Prata',
      capacidade: Number(capacidade) || 5,
      status: 'disponivel',
      kmAtual: Number(kmAtual) || 0,
      nivelCombustivel: 100,
      ano: 2024
    };

    onAdicionarVeiculo(novo);
    setModalNovo(false);
    setModelo('');
    setPlaca('');
    setCor('');
  };

  const veiculosFiltrados = veiculos.filter(v => {
    const matchStatus = filtroStatus === 'todos' || v.status === filtroStatus;
    const matchBusca = v.modelo.toLowerCase().includes(busca.toLowerCase()) || v.placa.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const totalDisponiveis = veiculos.filter(v => v.status === 'disponivel').length;
  const totalEmMissao = veiculos.filter(v => v.status === 'em_missao').length;
  const totalManutencao = veiculos.filter(v => v.status === 'manutencao').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* Seção 1: Header Executivo & KPI Strip */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Car size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  FROTA PATRIMONIAL SEJU · PARANÁ
                </span>
                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/80">
                  Telemetria Ativa
                </span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5">
                Catálogo Geral de Veículos Oficiais
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Selecione qualquer viatura para inspecionar telemetria, abastecimento e manutenção preventiva.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalNovo(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-2xs transition cursor-pointer self-start sm:self-center shrink-0"
          >
            <Plus size={15} /> Cadastrar Novo Veículo
          </button>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Frota Total</span>
              <span className="text-lg font-semibold text-slate-900 font-mono mt-0.5 block">
                {veiculos.length}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-600">
              <Car size={16} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-emerald-800/80 block">No Pátio (Livres)</span>
              <span className="text-lg font-semibold text-emerald-900 font-mono mt-0.5 block">
                {totalDisponiveis}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200/70 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Em Missão Oficial</span>
              <span className="text-lg font-semibold text-slate-900 font-mono mt-0.5 block">
                {totalEmMissao}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-700">
              <Clock size={16} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-amber-800/80 block">Em Manutenção</span>
              <span className="text-lg font-semibold text-amber-900 font-mono mt-0.5 block">
                {totalManutencao}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white border border-amber-200/70 flex items-center justify-center text-amber-600">
              <Wrench size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Barra de Filtro e Busca Rápida */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'todos', label: 'Todos', count: veiculos.length },
            { id: 'disponivel', label: 'Disponíveis', count: totalDisponiveis },
            { id: 'em_missao', label: 'Em Missão', count: totalEmMissao },
            { id: 'manutencao', label: 'Manutenção', count: totalManutencao }
          ].map(f => {
            const active = filtroStatus === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltroStatus(f.id)}
                className={`px-3.5 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  active
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>{f.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  active ? 'bg-white/15 text-white' : 'bg-slate-200/70 text-slate-700'
                }`}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar modelo ou placa..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Seção 3: Grid de Veículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {veiculosFiltrados.map(v => {
          const pendentes = agendamentos.filter(a => a.veiculoId === v.id && a.status === 'pendente').length;
          const autorizados = agendamentos.filter(a => a.veiculoId === v.id && a.status === 'aprovado').length;

          return (
            <div
              key={v.id}
              onClick={() => {
                soundFX.playClick();
                setVeiculoInspecionado(v);
              }}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:border-slate-300/90 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Topo do Card: Placa e Status */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <PlacaMercosul placa={v.placa} uf="PR" />

                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                    v.status === 'disponivel'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                      : v.status === 'em_missao'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-amber-50 text-amber-800 border-amber-200/80'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      v.status === 'disponivel'
                        ? 'bg-emerald-500'
                        : v.status === 'em_missao'
                        ? 'bg-white'
                        : 'bg-amber-500'
                    }`} />
                    {v.status === 'disponivel' && 'Disponível no Pátio'}
                    {v.status === 'em_missao' && 'Em Missão Oficial'}
                    {v.status === 'manutencao' && 'Em Manutenção'}
                  </span>
                </div>

                {/* Identificação do Modelo */}
                <div className="mt-4 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base tracking-tight group-hover:text-slate-700 transition-colors">
                      {v.modelo}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Cor: {v.cor}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-slate-400" /> {v.capacidade} lugares
                      </span>
                      {v.ano && (
                        <>
                          <span>·</span>
                          <span>Ano {v.ano}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Telemetria Compacta Dividida */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3.5">
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                      <Gauge size={11} /> Odômetro
                    </span>
                    <span className="font-mono font-semibold text-sm text-slate-900 mt-0.5 block">
                      {v.kmAtual.toLocaleString('pt-BR')} km
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
                      <span className="flex items-center gap-1">
                        <Fuel size={11} /> Combustível
                      </span>
                      <span className="font-semibold text-slate-800">{v.nivelCombustivel}%</span>
                    </div>
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          v.nivelCombustivel > 50 
                            ? 'bg-emerald-500' 
                            : v.nivelCombustivel > 20 
                            ? 'bg-amber-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${v.nivelCombustivel}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Demandas: <strong className="text-slate-800 font-mono">{pendentes}</strong></span>
                    <span>·</span>
                    <span>Missões: <strong className="text-slate-800 font-mono">{autorizados}</strong></span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 group-hover:translate-x-0.5 transition-transform">
                    <FileText size={13} className="text-slate-500" />
                    Inspecionar Telemetria
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Adicionar Veículo */}
      {modalNovo && (
        <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200/80 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Car size={16} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Cadastrar Veículo Oficial
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNovo(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Modelo e Versão Oficial *
                </label>
                <input
                  type="text"
                  required
                  value={modelo}
                  onChange={e => setModelo(e.target.value)}
                  placeholder="Ex: Toyota Corolla Sedan 2.0"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Placa (Mercosul) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={placa}
                    onChange={e => setPlaca(e.target.value.toUpperCase())}
                    placeholder="BCB-4A12"
                    className="w-full text-xs font-mono font-semibold px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Cor do Veículo
                  </label>
                  <input
                    type="text"
                    value={cor}
                    onChange={e => setCor(e.target.value)}
                    placeholder="Prata"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Capacidade (Lugares)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={capacidade}
                    onChange={e => setCapacidade(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Km Inicial
                  </label>
                  <input
                    type="number"
                    value={kmAtual}
                    onChange={e => setKmAtual(Number(e.target.value))}
                    className="w-full text-xs font-mono font-semibold px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xs cursor-pointer transition"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal de Telemetria & Ficha Patrimonial */}
      {veiculoInspecionado && (
        <div 
          className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setVeiculoInspecionado(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-xl border border-slate-200/80 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Header com Placa Mercosul */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <PlacaMercosul placa={veiculoInspecionado.placa} uf="PR" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    FICHA PATRIMONIAL & TELEMETRIA
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 leading-tight mt-0.5">
                    {veiculoInspecionado.modelo}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Ano {veiculoInspecionado.ano || 2024} · Cor {veiculoInspecionado.cor} · {veiculoInspecionado.capacidade} lugares
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setVeiculoInspecionado(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer self-start sm:self-auto transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Divisão 1: Status Operacional e Abastecimento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status */}
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Status Operacional no Pátio
                </div>
                <div className="flex gap-1.5">
                  {[
                    { id: 'disponivel', label: 'Disponível' },
                    { id: 'em_missao', label: 'Em Missão' },
                    { id: 'manutencao', label: 'Manutenção' }
                  ].map(st => {
                    const ativo = veiculoInspecionado.status === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          const novoStatus = st.id as Veiculo['status'];
                          setVeiculoInspecionado({ ...veiculoInspecionado, status: novoStatus });
                          if (onAtualizarVeiculo) {
                            onAtualizarVeiculo(veiculoInspecionado.id, { status: novoStatus });
                          }
                        }}
                        className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                          ativo 
                            ? 'bg-slate-900 text-white font-semibold shadow-2xs' 
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Combustível */}
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <span>Nível de Combustível</span>
                  <span className="text-xs text-slate-900 font-semibold">{veiculoInspecionado.nivelCombustivel}%</span>
                </div>
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${veiculoInspecionado.nivelCombustivel}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playSuccess();
                    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
                    setVeiculoInspecionado({ ...veiculoInspecionado, nivelCombustivel: 100 });
                    if (onAtualizarVeiculo) {
                      onAtualizarVeiculo(veiculoInspecionado.id, { nivelCombustivel: 100 });
                    }
                  }}
                  className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/90 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Fuel size={13} className="text-emerald-600" /> Registrar Tanque Cheio (100%)
                </button>
              </div>
            </div>

            {/* Divisão 2: Diagnóstico Preventivo */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                <Wrench size={15} className="text-slate-600" />
                Diagnóstico de Manutenção Preventiva (Detran/PR & SEJU)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Óleo & Filtros</span>
                    <span className="text-[10px] text-slate-400">Próxima revisão aos {veiculoInspecionado.kmAtual + 8200} km</span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                    Em Dia
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Sistema de Freios</span>
                    <span className="text-[10px] text-slate-400">Pastilhas e discos inspecionados</span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                    Conforme
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Pneumáticos & Alinhamento</span>
                    <span className="text-[10px] text-slate-400">Calibragem padrão 32 PSI</span>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    32 PSI
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Licenciamento CRLV-e</span>
                    <span className="text-[10px] text-slate-400">Frota Oficial Estado do Paraná</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    Regular 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Divisão 3: Histórico de Missões */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                <span>Histórico Recente de Missões</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Odômetro: {veiculoInspecionado.kmAtual.toLocaleString('pt-BR')} km
                </span>
              </div>

              {agendamentos.filter(a => a.veiculoId === veiculoInspecionado.id).length === 0 ? (
                <div className="p-4 bg-slate-50/70 rounded-xl text-center text-xs text-slate-400 border border-slate-200/70">
                  Nenhuma viagem registrada no histórico recente para esta viatura.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {agendamentos
                    .filter(a => a.veiculoId === veiculoInspecionado.id)
                    .slice(0, 3)
                    .map(ag => (
                      <div key={ag.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/70 text-xs flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 truncate">{ag.destino}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Condutor: {ag.nome} · {ag.datas.join(', ')}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-medium bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80 shrink-0">
                          {ag.ticket}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setVeiculoInspecionado(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Concluir Inspeção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
