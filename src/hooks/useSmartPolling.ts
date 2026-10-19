import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook de Polling Inteligente com Detecção de Aba Oculta (Page Visibility API)
 * Economiza CPU, tráfego de rede e bateria quando o usuário está em outra aba,
 * e recarrega os dados imediatamente no instante em que a aba volta a ter foco.
 */
export function useSmartPolling(
  callback: () => void | Promise<void>,
  intervalMs: number = 30000,
  enabled: boolean = true
) {
  const savedCallback = useRef(callback);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const executeTick = useCallback(async () => {
    // Não executa se o documento estiver oculto
    if (document.hidden) return;
    try {
      await savedCallback.current();
    } catch (err) {
      console.warn('[SmartPolling] Erro durante ciclo de atualização:', err);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Inicia intervalo normal
    timerRef.current = window.setInterval(executeTick, intervalMs);

    // Monitora evento de visibilidade da página
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Aba voltou a ficar visível: executa verificação instantânea
        executeTick();
        // Reinicia o timer para sincronizar a cadência
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = window.setInterval(executeTick, intervalMs);
      } else {
        // Aba minimizada ou em segundo plano: pausa timer
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs, enabled, executeTick]);
}
