import React, { useState } from 'react';
import { 
  Plane, 
  Printer, 
  FileCheck2, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  TrendingDown,
  Receipt,
  FileText,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  Eye
} from 'lucide-react';
import { Usuario } from '../../types';
import { MapaParanaInterativo, CIDADES_PARANA, DestinoParana } from './MapaParanaInterativo';
import confetti from 'canvas-confetti';
import { soundFX } from '../../services/soundFx';
import { BrasaoParana } from '../common/BrasaoParana';

interface CalculadoraDiariasViewProps {
  currentUser: Usuario;
  onVoltarHub: () => void;
}

interface HistoricoDiariaItem {
  id: string;
  protocolo: string;
  servidor: string;
  cpf: string;
  cargo: string;
  destino: string;
  regiao: string;
  distanciaTotalKm: number;
  dias: number;
  comPernoite: boolean;
  valorTotal: number;
  dataEmissao: string;
  status: 'Empenhado SIAF' | 'Aprovado Chefia' | 'Em Prestação de Contas';
  motivo: string;
}

const JUSTIFICATIVAS_PRESETS = [
  {
    titulo: 'Vistoria Socioeducativa',
    texto: 'Vistoria pericial e inspeção técnica das unidades socioeducativas e acompanhamento dos programas de atendimento ao adolescente no município de destino.'
  },
  {
    titulo: 'Conselhos Tutelares & Cidadania',
    texto: 'Reunião técnica intersetorial com a rede de proteção, Conselhos Tutelares e lideranças comunitárias para fortalecimento das garantias de direitos fundamentais.'
  },
  {
    titulo: 'Capacitação Regional',
    texto: 'Ministração de módulo presencial de capacitação e alinhamento operacional para servidores estaduais e municipais vinculados à pasta.'
  },
  {
    titulo: 'Auditoria & Fiscalização',
    texto: 'Auditoria in loco de conformidade da aplicação de recursos de convênios estaduais e fiscalização de metas estabelecidas em termo de parceria.'
  }
];

const HISTORICO_INICIAL: HistoricoDiariaItem[] = [
  {
    id: 'h1',
    protocolo: 'SEJU-DIARIA-2026-849210',
    servidor: 'Carlos Silveira',
    cpf: '048.***.***-12',
    cargo: 'Agente Profissional',
    destino: 'Londrina',
    regiao: 'Norte Central',
    distanciaTotalKm: 762,
    dias: 2.5,
    comPernoite: true,
    valorTotal: 950,
    dataEmissao: '14/10/2026',
    status: 'Empenhado SIAF',
    motivo: 'Vistoria pericial e inspeção técnica das unidades socioeducativas e acompanhamento dos programas de atendimento ao adolescente no município de destino.'
  },
  {
    id: 'h2',
    protocolo: 'SEJU-DIARIA-2026-731044',
    servidor: 'Dra. Maria Helena',
    cpf: '812.***.***-90',
    cargo: 'Chefe de Gabinete',
    destino: 'Foz do Iguaçu',
    regiao: 'Oeste Paranaense',
    distanciaTotalKm: 1274,
    dias: 3,
    comPernoite: true,
    valorTotal: 1560,
    dataEmissao: '11/10/2026',
    status: 'Aprovado Chefia',
    motivo: 'Reunião técnica intersetorial com a rede de proteção, Conselhos Tutelares e lideranças comunitárias para fortalecimento das garantias de direitos fundamentais.'
  },
  {
    id: 'h3',
    protocolo: 'SEJU-DIARIA-2026-619823',
    servidor: 'Marcos Viana',
    cpf: '391.***.***-45',
    cargo: 'Gestor de Transporte e Frotas',
    destino: 'Ponta Grossa',
    regiao: 'Campos Gerais',
    distanciaTotalKm: 228,
    dias: 1,
    comPernoite: false,
    valorTotal: 190,
    dataEmissao: '08/10/2026',
    status: 'Em Prestação de Contas',
    motivo: 'Auditoria in loco de conformidade da aplicação de recursos de convênios estaduais e fiscalização de metas estabelecidas em termo de parceria.'
  }
];

