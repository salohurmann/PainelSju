import React, { useState } from 'react';
import { Usuario } from '../../types';
import { eventBus } from '../../services/eventBus';
import { supabaseConfigurado } from '../../lib/supabase';
import { Janela } from '../ui/Janela';
import { Copy, Check } from 'lucide-react';

interface PainelDiagnosticoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
}

/** Informações reais do navegador para mandar junto com um chamado de suporte. Nada é enviado sozinho. */
export const PainelDiagnosticoModal: React.FC<PainelDiagnosticoModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [copiado, setCopiado] = useState(false);
  if (!isOpen) return null;

  let bytes = 0;
  let chaves = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) {
        bytes += (k.length + (localStorage.getItem(k) ?? '').length) * 2;
        chaves++;
      }
    }
  } catch {
    /* armazenamento indisponível */
  }

  const eventos = eventBus.getHistorico().slice(0, 8);
  const dados = {
    sistema: 'Seju · Painel de Gestão Integrada',
    versao: import.meta.env.VITE_VERSAO ?? 'desenvolvimento',
    modo: supabaseConfigurado ? 'conectado ao banco' : 'demonstração (dados no navegador)',
    quando: new Date().toISOString(),
    conexao: navigator.onLine ? 'online' : 'sem internet',
    tela: `${window.innerWidth}×${window.innerHeight}`,
    navegador: navigator.userAgent,
    usuario: { nome: currentUser.nome, perfil: currentUser.role, setor: currentUser.setor },
    armazenamento: { chaves, kb: Number((bytes / 1024).toFixed(1)) },
    ultimosEventos: eventos.map(e => ({ tipo: e.tipo, quando: e.timestamp })),
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(dados, null, 2));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* sem permissão */
    }
  };

  const linhas: Array<[string, string]> = [
    ['Modo', dados.modo],
    ['Conexão', dados.conexao],
    ['Versão', dados.versao],
    ['Tela', dados.tela],
    ['Perfil', `${currentUser.role} · ${currentUser.setor}`],
    ['Dados guardados aqui', `${chaves} itens · ${dados.armazenamento.kb} KB`],
  ];

  return (
    <Janela titulo="Diagnóstico para o suporte" onFechar={onClose}>
      <p className="text-sm text-[var(--text-muted)]">
        Se algo não funcionar, copie estas informações e cole no chamado. Elas não saem do seu computador sem você colar.
      </p>
      <dl className="mt-4 divide-y divide-[var(--border)] rounded-[18px] bg-[var(--surface-2)] px-4 text-sm">
        {linhas.map(([r, v]) => (
          <div key={r} className="flex justify-between gap-3 py-2.5">
            <dt className="text-[var(--text-muted)]">{r}</dt>
            <dd className="text-right font-semibold text-[var(--text)]">{v}</dd>
          </div>
        ))}
      </dl>
      <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Últimas ações nesta sessão</h4>
      {eventos.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--text-muted)]">Nenhuma ainda.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-[13px]">
          {eventos.map(e => (
            <li key={e.id} className="flex justify-between gap-3">
              <span className="text-[var(--text)]">{e.tipo}</span>
              <span className="tabular-nums text-[var(--text-subtle)]">{new Date(e.timestamp).toLocaleTimeString('pt-BR')}</span>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={copiar}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0072BB] text-sm font-semibold text-white hover:bg-[#005A9C] cursor-pointer"
      >
        {copiado ? <><Check size={16} strokeWidth={3} /> Copiado</> : <><Copy size={16} /> Copiar para o chamado</>}
      </button>
    </Janela>
  );
};
