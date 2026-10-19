import React, { useState } from 'react';
import { 
  Car, 
  Headphones, 
  CalendarDays, 
  Briefcase, 
  Coins, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Search,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Usuario, Agendamento, Veiculo } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { JornadaInterativaModal } from '../experiencia/JornadaInterativaModal';

export type AppModuleId = 'frota' | 'chamados' | 'salas' | 'diarias' | 'cense' | 'ramais';

interface AppLauncherHubProps {
  currentUser: Usuario;
  veiculos: Veiculo[];
  agendamentos: Agendamento[];
  onOpenApp: (appId: AppModuleId, subTab?: string) => void;
  onOpenAuditoria: () => void;
  onOpenCommandPalette?: () => void;
}

export const AppLauncherHub: React.FC<AppLauncherHubProps> = ({
  currentUser,
  veiculos,
  agendamentos,
  onOpenApp,
  onOpenAuditoria,
  onOpenCommandPalette
}) => {
  const [showJornadaModal, setShowJornadaModal] = useState(false);

  const pendentesFrota = agendamentos.filter(a => a.status === 'pendente');
  const disponiveisFrota = veiculos.filter(v => v.status === 'disponivel').length;
  const primeiroNome = currentUser.nome.split(' ')[0];

  // Saudação de acordo com o horário do dia
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  
  // Data formatada por extenso
  const dataExtenso = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const modulos = [
    {
      id: 'frota' as AppModuleId,
      titulo: 'Gestão de Frotas & Viaturas',
      descricao: 'Requisição de saída de veículos oficiais, despacho pela Chefia e laudos periciais.',
      icon: Car,
      badge: `${disponiveisFrota} disponíveis`,
      badgeVariant: 'brand' as const,
      metrica: `${veiculos.length} veículos na frota`
    },
    {
      id: 'chamados' as AppModuleId,
      titulo: 'Chamados & Suporte TI',
      descricao: 'Quadro Kanban para requisições de informática, infraestrutura e conectividade.',
      icon: Headphones,
      badge: 'SLA 98.4%',
      badgeVariant: 'success' as const,
      metrica: 'Tempo médio: 42 min'
    },
    {
      id: 'salas' as AppModuleId,
      titulo: 'Reserva de Salas & Espaços',
      descricao: 'Agendamento corporativo com prevenção de conflitos e suporte a videoconferência.',
      icon: CalendarDays,
      badge: '4 salas livres',
      badgeVariant: 'neutral' as const,
      metrica: 'Auditório e 6 salas'
    },
    {
      id: 'diarias' as AppModuleId,
      titulo: 'Diárias & Deslocamentos',
      descricao: 'Calculadora oficial conforme Decreto Estadual nº 1.428/PR e demonstrativo financeiro.',
      icon: Briefcase,
      badge: 'Decreto 1.428/PR',
      badgeVariant: 'neutral' as const,
      metrica: 'Tabela de diárias 2026'
    },
    {
      id: 'cense' as AppModuleId,
      titulo: 'Fundo Rotativo CENSE',
      descricao: 'Prestação de contas das 19 unidades, leitor de DANFE NF-e e conformidade fiscal TCE-PR.',
      icon: Coins,
      badge: '19 unidades',
      badgeVariant: 'brand' as const,
      metrica: 'Rubricas 33.90.30/39'
    },
    {
      id: 'ramais' as AppModuleId,
      titulo: 'Telefonia & Guia de Ramais',
      descricao: 'Diretório telefônico da sede no Hauer e regionais com discagem VoIP e organograma.',
      icon: PhoneCall,
      badge: 'VoIP Ativo',
      badgeVariant: 'success' as const,
      metrica: '142 servidores conectados'
    }
  ];

  return (
    <div className="space-y-8 select-none">
      
      {/* 1. SAUDAÇÃO & CABEÇALHO DA HOME */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] capitalize mb-1">
            <span>{dataExtenso}</span>
            <span>·</span>
            <span className="font-medium text-[var(--text)]">{currentUser.setor}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
            {saudacao}, {primeiroNome}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Portal Unificado de Operações e Governança da Secretaria da Justiça e Cidadania do Paraná.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenCommandPalette?.()}
            icon={<Search size={14} />}
          >
            Busca Rápida (Ctrl+K)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowJornadaModal(true)}
          >
            Tour da Plataforma
          </Button>
        </div>
      </div>

      {/* 2. BLOCO 'PRECISA DA SUA ATENÇÃO' (SEÇÃO PRIORITÁRIA DE TAREFAS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--warning)]" />
            Precisa da sua atenção
          </h2>
          <span className="text-xs text-[var(--text-muted)]">3 itens pendentes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Despacho de Viagens */}
          <div
            onClick={() => onOpenApp('frota', 'aprovacoes')}
            className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:border-[var(--brand)] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="warning" dot>Chefia de Gabinete</Badge>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">Urgente</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] pt-1">
                {pendentesFrota.length > 0
                  ? `${pendentesFrota.length} viagem${pendentesFrota.length > 1 ? 'ns' : ''} aguardando despacho`
                  : 'Nenhuma viagem pendente'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                {pendentesFrota.length > 0
                  ? `Destino: ${pendentesFrota[0].destino}`
                  : 'Todas as requisições foram deliberadas'}
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-medium text-[var(--brand)]">
              <span>Despachar agora</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 2: Chamado Crítico */}
          <div
            onClick={() => onOpenApp('chamados')}
            className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:border-[var(--brand)] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="danger" dot>TI · SLA &lt; 1h</Badge>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">#TI-2026-084</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] pt-1">
                Link de Internet CENSE São José
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                Lentidão no tráfego de dados para emissão de certidões
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-medium text-[var(--brand)]">
              <span>Ver atendimento</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 3: Pauta da Reunião de Hoje */}
          <div
            onClick={() => onOpenApp('salas')}
            className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:border-[var(--brand)] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="brand" dot>Hoje às 14:30</Badge>
                <span className="text-[10px] text-[var(--text-muted)]">Sala de Atos</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] pt-1">
                Alinhamento Diretoria Geral
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                Pauta orçamentária do 4º trimestre e novos termos de cooperação
              </p>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-medium text-[var(--brand)]">
              <span>Acessar agenda</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. AÇÕES RÁPIDAS (4 BOTÕES OBJETIVOS) */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenApp('frota', 'nova-solicitacao')}
            icon={<Car size={15} />}
            className="w-full justify-start text-xs font-medium h-11"
          >
            Solicitar Veículo
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenApp('chamados')}
            icon={<Headphones size={15} />}
            className="w-full justify-start text-xs font-medium h-11"
          >
            Abrir Chamado TI
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenApp('salas')}
            icon={<CalendarDays size={15} />}
            className="w-full justify-start text-xs font-medium h-11"
          >
            Reservar Sala
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenApp('diarias')}
            icon={<Briefcase size={15} />}
            className="w-full justify-start text-xs font-medium h-11"
          >
            Calcular Diária
          </Button>
        </div>
      </div>

      {/* 4. GRID UNIFORME DE MÓDULOS (6 CARDS IDÊNTICOS EM ESTRUTURA) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Módulos de Gestão
          </h2>
          <span className="text-xs text-[var(--text-muted)]">6 módulos operacionais</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulos.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card
                key={mod.id}
                hoverable
                padding="md"
                onClick={() => onOpenApp(mod.id)}
                className="flex flex-col justify-between gap-4 h-[190px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--brand)] flex items-center justify-center">
                      <Icon size={16} strokeWidth={1.75} />
                    </div>
                    <Badge variant={mod.badgeVariant}>{mod.badge}</Badge>
                  </div>

                  <h3 className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
                    {mod.titulo}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                    {mod.descricao}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="truncate">{mod.metrica}</span>
                  <span className="text-[var(--brand)] font-medium flex items-center gap-1 shrink-0">
                    Acessar <ArrowRight size={12} />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 5. ATIVIDADES RECENTES & COFRE DE AUDITORIA SHA-256 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        <div className="lg:col-span-2 p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
              <FileText size={14} className="text-[var(--brand)]" />
              Atividades Recentes na SEJU
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">Ao vivo</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[var(--text)]">Despacho de Viagem · Ticket PR-2026-0842</p>
                <p className="text-[11px] text-[var(--text-muted)]">Carlos Silva autorizou saída para Regional Londrina</p>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">Há 14 min</span>
            </div>

            <div className="flex items-start justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
              <div>
                <p className="font-medium text-[var(--text)]">Check-in Pericial · Corolla BCB-4A12</p>
                <p className="text-[11px] text-[var(--text-muted)]">Vistoria realizada com 4 fotografias arquivadas</p>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">Há 45 min</span>
            </div>

            <div className="flex items-start justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
              <div>
                <p className="font-medium text-[var(--text)]">NF-e 44 Dígitos · CENSE Cascavel</p>
                <p className="text-[11px] text-[var(--text-muted)]">Prestação de contas aprovada na Rubrica 33.90.30</p>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">Há 2 horas</span>
            </div>
          </div>
        </div>

        {/* Card do Cofre de Auditoria */}
        <div
          onClick={onOpenAuditoria}
          className="p-5 bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-lg)] hover:border-[var(--brand)] transition-colors cursor-pointer flex flex-col justify-between gap-4"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-[var(--brand)] flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <Badge variant="success" dot>ICP-PR</Badge>
            </div>
            <h3 className="text-sm font-semibold text-[var(--text)]">Trilha de Auditoria SHA-256</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              Registros imutáveis com carimbo de tempo, identificação do servidor e hash criptográfico.
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs font-medium text-[var(--brand)]">
            <span>Consultar registros</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>

      {/* Modal do Tour Interativo */}
      <JornadaInterativaModal 
        isOpen={showJornadaModal} 
        onClose={() => setShowJornadaModal(false)}
        onNavigateApp={(appId) => onOpenApp(appId as AppModuleId)}
      />
    </div>
  );
};
