import React, { useState } from 'react';
import {
  Building2,
  ArrowLeft,
  Search,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Receipt,
  Wallet,
  TrendingUp,
  Printer,
  ShieldCheck,
  X,
  SlidersHorizontal,
  Ban
} from 'lucide-react';
import { Usuario } from '../../types';
import { soundFX } from '../../services/soundFx';
import { BrasaoParana } from '../common/BrasaoParana';

interface FundoRotativoCenseViewProps {
  currentUser: Usuario;
  onVoltarHub: () => void;
}

export type StatusFiscalCense = 'regular' | 'em_analise' | 'alerta_glosa';
export type RubricaFundo =
  | 'Manutenção Predial (33.90.39)'
  | 'Material de Consumo & Higiene (33.90.30)'
  | 'Insumos Pedagógicos & Oficinas (33.90.30)'
  | 'Reparos Elétricos & Hidráulicos (33.90.39)'
  | 'Suprimento Emergencial Saúde (33.90.30)';

export interface NotaFiscalFundo {
  id: string;
  numeroNf: string;
  dataEmissao: string;
  fornecedor: string;
  cnpj: string;
  rubrica: RubricaFundo;
  descricao: string;
  valor: number;
  status: 'aprovada' | 'pendente' | 'glosada';
  motivoGlosa?: string;
}

export interface UnidadeCenseFundo {
  id: string;
  nome: string;
  cidade: string;
  regional: 'Curitiba & RMC' | 'Campos Gerais & Litoral' | 'Norte & Noroeste' | 'Oeste & Sudoeste';
  diretorSuprido: string;
  matricula: string;
  contaBancoBrasil: string;
  cotaTrimestral: number;
  competencia: string;
  statusFiscal: StatusFiscalCense;
  ultimaPrestacao: string;
  notas: NotaFiscalFundo[];
}

