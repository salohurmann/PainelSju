import React, { useState } from 'react';
import { Veiculo, Agendamento } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { PainelOdometroCombustivel } from '../ui/PainelOdometroCombustivel';
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
  Users,
  ShieldCheck,
  Activity,
  Sparkles
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
      cor: cor.trim() || 'Prata Metálico',
      capacidade: Number(capacidade) || 5,
      status: 'disponivel',
      kmAtual: Number(kmAtual) || 0,
      nivelCombustivel: 100,
      ano: 2025
    };

    soundFX.playSuccess();
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
      {/* Seção 1: Header Showroom Executivo & KPI Strip */}
      <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] p-5 sm:p-6 border border-[var(--border)] space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex items-center justify-center shrink-0 shadow-[0_8px_20px_-4px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] border border-slate-700/80">
              <Car size={20} className="text-sky-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 font-bold">
                  SHOWROOM PATRIMONIAL SEJU · GOVERNO DO PARANÁ
                </span>
                <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
                  CAN-BUS Telemetria Ativa
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                Catálogo Executivo de Viaturas Oficiais
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspecione o cluster digital de odômetro, sonda graduada de combustível e prontuário preventivo Detran/PR.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setModalNovo(true);
            }}
            className="relative overflow-hidden bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-slate-900 hover:to-slate-800 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_8px_20px_-4px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] border border-slate-700/80 transition cursor-pointer self-start sm:self-center shrink-0 active:scale-[0.99]"
          >
            <span className="absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-sky-400/60 to-transparent" />
            <Plus size={15} className="text-sky-400" /> Incorporar Viatura à Frota
          </button>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-2)]/60 border border-[var(--border)] flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block">
                Frota Patrimonial
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold text-[var(--text)] tabular-nums">
                  {String(veiculos.length).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">UNIDADES</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text)]">
              <Car size={17} />
            </div>
          </div>

          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-2)]/60 border border-[var(--border)] flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                No Pátio (Prontas)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold text-[var(--text)] tabular-nums">
                  {String(totalDisponiveis).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-[var(--success)] font-medium">LIVRES</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--success)]">
              <CheckCircle2 size={17} />
            </div>
          </div>

          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-2)]/60 border border-[var(--border)] flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                Em Missão Oficial
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold text-[var(--text)] tabular-nums">
                  {String(totalEmMissao).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-[var(--brand)] font-medium">EM TRÁFEGO</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--brand)]">
              <Clock size={17} />
            </div>
          </div>

          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-2)]/60 border border-[var(--border)] flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                Box de Manutenção
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-bold text-[var(--text)] tabular-nums">
                  {String(totalManutencao).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-[var(--warning)] font-medium">OFICINA</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--warning)]">
              <Wrench size={17} />
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Barra de Filtro Elegante e Busca Rápida */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgb(15,23,42,0.03)] text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
          {[
            { id: 'todos', label: 'Catálogo Completo', count: veiculos.length, dot: 'bg-slate-400' },
            { id: 'disponivel', label: 'Disponíveis', count: totalDisponiveis, dot: 'bg-emerald-500 shadow-[0_0_6px_#10b981]' },
            { id: 'em_missao', label: 'Em Missão', count: totalEmMissao, dot: 'bg-sky-400 shadow-[0_0_6px_#38bdf8]' },
            { id: 'manutencao', label: 'Manutenção', count: totalManutencao, dot: 'bg-amber-500 shadow-[0_0_6px_#f59e0b]' }
          ].map(f => {
            const active = filtroStatus === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setFiltroStatus(f.id);
                }}
                className={`px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />
                <span>{f.label}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                  active ? 'bg-white/15 text-sky-300' : 'bg-slate-200/80 text-slate-700'
                }`}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Filtrar por modelo, prefixo ou placa Mercosul..."
            className="w-full pl-9 pr-14 py-2 bg-slate-50/90 border border-slate-200/90 rounded-xl outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-slate-900 focus:bg-white transition font-medium text-slate-900"
          />
          {busca ? (
            <button
              type="button"
              onClick={() => setBusca('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            >
              <X size={14} />
            </button>
          ) : (
            <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              PR
            </span>
          )}
        </div>
      </div>

      {/* Seção 3: Grid Showroom de Veículos com Cantoneiras Técnicas e Barras Graduadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {veiculosFiltrados.map(v => {
          const pendentes = agendamentos.filter(a => a.veiculoId === v.id && a.status === 'pendente').length;
          const autorizados = agendamentos.filter(a => a.veiculoId === v.id && a.status === 'aprovado').length;
          const autonomiaKm = Math.round((v.nivelCombustivel / 100) * 580);
          const totalSegs = 12;
          const segsAtivos = Math.round((v.nivelCombustivel / 100) * totalSegs);

          return (
            <div
              key={v.id}
              onClick={() => {
                soundFX.playClick();
                setVeiculoInspecionado(v);
              }}
              className="relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_4px_20px_rgb(15,23,42,0.03)] hover:border-slate-400 hover:shadow-[0_16px_36px_-10px_rgba(15,23,42,0.12)] transition-all duration-300 flex flex-col justify-between cursor-pointer group overflow-hidden"
            >
              {/* Faixa Superior de Status Luminoso */}
              <div
                className={`absolute inset-x-0 top-0 h-1 transition-all ${
                  v.status === 'disponivel'
                    ? 'bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-600'
                    : v.status === 'em_missao'
                    ? 'bg-linear-to-r from-slate-900 via-sky-500 to-slate-900'
                    : 'bg-linear-to-r from-amber-500 via-orange-400 to-amber-600'
                }`}
              />

              <div>
                {/* Topo do Card: Placa Mercosul e Status */}
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <PlacaMercosul placa={v.placa} uf="PR" />

                  <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border flex items-center gap-2 shadow-2xs ${
                    v.status === 'disponivel'
                      ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200'
                      : v.status === 'em_missao'
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-amber-50/90 text-amber-900 border-amber-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      v.status === 'disponivel'
                        ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse'
                        : v.status === 'em_missao'
                        ? 'bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse'
                        : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                    }`} />
                    {v.status === 'disponivel' && 'Disponível no Pátio'}
                    {v.status === 'em_missao' && 'Em Missão Oficial'}
                    {v.status === 'manutencao' && 'Box de Manutenção'}
                  </span>
                </div>

                {/* Identificação Patrimonial do Modelo */}
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                        PATRIMÔNIO SEJU #{v.id.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight group-hover:text-sky-700 transition-colors mt-0.5">
                      {v.modelo}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                        Cor: <strong className="text-slate-800">{v.cor}</strong>
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80 flex items-center gap-1">
                        <Users size={11} className="text-slate-500" /> {v.capacidade} assentos
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80">
                        MOD {v.ano || 2024}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cluster Compacto de Telemetria (Odômetro + Barra de Combustível Graduada) */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 bg-[#0B0F19] text-white rounded-xl border border-slate-800 shadow-inner">
                  {/* Odômetro Digital */}
                  <div className="sm:col-span-5 flex flex-col justify-between sm:border-r border-slate-800 sm:pr-3">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Gauge size={11} className="text-sky-400" /> Hodômetro Oficial
                    </span>
                    <div className="font-mono font-black text-base text-white tracking-wider mt-1 flex items-baseline gap-1">
                      {String(v.kmAtual).padStart(6, '0').replace(/(\d{3})(\d{3})/, '$1.$2')}
                      <span className="text-[10px] text-sky-400 font-bold">KM</span>
                    </div>
                  </div>

                  {/* Barra de Combustível Graduada em 12 Segmentos Luminosos */}
                  <div className="sm:col-span-7 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Fuel size={11} className="text-emerald-400" /> Sonda Tanque
                      </span>
                      <span className="font-bold text-slate-200">
                        {v.nivelCombustivel}% <span className="text-slate-500">·</span> ~{autonomiaKm} km
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-2 p-1 bg-slate-950 rounded-md border border-slate-800/90">
                      {Array.from({ length: totalSegs }).map((_, idx) => {
                        const ativo = idx < segsAtivos;
                        const cor =
                          v.nivelCombustivel <= 20
                            ? '#EF4444'
                            : v.nivelCombustivel <= 45
                            ? '#F59E0B'
                            : '#10B981';
                        return (
                          <div
                            key={idx}
                            className="flex-1 h-2 rounded-[1.5px] transition-all duration-300"
                            style={{
                              backgroundColor: ativo ? cor : '#1E293B',
                              opacity: ativo ? 1 : 0.35,
                              boxShadow: ativo ? `0 0 6px ${cor}80` : 'none'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
                    <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
                      Fila: <strong className="text-slate-900 font-mono">{pendentes}</strong>
                    </span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
                      Ativas: <strong className="text-emerald-700 font-mono">{autorizados}</strong>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    <Activity size={13} className="text-sky-500" />
                    Abrir Cockpit & Ficha
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Impecável: Incorporar Novo Veículo com Preview Ao Vivo da Placa Mercosul */}
      {modalNovo && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setModalNovo(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Faixa superior executiva & Cantoneiras */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-slate-900 via-sky-500 to-emerald-500" />
            <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-slate-300 pointer-events-none" />
            <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-slate-300 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center shadow-2xs">
                  <Car size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                    REGISTRO PATRIMONIAL DETRAN/PR
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Incorporar Viatura Oficial à Frota
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovo(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Preview Ao Vivo da Placa Estampada */}
            <div className="mb-5 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between gap-4 shadow-inner">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold flex items-center gap-1">
                  <Sparkles size={11} /> Estamparia Digital Ao Vivo
                </span>
                <div className="text-xs font-bold text-white mt-1 truncate max-w-[200px]">
                  {modelo.trim() || 'Nova Viatura Oficial SEJU'}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {cor.trim() || 'Prata Metálico'} · {capacidade} Lugares · {kmAtual.toLocaleString('pt-BR')} km
                </div>
              </div>
              <PlacaMercosul placa={placa || 'SEJ2A26'} uf="PR" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Marca, Modelo e Versão Oficial *
                </label>
                <input
                  type="text"
                  required
                  value={modelo}
                  onChange={e => setModelo(e.target.value)}
                  placeholder="Ex: Toyota Corolla Altis Hybrid 1.8"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-slate-900 focus:bg-white outline-hidden font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Placa Mercosul *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={placa}
                    onChange={e => setPlaca(e.target.value.toUpperCase())}
                    placeholder="BCB-4A12"
                    className="w-full text-xs font-mono font-bold px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-slate-900 focus:bg-white outline-hidden text-center uppercase tracking-widest text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Pintura / Cor Oficial
                  </label>
                  <input
                    type="text"
                    value={cor}
                    onChange={e => setCor(e.target.value)}
                    placeholder="Prata Metálico"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-slate-900 focus:bg-white outline-hidden font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Lotação (Assentos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={capacidade}
                    onChange={e => setCapacidade(Number(e.target.value))}
                    className="w-full text-xs font-mono font-semibold px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-slate-900 focus:bg-white outline-hidden text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Hodômetro Inicial (KM)
                  </label>
                  <input
                    type="number"
                    value={kmAtual}
                    onChange={e => setKmAtual(Number(e.target.value))}
                    className="w-full text-xs font-mono font-semibold px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-slate-900 focus:bg-white outline-hidden text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-[0_6px_16px_rgba(15,23,42,0.25)] cursor-pointer transition flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} className="text-sky-400" />
                  Confirmar Incorporação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Inspeção: Cockpit Digital & Ficha Patrimonial */}
      {veiculoInspecionado && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setVeiculoInspecionado(null)}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto space-y-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Header com Placa Mercosul */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <PlacaMercosul placa={veiculoInspecionado.placa} uf="PR" />
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                    FICHA PATRIMONIAL & COCKPIT DE TELEMETRIA
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">
                    {veiculoInspecionado.modelo}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">
                    Ano {veiculoInspecionado.ano || 2024} · Cor {veiculoInspecionado.cor} · {veiculoInspecionado.capacidade} lugares
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setVeiculoInspecionado(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer self-start sm:self-auto transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Cluster Digital Automotivo de Luxo Integrado */}
            <PainelOdometroCombustivel
              kmAtual={veiculoInspecionado.kmAtual}
              nivelCombustivel={veiculoInspecionado.nivelCombustivel}
              interativo={true}
              onChangeKm={novoKm => {
                setVeiculoInspecionado({ ...veiculoInspecionado, kmAtual: novoKm });
                if (onAtualizarVeiculo) {
                  onAtualizarVeiculo(veiculoInspecionado.id, { kmAtual: novoKm });
                }
              }}
              onChangeCombustivel={novoNivel => {
                setVeiculoInspecionado({ ...veiculoInspecionado, nivelCombustivel: novoNivel });
                if (onAtualizarVeiculo) {
                  onAtualizarVeiculo(veiculoInspecionado.id, { nivelCombustivel: novoNivel });
                }
              }}
            />

            {/* Divisão 1: Controle de Status Operacional e Abastecimento Rápido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status */}
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Status Operacional no Pátio SEJU
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
                        className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          ativo 
                            ? 'bg-slate-900 text-white shadow-xs' 
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ação Rápida de Abastecimento Oficial */}
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  <span>Ordem de Abastecimento (Cartão Frota PR)</span>
                  <span className="text-xs text-emerald-700 font-bold">{veiculoInspecionado.nivelCombustivel}%</span>
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
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Fuel size={14} className="text-emerald-400" /> Atestar Tanque Cheio (100% · 55L)
                </button>
              </div>
            </div>

            {/* Divisão 2: Diagnóstico Preventivo */}
            <div className="p-4.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wrench size={15} className="text-slate-700" />
                  Diagnóstico de Manutenção Preventiva (Detran/PR & SEJU)
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  LAUDO TÉCNICO OK
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Lubrificante & Filtros Sintéticos</span>
                    <span className="text-[10px] font-mono text-slate-400">Próxima revisão: {(veiculoInspecionado.kmAtual + 8200).toLocaleString('pt-BR')} km</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Em Dia
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Sistema de Freios ABS/EBD</span>
                    <span className="text-[10px] font-mono text-slate-400">Pastilhas e discos inspecionados</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Conforme
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Pneumáticos & Geometria</span>
                    <span className="text-[10px] font-mono text-slate-400">Pressão nominal telemetria</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                    32 PSI
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Licenciamento Oficial CRLV-e</span>
                    <span className="text-[10px] font-mono text-slate-400">Frota Patrimonial Estado do Paraná</span>
                  </div>
                  <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={11} /> Regular 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Divisão 3: Histórico de Missões */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-600" />
                  Diário de Bordo Recente da Viatura
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Hodômetro: {veiculoInspecionado.kmAtual.toLocaleString('pt-BR')} km
                </span>
              </div>

              {agendamentos.filter(a => a.veiculoId === veiculoInspecionado.id).length === 0 ? (
                <div className="p-4 bg-slate-50/70 rounded-xl text-center text-xs text-slate-400 border border-slate-200/70">
                  Nenhuma missão registrada no diário de bordo recente para esta viatura.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {agendamentos
                    .filter(a => a.veiculoId === veiculoInspecionado.id)
                    .slice(0, 3)
                    .map(ag => (
                      <div key={ag.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{ag.destino}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Condutor: <strong className="text-slate-700">{ag.nome}</strong> · {ag.datas.join(', ')}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-white text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/90 shrink-0 shadow-2xs">
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
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Encerrar Inspeção de Telemetria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

