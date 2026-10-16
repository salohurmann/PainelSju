import React, { useState } from 'react';
import { 
  Car, 
  Wrench, 
  Calendar, 
  Plane, 
  PhoneCall, 
  ShieldCheck, 
  LayoutGrid, 
  Search, 
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { soundFX } from '../../services/soundFx';

interface InteractiveDockProps {
  activeApp: string;
  onNavigate: (appId: 'hub' | 'frota' | 'chamados' | 'salas' | 'diarias' | 'ramais' | 'auditoria', subTab?: string) => void;
  onOpenCommandPalette: () => void;
  pendentesChefiaCount?: number;
}

export const InteractiveDock: React.FC<InteractiveDockProps> = ({
  activeApp,
  onNavigate,
  onOpenCommandPalette,
  pendentesChefiaCount = 0
}) => {
  const [minimizada, setMinimizada] = useState(false);

  const dockApps = [
    { id: 'hub', label: 'Central de Apps', icon: LayoutGrid, color: 'text-white' },
    { id: 'frota', label: 'Gestão de Frotas', icon: Car, color: 'text-blue-400', badge: pendentesChefiaCount },
    { id: 'chamados', label: 'Chamados TI', icon: Wrench, color: 'text-indigo-400' },
    { id: 'salas', label: 'Reserva de Salas', icon: Calendar, color: 'text-emerald-400' },
    { id: 'diarias', label: 'Diárias & Viagens', icon: Plane, color: 'text-amber-400' },
    { id: 'ramais', label: 'Guia de Ramais', icon: PhoneCall, color: 'text-sky-400' },
    { id: 'auditoria', label: 'Auditoria SHA-256', icon: ShieldCheck, color: 'text-emerald-300' }
  ];

  const handleSelect = (id: any) => {
    soundFX.playClick();
    onNavigate(id);
  };

  if (minimizada) {
    return (
      <div className="fixed bottom-safe left-1/2 -translate-x-1/2 z-40 animate-in fade-in">
        <button
          onClick={() => {
            soundFX.playClick();
            setMinimizada(false);
          }}
          className="bg-slate-900/90 text-white hover:bg-[#0072BB] px-3.5 py-2 sm:p-2.5 rounded-full shadow-2xl border border-white/20 backdrop-blur-md flex items-center gap-2 text-xs font-bold transition cursor-pointer active:scale-95"
          title="Expandir barra de navegação interativa"
        >
          <LayoutGrid size={16} />
          <span className="text-xs font-bold">Navegação</span>
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-safe left-1/2 -translate-x-1/2 z-40 font-sans select-none animate-in slide-in-from-bottom-4 duration-300 max-w-[calc(100vw-16px)]">
      
      {/* Container Principal do Dock Flutuante */}
      <div className="bg-slate-950/90 backdrop-blur-xl border border-white/15 p-1.5 sm:p-2 rounded-2xl sm:rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar max-w-full touch-pan-x">
        
        {/* Botão de Busca Rápida (Command Palette) */}
        <button
          onClick={() => {
            soundFX.playClick();
            onOpenCommandPalette();
          }}
          className="group relative p-2 sm:p-3 rounded-xl sm:rounded-full hover:bg-white/15 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 active:scale-95 min-w-[36px] sm:min-w-[44px]"
          title="Buscar ou executar comando rápido (Ctrl+K)"
        >
          <Search size={18} className="group-hover:scale-115 transition-transform" />
          
          {/* Tooltip Desktop */}
          <div className="hidden sm:block absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md">
            Busca Rápida (Ctrl+K)
          </div>
        </button>

        <div className="h-5 sm:h-6 w-px bg-white/15 shrink-0" />

        {/* Aplicativos do Dock */}
        {dockApps.map((app) => {
          const Icon = app.icon;
          const isActive = activeApp === app.id;

          return (
            <button
              key={app.id}
              onClick={() => handleSelect(app.id)}
              className={`group relative p-2 sm:p-3 rounded-xl sm:rounded-full transition-all duration-200 cursor-pointer flex flex-col items-center justify-center shrink-0 active:scale-95 min-w-[36px] sm:min-w-[44px] ${
                isActive 
                  ? 'bg-white/20 text-white shadow-inner scale-105' 
                  : 'hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={18} className={`group-hover:scale-125 transition-transform duration-200 sm:w-5 sm:h-5 ${isActive ? 'text-white' : app.color}`} />

              {/* Indicador de App Ativo (Ponto de luz sob o ícone) */}
              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#00AEEF] rounded-full mt-0.5 sm:mt-1 shadow-[0_0_8px_#00AEEF] animate-pulse" />
              )}

              {/* Badge de Alertas / Pendências */}
              {Boolean(app.badge && app.badge > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                  {app.badge}
                </span>
              )}

              {/* Tooltip Desktop */}
              <div className="hidden sm:block absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md">
                {app.label}
              </div>
            </button>
          );
        })}

        <div className="h-5 sm:h-6 w-px bg-white/15 shrink-0" />

        {/* Botão de Minimizar */}
        <button
          onClick={() => {
            soundFX.playClick();
            setMinimizada(true);
          }}
          className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer shrink-0 active:scale-95"
          title="Recolher barra inferior"
        >
          <ChevronDown size={16} />
        </button>

      </div>
    </div>
  );
};
