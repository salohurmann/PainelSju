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
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Search, 
  Filter,
  Wrench,
  Sparkles,
  Check,
  FileText,
  X,
  ChevronRight,
  Info
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* BARRA DE GESTÃO E CADASTRO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-gov-card">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0072BB]">
            FROTA PATRIMONIAL SEJU · PARANÁ
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
            <Car size={24} className="text-[#0072BB]" />
            Catálogo Geral de Veículos Cadastrados
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Clique em qualquer veículo para carregar suas informações no simulador de telemetria acima.
          </p>
        </div>

        <button
          onClick={() => setModalNovo(true)}
          className="bg-[#0072BB] hover:bg-[#00538a] text-white text-xs font-black px-5 py-3 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Cadastrar Novo Veículo
        </button>
      </div>

      {/* Barra de Filtro e Busca Rápida */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 text-xs">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por modelo ou placa..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-hidden focus:ring-2 focus:ring-[#0072BB]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'disponivel', label: 'Disponíveis' },
            { id: 'em_missao', label: 'Em Missão' },
            { id: 'manutencao', label: 'Em Manutenção' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
                filtroStatus === f.id
                  ? 'bg-[#0072BB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Veículos com Placas Mercosul Reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {veiculosFiltrados.map(v => {
          const emUso = v.status === 'em_missao';
          const pendentes = agendamentos.filter(a => a.veiculoId === v.id && a.status === 'pendente').length;
          const autorizados = agendamentos.filter(a => a.veiculoId === v.id && a.status === 'aprovado').length;

          return (
            <div
              key={v.id}
              onClick={() => {
                soundFX.playClick();
                setVeiculoInspecionado(v);
              }}
              className={`bg-white rounded-3xl p-6 border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between cursor-pointer group hover:border-[#0072BB] ${
                emUso 
                  ? 'border-blue-400 ring-2 ring-blue-100' 
                  : 'border-slate-200/90'
              }`}
            >
              <div>
                {/* Topo do Card com Placa Mercosul e Status */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <PlacaMercosul placa={v.placa} uf="PR" />

                  <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-2xs ${
                    v.status === 'disponivel'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : v.status === 'em_missao'
                      ? 'bg-blue-100 text-[#0072BB] border border-blue-200 animate-pulse'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {v.status === 'disponivel' && '● Disponível no Pátio'}
                    {v.status === 'em_missao' && '● Em Missão Oficial'}
                    {v.status === 'manutencao' && '● Em Manutenção'}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#0072BB] transition-colors">
                  {v.modelo}
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  Cor: {v.cor} · Capacidade: {v.capacidade} passageiros {v.ano ? `· Ano ${v.ano}` : ''}
                </div>
              </div>

              {/* Instrumentos de Bordo do Veículo */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                {/* Odômetro */}
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <Gauge size={15} className="text-[#0072BB]" /> Odômetro Registrado
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {v.kmAtual.toLocaleString('pt-BR')} km
                  </span>
                </div>

                {/* Combustível */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
                      <Fuel size={15} className="text-[#0072BB]" /> Nível do Tanque
                    </span>
                    <span className="font-mono font-bold text-xs text-[#0072BB]">{v.nivelCombustivel}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
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

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Demandas: <strong className="text-amber-600">{pendentes}</strong></span>
                  <span>Missões: <strong className="text-emerald-700">{autorizados}</strong></span>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#0072BB] group-hover:text-[#00538A] border-t border-slate-200/70">
                  <span className="flex items-center gap-1.5">
                    <FileText size={13} /> Ficha Patrimonial Completa
                  </span>
                  <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Adicionar Veículo */}
      {modalNovo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Car size={20} className="text-[#0072BB]" />
              Cadastrar Veículo Oficial na Frota
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modelo e Versão Oficial *
                </label>
                <input
                  type="text"
                  required
                  value={modelo}
                  onChange={e => setModelo(e.target.value)}
                  placeholder="Ex: Toyota Corolla Sedan 2.0"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0072BB] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Placa (Mercosul) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={placa}
                    onChange={e => setPlaca(e.target.value.toUpperCase())}
                    placeholder="BCB-4A12"
                    className="w-full text-xs font-mono font-bold p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0072BB] outline-hidden text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cor do Veículo
                  </label>
                  <input
                    type="text"
                    value={cor}
                    onChange={e => setCor(e.target.value)}
                    placeholder="Prata"
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0072BB] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lugares
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={capacidade}
                    onChange={e => setCapacidade(Number(e.target.value))}
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0072BB] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Km Inicial do Odômetro
                  </label>
                  <input
                    type="number"
                    value={kmAtual}
                    onChange={e => setKmAtual(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0072BB] outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#0072BB] hover:bg-[#00538a] rounded-xl shadow-xs cursor-pointer"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Ficha Patrimonial e Manutenção Preventiva do Veículo */}
      {veiculoInspecionado && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setVeiculoInspecionado(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Header com Placa Mercosul e Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <PlacaMercosul placa={veiculoInspecionado.placa} uf="PR" />
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {veiculoInspecionado.modelo}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Patrimônio Oficial SEJU · Ano {veiculoInspecionado.ano || 2024} · Cor {veiculoInspecionado.cor}
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setVeiculoInspecionado(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer self-start sm:self-auto transition"
              >
                ✕
              </button>
            </div>

            {/* Ações Rápidas: Alterar Status e Abastecer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status do Veículo */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status Operacional no Pátio
                </div>
                <div className="flex gap-1.5">
                  {[
                    { id: 'disponivel', label: 'Disponível', cor: 'bg-emerald-600' },
                    { id: 'em_missao', label: 'Em Missão', cor: 'bg-[#0072BB]' },
                    { id: 'manutencao', label: 'Manutenção', cor: 'bg-amber-600' }
                  ].map(st => {
                    const ativo = veiculoInspecionado.status === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          const novoStatus = st.id as any;
                          setVeiculoInspecionado({ ...veiculoInspecionado, status: novoStatus });
                          if (onAtualizarVeiculo) {
                            onAtualizarVeiculo(veiculoInspecionado.id, { status: novoStatus });
                          }
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          ativo 
                            ? `${st.cor} text-white shadow-xs` 
                            : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tanque de Combustível com Abastecimento */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Nível do Tanque</span>
                  <span className="font-mono text-xs text-[#0072BB] font-black">{veiculoInspecionado.nivelCombustivel}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
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
                  className="w-full py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Fuel size={14} /> Abastecer Tanque (100%)
                </button>
              </div>
            </div>

            {/* Checklist de Saúde e Manutenção Preventiva */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Wrench size={16} className="text-[#0072BB]" />
                Diagnóstico de Manutenção Preventiva (Detran/PR & SEJU)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Óleo & Filtros</span>
                    <span className="text-[10px] text-slate-400">Próxima revisão aos {veiculoInspecionado.kmAtual + 8200} km</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Em Dia
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Pastilhas de Freio</span>
                    <span className="text-[10px] text-slate-400">Espessura de disco 100% conforme</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Conforme
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Calibragem dos Pneus</span>
                    <span className="text-[10px] text-slate-400">32 PSI / Alinhamento digital</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    32 PSI
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Documento CRLV-e</span>
                    <span className="text-[10px] text-slate-400">Exercício 2026 Regularizado PR</span>
                  </div>
                  <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    Digital
                  </span>
                </div>
              </div>
            </div>

            {/* Histórico Recente de Viagens deste Veículo */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Últimas Missões Realizadas por Este Veículo</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Total Odômetro: {veiculoInspecionado.kmAtual.toLocaleString('pt-BR')} km
                </span>
              </div>

              {agendamentos.filter(a => a.veiculoId === veiculoInspecionado.id).length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 border border-slate-200">
                  Nenhuma viagem registrada no histórico recente para esta viatura.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {agendamentos
                    .filter(a => a.veiculoId === veiculoInspecionado.id)
                    .slice(0, 3)
                    .map(ag => (
                      <div key={ag.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{ag.destino}</div>
                          <div className="text-[10px] text-slate-500">Condutor: {ag.nome} · {ag.datas.join(', ')}</div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                          {ag.ticket}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setVeiculoInspecionado(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
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
