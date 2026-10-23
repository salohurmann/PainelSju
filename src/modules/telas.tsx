import React, { Component, lazy, type ComponentType, type ReactNode } from 'react';

/**
 * Telas carregadas sob demanda: cada módulo vira um arquivo separado,
 * baixado na primeira vez que é aberto (e pré-carregado quando o navegador
 * fica ocioso, só para os módulos que a pessoa pode ver).
 */
const CHAVE_RECARGA = 'seju_recarga_pedaco';

/** Depois de um deploy, os arquivos antigos somem: recarrega a página uma vez. */
function comRecarga<T>(carregar: () => Promise<T>): () => Promise<T> {
  return () =>
    carregar().then(
      m => {
        try { sessionStorage.removeItem(CHAVE_RECARGA); } catch { /* sem armazenamento */ }
        return m;
      },
      erro => {
        let jaTentou = false;
        try {
          jaTentou = sessionStorage.getItem(CHAVE_RECARGA) === '1';
          sessionStorage.setItem(CHAVE_RECARGA, '1');
        } catch { jaTentou = true; }
        if (!jaTentou) window.location.reload();
        throw erro;
      },
    );
}

const CARREGADORES = {
  frota: () => import('./telasFrota'),
  chamados: () => import('../components/chamados/ChamadosKanban'),
  salas: () => import('../components/salas/ReservaSalasView'),
  diarias: () => import('../components/diarias/CalculadoraDiariasView'),
  cense: () => import('../components/cense/FundoRotativoCenseView'),
  ramais: () => import('../components/ramais/GuiaRamaisView'),
  votacao: () => import('../components/votacao/VotacaoView'),
  admin: () => import('../components/admin/AdminView'),
  auditoria: () => import('../components/auditoria/TrilhaAuditoria'),
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tela<M, K extends keyof M>(carregar: () => Promise<M>, nome: K): React.LazyExoticComponent<Extract<M[K], ComponentType<any>>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comTentativa = comRecarga(carregar);
  return lazy(() => comTentativa().then(m => ({ default: m[nome] as any })));
}

export const NovaSolicitacaoForm = tela(CARREGADORES.frota, 'NovaSolicitacaoForm');
export const FilaAprovacao = tela(CARREGADORES.frota, 'FilaAprovacao');
export const CheckinCheckoutVistoria = tela(CARREGADORES.frota, 'CheckinCheckoutVistoria');
export const PainelFrota = tela(CARREGADORES.frota, 'PainelFrota');
export const ConsultaCpf = tela(CARREGADORES.frota, 'ConsultaCpf');
export const ChamadosKanban = tela(CARREGADORES.chamados, 'ChamadosKanban');
export const ReservaSalasView = tela(CARREGADORES.salas, 'ReservaSalasView');
export const CalculadoraDiariasView = tela(CARREGADORES.diarias, 'CalculadoraDiariasView');
export const FundoRotativoCenseView = tela(CARREGADORES.cense, 'FundoRotativoCenseView');
export const GuiaRamaisView = tela(CARREGADORES.ramais, 'GuiaRamaisView');
export const VotacaoView = tela(CARREGADORES.votacao, 'VotacaoView');
export const AdminView = tela(CARREGADORES.admin, 'AdminView');
export const TrilhaAuditoria = tela(CARREGADORES.auditoria, 'TrilhaAuditoria');

// Janelas que só existem quando abertas.
export const CommandPalette = tela(() => import('../components/navigation/CommandPalette'), 'CommandPalette');
export const HotkeysHelpModal = tela(() => import('../components/navigation/HotkeysHelpModal'), 'HotkeysHelpModal');
export const PainelDiagnosticoModal = tela(() => import('../components/navigation/PainelDiagnosticoModal'), 'PainelDiagnosticoModal');

/** Baixa em segundo plano os módulos que a pessoa pode abrir. */
export function preCarregarTelas(modulos: string[]): () => void {
  if (typeof window === 'undefined') return () => {};
  const ocioso = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 1500));
  const cancelar = window.cancelIdleCallback ?? window.clearTimeout;
  const id = ocioso(() => {
    for (const m of modulos) {
      const carregar = CARREGADORES[m as keyof typeof CARREGADORES];
      carregar?.().catch(() => { /* tenta de novo quando a tela abrir */ });
    }
  });
  return () => cancelar(id as number);
}

/** Enquanto o pedaço da tela chega. */
export const CarregandoTela: React.FC = () => (
  <div role="status" aria-live="polite" className="mx-auto mt-16 flex max-w-sm flex-col items-center gap-3 text-sm text-[var(--text-muted)]">
    <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--brand)]" />
    Abrindo…
  </div>
);

/** Se a tela não carregar (rede caiu, versão nova publicada), oferece recarregar em vez de quebrar o Painel. */
export class ErroTela extends Component<{ children: ReactNode; chave?: string }, { erro: boolean }> {
  state = { erro: false };
  static getDerivedStateFromError() {
    return { erro: true };
  }
  componentDidUpdate(anterior: { chave?: string }) {
    if (anterior.chave !== this.props.chave && this.state.erro) this.setState({ erro: false });
  }
  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <div role="alert" className="mx-auto mt-10 max-w-lg rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <div className="font-display text-2xl font-bold text-[var(--text)]">Não deu para abrir esta tela.</div>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Pode ser a conexão ou uma versão nova do Painel que acabou de sair. Recarregar costuma resolver.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-5 h-11 rounded-full bg-[#0072BB] px-6 text-sm font-semibold text-white cursor-pointer">
          Recarregar
        </button>
      </div>
    );
  }
}
