import React from 'react';
import { Layers, FolderGit2, Bell, Headphones, ArrowUpRight } from 'lucide-react';

interface IndicadoresStripProps {
  onOpenSistemas?: () => void;
  onOpenPastas?: () => void;
  onOpenChamados?: () => void;
  setor?: string;
}

export const IndicadoresStrip: React.FC<IndicadoresStripProps> = ({
  onOpenSistemas,
  onOpenPastas,
  onOpenChamados,
  setor = 'NAS'
}) => {
  const isNas = setor.toUpperCase().includes('NAS');
  const isUtec = setor.toUpperCase().includes('UTEC');

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 select-none">
      
      {/* 1. Sistemas Liberados */}
      <div 
        onClick={onOpenSistemas}
        className="card-sheen p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card hover:border-[var(--brand)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2"
      >
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-muted)]">Sistemas liberados</span>
          <div className="w-6 h-6 rounded-md bg-blue-500/10 text-[var(--brand)] flex items-center justify-center">
            <Layers size={13} />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)] font-heading tabular-nums">
            17
          </div>
          <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
            {isNas ? '4 do seu setor (NAS)' : isUtec ? '5 do seu setor (UTEC)' : '4 do seu setor'}
          </div>
        </div>
      </div>

      {/* 2. Pastas e Drives */}
      <div 
        onClick={onOpenPastas}
        className="card-sheen p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card hover:border-[var(--brand)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2"
      >
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-muted)]">Pastas e drives</span>
          <div className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <FolderGit2 size={13} />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)] font-heading tabular-nums">
            8
          </div>
          <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 truncate">
            S: - Rede SEJU / G Drive
          </div>
        </div>
      </div>

      {/* 3. Avisos */}
      <div 
        className="card-sheen p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card hover:border-[var(--brand)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2"
      >
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-muted)]">Avisos</span>
          <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Bell size={13} />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)] font-heading tabular-nums">
            6
          </div>
          <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">
            1 urgente da sua chefia
          </div>
        </div>
      </div>

      {/* 4. Chamados em Aberto */}
      <div 
        onClick={onOpenChamados}
        className="card-sheen p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-gov-card hover:border-[var(--brand)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2"
      >
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-muted)]">Chamados em aberto</span>
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Headphones size={13} />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)] font-heading tabular-nums">
            4
          </div>
          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
            Nenhum restante hoje
          </div>
        </div>
      </div>

    </div>
  );
};
