/** Ramais de demonstração (nomes e números fictícios). */
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
  favorito?: boolean;
}

export const RAMAIS_DATA: RamalItem[] = [
  {
    id: 'r1',
    setor: 'Gabinete do Secretário',
    departamento: 'Gabinete do Secretário',
    responsavel: 'Dra. Maria Helena',
    cargo: 'Chefe de Gabinete',
    ramal: '8201',
    telefoneDireto: '(41) 3310-8201',
    email: 'chefia.gabinete@seju.pr.gov.br',
    andar: '3º Andar · Sala 301',
    favorito: true
  },
  {
    id: 'r2',
    setor: 'Assessoria Técnica',
    departamento: 'Gabinete do Secretário',
    responsavel: 'Recepção e Despachos Oficiais',
    cargo: 'Assessoria de Expediente',
    ramal: '8202',
    telefoneDireto: '(41) 3310-8202',
    email: 'gabinete@seju.pr.gov.br',
    andar: '3º Andar · Sala 302',
  },
  {
    id: 'r3',
    setor: 'Núcleo Administrativo Setorial · Transporte',
    departamento: 'Diretoria-Geral',
    responsavel: 'Marcos Viana',
    cargo: 'Gestor de Transporte e Frotas',
    ramal: '8245',
    telefoneDireto: '(41) 3310-8245',
    email: 'transporte.seju@pr.gov.br',
    andar: 'Térreo · Pátio Oficial',
    favorito: true
  },
  {
    id: 'r4',
    setor: 'Coordenação de Direitos Humanos',
    departamento: 'Diretoria de Cidadania e Direitos Humanos',
    responsavel: 'Carlos Silveira',
    cargo: 'Agente Profissional',
    ramal: '8230',
    telefoneDireto: '(41) 3310-8230',
    email: 'direitoshumanos@seju.pr.gov.br',
    andar: '1º Andar · Bloco B',
  },
  {
    id: 'r5',
    setor: 'UTEC · Suporte Técnico de TI',
    departamento: 'Gerência Geral',
    responsavel: 'Helpdesk & Redes',
    cargo: 'Central de Suporte aos Usuários',
    ramal: '8299',
    telefoneDireto: '(41) 3310-8299',
    email: 'suporte.ti@seju.pr.gov.br',
    andar: '2º Andar · Sala 201',
    favorito: true
  },
  {
    id: 'r6',
    setor: 'Núcleo de Recursos Humanos Setorial',
    departamento: 'Diretoria-Geral',
    responsavel: 'Atendimento Funcional e Folha',
    cargo: 'Coordenação de Recursos Humanos',
    ramal: '8215',
    telefoneDireto: '(41) 3310-8215',
    email: 'rh@seju.pr.gov.br',
    andar: '1º Andar · Sala 102',
  },
  {
    id: 'r7',
    setor: 'Núcleo Administrativo Setorial · Protocolo',
    departamento: 'Diretoria-Geral',
    responsavel: 'Atendimento ao Cidadão e Protocolo',
    cargo: 'Recepção Geral',
    ramal: '8200',
    telefoneDireto: '(41) 3310-8200',
    email: 'ouvidoria@seju.pr.gov.br',
    andar: 'Térreo · Entrada Principal',
  },
  {
    id: 'r8',
    setor: 'Núcleo de Integridade e Compliance Setorial',
    departamento: 'Diretoria-Geral',
    responsavel: 'Dra. Patrícia Lima',
    cargo: 'Agente de Compliance',
    ramal: '8220',
    telefoneDireto: '(41) 3310-8220',
    email: 'compliance@seju.pr.gov.br',
    andar: '3º Andar · Sala 305',
  }
];