const CENSES_INICIAIS: UnidadeCenseFundo[] = [
  {
    id: 'cense-curitiba',
    nome: 'CENSE Curitiba',
    cidade: 'Curitiba',
    regional: 'Curitiba & RMC',
    diretorSuprido: 'Marcos Vinícius Andrade',
    matricula: 'SEJU-48219',
    contaBancoBrasil: 'Ag. 3793-1 · CC 44.102-8',
    cotaTrimestral: 36000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '10/10/2026',
    notas: [
      {
        id: 'nf-101',
        numeroNf: 'NF-e 004.892',
        dataEmissao: '04/10/2026',
        fornecedor: 'Comercial Elétrica Paraná Ltda',
        cnpj: '78.412.901/0001-44',
        rubrica: 'Reparos Elétricos & Hidráulicos (33.90.39)',
        descricao: 'Substituição de refletores LED do pátio interno e disjuntores da ala pedagógica',
        valor: 4850.0,
        status: 'aprovada'
      },
      {
        id: 'nf-102',
        numeroNf: 'NF-e 019.304',
        dataEmissao: '09/10/2026',
        fornecedor: 'Papelaria & Suprimentos Curitiba S/A',
        cnpj: '12.990.341/0001-19',
        rubrica: 'Insumos Pedagógicos & Oficinas (33.90.30)',
        descricao: 'Kits de papelaria, telas de pintura e materiais para oficina profissionalizante',
        valor: 3290.5,
        status: 'aprovada'
      },
      {
        id: 'nf-103',
        numeroNf: 'NF-e 002.118',
        dataEmissao: '14/10/2026',
        fornecedor: 'Higieniza Sul Distribuidora Ltda',
        cnpj: '09.331.782/0001-80',
        rubrica: 'Material de Consumo & Higiene (33.90.30)',
        descricao: 'Insumos sanitários, dispensadores e produtos de higienização hospitalar',
        valor: 5120.0,
        status: 'pendente'
      }
    ]
  },
  {
    id: 'cense-sao-francisco',
    nome: 'CENSE São Francisco',
    cidade: 'Piraquara',
    regional: 'Curitiba & RMC',
    diretorSuprido: 'Helena Costa Guimarães',
    matricula: 'SEJU-39104',
    contaBancoBrasil: 'Ag. 3793-1 · CC 44.219-9',
    cotaTrimestral: 42000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'em_analise',
    ultimaPrestacao: '12/10/2026',
    notas: [
      {
        id: 'nf-201',
        numeroNf: 'NF-e 008.771',
        dataEmissao: '02/10/2026',
        fornecedor: 'Hidráulica & Construção Piraquara',
        cnpj: '14.552.109/0001-05',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Reparo emergencial na tubulação térmica dos alojamentos 02 e 03',
        valor: 8900.0,
        status: 'aprovada'
      },
      {
        id: 'nf-202',
        numeroNf: 'NF-e 031.400',
        dataEmissao: '11/10/2026',
        fornecedor: 'MedSul Equipamentos de Saúde Ltda',
        cnpj: '21.840.220/0001-91',
        rubrica: 'Suprimento Emergencial Saúde (33.90.30)',
        descricao: 'Curativos, oxímetros de pulso e insumos para enfermaria da unidade',
        valor: 4320.0,
        status: 'pendente'
      }
    ]
  },
  {
    id: 'cense-londrina-1',
    nome: 'CENSE Londrina I',
    cidade: 'Londrina',
    regional: 'Norte & Noroeste',
    diretorSuprido: 'Ricardo Almeida Prado',
    matricula: 'SEJU-51028',
    contaBancoBrasil: 'Ag. 0142-2 · CC 89.401-3',
    cotaTrimestral: 38000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'alerta_glosa',
    ultimaPrestacao: '08/10/2026',
    notas: [
      {
        id: 'nf-301',
        numeroNf: 'NF-e 001.982',
        dataEmissao: '03/10/2026',
        fornecedor: 'Norte Telas & Serralheria Ltda',
        cnpj: '33.109.448/0001-62',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Manutenção preventiva das grades de proteção da quadra poliesportiva',
        valor: 9400.0,
        status: 'aprovada'
      },
      {
        id: 'nf-302',
        numeroNf: 'NF-e 005.412',
        dataEmissao: '07/10/2026',
        fornecedor: 'Atacadão Suprimentos Londrina',
        cnpj: '41.220.891/0001-11',
        rubrica: 'Material de Consumo & Higiene (33.90.30)',
        descricao: 'Aquisição de materiais de limpeza sem atesto de dois servidores no verso da nota',
        valor: 6750.0,
        status: 'glosada',
        motivoGlosa: 'Ausência de certidão negativa estadual anexada ao processo de prestação.'
      }
    ]
  },
  {
    id: 'cense-ponta-grossa',
    nome: 'CENSE Ponta Grossa',
    cidade: 'Ponta Grossa',
    regional: 'Campos Gerais & Litoral',
    diretorSuprido: 'Cláudia Regina Bastos',
    matricula: 'SEJU-28490',
    contaBancoBrasil: 'Ag. 0411-1 · CC 31.880-5',
    cotaTrimestral: 32000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '15/10/2026',
    notas: [
      {
        id: 'nf-401',
        numeroNf: 'NF-e 012.665',
        dataEmissao: '06/10/2026',
        fornecedor: 'Campos Gerais Materiais Elétricos',
        cnpj: '19.440.112/0001-37',
        rubrica: 'Reparos Elétricos & Hidráulicos (33.90.39)',
        descricao: 'Revisão do quadro de comando elétrico da lavanderia e cozinha industrial',
        valor: 6180.0,
        status: 'aprovada'
      }
    ]
  },
  {
    id: 'cense-cascavel-2',
    nome: 'CENSE Cascavel II',
    cidade: 'Cascavel',
    regional: 'Oeste & Sudoeste',
    diretorSuprido: 'Eduardo Henrique Sartori',
    matricula: 'SEJU-60912',
    contaBancoBrasil: 'Ag. 0812-5 · CC 55.901-0',
    cotaTrimestral: 36000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '13/10/2026',
    notas: [
      {
        id: 'nf-501',
        numeroNf: 'NF-e 009.104',
        dataEmissao: '05/10/2026',
        fornecedor: 'Oeste Ferragens & Manutenção Ltda',
        cnpj: '04.889.120/0001-73',
        rubrica: 'Insumos Pedagógicos & Oficinas (33.90.30)',
        descricao: 'Bancadas e ferramentas manuais para oficina de marcenaria e panificação',
        valor: 7450.0,
        status: 'aprovada'
      }
    ]
  },
  {
    id: 'cense-maringa',
    nome: 'CENSE Maringá',
    cidade: 'Maringá',
    regional: 'Norte & Noroeste',
    diretorSuprido: 'Fernanda Lúcia Tavares',
    matricula: 'SEJU-44108',
    contaBancoBrasil: 'Ag. 0352-2 · CC 71.004-2',
    cotaTrimestral: 32000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'em_analise',
    ultimaPrestacao: '11/10/2026',
    notas: [
      {
        id: 'nf-601',
        numeroNf: 'NF-e 022.890',
        dataEmissao: '10/10/2026',
        fornecedor: 'ClimaNorte Refrigeração Técnica',
        cnpj: '17.302.911/0001-08',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Higienização e recarga das câmaras frias do refeitório da unidade',
        valor: 5890.0,
        status: 'pendente'
      }
    ]
  },
  {
    id: 'cense-foz',
    nome: 'CENSE Foz do Iguaçu',
    cidade: 'Foz do Iguaçu',
    regional: 'Oeste & Sudoeste',
    diretorSuprido: 'Gustavo Nogueira Brito',
    matricula: 'SEJU-57320',
    contaBancoBrasil: 'Ag. 0140-6 · CC 63.210-1',
    cotaTrimestral: 36000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '14/10/2026',
    notas: [
      {
        id: 'nf-701',
        numeroNf: 'NF-e 007.419',
        dataEmissao: '08/10/2026',
        fornecedor: 'Fronteira Suprimentos Corporativos',
        cnpj: '29.118.400/0001-55',
        rubrica: 'Material de Consumo & Higiene (33.90.30)',
        descricao: 'Colchões ignífugos padrão socioeducativo e enxoval de alojamento',
        valor: 11200.0,
        status: 'aprovada'
      }
    ]
  },
  {
    id: 'cense-paranagua',
    nome: 'CENSE Paranaguá',
    cidade: 'Paranaguá',
    regional: 'Campos Gerais & Litoral',
    diretorSuprido: 'Patrícia Leal Albuquerque',
    matricula: 'SEJU-33819',
    contaBancoBrasil: 'Ag. 0250-X · CC 19.840-7',
    cotaTrimestral: 28000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '15/10/2026',
    notas: [
      {
        id: 'nf-801',
        numeroNf: 'NF-e 003.512',
        dataEmissao: '09/10/2026',
        fornecedor: 'Litoral Pinturas & Impermeabilização',
        cnpj: '11.670.390/0001-22',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Tratamento anticorrosivo e pintura acrílica das salas de aula',
        valor: 6400.0,
        status: 'aprovada'
      }
    ]
  }
];

