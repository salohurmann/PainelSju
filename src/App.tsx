import React, { useState, useEffect, useRef } from 'react';
import { 
  Agendamento, 
  Veiculo, 
  Vistoria, 
  AuditoriaLog, 
  Usuario 
} from './types';
import { 
  loadInitialState, 
  saveStateToStorage 
} from './services/store';
import { 
  notifyManagerNewRequest, 
  notifyUserApproved, 
  notifyUserRejected 
} from './services/notifications';
import { eventBus } from './services/eventBus';
import { crossCuttingService } from './services/crossCuttingService';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AppLauncherHub, AppModuleId } from './components/hub/AppLauncherHub';
import { NovaSolicitacaoForm } from './components/frota/NovaSolicitacaoForm';
import { FilaAprovacao } from './components/frota/FilaAprovacao';
import { CheckinCheckoutVistoria } from './components/frota/CheckinCheckoutVistoria';
import { PainelFrota } from './components/frota/PainelFrota';
import { ConsultaCpf } from './components/frota/ConsultaCpf';
import { TrilhaAuditoria } from './components/auditoria/TrilhaAuditoria';
import { ChamadosKanban } from './components/chamados/ChamadosKanban';
import { ReservaSalasView } from './components/salas/ReservaSalasView';
import { CalculadoraDiariasView } from './components/diarias/CalculadoraDiariasView';
import { GuiaRamaisView } from './components/ramais/GuiaRamaisView';
import { FundoRotativoCenseView } from './components/cense/FundoRotativoCenseView';
import { CommandPalette } from './components/navigation/CommandPalette';
import { HotkeysHelpModal } from './components/navigation/HotkeysHelpModal';
import { useSmartPolling } from './hooks/useSmartPolling';
import { Toast, ToastItem } from './components/ui/Toast';
import { Tabs } from './components/ui/Tabs';
import { Button } from './components/ui/Button';
import { 
  Car, 
  CheckSquare, 
  ClipboardCheck, 
  Search, 
  ArrowLeft,
  PlusCircle,
  ShieldCheck,
  MapPin,
  Lock
} from 'lucide-react';

export type FrotaSubTab = 
  | 'visao-geral'
  | 'nova-solicitacao'
  | 'aprovacoes'
  | 'checkin-checkout'
  | 'frota'
  | 'consultar';

