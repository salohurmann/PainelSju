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
  Sparkles, 
  Coffee,
  Laptop,
  Trash2,
  CalendarDays,
  X,
  ArrowLeft,
  SlidersHorizontal,
  MapPin,
  ShieldCheck
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
      andar: 'Térreo · Ala Norte',
      cap: 120, 
      layout: 'Formato Platéia / Teatro',
      equip: 'Projetor 4K, 4 mics sem fio, som ambiente, ar central', 
      dotColor: 'bg-indigo-600',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      hasVideo: true, 
      hasProjetor: true 
    },
    { 
      id: 's2', 
      nome: 'Sala de Reunião do Gabinete', 
      andar: '3º Andar · Ala Executiva',
      cap: 18, 
      layout: 'Mesa Oval Executiva em U',
      equip: 'Kit Videoconferência Teams, TV 75", lousa de vidro', 
      dotColor: 'bg-emerald-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      hasVideo: true, 
      hasProjetor: false 
    },
    { 
      id: 's3', 
      nome: 'Sala Técnica de Conciliação', 
      andar: '2º Andar · Bloco B',
      cap: 8, 
      layout: 'Mesa Redonda Mediação',
      equip: 'Quadro branco, estação de apoio, climatização dedicada', 
      dotColor: 'bg-amber-500',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
      hasVideo: false, 
      hasProjetor: false 
    },
    { 
      id: 's4', 
      nome: 'Laboratório de Treinamento', 
      andar: '1º Andar · Bloco Técnico',
      cap: 35, 
      layout: '20 Estações de Trabalho com PC',
      equip: '20 computadores em rede gigabit, projetor interativo', 
      dotColor: 'bg-sky-600',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200/80',
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
  const salaSelecionadaObj = salas.find(s => s.id === salaId) || salas[0];

  const handleSalvarReserva = (e: React.FormEvent) => {
    e.preventDefault();
    setConflitoAviso(null);

    if (horaInicio >= horaFim) {
      setConflitoAviso('O horário de término deve ser após o horário de início.');
      return;
    }

    const choque = checarColisao(salaId, horaInicio, horaFim);
    if (choque) {
      setConflitoAviso(`Choque de horário com "${choque.motivo}" (${choque.responsavel}) das ${choque.horaInicio}h às ${choque.horaFim}h.`);
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

  // Clique direto na célula do horário da timeline para selecionar no painel lateral (ou abrir modal no mobile)
  const handleCelulaClick = (sId: string, hora: number) => {
    soundFX.playClick();
    setSalaId(sId);
    setHoraInicio(hora);
    setHoraFim(Math.min(18, hora + 2));
  };

  const salasFiltradas = salas.filter(s => {
    if (filtroEquip === 'video') return s.hasVideo;
    if (filtroEquip === 'projetor') return s.hasProjetor;
    return true;
  });

  const reservasDoDia = reservas.filter(r => r.data === dataSelecionada);
  const salasLivresAgora = salas.filter(s => !reservasDoDia.some(r => r.salaId === s.id && 10 >= r.horaInicio && 10 < r.horaFim)).length;

  return (
    <div className="max-w-7xl mx-auto space-y-5 font-sans">
      
      {/* =====================================================================
          SEÇÃO 1: TOP EXECUTIVE BAR & DATE / PERIOD SELECTOR
         ===================================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-5">
        {/* Linha Superior: Back Button + Título + KPI Pills + Primary Action */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              onClick={onVoltarHub}
              className="mt-0.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition cursor-pointer shrink-0"
              title="Voltar à Central de Aplicativos"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Estrutura 2 · Espaços Coletivos
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={11} /> Anti-Colisão Ativo
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
                <CalendarIcon size={20} className="text-slate-700" />
                Gestão de Salas, Auditório & Plenárias
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mapa de ocupação por faixa horária, recursos audiovisuais e reserva expressa sem conflitos.
              </p>
            </div>
          </div>

          {/* KPI Pills + Botão de Ação */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <Building size={13} className="text-slate-500" />
              <span className="text-[11px] font-medium text-slate-500">Espaços</span>
              <span className="text-xs font-bold text-slate-900 font-mono">{salas.length}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-emerald-700">Livres Agora</span>
              <span className="text-xs font-bold text-emerald-800 font-mono">{salasLivresAgora}/{salas.length}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-200/70">
              <Clock size={13} className="text-blue-600" />
              <span className="text-[11px] font-medium text-blue-700">Agendadas no Dia</span>
              <span className="text-xs font-bold text-blue-800 font-mono">{reservasDoDia.length}</span>
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                setModalNovo(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto sm:ml-1"
            >
              <Plus size={15} /> Reserva Completa
            </button>
          </div>
        </div>

        {/* Seletor de Data / Período + Filtros de Equipamento */}
        <div className="pt-4 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Pílulas de Dias Rápidos */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-slate-200 shrink-0 text-xs font-semibold text-slate-600">
              <CalendarDays size={15} className="text-slate-400" />
              <span className="hidden sm:inline">Período:</span>
            </div>

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
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  <span>{d.diaSemana}</span>
                  {qtdNoDia > 0 && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {qtdNoDia}
                    </span>
                  )}
                </button>
              );
            })}

            <input
              type="date"
              value={dataSelecionada}
              onChange={e => setDataSelecionada(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl font-medium text-slate-700 outline-hidden shrink-0 cursor-pointer hover:bg-slate-100 transition"
            />
          </div>

          {/* Filtro Rápido de Infraestrutura */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal size={13} className="text-slate-400 hidden sm:inline" />
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
              {[
                { id: 'todos', label: 'Todos os Espaços' },
                { id: 'video', label: 'Videoconferência' },
                { id: 'projetor', label: 'Projetor 4K' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    soundFX.playClick();
                    setFiltroEquip(f.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    filtroEquip === f.id
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SEÇÃO 2: DIVIDED 2-COLUMN LAYOUT (PLANTA/RÉGUA ESQUERDA + PAINEL DIREITA)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUNA ESQUERDA (8 cols): Interactive Floorplan / Room Cards & Timeline */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Cards de Seleção Rápida de Ambiente (Planta Interativa) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {salasFiltradas.map(s => {
              const reservasDaSala = reservas.filter(r => r.salaId === s.id && r.data === dataSelecionada);
              const estaOcupadaAgora = reservasDaSala.some(r => 10 >= r.horaInicio && 10 < r.horaFim);
              const isSelected = salaId === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    soundFX.playClick();
                    setSalaId(s.id);
                  }}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${s.dotColor} shrink-0`} />
                        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
                          {s.nome}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                        estaOcupadaAgora
                          ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${estaOcupadaAgora ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                        {estaOcupadaAgora ? 'Em uso' : 'Livre'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" /> {s.andar}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Users size={11} className="text-slate-400" /> {s.cap} lugares
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {s.equip}
                    </p>
                  </div>

                  {/* Mini Régua de Horários (08h às 17h) dentro do Card */}
                  <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Grade 08h–18h (clique na faixa)</span>
                      <span className="font-mono text-slate-600 font-semibold">{reservasDaSala.length} reservas</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {horas.slice(0, 10).map(h => {
                        const reservaNoHorario = reservasDaSala.find(r => h >= r.horaInicio && h < r.horaFim);
                        const isSlotSelected = isSelected && h >= horaInicio && h < horaFim;

                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (reservaNoHorario) {
                                soundFX.playClick();
                                setReservaInspecionada(reservaNoHorario);
                              } else {
                                handleCelulaClick(s.id, h);
                              }
                            }}
                            onMouseEnter={() => reservaNoHorario && setHoverReserva(reservaNoHorario)}
                            onMouseLeave={() => setHoverReserva(null)}
                            className={`h-6 rounded-md text-[9px] font-mono font-semibold transition flex items-center justify-center cursor-pointer border ${
                              reservaNoHorario
                                ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700'
                                : isSlotSelected
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-50 text-slate-500 border-slate-200/70 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                            }`}
                            title={
                              reservaNoHorario
                                ? `${h}:00 · Ocupado: ${reservaNoHorario.motivo}`
                                : `Selecionar ${h}:00 em ${s.nome}`
                            }
                          >
                            {h}h
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Régua Cronológica Consolidada (Visão Panorâmica 08h–18h) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs overflow-x-auto no-scrollbar space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cronograma Visual de Ocupação ({dataSelecionada})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Clique em qualquer horário vazio para preencher o painel ao lado ou clique sobre um bloco agendado para detalhes.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Livre
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-800" /> Reservado
                </span>
              </div>
            </div>

            <div className="min-w-[680px] pt-1">
              <div className="grid grid-cols-12 gap-1.5 text-center text-[10px] font-mono font-semibold text-slate-400 pb-2 border-b border-slate-100">
                <div className="col-span-3 text-left pl-1 font-sans text-slate-600 font-semibold">
                  ESPAÇO
                </div>
                {horas.slice(0, 9).map(h => (
                  <div key={h} className="col-span-1 py-1 bg-slate-50/80 rounded border border-slate-100">
                    {String(h).padStart(2, '0')}h
                  </div>
                ))}
              </div>

              <div className="divide-y divide-slate-100">
                {salasFiltradas.map(s => {
                  const reservasDaSala = reservas.filter(r => r.salaId === s.id && r.data === dataSelecionada);
                  return (
                    <div key={s.id} className="py-2.5 grid grid-cols-12 gap-1.5 items-center">
                      <div className="col-span-3 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${s.dotColor} shrink-0`} />
                          <span className="text-xs font-semibold text-slate-800 truncate">{s.nome}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 pl-3.5 block">{s.layout}</span>
                      </div>

                      <div className="col-span-9 grid grid-cols-9 gap-1 h-11 bg-slate-50/80 p-1 rounded-xl border border-slate-200/70 relative">
                        {horas.slice(0, 9).map(h => {
                          const isOcupado = reservasDaSala.some(r => h >= r.horaInicio && h < r.horaFim);
                          return (
                            <div
                              key={h}
                              onClick={() => !isOcupado && handleCelulaClick(s.id, h)}
                              className={`h-full rounded-lg border flex items-center justify-center transition cursor-pointer group ${
                                isOcupado
                                  ? 'bg-transparent border-transparent'
                                  : 'bg-white hover:bg-emerald-50/80 border-slate-200/60 hover:border-emerald-300'
                              }`}
                            >
                              {!isOcupado && (
                                <span className="opacity-0 group-hover:opacity-100 text-[9px] font-mono font-bold text-emerald-700">
                                  +{h}h
                                </span>
                              )}
                            </div>
                          );
                        })}

                        {reservasDaSala.map(r => {
                          const colStart = Math.max(0, r.horaInicio - 8);
                          const colSpan = Math.min(9 - colStart, r.horaFim - r.horaInicio);
                          if (colSpan <= 0) return null;
                          const leftPercent = (colStart / 9) * 100;
                          const widthPercent = (colSpan / 9) * 100;

                          return (
                            <div
                              key={r.id}
                              style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                              onClick={() => {
                                soundFX.playClick();
                                setReservaInspecionada(r);
                              }}
                              onMouseEnter={() => setHoverReserva(r)}
                              onMouseLeave={() => setHoverReserva(null)}
                              className="absolute top-1 bottom-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-2.5 py-1 shadow-xs flex flex-col justify-center overflow-hidden z-10 border border-slate-700 cursor-pointer transition"
                            >
                              <div className="font-semibold text-[10px] truncate leading-tight">
                                {r.motivo}
                              </div>
                              <div className="text-[9px] text-slate-300 font-mono truncate">
                                {String(r.horaInicio).padStart(2, '0')}h–{String(r.horaFim).padStart(2, '0')}h · {r.responsavel.split(' ')[0]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {hoverReserva && (
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <Clock size={14} className="text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold">{hoverReserva.motivo}</span>
                    <span className="text-slate-400 ml-2 text-[11px]">
                      {hoverReserva.salaNome} · {hoverReserva.responsavel} ({hoverReserva.horaInicio}h às {hoverReserva.horaFim}h)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-300">Clique para inspecionar</span>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA (4 cols): Selected Room Details, Resources & Quick Booking Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4 sticky top-4">
          <div className="pb-3.5 border-b border-slate-100 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Painel de Reserva Expressa
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${salaSelecionadaObj.dotColor}`} />
                {salaSelecionadaObj.nome}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {salaSelecionadaObj.layout} · Capacidade {salaSelecionadaObj.cap} pessoas
              </p>
            </div>
          </div>

          <form onSubmit={handleSalvarReserva} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Espaço Selecionado</label>
              <select
                value={salaId}
                onChange={e => setSalaId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-slate-400"
              >
                {salas.map(s => (
                  <option key={s.id} value={s.id}>{s.nome} ({s.cap} lug.)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Início</label>
                <select
                  value={horaInicio}
                  onChange={e => setHoraInicio(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200/90 rounded-xl font-mono font-semibold text-slate-800 outline-hidden"
                >
                  {horas.slice(0, 9).map(h => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Término</label>
                <select
                  value={horaFim}
                  onChange={e => setHoraFim(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200/90 rounded-xl font-mono font-semibold text-slate-800 outline-hidden"
                >
                  {horas.slice(1).map(h => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Anti-Colisão */}
            {colisaoAtual ? (
              <div className="p-3 bg-red-50/90 rounded-xl border border-red-200 text-[11px] text-red-800 flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Horário Indisponível</div>
                  <div className="text-red-700/90 mt-0.5">
                    Reservado para "{colisaoAtual.motivo}" ({colisaoAtual.horaInicio}h–{colisaoAtual.horaFim}h).
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>Janela {String(horaInicio).padStart(2, '0')}h–{String(horaFim).padStart(2, '0')}h disponível em {dataSelecionada}.</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pauta / Finalidade da Reserva *</label>
              <input
                type="text"
                required
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Ex: Reunião de alinhamento, audiência..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-slate-400"
              />
            </div>

            {/* Checklist de Recursos de Apoio */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Recursos Adicionais</label>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <label className="flex items-center gap-1.5 p-2 bg-slate-50/80 rounded-lg border border-slate-200/70 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={recursoCafe}
                    onChange={e => setRecursoCafe(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <Coffee size={12} className="text-amber-700 shrink-0" />
                  <span className="truncate">Copa & Café</span>
                </label>

                <label className="flex items-center gap-1.5 p-2 bg-slate-50/80 rounded-lg border border-slate-200/70 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={recursoSuporteTI}
                    onChange={e => setRecursoSuporteTI(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <Laptop size={12} className="text-indigo-600 shrink-0" />
                  <span className="truncate">Apoio TI</span>
                </label>

                <label className="flex items-center gap-1.5 p-2 bg-slate-50/80 rounded-lg border border-slate-200/70 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={recursoGravacao}
                    onChange={e => setRecursoGravacao(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <Video size={12} className="text-red-600 shrink-0" />
                  <span className="truncate">Gravação</span>
                </label>

                <label className="flex items-center gap-1.5 p-2 bg-slate-50/80 rounded-lg border border-slate-200/70 cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={recursoHibrido}
                    onChange={e => setRecursoHibrido(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <Monitor size={12} className="text-blue-600 shrink-0" />
                  <span className="truncate">Link Híbrido</span>
                </label>
              </div>
            </div>

            {conflitoAviso && (
              <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 text-[11px] rounded-xl font-medium">
                {conflitoAviso}
              </div>
            )}

            <button
              type="submit"
              disabled={Boolean(colisaoAtual)}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                colisaoAtual
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Sparkles size={14} /> Confirmar Agendamento
            </button>
          </form>
        </div>

      </div>

      {/* =====================================================================
          SEÇÃO 3: MY ACTIVE BOOKINGS STRIP AT THE BOTTOM
         ===================================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Reservas Ativas & Agenda Institucional ({reservas.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Clique em qualquer agendamento para inspecionar ou liberar o espaço
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {reservas.map(r => (
            <div
              key={r.id}
              onClick={() => {
                soundFX.playClick();
                setReservaInspecionada(r);
              }}
              className="p-3.5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs transition cursor-pointer flex flex-col justify-between gap-2.5 group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-slate-500">
                  <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                    {r.data}
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                    {String(r.horaInicio).padStart(2, '0')}h–{String(r.horaFim).padStart(2, '0')}h
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-slate-900 mt-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {r.motivo}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {r.salaNome}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="truncate max-w-[140px]">{r.responsavel}</span>
                <span className="text-slate-400 group-hover:text-slate-700 font-medium">Detalhes →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE INSPEÇÃO / CANCELAMENTO DE RESERVA */}
      {reservaInspecionada && (
        <div
          className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setReservaInspecionada(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200/80 space-y-4 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarIcon size={17} className="text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Detalhes do Agendamento</h3>
              </div>
              <button
                onClick={() => setReservaInspecionada(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Espaço Reservado</div>
                <div className="font-bold text-slate-900 text-sm">{reservaInspecionada.salaNome}</div>
                <div className="text-[11px] text-slate-600 font-mono">
                  {reservaInspecionada.data} · {String(reservaInspecionada.horaInicio).padStart(2, '0')}:00 às {String(reservaInspecionada.horaFim).padStart(2, '0')}:00
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700">Objetivo / Pauta:</span>
                <p className="mt-1 text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
                  {reservaInspecionada.motivo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold text-slate-400 text-[10px] uppercase">Responsável</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{reservaInspecionada.responsavel}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 text-[10px] uppercase">Status</span>
                  <div className="font-semibold text-emerald-700 mt-0.5">Confirmado</div>
                </div>
              </div>

              {reservaInspecionada.recursosExtras && reservaInspecionada.recursosExtras.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700 text-[11px]">Recursos Solicitados:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {reservaInspecionada.recursosExtras.map((rec, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium border border-slate-200/80">
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
                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 border border-red-200/80"
              >
                <Trash2 size={13} /> Liberar Horário
              </button>

              <button
                type="button"
                onClick={() => setReservaInspecionada(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AGENDAMENTO COMPLETO */}
      {modalNovo && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200/80 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Agendamento Institucional
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Reservar Espaço ou Auditório SEJU
                </h3>
              </div>
              <button
                onClick={() => setModalNovo(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSalvarReserva} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Selecione o Espaço *</label>
                <select
                  value={salaId}
                  onChange={e => setSalaId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden"
                >
                  {salas.map(s => (
                    <option key={s.id} value={s.id}>{s.nome} ({s.cap} pessoas · {s.layout})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Horário de Início *</label>
                  <select
                    value={horaInicio}
                    onChange={e => setHoraInicio(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-mono font-semibold text-slate-800 outline-hidden"
                  >
                    {horas.slice(0, 9).map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Horário de Término *</label>
                  <select
                    value={horaFim}
                    onChange={e => setHoraFim(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-mono font-semibold text-slate-800 outline-hidden"
                  >
                    {horas.slice(1).map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              {colisaoAtual ? (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <AlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Bloqueio Anti-Colisão Detectado</div>
                    <div className="text-[11px] mt-0.5">
                      Choque com "{colisaoAtual.motivo}" ({colisaoAtual.responsavel}) das {colisaoAtual.horaInicio}:00 às {colisaoAtual.horaFim}:00.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Horário 100% livre e disponível na grade.</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Pauta / Reunião *</label>
                <input
                  type="text"
                  required
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Ex: Alinhamento de Planejamento Estratégico SEJU..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200/90 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={Boolean(colisaoAtual)}
                  className={`px-5 py-2 rounded-xl font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer ${
                    colisaoAtual
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Sparkles size={14} /> Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