export const FundoRotativoCenseView: React.FC<FundoRotativoCenseViewProps> = ({
  onVoltarHub
}) => {
  const [unidades, setUnidades] = useState<UnidadeCenseFundo[]>(CENSES_INICIAIS);
  const [censeSelecionadoId, setCenseSelecionadoId] = useState<string>(CENSES_INICIAIS[0].id);
  const [busca, setBusca] = useState('');
  const [filtroRegional, setFiltroRegional] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [abaDetalhe, setAbaDetalhe] = useState<'notas' | 'nova-despesa' | 'relatorio'>('notas');

  // Estado do formulário de nova Nota Fiscal
  const [numeroNf, setNumeroNf] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [rubrica, setRubrica] = useState<RubricaFundo>('Manutenção Predial (33.90.39)');
  const [valorNf, setValorNf] = useState('');
  const [descricaoNf, setDescricaoNf] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const censeAtual = unidades.find(u => u.id === censeSelecionadoId) || unidades[0];

  // Cálculos consolidados de todas as unidades CENSE
  const dotacaoTotal = unidades.reduce((acc, u) => acc + u.cotaTrimestral, 0);
  const executadoTotal = unidades.reduce(
    (acc, u) => acc + u.notas.filter(n => n.status !== 'glosada').reduce((s, n) => s + n.valor, 0),
    0
  );
  const saldoTotalDisponivel = dotacaoTotal - executadoTotal;
  const unidadesComPendencia = unidades.filter(u => u.statusFiscal !== 'regular').length;

  // Cálculos da unidade selecionada
  const executadoUnidade = censeAtual.notas
    .filter(n => n.status !== 'glosada')
    .reduce((acc, n) => acc + n.valor, 0);
  const saldoUnidade = Math.max(0, censeAtual.cotaTrimestral - executadoUnidade);
  const percentualExecutado = Math.min(100, Math.round((executadoUnidade / censeAtual.cotaTrimestral) * 100));

  const unidadesFiltradas = unidades.filter(u => {
    const matchBusca =
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.cidade.toLowerCase().includes(busca.toLowerCase()) ||
      u.diretorSuprido.toLowerCase().includes(busca.toLowerCase());
    const matchRegional = filtroRegional === 'todas' || u.regional === filtroRegional;
    const matchStatus = filtroStatus === 'todos' || u.statusFiscal === filtroStatus;
    return matchBusca && matchRegional && matchStatus;
  });

  const handleAprovarNota = (notaId: string) => {
    soundFX.playSuccess();
    setUnidades(prev =>
      prev.map(u => {
        if (u.id !== censeAtual.id) return u;
        const novasNotas = u.notas.map(n =>
          n.id === notaId ? { ...n, status: 'aprovada' as const, motivoGlosa: undefined } : n
        );
        const temGlosa = novasNotas.some(n => n.status === 'glosada');
        const temPendente = novasNotas.some(n => n.status === 'pendente');
        return {
          ...u,
          notas: novasNotas,
          statusFiscal: temGlosa ? 'alerta_glosa' : temPendente ? 'em_analise' : 'regular'
        };
      })
    );
  };

  const handleGlosarNota = (notaId: string) => {
    soundFX.playClick();
    setUnidades(prev =>
      prev.map(u => {
        if (u.id !== censeAtual.id) return u;
        const novasNotas = u.notas.map(n =>
          n.id === notaId
            ? {
                ...n,
                status: 'glosada' as const,
                motivoGlosa: 'Item retido pela Inspetoria Fiscal SEJU para complementação de atesto.'
              }
            : n
        );
        return {
          ...u,
          notas: novasNotas,
          statusFiscal: 'alerta_glosa'
        };
      })
    );
  };

  const handleLancarNota = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(valorNf.replace(',', '.'));
    if (!numeroNf.trim() || !fornecedor.trim() || isNaN(valorNum) || valorNum <= 0) return;

    const novaNota: NotaFiscalFundo = {
      id: `nf-${Date.now()}`,
      numeroNf: numeroNf.startsWith('NF') ? numeroNf : `NF-e ${numeroNf}`,
      dataEmissao: new Date().toLocaleDateString('pt-BR'),
      fornecedor,
      cnpj: cnpj || '00.000.000/0001-00',
      rubrica,
      descricao: descricaoNf || 'Despesa operacional em regime de Fundo Rotativo',
      valor: valorNum,
      status: 'pendente'
    };

    soundFX.playSuccess();
    setUnidades(prev =>
      prev.map(u =>
        u.id === censeAtual.id
          ? {
              ...u,
              notas: [novaNota, ...u.notas],
              statusFiscal: u.statusFiscal === 'alerta_glosa' ? 'alerta_glosa' : 'em_analise',
              ultimaPrestacao: new Date().toLocaleDateString('pt-BR')
            }
          : u
      )
    );

    setNumeroNf('');
    setFornecedor('');
    setCnpj('');
    setValorNf('');
    setDescricaoNf('');
    setAbaDetalhe('notas');
    setFeedbackMsg(`Nota Fiscal ${novaNota.numeroNf} registrada no ${censeAtual.nome}.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleHomologarPrestacao = () => {
    soundFX.playSuccess();
    setUnidades(prev =>
      prev.map(u =>
        u.id === censeAtual.id
          ? {
              ...u,
              statusFiscal: 'regular',
              ultimaPrestacao: new Date().toLocaleDateString('pt-BR'),
              notas: u.notas.map(n => (n.status === 'pendente' ? { ...n, status: 'aprovada' } : n))
            }
          : u
      )
    );
    setFeedbackMsg(`Prestação de Contas do ${censeAtual.nome} homologada com sucesso!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* =====================================================================
          SEÇÃO 1: HEADER EXECUTIVO & KPIS FISCAIS CONSOLIDADOS DOS CENSES
         ===================================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-gov-card space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <button
              onClick={() => {
                soundFX.playClick();
                onVoltarHub();
              }}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              title="Voltar ao Início"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                  Lei Estadual nº 14.268/PR · DEASE / SEJU
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Prestação de Contas & Execução Fiscal
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Gestão Fiscal de Fundo Rotativo · Unidades CENSE
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setAbaDetalhe('nova-despesa');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <PlusCircle size={14} className="text-emerald-400" />
              <span>Lançar Nota Fiscal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setAbaDetalhe('relatorio');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileText size={14} />
              <span className="hidden sm:inline">Espelho TCE-PR</span>
            </button>
          </div>
        </div>

        {/* Faixa Consolidada de 4 Indicadores Fiscais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Dotação Total CENSEs</span>
              <Wallet size={14} className="text-slate-400" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 font-mono">
              R$ {dotacaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {unidades.length} Centros de Socioeducação ativos
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Total Executado (NF-e)</span>
              <Receipt size={14} className="text-[#0072BB]" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-[#0072BB] mt-1 font-mono">
              R$ {executadoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {Math.round((executadoTotal / dotacaoTotal) * 100)}% das cotas aplicadas
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Saldo em Conta BB</span>
              <TrendingUp size={14} className="text-emerald-600" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-600 mt-1 font-mono">
              R$ {saldoTotalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Disponibilidade imediata nas unidades
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Auditoria & Glosas</span>
              <ShieldCheck size={14} className="text-amber-600" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
              {unidades.length - unidadesComPendencia} Regulares
            </div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
              {unidadesComPendencia} em revisão documental
            </div>
          </div>
        </div>

        {/* Barra de Busca e Filtros por Regional / Situação Fiscal */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar CENSE por cidade ou gestor suprido..."
              className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50/80 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-hidden focus:border-slate-400 text-slate-800"
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

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'todas', label: 'Todas Regionais' },
              { id: 'Curitiba & RMC', label: 'Curitiba & RMC' },
              { id: 'Campos Gerais & Litoral', label: 'Campos Gerais & Litoral' },
              { id: 'Norte & Noroeste', label: 'Norte & Noroeste' },
              { id: 'Oeste & Sudoeste', label: 'Oeste & Sudoeste' }
            ].map(reg => (
              <button
                key={reg.id}
                type="button"
                onClick={() => setFiltroRegional(reg.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer border ${
                  filtroRegional === reg.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-md flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-300 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 2: ESTRUTURA DIVIDIDA (LISTA DE CENSES À ESQUERDA + AUDITORIA DA UNIDADE À DIREITA)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA (5 COLUNAS): UNIDADES CENSE E SALDO DE COTAS */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-gov-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-slate-700" />
              <span className="text-xs font-bold text-slate-900">
                Unidades Socioeducativas ({unidadesFiltradas.length})
              </span>
            </div>

            <div className="flex items-center gap-1">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'regular', label: 'Regulares' },
                { id: 'alerta_glosa', label: 'Glosas' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setFiltroStatus(st.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                    filtroStatus === st.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
            {unidadesFiltradas.map(u => {
              const isSelected = u.id === censeAtual.id;
              const execU = u.notas.filter(n => n.status !== 'glosada').reduce((s, n) => s + n.valor, 0);
              const saldoU = Math.max(0, u.cotaTrimestral - execU);
              const percU = Math.min(100, Math.round((execU / u.cotaTrimestral) * 100));

              return (
                <div
                  key={u.id}
                  onClick={() => {
                    soundFX.playClick();
                    setCenseSelecionadoId(u.id);
                  }}
                  className={`p-4 sm:p-5 transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/40 border-l-4 border-l-[#0072BB]'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{u.nome}</h3>
                        <span className="text-[10px] text-slate-400 font-medium">· {u.cidade}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Suprido: <strong className="font-semibold text-slate-700">{u.diretorSuprido}</strong>
                      </div>
                    </div>

                    {u.statusFiscal === 'regular' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                        Regular
                      </span>
                    )}
                    {u.statusFiscal === 'em_analise' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0">
                        Em Análise
                      </span>
                    )}
                    {u.statusFiscal === 'alerta_glosa' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/80 shrink-0">
                        Glosa Fiscal
                      </span>
                    )}
                  </div>

                  {/* Barra de Execução da Cota */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Executado: <strong className="font-mono text-slate-800">R$ {execU.toLocaleString('pt-BR')}</strong>
                      </span>
                      <span className="text-emerald-700 font-mono font-bold">
                        Livre: R$ {saldoU.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          u.statusFiscal === 'alerta_glosa'
                            ? 'bg-red-500'
                            : percU > 85
                            ? 'bg-amber-500'
                            : 'bg-[#0072BB]'
                        }`}
                        style={{ width: `${percU}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA (7 COLUNAS): PAINEL FISCAL DETALHADO DO CENSE SELECIONADO */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-gov-card overflow-hidden">
          
          {/* Cabeçalho da Unidade Selecionada */}
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span>{censeAtual.regional}</span>
                  <span>·</span>
                  <span className="font-mono">{censeAtual.contaBancoBrasil}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                  {censeAtual.nome}
                </h3>
                <p className="text-xs text-slate-500">
                  Gestor Suprido: <strong className="text-slate-800">{censeAtual.diretorSuprido}</strong> ({censeAtual.matricula})
                </p>
              </div>

              <button
                type="button"
                onClick={handleHomologarPrestacao}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer self-start sm:self-auto"
              >
                <CheckCircle2 size={14} />
                <span>Homologar Prestação</span>
              </button>
            </div>

            {/* Mini Resumo Orçamentário da Unidade */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/70">
                <div className="text-[10px] font-semibold uppercase text-slate-400">Cota Trimestral</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono mt-0.5">
                  R$ {censeAtual.cotaTrimestral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/70">
                <div className="text-[10px] font-semibold uppercase text-slate-400">Notas Lançadas ({percentualExecutado}%)</div>
                <div className="text-sm sm:text-base font-extrabold text-[#0072BB] font-mono mt-0.5">
                  R$ {executadoUnidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/70">
                <div className="text-[10px] font-semibold uppercase text-slate-400">Saldo Disponível</div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-600 font-mono mt-0.5">
                  R$ {saldoUnidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Sub-abas da Unidade */}
            <div className="flex items-center gap-1.5 pt-1">
              {[
                { id: 'notas', label: `Notas Fiscais (${censeAtual.notas.length})`, icon: Receipt },
                { id: 'nova-despesa', label: 'Lançar Nota Fiscal', icon: PlusCircle },
                { id: 'relatorio', label: 'Relatório TCE-PR', icon: SlidersHorizontal }
              ].map(t => {
                const Icon = t.icon;
                const ativa = abaDetalhe === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAbaDetalhe(t.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      ativa
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTEÚDO DA ABA 1: LISTA DE NOTAS FISCAIS E AUDITORIA DE GLOSA */}
          {abaDetalhe === 'notas' && (
            <div className="p-5 sm:p-6 space-y-3">
              {censeAtual.notas.map(nf => (
                <div
                  key={nf.id}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-white space-y-3 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {nf.numeroNf}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{nf.fornecedor}</span>
                        <span className="text-[11px] font-mono text-slate-400">CNPJ {nf.cnpj}</span>
                      </div>
                      <div className="text-[11px] font-medium text-[#0072BB] mt-1">
                        {nf.rubrica} · Emitida em {nf.dataEmissao}
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-sm font-extrabold font-mono text-slate-900">
                        R$ {nf.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      {nf.status === 'aprovada' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 size={11} /> Nota Atestada
                        </span>
                      )}
                      {nf.status === 'pendente' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                          Em Conferência Fiscal
                        </span>
                      )}
                      {nf.status === 'glosada' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600">
                          <AlertTriangle size={11} /> Nota Glosada
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    {nf.descricao}
                  </p>

                  {nf.motivoGlosa && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-800 flex items-start gap-2">
                      <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Motivo da Glosa Fiscal: </strong>
                        {nf.motivoGlosa}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400 select-none">
                      Selo Fiscal · ••••••••••••••••
                    </span>

                    <div className="flex items-center gap-2">
                      {nf.status !== 'aprovada' && (
                        <button
                          type="button"
                          onClick={() => handleAprovarNota(nf.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <CheckCircle2 size={12} /> Aprovar NF
                        </button>
                      )}
                      {nf.status !== 'glosada' && (
                        <button
                          type="button"
                          onClick={() => handleGlosarNota(nf.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Ban size={12} /> Glosar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CONTEÚDO DA ABA 2: LANÇAR NOVA NOTA FISCAL NO FUNDO ROTATIVO */}
          {abaDetalhe === 'nova-despesa' && (
            <form onSubmit={handleLancarNota} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número da NF-e / Cupom Fiscal *
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroNf}
                    onChange={e => setNumeroNf(e.target.value)}
                    placeholder="Ex: 009.412"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor da Nota Fiscal (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorNf}
                    onChange={e => setValorNf(e.target.value)}
                    placeholder="Ex: 1450.00"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Razão Social do Fornecedor *
                  </label>
                  <input
                    type="text"
                    required
                    value={fornecedor}
                    onChange={e => setFornecedor(e.target.value)}
                    placeholder="Ex: Comercial Suprimentos Paraná Ltda"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CNPJ do Fornecedor
                  </label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Natureza de Despesa / Rubrica do Fundo Rotativo
                </label>
                <select
                  value={rubrica}
                  onChange={e => setRubrica(e.target.value as RubricaFundo)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-slate-900"
                >
                  <option value="Manutenção Predial (33.90.39)">Manutenção Predial (33.90.39)</option>
                  <option value="Reparos Elétricos & Hidráulicos (33.90.39)">Reparos Elétricos & Hidráulicos (33.90.39)</option>
                  <option value="Material de Consumo & Higiene (33.90.30)">Material de Consumo & Higiene (33.90.30)</option>
                  <option value="Insumos Pedagógicos & Oficinas (33.90.30)">Insumos Pedagógicos & Oficinas (33.90.30)</option>
                  <option value="Suprimento Emergencial Saúde (33.90.30)">Suprimento Emergencial Saúde (33.90.30)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Justificativa e Atesto de Aplicação no {censeAtual.nome}
                </label>
                <textarea
                  rows={3}
                  value={descricaoNf}
                  onChange={e => setDescricaoNf(e.target.value)}
                  placeholder="Descreva a finalidade socioeducativa ou emergencial do material/serviço adquirido..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAbaDetalhe('notas')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Registrar Nota Fiscal no CENSE
                </button>
              </div>
            </form>
          )}

          {/* CONTEÚDO DA ABA 3: ESPELHO DE PRESTAÇÃO DE CONTAS (TCE-PR / SEJU) */}
          {abaDetalhe === 'relatorio' && (
            <div className="p-5 sm:p-6 space-y-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <BrasaoParana size="sm" />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 uppercase">
                        Demonstrativo de Prestação de Contas · Fundo Rotativo
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {censeAtual.nome} · {censeAtual.competencia} · {censeAtual.contaBancoBrasil}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} /> Imprimir Guia
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Unidade Socioeducativa</span>
                    <strong className="text-slate-900">{censeAtual.nome}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Servidor Suprido</span>
                    <strong className="text-slate-900">{censeAtual.diretorSuprido}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Última Conferência</span>
                    <strong className="text-slate-900">{censeAtual.ultimaPrestacao}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Blindagem Criptográfica</span>
                    <strong className="text-emerald-700 font-mono select-none">••••••••••••••••</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
