import React from 'react';
import { 
  Car, 
  Wrench, 
  Calendar, 
  Plane, 
  PhoneCall, 
  LayoutGrid,
  Building2
} from 'lucide-react';
import { soundFX } from '../../services/soundFx';

interface InteractiveDockProps {
  activeApp: string;
  onNavigate: (appId: 'hub' | 'frota' | 'chamados' | 'salas' | 'diarias' | 'cense' | 'ramais' | 'auditoria', subTab?: string) => void;
  onOpenCommandPalette: () => void;
  pendentesChefiaCount?: number;
}

export const InteractiveDock: React.FC<InteractiveDockProps> = ({
  activeApp,
  onNavigate,
  pendentesChefiaCount = 0
}) => {
  const dockApps = [
    { id: 'hub', label: 'Início', icon: LayoutGrid },
    { id: 'frota', label: 'Frotas', icon: Car, badge: pendentesChefiaCount },
    { id: 'cense', label: 'CENSE', icon: Building2 },
    { id: 'chamados', label: 'TI', icon: Wrench },
    { id: 'salas', label: 'Salas', icon: Calendar },
    { id: 'diarias', label: 'Diárias', icon: Plane },
    { id: 'ramais', label: 'Ramais', icon: PhoneCall }
  ];

  const handleSelect = (id: any) => {
    soundFX.playClick();
    onNavigate(id);
  };

  return (
    <nav
      aria-label="Navegação Rápida Mobile"
      className="lg:hidden fixed bottom-2.5 inset-x-2.5 z-40 pointer-events-none font-sans select-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      {/* Floating Island Dock com Vidro Fosco de Alta Saturação e Borda Dupla Especular */}
      <div className="pointer-events-auto relative max-w-md mx-auto px-1.5 py-1.5 rounded-[26px] bg-white/88 backdrop-saturate-200 border border-white/95 ring-1 ring-slate-900/[0.08] shadow-[0_18px_42px_-8px_rgba(15,23,42,0.24),0_4px_14px_-2px_rgba(0,114,187,0.10),inset_0_1px_0_0_#ffffff]">
        
        {/* Reflexo Especular Institucional no Topo da Ilha */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] rounded-full bg-gradient-to-r from-[#0072BB]/45 via-[#009B54]/45 to-[#C59B27]/45"
        />

        <div className="grid grid-cols-7 items-center gap-0.5">
          {dockApps.map((app) => {
            const Icon = app.icon;
            const isActive = activeApp === app.id;

            return (
              <button
                key={app.id}
                onClick={() => handleSelect(app.id)}
                className={`group relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-90 border ${
                  isActive 
                    ? 'bg-gradient-to-b from-[#0072BB]/[0.12] to-[#0072BB]/[0.03] text-[#0072BB] border-[#0072BB]/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_6px_-1px_rgba(0,114,187,0.12)]' 
                    : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-100/60'
                }`}
              >
                {/* Halo Luminoso Sutil no Ícone Ativo */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1.5 w-6 h-6 rounded-full bg-[#0072BB]/15 blur-xs"
                  />
                )}

                <div className={`relative transition-transform duration-200 ${isActive ? '-translate-y-0.5' : 'group-hover:-translate-y-0.5'}`}>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.4 : 1.85}
                    className={isActive ? 'drop-shadow-[0_1px_3px_rgba(0,114,187,0.28)]' : ''}
                  />
                  {Boolean(app.badge && app.badge > 0) && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-2xs">
                      {app.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[9px] mt-1 tracking-tight leading-none transition-colors ${
                    isActive ? 'font-extrabold text-[#0072BB]' : 'font-semibold text-slate-500 group-hover:text-slate-800'
                  }`}
                >
                  {app.label}
                </span>

                {/* Indicador Luminoso Inferior em Cada Ícone Ativo */}
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="mt-1 w-3.5 h-1 rounded-full bg-gradient-to-r from-[#0072BB] to-[#009B54] shadow-[0_0_8px_rgba(0,114,187,0.85)]"
                  />
                ) : (
                  <span aria-hidden="true" className="mt-1 w-1 h-1 rounded-full bg-transparent group-hover:bg-slate-300 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
