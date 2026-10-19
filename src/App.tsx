import React, { useState, useEffect } from 'react';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Tecla global de atalho Ctrl+K / Cmd+K para busca rápida
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
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
    const novoLog: AuditoriaLog = {
      id: 'log-' + Date.now(),
      time: new Date().toISOString(),
      user: state.currentUser.nome,
      cpf: state.currentUser.cpf,
      ip: '187.115.82.14',
      action: 'SOLICITACAO_CRIADA',
      details: `Ticket ${novoAg.ticket} — Veículo ${novoAg.veiculoPlaca} — Destino: ${novoAg.destino.slice(0, 30)}...`,
      hash: novoAg.ticket
    };

    const notif = await notifyManagerNewRequest(novoAg, 'gestor.frota@seju.pr.gov.br');

    setState(prev => ({
      ...prev,
      agendamentos: [novoAg, ...prev.agendamentos],
      logs: [novoLog, ...prev.logs],
      notificacoes: [notif, ...prev.notificacoes]
    }));

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

    const novoLog: AuditoriaLog = {
      id: 'log-' + Date.now(),
      time: new Date().toISOString(),
      user: aprovador.nome,
      cpf: aprovador.cpf,
      ip: '187.115.82.10',
      action: 'APROVACAO_CHEFIA_1CLIQUE',
      details: `Ticket ${ag.ticket} aprovado com assinatura digital SHA-256`,
      hash
    };

    const notif = await notifyUserApproved(agAprovado);

    setState(prev => ({
      ...prev,
      agendamentos: prev.agendamentos.map(a => a.id === agId ? agAprovado : a),
      logs: [novoLog, ...prev.logs],
      notificacoes: [notif, ...prev.notificacoes]
    }));

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

    const novoLog: AuditoriaLog = {
      id: 'log-' + Date.now(),
      time: new Date().toISOString(),
      user: aprovador.nome,
      cpf: aprovador.cpf,
      ip: '187.115.82.10',
      action: 'REPROVACAO_CHEFIA',
      details: `Ticket ${ag.ticket} reprovado. Motivo: ${motivo}`,
      hash: 'REPROVADO-' + ag.ticket
    };

    const notif = await notifyUserRejected(agReprovado, motivo);

    setState(prev => ({
      ...prev,
      agendamentos: prev.agendamentos.map(a => a.id === agId ? agReprovado : a),
      logs: [novoLog, ...prev.logs],
      notificacoes: [notif, ...prev.notificacoes]
    }));

    showToast('Solicitação reprovada', `Ticket ${ag.ticket} foi indeferido.`, 'warning');
  };

  // Vistoria Check-in / Check-out com 4 Fotos
  const handleRegistrarVistoria = (vistoria: Vistoria, veiculoAtualizado: Partial<Veiculo>) => {
    const novoLog: AuditoriaLog = {
      id: 'log-' + Date.now(),
      time: vistoria.dataHora,
      user: state.currentUser.nome,
      cpf: state.currentUser.cpf,
      ip: '187.115.82.20',
      action: vistoria.tipo === 'checkin' ? 'CHECKIN_VISTORIA_FOTOS' : 'CHECKOUT_DEVOLUCAO_FOTOS',
      details: `Ticket ${vistoria.ticket} — Odômetro: ${vistoria.km} km — Tanque: ${vistoria.nivelCombustivel}%`,
      hash: vistoria.hashAuditoria
    };

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
      }),
      logs: [novoLog, ...prev.logs]
    }));

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
    </div>
  );
}

export default App;
