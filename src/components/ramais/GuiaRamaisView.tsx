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
  Volume2,
  X,
  ExternalLink
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
    andar: '3º Andar - Sala 301',
    statusPresenca: 'online',
    favorito: true
  },
  {
    id: 'r2',
    setor: 'Gabinete - Assessoria Técnica',
    departamento: 'Gabinete do Secretário',
    responsavel: 'Recepção e Despachos Oficiais',
    cargo: 'Assessoria de Expediente',
    ramal: '8202',
    telefoneDireto: '(41) 3310-8202',
    email: 'gabinete@seju.pr.gov.br',
    andar: '3º Andar - Sala 302',
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
    andar: 'Térreo - Pátio Oficial',
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
    andar: '1º Andar - Bloco B',
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
    andar: '2º Andar - Sala 201',
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
    andar: '1º Andar - Sala 102',
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
    andar: 'Térreo - Entrada Principal',
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
    andar: '3º Andar - Sala 305',
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
    let timer: any;
    if (chamadaAtiva) {
      timer = setInterval(() => {
        setChamadaSegundos(prev => prev + 1);
      }, 1000);
    } else {
      setChamadaSegundos(0);
    }
    return () => clearInterval(timer);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Header do Guia Telefônico */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <button onClick={onVoltarHub} className="hover:text-[#0072BB] font-semibold cursor-pointer">
              ← Central de Aplicativos
            </button>
            <span>/</span>
            <span className="font-bold text-slate-800">Guia de Ramais Internos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <PhoneCall size={26} className="text-sky-600" />
            Catálogo Telefônico, VoIP & Estrutura da SEJU
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Consulta ágil de ramais, discagem VoIP simulada, organograma e favoritos dos departamentos estaduais.
          </p>
        </div>

        {/* Alternador de Modo */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto shrink-0">
          <button
            onClick={() => {
              soundFX.playClick();
              setModoVisualizacao('diretorio');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              modoVisualizacao === 'diretorio' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={14} /> Diretório
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setModoVisualizacao('organograma');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              modoVisualizacao === 'organograma' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network size={14} /> Organograma
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              setModoVisualizacao('favoritos');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              modoVisualizacao === 'favoritos' ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star size={14} className="text-amber-500 fill-amber-500" /> Favoritos
          </button>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros Rápidos */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Digite o nome do servidor, setor (ex: Gabinete, TI, Transporte) ou número de ramal..."
            className="w-full text-xs sm:text-sm pl-11 pr-4 py-3.5 bg-white border border-slate-200/90 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-xs text-slate-800"
          />
        </div>

        {/* Filtro por Departamento */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {departamentos.map(dep => (
            <button
              key={dep.id}
              onClick={() => {
                soundFX.playClick();
                setFiltroDepto(dep.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer text-xs ${
                filtroDepto === dep.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {dep.label}
            </button>
          ))}
        </div>
      </div>

      {modoVisualizacao !== 'organograma' ? (
        /* Modo 1 & 3: Cards Executivos de Contato */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ramaisFiltrados.length === 0 ? (
            <div className="col-span-2 p-12 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              Nenhum contato encontrado para os filtros selecionados.
            </div>
          ) : (
            ramaisFiltrados.map(r => (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-gov-card hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                          {r.departamento}
                        </span>

                        {r.statusPresenca === 'online' && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> No Posto
                          </span>
                        )}
                        {r.statusPresenca === 'reuniao' && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Em Reunião
                          </span>
                        )}
                        {r.statusPresenca === 'missao' && (
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Em Missão
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1">{r.setor}</h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Botão Favoritar */}
                      <button
                        onClick={() => handleToggleFavorito(r.id)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                        title={r.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        <Star size={16} className={r.favorito ? 'text-amber-500 fill-amber-500' : ''} />
                      </button>

                      {/* Número do Ramal em Destaque */}
                      <button
                        onClick={() => handleCopiar(r.id, r.ramal)}
                        title="Clique para copiar o ramal"
                        className="bg-linear-to-br from-sky-500 to-[#0072BB] text-white px-3.5 py-2 rounded-2xl font-mono font-black text-sm flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-transform hover:scale-105 cursor-pointer shrink-0"
                      >
                        <PhoneCall size={14} />
                        <span>{r.ramal}</span>
                        {copiadoId === r.id ? <Check size={14} className="text-yellow-300" /> : <Copy size={13} className="text-white/70" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3.5 text-xs text-slate-600 space-y-1.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <User size={14} className="text-[#0072BB]" />
                      <span>{r.responsavel}</span>
                      <span className="text-[11px] text-slate-400 font-normal">({r.cargo})</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Building2 size={14} className="text-slate-400" />
                      <span>Localização: <strong>{r.andar}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 text-[11px] font-semibold">{r.telefoneDireto}</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleIniciarChamada(r)}
                      className="text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <PhoneForwarded size={13} /> Ligar VoIP
                    </button>
                    
                    <a
                      href={`mailto:${r.email}`}
                      className="text-slate-600 hover:text-[#0072BB] bg-slate-100 hover:bg-blue-50 p-1.5 rounded-xl transition font-bold"
                      title={`Enviar e-mail para ${r.email}`}
                    >
                      <Mail size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Modo 2: Organograma Visual em Árvore Interativo */
        <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-gov-card space-y-8">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-[#0072BB] tracking-wider">Estrutura Organizacional</span>
            <h3 className="text-lg font-black text-slate-900">Organograma Interativo da Secretaria da Justiça e Cidadania</h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Clique em qualquer núcleo para inspecionar os ramais diretos e responsáveis lotados na unidade.
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
              className="bg-linear-to-r from-[#00385E] to-[#0072BB] text-white p-5 rounded-3xl text-center shadow-lg cursor-pointer hover:scale-[1.01] transition-transform"
            >
              <div className="text-[10px] uppercase font-black tracking-widest text-blue-200">Nível 1 · Direção Superior</div>
              <div className="text-lg font-black mt-0.5">Gabinete do Secretário da Justiça e Cidadania</div>
              <div className="text-xs text-blue-100 mt-1">Dra. Maria Helena (Chefe de Gabinete) · Ramal 8201 / 8202</div>
            </div>

            {/* Linha Conectora Vertical */}
            <div className="w-0.5 h-6 bg-slate-300 mx-auto" />

            {/* Nível 2: Departamentos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => {
                  soundFX.playClick();
                  setFiltroDepto('DAG');
                  setModoVisualizacao('diretorio');
                }}
                className="bg-slate-50 hover:bg-blue-50/70 p-5 rounded-2xl border border-slate-200 text-center space-y-2 cursor-pointer transition hover:border-[#0072BB]"
              >
                <div className="text-[10px] uppercase font-black text-slate-400">Administração Geral</div>
                <div className="font-extrabold text-sm text-slate-900">DAG · Frotas e RH</div>
                <div className="text-xs text-slate-500">Marcos Viana · Ramal 8245</div>
                <span className="inline-block text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
                  Ver 3 Ramais →
                </span>
              </div>

              <div 
                onClick={() => {
                  soundFX.playClick();
                  setFiltroDepto('TI');
                  setModoVisualizacao('diretorio');
                }}
                className="bg-slate-50 hover:bg-blue-50/70 p-5 rounded-2xl border border-slate-200 text-center space-y-2 cursor-pointer transition hover:border-[#0072BB]"
              >
                <div className="text-[10px] uppercase font-black text-slate-400">Tecnologia da Informação</div>
                <div className="font-extrabold text-sm text-slate-900">Departamento de TI</div>
                <div className="text-xs text-slate-500">Helpdesk & Redes · Ramal 8299</div>
                <span className="inline-block text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
                  Ver Ramal →
                </span>
              </div>

              <div 
                onClick={() => {
                  soundFX.playClick();
                  setFiltroDepto('Direitos Humanos');
                  setModoVisualizacao('diretorio');
                }}
                className="bg-slate-50 hover:bg-blue-50/70 p-5 rounded-2xl border border-slate-200 text-center space-y-2 cursor-pointer transition hover:border-[#0072BB]"
              >
                <div className="text-[10px] uppercase font-black text-slate-400">Políticas de Garantia</div>
                <div className="font-extrabold text-sm text-slate-900">Direitos Humanos</div>
                <div className="text-xs text-slate-500">Carlos Silveira · Ramal 8230</div>
                <span className="inline-block text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
                  Ver Ramal →
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SIMULAÇÃO DE CHAMADA VOIP INTERNA */}
      {chamadaAtiva && (
        <div className="fixed inset-0 bg-slate-950/75 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-7 shadow-2xl border border-slate-800 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-sky-500 to-[#0072BB] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-xl shadow-sky-500/20 animate-pulse">
              {chamadaAtiva.responsavel.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="text-xs text-sky-400 font-mono uppercase tracking-wider">
                VoIP SEJU · Ramal {chamadaAtiva.ramal}
              </div>
              <h3 className="text-lg font-black text-white">{chamadaAtiva.responsavel}</h3>
              <p className="text-xs text-slate-400">{chamadaAtiva.setor}</p>
            </div>

            <div className="py-2">
              <span className="font-mono text-xl font-black text-emerald-400">
                {formatarDuracao(chamadaSegundos)}
              </span>
              <div className="text-[10px] text-slate-400 mt-1">Conexão Criptografada Gov.PR</div>
            </div>

            {/* Controles da Chamada */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setChamadaMutada(!chamadaMutada);
                }}
                className={`p-3.5 rounded-2xl transition cursor-pointer ${
                  chamadaMutada ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title={chamadaMutada ? 'Desmutar Microfone' : 'Mutar Microfone'}
              >
                {chamadaMutada ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button
                onClick={handleEncerrarChamada}
                className="p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition transform hover:scale-105 cursor-pointer"
                title="Encerrar Ligação"
              >
                <PhoneOff size={22} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
