import { ModuloCabecalho, AbasModulo, NumeroModulo } from '../modulo/ModuloCabecalho';
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
    { id: 'todos', codigo: 'ALL', andarLabel: 'Todos Pavimentos', sub: 'Visão Integral', corLed: 'bg-[#0072BB]' },
    { id: '3º Andar', codigo: '03F', andarLabel: '3º Andar · Cúpula', sub: 'Gabinete & Jurídico', corLed: 'bg-[#D98A00]' },
    { id: '2º Andar', codigo: '02F', andarLabel: '2º Andar · Digital', sub: 'TI, Redes & Suporte', corLed: 'bg-[#0072BB]' },
    { id: '1º Andar', codigo: '01F', andarLabel: '1º Andar · Gestão', sub: 'Direitos Humanos & RH', corLed: 'bg-[#00A859]' },
    { id: 'Térreo', codigo: 'TER', andarLabel: 'Térreo · Operações', sub: 'Frotas & Ouvidoria', corLed: 'bg-[#0072BB]' }
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
    <div className="space-y-6 font-sans pb-12">
      <ModuloCabecalho
        cor="ceu"
        rotulo="Contatos · Sede e unidades"
        titulo="Ramais"
        descricao="Encontre o ramal de qualquer setor ou pessoa, filtre por andar e guarde os contatos que você mais usa."
        onVoltar={onVoltarHub}
      >
        <div className="flex flex-wrap gap-2">
          <NumeroModulo rotulo="Disponíveis" valor={totalOnline} />
          <NumeroModulo rotulo="Em reunião" valor={totalReuniao} />
          <NumeroModulo rotulo="Fora da sede" valor={totalMissao} />
        </div>
        <AbasModulo<'diretorio' | 'organograma' | 'favoritos'>
          ativa={modoVisualizacao}
          onChange={(id) => {
            soundFX.playClick();
            setModoVisualizacao(id);
          }}
          itens={[
            { id: 'diretorio', rotulo: 'Lista', icone: <Users size={14} /> },
            { id: 'organograma', rotulo: 'Organograma', icone: <Network size={14} /> },
            { id: 'favoritos', rotulo: 'Favoritos', icone: <Star size={14} />, contagem: totalFavoritos },
          ]}
        />
      </ModuloCabecalho>

      <div className="relative bg-[var(--surface)] rounded-[18px] border border-[var(--border)] overflow-hidden">
        <div className="p-5 sm:p-6 space-y-5">
          {/* PAINEL DE ELEVADOR EXECUTIVO (FILTRO TÁTIL POR ANDAR DO EDIFÍCIO SEJU) */}
          <div className="bg-[#0B1B2E] rounded-xl p-3.5 border border-[#22324C] space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Building2 size={13} className="text-[var(--warning)]" />
                <span className="tabular-nums text-[10px] uppercase tracking-widest text-[var(--ink-muted)] font-bold">
                  Painel de Elevador Executivo · Seletor de Pavimento SEJU
                </span>
              </div>
              <span className="tabular-nums text-[10px] text-[var(--text-subtle)] hidden sm:inline">
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
                        ? 'bg-[#0B1B2E]/95 border-[var(--warning)]/80 '
                        : 'bg-[#0B1B2E]/90 hover:bg-[#0B1B2E]/60 border-[#22324C] hover:border-[#22324C]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Botão Redondo Iluminado de Elevador */}
                      <div
                        className={`w-9 h-9 rounded-full border-2 flex flex-col items-center justify-center tabular-nums text-[11px] font-extrabold shrink-0 transition-all ${
                          ativo
                            ? 'bg-[#D98A00]/15 border-[var(--warning)] text-[#FFE2A8] '
                            : 'bg-[#0B1B2E] border-[#22324C] text-[var(--text-subtle)] group-hover:border-[var(--border-strong)] group-hover:text-white/90'
                        }`}
                      >
                        {item.codigo}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${ativo ? 'text-white' : 'text-[var(--ink-muted)]'}`}>
                          {item.andarLabel}
                        </div>
                        <div className="text-[10px] text-[var(--text-subtle)] truncate">
                          {item.sub}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full mb-1 ${ativo ? 'bg-[#D98A00] ' : item.corLed}`} />
                      <span className="tabular-nums text-[10px] text-[var(--text-subtle)] bg-[#0B1B2E]/90 px-1.5 py-0.5 rounded border border-[#22324C]">
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
              <Search size={15} className="absolute left-3.5 top-2.5 text-[var(--text-subtle)]" />
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por servidor, cargo, setor (Gabinete, TI, Frota) ou ramal (ex: 8201)..."
                className="w-full text-xs pl-10 pr-8 py-2.5 bg-[var(--surface-2)] hover:bg-[var(--surface)] focus:bg-[var(--surface)] border border-[var(--border)]/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] text-[var(--text)] transition"
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-2.5 top-2.5 text-[var(--text-subtle)] hover:text-[var(--text-muted)] p-0.5 cursor-pointer"
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
                      ? 'bg-[#0072BB] text-white border-[var(--brand)] shadow-2xs'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] border-[var(--border)]/80'
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
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                Exibindo <strong className="text-[var(--text)] tabular-nums">{ramaisFiltrados.length}</strong> ramal(is) operacional(is)
              </span>
              {(filtroAndar !== 'todos' || filtroDepto !== 'todos') && (
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setFiltroAndar('todos');
                    setFiltroDepto('todos');
                  }}
                  className="text-[11px] font-semibold text-[var(--brand)] hover:underline cursor-pointer"
                >
                  Limpar filtros ativos ×
                </button>
              )}
            </div>
            <span className="tabular-nums text-[11px] text-[var(--text-muted)] bg-[var(--surface)] px-2.5 py-1 rounded-lg border border-[var(--border)]/80">
              Discagem Direta Externa (DDR): <strong className="text-[var(--text)]">(41) 3310-XXXX</strong>
            </span>
          </div>

          {ramaisFiltrados.length === 0 ? (
            <div className="p-12 bg-[var(--surface)] rounded-[18px] border border-[var(--border)]/80 shadow-2xs text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)] flex items-center justify-center mx-auto">
                <PhoneCall size={18} />
              </div>
              <div className="text-sm font-bold text-[var(--text)]">Nenhum ramal localizado neste pavimento/setor</div>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                Utilize o Painel de Elevador acima para alternar para "Todos Pavimentos" ou redefina sua pesquisa.
              </p>
              <button
                onClick={() => {
                  setBusca('');
                  setFiltroAndar('todos');
                  setFiltroDepto('todos');
                }}
                className="px-4 py-2 rounded-xl bg-[#0B1B2E] text-white text-xs font-semibold cursor-pointer hover:bg-[#0B1B2E] transition"
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
                        ringAvatar: 'ring-2 ring-[var(--verde)] ring-offset-2 ring-offset-white',
                        dotColor: 'bg-[#00A859]',
                        badgeClass: 'text-[var(--verde)] bg-[var(--verde-soft)] border-[var(--verde-border)]/90',
                        topAccent: 'bg-[#00A859]  '
                      }
                    : r.statusPresenca === 'reuniao'
                    ? {
                        label: 'Em Reunião',
                        ringAvatar: 'ring-2 ring-[var(--warning)] ring-offset-2 ring-offset-white',
                        dotColor: 'bg-[#D98A00]',
                        badgeClass: 'text-[var(--warning)] bg-[var(--warning-soft)] border-[var(--warning-border)]/90',
                        topAccent: 'bg-[#D98A00]  '
                      }
                    : {
                        label: 'Em Missão',
                        ringAvatar: 'ring-2 ring-[var(--brand)] ring-offset-2 ring-offset-white',
                        dotColor: 'bg-[#0072BB]',
                        badgeClass: 'text-[var(--brand)] bg-[var(--brand-soft)] border-[var(--brand-border)]/90',
                        topAccent: 'bg-[#0072BB]  '
                      };

                return (
                  <div
                    key={r.id}
                    className="group relative bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)]/90 hover:border-[var(--border-strong)] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-4 overflow-hidden"
                  >
                    {/* Filete Superior de Status */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${statusConfig.topAccent}`} />

                    {/* Topo do Card: Departamento, Status Ao Vivo e Tecla VoIP Tátil do Ramal */}
                    <div className="flex items-start justify-between gap-3 pt-0.5">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text)] bg-[var(--surface-2)] px-2.5 py-0.5 rounded border border-[var(--border)]/90">
                            {r.departamento}
                          </span>

                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1.5 ${statusConfig.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} ${r.statusPresenca === 'online' ? '' : ''}`} />
                            {statusConfig.label}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-[var(--text)] truncate group-hover:text-[var(--brand)] transition-colors">
                          {r.setor}
                        </h3>
                      </div>

                      {/* Favorito + Botão de Ramal Estilo Tecla VoIP Tátil Mecânica */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleFavorito(r.id)}
                          className="p-2 rounded-lg border border-[var(--border)]/70 hover:border-[var(--warning-border)] bg-[var(--surface-2)]/70 hover:bg-[var(--warning-soft)]/50 text-[var(--text-subtle)] hover:text-[var(--warning)] transition cursor-pointer"
                          title={r.favorito ? 'Remover dos favoritos' : 'Fixar nos favoritos'}
                        >
                          <Star size={14} className={r.favorito ? 'text-[var(--warning)] fill-[var(--warning)]' : ''} />
                        </button>

                        {/* Tecla VoIP Tátil Esculpida */}
                        <button
                          onClick={() => handleCopiar(r.id, r.ramal)}
                          title="Tecla VoIP Tátil: Clique para copiar o ramal"
                          className="relative px-3 py-1.5 rounded-lg bg-[#0B1B2E] hover:bg-[#13223A] active:translate-y-0.5 text-white tabular-nums border border-[#22324C] transition-all cursor-pointer flex items-center gap-2 shrink-0"
                        >
                          <span className={`w-1.5 h-3.5 rounded-full ${statusConfig.dotColor}`} />
                          <div className="text-left leading-none">
                            <span className="block text-[8px] uppercase tracking-widest text-[var(--text-subtle)] font-semibold">
                              TECLA EXT
                            </span>
                            <span className="text-sm font-extrabold tracking-tight tabular-nums text-white">
                              {r.ramal}
                            </span>
                          </div>
                          {copiadoId === r.id ? (
                            <Check size={13} className="text-[var(--verde)] ml-0.5" />
                          ) : (
                            <Copy size={12} className="text-[var(--text-subtle)] ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Corpo: Avatar com Anel de Status Ao Vivo + Pavimento Estilo Sinalização */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[var(--surface-2)]/90 border border-[var(--border)]/80 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar com Anel Ao Vivo */}
                        <div className="relative shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full bg-[#0B1B2E] text-white tabular-nums text-xs font-bold flex items-center justify-center ${statusConfig.ringAvatar}`}
                          >
                            {iniciais}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusConfig.dotColor}`}
                            title={`Status: ${statusConfig.label}`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[var(--text)] truncate">{r.responsavel}</div>
                          <div className="text-[11px] text-[var(--text-muted)] truncate">{r.cargo}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0 sm:border-l sm:border-[var(--border)]/80 sm:pl-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0B1B2E] text-[var(--warning)] tabular-nums text-[10px] font-extrabold flex items-center justify-center shrink-0 border border-[#22324C]">
                          {r.andar.startsWith('3') ? '03F' : r.andar.startsWith('2') ? '02F' : r.andar.startsWith('1') ? '01F' : 'TER'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[var(--text)] truncate">{r.andar}</div>
                          <div className="tabular-nums text-[11px] text-[var(--text-muted)] tabular-nums truncate">{r.telefoneDireto}</div>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé de Ações Rápidas (E-mail & Tecla de Discagem VoIP Direta) */}
                    <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs">
                      <span className="tabular-nums text-[11px] text-[var(--text-muted)] truncate">
                        {r.email}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`mailto:${r.email}`}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)]/80 text-[var(--text)] font-semibold transition flex items-center gap-1.5 border border-[var(--border)]/80"
                          title={`Enviar e-mail institucional para ${r.email}`}
                        >
                          <Mail size={13} />
                          <span className="hidden sm:inline">E-mail</span>
                        </a>

                        <button
                          onClick={() => handleIniciarChamada(r)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#0084D6] hover:bg-[#0072BB] active:translate-y-0.5 text-white font-bold transition cursor-pointer flex items-center gap-1.5 "
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
        <div className="relative bg-[#0B1B2E] text-white rounded-[18px] p-6 sm:p-8 border border-[#22324C] overflow-hidden space-y-8">
          {/* Malha Arquitetônica de Fundo + Cantoneiras Externas */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />    

          <div className="relative z-10 text-center space-y-1.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0072BB]/10 border border-[var(--brand)]/30 text-[#DCEEFB] tabular-nums text-[10px] uppercase tracking-widest">
              <Network size={12} /> Arquitetura Hierárquica & Comando VoIP SEJU-PR
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Cadeia de Comando: Secretário → Diretorias → Núcleos Operacionais
            </h3>
            <p className="text-xs text-[var(--text-subtle)]">
              Clique em qualquer unidade para filtrar seus ramais ou acione a discagem VoIP imediata no próprio bloco hierárquico.
            </p>
          </div>

          {/* ÁRVORE HIERÁRQUICA DE 3 NÍVEIS COM CONECTORES LUMINOSOS */}
          <div className="relative z-10 max-w-5xl mx-auto space-y-0">
            
            {/* NÍVEL 1: SECRETÁRIO / GABINETE SUPERIOR */}
            <div className="max-w-xl mx-auto relative group">
              <div className="relative bg-[#0B1B2E] p-5 rounded-xl border border-[var(--brand)]/50 text-left transition hover:border-[var(--brand-border)]">    

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#0072BB]/20 border border-[var(--brand)]/40 tabular-nums text-[10px] font-bold uppercase tracking-widest text-[#DCEEFB]">
                        NÍVEL I · CÚPULA DIRETIVA
                      </span>
                      <span className="tabular-nums text-[10px] text-[var(--verde)] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00A859] " /> 3º Andar
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      Gabinete do Secretário da Justiça e Cidadania
                    </h4>
                    <p className="text-xs text-[var(--ink-muted)]">
                      Chefia de Gabinete: <strong className="text-white">Dra. Maria Helena</strong> · Assessoria Técnica & Despachos
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <button
                      onClick={() => handleIniciarChamada(ramais[0])}
                      className="px-3 py-1.5 rounded-lg bg-[#0072BB] hover:bg-[#0072BB] text-[var(--text)] tabular-nums text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <PhoneForwarded size={13} /> EXT 8201
                    </button>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setFiltroDepto('Gabinete');
                        setModoVisualizacao('diretorio');
                      }}
                      className="text-[11px] font-semibold text-[#DCEEFB] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      Abrir Gabinete <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CONECTOR VERTICAL NÍVEL 1 -> BARRAMENTO HORIZONTAL NÍVEL 2 */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-7 bg-[#0072BB] relative">
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#0072BB] " />
              </div>
              {/* Barramento horizontal para 3 colunas em telas grandes */}
              <div className="hidden md:grid grid-cols-3 w-full max-w-4xl">
                <div className="h-5 border-t-2 border-l-2 border-[var(--brand)]/40 rounded-tl-lg ml-[50%]" />
                <div className="h-5 border-t-2 border-[var(--brand)]/40 relative">
                  <div className="w-0.5 h-5 bg-[#0072BB]/40 mx-auto" />
                </div>
                <div className="h-5 border-t-2 border-r-2 border-[var(--brand)]/40 rounded-tr-lg mr-[50%]" />
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
                  <div className="bg-[#0B1B2E] p-4 rounded-xl border border-[#22324C]/90 hover:border-[var(--border-strong)] transition flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] tabular-nums">
                        <span className="text-[var(--brand)] font-bold uppercase tracking-wider">
                          NÍVEL II · {dir.codigo}
                        </span>
                        <span className="text-[var(--text-subtle)]">{dir.andar}</span>
                      </div>
                      <h5 className="font-bold text-sm text-white leading-snug">
                        {dir.titulo}
                      </h5>
                      <p className="text-xs text-[var(--text-subtle)]">
                        {dir.titular}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-[#22324C] flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setFiltroDepto(dir.filtro);
                          setModoVisualizacao('diretorio');
                        }}
                        className="text-[11px] font-semibold text-[var(--brand)] hover:text-[#DCEEFB] flex items-center gap-1 cursor-pointer"
                      >
                        Filtrar Diretoria <ChevronRight size={13} />
                      </button>

                      <button
                        onClick={() => handleIniciarChamada(dir.ramalObj)}
                        className="px-2.5 py-1 rounded bg-[#0B1B2E] hover:bg-[#0072BB] hover:text-[var(--text)] text-[#DCEEFB] tabular-nums text-[11px] font-bold border border-[#22324C] transition cursor-pointer flex items-center gap-1"
                      >
                        <PhoneCall size={11} /> {dir.ramalPrincipal}
                      </button>
                    </div>
                  </div>

                  {/* Conector Vertical para Nível 3 (Núcleos Operacionais) */}
                  <div className="pl-5 pt-2 space-y-2 relative">
                    <div className="absolute left-2.5 top-0 bottom-4 w-px bg-[#13223A]" />
                    {dir.nucleos.map(nuc => (
                      <div
                        key={nuc.ramal}
                        className="relative bg-[#0B1B2E]/60 hover:bg-[#0B1B2E]/90 p-3 rounded-lg border border-[#22324C] hover:border-[var(--border-strong)] transition flex items-center justify-between gap-2"
                      >
                        <CornerDownRight size={13} className="text-[var(--brand)]/70 shrink-0 -ml-1" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white/90 truncate">
                            {nuc.nome}
                          </div>
                          <div className="text-[10px] tabular-nums text-[var(--text-subtle)]">
                            Núcleo Operacional · {nuc.andar}
                          </div>
                        </div>
                        <button
                          onClick={() => handleIniciarChamada(nuc.item)}
                          className="px-2.5 py-1 rounded bg-[#0B1B2E] hover:bg-[#00A859] hover:text-[var(--text)] text-[var(--verde)] border border-[#22324C] tabular-nums text-[11px] font-bold transition cursor-pointer shrink-0"
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
        <div className="fixed inset-0 bg-[#0B1B2E]/65 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div
            style={{
              clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))'
            }}
            className="relative bg-[#0B1B2E] text-white max-w-md w-full p-6 border border-[#22324C]/90 space-y-5 overflow-hidden animate-in zoom-in-95"
          >
            {/* Malha Sutil + Cantoneiras Executive CallKit */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_65%)]" />  

            {/* Top Bar do CallKit */}
            <div className="relative z-10 flex items-center justify-between text-[10px] tabular-nums uppercase tracking-widest text-[var(--text-subtle)] border-b border-[#22324C]/90 pb-3">
              <span className="flex items-center gap-1.5 text-[var(--verde)] font-bold">
                <ShieldCheck size={13} /> SRTP AES-256 · CALLKIT SEJU
              </span>
              <span className="px-2 py-0.5 rounded bg-[#0B1B2E] border border-[#22324C] text-[var(--brand)]">
                CANAL VOIP #{chamadaAtiva.ramal}
              </span>
            </div>

            {/* Avatar Pulsante + Identificação Executiva */}
            <div className="relative z-10 flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-[18px] bg-[#0B1B2E] border border-[var(--brand)]/50 text-white flex items-center justify-center tabular-nums font-extrabold text-xl ">
                  {extrairIniciais(chamadaAtiva.responsavel)}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#00A859] border-2 border-[#22324C] " />
              </div>

              <div className="text-left min-w-0 flex-1 space-y-0.5">
                <div className="text-[11px] text-[var(--brand)] tabular-nums uppercase tracking-wider font-semibold">
                  {chamadaAtiva.andar}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {chamadaAtiva.responsavel}
                </h3>
                <p className="text-xs text-[var(--text-subtle)] truncate">{chamadaAtiva.setor}</p>
                <p className="text-[11px] tabular-nums text-[var(--text-muted)]">{chamadaAtiva.telefoneDireto}</p>
              </div>
            </div>

            {/* Display de Onda Sonora Animada (Audio Waveform) + Cronômetro Tabular */}
            <div className="relative z-10 p-4 rounded-xl bg-[#0B1B2E]/90 border border-[#22324C] space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className="block text-[9px] tabular-nums uppercase tracking-widest text-[var(--text-subtle)]">
                    Duração da Sessão
                  </span>
                  <span className="tabular-nums text-2xl font-extrabold text-[var(--verde)] tabular-nums tracking-tight">
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
                            ? 'bg-[#D98A00]/40'
                            : barIdx % 2 === 0
                            ? 'bg-[#00A859]'
                            : 'bg-[#0072BB]'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {dtmfDigitado && (
                <div className="pt-2 border-t border-[#22324C] flex items-center justify-between tabular-nums text-xs">
                  <span className="text-[var(--text-subtle)] text-[10px]">TOM DTMF ENVIADO:</span>
                  <span className="text-[#FFE2A8] font-bold tracking-widest">{dtmfDigitado}</span>
                </div>
              )}
            </div>

            {/* Teclado DTMF Tátil Expansível */}
            {tecladoDtmfAberto && (
              <div className="relative z-10 grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0B1B2E] border border-[#22324C] animate-in fade-in">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(tecla => (
                  <button
                    key={tecla}
                    type="button"
                    onClick={() => handlePressionarDtmf(tecla)}
                    className="py-2 rounded-lg bg-[#0B1B2E] hover:bg-[#0B1B2E] active:translate-y-0.5 border border-[#22324C] tabular-nums text-sm font-bold text-white cursor-pointer transition"
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
                    ? 'bg-[#D98A00] text-[var(--text)] border-[var(--warning)]'
                    : 'bg-[#0B1B2E] hover:bg-[#0B1B2E] text-white/90 border-[#22324C]'
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
                    ? 'bg-[#0072BB]/20 text-[#DCEEFB] border-[var(--brand)]/40'
                    : 'bg-[#0B1B2E] hover:bg-[#0B1B2E] text-[var(--text-subtle)] border-[#22324C]'
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
                    ? 'bg-[#0B1B2E] text-white border-[var(--border-strong)]'
                    : 'bg-[#0B1B2E] hover:bg-[#0B1B2E] text-white/90 border-[#22324C]'
                }`}
                title="Abrir Teclado DTMF"
              >
                <Hash size={17} />
                <span>Teclado</span>
              </button>

              <button
                onClick={handleEncerrarChamada}
                className="p-3 rounded-xl bg-[#C8372D] hover:bg-[#B42318] text-white border border-[var(--danger)]/40 font-bold text-[11px] flex flex-col items-center justify-center gap-1 transition cursor-pointer active:translate-y-0.5"
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

