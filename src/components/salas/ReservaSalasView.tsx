import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Users, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  Monitor, 
  Video, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Filter,
  Coffee,
  Mic,
  Laptop,
  Trash2,
  CalendarDays,
  CheckSquare,
  X,
  Info
} from 'lucide-react';
import { Usuario } from '../../types';
import confetti from 'canvas-confetti';
import { soundFX } from '../../services/soundFx';

export interface Reserva {
  id: string;
  salaId: string;
  salaNome: string;
  responsavel: string;
  motivo: string;
  data: string;
  horaInicio: number; // ex: 9 (09:00)
  horaFim: number;    // ex: 12 (12:00)
  recursosExtras?: string[];
}

const RESERVAS_INICIAIS: Reserva[] = [
  {
    id: 'res-1',
    salaId: 's1',
    salaNome: 'Auditório Principal SEJU',
    responsavel: 'Dra. Maria Helena (Chefe de Gabinete)',
    motivo: 'Abertura da Semana de Direitos Humanos',
    data: '2026-10-16',
    horaInicio: 9,
    horaFim: 12,
    recursosExtras: ['Serviço de Copa (Café & Água)', 'Gravação em Vídeo / Ata Digital']
  },
  {
    id: 'res-2',
    salaId: 's2',
    salaNome: 'Sala de Reunião do Gabinete',
    responsavel: 'Carlos Silveira',
    motivo: 'Alinhamento Conselho Tutelar',
    data: '2026-10-16',
    horaInicio: 14,
    horaFim: 16,
    recursosExtras: ['Kit Videoconferência Teams']
  },
  {
    id: 'res-3',
    salaId: 's3',
    salaNome: 'Sala Técnica de Conciliação',
    responsavel: 'Juliana Mendes',
    motivo: 'Audiência de Mediação Comunitária',
    data: '2026-10-16',
    horaInicio: 10,
    horaFim: 11,
    recursosExtras: []
  },
  {
    id: 'res-4',
    salaId: 's1',
    salaNome: 'Auditório Principal SEJU',
    responsavel: 'Superintendência de Direitos Humanos',
    motivo: 'Palestra de Enfrentamento à Violência Escolar',
    data: '2026-10-19',
    horaInicio: 14,
    horaFim: 17,
    recursosExtras: ['Serviço de Copa (Café & Água)', 'Suporte Técnico Presencial']
  }
];

interface ReservaSalasViewProps {
  currentUser: Usuario;
  onVoltarHub: () => void;
}

const DIAS_RAPIDOS = [
  { data: '2026-10-16', rotulo: 'Hoje', diaSemana: 'Sex 16/10' },
  { data: '2026-10-17', rotulo: 'Sábado', diaSemana: 'Sáb 17/10' },
  { data: '2026-10-19', rotulo: 'Segunda', diaSemana: 'Seg 19/10' },
  { data: '2026-10-20', rotulo: 'Terça', diaSemana: 'Ter 20/10' },
  { data: '2026-10-21', rotulo: 'Quarta', diaSemana: 'Qua 21/10' },
  { data: '2026-10-22', rotulo: 'Quinta', diaSemana: 'Qui 22/10' },
  { data: '2026-10-23', rotulo: 'Sexta', diaSemana: 'Sex 23/10' }
];