export const CalculadoraDiariasView: React.FC<CalculadoraDiariasViewProps> = ({ currentUser, onVoltarHub }) => {
  const [cidadeSelecionada, setCidadeSelecionada] = useState<DestinoParana>(CIDADES_PARANA[3]); // Londrina por padrão
  const [cargoNivel, setCargoNivel] = useState<'superior' | 'medio' | 'direcao'>('superior');
  const [dias, setDias] = useState<number>(2);
  const [comPernoite, setComPernoite] = useState<boolean>(true);
  const [motivo, setMotivo] = useState(JUSTIFICATIVAS_PRESETS[0].texto);
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null);
  const [modalDocumento, setModalDocumento] = useState<boolean>(false);
  const [historicoViagens, setHistoricoViagens] = useState<HistoricoDiariaItem[]>(HISTORICO_INICIAL);

  // Valores Base da Diária (Decreto Estadual PR)
  const valoresNivel: Record<string, number> = {
    medio: 280,
    superior: 380,
    direcao: 520
  };

  const valorUnitario = valoresNivel[cargoNivel];
  const multiplicadorPernoite = comPernoite ? 1 : 0.5;
  const valorTotal = valorUnitario * dias * multiplicadorPernoite;

  // Itemização Fazendária (Decreto nº 1.428/PR)
  const parcelaHospedagem = comPernoite ? valorTotal * 0.50 : 0;
  const parcelaAlimentacao = comPernoite ? valorTotal * 0.35 : valorTotal * 0.70;
  const parcelaLocomocao = comPernoite ? valorTotal * 0.15 : valorTotal * 0.30;

  // Economia Comparativa (Carro Oficial vs Passagem Aérea / Comercial)
  const custoAereoEstimado = cidadeSelecionada.distanciaKm > 300 ? 1650 : 890;
  const custoCombustivelCarro = (cidadeSelecionada.distanciaKm * 2 / 10) * 5.89; // 10 km/l a R$ 5,89
  const economiaEstimada = Math.max(0, custoAereoEstimado - custoCombustivelCarro);

  const handleEmitirGuia = () => {
    soundFX.playSuccess();
    const proto = `SEJU-DIARIA-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setProtocoloGerado(proto);
    setModalDocumento(true);

    const novaConcessao: HistoricoDiariaItem = {
      id: `h-${Date.now()}`,
      protocolo: proto,
      servidor: currentUser.nome,
      cpf: currentUser.cpf,
      cargo: currentUser.cargo,
      destino: cidadeSelecionada.nome,
      regiao: cidadeSelecionada.regiao,
      distanciaTotalKm: cidadeSelecionada.distanciaKm * 2,
      dias,
      comPernoite,
      valorTotal,
      dataEmissao: new Date().toLocaleDateString('pt-BR'),
      status: 'Empenhado SIAF',
      motivo
    };

    setHistoricoViagens(prev => [novaConcessao, ...prev]);

    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.6 }
    });
  };

  const handleSelectPreset = (texto: string) => {
    soundFX.playClick();
    setMotivo(texto);
  };

  const handleInspecionarHistorico = (item: HistoricoDiariaItem) => {
    soundFX.playClick();
    const cidadeEncontrada = CIDADES_PARANA.find(c => c.nome === item.destino);
    if (cidadeEncontrada) {
      setCidadeSelecionada(cidadeEncontrada);
    }
    setDias(item.dias);
    setComPernoite(item.comPernoite);
    setMotivo(item.motivo);
    setProtocoloGerado(item.protocolo);
    setModalDocumento(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* (1) TOP EXECUTIVE HEADER */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              onClick={onVoltarHub}
              className="hover:text-slate-900 font-medium transition-colors cursor-pointer"
            >
              ← Central de Aplicativos
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-700">Diárias & Missões Oficiais</span>
            <span className="hidden sm:inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
              Decreto nº 1.428/PR
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600 shrink-0">
              <Plane size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Controle de Viagens, Rotas & Diárias Oficiais
              </h2>
              <p className="text-xs text-slate-500">
                Planejamento logístico interativo, cálculo fazendário automatizado e emissão de nota de empenho SIAF.
              </p>
            </div>
          </div>
        </div>

        {/* Compact Executive Metrics & Primary Action */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="flex items-center gap-4 px-3.5 py-2 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs">
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Rota Ativa</span>
              <span className="font-semibold text-slate-800">Curitiba → {cidadeSelecionada.nome}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Empenho Previsto</span>
              <span className="font-mono font-bold text-slate-900">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-slate-200" />
            <div className="hidden sm:block">
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Economia Frota</span>
              <span className="font-mono font-semibold text-emerald-700">
                +R$ {economiaEstimada.toFixed(0)}
              </span>
            </div>
          </div>

          <button
            onClick={handleEmitirGuia}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <FileCheck2 size={15} /> Emitir Guia Oficial
          </button>
        </div>
      </div>

      {/* (2) DIVIDED STRUCTURE: MAPA INTERATIVO + PARÂMETROS & DEMONSTRATIVO */}
      <div className="space-y-6">
        
        {/* Subseção 2A: Mapa Geográfico Interativo do Paraná & Seletor de Rotas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <MapPin size={14} className="text-[#0072BB]" />
              <span>1. Seleção de Regional e Rota Estadual</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Origem padrão: Palácio das Araucárias (Curitiba/PR)
            </span>
          </div>

          <MapaParanaInterativo
            cidadeSelecionada={cidadeSelecionada}
            onSelectCidade={setCidadeSelecionada}
            comPernoite={comPernoite}
            onTogglePernoite={setComPernoite}
          />
        </div>

        {/* Subseção 2B: Parâmetros de Cálculo (Esquerda) & Recibo Financeiro ao Vivo (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Coluna Esquerda: Parâmetros Passo a Passo */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <SlidersHorizontal size={14} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Parâmetros de Cálculo & Enquadramento
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Defina o escalão funcional, quantidade de diárias e objeto da missão oficial
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                Anexo I · Tabela SEFA
              </span>
            </div>

            {/* Passo 1 & 2: Nível Funcional e Duração */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Escalão / Nível Funcional do Servidor
                </label>
                <select
                  value={cargoNivel}
                  onChange={e => {
                    soundFX.playClick();
                    setCargoNivel(e.target.value as 'superior' | 'medio' | 'direcao');
                  }}
                  className="w-full p-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-hidden transition"
                >
                  <option value="superior">Técnico / Nível Superior (R$ 380,00 / dia)</option>
                  <option value="medio">Apoio / Nível Médio (R$ 280,00 / dia)</option>
                  <option value="direcao">Direção Superior / Gabinete (R$ 520,00 / dia)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Quantidade de Diárias Concedidas
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setDias(Math.max(0.5, dias - 0.5));
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer transition"
                  >
                    −
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      max="30"
                      value={dias}
                      onChange={e => setDias(Math.max(0.5, Number(e.target.value)))}
                      className="w-full py-2 px-3 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs font-mono font-bold text-slate-900 text-center outline-hidden focus:bg-white focus:border-slate-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setDias(dias + 0.5);
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Passo 3: Modelos Rápidos de Justificativa */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Modelos Padronizados de Objeto Institucional
                </label>
                <span className="text-[11px] text-slate-400">Preenchimento em 1 clique</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {JUSTIFICATIVAS_PRESETS.map((p, idx) => {
                  const ativo = motivo === p.texto;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(p.texto)}
                      className={`text-left text-[11px] font-medium p-2.5 rounded-xl border transition cursor-pointer ${
                        ativo
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50/70 hover:bg-slate-100/80 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      <div className="font-semibold truncate">{p.titulo}</div>
                      <div className={`text-[10px] truncate mt-0.5 ${ativo ? 'text-slate-300' : 'text-slate-400'}`}>
                        Selecionar modelo
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Passo 4: Justificativa Detalhada */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-slate-700">
                Descrição do Objeto, Motivação e Cronograma da Missão
              </label>
              <textarea
                rows={3}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Descreva as reuniões técnicas, inspeções e atividades programadas no município de destino..."
                className="w-full p-3 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-hidden transition"
              />
            </div>

            {/* Passo 5: Composição Contábil & Eficiência */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <span>Hospedagem</span>
                  <span>{comPernoite ? '50%' : 'Isento'}</span>
                </div>
                <div className="font-mono font-bold text-sm text-slate-900 mt-1">
                  R$ {parcelaHospedagem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <span>Alimentação</span>
                  <span>{comPernoite ? '35%' : '70%'}</span>
                </div>
                <div className="font-mono font-bold text-sm text-slate-900 mt-1">
                  R$ {parcelaAlimentacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <span>Locomoção Urbana</span>
                  <span>{comPernoite ? '15%' : '30%'}</span>
                </div>
                <div className="font-mono font-bold text-sm text-slate-900 mt-1">
                  R$ {parcelaLocomocao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Indicador de Economicidade */}
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/70 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                  <TrendingDown size={16} />
                </div>
                <div>
                  <span className="font-semibold text-emerald-950 block">
                    Economicidade Fazendária (Frota Oficial vs. Passagem Comercial)
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Deslocamento terrestre estimado em R$ {custoCombustivelCarro.toFixed(2)} de combustível ({cidadeSelecionada.distanciaKm * 2} km ida e volta).
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-xs text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                −R$ {economiaEstimada.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Coluna Direita: Demonstrativo & Recibo Financeiro ao Vivo */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Cabeçalho do Recibo */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#0072BB]">
                    GOVERNO DO PARANÁ · SIAF/SEJU
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    Demonstrativo Financeiro de Diárias
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Elemento de Despesa 3.3.90.14 · Fonte 100
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600">
                  <Receipt size={15} />
                </div>
              </div>

              {/* Linhas do Recibo */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Servidor Beneficiário</span>
                  <span className="font-semibold text-slate-900">{currentUser.nome}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">CPF / Lotação</span>
                  <span className="font-mono text-slate-700">{currentUser.cpf} · {currentUser.setor}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Trecho Oficial</span>
                  <span className="font-semibold text-slate-900">
                    Curitiba → {cidadeSelecionada.nome} ({cidadeSelecionada.regiao})
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Distância Total / Rodovia</span>
                  <span className="font-mono text-slate-800">
                    {cidadeSelecionada.distanciaKm * 2} km · {cidadeSelecionada.rodovias}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Regime de Concessão</span>
                  <span className="font-medium text-slate-800">
                    {dias} diária(s) · {comPernoite ? 'Integral (Com Pernoite)' : 'Parcial 50% (Sem Pernoite)'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500">Valor Base Unitário</span>
                  <span className="font-mono text-slate-800">
                    R$ {valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Quadro de Valor Líquido a Empenhar */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Total Líquido a Empenhar
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Crédito em conta salário (Banco do Brasil)
                  </span>
                </div>
                <div className="text-right font-mono text-2xl font-bold tracking-tight text-white">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Identificador de Pré-Protocolo */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Chave SIAF Preliminar</span>
                <span className="font-mono font-semibold text-slate-700">
                  {protocoloGerado || 'SEJU-DIARIA-2026-PENDENTE'}
                </span>
              </div>
            </div>

            {/* Botões de Ação do Demonstrativo */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <button
                type="button"
                onClick={handleEmitirGuia}
                className="w-full bg-[#0072BB] hover:bg-[#005a96] text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={15} /> Gerar Empenho e Visualizar Guia Oficial
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-semibold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={14} /> Imprimir Demonstrativo
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* (3) CLEAN HISTORY TABLE/CARDS OF OFFICIAL TRAVEL REQUESTS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <History size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Histórico de Solicitações e Empenhos de Diárias Oficiais
              </h3>
              <p className="text-xs text-slate-500">
                Registro cronológico das missões institucionais autorizadas pela Ordenadoria de Despesas SEJU
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg self-start sm:self-auto">
            {historicoViagens.length} requisições registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">Protocolo SIAF</th>
                <th className="py-3 px-4">Servidor Requerente</th>
                <th className="py-3 px-4">Destino & Rota</th>
                <th className="py-3 px-4">Período</th>
                <th className="py-3 px-4">Valor Empenhado</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {historicoViagens.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-5 font-mono text-[11px] font-semibold text-slate-900 whitespace-nowrap">
                    {item.protocolo}
                    <div className="text-[10px] font-sans font-normal text-slate-400">{item.dataEmissao}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{item.servidor}</div>
                    <div className="text-[11px] text-slate-400">{item.cargo}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">Curitiba → {item.destino}</div>
                    <div className="text-[11px] text-slate-400">{item.regiao} · {item.distanciaTotalKm} km</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-medium text-slate-800">{item.dias} diária(s)</span>
                    <div className="text-[10px] text-slate-400">
                      {item.comPernoite ? 'Com pernoite' : 'Sem pernoite'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        item.status === 'Empenhado SIAF'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                          : item.status === 'Aprovado Chefia'
                          ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                          : 'bg-amber-50 text-amber-700 border-amber-200/80'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleInspecionarHistorico(item)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70 transition cursor-pointer"
                    >
                      <Eye size={13} /> Visualizar Guia
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE PRÉ-VISUALIZAÇÃO DO DOCUMENTO OFICIAL (ANEXO I SEJU) */}
      {modalDocumento && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setModalDocumento(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200/90 space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Cabeçalho Oficial do Documento */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <BrasaoParana size="md" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#0072BB]">
                    GOVERNO DO ESTADO DO PARANÁ
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    SECRETARIA DA JUSTIÇA E CIDADANIA — SEJU
                  </h3>
                  <div className="text-[10px] text-slate-500 font-mono">
                    SOLICITAÇÃO DE DIÁRIAS E RESSARCIMENTO DE DESPESAS · ANEXO I
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModalDocumento(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dados do Documento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Número do Protocolo SIAF</span>
                <div className="font-mono font-bold text-[#0072BB] text-sm mt-0.5">
                  {protocoloGerado}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Dotação Orçamentária</span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  Fonte 100 · Elemento 3.3.90.14
                </div>
              </div>
            </div>

            {/* Tabela de Dados */}
            <div className="space-y-2 text-xs border border-slate-200/80 rounded-xl p-4 bg-slate-50/40">
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Servidor Requerente</span>
                <span className="font-semibold text-slate-900">{currentUser.nome} (CPF: {currentUser.cpf})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Cargo / Unidade</span>
                <span className="font-medium text-slate-800">{currentUser.cargo} ({currentUser.setor})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Destino & Rota</span>
                <span className="font-semibold text-[#0072BB]">Curitiba → {cidadeSelecionada.nome} ({cidadeSelecionada.distanciaKm * 2} km total)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500">Período Concedido</span>
                <span className="font-medium text-slate-800">{dias} diária(s) · {comPernoite ? 'Com pernoite regulamentar' : 'Sem pernoite'}</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="font-semibold text-slate-700">Total do Empenho Autorizado</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Justificativa */}
            <div className="text-xs space-y-1.5">
              <span className="font-semibold text-slate-700">Justificativa da Missão Governamental:</span>
              <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-700 leading-relaxed text-xs">
                "{motivo}"
              </p>
            </div>

            {/* Assinaturas Digitais SHA-256 */}
            <div className="pt-3 grid grid-cols-2 gap-4 text-center text-xs">
              <div className="border-t border-slate-200 pt-2.5 space-y-0.5">
                <div className="font-semibold text-slate-900">{currentUser.nome}</div>
                <div className="text-[10px] text-slate-500 font-mono">Assinado Digitalmente ICP-PR</div>
              </div>
              <div className="border-t border-slate-200 pt-2.5 space-y-0.5">
                <div className="font-semibold text-slate-900">Dra. Maria Helena</div>
                <div className="text-[10px] text-slate-500 font-mono">Ordenadora de Despesas · SEJU</div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" /> Documento Válido e Registrado no SIAF
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-2"
              >
                <Printer size={14} /> Imprimir / Salvar PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
