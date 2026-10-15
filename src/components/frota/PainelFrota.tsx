import React, { useState } from 'react';
import { Veiculo, Agendamento } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { Car, Fuel, Gauge, Plus, CheckCircle2, AlertCircle, Clock, ShieldCheck, Search, Filter } from 'lucide-react';

interface PainelFrotaProps {
  veiculos: Veiculo[];
  agendamentos: Agendamento[];
  onAdicionarVeiculo: (v: Veiculo) => void;
}

export const PainelFrota: React.FC<PainelFrotaProps> = ({
  veiculos,
  agendamentos,
  onAdicionarVeiculo
}) => {
  const [modalNovo, setModalNovo] = useState(false);
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
              className={`bg-white rounded-3xl p-6 border transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between ${
                emUso 
                  ? 'border-blue-400 ring-2 ring-blue-100' 
                  : 'border-slate-200/90 hover:border-slate-300'
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

                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
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
                  <span>Demandas Pendentes: <strong className="text-amber-600">{pendentes}</strong></span>
                  <span>Missões Concluídas: <strong className="text-emerald-700">{autorizados}</strong></span>
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
    </div>
  );
};
