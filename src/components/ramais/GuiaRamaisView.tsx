import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Search, 
  Copy, 
  Check, 
  Mail, 
  Building2, 
  PhoneForwarded, 
  Network, 
  Users,
  Star,
  PhoneOff,
  Mic,
  MicOff,
  X,
  ArrowUpRight,
  ShieldCheck,
  Volume2,
  Hash,
  Radio,
  Activity,
  ChevronRight,
  CornerDownRight
} from 'lucide-react';
import { Usuario } from '../../types';
import { soundFX } from '../../services/soundFx';

export interface RamalItem {
  id: string;
  setor: string;
  departamento: string;
  responsavel: string;
  cargo: string;
  ramal: string;
  telefoneDireto: string;
  email: string;
  andar: string;
  statusPresenca: 'online' | 'reuniao' | 'missao';
  favorito?: boolean;
}

const RAMAIS_DATA: RamalItem[] = [
  {
    id: 'r1',
    setor: 'Chefia de Gabinete',
    departamento: 'Gabinete do Secretário',
    responsavel: 'Dra. Maria Helena',
    cargo: 'Chefe de Gabinete',
    ramal: '8201',
    telefoneDireto: '(41) 3310-8201',
    email: 'chefia.gabinete@seju.pr.gov.br',
    andar: '3º Andar · Sala 301',
    statusPresenca: 'online',
    favorito: true
  },
  {
    id: 'r2',
    setor: 'Gabinete · Assessoria Técnica',
    departamento: 'Gabinete do Secretário',
    responsavel: 'Recepção e Despachos Oficiais',
    cargo: 'Assessoria de Expediente',
    ramal: '8202',
    telefoneDireto: '(41) 3310-8202',
    email: 'gabinete@seju.pr.gov.br',
    andar: '3º Andar · Sala 302',
    statusPresenca: 'online'
  },
  {
    id: 'r3',
    setor: 'Setor de Transporte e Frotas',
    departamento: 'Departamento de Administração Geral (DAG)',
    responsavel: 'Marcos Viana',
    cargo: 'Gestor de Transporte e Frotas',
    ramal: '8245',
    telefoneDireto: '(41) 3310-8245',
    email: 'transporte.seju@pr.gov.br',
    andar: 'Térreo · Pátio Oficial',
    statusPresenca: 'online',
    favorito: true
  },
  {
    id: 'r4',
    setor: 'Coordenação de Direitos Humanos',
    departamento: 'Superintendência de Políticas de Garantia',
    responsavel: 'Carlos Silveira',
    cargo: 'Agente Profissional',
    ramal: '8230',
    telefoneDireto: '(41) 3310-8230',
    email: 'direitoshumanos@seju.pr.gov.br',
    andar: '1º Andar · Bloco B',
    statusPresenca: 'reuniao'
  },
  {
    id: 'r5',
    setor: 'Departamento de TI & Suporte Técnico',
    departamento: 'Tecnologia da Informação',
    responsavel: 'Helpdesk & Redes',
    cargo: 'Central de Suporte aos Usuários',
    ramal: '8299',
    telefoneDireto: '(41) 3310-8299',
    email: 'suporte.ti@seju.pr.gov.br',
    andar: '2º Andar · Sala 201',
    statusPresenca: 'online',
    favorito: true
  },
  {
    id: 'r6',
    setor: 'Recursos Humanos / Gestão de Pessoas',
    departamento: 'Departamento de Administração Geral (DAG)',
    responsavel: 'Atendimento Funcional e Folha',
    cargo: 'Coordenação de Recursos Humanos',
    ramal: '8215',
    telefoneDireto: '(41) 3310-8215',
    email: 'rh@seju.pr.gov.br',
    andar: '1º Andar · Sala 102',
    statusPresenca: 'online'
  },
  {
    id: 'r7',
    setor: 'Ouvidoria Geral e Protocolo',
    departamento: 'Ouvidoria Setorial',
    responsavel: 'Atendimento ao Cidadão e Protocolo',
    cargo: 'Recepção Geral',
    ramal: '8200',
    telefoneDireto: '(41) 3310-8200',
    email: 'ouvidoria@seju.pr.gov.br',
    andar: 'Térreo · Entrada Principal',
    statusPresenca: 'online'
  },
  {
    id: 'r8',
    setor: 'Assessoria Jurídica',
    departamento: 'Procuradoria Setorial',
    responsavel: 'Dra. Patrícia Lima',
    cargo: 'Assessora Jurídica Chefe',
    ramal: '8220',
    telefoneDireto: '(41) 3310-8220',
    email: 'juridico@seju.pr.gov.br',
    andar: '3º Andar · Sala 305',
    statusPresenca: 'missao'
  }
];

