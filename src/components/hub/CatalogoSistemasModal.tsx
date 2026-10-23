import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  Mail, 
  Calendar, 
  HardDrive, 
  Video, 
  PhoneCall, 
  Globe, 
  FileText, 
  Package, 
  Car, 
  Briefcase, 
  CalendarDays, 
  Coins, 
  ShieldCheck, 
  Headphones,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { AppModuleId } from './AppLauncherHub';

interface CatalogoSistemasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: AppModuleId, subTab?: string) => void;
  setor?: string;
}

interface SistemaItem {
  id: string;
  nome: string;
  categoria: 'Comunicação e colaboração' | 'Administrativo e gestão' | 'Finalísticos e segurança';
  descricao: string;
  nivel: 'Nível 1 · Atalho' | 'Nível 2 · Contexto' | 'Nível 3 · Integrado';
  emLevantamento?: boolean;
  appId?: AppModuleId;
  url?: string;
  doSetor?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const CatalogoSistemasModal: React.FC<CatalogoSistemasModalProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  setor = 'NAS'
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'liberados' | 'setor' | 'transversais' | 'todos'>('liberados');
  const [busca, setBusca] = useState('');

  if (!isOpen) return null;

  const sistemas: SistemaItem[] = [
    // Comunicação e colaboração
    {
      id: 'agenda',
      nome: 'Agenda integrada',
      categoria: 'Comunicação e colaboração',
      descricao: 'Compromissos, pautas de salas e audiências compartilhadas no Google Workspace.',
      nivel: 'Nível 3 · Integrado',
      appId: 'salas',
      icon: Calendar
    },
    {
      id: 'email-corp',
      nome: 'E-mail institucional',
      categoria: 'Comunicação e colaboração',
      descricao: 'Caixa de entrada direta da sua conta Google corporativa @seju.pr.gov.br.',
      nivel: 'Nível 1 · Atalho',
      url: 'https://mail.google.com',
      icon: Mail
    },
    {
      id: 'gdrive-shared',
      nome: 'Google Drive do Setor',
      categoria: 'Comunicação e colaboração',
      descricao: 'Drives compartilhados com os documentos e planilhas oficiais do seu setor.',
      nivel: 'Nível 3 · Integrado',
      url: 'https://drive.google.com',
      doSetor: true,
      icon: HardDrive
    },
    {
      id: 'meet',
      nome: 'Google Meet',
      categoria: 'Comunicação e colaboração',
      descricao: 'Videoconferências e reuniões com gravação e link direto nas salas virtuais.',
      nivel: 'Nível 1 · Atalho',
      url: 'https://meet.google.com',
      icon: Video
    },
    {
      id: 'ramais-tel',
      nome: 'Ramais e contatos',
      categoria: 'Comunicação e colaboração',
      descricao: 'Diretório telefônico e busca rápida de servidores da Sede Hauer e regionais.',
      nivel: 'Nível 3 · Integrado',
      appId: 'ramais',
      icon: PhoneCall
    },
    {
      id: 'site-seju',
      nome: 'Site da SEJU',
      categoria: 'Comunicação e colaboração',
      descricao: 'Portal institucional público de notícias e serviços do Governo do Paraná.',
      nivel: 'Nível 1 · Atalho',
      url: 'https://www.justica.pr.gov.br',
      icon: Globe
    },

    // Administrativo e gestão
    {
      id: 'eprotocolo-gov',
      nome: 'e-Protocolo Digital',
      categoria: 'Administrativo e gestão',
      descricao: 'Abertura, tramitação e assinatura digital de processos administrativos do Estado.',
      nivel: 'Nível 2 · Contexto',
      url: 'https://www.eprotocolo.pr.gov.br',
      icon: FileText
    },
    {
      id: 'gms-compras',
      nome: 'GMS - Gestão de Materiais e Serviços',
      categoria: 'Administrativo e gestão',
      descricao: 'Pedidos de compra, termos de contrato e requisições de estoque para a Secretaria.',
      nivel: 'Nível 1 · Atalho',
      url: 'https://www.gms.pr.gov.br',
      doSetor: true,
      icon: Package
    },
    {
      id: 'frotas-modulo',
      nome: 'Gestão de Frotas & Viaturas',
      categoria: 'Administrativo e gestão',
      descricao: 'Agendamento de veículos, vistoria pericial fotográfica e despacho da Chefia.',
      nivel: 'Nível 3 · Integrado',
      appId: 'frota',
      doSetor: true,
      icon: Car
    },
    {
      id: 'diarias-calc',
      nome: 'Calculadora de Diárias (Decreto 1.428)',
      categoria: 'Administrativo e gestão',
      descricao: 'Cálculo de indenização de viagens com mapa interativo do Paraná e recibos oficiais.',
      nivel: 'Nível 3 · Integrado',
      appId: 'diarias',
      icon: Briefcase
    },
    {
      id: 'salas-reserva',
      nome: 'Reserva de Salas & Auditório',
      categoria: 'Administrativo e gestão',
      descricao: 'Painel visual de salas de reunião da Sede com prevenção automática de conflitos.',
      nivel: 'Nível 3 · Integrado',
      appId: 'salas',
      icon: CalendarDays
    },
    {
      id: 'patrimonio-est',
      nome: 'Patrimônio do Estado',
      categoria: 'Administrativo e gestão',
      descricao: 'Inventário de computadores, mobiliário e termos de responsabilidade predial.',
      nivel: 'Nível 1 · Atalho',
      url: 'https://www.patrimonio.pr.gov.br',
      emLevantamento: true,
      icon: ShieldCheck
    },

    // Finalísticos e segurança
    {
      id: 'cense-fundo',
      nome: 'Fundo Rotativo CENSE (19 Unidades)',
      categoria: 'Finalísticos e segurança',
      descricao: 'Scanner de DANFE 44 dígitos, controle das rubricas 33.90.30/39 e TCE-PR.',
      nivel: 'Nível 3 · Integrado',
      appId: 'cense',
      icon: Coins
    },
    {
      id: 'chamados-ti',
      nome: 'Central de Chamados TI',
      categoria: 'Finalísticos e segurança',
      descricao: 'Atendimento N1/N2, suporte a redes, impressoras e conectividade da SEJU.',
      nivel: 'Nível 3 · Integrado',
      appId: 'chamados',
      doSetor: setor.toUpperCase().includes('UTEC'),
      icon: Headphones
    },
    {
      id: 'auditoria-sha',
      nome: 'Trilha de Auditoria SHA-256',
      categoria: 'Finalísticos e segurança',
      descricao: 'Cofre criptográfico seguro com carimbos de tempo e anonimização de dados LGPD.',
      nivel: 'Nível 3 · Integrado',
      appId: 'auditoria' as any,
      icon: ShieldCheck
    }
  ];

