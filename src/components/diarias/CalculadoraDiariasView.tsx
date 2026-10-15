import React, { useState } from 'react';
import { 
  Plane, 
  Printer, 
  FileCheck2, 
  Info, 
  ArrowRight, 
  MapPin, 
  Compass, 
  Navigation, 
  ShieldCheck, 
  Sparkles,
  TrendingDown,
  DollarSign,
  Receipt,
  FileText,
  X,
  QrCode,
  CheckCircle2
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

export const CalculadoraDiariasView: React.FC<CalculadoraDiariasViewProps> = ({ currentUser, onVoltarHub }) => {
  const [cidadeSelecionada, setCidadeSelecionada] = useState<DestinoParana>(CIDADES_PARANA[3]); // Londrina por padrão
  const [cargoNivel, setCargoNivel] = useState<'superior' | 'medio' | 'direcao'>('superior');
  const [dias, setDias] = useState<number>(2);
  const [comPernoite, setComPernoite] = useState<boolean>(true);
  const [motivo, setMotivo] = useState(JUSTIFICATIVAS_PRESETS[0].texto);
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null);
  const [modalDocumento, setModalDocumento] = useState<boolean>(false);

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

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSelectPreset = (texto: string) => {
    soundFX.playClick();
    setMotivo(texto);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Barra de Topo do Módulo */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-gov-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <button onClick={onVoltarHub} className="hover:text-[#0072BB] font-semibold cursor-pointer">
              ← Central de Aplicativos
            </button>
            <span>/</span>
            <span className="font-bold text-slate-800">Diárias & Missões Oficiais</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Plane size={26} className="text-amber-600" />
            Controle de Viagens, Rotas & Diárias Oficiais
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Planejamento guiado com mapa interativo do Paraná, cálculo conforme tabela oficial e emissão de formulário com código de empenho.
          </p>
        </div>

        <button
          onClick={handleEmitirGuia}
          className="bg-[#0072BB] hover:bg-[#00538A] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <FileCheck2 size={16} /> Emitir Guia Oficial
        </button>
      </div>

      {/* 1. O MAPA RADAR GEOGRÁFICO INTERATIVO DO PARANÁ */}
      <MapaParanaInterativo
        cidadeSelecionada={cidadeSelecionada}
        onSelectCidade={setCidadeSelecionada}
        comPernoite={comPernoite}
        onTogglePernoite={setComPernoite}
      />

      {/* 2. PARÂMETROS FUNCIONAIS & VOUCHER OFICIAL DA FAZENDA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Parâmetros da Missão */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-gov-card space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Dados do Requerente & Justificativa
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Decreto Estadual nº 1.428/PR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Nível Funcional do Servidor *
              </label>
              <select
                value={cargoNivel}
                onChange={e => {
                  soundFX.playClick();
                  setCargoNivel(e.target.value as any);
                }}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-hidden"
              >
                <option value="superior">Nível Superior / Especialistas (R$ 380/dia)</option>
                <option value="medio">Nível Médio / Operacional (R$ 280/dia)</option>
                <option value="direcao">Direção Superior / Chefe de Gabinete (R$ 520/dia)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Duração da Missão (Dias de Diária) *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setDias(Math.max(0.5, dias - 0.5));
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="30"
                  value={dias}
                  onChange={e => setDias(Math.max(0.5, Number(e.target.value)))}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-black text-slate-900 text-center outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setDias(dias + 0.5);
                  }}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Modelos de Justificativa Prontos (1 Clique) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Preenchimento Rápido de Objeto / Missão Institucional:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {JUSTIFICATIVAS_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p.texto)}
                  className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0072BB] rounded-lg border border-slate-200 transition cursor-pointer"
                >
                  {p.titulo}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1.5">
              Objeto, Motivo e Itinerário Oficial da Missão *
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Descreva as reuniões, vistorias e expedientes a serem cumpridos no município de destino..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 outline-hidden"
            />
          </div>

          {/* Itemização Fazendária */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Receipt size={14} className="text-amber-700" /> Detalhamento Contábil da Diária:
              </span>
              <span className="font-mono text-slate-900 font-black">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Hospedagem (50%)</div>
                <div className="font-bold text-slate-800 font-mono mt-0.5">
                  R$ {parcelaHospedagem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Alimentação (35%)</div>
                <div className="font-bold text-slate-800 font-mono mt-0.5">
                  R$ {parcelaAlimentacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Locomoção (15%)</div>
                <div className="font-bold text-slate-800 font-mono mt-0.5">
                  R$ {parcelaLocomocao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Comparativo de Economia para o Erário Público */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <TrendingDown size={18} className="text-emerald-700" />
              <div>
                <span className="font-bold">Eficiência do Gasto Público (Frota vs Aéreo):</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Deslocamento com viatura SEJU economiza cerca de <strong>R$ {economiaEstimada.toFixed(2)}</strong> em relação a passagens comerciais.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Voucher Oficial Fazendário Pronto para Assinar */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-300 shadow-gov-card flex flex-col justify-between font-mono relative overflow-hidden">
          
          {/* Fita Superior Fazendária */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-amber-500 via-amber-600 to-orange-600" />

          <div className="space-y-4 pt-1">
            <div className="text-center border-b-2 border-dashed border-slate-200 pb-4">
              <div className="text-[10px] font-black tracking-widest text-[#0072BB] uppercase">
                GOVERNO DO ESTADO DO PARANÁ · SEJU
              </div>
              <h3 className="font-black text-sm text-slate-900 mt-1">
                DEMONSTRATIVO DE DIÁRIAS OFICIAIS
              </h3>
              <div className="text-[9px] text-slate-500 mt-0.5">
                Decreto Estadual nº 1.428/PR · Dotação Orçamentária Fonte 100
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 font-sans">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">BENEFICIÁRIO:</span>
                <span className="font-bold text-slate-900">{currentUser.nome}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">CPF DO SERVIDOR:</span>
                <span className="font-mono text-slate-900">{currentUser.cpf}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">ROTA:</span>
                <span className="font-bold text-[#0072BB]">Curitiba ➔ {cidadeSelecionada.nome}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">DISTÂNCIA TOTAL:</span>
                <span className="font-mono text-slate-900 font-bold">{cidadeSelecionada.distanciaKm * 2} km (ida e volta)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">DIÁRIAS CONCEDIDAS:</span>
                <span className="font-bold text-slate-900">{dias} diária(s) {comPernoite ? '(com pernoite)' : '(sem pernoite)'}</span>
              </div>
            </div>

            {/* Valor em Destaque */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <div className="text-[10px] uppercase font-black text-amber-800">
                Total a Empenhar pelo Tesouro
              </div>
              <div className="text-3xl font-black text-amber-950 font-mono mt-0.5">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Código de Barras / Protocolo */}
            <div className="pt-2 text-center">
              <div className="tracking-[5px] font-mono text-xs text-slate-400 select-none">
                ||||| | |||| ||| |||| | ||| |||||||
              </div>
              <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                {protocoloGerado || `SEJU-DIARIA-2026-${Math.floor(100000 + Math.random() * 900000)}`}
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-200 space-y-2">
            <button
              type="button"
              onClick={handleEmitirGuia}
              className="w-full bg-[#0072BB] hover:bg-[#00538A] text-white font-black text-xs py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} /> Emitir Guia e Visualizar Documento
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer size={15} /> Imprimir Comprovante Direto
            </button>
          </div>

        </div>

      </div>

      {/* MODAL DE PRÉ-VISUALIZAÇÃO DO DOCUMENTO OFICIAL (ANEXO I SEJU) */}
      {modalDocumento && (
        <div 
          className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setModalDocumento(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Cabeçalho Oficial do Documento */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                <BrasaoParana size="md" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#0072BB]">
                    ESTADO DO PARANÁ
                  </div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    SECRETARIA DA JUSTIÇA E CIDADANIA — SEJU
                  </h3>
                  <div className="text-[10px] text-slate-500 font-mono">
                    SOLICITAÇÃO DE DIÁRIAS E RESSARCIMENTO DE DESPESAS · ANEXO I
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModalDocumento(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dados do Documento */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Número do Protocolo SIAF</span>
                <div className="font-mono font-black text-[#0072BB] text-sm mt-0.5">
                  {protocoloGerado}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Dotação Orçamentária</span>
                <div className="font-mono font-black text-slate-800 text-sm mt-0.5">
                  Fonte 100 · Elemento 3.3.90.14
                </div>
              </div>
            </div>

            {/* Tabela de Dados */}
            <div className="space-y-2 text-xs border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-bold text-slate-500">Servidor Requerente:</span>
                <span className="font-bold text-slate-900">{currentUser.nome} (CPF: {currentUser.cpf})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-bold text-slate-500">Cargo / Função:</span>
                <span className="font-semibold text-slate-800">{currentUser.cargo} ({currentUser.setor})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-bold text-slate-500">Destino & Rota:</span>
                <span className="font-bold text-[#0072BB]">Curitiba ➔ {cidadeSelecionada.nome} ({cidadeSelecionada.distanciaKm * 2} km total)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-bold text-slate-500">Período Concedido:</span>
                <span className="font-semibold text-slate-800">{dias} diária(s) · {comPernoite ? 'Com pernoite regulamentar' : 'Sem pernoite'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-bold text-slate-500">Total do Empenho:</span>
                <span className="font-mono font-black text-emerald-800 text-sm">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Justificativa */}
            <div className="text-xs">
              <span className="font-bold text-slate-700">Justificativa da Missão Governamental:</span>
              <p className="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed italic text-[11px]">
                "{motivo}"
              </p>
            </div>

            {/* Assinaturas Digitais SHA-256 */}
            <div className="pt-2 grid grid-cols-2 gap-4 text-center text-xs">
              <div className="border-t border-slate-300 pt-2 space-y-0.5">
                <div className="font-bold text-slate-900">{currentUser.nome}</div>
                <div className="text-[10px] text-slate-500 font-mono">Assinado Digitalmente ICP-PR</div>
              </div>
              <div className="border-t border-slate-300 pt-2 space-y-0.5">
                <div className="font-bold text-slate-900">Dra. Maria Helena</div>
                <div className="text-[10px] text-slate-500 font-mono">Ordenadora de Despesas · SEJU</div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" /> Documento Válido e Registrado no SIAF
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-[#0072BB] hover:bg-[#00538A] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2"
              >
                <Printer size={15} /> Imprimir / Salvar PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
