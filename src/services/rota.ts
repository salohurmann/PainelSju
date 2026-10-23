import { useCallback, useEffect, useState } from 'react';
import type { AppModuleId } from '../types';

/**
 * Rotas por hash: #/frota/aprovacoes, #/votacao, #/admin/modulos.
 * Hash (e não caminho) porque o Painel roda no GitHub Pages, que não reescreve URLs.
 * O endereço antigo ?app=frota continua abrindo a tela certa.
 */
export type DestinoApp = 'hub' | AppModuleId | 'auditoria';

export interface Rota {
  app: DestinoApp;
  aba?: string;
}

const APPS: readonly DestinoApp[] = ['hub', 'frota', 'chamados', 'salas', 'diarias', 'cense', 'ramais', 'votacao', 'admin', 'auditoria'];
const SEGMENTO = /^[a-z0-9-]{1,40}$/;

export function lerRota(hash: string, busca = ''): Rota {
  const partes = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const app = partes[0] === 'mesa' ? 'hub' : (partes[0] as DestinoApp | undefined);
  if (app && APPS.includes(app)) {
    const aba = partes[1] && SEGMENTO.test(partes[1]) ? partes[1] : undefined;
    return { app, aba };
  }
  const antigo = new URLSearchParams(busca).get('app') as DestinoApp | null;
  if (antigo && APPS.includes(antigo)) return { app: antigo };
  return { app: 'hub' };
}

export function hashDe({ app, aba }: Rota): string {
  if (app === 'hub') return '#/';
  return aba ? `#/${app}/${aba}` : `#/${app}`;
}

const atual = () => (typeof window === 'undefined' ? { app: 'hub' as const } : lerRota(window.location.hash, window.location.search));

/** Rota atual e uma função para navegar. Voltar/avançar do navegador funcionam. */
export function useRota(): [Rota, (app: DestinoApp, aba?: string, opcoes?: { substituir?: boolean }) => void] {
  const [rota, setRota] = useState<Rota>(atual);

  useEffect(() => {
    // Normaliza ?app=frota para #/frota sem criar entrada no histórico.
    const url = new URL(window.location.href);
    if (url.searchParams.has('app')) {
      url.searchParams.delete('app');
      url.hash = hashDe(atual());
      history.replaceState(null, '', url);
    }
    const ouvir = () => setRota(atual());
    window.addEventListener('hashchange', ouvir);
    window.addEventListener('popstate', ouvir);
    return () => {
      window.removeEventListener('hashchange', ouvir);
      window.removeEventListener('popstate', ouvir);
    };
  }, []);

  const navegar = useCallback((app: DestinoApp, aba?: string, opcoes?: { substituir?: boolean }) => {
    const nova: Rota = { app, aba };
    const trocouDeTela = atual().app !== app;
    const hash = hashDe(nova);
    if (window.location.hash !== hash && !(hash === '#/' && !window.location.hash)) {
      if (opcoes?.substituir) history.replaceState(null, '', hash);
      else history.pushState(null, '', hash);
    }
    setRota(nova);
    if (trocouDeTela) window.scrollTo({ top: 0 });
  }, []);

  return [rota, navegar];
}
