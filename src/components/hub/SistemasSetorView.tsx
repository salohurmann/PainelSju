import React from 'react';
import { 
  Package, 
  Car, 
  ShieldCheck, 
  Headphones, 
  Server, 
  Cpu, 
  Bell, 
  ExternalLink, 
  ChevronRight,
  Info,
  Layers,
  Clock
} from 'lucide-react';
import { Usuario } from '../../types';
import { AppModuleId } from './AppLauncherHub';
import { Badge } from '../ui/Badge';

interface SistemasSetorViewProps {
  currentUser: Usuario;
  onOpenApp: (appId: AppModuleId, subTab?: string) => void;
  onOpenSistemas?: () => void;
}

export const SistemasSetorView: React.FC<SistemasSetorViewProps> = ({
  currentUser,
  onOpenApp,
  onOpenSistemas
}) => {
  const isNas = currentUser.setor.toUpperCase().includes('NAS');
  const isUtec = currentUser.setor.toUpperCase().includes('UTEC') || currentUser.setor.toUpperCase().includes('TECNOLOGIA');

  // Sistemas específicos por setor (Slide 4: Lúcia NAS vs Otávio UTEC)
  const sistemasDoSetor = isNas
    ? [
        {
          id: 'gms',
          nome: 'GMS',
          subtitulo: 'Gestão de Materiais e Serviços',
          descricao: 'Requisições de material de consumo, compras, contratos e catálogo de suprimentos da SEJU.',
          icon: Package,
          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          nivel: 'Nível 1 · Atalho',
          onClick: () => window.open('https://www.gms.pr.gov.br', '_blank')
        },
        {
          id: 'frota',
          nome: 'Gestão de Frota',
          subtitulo: 'Viaturas Oficiais SEJU',
          descricao: 'Requisição de saída de veículos, despacho pela Chefia de Gabinete e vistorias de vistoria pericial.',
          icon: Car,
          iconBg: 'bg-blue-500/10 text-[var(--brand)] border-blue-500/20',
          nivel: 'Nível 3 · Integrado',
          onClick: () => onOpenApp('frota')
        },
        {
          id: 'patrimonio',
          nome: 'Patrimônio',
          subtitulo: 'Controle de Bens do Setor',
          descricao: 'Movimentação, termos de guarda e tombamento de equipamentos alocados no Núcleo Administrativo.',
          icon: ShieldCheck,
          iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          nivel: 'Nível 1 · Atalho',
          onClick: () => window.open('https://www.patrimonio.pr.gov.br', '_blank')
        }
      ]
    : isUtec
    ? [
        {
          id: 'chamados',
          nome: 'Central de Chamados',
          subtitulo: 'Suporte de TI N1/N2 & Infraestrutura',
          descricao: 'Quadro Kanban com triagem de chamados, suporte presencial no Hauer e manutenção de rede.',
          icon: Headphones,
          iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          nivel: 'Nível 3 · Integrado',
          onClick: () => onOpenApp('chamados')
        },
        {
          id: 'google-console',
          nome: 'Console do Google Workspace',
          subtitulo: 'Gestão de Identidades @seju.pr.gov.br',
          descricao: 'Administração de contas institucionais, grupos de e-mail por setor e políticas de segurança.',
          icon: Server,
          iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          nivel: 'Nível 2 · Atalho com contexto',
          onClick: () => window.open('https://admin.google.com', '_blank')
        },
        {
          id: 'inventario-ti',
          nome: 'Inventário de TI',
          subtitulo: 'Parque Computacional e Conectividade',
          descricao: 'Mapeamento de servidores, switches, computadores das 19 unidades CENSE e links GovCloud.',
          icon: Cpu,
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          nivel: 'Nível 3 · Integrado',
          onClick: () => onOpenApp('chamados')
        }
      ]
    : [
        {
          id: 'eprotocolo',
          nome: 'e-Protocolo',
          subtitulo: 'Tramitação de Processos Estaduais',
          descricao: 'Abertura de expedientes, despachos e assinaturas eletrônicas integradas ao Estado.',
          icon: Package,
          iconBg: 'bg-blue-500/10 text-[var(--brand)] border-blue-500/20',
          nivel: 'Nível 1 · Atalho',
          onClick: () => window.open('https://www.eprotocolo.pr.gov.br', '_blank')
        },
        {
          id: 'diarias',
          nome: 'Diárias & Viagens',
          subtitulo: 'Decreto Estadual nº 1.428/PR',
          descricao: 'Calculadora de deslocamento interestadual e intermunicipal com demonstrativo financeiro.',
          icon: Car,
          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          nivel: 'Nível 3 · Integrado',
          onClick: () => onOpenApp('diarias')
        },
        {
          id: 'cense',
          nome: 'Fundo Rotativo CENSE',
          subtitulo: 'Gestão Fiscal das 19 Unidades',
          descricao: 'Leitor de DANFE 44 dígitos, separação de rubricas 33.90.30/39 e conformidade TCE-PR.',
          icon: ShieldCheck,
          iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          nivel: 'Nível 3 · Integrado',
          onClick: () => onOpenApp('cense')
        }
      ];

  const tagNomeSetor = isNas ? 'NAS' : isUtec ? 'UTEC' : currentUser.setor;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 select-none">
      
      {/* Coluna da Esquerda (2/3): Sistemas do seu setor */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-heading">
              Sistemas do seu setor
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[var(--brand-soft)] text-[var(--brand)] text-[10px] font-bold border border-[var(--brand-border)]">
              {tagNomeSetor}
            </span>
          </div>

          {onOpenSistemas && (
            <button
              type="button"
              onClick={onOpenSistemas}
              className="text-xs text-[var(--brand)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Ver catálogo completo (31)</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {sistemasDoSetor.map((sis) => {
            const Icon = sis.icon;
            return (
              <div
                key={sis.id}
                onClick={sis.onClick}
                className="group card-sheen p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card hover:border-[var(--brand)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-[var(--radius-lg)] ${sis.iconBg} border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 mt-0.5`}>
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors font-heading truncate">
                        {sis.nome}
                      </h3>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">·</span>
                      <span className="text-[11px] text-[var(--text-muted)] truncate">
                        {sis.subtitulo}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {sis.descricao}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between shrink-0 h-full gap-2 self-stretch">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    sis.nivel.includes('Integrado')
                      ? 'bg-blue-500/10 text-[var(--brand)] border-blue-500/20'
                      : sis.nivel.includes('contexto')
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'
                  }`}>
                    {sis.nivel}
                  </span>

                  <span className="text-xs font-semibold text-[var(--brand)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Acessar <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coluna da Direita (1/3): Avisos da Chefia & Manutenções (Slide 1 & 4) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 font-heading">
            <Bell size={13} className="text-amber-500" />
            Avisos do Setor
          </h2>
          <span className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--brand)]">
            Ver todos
          </span>
        </div>

        <div className="space-y-3">
          {/* Card de Aviso 1: Manutenção da Rede UTEC (Exatamente do Slide 1 e 4) */}
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                <Clock size={10} /> Manutenção · UTEC
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Há 2 dias</span>
            </div>

            <h3 className="text-xs font-bold text-[var(--text)] font-heading leading-snug">
              Pastas de rede fora do ar no sábado, 24/10, das 8h às 14h.
            </h3>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Manutenção preventiva nos storages centrais da sede no Hauer para expansão de cotas dos grupos do Google Workspace.
            </p>
          </div>

          {/* Card de Aviso 2: Comunicado Geral do Gabinete */}
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-sky-400 bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded">
                Gabinete SEJU
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Hoje às 09:15</span>
            </div>

            <h3 className="text-xs font-bold text-[var(--text)] font-heading leading-snug">
              Prestação de contas e adiantamentos do 4º Trimestre/2026.
            </h3>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Lembrete do prazo legal de 60 dias para fechamento fiscal das 19 unidades e solicitação de diárias via Decreto 1.428/PR.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
