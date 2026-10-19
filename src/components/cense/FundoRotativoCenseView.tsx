import React, { useState, useEffect, useRef } from 'react';
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
  Ban,
  Download,
  ScanLine,
  Upload,
  Clock,
  Sparkles,
  RefreshCw,
  PieChart,
  Landmark,
  QrCode,
  Activity,
  Lock,
  Layers,
  Scale,
  ArrowUpRight
} from 'lucide-react';
import { Usuario } from '../../types';
import { soundFX } from '../../services/soundFx';
import { BrasaoParana } from '../common/BrasaoParana';
import { eventBus } from '../../services/eventBus';

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
  chaveAcesso?: string;
  dataEmissao: string;
  fornecedor: string;
  cnpj: string;
  rubrica: RubricaFundo;
  descricao: string;
  valor: number;
  status: 'aprovada' | 'pendente' | 'glosada';
  tresOrcamentos?: boolean;
  comprovanteNome?: string;
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
  diasRestantesPrestacao: number;
  notas: NotaFiscalFundo[];
}

const STORAGE_KEY_FUNDO_CENSE = 'seju_censes_fundo_v2';
const LIMITE_INDIVIDUAL_NOTA = 8000;

const CENSES_INICIAIS: UnidadeCenseFundo[] = [
  // ==================== CURITIBA & RMC (4 UNIDADES) ====================
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
    diasRestantesPrestacao: 42,
    notas: [
      {
        id: 'nf-101',
        numeroNf: 'NF-e 004.892',
        chaveAcesso: '41261078412901000144550010000048921084920114',
        dataEmissao: '04/10/2026',
        fornecedor: 'Comercial Elétrica Paraná Ltda',
        cnpj: '78.412.901/0001-44',
        rubrica: 'Reparos Elétricos & Hidráulicos (33.90.39)',
        descricao: 'Substituição de refletores LED do pátio interno e disjuntores da ala pedagógica',
        valor: 4850.0,
        status: 'aprovada',
        tresOrcamentos: true
      },
      {
        id: 'nf-102',
        numeroNf: 'NF-e 019.304',
        chaveAcesso: '41261012990341000119550010000193041092381920',
        dataEmissao: '09/10/2026',
        fornecedor: 'Papelaria & Suprimentos Curitiba S/A',
        cnpj: '12.990.341/0001-19',
        rubrica: 'Insumos Pedagógicos & Oficinas (33.90.30)',
        descricao: 'Kits de papelaria, telas de pintura e materiais para oficina profissionalizante',
        valor: 3290.5,
        status: 'aprovada',
        tresOrcamentos: true
      },
      {
        id: 'nf-103',
        numeroNf: 'NF-e 002.118',
        chaveAcesso: '41261009331782000180550010000021181044918273',
        dataEmissao: '14/10/2026',
        fornecedor: 'Higieniza Sul Distribuidora Ltda',
        cnpj: '09.331.782/0001-80',
        rubrica: 'Material de Consumo & Higiene (33.90.30)',
        descricao: 'Insumos sanitários, dispensadores e produtos de higienização hospitalar',
        valor: 5120.0,
        status: 'pendente',
        tresOrcamentos: true
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
    diasRestantesPrestacao: 18,
    notas: [
      {
        id: 'nf-201',
        numeroNf: 'NF-e 008.771',
        dataEmissao: '02/10/2026',
        fornecedor: 'Hidráulica & Construção Piraquara',
        cnpj: '14.552.109/0001-05',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Reparo emergencial na tubulação térmica dos alojamentos 02 e 03',
        valor: 7850.0,
        status: 'aprovada',
        tresOrcamentos: true
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
        status: 'pendente',
        tresOrcamentos: true
      }
    ]
  },
  {
    id: 'cense-joana-richa',
    nome: 'CENSE Joana Richa',
    cidade: 'Curitiba',
    regional: 'Curitiba & RMC',
    diretorSuprido: 'Luciana Ferreira Machado',
    matricula: 'SEJU-45890',
    contaBancoBrasil: 'Ag. 3793-1 · CC 44.508-2',
    cotaTrimestral: 32000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '14/10/2026',
    diasRestantesPrestacao: 51,
    notas: [
      {
        id: 'nf-251',
        numeroNf: 'NF-e 011.209',
        dataEmissao: '06/10/2026',
        fornecedor: 'Atelier & Artes Paraná Suprimentos',
        cnpj: '18.209.441/0001-60',
        rubrica: 'Insumos Pedagógicos & Oficinas (33.90.30)',
        descricao: 'Insumos para oficinas de corte e costura, serigrafia e culinária socioeducativa',
        valor: 4920.0,
        status: 'aprovada',
        tresOrcamentos: true
      },
      {
        id: 'nf-252',
        numeroNf: 'NF-e 014.880',
        dataEmissao: '12/10/2026',
        fornecedor: 'Curitiba Clima & Manutenção Predial',
        cnpj: '27.881.004/0001-12',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Manutenção de exaustores da cozinha pedagógica e revisão de portões automatizados',
        valor: 3680.0,
        status: 'aprovada',
        tresOrcamentos: true
      }
    ]
  },
  {
    id: 'cense-fazenda-rio-grande',
    nome: 'CENSE Fazenda Rio Grande',
    cidade: 'Fazenda Rio Grande',
    regional: 'Curitiba & RMC',
    diretorSuprido: 'Carlos Eduardo Polanski',
    matricula: 'SEJU-52190',
    contaBancoBrasil: 'Ag. 3793-1 · CC 44.890-1',
    cotaTrimestral: 36000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '11/10/2026',
    diasRestantesPrestacao: 37,
    notas: [
      {
        id: 'nf-281',
        numeroNf: 'NF-e 006.310',
        dataEmissao: '05/10/2026',
        fornecedor: 'Metropolitana Ferragens & Elétrica Ltda',
        cnpj: '31.409.221/0001-09',
        rubrica: 'Reparos Elétricos & Hidráulicos (33.90.39)',
        descricao: 'Substituição de bombas de recalque d’água e quadros de distribuição secundários',
        valor: 6490.0,
        status: 'aprovada',
        tresOrcamentos: true
      },
      {
        id: 'nf-282',
        numeroNf: 'NF-e 009.115',
        dataEmissao: '10/10/2026',
        fornecedor: 'SulClean Higiene Profissional Ltda',
        cnpj: '08.912.440/0001-55',
        rubrica: 'Material de Consumo & Higiene (33.90.30)',
        descricao: 'Material de limpeza hospitalar e kits de higiene pessoal para internos',
        valor: 3840.0,
        status: 'aprovada',
        tresOrcamentos: true
      }
    ]
  },

  // ==================== CAMPOS GERAIS & LITORAL (2 UNIDADES) ====================
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
    diasRestantesPrestacao: 49,
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
        status: 'aprovada',
        tresOrcamentos: true
      },
      {
        id: 'nf-402',
        numeroNf: 'NF-e 015.008',
        dataEmissao: '12/10/2026',
        fornecedor: 'Princesa dos Campos Suprimentos Ltda',
        cnpj: '22.118.904/0001-81',
        rubrica: 'Material de Consumo & Higiene (33.90.30)',
        descricao: 'Reposição de utensílios de refeitório em policarbonato de alta resistência',
        valor: 4150.0,
        status: 'aprovada',
        tresOrcamentos: true
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
    diasRestantesPrestacao: 54,
    notas: [
      {
        id: 'nf-801',
        numeroNf: 'NF-e 003.512',
        dataEmissao: '09/10/2026',
        fornecedor: 'Litoral Pinturas & Impermeabilização',
        cnpj: '11.670.390/0001-22',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Tratamento anticorrosivo contra maresia e pintura acrílica das salas de aula',
        valor: 6400.0,
        status: 'aprovada',
        tresOrcamentos: true
      }
    ]
  },

  // ==================== NORTE & NOROESTE (7 UNIDADES) ====================
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
    diasRestantesPrestacao: 7,
    notas: [
      {
        id: 'nf-301',
        numeroNf: 'NF-e 001.982',
        dataEmissao: '03/10/2026',
        fornecedor: 'Norte Telas & Serralheria Ltda',
        cnpj: '33.109.448/0001-62',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Manutenção preventiva das grades de proteção da quadra poliesportiva',
        valor: 7400.0,
        status: 'aprovada',
        tresOrcamentos: true
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
        tresOrcamentos: false,
        motivoGlosa: 'Ausência de certidão negativa estadual e de 3 cotações prévias anexadas ao processo.'
      }
    ]
  },
  {
    id: 'cense-londrina-2',
    nome: 'CENSE Londrina II',
    cidade: 'Londrina',
    regional: 'Norte & Noroeste',
    diretorSuprido: 'Sérgio Murilo Fontes',
    matricula: 'SEJU-54810',
    contaBancoBrasil: 'Ag. 0142-2 · CC 89.712-8',
    cotaTrimestral: 36000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '13/10/2026',
    diasRestantesPrestacao: 39,
    notas: [
      {
        id: 'nf-351',
        numeroNf: 'NF-e 018.220',
        dataEmissao: '05/10/2026',
        fornecedor: 'EletroNorte Instalações Técnicas Ltda',
        cnpj: '15.901.332/0001-40',
        rubrica: 'Reparos Elétricos & Hidráulicos (33.90.39)',
        descricao: 'Adequação do sistema de iluminação de emergência dos blocos de internação',
        valor: 5480.0,
        status: 'aprovada',
        tresOrcamentos: true
      },
      {
        id: 'nf-352',
        numeroNf: 'NF-e 021.004',
        dataEmissao: '11/10/2026',
        fornecedor: 'LondriPedagógica Materiais Didáticos',
        cnpj: '24.510.889/0001-02',
        rubrica: 'Insumos Pedagógicos & Oficinas (33.90.30)',
        descricao: 'Instrumentos para oficina de percussão e kits de robótica educacional',
        valor: 4690.0,
        status: 'aprovada',
        tresOrcamentos: true
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
    diasRestantesPrestacao: 24,
    notas: [
      {
        id: 'nf-601',
        numeroNf: 'NF-e 022.890',
        dataEmissao: '10/10/2026',
        fornecedor: 'ClimaNorte Refrigeração Técnica',
        cnpj: '17.302.911/0001-08',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Higienização e recarga de gás das câmaras frias do refeitório da unidade',
        valor: 5890.0,
        status: 'pendente',
        tresOrcamentos: true
      }
    ]
  },
  {
    id: 'cense-paranavai',
    nome: 'CENSE Paranavaí',
    cidade: 'Paranavaí',
    regional: 'Norte & Noroeste',
    diretorSuprido: 'Roberto Carlos Silveira',
    matricula: 'SEJU-37920',
    contaBancoBrasil: 'Ag. 0394-8 · CC 28.410-9',
    cotaTrimestral: 28000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '14/10/2026',
    diasRestantesPrestacao: 46,
    notas: [
      {
        id: 'nf-621',
        numeroNf: 'NF-e 004.119',
        dataEmissao: '07/10/2026',
        fornecedor: 'Noroeste Hidráulica & Poços Ltda',
        cnpj: '13.449.820/0001-74',
        rubrica: 'Reparos Elétricos & Hidráulicos (33.90.39)',
        descricao: 'Manutenção corretiva nos registros de pressão e válvulas antivandalismo',
        valor: 4720.0,
        status: 'aprovada',
        tresOrcamentos: true
      }
    ]
  },
  {
    id: 'cense-umuarama',
    nome: 'CENSE Umuarama',
    cidade: 'Umuarama',
    regional: 'Norte & Noroeste',
    diretorSuprido: 'Daniela Moreira Franco',
    matricula: 'SEJU-49201',
    contaBancoBrasil: 'Ag. 0610-6 · CC 41.209-4',
    cotaTrimestral: 30000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '12/10/2026',
    diasRestantesPrestacao: 33,
    notas: [
      {
        id: 'nf-641',
        numeroNf: 'NF-e 009.840',
        dataEmissao: '04/10/2026',
        fornecedor: 'Umuarama Médica & Odonto Suprimentos',
        cnpj: '26.701.390/0001-18',
        rubrica: 'Suprimento Emergencial Saúde (33.90.30)',
        descricao: 'Insumos odontológicos e materiais de pronto-atendimento para ala de saúde',
        valor: 5190.0,
        status: 'aprovada',
        tresOrcamentos: true
      }
    ]
  },
  {
    id: 'cense-campo-mourao',
    nome: 'CENSE Campo Mourão',
    cidade: 'Campo Mourão',
    regional: 'Norte & Noroeste',
    diretorSuprido: 'Alexandre Vieira Camargo',
    matricula: 'SEJU-41882',
    contaBancoBrasil: 'Ag. 0406-5 · CC 52.901-7',
    cotaTrimestral: 28000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '15/10/2026',
    diasRestantesPrestacao: 56,
    notas: [
      {
        id: 'nf-661',
        numeroNf: 'NF-e 007.302',
        dataEmissao: '08/10/2026',
        fornecedor: 'Comercial Mourãoense de Limpeza Ltda',
        cnpj: '07.882.190/0001-31',
        rubrica: 'Material de Consumo & Higiene (33.90.30)',
        descricao: 'Aquisição trimestral de sanitizantes, sabonete líquido e papel toalha institucional',
        valor: 4480.0,
        status: 'aprovada',
        tresOrcamentos: true
      }
    ]
  },
  {
    id: 'cense-santo-antonio-platina',
    nome: 'CENSE Santo Antônio da Platina',
    cidade: 'Santo Antônio da Platina',
    regional: 'Norte & Noroeste',
    diretorSuprido: 'Beatriz Helena Vasconcelos',
    matricula: 'SEJU-58310',
    contaBancoBrasil: 'Ag. 0305-0 · CC 18.774-2',
    cotaTrimestral: 28000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'em_analise',
    ultimaPrestacao: '09/10/2026',
    diasRestantesPrestacao: 14,
    notas: [
      {
        id: 'nf-681',
        numeroNf: 'NF-e 003.918',
        dataEmissao: '06/10/2026',
        fornecedor: 'Pioneiro Manutenção & Coberturas Ltda',
        cnpj: '19.004.512/0001-90',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Substituição de calhas pluviais e rufos metálicos do ginásio coberto',
        valor: 6890.0,
        status: 'pendente',
        tresOrcamentos: true
      }
    ]
  },

  // ==================== OESTE & SUDOESTE (6 UNIDADES) ====================
  {
    id: 'cense-cascavel-1',
    nome: 'CENSE Cascavel I',
    cidade: 'Cascavel',
    regional: 'Oeste & Sudoeste',
    diretorSuprido: 'Valdir Antônio Zanon',
    matricula: 'SEJU-36904',
    contaBancoBrasil: 'Ag. 0812-5 · CC 55.410-8',
    cotaTrimestral: 34000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '12/10/2026',
    diasRestantesPrestacao: 35,
    notas: [
      {
        id: 'nf-511',
        numeroNf: 'NF-e 016.402',
        dataEmissao: '04/10/2026',
        fornecedor: 'Cascavel Soluções Elétricas e Solar',
        cnpj: '10.449.812/0001-64',
        rubrica: 'Reparos Elétricos & Hidráulicos (33.90.39)',
        descricao: 'Manutenção dos aquecedores solares de água dos alojamentos masculinos',
        valor: 6120.0,
        status: 'aprovada',
        tresOrcamentos: true
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
    diasRestantesPrestacao: 41,
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
        status: 'aprovada',
        tresOrcamentos: true
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
    diasRestantesPrestacao: 44,
    notas: [
      {
        id: 'nf-701',
        numeroNf: 'NF-e 007.419',
        dataEmissao: '08/10/2026',
        fornecedor: 'Fronteira Suprimentos Corporativos',
        cnpj: '29.118.400/0001-55',
        rubrica: 'Material de Consumo & Higiene (33.90.30)',
        descricao: 'Colchões ignífugos padrão socioeducativo e enxoval de alojamento',
        valor: 7800.0,
        status: 'aprovada',
        tresOrcamentos: true
      },
      {
        id: 'nf-702',
        numeroNf: 'NF-e 010.215',
        dataEmissao: '12/10/2026',
        fornecedor: 'Iguaçu Climatização & Refrigeração Ltda',
        cnpj: '35.990.112/0001-04',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Revisão dos aparelhos climatizadores da escola e setor técnico',
        valor: 4950.0,
        status: 'aprovada',
        tresOrcamentos: true
      }
    ]
  },
  {
    id: 'cense-toledo',
    nome: 'CENSE Toledo',
    cidade: 'Toledo',
    regional: 'Oeste & Sudoeste',
    diretorSuprido: 'Maurício Schneider Hoss',
    matricula: 'SEJU-46711',
    contaBancoBrasil: 'Ag. 0591-6 · CC 39.104-5',
    cotaTrimestral: 28000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '14/10/2026',
    diasRestantesPrestacao: 48,
    notas: [
      {
        id: 'nf-731',
        numeroNf: 'NF-e 005.890',
        dataEmissao: '07/10/2026',
        fornecedor: 'Toledo Agro & Hortifruti Insumos Ltda',
        cnpj: '16.401.882/0001-29',
        rubrica: 'Insumos Pedagógicos & Oficinas (33.90.30)',
        descricao: 'Sementes, substratos e ferramentas para oficina de horta orgânica e jardinagem',
        valor: 3890.0,
        status: 'aprovada',
        tresOrcamentos: true
      }
    ]
  },
  {
    id: 'cense-pato-branco',
    nome: 'CENSE Pato Branco',
    cidade: 'Pato Branco',
    regional: 'Oeste & Sudoeste',
    diretorSuprido: 'Renata Dalla Vecchia',
    matricula: 'SEJU-53094',
    contaBancoBrasil: 'Ag. 0495-2 · CC 24.880-3',
    cotaTrimestral: 30000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'regular',
    ultimaPrestacao: '15/10/2026',
    diasRestantesPrestacao: 58,
    notas: [
      {
        id: 'nf-751',
        numeroNf: 'NF-e 013.410',
        dataEmissao: '09/10/2026',
        fornecedor: 'Sudoeste Suprimentos de Informática & Pedagógicos',
        cnpj: '28.310.994/0001-47',
        rubrica: 'Insumos Pedagógicos & Oficinas (33.90.30)',
        descricao: 'Materiais didáticos e insumos para laboratório de inclusão digital',
        valor: 5240.0,
        status: 'aprovada',
        tresOrcamentos: true
      }
    ]
  },
  {
    id: 'cense-laranjeiras-do-sul',
    nome: 'CENSE Laranjeiras do Sul',
    cidade: 'Laranjeiras do Sul',
    regional: 'Oeste & Sudoeste',
    diretorSuprido: 'Juliano Kovalski',
    matricula: 'SEJU-59102',
    contaBancoBrasil: 'Ag. 0921-0 · CC 15.309-6',
    cotaTrimestral: 28000,
    competencia: '4º Trimestre / 2026',
    statusFiscal: 'em_analise',
    ultimaPrestacao: '10/10/2026',
    diasRestantesPrestacao: 11,
    notas: [
      {
        id: 'nf-781',
        numeroNf: 'NF-e 002.774',
        dataEmissao: '06/10/2026',
        fornecedor: 'Iguaçu Sul Construções & Reparos Ltda',
        cnpj: '37.119.008/0001-83',
        rubrica: 'Manutenção Predial (33.90.39)',
        descricao: 'Impermeabilização de lajes técnicas e reparo de fechaduras de segurança',
        valor: 6320.0,
        status: 'pendente',
        tresOrcamentos: true
      }
    ]
  }
];

const AMOSTRAS_DANFE_SEFAZ: Array<{
  chave: string;
  numeroNf: string;
  fornecedor: string;
  cnpj: string;
  rubrica: RubricaFundo;
  valor: string;
  descricao: string;
}> = [
  {
    chave: '41261082391044000192550010000284101092837461',
    numeroNf: 'NF-e 028.410',
    fornecedor: 'Paraná Equipamentos & Manutenção Predial S/A',
    cnpj: '82.391.044/0001-92',
    rubrica: 'Manutenção Predial (33.90.39)',
    valor: '4680.00',
    descricao: 'Substituição de fechaduras eletromagnéticas e revisão dos portões de eclusa de segurança.'
  },
  {
    chave: '41261014889201000137550010000159201038472910',
    numeroNf: 'NF-e 015.920',
    fornecedor: 'BioSul Suprimentos Hospitalares e Higiene Ltda',
    cnpj: '14.889.201/0001-37',
    rubrica: 'Suprimento Emergencial Saúde (33.90.30)',
    valor: '2890.50',
    descricao: 'Aquisição de kits de primeiros socorros, ataduras, luvas nitrílicas e termômetros clínicos infravermelhos.'
  },
  {
    chave: '41261039102847000155550010000093121074829103',
    numeroNf: 'NF-e 009.312',
    fornecedor: 'EducaMais Insumos Profissionalizantes Paraná Ltda',
    cnpj: '39.102.847/0001-55',
    rubrica: 'Insumos Pedagógicos & Oficinas (33.90.30)',
    valor: '5420.00',
    descricao: 'Insumos para oficina de panificação, confeitaria e serigrafia aplicada aos adolescentes internados.'
  }
];

const isRubricaConsumo30 = (r: RubricaFundo) => r.includes('33.90.30');

export const FundoRotativoCenseView: React.FC<FundoRotativoCenseViewProps> = ({
  onVoltarHub
}) => {
  const [unidades, setUnidades] = useState<UnidadeCenseFundo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FUNDO_CENSE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 19) {
          return parsed;
        }
      }
    } catch {
      // Fallback para lista oficial de 19 CENSEs
    }
    return CENSES_INICIAIS;
  });

  const [censeSelecionadoId, setCenseSelecionadoId] = useState<string>(CENSES_INICIAIS[0].id);
  const [busca, setBusca] = useState('');
  const [filtroRegional, setFiltroRegional] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [abaDetalhe, setAbaDetalhe] = useState<'notas' | 'nova-despesa' | 'relatorio'>('notas');

  // Estado do formulário de nova Nota Fiscal + Scanner DANFE
  const [chaveDanfe, setChaveDanfe] = useState('');
  const [numeroNf, setNumeroNf] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [rubrica, setRubrica] = useState<RubricaFundo>('Manutenção Predial (33.90.39)');
  const [valorNf, setValorNf] = useState('');
  const [descricaoNf, setDescricaoNf] = useState('');
  const [tresOrcamentos, setTresOrcamentos] = useState(true);
  const [comprovanteNome, setComprovanteNome] = useState<string>('');
  const [indiceSimulacaoDanfe, setIndiceSimulacaoDanfe] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FUNDO_CENSE, JSON.stringify(unidades));
    } catch {
      // Ignora erro de quota de storage
    }
  }, [unidades]);

  const censeAtual = unidades.find(u => u.id === censeSelecionadoId) || unidades[0];

  // Cálculos consolidados de todas as 19 unidades CENSE
  const dotacaoTotal = unidades.reduce((acc, u) => acc + u.cotaTrimestral, 0);
  const executadoTotal = unidades.reduce(
    (acc, u) => acc + u.notas.filter(n => n.status !== 'glosada').reduce((s, n) => s + n.valor, 0),
    0
  );
  const saldoTotalDisponivel = dotacaoTotal - executadoTotal;
  const unidadesComPendencia = unidades.filter(u => u.statusFiscal !== 'regular').length;

  // Totais analíticos da rede por Natureza de Despesa (33.90.30 vs 33.90.39)
  const totalRede30 = unidades.reduce(
    (acc, u) =>
      acc +
      u.notas
        .filter(n => n.status !== 'glosada' && isRubricaConsumo30(n.rubrica))
        .reduce((s, n) => s + n.valor, 0),
    0
  );
  const totalRede39 = Math.max(0, executadoTotal - totalRede30);

  // Cálculos da unidade selecionada
  const notasValidasUnidade = censeAtual.notas.filter(n => n.status !== 'glosada');
  const executadoUnidade = notasValidasUnidade.reduce((acc, n) => acc + n.valor, 0);
  const saldoUnidade = Math.max(0, censeAtual.cotaTrimestral - executadoUnidade);
  const percentualExecutado = Math.min(100, Math.round((executadoUnidade / censeAtual.cotaTrimestral) * 100));

  const unidadeConsumo30 = notasValidasUnidade
    .filter(n => isRubricaConsumo30(n.rubrica))
    .reduce((acc, n) => acc + n.valor, 0);
  const unidadeServicos39 = notasValidasUnidade
    .filter(n => !isRubricaConsumo30(n.rubrica))
    .reduce((acc, n) => acc + n.valor, 0);
  const percConsumo30 = executadoUnidade > 0 ? Math.round((unidadeConsumo30 / executadoUnidade) * 100) : 50;
  const percServicos39 = executadoUnidade > 0 ? 100 - percConsumo30 : 50;

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

  const handleSimularLeituraDanfe = () => {
    soundFX.playSuccess();
    const amostra = AMOSTRAS_DANFE_SEFAZ[indiceSimulacaoDanfe % AMOSTRAS_DANFE_SEFAZ.length];
    setIndiceSimulacaoDanfe(prev => prev + 1);
    setChaveDanfe(amostra.chave);
    setNumeroNf(amostra.numeroNf);
    setFornecedor(amostra.fornecedor);
    setCnpj(amostra.cnpj);
    setRubrica(amostra.rubrica);
    setValorNf(amostra.valor);
    setDescricaoNf(amostra.descricao);
    setTresOrcamentos(true);
    setComprovanteNome(`DANFE_${amostra.numeroNf.replace(/\D/g, '')}_SEFAZ_PR.xml`);
    setFeedbackMsg(`Chave de Acesso SEFAZ-PR importada automaticamente (${amostra.numeroNf}).`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleUploadComprovante = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundFX.playSuccess();
    setComprovanteNome(file.name);
    if (!numeroNf) {
      const amostra = AMOSTRAS_DANFE_SEFAZ[indiceSimulacaoDanfe % AMOSTRAS_DANFE_SEFAZ.length];
      setIndiceSimulacaoDanfe(prev => prev + 1);
      setChaveDanfe(amostra.chave);
      setNumeroNf(amostra.numeroNf);
      setFornecedor(amostra.fornecedor);
      setCnpj(amostra.cnpj);
      setRubrica(amostra.rubrica);
      setValorNf(amostra.valor);
      setDescricaoNf(amostra.descricao);
    }
    setFeedbackMsg(`Comprovante "${file.name}" anexado e validado via OCR Fiscal.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleLancarNota = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(valorNf.replace(',', '.'));
    if (!numeroNf.trim() || !fornecedor.trim() || isNaN(valorNum) || valorNum <= 0) return;

    const novaNota: NotaFiscalFundo = {
      id: `nf-${Date.now()}`,
      numeroNf: numeroNf.startsWith('NF') ? numeroNf : `NF-e ${numeroNf}`,
      chaveAcesso: chaveDanfe.replace(/\D/g, '').slice(0, 44) || undefined,
      dataEmissao: new Date().toLocaleDateString('pt-BR'),
      fornecedor,
      cnpj: cnpj || '00.000.000/0001-00',
      rubrica,
      descricao: descricaoNf || 'Despesa operacional em regime de Fundo Rotativo',
      valor: valorNum,
      status: valorNum > LIMITE_INDIVIDUAL_NOTA || !tresOrcamentos ? 'glosada' : 'pendente',
      tresOrcamentos,
      comprovanteNome: comprovanteNome || undefined,
      motivoGlosa:
        valorNum > LIMITE_INDIVIDUAL_NOTA
          ? `Valor da nota (R$ ${valorNum.toLocaleString('pt-BR')}) excede o limite individual de dispensa do Fundo Rotativo (R$ 8.000,00).`
          : !tresOrcamentos
          ? 'Despesa lançada sem comprovação das 3 cotações prévias de preço exigidas pela Lei Estadual nº 14.268/PR.'
          : undefined
    };

    soundFX.playSuccess();
    setUnidades(prev =>
      prev.map(u =>
        u.id === censeAtual.id
          ? {
              ...u,
              notas: [novaNota, ...u.notas],
              statusFiscal:
                novaNota.status === 'glosada' || u.statusFiscal === 'alerta_glosa'
                  ? 'alerta_glosa'
                  : 'em_analise',
              ultimaPrestacao: new Date().toLocaleDateString('pt-BR')
            }
          : u
      )
    );

    setChaveDanfe('');
    setNumeroNf('');
    setFornecedor('');
    setCnpj('');
    setValorNf('');
    setDescricaoNf('');
    setComprovanteNome('');
    setTresOrcamentos(true);
    setAbaDetalhe('notas');
    setFeedbackMsg(`Nota Fiscal ${novaNota.numeroNf} registrada no ${censeAtual.nome}.`);
    setTimeout(() => setFeedbackMsg(null), 4000);

    eventBus.emit('cense.nfe_lancada', {
      chaveAcesso: novaNota.chaveAcesso || '41261000000000000000550010000000001000000000',
      unidade: censeAtual.nome,
      valor: novaNota.valor,
      rubrica: novaNota.rubrica,
      gestor: censeAtual.diretorSuprido
    });
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
              diasRestantesPrestacao: 60,
              notas: u.notas.map(n => (n.status === 'pendente' ? { ...n, status: 'aprovada' } : n))
            }
          : u
      )
    );
    setFeedbackMsg(`Prestação de Contas do ${censeAtual.nome} homologada e prazo renovado para 60 dias!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleLiberarNovaCota = () => {
    soundFX.playSuccess();
    const valorRepasseExtra = 12000;
    setUnidades(prev =>
      prev.map(u =>
        u.id === censeAtual.id
          ? {
              ...u,
              cotaTrimestral: u.cotaTrimestral + valorRepasseExtra,
              ultimaPrestacao: new Date().toLocaleDateString('pt-BR')
            }
          : u
      )
    );
    setFeedbackMsg(
      `Repasse suplementar de R$ ${valorRepasseExtra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} creditado na Conta BB do ${censeAtual.nome}.`
    );
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleExportarCsv = () => {
    soundFX.playSuccess();
    const cabecalho = [
      'Unidade CENSE',
      'Cidade',
      'Regional',
      'Gestor Suprido',
      'Matricula',
      'Conta Banco do Brasil',
      'Cota Trimestral (R$)',
      'Total Executado (R$)',
      'Saldo Disponivel (R$)',
      'Status Fiscal',
      'Prazo Prestacao (Dias)',
      'Ultima Prestacao',
      'Numero NF-e',
      'Fornecedor',
      'CNPJ',
      'Rubrica Orcamentaria',
      'Valor NF (R$)',
      'Status NF'
    ];

    const linhas: string[][] = [];
    unidades.forEach(u => {
      const execU = u.notas.filter(n => n.status !== 'glosada').reduce((s, n) => s + n.valor, 0);
      const saldoU = Math.max(0, u.cotaTrimestral - execU);
      if (u.notas.length === 0) {
        linhas.push([
          u.nome,
          u.cidade,
          u.regional,
          u.diretorSuprido,
          u.matricula,
          u.contaBancoBrasil,
          u.cotaTrimestral.toFixed(2),
          execU.toFixed(2),
          saldoU.toFixed(2),
          u.statusFiscal,
          String(u.diasRestantesPrestacao),
          u.ultimaPrestacao,
          '-',
          '-',
          '-',
          '-',
          '0.00',
          '-'
        ]);
      } else {
        u.notas.forEach(nf => {
          linhas.push([
            u.nome,
            u.cidade,
            u.regional,
            u.diretorSuprido,
            u.matricula,
            u.contaBancoBrasil,
            u.cotaTrimestral.toFixed(2),
            execU.toFixed(2),
            saldoU.toFixed(2),
            u.statusFiscal,
            String(u.diasRestantesPrestacao),
            u.ultimaPrestacao,
            nf.numeroNf,
            nf.fornecedor,
            nf.cnpj,
            nf.rubrica,
            nf.valor.toFixed(2),
            nf.status
          ]);
        });
      }
    });

    const csvContent =
      '\uFEFF' +
      [cabecalho, ...linhas]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fundo_rotativo_19_censes_seju_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setFeedbackMsg('Planilha oficial (.CSV) com as 19 unidades CENSE exportada com sucesso!');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const valorDigitadoNum = parseFloat(valorNf.replace(',', '.')) || 0;
  const excedeLimiteLegal = valorDigitadoNum > LIMITE_INDIVIDUAL_NOTA;
  const excedeSaldoUnidade = valorDigitadoNum > saldoUnidade;

  const percGlobalExec = dotacaoTotal > 0 ? Math.min(100, Math.round((executadoTotal / dotacaoTotal) * 100)) : 0;
  const percGlobalSaldo = Math.max(0, 100 - percGlobalExec);
  const percRede30 = executadoTotal > 0 ? Math.round((totalRede30 / executadoTotal) * 100) : 50;
  const percRede39 = executadoTotal > 0 ? 100 - percRede30 : 50;
  const totalGlosasRede = unidades.reduce(
    (acc, u) => acc + u.notas.filter(n => n.status === 'glosada').length,
    0
  );
  const digitosChave = chaveDanfe.replace(/\D/g, '');

  return (
    <div className="space-y-6 font-sans">
      
      {/* =====================================================================
          SEÇÃO 1: HEADER EXECUTIVO & KPIS FISCAIS CONSOLIDADOS DOS 19 CENSES
         ===================================================================== */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-gov-card space-y-6">
        {/* Brilho Especular Superior estilo Stripe Treasury / Terminal Financeiro */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#0072BB] to-emerald-500 opacity-90" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#0072BB]/[0.05] via-emerald-500/[0.03] to-transparent blur-2xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <button
              onClick={() => {
                soundFX.playClick();
                onVoltarHub();
              }}
              className="group relative w-10 h-10 rounded-xl bg-slate-100/90 hover:bg-slate-900 text-slate-600 hover:text-white border border-slate-200/80 hover:border-slate-900 flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 mt-0.5 sm:mt-0 shadow-2xs active:scale-95"
              title="Voltar ao Início"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50/90 px-2.5 py-0.5 rounded-full border border-emerald-300/70 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Lei Estadual nº 14.268/PR · DEASE / SEJU
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#0072BB] bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                  <Landmark size={11} /> BB TESOURARIA · 19 UNIDADES CENSE
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60 tabular-nums">
                  <Activity size={10} className="text-emerald-600" /> SIAF / TCE-PR SYNC
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
                <span>Gestão Fiscal de Fundo Rotativo · Unidades CENSE</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={handleExportarCsv}
              className="group px-3.5 py-2.5 rounded-xl bg-emerald-50/90 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200/90 hover:border-emerald-600 text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:scale-[0.98]"
              title="Exportar Planilha Consolidada para Excel (.CSV)"
            >
              <Download size={14} className="text-emerald-600 group-hover:text-white transition-colors" />
              <span>Exportar Planilha</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-200/60 group-hover:bg-emerald-700 text-emerald-900 group-hover:text-emerald-50">
                .CSV
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setAbaDetalhe('nova-despesa');
              }}
              className="group relative overflow-hidden px-4 py-2.5 rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm ring-1 ring-slate-900/80 transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <ScanLine size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Scanner / Lançar NF-e</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setAbaDetalhe('relatorio');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              <FileText size={14} className="text-[#0072BB]" />
              <span className="hidden sm:inline">Espelho TCE-PR</span>
            </button>
          </div>
        </div>

        {/* =================================================================
            FAIXA CONSOLIDADA DE 4 INDICADORES FISCAIS (CANTONEIRAS TÉCNICAS + BRILHO ESPECULAR + TABULAR-NUMS)
           ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* KPI 1: ORÇAMENTO GLOBAL / DOTAÇÃO TOTAL */}
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white via-slate-50/60 to-slate-100/40 border border-slate-200/90 shadow-2xs group hover:border-slate-300 transition-all">
            {/* Brilho Especular Superior */}
            <div className="pointer-events-none absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-slate-400/60 to-transparent" />
            {/* Cantoneiras Técnicas nos 4 Cantos */}
            <span className="pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-slate-300 group-hover:border-slate-500 transition-colors rounded-tl-[2px]" />
            <span className="pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-slate-300 group-hover:border-slate-500 transition-colors rounded-tr-[2px]" />
            <span className="pointer-events-none absolute bottom-2 left-2 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-slate-300 group-hover:border-slate-500 transition-colors rounded-bl-[2px]" />
            <span className="pointer-events-none absolute bottom-2 right-2 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-slate-300 group-hover:border-slate-500 transition-colors rounded-br-[2px]" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Orçamento Global · Dotação
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-900/5 border border-slate-200/80 flex items-center justify-center">
                <Wallet size={13} className="text-slate-700" />
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums tracking-tight">
              R$ {dotacaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono tabular-nums">
              <span className="text-slate-500 font-semibold">
                {unidades.length} CENSEs · 4º Trim/26
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-bold">
                TETO R$ 8k/NF
              </span>
            </div>
          </div>

          {/* KPI 2: TOTAL EXECUTADO (NF-e) */}
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white via-blue-50/25 to-blue-50/40 border border-blue-200/80 shadow-2xs group hover:border-blue-300 transition-all">
            {/* Brilho Especular Superior */}
            <div className="pointer-events-none absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#0072BB]/70 to-transparent" />
            {/* Cantoneiras Técnicas nos 4 Cantos */}
            <span className="pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-blue-300 group-hover:border-[#0072BB] transition-colors rounded-tl-[2px]" />
            <span className="pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-blue-300 group-hover:border-[#0072BB] transition-colors rounded-tr-[2px]" />
            <span className="pointer-events-none absolute bottom-2 left-2 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-blue-300 group-hover:border-[#0072BB] transition-colors rounded-bl-[2px]" />
            <span className="pointer-events-none absolute bottom-2 right-2 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-blue-300 group-hover:border-[#0072BB] transition-colors rounded-br-[2px]" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0072BB]">
                Total Executado (NF-e)
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-200/80 flex items-center justify-center">
                <Receipt size={13} className="text-[#0072BB]" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <div className="text-xl sm:text-2xl font-extrabold text-[#0072BB] font-mono tabular-nums tracking-tight">
                R$ {executadoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded bg-blue-100/80 text-[#0072BB]">
                {percGlobalExec}%
              </span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-blue-200/50 flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-600">
              <span>
                <strong className="text-[#0072BB]">30:</strong> R$ {totalRede30.toLocaleString('pt-BR')}
              </span>
              <span className="text-slate-300">|</span>
              <span>
                <strong className="text-emerald-700">39:</strong> R$ {totalRede39.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {/* KPI 3: SALDO EM CONTA BB */}
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white via-emerald-50/25 to-emerald-50/40 border border-emerald-200/80 shadow-2xs group hover:border-emerald-300 transition-all">
            {/* Brilho Especular Superior */}
            <div className="pointer-events-none absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />
            {/* Cantoneiras Técnicas nos 4 Cantos */}
            <span className="pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-emerald-300 group-hover:border-emerald-600 transition-colors rounded-tl-[2px]" />
            <span className="pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-emerald-300 group-hover:border-emerald-600 transition-colors rounded-tr-[2px]" />
            <span className="pointer-events-none absolute bottom-2 left-2 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-emerald-300 group-hover:border-emerald-600 transition-colors rounded-bl-[2px]" />
            <span className="pointer-events-none absolute bottom-2 right-2 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-emerald-300 group-hover:border-emerald-600 transition-colors rounded-br-[2px]" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                Saldo em Conta BB
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-200/80 flex items-center justify-center">
                <TrendingUp size={13} className="text-emerald-600" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono tabular-nums tracking-tight">
                R$ {saldoTotalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800">
                {percGlobalSaldo}% livre
              </span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-emerald-200/50 flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-600">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Liquidez Imediata BB
              </span>
              <span className="text-slate-400">19 Contas Ativas</span>
            </div>
          </div>

          {/* KPI 4: ALERTAS DE GLOSA TCE-PR & AUDITORIA */}
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white via-amber-50/20 to-slate-50/70 border border-amber-200/85 shadow-2xs group hover:border-amber-300 transition-all">
            {/* Brilho Especular Superior */}
            <div className="pointer-events-none absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
            {/* Cantoneiras Técnicas nos 4 Cantos */}
            <span className="pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-amber-300 group-hover:border-amber-600 transition-colors rounded-tl-[2px]" />
            <span className="pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-amber-300 group-hover:border-amber-600 transition-colors rounded-tr-[2px]" />
            <span className="pointer-events-none absolute bottom-2 left-2 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-amber-300 group-hover:border-amber-600 transition-colors rounded-bl-[2px]" />
            <span className="pointer-events-none absolute bottom-2 right-2 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-amber-300 group-hover:border-amber-600 transition-colors rounded-br-[2px]" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
                Alertas & Glosa TCE-PR
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-200/80 flex items-center justify-center">
                <ShieldCheck size={13} className="text-amber-600" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {unidades.length - unidadesComPendencia}/{unidades.length} Regulares
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[10px] font-mono tabular-nums">
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <AlertTriangle size={11} className="text-amber-600" />
                {unidadesComPendencia} em revisão
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-100/80 text-red-700 font-bold">
                {totalGlosasRede} {totalGlosasRede === 1 ? 'Glosa' : 'Glosas'}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Telemetria Contábil da Rede: 33.90.30 (Consumo) vs 33.90.39 (Serviços PJ) */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-inner flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold text-[10px] uppercase tracking-wider">
              TELEMETRIA ORÇAMENTÁRIA REDE CENSE
            </span>
            <span className="text-slate-300 font-mono tabular-nums">
              Rubrica <strong className="text-sky-400">33.90.30 (Material de Consumo)</strong>: R$ {totalRede30.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({percRede30}%)
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-300 font-mono tabular-nums">
              Rubrica <strong className="text-emerald-400">33.90.39 (Serviços Terceiros PJ)</strong>: R$ {totalRede39.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({percRede39}%)
            </span>
          </div>

          <div className="w-full lg:w-64 h-2 bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5 shrink-0">
            <div
              className="h-full rounded-l-full bg-gradient-to-r from-[#0072BB] to-sky-400 transition-all duration-500"
              style={{ width: `${percRede30}%` }}
            />
            <div
              className="h-full rounded-r-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-500"
              style={{ width: `${percRede39}%` }}
            />
          </div>
        </div>

        {/* Barra de Busca e Filtros por Regional / Situação Fiscal */}
        <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar entre os 19 CENSEs por cidade, conta BB ou gestor suprido..."
              className="w-full text-xs pl-9 pr-16 py-2.5 bg-slate-50/90 focus:bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 text-slate-800 transition-all"
            />
            {busca ? (
              <button
                onClick={() => setBusca('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            ) : (
              <span className="pointer-events-none absolute right-2.5 top-2 text-[10px] font-mono font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                19 UNID
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'todas', label: 'Todas Regionais (19)' },
              { id: 'Curitiba & RMC', label: 'Curitiba & RMC (4)' },
              { id: 'Campos Gerais & Litoral', label: 'Campos Gerais & Litoral (2)' },
              { id: 'Norte & Noroeste', label: 'Norte & Noroeste (7)' },
              { id: 'Oeste & Sudoeste', label: 'Oeste & Sudoeste (6)' }
            ].map(reg => (
              <button
                key={reg.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setFiltroRegional(reg.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                  filtroRegional === reg.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50/90 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
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
        <div className="relative overflow-hidden bg-slate-900 text-white px-4 py-3.5 rounded-2xl border border-emerald-500/40 shadow-lg flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
            <span className="font-mono">{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white cursor-pointer p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* =====================================================================
          SEÇÃO 2: ESTRUTURA DIVIDIDA (LISTA DE CENSES À ESQUERDA + AUDITORIA DA UNIDADE À DIREITA)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA (5 COLUNAS): UNIDADES CENSE E SALDO DE COTAS */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-gov-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-slate-50/90 to-white">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <Building2 size={14} />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                  Unidades Socioeducativas ({unidadesFiltradas.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                  Monitoramento de Cotas Trimestrais TCE-PR
                </span>
              </div>
            </div>

            <div className="flex items-center gap-0.5 p-1 rounded-xl bg-slate-100 border border-slate-200/70">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'regular', label: 'Regulares' },
                { id: 'em_analise', label: 'Análise' },
                { id: 'alerta_glosa', label: 'Glosas' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => {
                    soundFX.playClick();
                    setFiltroStatus(st.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    filtroStatus === st.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[760px] overflow-y-auto">
            {unidadesFiltradas.map((u, idx) => {
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
                  className={`group relative p-4 sm:p-5 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-50/75 via-blue-50/25 to-white border-l-4 border-l-[#0072BB]'
                      : 'hover:bg-slate-50/90 border-l-4 border-l-transparent'
                  }`}
                >
                  {isSelected && (
                    <>
                      <span className="pointer-events-none absolute top-2 right-2 w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-[#0072BB]/60" />
                      <span className="pointer-events-none absolute bottom-2 right-2 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#0072BB]/60" />
                    </>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0072BB] transition-colors truncate">
                          {u.nome}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">· {u.cidade}</span>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>
                          Suprido: <strong className="font-semibold text-slate-700">{u.diretorSuprido}</strong>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 tabular-nums bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/70">
                          {u.contaBancoBrasil}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {u.statusFiscal === 'regular' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300/80 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Regular TCE
                        </span>
                      )}
                      {u.statusFiscal === 'em_analise' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300/80 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Em Análise
                        </span>
                      )}
                      {u.statusFiscal === 'alerta_glosa' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-300/80 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          Glosa Fiscal
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono tabular-nums font-bold flex items-center gap-1 ${
                          u.diasRestantesPrestacao <= 15 ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      >
                        <Clock size={10} /> {u.diasRestantesPrestacao}d prazo
                      </span>
                    </div>
                  </div>

                  {/* Barra de Execução da Cota com Gradiente Suave & Tabular-Nums */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100/90 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span className="text-slate-500">
                        Exec.: <strong className="text-slate-900">R$ {execU.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>{' '}
                        <span className="text-[10px] text-slate-400">({percU}%)</span>
                      </span>
                      <span className="text-emerald-700 font-bold">
                        Saldo: R$ {saldoU.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          u.statusFiscal === 'alerta_glosa'
                            ? 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500'
                            : percU > 85
                            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                            : 'bg-gradient-to-r from-[#0072BB] via-sky-500 to-emerald-500'
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
        <div className="relative lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-gov-card overflow-hidden">
          {/* Brilho Especular Superior */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#0072BB] via-sky-400 to-emerald-500" />
          
          {/* Cabeçalho da Unidade Selecionada */}
          <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-gradient-to-b from-slate-50/70 to-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200/80">
                    {censeAtual.regional}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums text-[11px] font-bold text-[#0072BB] bg-blue-50/80 px-2.5 py-0.5 rounded-md border border-blue-200/70">
                    <Landmark size={11} /> {censeAtual.contaBancoBrasil}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono tabular-nums font-bold border ${
                      censeAtual.diasRestantesPrestacao <= 15
                        ? 'bg-amber-50 text-amber-800 border-amber-300/80'
                        : 'bg-slate-100 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <Clock size={11} /> Prazo Legal 60d: {censeAtual.diasRestantesPrestacao}d restantes
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
                  {censeAtual.nome} <span className="text-sm font-semibold text-slate-400">· {censeAtual.cidade}/PR</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Servidor Suprido: <strong className="text-slate-800 font-bold">{censeAtual.diretorSuprido}</strong>{' '}
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">({censeAtual.matricula})</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleLiberarNovaCota}
                  className="group px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50/60 text-slate-700 hover:text-[#0072BB] border border-slate-200/90 hover:border-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:scale-[0.98]"
                  title="Liberar Cota Extraordinária / Repasse Suplementar SEJU"
                >
                  <RefreshCw size={13} className="text-[#0072BB] group-hover:rotate-180 transition-transform duration-500" />
                  <span>Liberar Nova Cota</span>
                </button>

                <button
                  type="button"
                  onClick={handleHomologarPrestacao}
                  className="group relative overflow-hidden px-3.5 py-2 rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm ring-1 ring-emerald-700/60 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                  <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  <CheckCircle2 size={14} className="text-emerald-100" />
                  <span>Homologar Prestação</span>
                </button>
              </div>
            </div>

            {/* Mini Resumo Orçamentário da Unidade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/85 shadow-2xs">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Cota Trimestral
                </div>
                <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono tabular-nums mt-1">
                  R$ {censeAtual.cotaTrimestral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-blue-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <span>Executado NF-e</span>
                  <span className="text-[#0072BB] tabular-nums">{percentualExecutado}%</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-[#0072BB] font-mono tabular-nums mt-1">
                  R$ {executadoUnidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <span>Saldo Conta BB</span>
                  <span className="text-emerald-700 tabular-nums">{100 - percentualExecutado}%</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-600 font-mono tabular-nums mt-1">
                  R$ {saldoUnidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* DECOMPOSIÇÃO VISUAL IMPECÁVEL DAS RUBRICAS: 33.90.30 (CONSUMO) VS 33.90.39 (SERVIÇOS PJ) */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/85 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                  <PieChart size={13} className="text-[#0072BB]" />
                  <span>Decomposição Contábil por Natureza de Despesa · TCE-PR</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                  {notasValidasUnidade.length} {notasValidasUnidade.length === 1 ? 'documento válido' : 'documentos válidos'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white border border-blue-200/70 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 text-[#0072BB] flex items-center justify-center font-mono text-[10px] font-extrabold shrink-0">
                      .30
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase text-[#0072BB]">
                        Rubrica 33.90.30 · Consumo
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Higiene, Oficinas & Saúde
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      R$ {unidadeConsumo30.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] font-bold text-[#0072BB]">{percConsumo30}% do gasto</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-emerald-200/70 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center font-mono text-[10px] font-extrabold shrink-0">
                      .39
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase text-emerald-700">
                        Rubrica 33.90.39 · Serviços PJ
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Manutenção Predial & Reparos
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      R$ {unidadeServicos39.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-700">{percServicos39}% do gasto</div>
                  </div>
                </div>
              </div>

              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                <div
                  className="h-full rounded-l-full bg-gradient-to-r from-[#0072BB] to-sky-500 transition-all duration-500"
                  style={{ width: `${percConsumo30}%` }}
                  title="Material de Consumo (33.90.30)"
                />
                <div
                  className="h-full rounded-r-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500"
                  style={{ width: `${percServicos39}%` }}
                  title="Outros Serviços de Terceiros - Pessoa Jurídica (33.90.39)"
                />
              </div>
            </div>

            {/* Sub-abas da Unidade */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { id: 'notas', label: `Notas Fiscais (${censeAtual.notas.length})`, icon: Receipt },
                { id: 'nova-despesa', label: 'Scanner NF-e / Lançar Despesa', icon: ScanLine },
                { id: 'relatorio', label: 'Espelho Oficial TCE-PR', icon: SlidersHorizontal }
              ].map(t => {
                const Icon = t.icon;
                const ativa = abaDetalhe === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setAbaDetalhe(t.id as 'notas' | 'nova-despesa' | 'relatorio');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      ativa
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <Icon size={13} className={ativa ? 'text-emerald-400' : 'text-slate-500'} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================================
              CONTEÚDO DA ABA 1: LISTA DE NOTAS FISCAIS E AUDITORIA DE GLOSA
             ================================================================= */}
          {abaDetalhe === 'notas' && (
            <div className="p-5 sm:p-6 space-y-3.5">
              {censeAtual.notas.map(nf => {
                const ehConsumo30 = isRubricaConsumo30(nf.rubrica);
                return (
                  <div
                    key={nf.id}
                    className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border bg-white space-y-3 transition-all shadow-2xs hover:shadow-md ${
                      nf.status === 'glosada'
                        ? 'border-red-200/90 border-l-4 border-l-red-500'
                        : nf.status === 'pendente'
                        ? 'border-amber-200/90 border-l-4 border-l-amber-500'
                        : 'border-slate-200/90 hover:border-slate-300 border-l-4 border-l-emerald-500'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono tabular-nums text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/80">
                            {nf.numeroNf}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">{nf.fornecedor}</span>
                          <span className="text-[11px] font-mono tabular-nums text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                            CNPJ {nf.cnpj}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold text-[10px] border ${
                              ehConsumo30
                                ? 'bg-blue-50 text-[#0072BB] border-blue-200/70'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                            }`}
                          >
                            {ehConsumo30 ? '33.90.30 · CONSUMO' : '33.90.39 · SERVIÇOS PJ'}
                          </span>
                          <span className="font-medium text-slate-600">{nf.rubrica}</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono tabular-nums text-slate-500">Emissão: {nf.dataEmissao}</span>

                          {nf.tresOrcamentos !== false && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                              ✓ 3 Cotações Anexas
                            </span>
                          )}
                          {nf.comprovanteNome && (
                            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70">
                              {nf.comprovanteNome}
                            </span>
                          )}
                        </div>

                        {nf.chaveAcesso && (
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tabular-nums text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
                            <QrCode size={11} className="text-[#0072BB] shrink-0" />
                            <span className="uppercase font-bold text-slate-400">Chave DANFE:</span>
                            <span className="tracking-wider text-slate-700">{nf.chaveAcesso}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-base sm:text-lg font-extrabold font-mono tabular-nums text-slate-900">
                          R$ {nf.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {nf.status === 'aprovada' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 mt-1">
                            <CheckCircle2 size={11} className="text-emerald-600" /> Atestada TCE-PR
                          </span>
                        )}
                        {nf.status === 'pendente' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/90 mt-1">
                            <Clock size={11} className="text-amber-600" /> Em Conferência Fiscal
                          </span>
                        )}
                        {nf.status === 'glosada' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200/90 mt-1">
                            <AlertTriangle size={11} className="text-red-600" /> Nota Glosada
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50/90 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                      {nf.descricao}
                    </p>

                    {nf.motivoGlosa && (
                      <div className="p-3 rounded-xl bg-red-50/90 border border-red-200 text-xs text-red-900 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Motivo da Glosa Fiscal (TCE-PR / Controle Interno): </strong>
                          {nf.motivoGlosa}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-400 select-none">
                        <Lock size={10} className="text-emerald-600" />
                        <span>Hash SEFAZ-PR · ••••••••••••••••</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {nf.status !== 'aprovada' && (
                          <button
                            type="button"
                            onClick={() => handleAprovarNota(nf.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200/90 hover:border-emerald-600 text-[11px] font-bold flex items-center gap-1 transition-all duration-150 cursor-pointer shadow-2xs active:scale-95"
                          >
                            <CheckCircle2 size={12} /> Aprovar NF-e
                          </button>
                        )}
                        {nf.status !== 'glosada' && (
                          <button
                            type="button"
                            onClick={() => handleGlosarNota(nf.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200/90 hover:border-red-600 text-[11px] font-bold flex items-center gap-1 transition-all duration-150 cursor-pointer shadow-2xs active:scale-95"
                          >
                            <Ban size={12} /> Glosar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =================================================================
              CONTEÚDO DA ABA 2: SCANNER LASER FAZENDÁRIO DE DANFE / NF-e (44 DÍGITOS)
             ================================================================= */}
          {abaDetalhe === 'nova-despesa' && (
            <form onSubmit={handleLancarNota} className="p-5 sm:p-6 space-y-5">
              
              {/* ZONA DE SCANNER LASER FAZENDÁRIO (CANTONEIRAS LUMINOSAS + BARRA DE VARREDURA + CRACHÁ SEFAZ-PR / RECEITA FEDERAL) */}
              <div className="relative overflow-hidden p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-lg space-y-4">
                {/* Grade Óptica Fazendária de Fundo */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.45) 1px, transparent 0)',
                    backgroundSize: '18px 18px'
                  }}
                />

                {/* Barra de Varredura Laser Sutil */}
                <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent shadow-[0_0_16px_rgba(16,185,129,0.85)]" />

                {/* 4 Cantoneiras Luminosas do Scanner Laser */}
                <span className="pointer-events-none absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-xs shadow-[-2px_-2px_8px_rgba(16,185,129,0.4)]" />
                <span className="pointer-events-none absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-xs shadow-[2px_-2px_8px_rgba(16,185,129,0.4)]" />
                <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-xs shadow-[-2px_2px_8px_rgba(16,185,129,0.4)]" />
                <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-xs shadow-[2px_2px_8px_rgba(16,185,129,0.4)]" />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                      <ScanLine size={20} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono text-[10px] font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          SEFAZ-PR · RECEITA FEDERAL · SPED NF-e
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                          OCR / XML LASER SCANNER
                        </span>
                      </div>
                      <div className="text-sm font-extrabold text-white mt-1">
                        Scanner Inteligente de DANFE & Chave de Acesso (44 Dígitos)
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.xml,.png,.jpg,.jpeg"
                      onChange={handleUploadComprovante}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload size={13} className="text-sky-400" />
                      <span>Drop DANFE / XML</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSimularLeituraDanfe}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1.5 shadow-[0_0_16px_rgba(16,185,129,0.4)] transition cursor-pointer active:scale-95"
                    >
                      <Sparkles size={13} />
                      <span>Simular Leitura Laser DANFE (SEFAZ-PR)</span>
                    </button>
                  </div>
                </div>

                {/* Visor Óptico dos 44 Dígitos da Chave de Acesso */}
                <div className="relative space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <QrCode size={11} className="text-emerald-400" />
                      Barramento Óptico de Chave de Acesso NF-e (Modelo 55 / 65)
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold tabular-nums ${
                        digitosChave.length === 44
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {digitosChave.length}/44 DÍGITOS
                    </span>
                  </div>

                  <input
                    type="text"
                    value={chaveDanfe}
                    onChange={e => setChaveDanfe(e.target.value)}
                    placeholder="4126 1082 3910 4400 0192 5500 1000 0284 1010 9283 7461 (Cole ou escaneie os 44 dígitos)"
                    className="w-full text-xs font-mono tabular-nums tracking-wider px-4 py-3 rounded-xl bg-slate-900/95 text-emerald-300 placeholder:text-slate-600 border border-emerald-500/30 focus:outline-hidden focus:border-emerald-400 shadow-inner"
                  />

                  {comprovanteNome && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        Autenticado SEFAZ-PR / Receita Federal: <strong>{comprovanteNome}</strong>
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                        PROTOCOLO VÁLIDO
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Decomposição Interativa de Rubrica no Lançamento: 33.90.30 vs 33.90.39 */}
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/85 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Layers size={14} className="text-[#0072BB]" />
                    <span>Classificação da Rubrica Orçamentária (33.90.30 vs 33.90.39)</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                    {isRubricaConsumo30(rubrica) ? 'NATUREZA 33.90.30 · CONSUMO' : 'NATUREZA 33.90.39 · SERVIÇOS PJ'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRubrica('Material de Consumo & Higiene (33.90.30)')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isRubricaConsumo30(rubrica)
                        ? 'bg-blue-50/90 border-[#0072BB] ring-1 ring-[#0072BB]/30'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-mono font-extrabold uppercase text-[#0072BB]">
                        Elemento 33.90.30
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        Material de Consumo, Oficinas & Saúde
                      </div>
                    </div>
                    <Scale size={15} className="text-[#0072BB] shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setRubrica('Manutenção Predial (33.90.39)')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      !isRubricaConsumo30(rubrica)
                        ? 'bg-emerald-50/90 border-emerald-600 ring-1 ring-emerald-600/30'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-mono font-extrabold uppercase text-emerald-700">
                        Elemento 33.90.39
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        Serviços de Terceiros PJ & Manutenção
                      </div>
                    </div>
                    <Scale size={15} className="text-emerald-600 shrink-0" />
                  </button>
                </div>

                <select
                  value={rubrica}
                  onChange={e => setRubrica(e.target.value as RubricaFundo)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-slate-900"
                >
                  <option value="Manutenção Predial (33.90.39)">Manutenção Predial (33.90.39)</option>
                  <option value="Reparos Elétricos & Hidráulicos (33.90.39)">Reparos Elétricos & Hidráulicos (33.90.39)</option>
                  <option value="Material de Consumo & Higiene (33.90.30)">Material de Consumo & Higiene (33.90.30)</option>
                  <option value="Insumos Pedagógicos & Oficinas (33.90.30)">Insumos Pedagógicos & Oficinas (33.90.30)</option>
                  <option value="Suprimento Emergencial Saúde (33.90.30)">Suprimento Emergencial Saúde (33.90.30)</option>
                </select>
              </div>

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
                    className="w-full text-xs font-mono tabular-nums px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-900"
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
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-900 font-mono tabular-nums"
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
                    CNPJ do Fornecedor (Receita Federal)
                  </label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-900 font-mono tabular-nums"
                  />
                </div>
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

              {/* Validador de Conformidade Legal (Lei Estadual 14.268/PR) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/85 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Validador de Conformidade Legal · Lei Estadual nº 14.268/PR & TCE-PR</span>
                  </span>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tresOrcamentos}
                      onChange={e => setTresOrcamentos(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0"
                    />
                    <span>Possui 3 Orçamentos Prévios anexos</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono tabular-nums">
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      excedeLimiteLegal
                        ? 'bg-red-50 border-red-200 text-red-800 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-700'
                    }`}
                  >
                    {excedeLimiteLegal ? (
                      <AlertTriangle size={13} className="text-red-600 shrink-0" />
                    ) : (
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    )}
                    <span>Teto NF: R$ 8.000,00</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      excedeSaldoUnidade
                        ? 'bg-amber-50 border-amber-200 text-amber-800 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-700'
                    }`}
                  >
                    {excedeSaldoUnidade ? (
                      <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    )}
                    <span>Saldo BB: R$ {saldoUnidade.toLocaleString('pt-BR')}</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      !tresOrcamentos
                        ? 'bg-red-50 border-red-200 text-red-800 font-bold'
                        : 'bg-white border-slate-200/80 text-slate-700'
                    }`}
                  >
                    {!tresOrcamentos ? (
                      <AlertTriangle size={13} className="text-red-600 shrink-0" />
                    ) : (
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    )}
                    <span>3 Cotações Prévias</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAbaDetalhe('notas')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition"
                >
                  <PlusCircle size={14} className="text-emerald-400" />
                  <span>Registrar Nota Fiscal no CENSE</span>
                </button>
              </div>
            </form>
          )}

          {/* =================================================================
              CONTEÚDO DA ABA 3: ESPELHO OFICIAL DE PRESTAÇÃO DE CONTAS (TCE-PR / SEJU)
             ================================================================= */}
          {abaDetalhe === 'relatorio' && (
            <div className="p-5 sm:p-6 space-y-5">
              <div className="relative overflow-hidden p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                  <div className="flex items-center gap-3">
                    <BrasaoParana size="sm" />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                        Espelho Oficial de Prestação de Contas · Fundo Rotativo (TCE-PR / SEJU)
                      </div>
                      <div className="text-[11px] font-mono tabular-nums text-slate-500 mt-0.5">
                        {censeAtual.nome} · {censeAtual.competencia} · {censeAtual.contaBancoBrasil}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportarCsv}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                    >
                      <Download size={13} className="text-emerald-600" /> Exportar .CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                    >
                      <Printer size={14} className="text-emerald-400" /> Imprimir Termo TCE-PR
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Unidade Socioeducativa</span>
                    <strong className="text-slate-900">{censeAtual.nome} ({censeAtual.cidade})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Servidor Suprido</span>
                    <strong className="text-slate-900">{censeAtual.diretorSuprido} ({censeAtual.matricula})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Última Conferência / Prazo</span>
                    <strong className="text-slate-900 font-mono tabular-nums">
                      {censeAtual.ultimaPrestacao} ({censeAtual.diasRestantesPrestacao}d restantes)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Blindagem Criptográfica</span>
                    <strong className="text-emerald-700 font-mono select-none">••••••••••••••••</strong>
                  </div>
                </div>

                {/* Quadro Sintético por Natureza de Despesa */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-blue-200/80 shadow-2xs">
                    <div className="text-[10px] font-mono font-bold uppercase text-[#0072BB]">
                      Material de Consumo (33.90.30)
                    </div>
                    <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-slate-900 mt-1">
                      R$ {unidadeConsumo30.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs">
                    <div className="text-[10px] font-mono font-bold uppercase text-emerald-700">
                      Serviços de Terceiros PJ (33.90.39)
                    </div>
                    <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-slate-900 mt-1">
                      R$ {unidadeServicos39.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="text-[10px] font-mono font-bold uppercase text-slate-500">
                      Saldo em Conta BB a Reprogramar
                    </div>
                    <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-emerald-700 mt-1">
                      R$ {saldoUnidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Tabela Discriminada de Documentos Fiscais da Prestação (Bloomberg / Stripe Treasury Table) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <Receipt size={13} className="text-emerald-400" />
                      <span>Relação de Comprovantes Fiscais Atestados ({censeAtual.notas.length} documentos)</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                      AUDITORIA TCE-PR · LEI 14.268/PR
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase text-slate-500 bg-slate-50/90">
                          <th className="py-2.5 px-3.5">Documento</th>
                          <th className="py-2.5 px-3">Emissão</th>
                          <th className="py-2.5 px-3">Credor / CNPJ</th>
                          <th className="py-2.5 px-3">Rubrica Contábil</th>
                          <th className="py-2.5 px-3.5 text-right">Valor (R$)</th>
                          <th className="py-2.5 px-3.5 text-center">Conformidade TCE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {censeAtual.notas.map(nf => {
                          const is30 = isRubricaConsumo30(nf.rubrica);
                          return (
                            <tr key={nf.id} className="hover:bg-slate-50/90 transition-colors">
                              <td className="py-3 px-3.5 font-mono tabular-nums font-extrabold text-slate-900">
                                {nf.numeroNf}
                              </td>
                              <td className="py-3 px-3 font-mono tabular-nums text-slate-600">{nf.dataEmissao}</td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900">{nf.fornecedor}</div>
                                <div className="text-[10px] font-mono tabular-nums text-slate-400">{nf.cnpj}</div>
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border mb-0.5 ${
                                    is30
                                      ? 'bg-blue-50 text-[#0072BB] border-blue-200/70'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                                  }`}
                                >
                                  {is30 ? '33.90.30' : '33.90.39'}
                                </span>
                                <div className="text-[11px] text-slate-600">{nf.rubrica}</div>
                              </td>
                              <td className="py-3 px-3.5 text-right font-mono tabular-nums font-extrabold text-slate-900">
                                R$ {nf.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                    nf.status === 'aprovada'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300/80'
                                      : nf.status === 'glosada'
                                      ? 'bg-red-50 text-red-800 border-red-300/80'
                                      : 'bg-amber-50 text-amber-800 border-amber-300/80'
                                  }`}
                                >
                                  {nf.status === 'aprovada'
                                    ? 'Aprovada TCE'
                                    : nf.status === 'glosada'
                                    ? 'Glosada'
                                    : 'Em Análise'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50/90 border-t-2 border-slate-200 font-mono tabular-nums text-xs">
                          <td colSpan={4} className="py-2.5 px-3.5 font-bold text-slate-600 uppercase text-[10px]">
                            Total Executado Válido ({notasValidasUnidade.length} NFs) · Cota R$ {censeAtual.cotaTrimestral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-extrabold text-[#0072BB]">
                            R$ {executadoUnidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3.5 text-center text-[10px] font-bold text-emerald-700">
                            {percentualExecutado}% EXEC.
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Chancelas Eletrônicas Seladas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/85 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Assinatura Digital · Gestor Suprido
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                        {censeAtual.diretorSuprido} · <span className="font-mono">{censeAtual.matricula}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 select-none">
                      ••••••••••••••••
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/85 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Inspetoria de Controle Interno SEJU / TCE-PR
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                        Conformidade Lei Estadual nº 14.268/PR
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 select-none">
                      ••••••••••••••••
                    </span>
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

