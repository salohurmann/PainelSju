import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Search, 
  Copy, 
  Check, 
  Mail, 
  Building2, 
  User, 
  PhoneForwarded, 
  Network, 
  Users,
  Star,
  PhoneOff,
  Mic,
  MicOff,
  X,
  ArrowUpRight,
  ShieldCheck
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

export const GuiaRamaisView: React.FC<GuiaRamaisViewProps> = ({ onVoltarHub }) => {
  const [ramais, setRamais] = useState<RamalItem[]>(RAMAIS_DATA);
  const [busca, setBusca] = useState('');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [modoVisualizacao, setModoVisualizacao] = useState<'diretorio' | 'organograma' | 'favoritos'>('diretorio');
  const [filtroDepto, setFiltroDepto] = useState<string>('todos');

  // Estado da Ligação VoIP Ativa
  const [chamadaAtiva, setChamadaAtiva] = useState<RamalItem | null>(null);
  const [chamadaSegundos, setChamadaSegundos] = useState(0);
  const [chamadaMutada, setChamadaMutada] = useState(false);

  // Timer da ligação ativa
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (chamadaAtiva) {
      timer = setInterval(() => {
        setChamadaSegundos(prev => prev + 1);
      }, 1000);
    } else {
      setChamadaSegundos(0);
    }
    return () => {
      if (timer) clearInterval(timer);
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
  };

  const handleEncerrarChamada = () => {
    soundFX.playWarning();
    setChamadaAtiva(null);
  };

  const formatarDuracao = (seg: number) => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const departamentos = [
    { id: 'todos', label: 'Todos os Setores' },
    { id: 'Gabinete', label: 'Gabinete (3º Andar)' },
    { id: 'DAG', label: 'Administração / DAG' },
    { id: 'TI', label: 'Tecnologia / TI' },
    { id: 'Direitos Humanos', label: 'Direitos Humanos' },
    { id: 'Ouvidoria', label: 'Ouvidoria / Térreo' }
  ];

  const ramaisFiltrados = ramais.filter(r => {
    const matchBusca = 
      r.setor.toLowerCase().includes(busca.toLowerCase()) ||
      r.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
      r.ramal.includes(busca) ||
      r.departamento.toLowerCase().includes(busca.toLowerCase());

    const matchDepto = 
      filtroDepto === 'todos' || 
      r.setor.toLowerCase().includes(filtroDepto.toLowerCase()) ||
      r.departamento.toLowerCase().includes(filtroDepto.toLowerCase());

    const matchFav = modoVisualizacao === 'favoritos' ? Boolean(r.favorito) : true;

    return matchBusca && matchDepto && matchFav;
  });

  const totalOnline = ramais.filter(r => r.statusPresenca === 'online').length;
  const totalFavoritos = ramais.filter(r => r.favorito).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* (1) TOP EXECUTIVE HEADER WITH INSTANT SEARCH & DEPARTMENT FILTER PILLS */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-5">
        {/* Linha Superior: Navegação, Título, Métricas e Alternador de Visão */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button
                onClick={onVoltarHub}
                className="hover:text-slate-900 font-medium transition-colors cursor-pointer"
              >
                ← Central de Aplicativos
              </button>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-700">Comunicação Interna & VoIP</span>
              <span className="hidden sm:inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
                PABX Digital Gov.PR
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200/70 flex items-center justify-center text-sky-600 shrink-0">
                <PhoneCall size={18} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Catálogo de Ramais, Discagem VoIP & Estrutura SEJU
                </h2>
                <p className="text-xs text-slate-500">
                  Diretório unificado de unidades administrativas, presença em tempo real e comunicação direta.
                </p>
              </div>
            </div>
          </div>

          {/* Métricas Compactas + Seletor de Modo */}
          <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="hidden sm:flex items-center gap-3.5 px-3.5 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-500">No Posto:</span>
                <span className="font-mono font-bold text-slate-900">{totalOnline}/{ramais.length}</span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="font-mono font-bold text-slate-900">{totalFavoritos}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 shrink-0">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setModoVisualizacao('diretorio');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  modoVisualizacao === 'diretorio'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users size={13} /> Diretório
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  setModoVisualizacao('organograma');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  modoVisualizacao === 'organograma'
                    ? 'bg-white text-slate-900 shadow-2xs'
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  modoVisualizacao === 'favoritos'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Star size={13} className="text-amber-500 fill-amber-500" /> Favoritos
              </button>
            </div>
          </div>
        </div>

        {/* Linha Inferior do Header: Busca Instantânea e Pílulas de Filtro de Departamento */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome do servidor, setor (Gabinete, TI, Frota) ou ramal..."
              className="w-full text-xs pl-10 pr-8 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-800 transition"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
                className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 cursor-pointer text-xs border ${
                  filtroDepto === dep.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50/70 text-slate-600 hover:bg-slate-100 border-slate-200/70'
                }`}
              >
                {dep.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* (2) DIVIDED DIRECTORY GRID WITH CLEAN CONTACT CARDS OR ORGANOGRAMA */}
      {modoVisualizacao !== 'organograma' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-medium">
              Exibindo <strong className="text-slate-800">{ramaisFiltrados.length}</strong> unidade(s) de atendimento interno
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Prefixo externo: (41) 3310-XXXX
            </span>
          </div>

          {ramaisFiltrados.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-2">
              <div className="text-xs font-semibold text-slate-700">Nenhum ramal localizado</div>
              <p className="text-xs text-slate-400">
                Tente redefinir os termos de busca ou selecionar "Todos os Setores".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ramaisFiltrados.map(r => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between gap-4"
                >
                  {/* Topo do Card: Departamento, Status, Setor + Favorito e Badge de Ramal */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                          {r.departamento}
                        </span>

                        {r.statusPresenca === 'online' && (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> No Posto
                          </span>
                        )}
                        {r.statusPresenca === 'reuniao' && (
                          <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Em Reunião
                          </span>
                        )}
                        {r.statusPresenca === 'missao' && (
                          <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Em Missão Externa
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                        {r.setor}
                      </h3>
                    </div>

                    {/* Ações de Topo: Favoritar + Badge do Ramal e Copiar */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleFavorito(r.id)}
                        className="p-2 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                        title={r.favorito ? 'Remover dos favoritos' : 'Fixar nos favoritos'}
                      >
                        <Star size={15} className={r.favorito ? 'text-amber-500 fill-amber-500' : ''} />
                      </button>

                      <button
                        onClick={() => handleCopiar(r.id, r.ramal)}
                        title="Copiar número do ramal"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0"
                      >
                        <span className="text-slate-400 font-normal text-[10px]">RAMAL</span>
                        <span className="text-sm tracking-tight">{r.ramal}</span>
                        {copiadoId === r.id ? (
                          <Check size={13} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} className="text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Corpo Dividido: Responsável e Localização */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
                        <User size={13} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{r.responsavel}</div>
                        <div className="text-[11px] text-slate-500 truncate">{r.cargo}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
                        <Building2 size={13} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 truncate">{r.andar}</div>
                        <div className="font-mono text-[11px] text-slate-500 truncate">{r.telefoneDireto}</div>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé de Ações Rápidas (One-tap Call / Email / Copy) */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-[11px] text-slate-500 truncate">
                      {r.email}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`mailto:${r.email}`}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 font-medium transition flex items-center gap-1.5"
                        title={`Enviar e-mail para ${r.email}`}
                      >
                        <Mail size={13} />
                        <span className="hidden sm:inline">E-mail</span>
                      </a>

                      <button
                        onClick={() => handleIniciarChamada(r)}
                        className="px-3 py-1.5 rounded-xl bg-[#0072BB] hover:bg-[#005a96] text-white font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <PhoneForwarded size={13} /> Discar VoIP
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Modo 2: Organograma Executivo em Árvore Interativo */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-8">
          <div className="text-center space-y-1 max-w-xl mx-auto">
            <span className="text-[10px] font-mono font-semibold uppercase text-[#0072BB] tracking-widest">
              Arquitetura Institucional SEJU
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Organograma Hierárquico e Canais de Comando
            </h3>
            <p className="text-xs text-slate-500">
              Selecione qualquer unidade abaixo para filtrar os ramais e servidores vinculados ao departamento.
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Nível 1: Gabinete */}
            <div 
              onClick={() => {
                soundFX.playClick();
                setFiltroDepto('Gabinete');
                setModoVisualizacao('diretorio');
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white p-5 rounded-2xl border border-slate-800 text-center shadow-2xs cursor-pointer transition"
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
                Nível 1 · Direção Superior
              </div>
              <div className="text-base sm:text-lg font-bold mt-0.5">
                Gabinete do Secretário da Justiça e Cidadania
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Dra. Maria Helena (Chefe de Gabinete) · Ramais 8201 / 8202
              </div>
            </div>

            {/* Linha Conectora Vertical */}
            <div className="w-px h-6 bg-slate-200 mx-auto" />

            {/* Nível 2: Departamentos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => {
                  soundFX.playClick();
                  setFiltroDepto('DAG');
                  setModoVisualizacao('diretorio');
                }}
                className="bg-slate-50/70 hover:bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 text-left space-y-2 cursor-pointer transition shadow-2xs"
              >
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
                  <span>Administração Geral</span>
                  <ArrowUpRight size={13} className="text-slate-400" />
                </div>
                <div className="font-bold text-sm text-slate-900">DAG · Frotas e RH</div>
                <div className="text-xs text-slate-500">Marcos Viana · Ramal 8245 / 8215</div>
                <span className="inline-block text-[11px] font-semibold text-[#0072BB] pt-1">
                  Inspecionar ramais →
                </span>
              </div>

              <div 
                onClick={() => {
                  soundFX.playClick();
                  setFiltroDepto('TI');
                  setModoVisualizacao('diretorio');
                }}
                className="bg-slate-50/70 hover:bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 text-left space-y-2 cursor-pointer transition shadow-2xs"
              >
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
                  <span>Suporte & Governança</span>
                  <ArrowUpRight size={13} className="text-slate-400" />
                </div>
                <div className="font-bold text-sm text-slate-900">Departamento de TI</div>
                <div className="text-xs text-slate-500">Helpdesk & Redes · Ramal 8299</div>
                <span className="inline-block text-[11px] font-semibold text-[#0072BB] pt-1">
                  Inspecionar ramal →
                </span>
              </div>

              <div 
                onClick={() => {
                  soundFX.playClick();
                  setFiltroDepto('Direitos Humanos');
                  setModoVisualizacao('diretorio');
                }}
                className="bg-slate-50/70 hover:bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 text-left space-y-2 cursor-pointer transition shadow-2xs"
              >
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
                  <span>Políticas Públicas</span>
                  <ArrowUpRight size={13} className="text-slate-400" />
                </div>
                <div className="font-bold text-sm text-slate-900">Direitos Humanos</div>
                <div className="text-xs text-slate-500">Carlos Silveira · Ramal 8230</div>
                <span className="inline-block text-[11px] font-semibold text-[#0072BB] pt-1">
                  Inspecionar ramal →
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SIMULAÇÃO DE CHAMADA VOIP INTERNA */}
      {chamadaAtiva && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-800 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold text-xl mx-auto">
              {chamadaAtiva.responsavel.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-sky-400 font-mono uppercase tracking-wider">
                VoIP SEJU · Ramal {chamadaAtiva.ramal}
              </div>
              <h3 className="text-base font-bold text-white">{chamadaAtiva.responsavel}</h3>
              <p className="text-xs text-slate-400">{chamadaAtiva.setor}</p>
            </div>

            <div className="py-2 px-4 rounded-xl bg-slate-800/70 border border-slate-700/80 inline-block">
              <span className="font-mono text-xl font-bold text-emerald-400">
                {formatarDuracao(chamadaSegundos)}
              </span>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <ShieldCheck size={11} className="text-emerald-400" /> Canal Criptografado Gov.PR
              </div>
            </div>

            {/* Controles da Chamada */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setChamadaMutada(!chamadaMutada);
                }}
                className={`p-3.5 rounded-xl transition cursor-pointer ${
                  chamadaMutada ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title={chamadaMutada ? 'Ativar Microfone' : 'Silenciar Microfone'}
              >
                {chamadaMutada ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                onClick={handleEncerrarChamada}
                className="px-5 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
                title="Encerrar Ligação"
              >
                <PhoneOff size={16} /> Encerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
