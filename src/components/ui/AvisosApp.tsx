import React, { useState } from 'react';
import { RefreshCw, WifiOff, X } from 'lucide-react';
import { aplicarAtualizacao, useAtualizacaoDisponivel, useOnline } from '../../lib/pwa';
import { supabaseConfigurado } from '../../lib/supabase';

/** Avisos do aplicativo: versão nova publicada e falta de conexão. */
export const AvisosApp: React.FC = () => {
  const atualizacao = useAtualizacaoDisponivel();
  const online = useOnline();
  const [adiada, setAdiada] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {!online && (
        <div role="status" className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-[#0B1B2E] px-5 py-3 text-sm text-white shadow-lg">
          <WifiOff size={16} className="shrink-0 text-[#C6E86B]" />
          <span>
            Sem conexão.{' '}
            {supabaseConfigurado ? 'Dá para consultar o que já abriu; para enviar, espere a internet voltar.' : 'O Painel continua funcionando neste aparelho.'}
          </span>
        </div>
      )}
      {atualizacao && !adiada && (
        <div role="status" className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-[#0B1B2E] py-2 pl-5 pr-2 text-sm text-white shadow-lg">
          <span>Saiu uma versão nova do Painel.</span>
          <button
            type="button"
            onClick={aplicarAtualizacao}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#C6E86B] px-4 font-semibold text-[#0B1B2E] cursor-pointer"
          >
            <RefreshCw size={14} /> Atualizar
          </button>
          <button type="button" onClick={() => setAdiada(true)} aria-label="Depois" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
