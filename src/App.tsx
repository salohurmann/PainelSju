import { ModuloCabecalho, AcaoModulo, AbasModulo, NumeroModulo } from './components/modulo/ModuloCabecalho';
import React, { useState, useEffect, useRef } from 'react';
import { useAcessoDemo, aplicarAcesso } from './services/acessoDemo';
import { VotacaoView } from './components/votacao/VotacaoView';
import { AdminView } from './components/admin/AdminView';
import { useModulosPermitidos } from './modules/useModulosPermitidos';
import { Agendamento, Veiculo, Vistoria, Usuario } from './types';
import { loadInitialState, saveStateToStorage, USUARIOS_MOCK } from './services/store';
import { 
  
  
  notifyUserRejected 
} from './services/notifications';
import { eventBus } from './services/eventBus';
import { crossCuttingService } from './services/crossCuttingService';
import { TopBar } from './components/layout/TopBar';
import { useRota, type DestinoApp } from './services/rota';
import { MesaDespacho } from './components/mesa/MesaDespacho';
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
import { PainelDiagnosticoModal } from './components/navigation/PainelDiagnosticoModal';
import { useSmartPolling } from './hooks/useSmartPolling';
import { Toast, ToastItem } from './components/ui/Toast';
import { 
  Car, 
  CheckSquare, 
  ClipboardCheck, 
  History,
  
  PlusCircle,
  
  
  
} from 'lucide-react';

export type FrotaSubTab = 
  | 'visao-geral'
  | 'nova-solicitacao'
  | 'aprovacoes'
  | 'checkin-checkout'
  | 'frota'
  | 'consultar';

const TITULO_TELA: Record<Exclude<DestinoApp, 'hub'>, string> = {
  frota: 'Frotas', chamados: 'Chamados', salas: 'Salas', diarias: 'Diárias', cense: 'CENSE', ramais: 'Ramais', votacao: 'Votação', admin: 'Admin', auditoria: 'Auditoria',
};
const ABAS_FROTA: FrotaSubTab[] = ['visao-geral', 'nova-solicitacao', 'aprovacoes', 'checkin-checkout', 'frota', 'consultar'];

export interface SessaoReal {
  usuario: Usuario;
  sair: () => Promise<void>;
}

/** Estado salvo antes desta versão pode não ter a sigla do setor. */
function completarSigla(u: Usuario): Usuario {
  if (u.setorSigla) return u;
  const base = USUARIOS_MOCK.find(x => x.id === u.id);
  return base ? { ...u, setorSigla: base.setorSigla, role: u.role ?? base.role } : u;
}

