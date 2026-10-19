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

import { temPermissao, Permissao } from '../../services/rbac';

export type AppModuleId = 'frota' | 'chamados' | 'salas' | 'diarias' | 'cense' | 'ramais';

interface ModuloHomeItem {
  id: AppModuleId;
  titulo: string;
  descricao: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  badge: string;
  badgeVariant: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  metrica: string;
  permissaoMinima: Permissao;
  iconColor: string;
  iconBg: string;
  tagColor: string;
}

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

  const todosModulos: ModuloHomeItem[] = [
    {
      id: 'frota' as AppModuleId,
      titulo: 'Gestão de Frotas & Viaturas',
      descricao: 'Requisição de saída de veículos oficiais, despacho pela Chefia e laudos periciais.',
      icon: Car,
      badge: `${disponiveisFrota} disponíveis`,
      badgeVariant: 'brand' as const,
      metrica: `${veiculos.length} veículos na frota`,
      permissaoMinima: 'frotas:ver',
      iconColor: 'text-[#0072BB] dark:text-[#38BDF8]',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      tagColor: 'hover:border-blue-500/40'
    },
    {
      id: 'chamados' as AppModuleId,
      titulo: 'Chamados & Suporte TI',
      descricao: 'Quadro Kanban para requisições de informática, infraestrutura e conectividade.',
      icon: Headphones,
      badge: 'SLA 98.4%',
      badgeVariant: 'success' as const,
      metrica: 'Tempo médio: 42 min',
      permissaoMinima: 'chamados:ver',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      tagColor: 'hover:border-indigo-500/40'
    },
    {
      id: 'salas' as AppModuleId,
      titulo: 'Reserva de Salas & Espaços',
      descricao: 'Agendamento corporativo com prevenção de conflitos e suporte a videoconferência.',
      icon: CalendarDays,
      badge: '4 salas livres',
      badgeVariant: 'neutral' as const,
      metrica: 'Auditório e 6 salas',
      permissaoMinima: 'salas:ver',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      tagColor: 'hover:border-emerald-500/40'
    },
    {
      id: 'diarias' as AppModuleId,
      titulo: 'Diárias & Deslocamentos',
      descricao: 'Calculadora oficial conforme Decreto Estadual nº 1.428/PR e demonstrativo financeiro.',
      icon: Briefcase,
      badge: 'Decreto 1.428/PR',
      badgeVariant: 'neutral' as const,
      metrica: 'Tabela de diárias 2026',
      permissaoMinima: 'diarias:ver',
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      tagColor: 'hover:border-amber-500/40'
    },
    {
      id: 'cense' as AppModuleId,
      titulo: 'Fundo Rotativo CENSE',
      descricao: 'Prestação de contas das 19 unidades, leitor de DANFE NF-e e conformidade fiscal TCE-PR.',
      icon: Coins,
      badge: '19 unidades',
      badgeVariant: 'brand' as const,
      metrica: 'Rubricas 33.90.30/39',
      permissaoMinima: 'cense:ver',
      iconColor: 'text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      tagColor: 'hover:border-sky-500/40'
    },
    {
      id: 'ramais' as AppModuleId,
      titulo: 'Telefonia & Guia de Ramais',
      descricao: 'Diretório telefônico da sede no Hauer e regionais com discagem VoIP e organograma.',
      icon: PhoneCall,
      badge: 'VoIP Ativo',
      badgeVariant: 'success' as const,
      metrica: '142 servidores conectados',
      permissaoMinima: 'ramais:ver',
      iconColor: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-500/10 border-teal-500/20',
      tagColor: 'hover:border-teal-500/40'
    }
  ];

  const modulos = todosModulos.filter(m => temPermissao(currentUser, m.permissaoMinima));

  return (
    <div className="relative space-y-8 select-none">
      {/* Ambient background illumination */}
      <div className="ambient-mesh" />

      {/* 1. SAUDAÇÃO & CABEÇALHO DA HOME */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] capitalize mb-1.5">
            <span className="font-mono text-[11px]">{dataExtenso}</span>
            <span>·</span>
            <span className="font-medium text-[var(--brand)] bg-[var(--brand-soft)] px-2 py-0.5 rounded-full border border-[var(--brand-border)]">
              {currentUser.setor}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text)] font-heading">
            {saudacao}, {primeiroNome}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 max-w-2xl leading-relaxed">
            Painel Executivo Unificado da Secretaria da Justiça e Cidadania do Estado do Paraná.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenCommandPalette?.()}
            icon={<Search size={14} className="text-[var(--brand)]" />}
            className="shadow-2xs hover:shadow-xs transition-shadow"
          >
            Busca Rápida <kbd className="ml-1.5 px-1 py-0.2 bg-[var(--surface-2)] text-[10px] font-mono rounded border border-[var(--border)]">Ctrl+K</kbd>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowJornadaModal(true)}
            className="text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Tour Guiado
          </Button>
        </div>
      </div>

      {/* 2. BLOCO 'PRECISA DA SUA ATENÇÃO' (SEÇÃO PRIORITÁRIA DE TAREFAS) */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 font-heading">
            <span className="w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
            Precisa da sua atenção
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-mono">3 pendências operacionais</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Despacho de Viagens */}
          <div
            onClick={() => onOpenApp('frota', 'aprovacoes')}
            className="group card-sheen p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card hover:border-[var(--brand)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3.5"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="warning" dot>Chefia de Gabinete</Badge>
                <span className="text-[10px] text-[var(--warning)] font-mono font-semibold bg-[var(--warning-soft)] px-1.5 py-0.5 rounded border border-[var(--warning-border)]">
                  Urgente
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors pt-1 font-heading">
                {pendentesFrota.length > 0
                  ? `${pendentesFrota.length} viagem${pendentesFrota.length > 1 ? 'ns' : ''} aguardando despacho`
                  : 'Nenhuma viagem pendente'}
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                {pendentesFrota.length > 0
                  ? `Destino: ${pendentesFrota[0].destino}`
                  : 'Todas as requisições foram deliberadas com sucesso'}
              </p>
            </div>
            <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--brand)]">
              <span>Despachar autorização</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Chamado Crítico */}
          <div
            onClick={() => onOpenApp('chamados')}
            className="group card-sheen p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card hover:border-[var(--brand)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3.5"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="danger" dot>TI · SLA &lt; 1h</Badge>
                <span className="text-[10px] text-[var(--danger)] font-mono font-semibold bg-[var(--danger-soft)] px-1.5 py-0.5 rounded border border-[var(--danger-border)]">
                  #TI-2026-084
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors pt-1 font-heading">
                Link de Internet CENSE São José
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                Lentidão no tráfego de dados para emissão de certidões
              </p>
            </div>
            <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--brand)]">
              <span>Ver atendimento de N2</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Pauta da Reunião de Hoje */}
          <div
            onClick={() => onOpenApp('salas')}
            className="group card-sheen p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card hover:border-[var(--brand)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3.5"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="brand" dot>Hoje às 14:30</Badge>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">Sala de Atos</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors pt-1 font-heading">
                Alinhamento Diretoria Geral
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                Pauta orçamentária do 4º trimestre e novos termos de cooperação
              </p>
            </div>
            <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--brand)]">
              <span>Acessar pauta & mapa</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. AÇÕES RÁPIDAS (4 BOTÕES OBJETIVOS) */}
      <div className="relative z-10 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-heading">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenApp('frota', 'nova-solicitacao')}
            icon={<Car size={16} className="text-[#0072BB] dark:text-[#38BDF8]" />}
            className="w-full justify-start text-xs font-semibold h-12 shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 border-[var(--border)] hover:border-[var(--brand)]"
          >
            Solicitar Veículo
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenApp('chamados')}
            icon={<Headphones size={16} className="text-indigo-600 dark:text-indigo-400" />}
            className="w-full justify-start text-xs font-semibold h-12 shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 border-[var(--border)] hover:border-[var(--brand)]"
          >
            Abrir Chamado TI
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenApp('salas')}
            icon={<CalendarDays size={16} className="text-emerald-600 dark:text-emerald-400" />}
            className="w-full justify-start text-xs font-semibold h-12 shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 border-[var(--border)] hover:border-[var(--brand)]"
          >
            Reservar Sala
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenApp('diarias')}
            icon={<Briefcase size={16} className="text-amber-600 dark:text-amber-400" />}
            className="w-full justify-start text-xs font-semibold h-12 shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 border-[var(--border)] hover:border-[var(--brand)]"
          >
            Calcular Diária
          </Button>
        </div>
      </div>

      {/* 4. GRID UNIFORME DE MÓDULOS (6 CARDS BENTO EM ALTO PADRÃO) */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-heading">
            Módulos de Gestão
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-mono">6 módulos integrados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulos.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onOpenApp(mod.id)}
                className={`group card-sheen p-5 bg-[var(--surface)] border border-[var(--border)] ${mod.tagColor} rounded-[var(--radius-xl)] shadow-gov-card hover:shadow-gov-card hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 h-[200px]`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-10 h-10 rounded-[var(--radius-lg)] ${mod.iconBg} border flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Icon size={19} strokeWidth={2} className={mod.iconColor} />
                    </div>
                    <Badge variant={mod.badgeVariant}>{mod.badge}</Badge>
                  </div>

                  <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors font-heading tracking-tight">
                    {mod.titulo}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2 leading-relaxed">
                    {mod.descricao}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="truncate font-medium">{mod.metrica}</span>
                  <span className="text-[var(--brand)] font-semibold flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                    Acessar <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. ATIVIDADES RECENTES & COFRE DE AUDITORIA SHA-256 */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        <div className="lg:col-span-2 p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card space-y-3.5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-2 font-heading">
              <FileText size={15} className="text-[var(--brand)]" />
              Atividades Recentes na SEJU
            </h3>
            <span className="text-[11px] text-[var(--success)] font-medium flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
              Tempo Real
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--text)] font-heading">Despacho de Viagem · Ticket PR-2026-0842</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Carlos Silva autorizou saída para Regional Londrina</p>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0 bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
                Há 14 min
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 pt-2.5 border-t border-[var(--border)]">
              <div>
                <p className="font-semibold text-[var(--text)] font-heading">Check-in Pericial · Corolla BCB-4A12</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Vistoria realizada com 4 fotografias arquivadas</p>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0 bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
                Há 45 min
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 pt-2.5 border-t border-[var(--border)]">
              <div>
                <p className="font-semibold text-[var(--text)] font-heading">NF-e 44 Dígitos · CENSE Cascavel</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Prestação de contas aprovada na Rubrica 33.90.30</p>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0 bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
                Há 2 horas
              </span>
            </div>
          </div>
        </div>

        {/* Card do Cofre de Auditoria */}
        <div
          onClick={onOpenAuditoria}
          className="group card-sheen p-5 bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card hover:border-[var(--brand)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4"
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] text-[var(--brand)] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck size={19} />
              </div>
              <Badge variant="success" dot>ICP-PR 2026</Badge>
            </div>
            <h3 className="text-sm font-bold text-[var(--text)] font-heading">Trilha de Auditoria SHA-256</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
              Registros imutáveis com carimbo de tempo, blindagem LGPD e encadeamento criptográfico seguro.
            </p>
          </div>

          <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--brand)]">
            <span>Consultar registros</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
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