export function App() {
  const [state, setState] = useState(() => loadInitialState());
  const [activeApp, setActiveApp] = useState<'hub' | AppModuleId | 'auditoria'>('hub');
  const [frotaTab, setFrotaTab] = useState<FrotaSubTab>('nova-solicitacao');
  const [toast, setToast] = useState<ToastItem | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [hotkeysHelpOpen, setHotkeysHelpOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pendingGKeyRef = useRef(false);
  const pendingGTimerRef = useRef<number | null>(null);

  // Sistema Global de Atalhos de Teclado (Ctrl+K, ?, Esc, G+H, G+F, etc.)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 1. Ctrl+K ou Cmd+K sempre abre/fecha Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        return;
      }

      // 2. Esc fecha qualquer overlay ativo
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setMobileSidebarOpen(false);
        setHotkeysHelpOpen(false);
        return;
      }

      // Se o foco estiver em campo de texto, não dispara atalhos de navegação
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // 3. ? ou Shift+/ abre modal de ajuda de atalhos
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setHotkeysHelpOpen(prev => !prev);
        return;
      }

      // 4. Sequência G + tecla (Go To)
      const key = e.key.toLowerCase();
      if (key === 'g' && !pendingGKeyRef.current) {
        pendingGKeyRef.current = true;
        if (pendingGTimerRef.current) clearTimeout(pendingGTimerRef.current);
        pendingGTimerRef.current = window.setTimeout(() => {
          pendingGKeyRef.current = false;
        }, 1200);
        return;
      }

      if (pendingGKeyRef.current) {
        pendingGKeyRef.current = false;
        if (pendingGTimerRef.current) clearTimeout(pendingGTimerRef.current);

        switch (key) {
          case 'h':
            e.preventDefault();
            setActiveApp('hub');
            break;
          case 'f':
            e.preventDefault();
            setActiveApp('frota');
            break;
          case 'c':
            e.preventDefault();
            setActiveApp('chamados');
            break;
          case 's':
            e.preventDefault();
            setActiveApp('salas');
            break;
          case 'd':
            e.preventDefault();
            setActiveApp('diarias');
            break;
          case 'r':
            e.preventDefault();
            setActiveApp('cense');
            break;
          case 't':
            e.preventDefault();
            setActiveApp('ramais');
            break;
          case 'a':
            e.preventDefault();
            setActiveApp('auditoria');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      if (pendingGTimerRef.current) clearTimeout(pendingGTimerRef.current);
    };
  }, []);

  // Polling Inteligente (30s) com pausa imediata em abas em segundo plano
  useSmartPolling(() => {
    try {
      const persisted = localStorage.getItem('seju_gestao_integrada_v2');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed.agendamentos && parsed.agendamentos.length !== state.agendamentos.length) {
          setState(prev => ({ ...prev, agendamentos: parsed.agendamentos }));
        }
      }
    } catch {
      // Ignora falhas pontuais de leitura
    }
  }, 30000, true);

  // Inicialização e Assinatura do Barramento de Eventos Transversais
  useEffect(() => {
    crossCuttingService.init();
    const unsubLog = crossCuttingService.onLog((log) => {
      setState(prev => {
        if (prev.logs.some(l => l.id === log.id)) return prev;
        return { ...prev, logs: [log, ...prev.logs] };
      });
    });
    const unsubNotif = crossCuttingService.onNotificacao((notif) => {
      setState(prev => {
        if (prev.notificacoes.some(n => n.id === notif.id)) return prev;
        return { ...prev, notificacoes: [notif, ...prev.notificacoes] };
      });
    });
    return () => {
      unsubLog();
      unsubNotif();
    };
  }, []);

  // Sincroniza estado com o LocalStorage
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  const showToast = (title: string, message?: string, variant: 'success' | 'danger' | 'warning' | 'info' = 'success') => {
    const newToast: ToastItem = {
      id: String(Date.now()),
      title,
      message,
      variant
    };
    setToast(newToast);
    setTimeout(() => {
      setToast(prev => (prev?.id === newToast.id ? null : prev));
    }, 4000);
  };

  // Alternar Usuário / Papel
  const handleSwitchUser = (user: Usuario) => {
    setState(prev => ({ ...prev, currentUser: user }));
    showToast('Perfil alterado', `Conectado como ${user.nome} (${user.cargo})`, 'info');
  };

  // Abrir Aplicativo do Hub
  const handleOpenApp = (appId: 'hub' | AppModuleId | 'auditoria', subTab?: string) => {
    setActiveApp(appId);
    if (appId === 'frota' && subTab) {
      setFrotaTab(subTab as FrotaSubTab);
    }
  };

  // Enviar Nova Solicitação de Veículo
  const handleNovaSolicitacao = async (novoAg: Agendamento) => {
    setState(prev => ({
      ...prev,
      agendamentos: [novoAg, ...prev.agendamentos]
    }));

    eventBus.emit('viatura.solicitada', {
      agendamentoId: novoAg.id,
      veiculoPlaca: novoAg.veiculoPlaca,
      solicitante: state.currentUser.nome,
      cpfSolicitante: state.currentUser.cpf,
      destino: novoAg.destino,
      ticket: novoAg.ticket
    });

    showToast('Solicitação registrada', `Ticket ${novoAg.ticket} aguarda despacho da Chefia.`, 'success');
  };

  // Aprovação de Missão (Chefia)
  const handleAprovar = async (agId: string, hash: string, aprovador: Usuario) => {
    const ag = state.agendamentos.find(a => a.id === agId);
    if (!ag) return;

    const agAprovado: Agendamento = {
      ...ag,
      status: 'aprovado',
      aprovadorNome: aprovador.nome,
      aprovadorCpf: aprovador.cpf,
      aprovadoEm: new Date().toISOString(),
      hashAuditoria: hash
    };

    setState(prev => ({
      ...prev,
      agendamentos: prev.agendamentos.map(a => a.id === agId ? agAprovado : a)
    }));

    eventBus.emit('viatura.aprovada', {
      agendamentoId: ag.id,
      ticket: ag.ticket,
      aprovador: aprovador.nome,
      cpfAprovador: aprovador.cpf,
      hashAprovacao: hash
    });

    showToast('Missão autorizada', `Ticket ${ag.ticket} liberado com assinatura SHA-256.`, 'success');
  };

  // Reprovação de Missão (Chefia)
  const handleReprovar = async (agId: string, motivo: string, aprovador: Usuario) => {
    const ag = state.agendamentos.find(a => a.id === agId);
    if (!ag) return;

    const agReprovado: Agendamento = {
      ...ag,
      status: 'reprovado',
      obs: motivo,
      aprovadorNome: aprovador.nome,
      aprovadorCpf: aprovador.cpf,
      aprovadoEm: new Date().toISOString()
    };

    const notif = await notifyUserRejected(agReprovado, motivo);

    setState(prev => ({
      ...prev,
      agendamentos: prev.agendamentos.map(a => a.id === agId ? agReprovado : a),
      notificacoes: [notif, ...prev.notificacoes]
    }));

    showToast('Solicitação reprovada', `Ticket ${ag.ticket} foi indeferido.`, 'warning');
  };

  // Vistoria Check-in / Check-out com 4 Fotos
  const handleRegistrarVistoria = (vistoria: Vistoria, veiculoAtualizado: Partial<Veiculo>) => {
    const veiculoAlvo = state.veiculos.find(v => v.id === vistoria.veiculoId);
    const placa = veiculoAtualizado.placa || veiculoAlvo?.placa || '';

    setState(prev => ({
      ...prev,
      vistorias: [vistoria, ...prev.vistorias],
      veiculos: prev.veiculos.map(v => v.id === vistoria.veiculoId ? { ...v, ...veiculoAtualizado } : v),
      agendamentos: prev.agendamentos.map(a => {
        if (a.id === vistoria.agendamentoId) {
          return {
            ...a,
            status: vistoria.tipo === 'checkin' ? 'em_andamento' : 'realizado',
            checkinId: vistoria.tipo === 'checkin' ? vistoria.id : a.checkinId,
            checkoutId: vistoria.tipo === 'checkout' ? vistoria.id : a.checkoutId
          };
        }
        return a;
      })
    }));

    eventBus.emit('viatura.vistoria_concluida', {
      vistoriaId: vistoria.id,
      agendamentoId: vistoria.agendamentoId,
      veiculoPlaca: placa,
      tipo: vistoria.tipo,
      km: vistoria.km,
      vistoriador: vistoria.motoristaNome
    });

    showToast(
      vistoria.tipo === 'checkin' ? 'Check-in registrado' : 'Check-out finalizado',
      vistoria.tipo === 'checkin'
        ? 'Chaves liberadas e laudo pericial gravado.'
        : 'Veículo recolhido ao pátio da SEJU.',
      'success'
    );
  };

  // Adicionar Veículo
  const handleAdicionarVeiculo = (novoVeic: Veiculo) => {
    setState(prev => ({
      ...prev,
      veiculos: [...prev.veiculos, novoVeic]
    }));
    showToast('Veículo cadastrado', `${novoVeic.modelo} (${novoVeic.placa}) incorporado à frota.`, 'success');
  };

  const handleMarkNotificationRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notificacoes: prev.notificacoes.map(n => n.id === id ? { ...n, lida: true } : n)
    }));
  };

  const pendentesChefia = state.agendamentos.filter(a => a.status === 'pendente').length;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex">
      {/* Sidebar Oficial de 264px */}
      <Sidebar
        activeApp={activeApp}
        onNavigate={handleOpenApp}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        pendentesFrotaCount={pendentesChefia}
        currentUser={state.currentUser}
      />

      {/* Container Principal com Margem Dinâmica da Sidebar */}
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[264px]'
        }`}
      >
        {/* TopBar Horizontal de 56px */}
        <TopBar
          currentUser={state.currentUser}
          onSwitchUser={handleSwitchUser}
          notificacoes={state.notificacoes}
          onMarkNotificationRead={handleMarkNotificationRead}
          activeApp={activeApp}
          onNavigateApp={handleOpenApp}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Notificação Toast Flutuante Discreta */}
        {toast && (
          <div className="fixed bottom-4 right-4 z-50">
            <Toast toast={toast} onDismiss={() => setToast(null)} />
          </div>
        )}

        {/* Área Central de Conteúdo */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TELA INICIAL: O HUB */}
          {activeApp === 'hub' && (
            <AppLauncherHub
              currentUser={state.currentUser}
              veiculos={state.veiculos}
              agendamentos={state.agendamentos}
              onOpenApp={handleOpenApp}
              onOpenAuditoria={() => setActiveApp('auditoria')}
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            />
          )}

          {/* MÓDULO 1: GESTÃO DE FROTAS */}
          {activeApp === 'frota' && (
            <div className="space-y-6">
              {/* Barra de Sub-Navegação de Frotas com Tabs Padronizadas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
                <div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveApp('hub')}
                      icon={<ArrowLeft size={14} />}
                    >
                      Início
                    </Button>
                    <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">
                      Gestão de Frotas & Viaturas
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Requisição de saída, autorização da Chefia, vistoria com fotos e controle de quilometragem.
                  </p>
                </div>

                <Tabs
                  variant="segmented"
                  activeId={frotaTab}
                  onChange={(id) => setFrotaTab(id as FrotaSubTab)}
                  items={[
                    { id: 'nova-solicitacao', label: 'Solicitar', icon: <PlusCircle size={14} /> },
                    { id: 'aprovacoes', label: 'Aprovações', icon: <CheckSquare size={14} />, count: pendentesChefia > 0 ? pendentesChefia : undefined },
                    { id: 'checkin-checkout', label: 'Vistoria', icon: <ClipboardCheck size={14} /> },
                    { id: 'frota', label: 'Catálogo', icon: <Car size={14} />, count: state.veiculos.length },
                    { id: 'consultar', label: 'Histórico', icon: <Search size={14} /> }
                  ]}
                />
              </div>

              {/* Telas Internas de Frota */}
              {frotaTab === 'nova-solicitacao' && (
                <NovaSolicitacaoForm
                  veiculos={state.veiculos}
                  agendamentos={state.agendamentos}
                  onSubmit={handleNovaSolicitacao}
                  defaultNome={state.currentUser.nome}
                  defaultEmail={state.currentUser.email}
                  defaultCpf={state.currentUser.cpf}
                />
              )}

              {frotaTab === 'aprovacoes' && (
                <FilaAprovacao
                  agendamentos={state.agendamentos}
                  currentUser={state.currentUser}
                  onAprovar={handleAprovar}
                  onReprovar={handleReprovar}
                />
              )}

              {frotaTab === 'checkin-checkout' && (
                <CheckinCheckoutVistoria
                  agendamentos={state.agendamentos}
                  veiculos={state.veiculos}
                  vistorias={state.vistorias}
                  currentUser={state.currentUser}
                  onRegistrarVistoria={handleRegistrarVistoria}
                />
              )}

              {frotaTab === 'frota' && (
                <PainelFrota
                  veiculos={state.veiculos}
                  agendamentos={state.agendamentos}
                  onAdicionarVeiculo={handleAdicionarVeiculo}
                  onAtualizarVeiculo={(vId, dados) => {
                    setState(prev => {
                      const novo = {
                        ...prev,
                        veiculos: prev.veiculos.map(v => v.id === vId ? { ...v, ...dados } : v)
                      };
                      saveStateToStorage(novo);
                      return novo;
                    });
                  }}
                />
              )}

              {frotaTab === 'consultar' && (
                <ConsultaCpf
                  agendamentos={state.agendamentos}
                  currentUser={state.currentUser}
                />
              )}
            </div>
          )}

          {/* MÓDULO 2: CHAMADOS DE TI */}
          {activeApp === 'chamados' && (
            <ChamadosKanban
              currentUser={state.currentUser}
              onVoltarHub={() => setActiveApp('hub')}
            />
          )}

          {/* MÓDULO 3: RESERVA DE SALAS */}
          {activeApp === 'salas' && (
            <ReservaSalasView
              currentUser={state.currentUser}
              onVoltarHub={() => setActiveApp('hub')}
            />
          )}

          {/* MÓDULO 4: DIÁRIAS & VIAGENS */}
          {activeApp === 'diarias' && (
            <CalculadoraDiariasView
              currentUser={state.currentUser}
              onVoltarHub={() => setActiveApp('hub')}
            />
          )}

          {/* MÓDULO 5: TELEFONIA & RAMAIS */}
          {activeApp === 'ramais' && (
            <GuiaRamaisView
              currentUser={state.currentUser}
              onVoltarHub={() => setActiveApp('hub')}
            />
          )}

          {/* MÓDULO 6: FUNDO ROTATIVO CENSE */}
          {activeApp === 'cense' && (
            <FundoRotativoCenseView
              currentUser={state.currentUser}
              onVoltarHub={() => setActiveApp('hub')}
            />
          )}

          {/* MÓDULO 7: TRILHA DE AUDITORIA SHA-256 */}
          {activeApp === 'auditoria' && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveApp('hub')}
                icon={<ArrowLeft size={14} />}
              >
                Voltar ao Painel Geral
              </Button>
              <TrilhaAuditoria logs={state.logs} />
            </div>
          )}
        </main>

        {/* Rodapé Institucional Silencioso */}
        <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)] py-4 px-6 text-xs text-[var(--text-muted)]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <MapPin size={13} className="text-[var(--brand)] shrink-0 hidden sm:inline" />
              <span>
                SEJU · Rua Tenente Francisco Ferreira de Souza, 766 · Hauer · Curitiba/PR · CEP 81630-010 · (41) 3210-2400
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-[var(--success)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                GovCloud PR · 99.98%
              </span>
              <span>·</span>
              <span>ICP-PR SHA-256</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal Spotlight Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(appId, subTab) => {
          setActiveApp(appId as any);
          if (appId === 'frota' && subTab) {
            setFrotaTab(subTab as FrotaSubTab);
          }
        }}
      />

      {/* Modal Institucional de Atalhos de Teclado (?) */}
      <HotkeysHelpModal
        isOpen={hotkeysHelpOpen}
        onClose={() => setHotkeysHelpOpen(false)}
      />
    </div>
  );
}

export default App;
