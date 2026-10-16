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
import { Header } from './components/common/Header';
import { BrasaoParana } from './components/common/BrasaoParana';
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
import { soundFX } from './services/soundFx';
import { CommandPalette } from './components/navigation/CommandPalette';
import { InteractiveDock } from './components/navigation/InteractiveDock';
import { 
  Car, 
  CheckSquare, 
  ClipboardCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ArrowLeft,
  ShieldCheck,
  PlusCircle,
  LayoutGrid
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
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

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

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4500);
  };

  // Alternar Usuário / Papel
  const handleSwitchUser = (user: Usuario) => {
    setState(prev => ({ ...prev, currentUser: user }));
    showToast(`Perfil alterado para: ${user.nome} (${user.cargo})`, 'info');
  };

  // 1. Abrir Aplicativo do Hub
  const handleOpenApp = (appId: AppModuleId, subTab?: string) => {
    setActiveApp(appId);
    if (appId === 'frota' && subTab) {
      setFrotaTab(subTab as FrotaSubTab);
    }
  };

  // 2. Enviar Nova Solicitação de Veículo
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

    showToast(`Solicitação ${novoAg.ticket} registrada! Notificação enviada à Chefia.`, 'success');
  };

  // 3. Aprovação de Missão (Chefia - 1 Clique com Hash SHA-256)
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

    showToast(`Missão ${ag.ticket} APROVADA com sucesso! E-mail despachado ao servidor.`, 'success');
  };

  // 4. Reprovação de Missão (Chefia)
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

    showToast(`Solicitação ${ag.ticket} reprovada. O solicitante foi notificado.`, 'info');
  };

  // 5. Vistoria Check-in / Check-out com 4 Fotos
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
      vistoria.tipo === 'checkin'
        ? 'Check-in concluído! Chaves liberadas e 4 fotos gravadas com SHA-256.'
        : 'Check-out concluído! Chaves devolvidas e missão finalizada.',
      'success'
    );
  };

  // 6. Adicionar Veículo
  const handleAdicionarVeiculo = (novoVeic: Veiculo) => {
    setState(prev => ({
      ...prev,
      veiculos: [...prev.veiculos, novoVeic]
    }));
    showToast(`Veículo ${novoVeic.modelo} (${novoVeic.placa}) adicionado à frota!`, 'success');
  };

  const handleMarkNotificationRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notificacoes: prev.notificacoes.map(n => n.id === id ? { ...n, lida: true } : n)
    }));
  };

  const pendentesChefia = state.agendamentos.filter(a => a.status === 'pendente').length;

  const currentAppTitles: Record<string, string> = {
    frota: 'Gestão de Frotas',
    chamados: 'Chamados & OS TI',
    salas: 'Reserva de Salas',
    diarias: 'Diárias & Viagens',
    ramais: 'Guia de Ramais',
    auditoria: 'Trilha Criptográfica SHA-256'
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col font-sans selection:bg-[#0072BB] selection:text-white">
      {/* Toast Notifier */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all animate-in slide-in-from-bottom-4 border ${
          toastMsg.type === 'success' ? 'bg-emerald-800 text-white border-emerald-700' :
          toastMsg.type === 'error' ? 'bg-red-800 text-white border-red-700' :
          'bg-[#0072BB] text-white border-blue-600'
        }`}>
          {toastMsg.type === 'success' && <CheckCircle2 size={18} />}
          {toastMsg.type === 'error' && <AlertCircle size={18} />}
          {toastMsg.type === 'info' && <Info size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Institucional com Launcher de Apps e Identidade Oficial do Paraná */}
      <Header
        currentUser={state.currentUser}
        onSwitchUser={handleSwitchUser}
        notificacoes={state.notificacoes}
        onMarkNotificationRead={handleMarkNotificationRead}
        activeApp={activeApp}
        onNavigateApp={(appId, subTab) => {
          setActiveApp(appId as any);
          if (appId === 'frota' && subTab) {
            setFrotaTab(subTab as FrotaSubTab);
          }
        }}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        pendentesFrotaCount={pendentesChefia}
        veiculosLivresCount={state.veiculos.filter(v => v.status === 'disponivel').length}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-32 pb-safe max-w-7xl w-full mx-auto">
        {/* TELA INICIAL: O HUB COM OS APLICATIVOS LADO A LADO */}
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

        {/* MÓDULO 1: GESTÃO DE FROTAS (PILOTO COMPLETO) */}
        {activeApp === 'frota' && (
          <div className="space-y-6">
            {/* Header Executivo do Módulo de Frota */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                  <button 
                    onClick={() => {
                      soundFX.playClick();
                      setActiveApp('hub');
                    }}
                    className="hover:text-[#0072BB] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Central de Aplicativos
                  </button>
                  <span className="text-slate-300">/</span>
                  <span className="font-bold text-slate-800">Frota & Veículos Oficiais</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0072BB]/10 text-[#0072BB] border border-[#0072BB]/20 flex items-center justify-center font-bold shadow-2xs">
                    <Car size={22} />
                  </div>
                  <span>Gestão de Frotas & Veículos Oficiais</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Secretaria da Justiça e Cidadania · Agendamento oficial, despacho da Chefia de Gabinete, vistoria fotográfica e telemetria patrimonial.
                </p>
              </div>

              {/* Status Executivo & Indicador Operacional */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Frota Operacional</div>
                  <div className="text-xs font-black text-emerald-700 flex items-center gap-1.5 justify-end mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {state.veiculos.length} Veículos Ativos
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Sub-Navegação Executiva (Grid Harmonioso sem Rolagem Forçada) */}
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {[
                  { id: 'nova-solicitacao', label: 'Solicitar Carro', icon: PlusCircle, desc: 'Nova Requisição' },
                  { id: 'aprovacoes', label: 'Aprovações Chefia', icon: CheckSquare, badge: pendentesChefia, desc: 'Fila de Despacho' },
                  { id: 'checkin-checkout', label: 'Vistoria 4 Fotos', icon: ClipboardCheck, desc: 'Check-in / Check-out' },
                  { id: 'frota', label: 'Painel da Frota', icon: Car, desc: 'Catálogo & Status' },
                  { id: 'consultar', label: 'Consultar CPF', icon: Search, desc: 'Histórico do Servidor' }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isSel = frotaTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        soundFX.playClick();
                        setFrotaTab(tab.id as FrotaSubTab);
                      }}
                      className={`p-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer border ${tab.id === 'consultar' ? 'col-span-2 sm:col-span-1' : ''} ${
                        isSel
                          ? 'bg-[#0072BB] text-white border-[#0072BB] shadow-md shadow-blue-500/20'
                          : 'bg-slate-50/70 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${isSel ? 'bg-white/20 text-white' : 'bg-white text-[#0072BB] shadow-2xs border border-slate-100'}`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-black truncate leading-tight ${isSel ? 'text-white' : 'text-slate-900'}`}>
                            {tab.label}
                          </div>
                          <div className={`text-[10px] truncate ${isSel ? 'text-blue-100' : 'text-slate-400'}`}>
                            {tab.desc}
                          </div>
                        </div>
                      </div>

                      {Boolean(tab.badge && tab.badge > 0) && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                          isSel ? 'bg-amber-400 text-amber-950 font-black' : 'bg-amber-500 text-white animate-pulse'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conteúdo da Aba da Frota Selecionada */}
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

        {/* MÓDULO 2: CHAMADOS & OS TI (KANBAN) */}
        {activeApp === 'chamados' && (
          <ChamadosKanban
            currentUser={state.currentUser}
            onVoltarHub={() => setActiveApp('hub')}
          />
        )}

        {/* MÓDULO 3: RESERVA INTELIGENTE DE SALAS */}
        {activeApp === 'salas' && (
          <ReservaSalasView
            currentUser={state.currentUser}
            onVoltarHub={() => setActiveApp('hub')}
          />
        )}

        {/* MÓDULO 4: DIÁRIAS & VIAGENS OFICIAIS */}
        {activeApp === 'diarias' && (
          <CalculadoraDiariasView
            currentUser={state.currentUser}
            onVoltarHub={() => setActiveApp('hub')}
          />
        )}

        {/* MÓDULO 5: GUIA DE RAMAIS INTERNOS */}
        {activeApp === 'ramais' && (
          <GuiaRamaisView
            currentUser={state.currentUser}
            onVoltarHub={() => setActiveApp('hub')}
          />
        )}

        {/* VISUALIZAÇÃO DE AUDITORIA CRIPTOGRÁFICA SHA-256 */}
        {activeApp === 'auditoria' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveApp('hub')}
              className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft size={16} /> Voltar à Central de Aplicativos
            </button>
            <TrilhaAuditoria logs={state.logs} />
          </div>
        )}
      </main>

      {/* Rodapé Oficial do Governo do Estado do Paraná */}
      <footer className="bg-[#002B49] text-white border-t border-[#00385E] mt-auto py-10 px-4 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-1 bg-white/10 rounded-xl border border-white/15 shrink-0">
              <BrasaoParana size="md" className="brightness-125" />
            </div>
            <div className="space-y-1">
              <div className="font-black tracking-wider text-sm uppercase text-white">
                SECRETARIA DA JUSTIÇA E CIDADANIA — SEJU
              </div>
              <div className="text-blue-200 text-[11px] leading-relaxed max-w-xl">
                Governo do Estado do Paraná · Rua Tenente Francisco Ferreira de Souza, 766 · Hauer · Curitiba – PR · CEP 81630-010 · Central Telefônica: (41) 3210-2400
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-blue-200 text-xs">
            <button onClick={() => setActiveApp('hub')} className="hover:text-white font-bold transition">
              Início · Hub
            </button>
            <span className="text-blue-400">•</span>
            <button onClick={() => setActiveApp('auditoria')} className="hover:text-white font-bold flex items-center gap-1 text-emerald-400 transition">
              <ShieldCheck size={14} /> Assinatura SHA-256
            </button>
            <span className="text-blue-400">•</span>
            <span className="text-slate-400">Brevo API Integrada</span>
          </div>
        </div>
      </footer>

      {/* Spotlight Command Palette (Ctrl+K) */}
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

      {/* Dock Flutuante Interativo (macOS / Dynamic Island Style) */}
      <InteractiveDock
        activeApp={activeApp}
        onNavigate={(appId, subTab) => {
          setActiveApp(appId as any);
          if (appId === 'frota' && subTab) {
            setFrotaTab(subTab as FrotaSubTab);
          }
        }}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        pendentesChefiaCount={pendentesChefia}
      />
    </div>
  );
}

export default App;
