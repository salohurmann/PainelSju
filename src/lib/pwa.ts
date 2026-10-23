import { useSyncExternalStore } from 'react';

/**
 * Registro do service worker (só no site publicado) e aviso de versão nova.
 * A versão nova nunca se instala sozinha no meio do uso: a pessoa escolhe
 * "Atualizar" quando quiser, para não perder um formulário preenchido.
 */
let esperando: ServiceWorker | null = null;
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach(f => f());

function acompanhar(reg: ServiceWorkerRegistration) {
  const marcar = (sw: ServiceWorker | null) => {
    if (sw && navigator.serviceWorker.controller) {
      esperando = sw;
      avisar();
    }
  };
  marcar(reg.waiting);
  reg.addEventListener('updatefound', () => {
    const novo = reg.installing;
    novo?.addEventListener('statechange', () => {
      if (novo.state === 'installed') marcar(novo);
    });
  });
}

export function registrarServiceWorker() {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(reg => {
        acompanhar(reg);
        // Procura versão nova ao voltar para a aba e a cada 30 minutos.
        const verificar = () => void reg.update().catch(() => {});
        document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && verificar());
        window.setInterval(verificar, 30 * 60 * 1000);
      })
      .catch(() => { /* sem service worker o Painel funciona normalmente, só não fica offline */ });

    let recarregou = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (recarregou) return;
      recarregou = true;
      window.location.reload();
    });
  });
}

export function aplicarAtualizacao() {
  esperando?.postMessage('pular-espera');
}

const assinar = (f: () => void) => {
  ouvintes.add(f);
  window.addEventListener('online', f);
  window.addEventListener('offline', f);
  return () => {
    ouvintes.delete(f);
    window.removeEventListener('online', f);
    window.removeEventListener('offline', f);
  };
};

export const useAtualizacaoDisponivel = () => useSyncExternalStore(assinar, () => esperando !== null, () => false);
export const useOnline = () => useSyncExternalStore(assinar, () => navigator.onLine, () => true);