interface GuiaRamaisViewProps {
  currentUser?: Usuario;
  onVoltarHub: () => void;
}

function extrairIniciais(nome: string): string {
  const limpo = nome.replace(/^(Dra?\.|Prof\.|Eng\.)\s+/i, '').trim();
  const partes = limpo.split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'SJ';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export const GuiaRamaisView: React.FC<GuiaRamaisViewProps> = ({ onVoltarHub }) => {
  const [ramais, setRamais] = useState<RamalItem[]>(RAMAIS_DATA);
  const [busca, setBusca] = useState('');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [modoVisualizacao, setModoVisualizacao] = useState<'diretorio' | 'organograma' | 'favoritos'>('diretorio');
  const [filtroDepto, setFiltroDepto] = useState<string>('todos');
  const [filtroAndar, setFiltroAndar] = useState<string>('todos');

  // Estado da Ligação VoIP Ativa (Simulador CallKit / Webex Executive)
  const [chamadaAtiva, setChamadaAtiva] = useState<RamalItem | null>(null);
  const [chamadaSegundos, setChamadaSegundos] = useState(0);
  const [chamadaMutada, setChamadaMutada] = useState(false);
  const [vivaVozAtivo, setVivaVozAtivo] = useState(true);
  const [tecladoDtmfAberto, setTecladoDtmfAberto] = useState(false);
  const [dtmfDigitado, setDtmfDigitado] = useState('');
  const [ondaTick, setOndaTick] = useState(0);

  // Timer da ligação ativa + animação de espectro de voz
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let waveTimer: ReturnType<typeof setInterval> | undefined;
    if (chamadaAtiva) {
      timer = setInterval(() => {
        setChamadaSegundos(prev => prev + 1);
      }, 1000);
      waveTimer = setInterval(() => {
        setOndaTick(prev => (prev + 1) % 100);
      }, 180);
    } else {
      setChamadaSegundos(0);
      setDtmfDigitado('');
      setTecladoDtmfAberto(false);
    }
    return () => {
      if (timer) clearInterval(timer);
      if (waveTimer) clearInterval(waveTimer);
    };
  }, [chamadaAtiva]);

  const handleCopiar = (id: string, texto: string) => {
    soundFX.playClick();
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const handleToggleFavorito = (id: string) => {
    soundFX.playClick();
    setRamais(prev => prev.map(r => r.id === id ? { ...r, favorito: !r.favorito } : r));
  };

  const handleIniciarChamada = (r: RamalItem) => {
    soundFX.playClick();
    setChamadaAtiva(r);
    setChamadaMutada(false);
    setDtmfDigitado('');
  };

  const handleEncerrarChamada = () => {
    soundFX.playWarning();
    setChamadaAtiva(null);
  };

  const handlePressionarDtmf = (digito: string) => {
    soundFX.playClick();
    setDtmfDigitado(prev => (prev + digito).slice(-12));
  };

  const formatarDuracao = (seg: number) => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const departamentos = [
    { id: 'todos', label: 'Todos os Setores' },
    { id: 'Gabinete', label: 'Gabinete Superior' },
    { id: 'DAG', label: 'Administração / DAG' },
    { id: 'TI', label: 'Tecnologia / TI' },
    { id: 'Direitos Humanos', label: 'Direitos Humanos' },
    { id: 'Ouvidoria', label: 'Ouvidoria & Protocolo' },
    { id: 'Procuradoria', label: 'Assessoria Jurídica' }
  ];

  // Painel de Elevador Executivo (Andares do Edifício Sede SEJU)
  const andaresElevador = [
    { id: 'todos', codigo: 'ALL', andarLabel: 'Todos Pavimentos', sub: 'Visão Integral', corLed: 'bg-sky-400' },
    { id: '3º Andar', codigo: '03F', andarLabel: '3º Andar · Cúpula', sub: 'Gabinete & Jurídico', corLed: 'bg-amber-400' },
    { id: '2º Andar', codigo: '02F', andarLabel: '2º Andar · Digital', sub: 'TI, Redes & Suporte', corLed: 'bg-cyan-400' },
    { id: '1º Andar', codigo: '01F', andarLabel: '1º Andar · Gestão', sub: 'Direitos Humanos & RH', corLed: 'bg-emerald-400' },
    { id: 'Térreo', codigo: 'TER', andarLabel: 'Térreo · Operações', sub: 'Frotas & Ouvidoria', corLed: 'bg-indigo-400' }
  ];

  const ramaisFiltrados = ramais.filter(r => {
    const matchBusca = 
      r.setor.toLowerCase().includes(busca.toLowerCase()) ||
      r.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
      r.ramal.includes(busca) ||
      r.departamento.toLowerCase().includes(busca.toLowerCase()) ||
      r.cargo.toLowerCase().includes(busca.toLowerCase());

    const matchDepto = 
      filtroDepto === 'todos' || 
      r.setor.toLowerCase().includes(filtroDepto.toLowerCase()) ||
      r.departamento.toLowerCase().includes(filtroDepto.toLowerCase());

    const matchAndar =
      filtroAndar === 'todos' ||
      r.andar.toLowerCase().includes(filtroAndar.toLowerCase());

    const matchFav = modoVisualizacao === 'favoritos' ? Boolean(r.favorito) : true;

    return matchBusca && matchDepto && matchAndar && matchFav;
  });

  const totalOnline = ramais.filter(r => r.statusPresenca === 'online').length;
  const totalReuniao = ramais.filter(r => r.statusPresenca === 'reuniao').length;
  const totalMissao = ramais.filter(r => r.statusPresenca === 'missao').length;
  const totalFavoritos = ramais.filter(r => r.favorito).length;

  const contarPorAndar = (idAndar: string) => {
    if (idAndar === 'todos') return ramais.length;
    return ramais.filter(r => r.andar.toLowerCase().includes(idAndar.toLowerCase())).length;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12">
      
      {/* (1) CABEÇALHO EXECUTIVO DE TELECOMUNICAÇÕES VOIP & CONTROLE DE PAVIMENTOS */}
      <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Barra Superior Técnica de Telemetria SIP */}
        <div className="bg-slate-950 text-slate-300 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-3">
            <button
              onClick={onVoltarHub}
              className="text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-800"
            >
              ← Central de Aplicativos
            </button>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-sky-400 font-semibold flex items-center gap-1.5">
              <Radio size={12} className="text-emerald-400 animate-pulse" />
              PABX IP Trunk SEJU-PR · SIP TLS 1.3
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[10px]">
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-400">
              <Activity size={11} className="text-emerald-400" />
              LATÊNCIA: <strong className="text-emerald-400">2.4ms</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              CODEC OPUS 48kHz HD
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Título, Telemetria de Presença e Seletor de Modo */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
                <PhoneCall size={22} />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Catálogo de Ramais, Console VoIP & Organograma SEJU
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200/80 text-[#0072BB] font-mono text-[10px] font-bold uppercase tracking-wider">
                    Sede Hauer & Unidades
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Diretório tátil com anéis de presença ao vivo, seletor de pavimento estilo elevador executivo e discagem CallKit.
                </p>
              </div>
            </div>

            {/* Indicadores de Presença Ao Vivo + Seletor de Visão */}
            <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center gap-1.5" title="Servidores Disponíveis no Posto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  <span className="text-slate-600 font-medium">Disponível:</span>
                  <span className="font-mono font-bold text-slate-900">{totalOnline}</span>
                </div>
                <div className="h-3.5 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5" title="Em Reunião">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-mono font-bold text-slate-700">{totalReuniao}</span>
                </div>
                <div className="h-3.5 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5" title="Em Missão Externa">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-mono font-bold text-slate-700">{totalMissao}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setModoVisualizacao('diretorio');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    modoVisualizacao === 'diretorio'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users size={13} /> Diretório VoIP
                </button>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    setModoVisualizacao('organograma');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    modoVisualizacao === 'organograma'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Network size={13} /> Organograma
                </button>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    setModoVisualizacao('favoritos');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    modoVisualizacao === 'favoritos'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  <span>Favoritos</span>
                  <span className="font-mono text-[10px] opacity-80">({totalFavoritos})</span>
                </button>
              </div>
            </div>
          </div>

          {/* PAINEL DE ELEVADOR EXECUTIVO (FILTRO TÁTIL POR ANDAR DO EDIFÍCIO SEJU) */}
          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 shadow-inner space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Building2 size={13} className="text-amber-400" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-300 font-bold">
                  Painel de Elevador Executivo · Seletor de Pavimento SEJU
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
                Pressione o andar para isolar salas e ramais do pavimento
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {andaresElevador.map(item => {
                const ativo = filtroAndar === item.id;
                const qtd = contarPorAndar(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setFiltroAndar(item.id);
                      if (modoVisualizacao === 'organograma') {
                        setModoVisualizacao('diretorio');
                      }
                    }}
                    className={`group relative text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      ativo
                        ? 'bg-slate-800/95 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                        : 'bg-slate-900/90 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Botão Redondo Iluminado de Elevador */}
                      <div
                        className={`w-9 h-9 rounded-full border-2 flex flex-col items-center justify-center font-mono text-[11px] font-extrabold shrink-0 transition-all ${
                          ativo
                            ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.35)]'
                            : 'bg-slate-950 border-slate-700 text-slate-400 group-hover:border-slate-500 group-hover:text-slate-200'
                        }`}
                      >
                        {item.codigo}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${ativo ? 'text-white' : 'text-slate-300'}`}>
                          {item.andarLabel}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.sub}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full mb-1 ${ativo ? 'bg-amber-400 animate-ping' : item.corLed}`} />
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800">
                        {qtd}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Linha Inferior do Header: Busca Instantânea e Pílulas de Departamento */}
          <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por servidor, cargo, setor (Gabinete, TI, Frota) ou ramal (ex: 8201)..."
                className="w-full text-xs pl-10 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0072BB]/20 focus:border-[#0072BB] text-slate-800 transition"
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
              {departamentos.map(dep => (
                <button
                  key={dep.id}
                  onClick={() => {
                    soundFX.playClick();
                    setFiltroDepto(dep.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 cursor-pointer text-xs border ${
                    filtroDepto === dep.id
                      ? 'bg-[#0072BB] text-white border-[#0072BB] shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200/80'
                  }`}
                >
                  {dep.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* (2) GRID DE CARDS CHANFRADOS OU ORGANOGRAMA HIERÁRQUICO ILUMINADO */}
      {modoVisualizacao !== 'organograma' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                Exibindo <strong className="text-slate-900 font-mono">{ramaisFiltrados.length}</strong> ramal(is) operacional(is)
              </span>
              {(filtroAndar !== 'todos' || filtroDepto !== 'todos') && (
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setFiltroAndar('todos');
                    setFiltroDepto('todos');
                  }}
                  className="text-[11px] font-semibold text-[#0072BB] hover:underline cursor-pointer"
                >
                  Limpar filtros ativos ×
                </button>
              )}
            </div>
            <span className="font-mono text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80">
              Discagem Direta Externa (DDR): <strong className="text-slate-800">(41) 3310-XXXX</strong>
            </span>
          </div>

          {ramaisFiltrados.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <PhoneCall size={18} />
              </div>
              <div className="text-sm font-bold text-slate-800">Nenhum ramal localizado neste pavimento/setor</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Utilize o Painel de Elevador acima para alternar para "Todos Pavimentos" ou redefina sua pesquisa.
              </p>
              <button
                onClick={() => {
                  setBusca('');
                  setFiltroAndar('todos');
                  setFiltroDepto('todos');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer hover:bg-slate-800 transition"
              >
                Restaurar Todos os Ramais
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ramaisFiltrados.map(r => {
                const iniciais = extrairIniciais(r.responsavel);
                const statusConfig =
                  r.statusPresenca === 'online'
                    ? {
                        label: 'Disponível',
                        ringAvatar: 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white',
                        dotColor: 'bg-emerald-500',
                        badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200/90',
                        topAccent: 'from-emerald-500 via-sky-500 to-transparent'
                      }
                    : r.statusPresenca === 'reuniao'
                    ? {
                        label: 'Em Reunião',
                        ringAvatar: 'ring-2 ring-amber-500 ring-offset-2 ring-offset-white',
                        dotColor: 'bg-amber-500',
                        badgeClass: 'text-amber-800 bg-amber-50 border-amber-200/90',
                        topAccent: 'from-amber-500 via-orange-400 to-transparent'
                      }
                    : {
                        label: 'Em Missão',
                        ringAvatar: 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white',
                        dotColor: 'bg-indigo-500',
                        badgeClass: 'text-indigo-800 bg-indigo-50 border-indigo-200/90',
                        topAccent: 'from-indigo-500 via-sky-500 to-transparent'
                      };

                return (
                  <div
                    key={r.id}
                    className="group relative bg-white p-5 rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-4 overflow-hidden"
                  >
                    {/* Filete Superior de Status */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${statusConfig.topAccent}`} />

                    {/* Topo do Card: Departamento, Status Ao Vivo e Tecla VoIP Tátil do Ramal */}
                    <div className="flex items-start justify-between gap-3 pt-0.5">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200/90">
                            {r.departamento}
                          </span>

                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1.5 ${statusConfig.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} ${r.statusPresenca === 'online' ? 'animate-pulse' : ''}`} />
                            {statusConfig.label}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate group-hover:text-[#0072BB] transition-colors">
                          {r.setor}
                        </h3>
                      </div>

                      {/* Favorito + Botão de Ramal Estilo Tecla VoIP Tátil Mecânica */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleFavorito(r.id)}
                          className="p-2 rounded-lg border border-slate-200/70 hover:border-amber-300 bg-slate-50/70 hover:bg-amber-50/50 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                          title={r.favorito ? 'Remover dos favoritos' : 'Fixar nos favoritos'}
                        >
                          <Star size={14} className={r.favorito ? 'text-amber-500 fill-amber-500' : ''} />
                        </button>

                        {/* Tecla VoIP Tátil Esculpida */}
                        <button
                          onClick={() => handleCopiar(r.id, r.ramal)}
                          title="Tecla VoIP Tátil: Clique para copiar o ramal"
                          className="relative px-3 py-1.5 rounded-lg bg-gradient-to-b from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 active:translate-y-0.5 text-white font-mono border border-slate-700 shadow-[0_3px_0_0_#0f172a] active:shadow-[0_1px_0_0_#0f172a] transition-all cursor-pointer flex items-center gap-2 shrink-0"
                        >
                          <span className={`w-1.5 h-3.5 rounded-full ${statusConfig.dotColor}`} />
                          <div className="text-left leading-none">
                            <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-semibold">
                              TECLA EXT
                            </span>
                            <span className="text-sm font-extrabold tracking-tight tabular-nums text-white">
                              {r.ramal}
                            </span>
                          </div>
                          {copiadoId === r.id ? (
                            <Check size={13} className="text-emerald-400 ml-0.5" />
                          ) : (
                            <Copy size={12} className="text-slate-400 ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Corpo: Avatar com Anel de Status Ao Vivo + Pavimento Estilo Sinalização */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar com Anel Ao Vivo */}
                        <div className="relative shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center ${statusConfig.ringAvatar}`}
                          >
                            {iniciais}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusConfig.dotColor}`}
                            title={`Status: ${statusConfig.label}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{r.responsavel}</div>
                          <div className="text-[11px] text-slate-500 truncate">{r.cargo}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0 sm:border-l sm:border-slate-200/80 sm:pl-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-mono text-[10px] font-extrabold flex items-center justify-center shrink-0 border border-slate-700">
                          {r.andar.startsWith('3') ? '03F' : r.andar.startsWith('2') ? '02F' : r.andar.startsWith('1') ? '01F' : 'TER'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate">{r.andar}</div>
                          <div className="font-mono text-[11px] text-slate-500 tabular-nums truncate">{r.telefoneDireto}</div>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé de Ações Rápidas (E-mail & Tecla de Discagem VoIP Direta) */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-[11px] text-slate-500 truncate">
                        {r.email}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`mailto:${r.email}`}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold transition flex items-center gap-1.5 border border-slate-200/80"
                          title={`Enviar e-mail institucional para ${r.email}`}
                        >
                          <Mail size={13} />
                          <span className="hidden sm:inline">E-mail</span>
                        </a>

                        <button
                          onClick={() => handleIniciarChamada(r)}
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-b from-[#0084D6] to-[#0062A3] hover:from-[#0072BB] hover:to-[#005187] active:translate-y-0.5 text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-[0_2px_0_0_#003d66]"
                        >
                          <PhoneForwarded size={13} /> Discar VoIP
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* (3) MODO ORGANOGRAMA INSTITUCIONAL HIERÁRQUICO COM LINHAS CONECTORAS, CANTONEIRAS E DESTAQUE LUMINOSO */
        <div className="relative bg-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl overflow-hidden space-y-8">
          {/* Malha Arquitetônica de Fundo + Cantoneiras Externas */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />
          <span className="pointer-events-none absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-sky-400/60" />
          <span className="pointer-events-none absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-sky-400/60" />
          <span className="pointer-events-none absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-sky-400/60" />
          <span className="pointer-events-none absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-sky-400/60" />

          <div className="relative z-10 text-center space-y-1.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 font-mono text-[10px] uppercase tracking-widest">
              <Network size={12} /> Arquitetura Hierárquica & Comando VoIP SEJU-PR
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Cadeia de Comando: Secretário → Diretorias → Núcleos Operacionais
            </h3>
            <p className="text-xs text-slate-400">
              Clique em qualquer unidade para filtrar seus ramais ou acione a discagem VoIP imediata no próprio bloco hierárquico.
            </p>
          </div>

          {/* ÁRVORE HIERÁRQUICA DE 3 NÍVEIS COM CONECTORES LUMINOSOS */}
          <div className="relative z-10 max-w-5xl mx-auto space-y-0">
            
            {/* NÍVEL 1: SECRETÁRIO / GABINETE SUPERIOR */}
            <div className="max-w-xl mx-auto relative group">
              <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 p-5 rounded-xl border border-sky-400/50 shadow-[0_0_30px_rgba(14,165,233,0.18)] text-left transition hover:border-sky-300">
                {/* Cantoneiras Técnicas nos 4 Cantos */}
                <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-sky-400" />
                <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-sky-400" />
                <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-sky-400" />
                <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-sky-400" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 font-mono text-[10px] font-bold uppercase tracking-widest text-sky-300">
                        NÍVEL I · CÚPULA DIRETIVA
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> 3º Andar
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      Gabinete do Secretário da Justiça e Cidadania
                    </h4>
                    <p className="text-xs text-slate-300">
                      Chefia de Gabinete: <strong className="text-white">Dra. Maria Helena</strong> · Assessoria Técnica & Despachos
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <button
                      onClick={() => handleIniciarChamada(ramais[0])}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <PhoneForwarded size={13} /> EXT 8201
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setFiltroDepto('Gabinete');
                        setModoVisualizacao('diretorio');
                      }}
                      className="text-[11px] font-semibold text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      Abrir Gabinete <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CONECTOR VERTICAL NÍVEL 1 -> BARRAMENTO HORIZONTAL NÍVEL 2 */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-7 bg-gradient-to-b from-sky-400 to-sky-500/60 relative">
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
              </div>
              {/* Barramento horizontal para 3 colunas em telas grandes */}
              <div className="hidden md:grid grid-cols-3 w-full max-w-4xl">
                <div className="h-5 border-t-2 border-l-2 border-sky-500/40 rounded-tl-lg ml-[50%]" />
                <div className="h-5 border-t-2 border-sky-500/40 relative">
                  <div className="w-0.5 h-5 bg-sky-500/40 mx-auto" />
                </div>
                <div className="h-5 border-t-2 border-r-2 border-sky-500/40 rounded-tr-lg mr-[50%]" />
              </div>
            </div>

            {/* NÍVEL 2: DIRETORIAS E DEPARTAMENTOS EXECUTIVOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  codigo: 'DIR-01',
                  sub: 'Administração & Logística',
                  titulo: 'Departamento de Administração (DAG)',
                  titular: 'Marcos Viana · Gestão de Frotas e RH',
                  andar: 'Térreo & 1º Andar',
                  ramalPrincipal: '8245',
                  filtro: 'DAG',
                  ramalObj: ramais[2],
                  nucleos: [
                    { nome: 'Setor de Transporte e Frotas', ramal: '8245', andar: 'Térreo', item: ramais[2] },
                    { nome: 'Coordenação de Recursos Humanos', ramal: '8215', andar: '1º Andar', item: ramais[5] }
                  ]
                },
                {
                  codigo: 'DIR-02',
                  sub: 'Infraestrutura & Sistemas',
                  titulo: 'Diretoria de Tecnologia & Governança',
                  titular: 'Helpdesk, Redes & Segurança Criptográfica',
                  andar: '2º Andar · Sala 201',
                  ramalPrincipal: '8299',
                  filtro: 'TI',
                  ramalObj: ramais[4],
                  nucleos: [
                    { nome: 'Central Helpdesk & Redes VoIP', ramal: '8299', andar: '2º Andar', item: ramais[4] },
                    { nome: 'Assessoria Jurídica / Procuradoria', ramal: '8220', andar: '3º Andar', item: ramais[7] }
                  ]
                },
                {
                  codigo: 'DIR-03',
                  sub: 'Cidadania & Atendimento',
                  titulo: 'Superintendência de Direitos Humanos',
                  titular: 'Carlos Silveira · Políticas e Ouvidoria',
                  andar: '1º Andar & Térreo',
                  ramalPrincipal: '8230',
                  filtro: 'Direitos Humanos',
                  ramalObj: ramais[3],
                  nucleos: [
                    { nome: 'Coordenação de Direitos Humanos', ramal: '8230', andar: '1º Andar', item: ramais[3] },
                    { nome: 'Ouvidoria Geral e Protocolo', ramal: '8200', andar: 'Térreo', item: ramais[6] }
                  ]
                }
              ].map(dir => (
                <div key={dir.codigo} className="flex flex-col">
                  {/* Card Nível 2 (Diretoria) */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/90 hover:border-slate-600 transition shadow-md flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-sky-400 font-bold uppercase tracking-wider">
                          NÍVEL II · {dir.codigo}
                        </span>
                        <span className="text-slate-400">{dir.andar}</span>
                      </div>
                      <h5 className="font-bold text-sm text-white leading-snug">
                        {dir.titulo}
                      </h5>
                      <p className="text-xs text-slate-400">
                        {dir.titular}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setFiltroDepto(dir.filtro);
                          setModoVisualizacao('diretorio');
                        }}
                        className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                      >
                        Filtrar Diretoria <ChevronRight size={13} />
                      </button>

                      <button
                        onClick={() => handleIniciarChamada(dir.ramalObj)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-300 font-mono text-[11px] font-bold border border-slate-700 transition cursor-pointer flex items-center gap-1"
                      >
                        <PhoneCall size={11} /> {dir.ramalPrincipal}
                      </button>
                    </div>
                  </div>

                  {/* Conector Vertical para Nível 3 (Núcleos Operacionais) */}
                  <div className="pl-5 pt-2 space-y-2 relative">
                    <div className="absolute left-2.5 top-0 bottom-4 w-px bg-slate-700" />
                    {dir.nucleos.map(nuc => (
                      <div
                        key={nuc.ramal}
                        className="relative bg-slate-900/60 hover:bg-slate-800/90 p-3 rounded-lg border border-slate-800 hover:border-slate-600 transition flex items-center justify-between gap-2"
                      >
                        <CornerDownRight size={13} className="text-sky-400/70 shrink-0 -ml-1" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-200 truncate">
                            {nuc.nome}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Núcleo Operacional · {nuc.andar}
                          </div>
                        </div>
                        <button
                          onClick={() => handleIniciarChamada(nuc.item)}
                          className="px-2.5 py-1 rounded bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-slate-700 font-mono text-[11px] font-bold transition cursor-pointer shrink-0"
                          title={`Discar VoIP para ramal ${nuc.ramal}`}
                        >
                          EXT {nuc.ramal}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* (4) SIMULADOR DE LIGAÇÃO VOIP — WIDGET FLUTUANTE CALLKIT / WEBEX EXECUTIVE */}
      {chamadaAtiva && (
        <div className="fixed inset-0 bg-slate-950/65 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div
            style={{
              clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))'
            }}
            className="relative bg-slate-950 text-white max-w-md w-full p-6 shadow-2xl border border-slate-700/90 space-y-5 overflow-hidden animate-in zoom-in-95"
          >
            {/* Malha Sutil + Cantoneiras Executive CallKit */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_65%)]" />
            <span className="pointer-events-none absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-sky-400/70" />
            <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-sky-400/70" />

            {/* Top Bar do CallKit */}
            <div className="relative z-10 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400 border-b border-slate-800/90 pb-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck size={13} /> SRTP AES-256 · CALLKIT SEJU
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-400">
                CANAL VOIP #{chamadaAtiva.ramal}
              </span>
            </div>

            {/* Avatar Pulsante + Identificação Executiva */}
            <div className="relative z-10 flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-sky-400/50 text-white flex items-center justify-center font-mono font-extrabold text-xl shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                  {extrairIniciais(chamadaAtiva.responsavel)}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
              </div>

              <div className="text-left min-w-0 flex-1 space-y-0.5">
                <div className="text-[11px] text-sky-400 font-mono uppercase tracking-wider font-semibold">
                  {chamadaAtiva.andar}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {chamadaAtiva.responsavel}
                </h3>
                <p className="text-xs text-slate-400 truncate">{chamadaAtiva.setor}</p>
                <p className="text-[11px] font-mono text-slate-500">{chamadaAtiva.telefoneDireto}</p>
              </div>
            </div>

            {/* Display de Onda Sonora Animada (Audio Waveform) + Cronômetro Tabular */}
            <div className="relative z-10 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Duração da Sessão
                  </span>
                  <span className="font-mono text-2xl font-extrabold text-emerald-400 tabular-nums tracking-tight">
                    {formatarDuracao(chamadaSegundos)}
                  </span>
                </div>

                {/* Barras de Onda Sonora Animadas */}
                <div className="flex items-end gap-1 h-9 px-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(barIdx => {
                    const alturaDinamica = chamadaMutada
                      ? 18
                      : 25 + ((ondaTick * 17 + barIdx * 23) % 75);
                    return (
                      <span
                        key={barIdx}
                        style={{ height: `${alturaDinamica}%` }}
                        className={`w-1.5 rounded-full transition-all duration-150 ${
                          chamadaMutada
                            ? 'bg-amber-500/40'
                            : barIdx % 2 === 0
                            ? 'bg-emerald-400'
                            : 'bg-sky-400'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {dtmfDigitado && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400 text-[10px]">TOM DTMF ENVIADO:</span>
                  <span className="text-amber-300 font-bold tracking-widest">{dtmfDigitado}</span>
                </div>
              )}
            </div>

            {/* Teclado DTMF Tátil Expansível */}
            {tecladoDtmfAberto && (
              <div className="relative z-10 grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 animate-in fade-in">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(tecla => (
                  <button
                    key={tecla}
                    type="button"
                    onClick={() => handlePressionarDtmf(tecla)}
                    className="py-2 rounded-lg bg-slate-950 hover:bg-slate-800 active:translate-y-0.5 border border-slate-800 font-mono text-sm font-bold text-white shadow-[0_2px_0_0_#020617] cursor-pointer transition"
                  >
                    {tecla}
                  </button>
                ))}
              </div>
            )}

            {/* Controles Esculpidos do Console CallKit / Webex */}
            <div className="relative z-10 grid grid-cols-4 gap-2.5 pt-1">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setChamadaMutada(!chamadaMutada);
                }}
                className={`p-3 rounded-xl border font-semibold text-[11px] flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  chamadaMutada
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                }`}
                title={chamadaMutada ? 'Ativar Microfone' : 'Silenciar Microfone'}
              >
                {chamadaMutada ? <MicOff size={17} /> : <Mic size={17} />}
                <span>{chamadaMutada ? 'Mutado' : 'Microfone'}</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  setVivaVozAtivo(!vivaVozAtivo);
                }}
                className={`p-3 rounded-xl border font-semibold text-[11px] flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  vivaVozAtivo
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
                title="Alternar Áudio HD / Viva-Voz"
              >
                <Volume2 size={17} />
                <span>Áudio HD</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  setTecladoDtmfAberto(!tecladoDtmfAberto);
                }}
                className={`p-3 rounded-xl border font-semibold text-[11px] flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  tecladoDtmfAberto
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                }`}
                title="Abrir Teclado DTMF"
              >
                <Hash size={17} />
                <span>Teclado</span>
              </button>

              <button
                onClick={handleEncerrarChamada}
                className="p-3 rounded-xl bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white border border-red-400/40 font-bold text-[11px] flex flex-col items-center justify-center gap-1 transition cursor-pointer shadow-[0_3px_0_0_#450a0a] active:translate-y-0.5"
                title="Encerrar Ligação VoIP"
              >
                <PhoneOff size={17} />
                <span>Encerrar</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

