/**
 * Setores da Secretaria de Estado da Justiça e Cidadania (SEJU-PR),
 * conforme o organograma e o regulamento (Decreto nº 8.807/2025).
 * Usado no modo demonstração; com o banco ligado a lista vem da tabela
 * `setores` (mesmos dados, editáveis pelo Admin).
 */
export interface SetorSeju {
  sigla: string;
  nome: string;
  grupo: string;
}

export const GRUPOS_SETOR = [
  'Assessoramento',
  'Direção-Geral',
  'Gerência Geral',
  'Gerência Técnica',
  'Diretoria de Justiça',
  'Diretoria de Cidadania e Direitos Humanos',
  'Atuação sistêmica',
] as const;

export const SETORES_SEJU: SetorSeju[] = [
  { sigla: 'GS', nome: 'Gabinete do Secretário', grupo: 'Assessoramento' },
  { sigla: 'AT', nome: 'Assessoria Técnica', grupo: 'Assessoramento' },
  { sigla: 'DG', nome: 'Diretoria-Geral', grupo: 'Direção-Geral' },
  { sigla: 'UTEC', nome: 'Unidade Técnica de Sistemas de Informação e Tecnologia', grupo: 'Gerência Geral' },
  { sigla: 'UTCL', nome: 'Unidade Técnica de Contratos e Licitações', grupo: 'Gerência Geral' },
  { sigla: 'UTEA', nome: 'Unidade Técnica de Engenharia e Arquitetura', grupo: 'Gerência Geral' },
  { sigla: 'UTSC', nome: 'Unidade Técnica de Suporte aos Colegiados', grupo: 'Gerência Geral' },
  { sigla: 'UTPA', nome: 'Unidade Técnica do Projeto Paraná em Ação', grupo: 'Gerência Geral' },
  { sigla: 'UTCG', nome: 'Unidade Técnica de Corregedoria', grupo: 'Gerência Geral' },
  { sigla: 'DJUS', nome: 'Diretoria de Justiça', grupo: 'Gerência Técnica' },
  { sigla: 'DCDH', nome: 'Diretoria de Cidadania e Direitos Humanos', grupo: 'Gerência Técnica' },
  { sigla: 'CGS', nome: 'Coordenação de Gestão do Sistema Socioeducativo', grupo: 'Diretoria de Justiça' },
  { sigla: 'PROCON', nome: 'PROCON/PR · Coordenação Estadual de Proteção e Defesa do Consumidor', grupo: 'Diretoria de Justiça' },
  { sigla: 'CPJ', nome: 'Coordenação de Proteção e Justiça', grupo: 'Diretoria de Justiça' },
  { sigla: 'NETP', nome: 'Núcleo de Enfrentamento ao Tráfico de Pessoas', grupo: 'Diretoria de Justiça' },
  { sigla: 'CAIC', nome: 'CAIC', grupo: 'Diretoria de Justiça' },
  { sigla: 'ESEDH', nome: 'Escola de Educação em Direitos Humanos', grupo: 'Diretoria de Cidadania e Direitos Humanos' },
  { sigla: 'CODH', nome: 'Coordenação de Direitos Humanos', grupo: 'Diretoria de Cidadania e Direitos Humanos' },
  { sigla: 'COCID', nome: 'Coordenação de Cidadania', grupo: 'Diretoria de Cidadania e Direitos Humanos' },
  { sigla: 'NPS', nome: 'Núcleo de Planejamento Setorial', grupo: 'Atuação sistêmica' },
  { sigla: 'NICS', nome: 'Núcleo de Integridade e Compliance Setorial', grupo: 'Atuação sistêmica' },
  { sigla: 'NCS', nome: 'Núcleo de Comunicação Setorial', grupo: 'Atuação sistêmica' },
  { sigla: 'NFS', nome: 'Núcleo Fazendário Setorial', grupo: 'Atuação sistêmica' },
  { sigla: 'NRHS', nome: 'Núcleo de Recursos Humanos Setorial', grupo: 'Atuação sistêmica' },
  { sigla: 'NAS', nome: 'Núcleo Administrativo Setorial', grupo: 'Atuação sistêmica' },
];

export const nomeDoSetor = (sigla?: string | null) => SETORES_SEJU.find(s => s.sigla === sigla)?.nome ?? '';

/** Agrupa setores na ordem do organograma; o que não tem grupo vai para "Outros". */
export function agruparSetores<T extends { sigla: string; grupo?: string | null }>(setores: T[]): Array<{ grupo: string; itens: T[] }> {
  const ordem = (g: string) => {
    const i = (GRUPOS_SETOR as readonly string[]).indexOf(g);
    return i === -1 ? GRUPOS_SETOR.length : i;
  };
  const mapa = new Map<string, T[]>();
  for (const s of setores) {
    const g = s.grupo?.trim() || 'Outros';
    mapa.set(g, [...(mapa.get(g) ?? []), s]);
  }
  return [...mapa.entries()].sort((a, b) => ordem(a[0]) - ordem(b[0]) || a[0].localeCompare(b[0])).map(([grupo, itens]) => ({ grupo, itens }));
}
