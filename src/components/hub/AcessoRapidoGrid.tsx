import React from 'react';
import { 
  Star, 
  Settings2, 
  FileText, 
  Mail, 
  HardDrive, 
  Car, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Package
} from 'lucide-react';
import { AppModuleId } from './AppLauncherHub';

interface AcessoRapidoGridProps {
  onOpenApp: (appId: AppModuleId, subTab?: string) => void;
  onOpenSistemas?: () => void;
  onOpenPastas?: () => void;
}

export const AcessoRapidoGrid: React.FC<AcessoRapidoGridProps> = ({
  onOpenApp,
  onOpenSistemas,
  onOpenPastas
}) => {
  const atalhos = [
    {
      id: 'gms',
      nome: 'GMS',
      descricao: 'gms.pr.gov.br',
      detalhe: 'Gestão de Materiais e Serviços',
      icon: Package,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      action: () => window.open('https://www.gms.pr.gov.br', '_blank', 'noopener,noreferrer'),
      tipo: 'Nível 1 · Atalho externo'
    },
    {
      id: 'eprotocolo',
      nome: 'e-Protocolo',
      descricao: 'eprotocolo.pr.gov.br',
      detalhe: 'Processos e tramitação digital',
      icon: FileText,
      iconColor: 'text-[#0072BB] dark:text-[#38BDF8]',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      action: () => window.open('https://www.eprotocolo.pr.gov.br', '_blank', 'noopener,noreferrer'),
      tipo: 'Nível 1 · Atalho externo'
    },
    {
      id: 'frota',
      nome: 'Gestão de Frota',
      descricao: 'Sistema interno SEJU',
      detalhe: 'Viaturas oficiais e agendamento',
      icon: Car,
      iconColor: 'text-blue-600 dark:text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      action: () => onOpenApp('frota'),
      tipo: 'Nível 3 · Integrado'
    },
    {
      id: 'email',
      nome: 'E-mail institucional',
      descricao: '@seju.pr.gov.br',
      detalhe: 'Google Workspace Corporativo',
      icon: Mail,
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      action: () => window.open('https://mail.google.com', '_blank', 'noopener,noreferrer'),
      tipo: 'Nível 1 · Atalho externo'
    },
    {
      id: 'gdrive',
      nome: 'Google Drive',
      descricao: 'drive.google.com',
      detalhe: 'Drives compartilhados do setor',
      icon: HardDrive,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      action: () => (onOpenPastas ? onOpenPastas() : window.open('https://drive.google.com', '_blank')),
      tipo: 'Nível 3 · Integrado'
    },
    {
      id: 'patrimonio',
      nome: 'Patrimônio',
      descricao: 'patrimonio.pr.gov.br',
      detalhe: 'Gestão de bens estaduais',
      icon: ShieldCheck,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      action: () => window.open('https://www.patrimonio.pr.gov.br', '_blank', 'noopener,noreferrer'),
      tipo: 'Nível 1 · Atalho externo'
    }
  ];

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 font-heading">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          Acesso rápido
        </h2>
        
        {onOpenSistemas && (
          <button
            type="button"
            onClick={onOpenSistemas}
            className="text-xs text-[var(--brand)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <Settings2 size={13} />
            <span>Escolher sistemas...</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {atalhos.map((at) => {
          const Icon = at.icon;
          return (
            <div
              key={at.id}
              onClick={at.action}
              className="group card-sheen p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card hover:border-[var(--brand)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 h-[125px]"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg ${at.iconBg} border flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <Icon size={16} className={at.iconColor} />
                </div>
                {at.tipo.includes('Integrado') ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)]" title="Módulo integrado" />
                ) : (
                  <ExternalLink size={12} className="text-[var(--text-subtle)] group-hover:text-[var(--text)] transition-colors" />
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors truncate font-heading">
                  {at.nome}
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                  {at.descricao}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
