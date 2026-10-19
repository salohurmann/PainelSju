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
  ShieldCheck,
  Layers,
  Mic,
  Wifi,
  Compass,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { Usuario } from '../../types';
import confetti from 'canvas-confetti';
import { soundFX } from '../../services/soundFx';
import { eventBus } from '../../services/eventBus';

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
    recursosExtras: ['Serviço de Copa (Café & Água)', 'Gravação em Vídeo / Ata Digital', 'Suporte Técnico Presencial']
  },
  {
    id: 'res-2',
    salaId: 's2',
    salaNome: 'Sala de Reunião do Gabinete',
    responsavel: 'Carlos Silveira',
    motivo: 'Alinhamento Conselho Tutelar & Comarcas',
    data: '2026-10-16',
    horaInicio: 14,
    horaFim: 16,
    recursosExtras: ['Link Híbrido Teams / Meet PR', 'Serviço de Copa (Café & Água)']
  },
  {
    id: 'res-3',
    salaId: 's3',
    salaNome: 'Sala Técnica de Conciliação',
    responsavel: 'Juliana Mendes',
    motivo: 'Audiência de Mediação Comunitária',
    data: '2026-10-16',
    horaInicio: 10,
    horaFim: 12,
    recursosExtras: ['Suporte Técnico Presencial']
  },
  {
    id: 'res-4',
    salaId: 's4',
    salaNome: 'Laboratório de Treinamento',
    responsavel: 'Coordenação de TI & Sistemas',
    motivo: 'Capacitação Sistema E-Protocolo Digital',
    data: '2026-10-16',
    horaInicio: 15,
    horaFim: 18,
    recursosExtras: ['Suporte Técnico Presencial', 'Link Híbrido Teams / Meet PR']
  },
  {
    id: 'res-5',
    salaId: 's1',
    salaNome: 'Auditório Principal SEJU',
    responsavel: 'Superintendência de Direitos Humanos',
    motivo: 'Palestra de Enfrentamento à Violência Escolar',
    data: '2026-10-19',
    horaInicio: 14,
    horaFim: 17,
    recursosExtras: ['Serviço de Copa (Café & Água)', 'Suporte Técnico Presencial']
  },
  {
    id: 'res-6',
    salaId: 's2',
    salaNome: 'Sala de Reunião do Gabinete',
    responsavel: 'Diretoria Geral SEJU',
    motivo: 'Comitê de Governança Orçamentária',
    data: '2026-10-19',
    horaInicio: 9,
    horaFim: 11,
    recursosExtras: ['Serviço de Copa (Café & Água)', 'Link Híbrido Teams / Meet PR']
  }
];

interface ReservaSalasViewProps {
  currentUser: Usuario;
  onVoltarHub: () => void;
}

const DIAS_RAPIDOS = [
  { data: '2026-10-16', rotulo: 'Hoje', diaCurto: 'SEX', diaNum: '16', mes: 'OUT', diaSemana: 'Sex 16/10' },
  { data: '2026-10-17', rotulo: 'Fim de Semana', diaCurto: 'SÁB', diaNum: '17', mes: 'OUT', diaSemana: 'Sáb 17/10' },
  { data: '2026-10-19', rotulo: 'Próxima Sem.', diaCurto: 'SEG', diaNum: '19', mes: 'OUT', diaSemana: 'Seg 19/10' },
  { data: '2026-10-20', rotulo: 'Terça-feira', diaCurto: 'TER', diaNum: '20', mes: 'OUT', diaSemana: 'Ter 20/10' },
  { data: '2026-10-21', rotulo: 'Quarta-feira', diaCurto: 'QUA', diaNum: '21', mes: 'OUT', diaSemana: 'Qua 21/10' },
  { data: '2026-10-22', rotulo: 'Quinta-feira', diaCurto: 'QUI', diaNum: '22', mes: 'OUT', diaSemana: 'Qui 22/10' },
  { data: '2026-10-23', rotulo: 'Sexta-feira', diaCurto: 'SEX', diaNum: '23', mes: 'OUT', diaSemana: 'Sex 23/10' }
];

