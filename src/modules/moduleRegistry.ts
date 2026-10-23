import { 
  Car, 
  Headphones, 
  CalendarDays, 
  Briefcase, 
  Coins, 
  PhoneCall, 
  ShieldCheck,
  Vote,
  Settings,
  PlusCircle,
  
  
} from 'lucide-react';
import { ModuleManifest, GrupoModulo, PendenciaItem } from './types';

export const MODULOS_REGISTRY: ModuleManifest[] = [
  {
    id: 'frota',
    nome: 'Frotas & Viaturas',
    descricao: 'Pedidos de veículo, aprovação e vistorias de saída e retorno.',
    icone: Car,
    grupo: 'operacao',
    permissaoMinima: 'frotas:ver',
    acoesRapidas: [
      {
        id: 'solicitar-viatura',
        rotulo: 'Solicitar Veículo',
        icon: PlusCircle,
        subTab: 'nova-solicitacao',
        permissao: 'frotas:solicitar'
      }
    ],
    resumoHome: (ctx) => {
      const disponiveis = (ctx?.veiculos || []).filter((v: any) => v.status === 'disponivel').length;
      const total = (ctx?.veiculos || []).length || 1;
      return {
        valor: `${disponiveis} de ${total}`,
        rotulo: 'veículos disponíveis',
        badge: `${disponiveis} disponíveis`,
        badgeVariant: disponiveis > 0 ? 'brand' : 'warning'
      };
    },
    pendencias: (ctx) => {
      const pendentes = (ctx?.agendamentos || []).filter((a: any) => a.status === 'pendente');
      if (pendentes.length === 0) return [];
      return [
        {
          id: 'pendencia-frotas',
          titulo: `${pendentes.length} viagem${pendentes.length > 1 ? 'ns' : ''} aguardando despacho`,
          descricao: `Destino: ${pendentes[0].destino}`,
          moduloId: 'frota',
          subTab: 'aprovacoes',
          urgencia: 'alta',
          acaoRotulo: 'Despachar agora'
        }
      ];
    },
    ajudaContextual: {
      titulo: 'Como usar a Gestão de Frotas',
      tarefas: [
        { titulo: '1. Solicitar Viagem', descricao: 'Preencha os dados da missão e selecione o veículo desejado no showroom.' },
        { titulo: '2. Deliberação da Chefia', descricao: 'A Chefia de Gabinete revisa e despacha a autorização com assinatura digital.' },
        { titulo: '3. Vistoria de Saída e Retorno', descricao: 'Fotografe os 4 ângulos do veículo na retirada e na devolução.' }
      ]
    }
  },
  {
    id: 'chamados',
    nome: 'Chamados',
    descricao: 'Suporte de TI, manutenção e almoxarifado, com prazo por prioridade.',
    icone: Headphones,
    grupo: 'operacao',
    permissaoMinima: 'chamados:ver',
    acoesRapidas: [
      {
        id: 'abrir-chamado',
        rotulo: 'Abrir Chamado TI',
        icon: Headphones,
        permissao: 'chamados:abrir'
      }
    ],
    resumoHome: () => ({
      valor: 'SLA 98.4%',
      rotulo: 'chamados no prazo',
      badge: 'SLA 98.4%',
      badgeVariant: 'success'
    }),
    pendencias: () => [
      {
        id: 'pendencia-chamados-sla',
        titulo: 'Link de Internet CENSE São José',
        descricao: 'Demanda crítica com SLA prioritário menor que 1h',
        moduloId: 'chamados',
        urgencia: 'alta',
        acaoRotulo: 'Ver atendimento'
      }
    ],
    ajudaContextual: {
      titulo: 'Como usar o Suporte de TI',
      tarefas: [
        { titulo: '1. Abertura Rápida', descricao: 'Clique em Novo Chamado informando setor e descrição da demanda.' },
        { titulo: '2. Quadro Kanban', descricao: 'Acompanhe a triagem e o atendimento arrastando os cards entre as colunas.' },
        { titulo: '3. Pareceres Técnicos', descricao: 'Abra a gaveta lateral para ler os pareceres e notas do técnico alocado.' }
      ]
    }
  },
  {
    id: 'salas',
    nome: 'Reserva de Salas',
    descricao: 'Agenda de salas e auditório, sem choque de horários.',
    icone: CalendarDays,
    grupo: 'operacao',
    permissaoMinima: 'salas:ver',
    acoesRapidas: [
      {
        id: 'reservar-sala',
        rotulo: 'Reservar Sala',
        icon: CalendarDays,
        permissao: 'salas:reservar'
      }
    ],
    resumoHome: () => ({
      valor: '4 salas',
      rotulo: 'livres para hoje',
      badge: '4 salas livres',
      badgeVariant: 'neutral'
    }),
    pendencias: () => [
      {
        id: 'pendencia-reuniao-hoje',
        titulo: 'Alinhamento Diretoria Geral',
        descricao: 'Hoje às 14:30 na Sala de Atos',
        moduloId: 'salas',
        urgencia: 'media',
        acaoRotulo: 'Acessar agenda'
      }
    ],
    ajudaContextual: {
      titulo: 'Como reservar Salas corporativas',
      tarefas: [
        { titulo: '1. Verificar Disponibilidade', descricao: 'Consulte a régua de ocupação das 08h às 18h no dia escolhido.' },
        { titulo: '2. Agendar Horário', descricao: 'Selecione o espaço desejado, defina a pauta e os recursos de apoio.' },
        { titulo: '3. Liberação Automática', descricao: 'Reuniões concluídas podem ser desocupadas para liberar o espaço.' }
      ]
    }
  },
  {
    id: 'diarias',
    nome: 'Diárias & Viagens',
    descricao: 'Cálculo e solicitação de diárias de viagem.',
    icone: Briefcase,
    grupo: 'gestao',
    permissaoMinima: 'diarias:ver',
    acoesRapidas: [
      {
        id: 'calcular-diaria',
        rotulo: 'Calcular Diária',
        icon: Briefcase,
        permissao: 'diarias:calcular'
      }
    ],
    resumoHome: () => ({
      valor: 'Decreto 1.428',
      rotulo: 'tabela oficial 2026',
      badge: 'Decreto 1.428/PR',
      badgeVariant: 'neutral'
    }),
    ajudaContextual: {
      titulo: 'Como calcular e solicitar Diárias',
      tarefas: [
        { titulo: '1. Definir Rota', descricao: 'Selecione o município de destino para cálculo automático de km e diárias.' },
        { titulo: '2. Itemização Fazendária', descricao: 'Consulte o demonstrativo oficial (50% Pousada, 35% Alimentação, 15% Locomoção).' },
        { titulo: '3. Emissão do Anexo I', descricao: 'Gere o documento oficial com protocolo SIAF para empenho financeiro.' }
      ]
    }
  },
  {
    id: 'cense',
    nome: 'Fundo Rotativo CENSE',
    descricao: 'Prestação de contas das 19 unidades socioeducativas.',
    icone: Coins,
    grupo: 'gestao',
    permissaoMinima: 'cense:ver',
    resumoHome: () => ({
      valor: '19 unidades',
      rotulo: 'em conformidade fiscal',
      badge: '19 unidades',
      badgeVariant: 'brand'
    }),
    ajudaContextual: {
      titulo: 'Como gerenciar o Fundo Rotativo',
      tarefas: [
        { titulo: '1. Leitura de DANFE', descricao: 'Informe a chave de 44 dígitos da NF-e para decomposição das rubricas.' },
        { titulo: '2. Classificação Orçamentária', descricao: 'Valide a separação entre Material de Consumo (30) e Serviços PJ (39).' },
        { titulo: '3. Prestação de Contas', descricao: 'Exporte o demonstrativo trimestral assinado pelo gestor suprido.' }
      ]
    }
  },
  {
    id: 'ramais',
    nome: 'Ramais',
    descricao: 'Telefones e contatos da sede e das regionais.',
    icone: PhoneCall,
    grupo: 'gestao',
    permissaoMinima: 'ramais:ver',
    resumoHome: () => ({
      valor: '142 ramais',
      rotulo: 'conectados na rede VoIP',
      badge: 'VoIP Conectado',
      badgeVariant: 'success'
    }),
    ajudaContextual: {
      titulo: 'Como usar a Telefonia e Ramais',
      tarefas: [
        { titulo: '1. Busca Instantânea', descricao: 'Digite nome, setor, ramal ou pavimento da Sede Hauer.' },
        { titulo: '2. Copiar Ramal', descricao: 'Clique sobre o número para copiar diretamente para a área de transferência.' },
        { titulo: '3. Organograma', descricao: 'Alterne para a visão de árvore para entender a hierarquia das diretorias.' }
      ]
    }
  },
  {
    id: 'votacao',
    nome: 'Votação',
    descricao: 'Eleições das entidades (setor UTSC).',
    icone: Vote,
    grupo: 'operacao',
    permissaoMinima: 'votacao:ver',
    resumoHome: () => ({ valor: '', rotulo: 'eleições', badge: 'UTSC', badgeVariant: 'brand' }),
  },
  {
    id: 'auditoria',
    nome: 'Auditoria',
    descricao: 'Registro de quem fez o quê no sistema.',
    icone: ShieldCheck,
    grupo: 'seguranca',
    permissaoMinima: 'seguranca:auditar',
    resumoHome: (ctx) => ({
      valor: `${(ctx?.logs || []).length} blocos`,
      rotulo: 'auditados com SHA-256',
      badge: 'SHA-256',
      badgeVariant: 'success'
    }),
    ajudaContextual: {
      titulo: 'Como consultar a Auditoria Criptográfica',
      tarefas: [
        { titulo: '1. Verificar Integridade', descricao: 'Confira o selo verde que valida a cadeia imutável de blocos SHA-256.' },
        { titulo: '2. Mascaramento LGPD', descricao: 'Dados pessoais (CPF e IP) são anonimizados para proteger os servidores.' },
        { titulo: '3. Filtros Forenses', descricao: 'Filtre registros por tipo de ação, período ou servidor responsável.' }
      ]
    }
  },
  {
    id: 'admin',
    nome: 'Administração',
    descricao: 'Pessoas, setores, papéis e quem vê cada aba.',
    icone: Settings,
    grupo: 'seguranca',
    permissaoMinima: 'seguranca:administrar',
    resumoHome: () => ({ valor: '', rotulo: 'acessos', badge: 'Admin', badgeVariant: 'neutral' }),
  }
];

export function getModulosRegistrados(): ModuleManifest[] {
  return MODULOS_REGISTRY;
}

export function getModulosPorGrupo(grupo: GrupoModulo): ModuleManifest[] {
  return MODULOS_REGISTRY.filter(m => m.grupo === grupo);
}

export function getModuloPorId(id: string): ModuleManifest | undefined {
  return MODULOS_REGISTRY.find(m => m.id === id);
}

export function getTodasPendencias(context: any): PendenciaItem[] {
  const pendencias: PendenciaItem[] = [];
  for (const m of MODULOS_REGISTRY) {
    if (m.pendencias) {
      pendencias.push(...m.pendencias(context));
    }
  }
  return pendencias;
}