export const ReservaSalasView: React.FC<ReservaSalasViewProps> = ({ currentUser, onVoltarHub }) => {
  const [dataSelecionada, setDataSelecionada] = useState('2026-10-16');
  const [reservas, setReservas] = useState<Reserva[]>(RESERVAS_INICIAIS);
  const [modalNovo, setModalNovo] = useState(false);
  const [salaId, setSalaId] = useState('s1');
  const [horaInicio, setHoraInicio] = useState(14);
  const [horaFim, setHoraFim] = useState(16);
  const [motivo, setMotivo] = useState('');
  const [conflitoAviso, setConflitoAviso] = useState<string | null>(null);
  const [filtroEquip, setFiltroEquip] = useState<string>('todos');
  const [hoverReserva, setHoverReserva] = useState<Reserva | null>(null);

  // Modal de Detalhes / Cancelamento de Reserva Existente
  const [reservaInspecionada, setReservaInspecionada] = useState<Reserva | null>(null);

  // Checklist de Recursos Extras
  const [recursoCafe, setRecursoCafe] = useState(true);
  const [recursoGravacao, setRecursoGravacao] = useState(false);
  const [recursoSuporteTI, setRecursoSuporteTI] = useState(true);
  const [recursoHibrido, setRecursoHibrido] = useState(false);

  const salas = [
    { 
      id: 's1', 
      nome: 'Auditório Principal SEJU', 
      cap: 120, 
      layout: 'Formato Platéia / Teatro',
      equip: 'Projetor 4K, 4 mics sem fio, ar central', 
      cor: 'bg-indigo-600', 
      hasVideo: true, 
      hasProjetor: true 
    },
    { 
      id: 's2', 
      nome: 'Sala de Reunião do Gabinete', 
      cap: 18, 
      layout: 'Mesa Oval Executiva em U',
      equip: 'Kit Videoconferência Teams, TV 75"', 
      cor: 'bg-emerald-600', 
      hasVideo: true, 
      hasProjetor: false 
    },
    { 
      id: 's3', 
      nome: 'Sala Técnica de Conciliação', 
      cap: 8, 
      layout: 'Mesa Redonda Mediação',
      equip: 'Quadro branco, notebook apoio, ar', 
      cor: 'bg-amber-600', 
      hasVideo: false, 
      hasProjetor: false 
    },
    { 
      id: 's4', 
      nome: 'Laboratório de Treinamento', 
      cap: 35, 
      layout: '20 Estações de Trabalho com PC',
      equip: '20 computadores para capacitação', 
      cor: 'bg-sky-600', 
      hasVideo: false, 
      hasProjetor: true 
    }
  ];

  // Horários de expediente: 08:00 às 18:00
  const horas = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  // Checar colisão em tempo real
  const checarColisao = (sId: string, hIni: number, hFim: number) => {
    return reservas.find(r => 
      r.salaId === sId && 
      r.data === dataSelecionada && 
      ((hIni >= r.horaInicio && hIni < r.horaFim) || 
       (hFim > r.horaInicio && hFim <= r.horaFim) ||
       (hIni <= r.horaInicio && hFim >= r.horaFim))
    );
  };

  const colisaoAtual = checarColisao(salaId, horaInicio, horaFim);

  const handleSalvarReserva = (e: React.FormEvent) => {
    e.preventDefault();
    setConflitoAviso(null);

    if (horaInicio >= horaFim) {
      setConflitoAviso('O horário de término deve ser após o horário de início.');
      return;
    }

    const choque = checarColisao(salaId, horaInicio, horaFim);
    if (choque) {
      setConflitoAviso(`⚠️ Choque de horário com "${choque.motivo}" (${choque.responsavel}) das ${choque.horaInicio}h às ${choque.horaFim}h!`);
      return;
    }

    const salaObj = salas.find(s => s.id === salaId);

    const extras: string[] = [];
    if (recursoCafe) extras.push('Serviço de Copa (Café & Água)');
    if (recursoGravacao) extras.push('Gravação em Vídeo / Ata Digital');
    if (recursoSuporteTI) extras.push('Suporte Técnico Presencial');
    if (recursoHibrido) extras.push('Link Híbrido Teams / Meet PR');

    const nova: Reserva = {
      id: 'res-' + Date.now(),
      salaId,
      salaNome: salaObj?.nome || '',
      responsavel: currentUser.nome,
      motivo: motivo.trim() || 'Reunião de Trabalho e Alinhamento da SEJU',
      data: dataSelecionada,
      horaInicio,
      horaFim,
      recursosExtras: extras
    };

    setReservas([...reservas, nova]);
    setModalNovo(false);
    setMotivo('');
    soundFX.playSuccess();

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Cancelar ou Liberar Horário
  const handleCancelarReserva = (reservaId: string) => {
    soundFX.playClick();
    setReservas(prev => prev.filter(r => r.id !== reservaId));
    setReservaInspecionada(null);
  };

  // Clique direto na célula do horário da timeline para abrir modal com horário pré-selecionado
  const handleCelulaClick = (sId: string, hora: number) => {
    soundFX.playClick();
    setSalaId(sId);
    setHoraInicio(hora);
    setHoraFim(Math.min(18, hora + 2));
    setModalNovo(true);
  };

  const salasFiltradas = salas.filter(s => {
    if (filtroEquip === 'video') return s.hasVideo;
    if (filtroEquip === 'projetor') return s.hasProjetor;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Barra de Topo do Módulo */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <button onClick={onVoltarHub} className="hover:text-[#0072BB] font-semibold cursor-pointer">
              ← Central de Aplicativos
            </button>
            <span>/</span>
            <span className="font-bold text-slate-800">Reserva de Salas</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <CalendarIcon size={26} className="text-emerald-700" />
            Régua Cronológica Interativa & Bloqueio Anti-Colisão
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualize as 10 horas de expediente das salas e auditório. Clique diretamente em um intervalo livre na régua para agendar ou em uma reserva para inspecionar.
          </p>
        </div>

        <button
          onClick={() => {
            soundFX.playClick();
            setModalNovo(true);
          }}
          className="bg-[#009B54] hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-emerald-700/20 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} /> Reservar Horário
        </button>
      </div>

      {/* 1. SELETOR RÁPIDO DE DIAS ÚTEIS (PRÓXIMOS 7 DIAS) */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-slate-200">
          <CalendarDays size={18} className="text-[#0072BB]" />
          <span className="text-xs font-black text-slate-800 hidden sm:inline">Data da Agenda:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {DIAS_RAPIDOS.map(d => {
            const isSelected = dataSelecionada === d.data;
            const qtdNoDia = reservas.filter(r => r.data === d.data).length;

            return (
              <button
                key={d.data}
                onClick={() => {
                  soundFX.playClick();
                  setDataSelecionada(d.data);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'bg-[#0072BB] text-white shadow-xs' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{d.diaSemana}</span>
                {qtdNoDia > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white text-[#0072BB]' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {qtdNoDia}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Input customizado de data */}
        <input
          type="date"
          value={dataSelecionada}
          onChange={e => setDataSelecionada(e.target.value)}
          className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-hidden shrink-0 cursor-pointer"
        />
      </div>

      {/* Barra de Filtro de Recursos */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Filtrar Espaço:
          </span>
          <div className="flex gap-1.5">
            {[
              { id: 'todos', label: 'Todos os Espaços' },
              { id: 'video', label: 'Com Videoconferência Teams' },
              { id: 'projetor', label: 'Com Projetor 4K' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  soundFX.playClick();
                  setFiltroEquip(f.id);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs ${
                  filtroEquip === f.id
                    ? 'bg-[#0072BB] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Horário Livre (Clique para agendar)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-linear-to-r from-[#00538A] to-[#0072BB]" /> Reunião Agendada (Clique para detalhes)
          </span>
        </div>
      </div>

      {/* A RÉGUA CRONOLÓGICA INTERATIVA 24H (08h às 18h) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-gov-card overflow-x-auto space-y-4">
        
        {/* Cabeçalho de Horas da Régua */}
        <div className="min-w-[800px]">
          <div className="grid grid-cols-12 gap-2 text-center text-xs font-mono font-black text-slate-400 border-b border-slate-200 pb-3">
            <div className="col-span-3 text-left pl-2 font-sans text-slate-800 text-xs">
              SALA & CAPACIDADE
            </div>
            {horas.slice(0, 10).map(h => (
              <div key={h} className="col-span-1 text-center bg-slate-50 py-1 rounded-md border border-slate-100">
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Linhas das Salas com Horários */}
          <div className="divide-y divide-slate-100">
            {salasFiltradas.map((s) => {
              const reservasDaSala = reservas.filter(r => r.salaId === s.id && r.data === dataSelecionada);
              const estaOcupadaAgora = reservasDaSala.some(r => 10 >= r.horaInicio && 10 < r.horaFim);

              return (
                <div key={s.id} className="py-4.5 hover:bg-slate-50/60 transition rounded-xl px-1">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    
                    {/* Informações da Sala (3 Colunas) */}
                    <div className="col-span-3 pr-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-md ${s.cor} shrink-0`} />
                        <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                          {s.nome}
                        </h4>
                      </div>
                      
                      <div className="text-[10px] text-slate-500 font-medium">
                        {s.layout} · <span className="font-bold text-slate-700">{s.cap} pessoas</span>
                      </div>

                      {/* Status de Disponibilidade em Tempo Real */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className={`w-2 h-2 rounded-full ${estaOcupadaAgora ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className={`text-[10px] font-bold ${estaOcupadaAgora ? 'text-amber-800' : 'text-emerald-700'}`}>
                          {estaOcupadaAgora ? 'Em uso no momento' : 'Disponível agora'}
                        </span>
                      </div>
                    </div>

                    {/* Régua de Horas da Sala (9 Colunas) com Blocos Agendados */}
                    <div className="col-span-9 grid grid-cols-10 gap-1.5 h-16 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/80 relative">
                      
                      {/* Células de Horário Livres */}
                      {horas.slice(0, 10).map((h) => {
                        const isOcupado = reservasDaSala.some(r => h >= r.horaInicio && h < r.horaFim);

                        return (
                          <div
                            key={h}
                            onClick={() => !isOcupado && handleCelulaClick(s.id, h)}
                            className={`h-full rounded-xl border flex items-center justify-center transition cursor-pointer select-none group relative ${
                              isOcupado 
                                ? 'bg-transparent border-transparent cursor-default' 
                                : 'bg-white hover:bg-emerald-50 border-slate-200/60 hover:border-emerald-300'
                            }`}
                            title={isOcupado ? 'Horário Ocupado' : `Clique para agendar às ${h}:00`}
                          >
                            {!isOcupado && (
                              <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono font-bold text-emerald-700 transition">
                                +{h}h
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Blocos de Reunião Agendada Posicionados no Tempo */}
                      {reservasDaSala.map((r) => {
                        const colStart = r.horaInicio - 8;
                        const colSpan = r.horaFim - r.horaInicio;
                        const leftPercent = (colStart / 10) * 100;
                        const widthPercent = (colSpan / 10) * 100;

                        return (
                          <div
                            key={r.id}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`
                            }}
                            onClick={() => {
                              soundFX.playClick();
                              setReservaInspecionada(r);
                            }}
                            onMouseEnter={() => setHoverReserva(r)}
                            onMouseLeave={() => setHoverReserva(null)}
                            className="absolute top-1.5 bottom-1.5 bg-linear-to-r from-[#00538A] to-[#0072BB] text-white rounded-xl px-3 py-1.5 shadow-md flex flex-col justify-center overflow-hidden z-10 border border-blue-300 cursor-pointer hover:scale-[1.02] hover:brightness-110 transition-all"
                            title="Clique para ver detalhes ou cancelar"
                          >
                            <div className="font-extrabold text-[11px] truncate leading-tight">
                              {r.motivo}
                            </div>
                            <div className="text-[10px] text-blue-200 font-mono truncate">
                              {String(r.horaInicio).padStart(2, '0')}:00 às {String(r.horaFim).padStart(2, '0')}:00 · {r.responsavel.split(' ')[0]}
                            </div>
                          </div>
                        );
                      })}

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Tooltip de Detalhes da Reunião Selecionada */}
      {hoverReserva && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0072BB] text-white flex items-center justify-center font-bold">
              <Clock size={16} />
            </div>
            <div>
              <div className="font-bold text-white">{hoverReserva.motivo}</div>
              <div className="text-slate-400 text-[11px]">
                {hoverReserva.salaNome} · {hoverReserva.responsavel} ({String(hoverReserva.horaInicio).padStart(2, '0')}:00 às {String(hoverReserva.horaFim).padStart(2, '0')}:00)
              </div>
            </div>
          </div>
          <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800 text-[10px]">
            Clique no bloco para gerenciar
          </span>
        </div>
      )}

      {/* MODAL DE INSPEÇÃO / CANCELAMENTO DE RESERVA */}
      {reservaInspecionada && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setReservaInspecionada(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-[#0072BB]" />
                <h3 className="font-black text-slate-900 text-base">Detalhes do Agendamento</h3>
              </div>
              <button
                onClick={() => setReservaInspecionada(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-1">
                <div className="text-[10px] font-bold text-blue-700 uppercase">Espaço Reservado</div>
                <div className="font-black text-slate-900 text-sm">{reservaInspecionada.salaNome}</div>
                <div className="text-[11px] text-slate-600 font-mono">
                  {reservaInspecionada.data} das {String(reservaInspecionada.horaInicio).padStart(2, '0')}:00 às {String(reservaInspecionada.horaFim).padStart(2, '0')}:00
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700">Objetivo / Motivo:</span>
                <p className="mt-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {reservaInspecionada.motivo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-slate-500 text-[10px] uppercase">Responsável:</span>
                  <div className="font-bold text-slate-800">{reservaInspecionada.responsavel}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 text-[10px] uppercase">Status:</span>
                  <div className="font-bold text-emerald-700">Confirmado</div>
                </div>
              </div>

              {reservaInspecionada.recursosExtras && reservaInspecionada.recursosExtras.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 text-[11px]">Recursos Solicitados:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {reservaInspecionada.recursosExtras.map((rec, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium border border-slate-200">
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCancelarReserva(reservaInspecionada.id)}
                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-red-200"
              >
                <Trash2 size={14} /> Liberar Horário
              </button>

              <button
                type="button"
                onClick={() => setReservaInspecionada(null)}
                className="px-4 py-2 rounded-xl bg-[#0072BB] text-white font-bold text-xs transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AGENDAMENTO DE SALAS */}
      {modalNovo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus size={20} className="text-[#009B54]" />
                Reservar Espaço ou Auditório SEJU
              </h3>
              <button 
                onClick={() => setModalNovo(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarReserva} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Selecione o Espaço *</label>
                <select
                  value={salaId}
                  onChange={e => setSalaId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-hidden"
                >
                  {salas.map(s => (
                    <option key={s.id} value={s.id}>{s.nome} ({s.cap} pessoas · {s.layout})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário de Início *</label>
                  <select
                    value={horaInicio}
                    onChange={e => setHoraInicio(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 outline-hidden"
                  >
                    {horas.slice(0, 9).map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário de Término *</label>
                  <select
                    value={horaFim}
                    onChange={e => setHoraFim(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 outline-hidden"
                  >
                    {horas.slice(1).map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detector Anti-Colisão em Tempo Real */}
              {colisaoAtual ? (
                <div className="p-3 bg-red-50 rounded-2xl border border-red-300 text-xs text-red-800 flex items-start gap-2 animate-pulse">
                  <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black">BLOQUEIO ANTI-COLISÃO DETECTADO!</div>
                    <div className="text-[11px] mt-0.5">
                      Choque com "{colisaoAtual.motivo}" ({colisaoAtual.responsavel}) das {colisaoAtual.horaInicio}:00 às {colisaoAtual.horaFim}:00. Selecione outro horário.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Horário 100% Livre e Disponível na Régua.</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo / Reunião da Missão *</label>
                <input
                  type="text"
                  required
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Ex: Alinhamento de Planejamento Estratégico SEJU..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 outline-hidden"
                />
              </div>

              {/* Checklist de Recursos Adicionais */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-bold text-slate-700">Recursos Institucionais de Apoio:</label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input 
                      type="checkbox" 
                      checked={recursoCafe} 
                      onChange={e => setRecursoCafe(e.target.checked)}
                      className="rounded text-emerald-600" 
                    />
                    <Coffee size={13} className="text-amber-700" />
                    <span>Copa (Café/Água)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input 
                      type="checkbox" 
                      checked={recursoSuporteTI} 
                      onChange={e => setRecursoSuporteTI(e.target.checked)}
                      className="rounded text-emerald-600" 
                    />
                    <Laptop size={13} className="text-indigo-600" />
                    <span>Suporte TI Inicial</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input 
                      type="checkbox" 
                      checked={recursoGravacao} 
                      onChange={e => setRecursoGravacao(e.target.checked)}
                      className="rounded text-emerald-600" 
                    />
                    <Video size={13} className="text-red-600" />
                    <span>Gravação em Vídeo</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input 
                      type="checkbox" 
                      checked={recursoHibrido} 
                      onChange={e => setRecursoHibrido(e.target.checked)}
                      className="rounded text-emerald-600" 
                    />
                    <Monitor size={13} className="text-blue-600" />
                    <span>Transmissão Híbrida</span>
                  </label>
                </div>
              </div>

              {conflitoAviso && (
                <div className="p-3 bg-red-100 text-red-800 text-xs rounded-xl font-semibold">
                  {conflitoAviso}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={Boolean(colisaoAtual)}
                  className={`px-5 py-2.5 rounded-xl font-black shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                    colisaoAtual
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#009B54] hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Sparkles size={16} /> Confirmar Reserva na Régua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
