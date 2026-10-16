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
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] font-sans select-none pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto px-1.5 h-15 grid grid-cols-7 items-center">
        {dockApps.map((app) => {
          const Icon = app.icon;
          const isActive = activeApp === app.id;

          return (
            <button
              key={app.id}
              onClick={() => handleSelect(app.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                isActive 
                  ? 'text-[#0072BB]' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                {Boolean(app.badge && app.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white">
                    {app.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] mt-1 tracking-tight leading-none ${isActive ? 'font-bold text-[#0072BB]' : 'font-medium text-slate-500'}`}>
                {app.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-5 h-0.5 bg-[#0072BB] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
