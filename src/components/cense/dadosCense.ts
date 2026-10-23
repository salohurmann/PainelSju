/**
 * Dados de demonstração do fundo rotativo das 19 unidades CENSE.
 * Nomes, contas, CNPJs e notas são fictícios.
 */
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


export const CENSES_INICIAIS: UnidadeCenseFundo[] = [
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