  const sistemasFiltrados = sistemas.filter((s) => {
    // Filtro por aba
    if (abaAtiva === 'setor' && !s.doSetor) return false;
    if (abaAtiva === 'transversais' && s.doSetor) return false;

    // Filtro por texto
    if (!busca) return true;
    const term = busca.toLowerCase();
    return s.nome.toLowerCase().includes(term) || s.descricao.toLowerCase().includes(term) || s.categoria.toLowerCase().includes(term);
  });

  const categorias = Array.from(new Set(sistemasFiltrados.map((s) => s.categoria)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-2xl flex flex-col overflow-hidden text-[var(--text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Catálogo */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand)]" />
              <h2 className="text-lg font-bold tracking-tight font-heading">
                Catálogo de Sistemas · Justiça 2.0
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Catálogo oficial de sistemas governamentais, ferramentas setoriais e módulos integrados da SEJU-PR.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition cursor-pointer"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de Filtros por Aba & Campo de Pesquisa (Slide 5) */}
        <div className="px-6 py-3.5 border-b border-[var(--border)] space-y-3 bg-[var(--surface)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Abas de Navegação */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 text-xs">
              <button
                type="button"
                onClick={() => setAbaAtiva('liberados')}
                className={`px-3 py-1.5 rounded-[var(--radius-md)] font-medium transition cursor-pointer shrink-0 ${
                  abaAtiva === 'liberados'
                    ? 'bg-[var(--brand)] text-white shadow-2xs font-semibold'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                }`}
              >
                Liberados para você (17)
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva('setor')}
                className={`px-3 py-1.5 rounded-[var(--radius-md)] font-medium transition cursor-pointer shrink-0 ${
                  abaAtiva === 'setor'
                    ? 'bg-[var(--brand)] text-white shadow-2xs font-semibold'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                }`}
              >
                Do seu setor ({setor})
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva('transversais')}
                className={`px-3 py-1.5 rounded-[var(--radius-md)] font-medium transition cursor-pointer shrink-0 ${
                  abaAtiva === 'transversais'
                    ? 'bg-[var(--brand)] text-white shadow-2xs font-semibold'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                }`}
              >
                Transversais (8)
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva('todos')}
                className={`px-3 py-1.5 rounded-[var(--radius-md)] font-medium transition cursor-pointer shrink-0 ${
                  abaAtiva === 'todos'
                    ? 'bg-[var(--brand)] text-white shadow-2xs font-semibold'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                }`}
              >
                Catálogo completo (31)
              </button>
            </div>

            {/* Input de Busca */}
            <div className="relative min-w-[220px]">
              <input
                type="text"
                placeholder="Filtrar por nome ou assunto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--brand)]"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
            </div>
          </div>
        </div>

        {/* Lista Categorizada de Sistemas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {categorias.length === 0 ? (
            <div className="text-center py-10 text-xs text-[var(--text-muted)]">
              Nenhum sistema encontrado com os filtros selecionados.
            </div>
          ) : (
            categorias.map((cat) => {
              const sistemasDaCat = sistemasFiltrados.filter((s) => s.categoria === cat);
              return (
                <div key={cat} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 font-heading">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand)]" />
                    {cat}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sistemasDaCat.map((sis) => {
                      const Icon = sis.icon;
                      return (
                        <div
                          key={sis.id}
                          onClick={() => {
                            if (sis.appId) {
                              onOpenApp(sis.appId);
                              onClose();
                            } else if (sis.url) {
                              window.open(sis.url, '_blank');
                            }
                          }}
                          className="group p-3.5 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--brand)] rounded-[var(--radius-lg)] shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--brand)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Icon size={16} />
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors font-heading">
                                    {sis.nome}
                                  </h4>
                                  {sis.emLevantamento && (
                                    <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                                      Em levantamento
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                                  {sis.descricao}
                                </p>
                              </div>
                            </div>

                            {sis.url ? (
                              <ExternalLink size={13} className="text-[var(--text-subtle)] shrink-0 group-hover:text-[var(--brand)]" />
                            ) : (
                              <CheckCircle2 size={13} className="text-[var(--brand)] shrink-0" />
                            )}
                          </div>

                          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px]">
                            <span className="font-mono text-[var(--text-muted)]">{sis.nivel}</span>
                            <span className="text-[var(--brand)] font-semibold flex items-center gap-0.5 group-hover:underline">
                              {sis.appId ? 'Abrir no Portal' : 'Acessar link'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé Informativo (Slide 5: O selo 'Em levantamento' marca o que a semana de visitas vai completar) */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-2)]/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-[var(--brand)]" />
            <span>Dados reais da lista de ramais da SEJU. O selo “Em levantamento” marca integrações em visitação técnica.</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[var(--text)] hover:underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