export function App({ sessao }: { sessao?: SessaoReal } = {}) {
  const [state, setState] = useState(() => loadInitialState());
  // Com login real, o perfil vem do banco e não pode ser trocado pela interface.
  const acessoDemo = useAcessoDemo();
  const currentUser = sessao?.usuario ?? aplicarAcesso(completarSigla(state.currentUser), acessoDemo);
  const modulosPermitidos = useModulosPermitidos(currentUser).map(m => m.id);
  // Tela e subaba vêm do endereço (#/frota/aprovacoes): voltar do navegador e links funcionam.
  const [rota, navegar] = useRota();
  const activeApp = rota.app;
  const setActiveApp = (app: DestinoApp) => navegar(app);
  const frotaTab: FrotaSubTab = activeApp === 'frota' && ABAS_FROTA.includes(rota.aba as FrotaSubTab) ? (rota.aba as FrotaSubTab) : 'nova-solicitacao';
  const setFrotaTab = (aba: FrotaSubTab) => navegar('frota', aba);
  const [toast, setToast] = useState<ToastItem | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [hotkeysHelpOpen, setHotkeysHelpOpen] = useState(false);
  const [diagnosticoOpen, setDiagnosticoOpen] = useState(false);

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
        setHotkeysHelpOpen(false);
        setDiagnosticoOpen(false);
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
  const handleOpenApp = (appId: DestinoApp, subTab?: string) => navegar(appId, subTab);

  // Enviar Nova Solicitação de Veículo
  const handleNovaSolicitacao = async (novoAg: Agendamento) => {
    setState(prev => ({
      ...prev,
      agendamentos: [novoAg, ...prev.agendamentos]
    }));

    eventBus.emit('viatura.solicitada', {
      agendamentoId: novoAg.id,
      veiculoPlaca: novoAg.veiculoPlaca,
      solicitante: currentUser.nome,
      cpfSolicitante: currentUser.cpf,
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

  // Guarda de acesso: módulo fora do setor/papel não abre nem pelo endereço.
  const soVotacao = modulosPermitidos.length === 1 && modulosPermitidos[0] === 'votacao';
  const destino = activeApp === 'hub' && soVotacao ? 'votacao' : activeApp;
  const semAcesso = destino !== 'hub' && !modulosPermitidos.includes(destino);
  const abaVisivel = semAcesso ? null : destino;

  useEffect(() => {
    document.title = abaVisivel && abaVisivel !== 'hub' ? `${TITULO_TELA[abaVisivel]} · Seju.` : 'Painel de Gestão Integrada · SEJU-PR';
  }, [abaVisivel]);

  const pendentesChefia = state.agendamentos.filter(a => a.status === 'pendente').length;
  // Selo da Mesa: pendências que esta pessoa pode decidir (nunca as próprias)
  const pendentesMesa = currentUser.role === 'chefe_gabinete' || currentUser.role === 'admin'
    ? state.agendamentos.filter(a => a.status === 'pendente' && a.cpf.replace(/\D/g, '') !== currentUser.cpf.replace(/\D/g, '')).length
    : 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex">


      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* TopBar Horizontal de 56px */}
        <TopBar
          currentUser={currentUser}
          onSwitchUser={sessao ? undefined : handleSwitchUser}
          onSair={sessao ? () => void sessao.sair() : undefined}
          notificacoes={state.notificacoes}
          onMarkNotificationRead={handleMarkNotificationRead}
          activeApp={activeApp}
          onNavigateApp={handleOpenApp}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenDiagnostico={() => setDiagnosticoOpen(true)}
          pendentesMesa={pendentesMesa}
          pendentesFrota={pendentesChefia}
        />

        {/* Notificação Toast Flutuante Discreta */}
        {toast && (
          <div className="fixed bottom-4 right-4 z-50">
            <Toast toast={toast} onDismiss={() => setToast(null)} />
          </div>
        )}

        {/* Área Central de Conteúdo */}
        <main className="flex-1 px-4 pt-2 pb-8 sm:px-8 max-w-[1360px] w-full mx-auto">
          {/* Sem acesso a esta aba (setor ou papel não liberado) */}
          {semAcesso && (
            <div className="mx-auto mt-10 max-w-lg rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <div className="font-display text-2xl font-bold text-[var(--text)]">Esta aba não está liberada para você.</div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">O acesso depende do seu setor e do seu papel. Fale com a administração se precisar.</p>
              <button type="button" onClick={() => setActiveApp('hub')} className="mt-5 h-11 rounded-full bg-[#0072BB] px-6 text-sm font-semibold text-white cursor-pointer">
                Voltar para a Mesa
              </button>
            </div>
          )}

          {/* Entidade da votação: a casa dela é a Votação */}
          {abaVisivel === 'votacao' && (
            <VotacaoView
              currentUser={currentUser}
              onVoltarHub={soVotacao ? undefined : () => setActiveApp('hub')}
              aba={rota.app === 'votacao' ? rota.aba : undefined}
              onAba={a => navegar('votacao', a)}
              pessoasLogin={USUARIOS_MOCK.map(u => aplicarAcesso(u, acessoDemo)).filter(u => u.role === 'entidade_votante').map(u => ({ id: u.id, nome: u.nome, email: u.email }))}
            />
          )}

          {abaVisivel === 'admin' && <AdminView usuarioId={currentUser.id} onVoltar={() => setActiveApp('hub')} aba={rota.aba} onAba={a => navegar('admin', a)} />}

          {/* TELA INICIAL: O HUB */}
          {abaVisivel === 'hub' && (
            <MesaDespacho
              currentUser={currentUser}
              veiculos={state.veiculos}
              agendamentos={state.agendamentos}
              onOpenApp={handleOpenApp}
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
              onAprovarFrota={handleAprovar}
              onReprovarFrota={handleReprovar}
            />
          )}

          {/* MÓDULO 1: GESTÃO DE FROTAS */}
          {abaVisivel === 'frota' && (
            <div className="space-y-6">
              <ModuloCabecalho
                cor="azul"
                rotulo="Logística · Transportes"
                titulo="Frotas"
                descricao="Peça um carro oficial, acompanhe a autorização da chefia e registre a vistoria de saída e de volta."
                onVoltar={() => setActiveApp('hub')}
                acoes={
                  <AcaoModulo destaque icone={<PlusCircle size={15} />} onClick={() => setFrotaTab('nova-solicitacao')}>
                    Pedir veículo
                  </AcaoModulo>
                }
              >
                <div className="flex flex-wrap gap-2">
                  <NumeroModulo rotulo="Disponíveis" valor={state.veiculos.filter(v => v.status === 'disponivel').length} detalhe={`de ${state.veiculos.length} veículos`} />
                  <NumeroModulo rotulo="Em viagem" valor={state.veiculos.filter(v => v.status === 'em_missao').length} />
                  <NumeroModulo rotulo="Aguardando chefia" valor={pendentesChefia} />
                </div>
                <AbasModulo<FrotaSubTab>
                  ativa={frotaTab}
                  onChange={setFrotaTab}
                  itens={[
                    { id: 'nova-solicitacao', rotulo: 'Solicitar', icone: <PlusCircle size={14} /> },
                    { id: 'aprovacoes', rotulo: 'Aprovações', icone: <CheckSquare size={14} />, contagem: pendentesChefia },
                    { id: 'checkin-checkout', rotulo: 'Vistoria', icone: <ClipboardCheck size={14} /> },
                    { id: 'frota', rotulo: 'Catálogo', icone: <Car size={14} /> },
                    { id: 'consultar', rotulo: 'Meus pedidos', icone: <History size={14} /> },
                  ]}
                />
              </ModuloCabecalho>

              {/* Telas Internas de Frota */}
              {frotaTab === 'nova-solicitacao' && (
                <NovaSolicitacaoForm
                  veiculos={state.veiculos}
                  agendamentos={state.agendamentos}
                  onSubmit={handleNovaSolicitacao}
                  defaultNome={currentUser.nome}
                  defaultEmail={currentUser.email}
                  defaultCpf={currentUser.cpf}
                />
              )}

              {frotaTab === 'aprovacoes' && (
                <FilaAprovacao
                  agendamentos={state.agendamentos}
                  currentUser={currentUser}
                  onAprovar={handleAprovar}
                  onReprovar={handleReprovar}
                />
              )}

              {frotaTab === 'checkin-checkout' && (
                <CheckinCheckoutVistoria
                  agendamentos={state.agendamentos}
                  veiculos={state.veiculos}
                  vistorias={state.vistorias}
                  currentUser={currentUser}
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
                  currentUser={currentUser}
                />
              )}
            </div>
          )}

          {/* MÓDULO 2: CHAMADOS DE TI */}
          {abaVisivel === 'chamados' && (
            <ChamadosKanban
              currentUser={currentUser}
              onVoltarHub={() => setActiveApp('hub')}
            />
          )}

          {/* MÓDULO 3: RESERVA DE SALAS */}
          {abaVisivel === 'salas' && (
            <ReservaSalasView
              currentUser={currentUser}
              onVoltarHub={() => setActiveApp('hub')}
            />
          )}

          {/* MÓDULO 4: DIÁRIAS & VIAGENS */}
          {abaVisivel === 'diarias' && (
            <CalculadoraDiariasView
              currentUser={currentUser}
              onVoltarHub={() => setActiveApp('hub')}
            />
          )}

          {/* MÓDULO 5: TELEFONIA & RAMAIS */}
          {abaVisivel === 'ramais' && (
            <GuiaRamaisView
              currentUser={currentUser}
              onVoltarHub={() => setActiveApp('hub')}
            />
          )}

          {/* MÓDULO 6: FUNDO ROTATIVO CENSE */}
          {abaVisivel === 'cense' && (
            <FundoRotativoCenseView
              currentUser={currentUser}
              onVoltarHub={() => setActiveApp('hub')}
            />
          )}

          {/* MÓDULO 7: TRILHA DE AUDITORIA SHA-256 */}
          {abaVisivel === 'auditoria' && (
            <TrilhaAuditoria logs={state.logs} onVoltar={() => setActiveApp('hub')} />
          )}
        </main>

        {/* Rodapé Institucional Silencioso */}
        <footer className="mt-auto border-t border-[var(--border)] py-5 px-4 sm:px-8 text-[12.5px] text-[var(--text-muted)]">
          <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-center sm:text-left">
              Secretaria da Justiça e Cidadania do Paraná · Rua Tenente Francisco Ferreira de Souza, 766 · Hauer · Curitiba/PR
            </span>
            <div className="flex items-center gap-4">
              <a href="mailto:dpo@seju.pr.gov.br" className="hover:text-[var(--text)] underline-offset-2 hover:underline">
                Privacidade (LGPD)
              </a>
              <button
                type="button"
                onClick={() => setDiagnosticoOpen(true)}
                className="hover:text-[var(--text)] underline-offset-2 hover:underline cursor-pointer"
              >
                Diagnóstico para o suporte
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal Spotlight Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        modulosPermitidos={modulosPermitidos}
        onNavigate={(appId, subTab) => navegar(appId, subTab)}
      />

      {/* Modal Institucional de Atalhos de Teclado (?) */}
      <HotkeysHelpModal
        isOpen={hotkeysHelpOpen}
        onClose={() => setHotkeysHelpOpen(false)}
      />

      {/* Painel de Diagnóstico & Telemetria de Suporte N1/N2 */}
      <PainelDiagnosticoModal
        isOpen={diagnosticoOpen}
        onClose={() => setDiagnosticoOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;
