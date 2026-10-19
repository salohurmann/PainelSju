import React from 'react';
import { Search, Sparkles, Building2, UserCheck, ShieldCheck } from 'lucide-react';
import { Usuario } from '../../types';

interface HeroJustica20Props {
  currentUser: Usuario;
  onSwitchUser?: (user: Usuario) => void;
  usuariosDisponiveis?: Usuario[];
  onOpenCommandPalette?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const HeroJustica20: React.FC<HeroJustica20Props> = ({
  currentUser,
  onSwitchUser,
  usuariosDisponiveis = [],
  onOpenCommandPalette,
  searchQuery = '',
  onSearchChange
}) => {
  const primeiroNome = currentUser.nome.split(' ')[0];
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  // Descrição do setor baseada na apresentação oficial do Justiça 2.0
  const isNas = currentUser.setor.toUpperCase().includes('NAS');
  const isUtec = currentUser.setor.toUpperCase().includes('UTEC') || currentUser.setor.toUpperCase().includes('TECNOLOGIA');

  const descricaoSetor = isNas
    ? 'Núcleo Administrativo Setorial: sistemas, pastas e avisos da sua lotação, reunidos a partir do seu login.'
    : isUtec
    ? 'Unidade Técnica de Sistemas, de Informação e Tecnologia: sistemas, pastas e avisos da sua lotação, reunidos a partir do seu login.'
    : `${currentUser.setor}: sistemas, pastas e avisos da sua lotação, reunidos a partir do seu e-mail institucional @seju.pr.gov.br.`;

  const tagLotacao = isNas ? 'NAS' : isUtec ? 'UTEC' : currentUser.setor;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#002847] via-[#00385E] to-[#0A4B75] text-white border border-[#144770]/60 shadow-lg select-none">
      {/* Background Decorativo / Iluminação Sutil */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.18)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-96 h-96 rounded-full bg-[#0072BB]/20 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between">
        
        {/* Lado Esquerdo: Identificação da Lotação, Saudação e Busca Integrada */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            {/* Tag da Lotação do Servidor */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold tracking-wide text-sky-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LOTAÇÃO: {tagLotacao}</span>
            </div>

            {/* Saudação com o Primeiro Nome (ex.: "Boa noite, Lúcia." ou "Boa tarde, Otávio.") */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-heading">
                {saudacao}, {primeiroNome}.
              </h1>
              <p className="text-xs sm:text-sm text-sky-100/90 mt-1.5 max-w-xl leading-relaxed">
                {descricaoSetor}
              </p>
            </div>
          </div>

          {/* Campo de Busca Integrado no Banner (conforme apresentação Justiça 2.0) */}
          <div className="space-y-2.5 pt-1">
            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder="O que você procura? Ex.: contracheque, pasta do seu setor, diárias"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={() => {
                  if (onOpenCommandPalette && !searchQuery) {
                    // foco suave
                  }
                }}
                className="w-full h-11 sm:h-12 pl-11 pr-24 bg-white/95 text-slate-900 placeholder:text-slate-500 text-xs sm:text-sm rounded-xl border border-white/20 shadow-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:bg-white transition-all font-sans"
              />
              <Search size={18} className="absolute left-3.5 top-3 sm:top-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => onOpenCommandPalette?.()}
                className="absolute right-2 top-2 sm:top-2.5 px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                title="Abrir busca global rápida (Ctrl+K)"
              >
                <span>Ctrl</span>
                <span>K</span>
              </button>
            </div>

            {/* Alternador Rápido de Setores (O mesmo portal, dois setores: Lúcia NAS vs Otávio UTEC) */}
            {usuariosDisponiveis.length > 0 && onSwitchUser && (
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-sky-200/90 pt-1">
                <span className="font-medium opacity-80">Alternar setor (Justiça 2.0):</span>
                {usuariosDisponiveis.slice(0, 3).map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const labelCurto = u.setor.includes('NAS') ? 'Lúcia · NAS' : u.setor.includes('UTEC') ? 'Otávio · UTEC' : u.nome.split(' ')[0];
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onSwitchUser(u)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                        isCurrent
                          ? 'bg-white text-[#00385E] border-white font-bold shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 border-white/20 text-sky-100'
                      }`}
                    >
                      {isCurrent && <UserCheck size={11} />}
                      <span>{labelCurto}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Estufa do Jardim Botânico de Curitiba & Araucárias (Símbolo Oficial do Paraná) */}
        <div className="relative w-full lg:w-[320px] xl:w-[380px] shrink-0 min-h-[170px] lg:min-h-full flex items-end justify-end overflow-hidden">
          {/* Máscara de Transparência que mescla a imagem suavemente com o azul escuro da esquerda */}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#002847] via-transparent to-black/30 z-10 pointer-events-none" />

          {/* Arte Vetorial Panorâmica do Jardim Botânico de Curitiba com iluminação noturna/crepúsculo */}
          <svg
            viewBox="0 0 380 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover select-none pointer-events-none opacity-85"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="220" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0B2B4C" />
                <stop offset="60%" stopColor="#124676" />
                <stop offset="100%" stopColor="#256B9E" />
              </linearGradient>
              <linearGradient id="domeGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="glassLight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#7DD3FC" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Céu de Crepúsculo */}
            <rect width="380" height="220" fill="url(#skyGrad)" />

            {/* Estrelas / Pontos de Luz */}
            <circle cx="80" cy="30" r="1" fill="#FFFFFF" opacity="0.6" />
            <circle cx="150" cy="45" r="1.5" fill="#FFFFFF" opacity="0.8" />
            <circle cx="280" cy="25" r="1" fill="#FFFFFF" opacity="0.5" />
            <circle cx="340" cy="50" r="1.5" fill="#FFFFFF" opacity="0.7" />

            {/* Silhueta da Araucária (Pinheiro do Paraná) à esquerda da estufa */}
            <g opacity="0.75" stroke="#061B2E" strokeWidth="2.5" fill="#061B2E">
              {/* Tronco */}
              <path d="M70 220 L73 105" strokeWidth="3" />
              {/* Galhos em taça característicos */}
              <path d="M73 125 Q60 110 50 112 Q45 105 48 95" fill="none" strokeWidth="2" />
              <path d="M73 120 Q85 108 95 110 Q100 102 96 92" fill="none" strokeWidth="2" />
              <path d="M73 110 Q65 95 55 96 Q50 90 52 82" fill="none" strokeWidth="2" />
              <path d="M73 105 Q70 85 73 80" fill="none" strokeWidth="2" />
              {/* Copas horizontais densas */}
              <ellipse cx="48" cy="95" rx="14" ry="4" />
              <ellipse cx="96" cy="92" rx="14" ry="4" />
              <ellipse cx="52" cy="82" rx="11" ry="3.5" />
              <ellipse cx="73" cy="78" rx="16" ry="4.5" />
            </g>

            {/* Silhueta da segunda Araucária à direita */}
            <g opacity="0.6" stroke="#08233C" strokeWidth="2" fill="#08233C">
              <path d="M335 220 L337 125" strokeWidth="2.5" />
              <path d="M337 140 Q325 125 315 126" fill="none" />
              <path d="M337 135 Q348 123 358 125" fill="none" />
              <ellipse cx="315" cy="122" rx="12" ry="3.5" />
              <ellipse cx="358" cy="120" rx="12" ry="3.5" />
              <ellipse cx="337" cy="112" rx="14" ry="4" />
            </g>

            {/* Gramado / Jardins Franceses geométricos em primeiro plano */}
            <path d="M0 220 Q190 195 380 220 L380 220 L0 220 Z" fill="#051727" opacity="0.95" />
            <path d="M60 220 Q190 205 320 220" stroke="#0072BB" strokeWidth="1.5" opacity="0.4" fill="none" />

            {/* A Famosa Estufa de Ferro e Vidro do Jardim Botânico de Curitiba */}
            {/* Base com degraus */}
            <rect x="120" y="185" width="160" height="8" rx="1" fill="#072038" stroke="#38BDF8" strokeWidth="0.8" opacity="0.8" />
            <rect x="130" y="177" width="140" height="8" rx="1" fill="#0A2A4A" stroke="#38BDF8" strokeWidth="0.8" opacity="0.9" />

            {/* Galeria Central e Cúpulas de Vidro Iluminadas */}
            {/* Cúpula Esquerda */}
            <path d="M140 177 V145 Q140 120 160 120 Q180 120 180 145 V177 Z" fill="url(#glassLight)" stroke="#7DD3FC" strokeWidth="1.2" />
            {/* Nervuras da Cúpula Esquerda */}
            <path d="M160 120 V177" stroke="#38BDF8" strokeWidth="0.8" opacity="0.8" />
            <path d="M140 145 H180" stroke="#38BDF8" strokeWidth="0.8" opacity="0.7" />
            <path d="M143 160 H177" stroke="#38BDF8" strokeWidth="0.8" opacity="0.7" />

            {/* Cúpula Direita */}
            <path d="M220 177 V145 Q220 120 240 120 Q260 120 260 145 V177 Z" fill="url(#glassLight)" stroke="#7DD3FC" strokeWidth="1.2" />
            {/* Nervuras da Cúpula Direita */}
            <path d="M240 120 V177" stroke="#38BDF8" strokeWidth="0.8" opacity="0.8" />
            <path d="M220 145 H260" stroke="#38BDF8" strokeWidth="0.8" opacity="0.7" />
            <path d="M223 160 H257" stroke="#38BDF8" strokeWidth="0.8" opacity="0.7" />

            {/* Cúpula Principal (Central, Mais Alta e Imponente) */}
            <path d="M175 177 V135 Q175 95 200 95 Q225 95 225 135 V177 Z" fill="url(#glassLight)" stroke="#BAE6FD" strokeWidth="1.5" />
            {/* Brilho da Luz Noturna interna da Cúpula Maior */}
            <ellipse cx="200" cy="145" rx="18" ry="25" fill="url(#domeGlow)" />
            {/* Nervuras da Cúpula Maior */}
            <path d="M200 95 V177" stroke="#E0F2FE" strokeWidth="1.2" opacity="0.9" />
            <path d="M178 125 Q200 115 222 125" stroke="#7DD3FC" strokeWidth="1" fill="none" opacity="0.85" />
            <path d="M175 145 H225" stroke="#7DD3FC" strokeWidth="1" opacity="0.85" />
            <path d="M175 162 H225" stroke="#7DD3FC" strokeWidth="1" opacity="0.85" />

            {/* Pináculo no topo da Cúpula Central */}
            <line x1="200" y1="95" x2="200" y2="85" stroke="#FDE047" strokeWidth="1.5" />
            <circle cx="200" cy="85" r="2" fill="#FDE047" />

            {/* Reflexo no Espelho d'Água do Jardim */}
            <ellipse cx="200" cy="208" rx="65" ry="5" fill="#38BDF8" opacity="0.25" />
          </svg>

          {/* Legenda de Localização no Canto Inferior Direito (como no protótipo original) */}
          <div className="absolute bottom-2.5 right-3.5 z-20 px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs border border-white/10 text-[9px] font-mono text-white/80">
            Jardim Botânico · Curitiba/PR
          </div>
        </div>

      </div>
    </div>
  );
};
