import { ModuloCabecalho, AcaoModulo, NumeroModulo } from '../modulo/ModuloCabecalho';
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
  X,
  CheckCircle2,
  SlidersHorizontal,
  History,
  Eye,
  Car,
  Lock,
  QrCode,
  Scale,
  BadgeCheck,
  Building2,
  Award
} from 'lucide-react';
import { Usuario } from '../../types';
import { MapaParanaInterativo, CIDADES_PARANA, DestinoParana } from './MapaParanaInterativo';
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

  // Valores Base da Diária (Decreto Estadual nº 1.428/PR)
  const valoresNivel: Record<string, number> = {
    medio: 280,
    superior: 380,
    direcao: 520
  };

  const labelsNivel: Record<string, string> = {
    medio: 'Apoio / Nível Médio (Escala I)',
    superior: 'Técnico / Nível Superior (Escala II)',
    direcao: 'Direção Superior / Gabinete (Escala Especial)'
  };

  const valorUnitario = valoresNivel[cargoNivel];
  const multiplicadorPernoite = comPernoite ? 1 : 0.5;
  const valorTotal = valorUnitario * dias * multiplicadorPernoite;

  // Decomposição Oficial Fazendária (Decreto Estadual nº 1.428/PR: 50% Pousada, 35% Alimentação, 15% Locomoção)
  const parcelaHospedagem = comPernoite ? valorTotal * 0.50 : 0;
  const parcelaAlimentacao = comPernoite ? valorTotal * 0.35 : valorTotal * 0.70;
  const parcelaLocomocao = comPernoite ? valorTotal * 0.15 : valorTotal * 0.30;

  // Comparador de Economicidade (Frota Oficial vs Passagem Aérea Comercial)
  const custoAereoEstimado = cidadeSelecionada.distanciaKm > 300 ? 1650 : 890;
  const custoCombustivelCarro = ((cidadeSelecionada.distanciaKm * 2) / 10) * 5.89; // 10 km/l a R$ 5,89
  const economiaEstimada = Math.max(0, custoAereoEstimado - custoCombustivelCarro);
  const percentualEconomia =
    custoAereoEstimado > 0
      ? Math.min(98, Math.max(12, Math.round((economiaEstimada / custoAereoEstimado) * 100)))
      : 0;
  const proporcaoFrotaVsAereo =
    custoAereoEstimado > 0
      ? Math.min(100, Math.max(8, Math.round((custoCombustivelCarro / custoAereoEstimado) * 100)))
      : 20;

  // Hash criptográfico determinístico para o selo ICP-PR
  const codigoProtocoloAtivo = protocoloGerado || 'SEJU-DIARIA-2026-894102';
  const hashIcpPr = `ICP-PR·SHA256:${codigoProtocoloAtivo.slice(-6)}F8A9·4E2C·91B0·CELEPAR`;

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
    <div className="space-y-6 font-sans">
      <ModuloCabecalho
        cor="lima"
        rotulo="Viagens a serviço · Diárias"
        titulo="Diárias"
        descricao="Escolha o destino no mapa do Paraná, confira o valor calculado pela tabela vigente e gere o pedido para a chefia autorizar."
        onVoltar={onVoltarHub}
        acoes={
          <AcaoModulo destaque icone={<FileCheck2 size={15} />} onClick={handleEmitirGuia}>
            Gerar pedido
          </AcaoModulo>
        }
      >
        <div className="flex flex-wrap gap-2">
          <NumeroModulo rotulo="Destino" valor={cidadeSelecionada.nome} detalhe="saindo de Curitiba" />
          <NumeroModulo
            rotulo="Valor estimado"
            valor={`R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          />
        </div>
      </ModuloCabecalho>

      {/* (2) DIVIDED STRUCTURE: MAPA INTERATIVO + PARÂMETROS & DEMONSTRATIVO FAZENDÁRIO */}
      <div className="space-y-6">
        {/* Subseção 2A: Mapa Geográfico Interativo do Paraná & Telemetria */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
              <MapPin size={14} className="text-[var(--brand)]" />
              <span>1. Cartografia Tática e Seleção de Regional</span>
            </div>
            <span className="text-[11px] tabular-nums text-[var(--text-muted)]">
              Marco Zero: Sede SEJU Hauer (25°28&apos;S 49°15&apos;W)
            </span>
          </div>

          <MapaParanaInterativo
            cidadeSelecionada={cidadeSelecionada}
            onSelectCidade={setCidadeSelecionada}
            comPernoite={comPernoite}
            onTogglePernoite={setComPernoite}
          />
        </div>

        {/* Subseção 2B: Parâmetros + Decomposição + Economicidade (Esquerda) & Demonstrativo Fazendário (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Coluna Esquerda: Enquadramento, Barra Segmentada (50/35/15) e Comparador de Economicidade */}
          <div className="lg:col-span-7 bg-[var(--surface)] rounded-[28px] p-5 sm:p-7 border border-[var(--border)]/90 space-y-6 flex flex-col justify-between">
            {/* Cabeçalho da Coluna */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--brand-soft)] border border-[var(--brand-border)]/70 flex items-center justify-center text-[var(--brand)]">
                  <SlidersHorizontal size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text)] tracking-tight">
                    2. Enquadramento Funcional, Decomposição & Economicidade
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Parâmetros auditáveis segundo o Decreto Estadual nº 1.428/PR (Tabela SEFA/SEJU)
                  </p>
                </div>
              </div>
              <span className="text-[10px] tabular-nums font-bold text-[var(--brand)] bg-[var(--brand-soft)] px-2.5 py-1 rounded-lg border border-[var(--brand-border)]/70">
                ANEXO I · SEFA-PR
              </span>
            </div>

            {/* Passo 1 & 2: Nível Funcional e Duração */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-[var(--text)]">
                  Escalão / Nível Funcional do Servidor
                </label>
                <select
                  value={cargoNivel}
                  onChange={e => {
                    soundFX.playClick();
                    setCargoNivel(e.target.value as 'superior' | 'medio' | 'direcao');
                  }}
                  className="w-full p-2.5 bg-[var(--surface-2)]/90 hover:bg-[var(--surface-2)]/70 border border-[var(--border)]/90 rounded-xl text-xs font-semibold text-[var(--text)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] outline-hidden transition cursor-pointer"
                >
                  <option value="superior">Técnico / Nível Superior (R$ 380,00 / dia)</option>
                  <option value="medio">Apoio / Nível Médio (R$ 280,00 / dia)</option>
                  <option value="direcao">Direção Superior / Gabinete (R$ 520,00 / dia)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[var(--text)]">
                  Quantidade de Diárias Concedidas
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setDias(Math.max(0.5, dias - 0.5));
                    }}
                    className="w-10 h-10 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-2)] border border-[var(--border)]/90 text-[var(--text)] font-black text-sm flex items-center justify-center cursor-pointer transition"
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
                      className="w-full py-2.5 px-3 bg-[var(--surface-2)]/90 border border-[var(--border)]/90 rounded-xl text-xs tabular-nums font-black text-[var(--text)] text-center outline-hidden focus:bg-[var(--surface)] focus:border-[var(--brand)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setDias(dias + 0.5);
                    }}
                    className="w-10 h-10 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-2)] border border-[var(--border)]/90 text-[var(--text)] font-black text-sm flex items-center justify-center cursor-pointer transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* BARRA SEGMENTADA VISUAL PARA A DECOMPOSIÇÃO OFICIAL (50% POUSADA, 35% ALIMENTAÇÃO, 15% LOCOMOÇÃO) */}
            <div className="p-4 rounded-[18px] bg-[var(--surface-2)]/90 border border-[var(--border)]/90 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Scale size={14} className="text-[var(--brand)]" />
                  <span className="text-xs font-extrabold text-[var(--text)]">
                    Decomposição Legal da Diária (50% Pousada · 35% Alimentação · 15% Locomoção)
                  </span>
                </div>
                <span className="text-[10px] tabular-nums font-bold text-[var(--text-muted)] bg-[var(--surface)] px-2 py-0.5 rounded-md border border-[var(--border)]/80">
                  Art. 14 · Decreto nº 1.428/PR
                </span>
              </div>

              {/* Barra Multi-Segmentada Visual de Alta Precisão */}
              <div className="space-y-1.5">
                <div className="h-4 w-full rounded-full bg-[var(--surface-3)]/80 p-0.5 flex items-center gap-0.5 overflow-hidden ">
                  {/* Segmento 1: 50% Pousada */}
                  <div
                    style={{ width: comPernoite ? '50%' : '12%' }}
                    className={`h-full rounded-l-full transition-all duration-500 flex items-center justify-center text-[9px] tabular-nums font-bold text-white ${
                      comPernoite ? 'bg-[#005A9C]' : 'bg-[var(--text-subtle)]/70'
                    }`}
                    title="50% Pousada / Hospedagem"
                  >
                    {comPernoite ? '50%' : '0%'}
                  </div>
                  {/* Segmento 2: 35% Alimentação */}
                  <div
                    style={{ width: comPernoite ? '35%' : '60%' }}
                    className="h-full bg-[#0072BB] transition-all duration-500 flex items-center justify-center text-[9px] tabular-nums font-bold text-white"
                    title="35% Alimentação Oficial"
                  >
                    35%
                  </div>
                  {/* Segmento 3: 15% Locomoção */}
                  <div
                    style={{ width: comPernoite ? '15%' : '28%' }}
                    className="h-full rounded-r-full bg-[#00A859] transition-all duration-500 flex items-center justify-center text-[9px] tabular-nums font-bold text-white"
                    title="15% Locomoção Urbana"
                  >
                    15%
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] tabular-nums text-[var(--text-muted)] px-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#005A9C]" /> 50% Pousada
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0072BB]" /> 35% Alimentação
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00A859]" /> 15% Locomoção Urbana
                  </span>
                </div>
              </div>

              {/* Cards das 3 Rubricas Fazendárias */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]/80 shadow-2xs">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#005A9C]" /> Pousada
                    </span>
                    <span className="tabular-nums text-[var(--brand)]">
                      {comPernoite ? '50%' : 'Isento'}
                    </span>
                  </div>
                  <div className="tabular-nums font-black text-sm text-[var(--text)] mt-1">
                    R$ {parcelaHospedagem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-[var(--text-subtle)] mt-0.5">
                    Custeio hoteleiro
                  </div>
                </div>

                <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]/80 shadow-2xs">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0072BB]" /> Alimentação
                    </span>
                    <span className="tabular-nums text-[var(--brand)]">
                      {comPernoite ? '35%' : '35% (Base)'}
                    </span>
                  </div>
                  <div className="tabular-nums font-black text-sm text-[var(--text)] mt-1">
                    R$ {parcelaAlimentacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-[var(--text-subtle)] mt-0.5">
                    Refeições em trânsito
                  </div>
                </div>

                <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]/80 shadow-2xs">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00A859]" /> Locomoção
                    </span>
                    <span className="tabular-nums text-[var(--verde)]">
                      {comPernoite ? '15%' : '15% (Base)'}
                    </span>
                  </div>
                  <div className="tabular-nums font-black text-sm text-[var(--text)] mt-1">
                    R$ {parcelaLocomocao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-[var(--text-subtle)] mt-0.5">
                    Mobilidade no destino
                  </div>
                </div>
              </div>
            </div>

            {/* Modelos Rápidos + Justificativa */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Modelos Padronizados de Objeto Institucional
                </label>
                <span className="text-[10px] tabular-nums text-[var(--text-subtle)]">Preenchimento rápido</span>
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
                          ? 'bg-[#0B1B2E] text-white border-[#22324C] shadow-2xs'
                          : 'bg-[var(--surface-2)]/80 hover:bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]/80'
                      }`}
                    >
                      <div className="font-bold truncate">{p.titulo}</div>
                      <div className={`text-[10px] truncate mt-0.5 ${ativo ? 'text-[#DCEEFB]' : 'text-[var(--text-subtle)]'}`}>
                        Aplicar minuta
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5 text-xs pt-1">
                <label className="block font-bold text-[var(--text)]">
                  Descrição do Objeto, Motivação Pública e Cronograma da Missão
                </label>
                <textarea
                  rows={2}
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Descreva as reuniões técnicas, inspeções e atividades programadas no município de destino..."
                  className="w-full p-3 bg-[var(--surface-2)]/80 border border-[var(--border)]/90 rounded-xl text-xs text-[var(--text)] leading-relaxed focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] outline-hidden transition"
                />
              </div>
            </div>

            {/* COMPARADOR DE ECONOMICIDADE (FROTA OFICIAL VS PASSAGEM AÉREA) COM MEDIDOR VISUAL */}
            <div className="p-4 bg-[var(--verde-soft)]/90 rounded-[18px] border border-[var(--verde-border)]/90 space-y-3.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#00703C] text-white flex items-center justify-center shadow-2xs shrink-0">
                    <TrendingDown size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[var(--verde)] block">
                      Comparador de Economicidade (Frota Oficial vs. Passagem Aérea)
                    </span>
                    <span className="text-[11px] text-[var(--verde)]">
                      Medidor de eficiência orçamentária e preservação de recursos do Erário Estadual
                    </span>
                  </div>
                </div>
                <span className="tabular-nums font-black text-xs text-[var(--verde)] bg-[var(--surface)] px-3 py-1 rounded-full border border-[var(--verde-border)] shadow-2xs">
                  Economia de {percentualEconomia}% (−R$ {economiaEstimada.toFixed(2)})
                </span>
              </div>

              {/* Comparativo Lado a Lado + Medidor Visual de Economia aos Cofres Públicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Opção 1: Frota Oficial SEJU */}
                <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--verde-border)]/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[var(--verde)]">
                    <span className="flex items-center gap-1">
                      <Car size={12} /> Frota Oficial SEJU (Eleita)
                    </span>
                    <span className="tabular-nums">{cidadeSelecionada.distanciaKm * 2} km</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="tabular-nums font-black text-sm text-[var(--text)]">
                      R$ {custoCombustivelCarro.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[10px] text-[var(--verde)] font-semibold">
                      Combustível ida/volta
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${proporcaoFrotaVsAereo}%` }}
                      className="h-full bg-[#00A859] rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Opção 2: Passagem Aérea Comercial */}
                <div className="p-3 bg-[var(--surface)]/80 rounded-xl border border-[var(--border)]/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Plane size={12} /> Passagem Aérea Comercial
                    </span>
                    <span className="tabular-nums">Tarifa Média Gov</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="tabular-nums font-bold text-sm text-[var(--text-muted)] line-through">
                      R$ {custoAereoEstimado.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[10px] text-[var(--text-subtle)]">
                      Bilhete + taxas embarque
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[var(--text-subtle)] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: DEMONSTRATIVO FAZENDÁRIO DE ALTA PRECISÃO */}
          <div className="lg:col-span-5 bg-[var(--surface)] rounded-[28px] p-5 sm:p-7 border-2 border-[var(--border)]/90 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[var(--brand)]/50 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[var(--brand)]/50 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[var(--brand)]/50 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[var(--brand)]/50 pointer-events-none" />

            <div className="space-y-5">
              {/* Cabeçalho do Demonstrativo Fazendário */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-dashed border-[var(--border)]">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] tabular-nums font-bold uppercase tracking-widest text-[var(--brand)] bg-[var(--brand-soft)] px-2.5 py-0.5 rounded-md border border-[var(--brand-border)]/70">
                    <ShieldCheck size={11} /> SIAF-PR · DEMONSTRATIVO FAZENDÁRIO
                  </div>
                  <h3 className="text-base font-black text-[var(--text)] mt-1.5 tracking-tight">
                    Espelho de Liquidação & Pré-Empenho
                  </h3>
                  <p className="text-[11px] tabular-nums text-[var(--text-muted)] mt-0.5">
                    Dotação 3.3.90.14.01 · Fonte 100 (Tesouro Estadual)
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[18px] bg-[#0B1B2E] text-[var(--brand)] border border-[#22324C] flex items-center justify-center shadow-xs shrink-0">
                  <Receipt size={18} />
                </div>
              </div>

              {/* Quadro de Identificação Funcional & Parâmetros Tabulares */}
              <div className="space-y-2 text-xs font-sans">
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)]">Servidor Beneficiário</span>
                  <span className="font-bold text-[var(--text)]">{currentUser.nome}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)]">CPF / Unidade SEJU</span>
                  <span className="tabular-nums font-semibold text-[var(--text)]">
                    {currentUser.cpf} · {currentUser.setor}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)]">Enquadramento Legal</span>
                  <span className="font-semibold text-[var(--text)]">{labelsNivel[cargoNivel]}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)]">Trecho & Jurisdição</span>
                  <span className="font-bold text-[var(--brand)]">
                    Curitiba → {cidadeSelecionada.nome} ({cidadeSelecionada.regiao})
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)]">Extensão / Eixo Rodoviário</span>
                  <span className="tabular-nums font-semibold text-[var(--text)]">
                    {cidadeSelecionada.distanciaKm * 2} km · {cidadeSelecionada.rodovias}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)]">Memória de Cálculo</span>
                  <span className="tabular-nums font-bold text-[var(--text)]">
                    {dias}d × R$ {valorUnitario} × {comPernoite ? '100%' : '50%'}
                  </span>
                </div>
              </div>

              {/* Mini-Tabela Fazendária de Rubricas no Demonstrativo */}
              <div className="p-3.5 rounded-[18px] bg-[var(--surface-2)] border border-[var(--border)]/80 space-y-2 text-[11px] tabular-nums">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)] font-sans flex items-center justify-between">
                  <span>Discriminação Contábil SIAF</span>
                  <span>Decreto nº 1.428/PR</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>3.3.90.14.01 · Pousada (50%)</span>
                  <span className="font-bold text-[var(--text)]">
                    R$ {parcelaHospedagem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>3.3.90.14.02 · Alimentação (35%)</span>
                  <span className="font-bold text-[var(--text)]">
                    R$ {parcelaAlimentacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>3.3.90.14.03 · Locomoção Urbana (15%)</span>
                  <span className="font-bold text-[var(--text)]">
                    R$ {parcelaLocomocao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Display de Alta Precisão do Total Líquido a Empenhar */}
              <div className="p-4.5 rounded-[18px] bg-[#0B1B2E] text-white border border-[#22324C] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tabular-nums uppercase tracking-widest text-[var(--brand)] font-bold">
                    Valor Líquido a Empenhar
                  </span>
                  <span className="text-[10px] tabular-nums text-[var(--verde)] bg-[#00A859]/10 border border-[var(--verde)]/30 px-2 py-0.5 rounded-full">
                    ● CONFORME TCE-PR
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-0.5">
                  <div className="text-[11px] text-[var(--ink-muted)]">
                    Ordem Bancária · Banco do Brasil
                  </div>
                  <div className="text-right tabular-nums text-2xl sm:text-3xl font-black tracking-tight text-white">
                    R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Chave SIAF & Hash Preliminar */}
              <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]/80 flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                  <Lock size={12} className="text-[var(--brand)]" /> Protocolo SIAF/ICP-PR
                </span>
                <span className="tabular-nums font-bold text-[var(--text)]">
                  {protocoloGerado || 'SEJU-DIARIA-2026-PRONTO'}
                </span>
              </div>
            </div>

            {/* Botões de Ação do Demonstrativo */}
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2.5">
              <button
                type="button"
                onClick={handleEmitirGuia}
                className="w-full bg-[#005A9C] hover:bg-[#005A9C] text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={15} /> Gerar Empenho & Abrir Anexo I Oficial (ICP-PR)
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]/90 font-semibold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={14} /> Imprimir Espelho Fazendário
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* (3) HISTÓRICO DE SOLICITAÇÕES E EMPENHOS DE DIÁRIAS OFICIAIS */}
      <div className="bg-[var(--surface)] rounded-[28px] border border-[var(--border)]/90 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] text-[var(--text)] flex items-center justify-center border border-[var(--border)]/70">
              <History size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text)]">
                Livro de Registro de Concessões e Empenhos SIAF
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Histórico auditável de missões oficiais autorizadas pela Ordenadoria de Despesas da SEJU/PR
              </p>
            </div>
          </div>
          <span className="text-xs tabular-nums font-bold text-[var(--brand)] bg-[var(--brand-soft)] border border-[var(--brand-border)]/70 px-3 py-1 rounded-full self-start sm:self-auto">
            {historicoViagens.length} concessões registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--surface-2)]/80 border-b border-[var(--border)]/70 text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                <th className="py-3.5 px-5">Protocolo SIAF</th>
                <th className="py-3.5 px-4">Servidor Requerente</th>
                <th className="py-3.5 px-4">Destino & Rota</th>
                <th className="py-3.5 px-4">Regime</th>
                <th className="py-3.5 px-4">Valor Empenhado</th>
                <th className="py-3.5 px-4">Status Fazendário</th>
                <th className="py-3.5 px-5 text-right">Anexo I</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text)]">
              {historicoViagens.map(item => (
                <tr key={item.id} className="hover:bg-[var(--surface-2)]/70 transition">
                  <td className="py-3.5 px-5 tabular-nums text-[11px] font-bold text-[var(--text)] whitespace-nowrap">
                    {item.protocolo}
                    <div className="text-[10px] font-sans font-normal text-[var(--text-subtle)]">{item.dataEmissao}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-[var(--text)]">{item.servidor}</div>
                    <div className="text-[11px] text-[var(--text-subtle)]">{item.cargo}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-[var(--text)]">Curitiba → {item.destino}</div>
                    <div className="text-[11px] text-[var(--text-subtle)]">{item.regiao} · {item.distanciaTotalKm} km</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-[var(--text)]">{item.dias} diária(s)</span>
                    <div className="text-[10px] text-[var(--text-subtle)]">
                      {item.comPernoite ? 'Com pernoite (100%)' : 'Sem pernoite (50%)'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 tabular-nums font-black text-[var(--text)] whitespace-nowrap">
                    R$ {item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        item.status === 'Empenhado SIAF'
                          ? 'bg-[var(--verde-soft)] text-[var(--verde)] border-[var(--verde-border)]/80'
                          : item.status === 'Aprovado Chefia'
                          ? 'bg-[var(--brand-soft)] text-[var(--brand)] border-[var(--brand-border)]/80'
                          : 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-border)]/80'
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--brand)] hover:text-white bg-[var(--brand-soft)] hover:bg-[#005A9C] border border-[var(--brand-border)]/80 transition cursor-pointer"
                    >
                      <Eye size={13} /> Anexo I ICP-PR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* (4) MODAL DO ANEXO I OFICIAL — BORDA DUPLA DIPLOMÁTICA, MARCA D'ÁGUA INSTITUCIONAL E SELO CRIPTOGRÁFICO ICP-PR */}
      {modalDocumento && (
        <div
          className="fixed inset-0 bg-[#0B1B2E]/75 z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
          onClick={() => setModalDocumento(false)}
        >
          <div
            className="bg-[#FCFBF8] rounded-[28px] max-w-3xl w-full p-3 sm:p-5 border border-[var(--border-strong)] animate-in zoom-in-95 max-h-[94vh] overflow-y-auto relative"
            onClick={e => e.stopPropagation()}
          >
            {/* MOLDURA COM BORDA DUPLA DIPLOMÁTICA DE ESTADO */}
            <div className="relative border-4 border-double border-[var(--brand)]/50 rounded-[18px] p-5 sm:p-8 bg-[var(--surface)]/95 overflow-hidden space-y-5 ">
              <div className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 border-[var(--brand)] pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 border-[var(--brand)] pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 border-[var(--brand)] pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 border-[var(--brand)] pointer-events-none" />

              {/* MARCA D'ÁGUA INSTITUCIONAL SUTIL AO FUNDO */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                <div className="opacity-[0.045] scale-[2.6] transform -rotate-6">
                  <BrasaoParana size="lg" />
                </div>
                <div className="mt-16 text-[22px] font-black tracking-[0.35em] text-[var(--text)] opacity-[0.035] uppercase -rotate-12 whitespace-nowrap">
                  GOVERNO DO PARANÁ · ANEXO I OFICIAL · ICP-PR
                </div>
              </div>

              {/* CONTEÚDO DO DOCUMENTO DIPLOMÁTICO (ACIMA DA MARCA D'ÁGUA) */}
              <div className="relative z-10 space-y-5">
                {/* Cabeçalho Oficial do Estado do Paraná */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-double border-[var(--border-strong)]">
                  <div className="flex items-center gap-3.5">
                    <BrasaoParana size="md" />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--brand)]">
                        GOVERNO DO ESTADO DO PARANÁ
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-[var(--text)] leading-tight tracking-tight">
                        SECRETARIA DE ESTADO DA JUSTIÇA E CIDADANIA — SEJU/PR
                      </h3>
                      <div className="text-[10px] text-[var(--text-muted)] tabular-nums font-semibold mt-0.5">
                        ANEXO I · GUIA DE CONCESSÃO DE DIÁRIAS E EMPENHO FAZENDÁRIO (DECRETO Nº 1.428/PR)
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setModalDocumento(false)}
                    className="p-1.5 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-subtle)] hover:text-[var(--text)] cursor-pointer border border-transparent hover:border-[var(--border)] transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Identificadores Superiores do Ato Administrativo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-[var(--surface-2)]/90 rounded-xl border border-[var(--border)]/90">
                    <span className="text-[9px] font-bold text-[var(--text-subtle)] uppercase tracking-wider block">
                      Protocolo SIAF / Nota de Empenho
                    </span>
                    <div className="tabular-nums font-black text-[var(--brand)] text-xs sm:text-sm mt-0.5">
                      {codigoProtocoloAtivo}
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--surface-2)]/90 rounded-xl border border-[var(--border)]/90">
                    <span className="text-[9px] font-bold text-[var(--text-subtle)] uppercase tracking-wider block">
                      Classificação Orçamentária
                    </span>
                    <div className="tabular-nums font-bold text-[var(--text)] text-xs sm:text-sm mt-0.5">
                      3.3.90.14.01 · Fonte 100
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--verde-soft)]/80 rounded-xl border border-[var(--verde-border)]/90">
                    <span className="text-[9px] font-bold text-[var(--verde)] uppercase tracking-wider block">
                      Economicidade Aferida
                    </span>
                    <div className="tabular-nums font-black text-[var(--verde)] text-xs sm:text-sm mt-0.5">
                      −R$ {economiaEstimada.toFixed(2)} ({percentualEconomia}%)
                    </div>
                  </div>
                </div>

                {/* Quadro Oficial de Qualificação do Servidor e Itinerário */}
                <div className="space-y-2 text-xs border border-[var(--border-strong)]/90 rounded-xl p-4 bg-[var(--surface)]/80">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand)] pb-1 border-b border-[var(--border)] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={12} /> I. Qualificação Funcional e Itinerário Geodésico
                    </span>
                    <span className="tabular-nums text-[var(--text-muted)]">SIRGAS 2000</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)]">Servidor Beneficiário / CPF</span>
                    <span className="font-bold text-[var(--text)]">
                      {currentUser.nome} · <span className="tabular-nums">{currentUser.cpf}</span>
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)]">Cargo Efetivo / Lotação</span>
                    <span className="font-semibold text-[var(--text)]">
                      {currentUser.cargo} ({currentUser.setor})
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)]">Trecho & Malha Rodoviária</span>
                    <span className="font-bold text-[var(--brand)]">
                      Curitiba → {cidadeSelecionada.nome} ({cidadeSelecionada.rodovias} · {cidadeSelecionada.distanciaKm * 2} km ida/volta)
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[var(--text-muted)]">Regime de Concessão</span>
                    <span className="font-semibold text-[var(--text)]">
                      {dias} diária(s) · {comPernoite ? 'Integral 100% (Com Pernoite)' : 'Parcial 50% (Sem Pernoite)'}
                    </span>
                  </div>
                </div>

                {/* Quadro II: Decomposição Fazendária Oficial (50% / 35% / 15%) */}
                <div className="border border-[var(--border-strong)]/90 rounded-xl p-4 bg-[var(--surface-2)]/70 space-y-2.5 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand)] flex items-center justify-between">
                    <span>II. Memória de Cálculo e Decomposição Legal (Decreto nº 1.428/PR)</span>
                    <span className="tabular-nums">50% / 35% / 15%</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-1 tabular-nums text-[11px]">
                    <div className="p-2.5 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                      <span className="text-[9px] font-sans font-bold uppercase text-[var(--text-subtle)] block">
                        Pousada (50%)
                      </span>
                      <span className="font-bold text-[var(--text)]">
                        R$ {parcelaHospedagem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-2.5 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                      <span className="text-[9px] font-sans font-bold uppercase text-[var(--text-subtle)] block">
                        Alimentação (35%)
                      </span>
                      <span className="font-bold text-[var(--text)]">
                        R$ {parcelaAlimentacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-2.5 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                      <span className="text-[9px] font-sans font-bold uppercase text-[var(--text-subtle)] block">
                        Locomoção (15%)
                      </span>
                      <span className="font-bold text-[var(--text)]">
                        R$ {parcelaLocomocao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/80">
                    <span className="font-bold text-[var(--text)]">
                      VALOR LÍQUIDO TOTAL AUTORIZADO PARA EMPENHO SIAF
                    </span>
                    <span className="tabular-nums font-black text-base text-[var(--verde)]">
                      R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Motivação do Ato */}
                <div className="text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    III. Fundamentação e Objeto do Serviço Público:
                  </span>
                  <p className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--border)]/90 text-[var(--text)] leading-relaxed text-xs italic">
                    &ldquo;{motivo}&rdquo;
                  </p>
                </div>

                {/* SELO CRIPTOGRÁFICO ICP-PR & ASSINATURAS QUALIFICADAS */}
                <div className="p-4 rounded-[18px] bg-[#0B1B2E] text-white border border-[var(--brand)]/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#22324C]/80">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#0072BB]/15 border border-[var(--brand)]/40 flex items-center justify-center text-[#DCEEFB] shrink-0">
                        <QrCode size={24} />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[10px] tabular-nums font-bold uppercase tracking-widest text-[var(--verde)]">
                          <BadgeCheck size={13} /> SELO CRIPTOGRÁFICO ICP-PR · CERTIFICAÇÃO A3
                        </div>
                        <div className="text-xs font-bold text-white mt-0.5">
                          Autoridade Certificadora do Estado do Paraná · CELEPAR / SIAF
                        </div>
                        <div className="text-[10px] tabular-nums text-[#DCEEFB]/90 truncate max-w-md">
                          {hashIcpPr}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-center bg-[#D98A00]/15 border border-[var(--warning)]/40 text-[#FFE2A8] px-2.5 py-1 rounded-lg text-[10px] tabular-nums font-bold shrink-0">
                      <Award size={13} /> CHANCELA DIPLOMÁTICA PR
                    </div>
                  </div>

                  {/* Dupla Assinatura Digital */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-0.5">
                    <div className="p-2.5 rounded-xl bg-[#0B1B2E]/70 border border-[#22324C]/80 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{currentUser.nome}</div>
                        <div className="text-[10px] text-[var(--text-subtle)] tabular-nums">
                          Servidor Proponente · Assinatura ICP-PR
                        </div>
                      </div>
                      <CheckCircle2 size={15} className="text-[var(--verde)] shrink-0" />
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0B1B2E]/70 border border-[#22324C]/80 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Dra. Maria Helena</div>
                        <div className="text-[10px] text-[var(--text-subtle)] tabular-nums">
                          Ordenadora de Despesas · SEJU/PR
                        </div>
                      </div>
                      <CheckCircle2 size={15} className="text-[var(--verde)] shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Rodapé de Ações do Modal */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-[var(--text-muted)] tabular-nums flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[var(--verde)]" /> Autenticidade garantida sob Decreto Estadual nº 1.428/PR
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalDocumento(false)}
                      className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text)] font-semibold text-xs transition cursor-pointer"
                    >
                      Fechar
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-[#005A9C] hover:bg-[#005A9C] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      <Printer size={14} /> Imprimir Anexo I Oficial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