export const ReservaSalasView: React.FC<ReservaSalasViewProps> = ({ currentUser, onVoltarHub }) => {
  const [dataSelecionada, setDataSelecionada] = useState('2026-10-16');
  const [reservas, setReservas] = useState<Reserva[]>(RESERVAS_INICIAIS);
  const [modalNovo, setModalNovo] = useState(false);
  const [salaId, setSalaId] = useState('s1');
  const [horaInicio, setHoraInicio] = useState(13);
  const [horaFim, setHoraFim] = useState(15);
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
      codigo: 'SEJU-AUD-01',
      nome: 'Auditório Principal SEJU', 
      andar: 'Térreo · Ala Norte',
      cap: 120, 
      layout: 'Auditório / Plenária',
      equip: 'Projetor Laser 4K, 4 Mics Sem Fio, Som Line-Array, Cabine de Tradução', 
      dotColor: 'bg-indigo-600',
      accentBorder: 'border-l-indigo-500',
      blockBg: 'from-indigo-950/95 via-slate-900/95 to-slate-900/90 border-indigo-500/40',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      ringActive: 'ring-indigo-500/20 border-indigo-600',
      hasVideo: true, 
      hasProjetor: true,
      hasAudioPro: true
    },
    { 
      id: 's2', 
      codigo: 'SEJU-GAB-03',
      nome: 'Sala de Reunião do Gabinete', 
      andar: '3º Andar · Ala Executiva',
      cap: 18, 
      layout: 'Mesa em U Executiva',
      equip: 'Kit Videoconferência Teams 360°, Smart TV 75", Lousa de Vidro', 
      dotColor: 'bg-emerald-600',
      accentBorder: 'border-l-emerald-500',
      blockBg: 'from-emerald-950/95 via-slate-900/95 to-slate-900/90 border-emerald-500/40',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      ringActive: 'ring-emerald-500/20 border-emerald-600',
      hasVideo: true, 
      hasProjetor: false,
      hasAudioPro: true
    },
    { 
      id: 's3', 
      codigo: 'SEJU-MED-02',
      nome: 'Sala Técnica de Conciliação', 
      andar: '2º Andar · Bloco B',
      cap: 8, 
      layout: 'Mesa Circular Mediação',
      equip: 'Isolamento Acústico Duplo, Estação de Apoio, Climatização Dedicada', 
      dotColor: 'bg-amber-500',
      accentBorder: 'border-l-amber-500',
      blockBg: 'from-amber-950/95 via-slate-900/95 to-slate-900/90 border-amber-500/40',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
      ringActive: 'ring-amber-500/20 border-amber-600',
      hasVideo: false, 
      hasProjetor: false,
      hasAudioPro: false
    },
    { 
      id: 's4', 
      codigo: 'SEJU-LAB-01',
      nome: 'Laboratório de Treinamento', 
      andar: '1º Andar · Bloco Técnico',
      cap: 35, 
      layout: 'Bancadas com 20 Estações PC',
      equip: '20 Workstations Rede Gigabit, Projetor Interativo, Lousa Digital', 
      dotColor: 'bg-sky-600',
      accentBorder: 'border-l-sky-500',
      blockBg: 'from-sky-950/95 via-slate-900/95 to-slate-900/90 border-sky-500/40',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200/80',
      ringActive: 'ring-sky-500/20 border-sky-600',
      hasVideo: false, 
      hasProjetor: true,
      hasAudioPro: false
    }
  ];

  // Horários de expediente: 08:00 às 18:00 (10 blocos de 1h: 8h, 9h, 10h, 11h, 12h, 13h, 14h, 15h, 16h, 17h -> término até 18h)
  const horas = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const slotsHorarios = horas.slice(0, 10); // 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 (cada slot = 1 hora até as 18h)

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
      setConflitoAviso('O horário de término deve ser posterior ao horário de início.');
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

    eventBus.emit('sala.reservada', {
      reservaId: nova.id,
      salaNome: nova.salaNome,
      horario: `${nova.horaInicio}:00 - ${nova.horaFim}:00`,
      data: nova.data,
      solicitante: nova.responsavel,
      pauta: nova.motivo
    });

    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.6 }
    });
  };

  // Cancelar ou Liberar Horário
  const handleCancelarReserva = (reservaId: string) => {
    soundFX.playClick();
    setReservas(prev => prev.filter(r => r.id !== reservaId));
    setReservaInspecionada(null);
  };

  // Clique direto na célula do horário da timeline para selecionar no painel lateral
  const handleCelulaClick = (sId: string, hora: number) => {
    soundFX.playClick();
    setSalaId(sId);
    setHoraInicio(hora);
    // Encontrar próxima reserva no mesmo dia/sala para não gerar colisão automática se houver 1h livre
    const proxReserva = reservas
      .filter(r => r.salaId === sId && r.data === dataSelecionada && r.horaInicio > hora)
      .sort((a, b) => a.horaInicio - b.horaInicio)[0];
    const limiteSuperior = proxReserva ? Math.min(proxReserva.horaInicio, hora + 2) : Math.min(18, hora + 2);
    setHoraFim(Math.max(hora + 1, limiteSuperior));
  };

  const salasFiltradas = salas.filter(s => {
    if (filtroEquip === 'video') return s.hasVideo;
    if (filtroEquip === 'projetor') return s.hasProjetor;
    return true;
  });

  const reservasDoDia = reservas.filter(r => r.data === dataSelecionada);
  const horaReferencia = 10; // 10:00 como referência de expediente ativo
  const salasLivresAgora = salas.filter(s => !reservasDoDia.some(r => r.salaId === s.id && horaReferencia >= r.horaInicio && horaReferencia < r.horaFim)).length;

  // Auxiliar para renderizar badges de recursos nos blocos cronológicos
  const renderResourceBadges = (recursos?: string[], compact = false) => {
    if (!recursos || recursos.length === 0) return null;
    const temCopa = recursos.some(r => r.toLowerCase().includes('copa') || r.toLowerCase().includes('café'));
    const temHibrido = recursos.some(r => r.toLowerCase().includes('híbrido') || r.toLowerCase().includes('teams') || r.toLowerCase().includes('videoconferência'));
    const temTI = recursos.some(r => r.toLowerCase().includes('suporte') || r.toLowerCase().includes('técnico'));
    const temVideo = recursos.some(r => r.toLowerCase().includes('gravação') || r.toLowerCase().includes('vídeo'));

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {temCopa && (
          <span
            title="Serviço de Copa (Café & Água)"
            className={`inline-flex items-center gap-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-400/30 font-mono ${
              compact ? 'px-1 py-0.5 text-[8px]' : 'px-1.5 py-0.5 text-[9px]'
            }`}
          >
            <Coffee size={compact ? 8 : 9} className="text-amber-300 shrink-0" />
            {!compact && <span>Copa</span>}
          </span>
        )}
        {temHibrido && (
          <span
            title="Transmissão Híbrida (Teams / Meet PR)"
            className={`inline-flex items-center gap-0.5 rounded bg-sky-500/20 text-sky-200 border border-sky-400/30 font-mono ${
              compact ? 'px-1 py-0.5 text-[8px]' : 'px-1.5 py-0.5 text-[9px]'
            }`}
          >
            <Monitor size={compact ? 8 : 9} className="text-sky-300 shrink-0" />
            {!compact && <span>Híbrida</span>}
          </span>
        )}
        {temTI && (
          <span
            title="Suporte TI Presencial"
            className={`inline-flex items-center gap-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 font-mono ${
              compact ? 'px-1 py-0.5 text-[8px]' : 'px-1.5 py-0.5 text-[9px]'
            }`}
          >
            <Laptop size={compact ? 8 : 9} className="text-indigo-300 shrink-0" />
            {!compact && <span>TI</span>}
          </span>
        )}
        {temVideo && (
          <span
            title="Gravação em Vídeo / Ata Digital"
            className={`inline-flex items-center gap-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-400/30 font-mono ${
              compact ? 'px-1 py-0.5 text-[8px]' : 'px-1.5 py-0.5 text-[9px]'
            }`}
          >
            <Video size={compact ? 8 : 9} className="text-rose-300 shrink-0" />
            {!compact && <span>Rec</span>}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 font-sans">
      
      {/* =====================================================================
          SEÇÃO 1: CABEÇALHO ARQUITETÔNICO & FITA DE CALENDÁRIO DE 7 DIAS (CRON / NOTION STYLE)
         ===================================================================== */}
      <div className="relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs overflow-hidden space-y-5">
        {/* Marcadores de Canto de Placa Arquitetônica no Header */}
        <span className="pointer-events-none absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t-2 border-l-2 border-slate-300/80" />
        <span className="pointer-events-none absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t-2 border-r-2 border-slate-300/80" />
        <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b-2 border-l-2 border-slate-300/80" />
        <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b-2 border-r-2 border-slate-300/80" />

        {/* Linha Superior: Back Button + Título + KPI Pills + Primary Action */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              onClick={onVoltarHub}
              className="mt-0.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white border border-slate-200/90 hover:border-slate-900 transition-all duration-200 cursor-pointer shrink-0 shadow-2xs group"
              title="Voltar à Central de Aplicativos"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 bg-slate-100/90 border border-slate-200/80 px-2 py-0.5 rounded-md">
                  <Compass size={11} className="text-slate-600" /> PLANTA CRONOLÓGICA · SEJU-PR
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                  <ShieldCheck size={11} className="text-emerald-600" /> Motor Anti-Colisão em Tempo Real
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
                <CalendarIcon size={20} className="text-indigo-600 shrink-0" />
                <span>Reserva Inteligente de Salas, Auditórios & Plenárias</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Régua de precisão horária (08:00 às 18:00), especificação arquitetônica de espaços e logística de copa e TI integrada.
              </p>
            </div>
          </div>

          {/* KPI Pills + Botão de Ação */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50/90 border border-slate-200/80">
              <Building size={13} className="text-slate-500" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 leading-none">Catálogo</span>
                <span className="text-xs font-bold text-slate-900 font-mono leading-tight mt-0.5">{salas.length} Espaços</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-700/80 leading-none">Disponíveis Agora</span>
                <span className="text-xs font-bold text-emerald-900 font-mono leading-tight mt-0.5">{salasLivresAgora} de {salas.length} Livres</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-200/70">
              <Clock size={13} className="text-indigo-600" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-700/80 leading-none">Pautas do Dia</span>
                <span className="text-xs font-bold text-indigo-950 font-mono leading-tight mt-0.5">{reservasDoDia.length} Agendadas</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundFX.playClick();
                setModalNovo(true);
              }}
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 12px -2px rgba(15,23,42,0.25)' }}
              className="bg-gradient-to-b from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto sm:ml-1 active:scale-[0.99]"
            >
              <Plus size={15} className="text-emerald-400" />
              <span>Reserva Completa</span>
            </button>
          </div>
        </div>

        {/* Fita de Calendário de 7 Dias com Bordas Chanfradas, Brilho Especular e Indicador Luminoso */}
        <div className="pt-4 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <div className="hidden sm:flex flex-col justify-center pr-3 mr-1 border-r border-slate-200/80 shrink-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Fita Cronológica</span>
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                <CalendarDays size={13} className="text-indigo-600" /> 7 Dias
              </span>
            </div>

            {DIAS_RAPIDOS.map(d => {
              const isSelected = dataSelecionada === d.data;
              const reservasData = reservas.filter(r => r.data === d.data);
              const qtdNoDia = reservasData.length;

              return (
                <button
                  key={d.data}
                  onClick={() => {
                    soundFX.playClick();
                    setDataSelecionada(d.data);
                  }}
                  style={{
                    clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                    boxShadow: isSelected
                      ? 'inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 16px -4px rgba(15, 23, 42, 0.28)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}
                  className={`relative group px-3.5 py-2 rounded-lg text-left transition-all duration-200 flex items-center gap-2.5 shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white border-slate-700 scale-[1.02]'
                      : 'bg-slate-50/90 hover:bg-white text-slate-700 border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {/* Reflexo Especular Superior no Card Selecionado */}
                  {isSelected && (
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  )}

                  <div className="flex flex-col leading-none">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                        isSelected ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {d.diaCurto} · {d.mes}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className={`text-sm font-mono font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {d.diaNum}
                      </span>
                      <span className={`text-[10px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {d.rotulo}
                      </span>
                    </div>
                  </div>

                  {/* Indicador Luminoso de Quantidade de Reuniões */}
                  <div className="flex flex-col items-end justify-between pl-1.5 border-l border-slate-500/20">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                        qtdNoDia > 0
                          ? isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                          : isSelected
                          ? 'bg-white/10 text-slate-400 border-white/10'
                          : 'bg-slate-100 text-slate-400 border-slate-200/60'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          qtdNoDia > 0
                            ? isSelected
                              ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                              : 'bg-indigo-500'
                            : 'bg-slate-300'
                        }`}
                      />
                      {qtdNoDia}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Seletor de Data Específica */}
            <div className="relative flex items-center shrink-0 ml-1">
              <input
                type="date"
                value={dataSelecionada}
                onChange={e => setDataSelecionada(e.target.value)}
                aria-label="Selecionar data no calendário"
                className="text-xs px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl font-mono font-semibold text-slate-700 outline-hidden shrink-0 cursor-pointer transition shadow-2xs"
              />
            </div>
          </div>

          {/* Filtro Rápido de Infraestrutura */}
          <div className="flex items-center gap-2 shrink-0 self-start xl:self-auto">
            <SlidersHorizontal size={13} className="text-slate-400 hidden sm:inline" />
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
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
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    filtroEquip === f.id
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/60'
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
          SEÇÃO 2: LAYOUT DE 2 COLUNAS (RÉGUA CRONOLÓGICA & CATÁLOGO ARQUITETÔNICO + RESERVA EXPRESSA)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUNA ESQUERDA (8 cols): Régua Cronológica de Alta Precisão + Catálogo Arquitetônico de Salas */}
        <div className="lg:col-span-8 space-y-5">

          {/* -----------------------------------------------------------------
              2A. RÉGUA CRONOLÓGICA VISUAL DE ALTA PRECISÃO (08:00 ÀS 18:00)
             ----------------------------------------------------------------- */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Régua Cronológica de Ocupação · 08:00 às 18:00
                  </h3>
                  <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70">
                    {dataSelecionada}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Passe o cursor sobre os blocos para inspecionar a pauta ou clique em uma janela livre (<span className="font-mono text-emerald-700 font-semibold">+ Reservar Horário</span>).
                </p>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-mono font-medium text-slate-500 shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs border border-dashed border-emerald-500 bg-emerald-50" /> Slot Livre
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-900 border-l-2 border-l-indigo-500" /> Ocupado
                </span>
                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> 10:25
                </span>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[760px] pt-1">
                {/* Cabeçalho da Régua Horária (08:00 até 18:00) */}
                <div className="grid grid-cols-12 gap-0 text-[10px] font-mono font-bold text-slate-400 pb-2 border-b border-slate-200/80">
                  <div className="col-span-3 text-left pl-2 font-sans text-[11px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={12} className="text-slate-400" /> Espaço / Planta
                  </div>
                  <div className="col-span-9 grid grid-cols-10">
                    {slotsHorarios.map(h => (
                      <div key={h} className="text-left pl-1.5 border-l border-dashed border-slate-200 flex items-center justify-between pr-1">
                        <span className={h === 10 ? 'text-rose-600 font-extrabold' : 'text-slate-500'}>
                          {String(h).padStart(2, '0')}:00
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linhas de Cada Sala na Régua Cronológica */}
                <div className="divide-y divide-slate-100">
                  {salasFiltradas.map(s => {
                    const reservasDaSala = reservas.filter(r => r.salaId === s.id && r.data === dataSelecionada);
                    const isSalaSelected = salaId === s.id;

                    return (
                      <div
                        key={s.id}
                        className={`py-3 grid grid-cols-12 gap-0 items-center transition-colors ${
                          isSalaSelected ? 'bg-slate-50/70' : 'hover:bg-slate-50/40'
                        }`}
                      >
                        {/* Identificação Arquitetônica da Sala na Esquerda */}
                        <div
                          onClick={() => {
                            soundFX.playClick();
                            setSalaId(s.id);
                          }}
                          className="col-span-3 pr-3 pl-2 cursor-pointer group"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${s.dotColor} shrink-0`} />
                            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {s.nome}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pl-3.5 mt-0.5">
                            <span className="text-[9px] font-mono font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/70">
                              {s.codigo}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              {s.cap} lug.
                            </span>
                          </div>
                        </div>

                        {/* Faixa Cronológica 08:00 às 18:00 (10 slots de 1h) */}
                        <div className="col-span-9 relative h-16 bg-slate-50/60 rounded-xl border border-slate-200/80 overflow-hidden">
                          {/* Marcador Vertical de Hora Atual (10:25 -> 24.1% da faixa de 10h) */}
                          <div
                            style={{ left: '24.16%' }}
                            className="pointer-events-none absolute top-0 bottom-0 w-px bg-rose-500/70 z-20"
                          >
                            <span className="absolute -top-0.5 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-500" />
                          </div>

                          {/* 10 Células de Hora com Linhas Tracejadas Finas e Hover Convidativo nos Slots Livres */}
                          <div className="grid grid-cols-10 h-full">
                            {slotsHorarios.map(h => {
                              const isOcupado = reservasDaSala.some(r => h >= r.horaInicio && h < r.horaFim);
                              const isPreviewSlot = isSalaSelected && !colisaoAtual && h >= horaInicio && h < horaFim;

                              return (
                                <button
                                  key={h}
                                  type="button"
                                  disabled={isOcupado}
                                  onClick={() => !isOcupado && handleCelulaClick(s.id, h)}
                                  title={!isOcupado ? `Reservar ${s.nome} às ${String(h).padStart(2, '0')}:00` : undefined}
                                  className={`relative h-full border-l first:border-l-0 border-dashed border-slate-200/90 flex flex-col items-center justify-center transition-all duration-150 group/slot ${
                                    isOcupado
                                      ? 'bg-transparent cursor-default'
                                      : isPreviewSlot
                                      ? 'bg-emerald-500/10 border-emerald-400/60 cursor-pointer'
                                      : 'hover:bg-emerald-50/90 cursor-pointer'
                                  }`}
                                >
                                  {!isOcupado && (
                                    <div
                                      className={`inset-1 absolute rounded-lg border border-dashed transition-all flex flex-col items-center justify-center px-0.5 ${
                                        isPreviewSlot
                                          ? 'border-emerald-500/80 bg-emerald-50/70 opacity-100 shadow-[inset_0_0_8px_rgba(16,185,129,0.12)]'
                                          : 'border-transparent group-hover/slot:border-emerald-400 group-hover/slot:bg-white/95 group-hover/slot:shadow-[0_0_12px_rgba(16,185,129,0.2)] opacity-0 group-hover/slot:opacity-100'
                                      }`}
                                    >
                                      <span className="text-[8px] font-mono font-bold text-emerald-700 leading-none">
                                        + Reservar
                                      </span>
                                      <span className="text-[8px] font-mono text-emerald-600/90 leading-none mt-0.5">
                                        {String(h).padStart(2, '0')}:00
                                      </span>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Blocos de Reunião Esculpidos com Gradiente Sutil, Borda Esquerda Acentuada e Badges */}
                          {reservasDaSala.map(r => {
                            const colStart = Math.max(0, r.horaInicio - 8);
                            const colSpan = Math.min(10 - colStart, r.horaFim - r.horaInicio);
                            if (colSpan <= 0) return null;
                            const leftPercent = (colStart / 10) * 100;
                            const widthPercent = (colSpan / 10) * 100;
                            const isHovered = hoverReserva?.id === r.id;

                            return (
                              <div
                                key={r.id}
                                style={{
                                  left: `calc(${leftPercent}% + 2px)`,
                                  width: `calc(${widthPercent}% - 4px)`,
                                  boxShadow: isHovered
                                    ? 'inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 20px -4px rgba(15,23,42,0.45)'
                                    : 'inset 0 1px 0 rgba(255,255,255,0.14), 0 2px 6px rgba(15,23,42,0.2)'
                                }}
                                onClick={() => {
                                  soundFX.playClick();
                                  setReservaInspecionada(r);
                                }}
                                onMouseEnter={() => setHoverReserva(r)}
                                onMouseLeave={() => setHoverReserva(null)}
                                className={`absolute top-1.5 bottom-1.5 bg-gradient-to-r ${s.blockBg} text-white rounded-lg border border-l-4 ${s.accentBorder} px-2.5 py-1.5 flex flex-col justify-between overflow-hidden z-10 cursor-pointer transition-all duration-200 ${
                                  isHovered ? 'scale-[1.01] z-30 ring-2 ring-white/20' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1.5">
                                  <div className="font-semibold text-[10px] leading-tight truncate text-white">
                                    {r.motivo}
                                  </div>
                                  <span className="text-[8px] font-mono font-bold text-slate-300 bg-white/10 px-1 py-0.2 rounded shrink-0">
                                    {String(r.horaInicio).padStart(2, '0')}h–{String(r.horaFim).padStart(2, '0')}h
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-1.5 mt-0.5">
                                  <span className="text-[9px] text-slate-300 font-medium truncate">
                                    {r.responsavel.split('(')[0].trim()}
                                  </span>
                                  {renderResourceBadges(r.recursosExtras, colSpan <= 2)}
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
            </div>

            {/* Barra de Inspeção Instantânea de Pauta no Hover (Estilo Cron Calendar Inspector) */}
            <div
              className={`p-3 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                hoverReserva
                  ? 'bg-slate-900 text-white border-slate-800 shadow-sm'
                  : 'bg-slate-50/80 text-slate-500 border-slate-200/70'
              }`}
            >
              {hoverReserva ? (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_#34d399]" />
                    <div className="truncate">
                      <span className="font-bold text-white">{hoverReserva.motivo}</span>
                      <span className="text-slate-300 ml-2 text-[11px]">
                        · {hoverReserva.salaNome} ({String(hoverReserva.horaInicio).padStart(2, '0')}:00 às {String(hoverReserva.horaFim).padStart(2, '0')}:00) · Resp: {hoverReserva.responsavel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {renderResourceBadges(hoverReserva.recursosExtras, false)}
                    <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-0.5">
                      Inspecionar <ArrowUpRight size={11} />
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between w-full text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-indigo-500" />
                    Dica: Passe o mouse sobre uma reunião agendada para ver recursos de Copa/TI ou clique em qualquer horário livre para agendar.
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">ESCALA 1H · 08:00–18:00</span>
                </div>
              )}
            </div>
          </div>

          {/* -----------------------------------------------------------------
              2B. CATÁLOGO DE ESPAÇOS / SALAS DA SEJU (PLACA ARQUITETÔNICA CORPORATIVA)
             ----------------------------------------------------------------- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Building size={15} className="text-slate-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Catálogo de Espaços & Especificação Arquitetônica SEJU
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Selecione uma placa para carregar no painel lateral
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {salasFiltradas.map(s => {
                const reservasDaSala = reservas.filter(r => r.salaId === s.id && r.data === dataSelecionada);
                const estaOcupadaAgora = reservasDaSala.some(r => horaReferencia >= r.horaInicio && horaReferencia < r.horaFim);
                const isSelected = salaId === s.id;
                const horasOcupadas = reservasDaSala.reduce((acc, r) => acc + (r.horaFim - r.horaInicio), 0);
                const taxaOcupacao = Math.min(100, Math.round((horasOcupadas / 10) * 100));

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      soundFX.playClick();
                      setSalaId(s.id);
                    }}
                    className={`relative bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between gap-3.5 overflow-hidden group ${
                      isSelected
                        ? `ring-2 ${s.ringActive} shadow-sm`
                        : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Acabamento de Placa Arquitetônica Corporativa nos 4 Cantos */}
                    <span
                      className={`pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 transition-colors ${
                        isSelected ? 'border-slate-800' : 'border-slate-300/90 group-hover:border-slate-400'
                      }`}
                    />
                    <span
                      className={`pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 transition-colors ${
                        isSelected ? 'border-slate-800' : 'border-slate-300/90 group-hover:border-slate-400'
                      }`}
                    />
                    <span
                      className={`pointer-events-none absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 transition-colors ${
                        isSelected ? 'border-slate-800' : 'border-slate-300/90 group-hover:border-slate-400'
                      }`}
                    />
                    <span
                      className={`pointer-events-none absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 transition-colors ${
                        isSelected ? 'border-slate-800' : 'border-slate-300/90 group-hover:border-slate-400'
                      }`}
                    />

                    {/* Topo da Placa Arquitetônica */}
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80">
                              {s.codigo}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                              <MapPin size={10} /> {s.andar}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${s.dotColor} shrink-0`} />
                            <span>{s.nome}</span>
                          </h4>
                        </div>

                        {/* Status Badge: Disponível agora / Em uso */}
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 flex items-center gap-1.5 shadow-2xs ${
                            estaOcupadaAgora
                              ? 'bg-amber-50 text-amber-800 border-amber-200/90'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              estaOcupadaAgora ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                            }`}
                          />
                          {estaOcupadaAgora ? 'Em uso' : 'Disponível agora'}
                        </span>
                      </div>

                      {/* Especificações de Capacidade e Formato de Layout */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 text-[11px]">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-slate-700">
                            <Users size={12} />
                          </div>
                          <div>
                            <div className="text-[9px] font-mono uppercase text-slate-400 leading-none">Capacidade</div>
                            <div className="font-bold text-slate-800 mt-0.5">{s.cap} lugares</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 border-l border-slate-200/70 pl-2">
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-slate-700">
                            <Layers size={12} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono uppercase text-slate-400 leading-none">Layout</div>
                            <div className="font-bold text-slate-800 truncate mt-0.5" title={s.layout}>
                              {s.layout}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chips de Infraestrutura & Equipamentos */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {s.hasProjetor && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
                            <Monitor size={10} className="text-indigo-600" /> Projetor 4K
                          </span>
                        )}
                        {s.hasVideo && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
                            <Video size={10} className="text-emerald-600" /> Híbrido Teams
                          </span>
                        )}
                        {s.hasAudioPro && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
                            <Mic size={10} className="text-amber-600" /> Som Plenária
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
                          <Wifi size={10} className="text-sky-600" /> Wi-Fi 6 Gov
                        </span>
                      </div>
                    </div>

                    {/* Mini Régua Horária Interativa (08h às 18h) na base do Card Arquitetônico */}
                    <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Disponibilidade Rápida (08h–18h)</span>
                        <span className="font-mono font-semibold text-slate-600">
                          {reservasDaSala.length} res. · {taxaOcupacao}% ocup.
                        </span>
                      </div>
                      <div className="grid grid-cols-10 gap-1">
                        {slotsHorarios.map(h => {
                          const reservaNoHorario = reservasDaSala.find(r => h >= r.horaInicio && h < r.horaFim);
                          const isSlotSelected = isSelected && h >= horaInicio && h < horaFim;

                          return (
                            <button
                              key={h}
                              type="button"
                              onClick={e => {
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
                              className={`h-6 rounded-md text-[9px] font-mono font-bold transition-all flex items-center justify-center cursor-pointer border ${
                                reservaNoHorario
                                  ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700'
                                  : isSlotSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                  : 'bg-slate-50 text-slate-500 border-slate-200/70 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-400 hover:border-dashed'
                              }`}
                              title={
                                reservaNoHorario
                                  ? `${h}:00 · Ocupado: ${reservaNoHorario.motivo}`
                                  : `+ Reservar ${h}:00 em ${s.nome}`
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
          </div>
        </div>

        {/* COLUNA DIREITA (4 cols): Painel de Reserva Expressa com Acabamento Arquitetônico */}
        <div className="lg:col-span-4 relative bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4 sticky top-4 overflow-hidden">
          {/* Cantoneiras Arquitetônicas */}
          <span className="pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-slate-300" />
          <span className="pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-slate-300" />
          <span className="pointer-events-none absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-slate-300" />
          <span className="pointer-events-none absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-slate-300" />

          <div className="pb-3.5 border-b border-slate-100 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                  {salaSelecionadaObj.codigo}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  · Reserva Expressa
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${salaSelecionadaObj.dotColor}`} />
                {salaSelecionadaObj.nome}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {salaSelecionadaObj.layout} · {salaSelecionadaObj.cap} lugares · {salaSelecionadaObj.andar}
              </p>
            </div>
          </div>

          <form onSubmit={handleSalvarReserva} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Espaço Selecionado</label>
              <select
                value={salaId}
                onChange={e => setSalaId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-slate-400 transition"
              >
                {salas.map(s => (
                  <option key={s.id} value={s.id}>{s.codigo} — {s.nome} ({s.cap} lug.)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Início (08h–17h)</label>
                <select
                  value={horaInicio}
                  onChange={e => {
                    const novoIni = Number(e.target.value);
                    setHoraInicio(novoIni);
                    if (horaFim <= novoIni) setHoraFim(Math.min(18, novoIni + 1));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-mono font-bold text-slate-800 outline-hidden"
                >
                  {slotsHorarios.map(h => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Término (09h–18h)</label>
                <select
                  value={horaFim}
                  onChange={e => setHoraFim(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-mono font-bold text-slate-800 outline-hidden"
                >
                  {horas.slice(1).map(h => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Atalhos Rápidos de Duração */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-mono text-slate-400 mr-1">Duração:</span>
              {[
                { label: '1h', dur: 1 },
                { label: '2h', dur: 2 },
                { label: '3h', dur: 3 },
                { label: 'Manhã (08–12h)', ini: 8, fim: 12 },
                { label: 'Tarde (14–18h)', ini: 14, fim: 18 }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    if (preset.ini !== undefined && preset.fim !== undefined) {
                      setHoraInicio(preset.ini);
                      setHoraFim(preset.fim);
                    } else if (preset.dur) {
                      setHoraFim(Math.min(18, horaInicio + preset.dur));
                    }
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-mono text-[10px] font-semibold transition cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
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
                <span>
                  Janela <strong className="font-mono">{String(horaInicio).padStart(2, '0')}:00–{String(horaFim).padStart(2, '0')}:00</strong> ({horaFim - horaInicio}h) livre em {dataSelecionada}.
                </span>
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-slate-400 transition"
              />
            </div>

            {/* Checklist de Recursos de Apoio com Destaque Visual */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Logística & Recursos de Apoio</label>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <label
                  className={`flex items-center gap-1.5 p-2 rounded-xl border cursor-pointer transition ${
                    recursoCafe
                      ? 'bg-amber-50/70 border-amber-300/80 text-amber-950 font-semibold'
                      : 'bg-slate-50/80 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={recursoCafe}
                    onChange={e => setRecursoCafe(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <Coffee size={12} className="text-amber-700 shrink-0" />
                  <span className="truncate">Copa & Café</span>
                </label>

                <label
                  className={`flex items-center gap-1.5 p-2 rounded-xl border cursor-pointer transition ${
                    recursoSuporteTI
                      ? 'bg-indigo-50/70 border-indigo-300/80 text-indigo-950 font-semibold'
                      : 'bg-slate-50/80 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={recursoSuporteTI}
                    onChange={e => setRecursoSuporteTI(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <Laptop size={12} className="text-indigo-600 shrink-0" />
                  <span className="truncate">Suporte TI</span>
                </label>

                <label
                  className={`flex items-center gap-1.5 p-2 rounded-xl border cursor-pointer transition ${
                    recursoGravacao
                      ? 'bg-rose-50/70 border-rose-300/80 text-rose-950 font-semibold'
                      : 'bg-slate-50/80 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={recursoGravacao}
                    onChange={e => setRecursoGravacao(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <Video size={12} className="text-rose-600 shrink-0" />
                  <span className="truncate">Gravação Ata</span>
                </label>

                <label
                  className={`flex items-center gap-1.5 p-2 rounded-xl border cursor-pointer transition ${
                    recursoHibrido
                      ? 'bg-sky-50/70 border-sky-300/80 text-sky-950 font-semibold'
                      : 'bg-slate-50/80 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={recursoHibrido}
                    onChange={e => setRecursoHibrido(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <Monitor size={12} className="text-sky-600 shrink-0" />
                  <span className="truncate">Transm. Híbrida</span>
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
              style={
                !colisaoAtual
                  ? { boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 12px -2px rgba(15,23,42,0.22)' }
                  : undefined
              }
              className={`w-full py-2.5 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                colisaoAtual
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-b from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 text-white'
              }`}
            >
              <Sparkles size={14} className={!colisaoAtual ? 'text-emerald-400' : ''} /> Confirmar Agendamento
            </button>
          </form>
        </div>

      </div>

      {/* =====================================================================
          SEÇÃO 3: AGENDA INSTITUCIONAL & RESERVAS ATIVAS
         ===================================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Reservas Ativas & Agenda Institucional ({reservas.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Clique em qualquer agendamento para inspecionar recursos ou liberar o espaço
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {reservas.map(r => {
            const salaRef = salas.find(s => s.id === r.salaId);
            return (
              <div
                key={r.id}
                onClick={() => {
                  soundFX.playClick();
                  setReservaInspecionada(r);
                }}
                className={`relative p-3.5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 border-l-4 ${
                  salaRef?.accentBorder || 'border-l-slate-700'
                } shadow-2xs transition-all cursor-pointer flex flex-col justify-between gap-2.5 group`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-slate-500">
                    <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                      {r.data}
                    </span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                      {String(r.horaInicio).padStart(2, '0')}:00–{String(r.horaFim).padStart(2, '0')}:00
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mt-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {r.motivo}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${salaRef?.dotColor || 'bg-slate-500'}`} />
                    {r.salaNome}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate max-w-[140px] font-medium">{r.responsavel}</span>
                  <span className="text-slate-400 group-hover:text-slate-800 font-semibold flex items-center gap-0.5">
                    Ficha <ArrowUpRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          MODAL DE INSPEÇÃO / CANCELAMENTO DE RESERVA (ESTILO PLACA CORPORATIVA)
         ===================================================================== */}
      {reservaInspecionada && (
        <div
          className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setReservaInspecionada(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200/90 space-y-4 animate-in zoom-in-95 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Cantoneiras Arquitetônicas no Modal */}
            <span className="pointer-events-none absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-slate-300" />
            <span className="pointer-events-none absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-slate-300" />
            <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-slate-300" />
            <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-slate-300" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-900 text-white">
                  <CalendarIcon size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                    Ficha de Ocupação SEJU
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">Detalhes do Agendamento</h3>
                </div>
              </div>
              <button
                onClick={() => setReservaInspecionada(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Espaço Reservado</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Check size={10} /> Confirmado
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{reservaInspecionada.salaNome}</div>
                <div className="text-[11px] text-slate-600 font-mono font-semibold">
                  Data: {reservaInspecionada.data} · Horário: {String(reservaInspecionada.horaInicio).padStart(2, '0')}:00 às {String(reservaInspecionada.horaFim).padStart(2, '0')}:00 ({reservaInspecionada.horaFim - reservaInspecionada.horaInicio}h)
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700">Objetivo / Pauta da Reunião:</span>
                <p className="mt-1 text-slate-800 font-medium bg-slate-50/90 p-3 rounded-xl border border-slate-200/80">
                  {reservaInspecionada.motivo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50/60 border border-slate-200/60">
                <div>
                  <span className="font-mono font-semibold text-slate-400 text-[9px] uppercase">Responsável</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{reservaInspecionada.responsavel}</div>
                </div>
                <div>
                  <span className="font-mono font-semibold text-slate-400 text-[9px] uppercase">Protocolo Interno</span>
                  <div className="font-mono font-bold text-slate-700 mt-0.5">#{reservaInspecionada.id.toUpperCase()}</div>
                </div>
              </div>

              {reservaInspecionada.recursosExtras && reservaInspecionada.recursosExtras.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700 text-[11px]">Logística & Recursos Solicitados:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {reservaInspecionada.recursosExtras.map((rec, i) => (
                      <span
                        key={i}
                        className="bg-indigo-50/80 text-indigo-800 text-[10px] px-2.5 py-1 rounded-lg font-semibold border border-indigo-200/70"
                      >
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

      {/* =====================================================================
          MODAL DE AGENDAMENTO COMPLETO (COM SELEÇÃO VISUAL DE SALA E RECURSOS)
         ===================================================================== */}
      {modalNovo && (
        <div
          className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setModalNovo(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200/90 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Cantoneiras Arquitetônicas */}
            <span className="pointer-events-none absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-slate-300" />
            <span className="pointer-events-none absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-slate-300" />
            <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-slate-300" />
            <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-slate-300" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600">
                  Agendamento Institucional SEJU
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Reservar Sala, Plenária ou Auditório
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
                <label className="block font-semibold text-slate-700 mb-1.5">Selecione o Espaço no Catálogo *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {salas.map(s => {
                    const active = salaId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSalaId(s.id)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200/90'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${active ? 'bg-white/15 text-emerald-300' : 'bg-slate-200/70 text-slate-600'}`}>
                            {s.codigo}
                          </span>
                          <span className={`text-[10px] font-mono ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                            {s.cap} lug.
                          </span>
                        </div>
                        <div className="font-bold text-xs mt-1 truncate">{s.nome}</div>
                        <div className={`text-[10px] truncate ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                          {s.layout} · {s.andar}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Data *</label>
                  <input
                    type="date"
                    value={dataSelecionada}
                    onChange={e => setDataSelecionada(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-mono font-semibold text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Horário Início *</label>
                  <select
                    value={horaInicio}
                    onChange={e => {
                      const novoIni = Number(e.target.value);
                      setHoraInicio(novoIni);
                      if (horaFim <= novoIni) setHoraFim(Math.min(18, novoIni + 1));
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl font-mono font-semibold text-slate-800 outline-hidden"
                  >
                    {slotsHorarios.map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Horário Término *</label>
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
                  <span>Horário 100% livre e verificado na régua cronológica.</span>
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
                  <Sparkles size={14} className="text-emerald-400" /> Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
