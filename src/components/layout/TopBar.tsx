import React, { useEffect, useRef, useState } from 'react';
import { useModulosPermitidos } from '../../modules/useModulosPermitidos';
import { Activity, Bell, LogOut, Moon, Search, Shield, Sun, UserCheck } from 'lucide-react';
import { Usuario, Notificacao } from '../../types';
import { USUARIOS_MOCK } from '../../services/store';
import type { AppModuleId } from '../../types';
import { MarcaSeju } from '../marca/Araucaria';

type Destino = 'hub' | AppModuleId | 'auditoria';

export interface TopBarProps {
  currentUser: Usuario;
  /** Só no modo demonstração: troca de perfil fictício. */
  onSwitchUser?: (user: Usuario) => void;
  /** Só com login real. */
  onSair?: () => void;
  notificacoes: Notificacao[];
  onMarkNotificationRead: (id: string) => void;
  activeApp: Destino;
  onNavigateApp: (appId: Destino, subTab?: string) => void;
  onOpenCommandPalette: () => void;
  onOpenMobileSidebar?: () => void;
  onOpenDiagnostico?: () => void;
  /** Selos nas pílulas. */
  pendentesMesa?: number;
  pendentesFrota?: number;
}

/** Nomes curtos para as pílulas da navegação. */
const ROTULO_CURTO: Record<string, string> = {
  frota: 'Frotas',
  chamados: 'Chamados',
  salas: 'Salas',
  diarias: 'Diárias',
  cense: 'CENSE',
  ramais: 'Ramais',
  votacao: 'Votação',
  auditoria: 'Auditoria',
  admin: 'Admin',
};

const semTitulo = (nome: string) => nome.replace(/^(Dra?\.|Sr\.|Sra\.)\s+/i, '');
const iniciais = (nome: string) =>
  semTitulo(nome).split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onSwitchUser,
  onSair,
  notificacoes,
  onMarkNotificationRead,
  activeApp,
  onNavigateApp,
  onOpenCommandPalette,
  onOpenDiagnostico,
  pendentesMesa = 0,
  pendentesFrota = 0,
}) => {
  const [notifAberta, setNotifAberta] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [escuro, setEscuro] = useState(() => document.documentElement.classList.contains('dark'));
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fora = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifAberta(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAberto(false);
    };
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, []);

  const alternarTema = () => {
    const proximo = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', proximo);
    document.body.classList.toggle('theme-midnight', proximo);
    setEscuro(proximo);
  };

  const modulos = useModulosPermitidos(currentUser);

  // Login de entidade só tem a Votação: não mostra a Mesa.
  const soVotacao = modulos.length === 1 && modulos[0].id === 'votacao';
  const pilulas: Array<{ id: Destino; rotulo: string; selo?: number }> = [
    ...(soVotacao ? [] : [{ id: 'hub' as Destino, rotulo: 'Mesa', selo: pendentesMesa || undefined }]),
    ...modulos.map((m) => ({
      id: m.id as Destino,
      rotulo: ROTULO_CURTO[m.id] ?? m.nome,
      selo: m.id === 'frota' && pendentesFrota ? pendentesFrota : undefined,
    })),
  ];

  const naoLidas = notificacoes.filter((n) => !n.lida).length;
  const botaoRedondo =
    'relative w-11 h-11 shrink-0 rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] flex items-center justify-center hover:border-[var(--text)] transition-colors cursor-pointer';

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg)]/95 border-b border-transparent">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 pt-4 pb-3 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="button" onClick={() => onNavigateApp('hub')} className="cursor-pointer rounded-[var(--radius-md)]" aria-label="Seju — ir para a Mesa">
          <MarcaSeju />
        </button>

        <nav aria-label="Módulos" className="order-3 lg:order-2 w-full lg:w-auto lg:flex-1 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
          <ul className="flex items-center gap-1.5 lg:justify-center min-w-max">
            {pilulas.map((p) => {
              const ativa = activeApp === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onNavigateApp(p.id)}
                    aria-current={ativa ? 'page' : undefined}
                    className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-[14px] transition-colors cursor-pointer whitespace-nowrap ${
                      ativa
                        ? 'bg-[var(--noite)] text-white font-semibold dark:bg-white dark:text-[var(--noite)]'
                        : 'border-[1.5px] border-[var(--border-strong)] text-[var(--text)] font-medium hover:border-[var(--text)]'
                    }`}
                  >
                    {p.rotulo}
                    {p.selo !== undefined && (
                      <span
                        className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-[12px] font-bold flex items-center justify-center ${
                          ativa ? 'bg-[var(--lima)] text-[var(--noite)]' : 'bg-[var(--lima)] text-[var(--noite)]'
                        }`}
                        aria-label={`${p.selo} pendente${p.selo > 1 ? 's' : ''}`}
                      >
                        {p.selo}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="order-2 lg:order-3 ml-auto flex items-center gap-2">
          <button type="button" onClick={onOpenCommandPalette} className={botaoRedondo} aria-label="Buscar (Ctrl+K)" title="Buscar (Ctrl+K)">
            <Search size={18} />
          </button>
          <button type="button" onClick={alternarTema} className={`${botaoRedondo} hidden sm:flex`} aria-label={escuro ? 'Usar tema claro' : 'Usar tema escuro'} title={escuro ? 'Tema claro' : 'Tema escuro'}>
            {escuro ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifAberta((v) => !v)}
              className={botaoRedondo}
              aria-expanded={notifAberta}
              aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lida${naoLidas > 1 ? 's' : ''}` : 'Notificações'}
            >
              <Bell size={18} />
              {naoLidas > 0 && (
                <span aria-hidden="true" className="absolute top-2 right-2.5 w-[10px] h-[10px] rounded-full bg-[var(--verde-vivo)] border-2 border-[var(--surface)]" />
              )}
            </button>
            {notifAberta && (
              <div className="absolute right-0 mt-2 w-[min(92vw,380px)] bg-[var(--surface)] border border-[var(--border)] rounded-[22px] shadow-[var(--shadow-md)] z-50 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between">
                  <span className="font-display text-[16px] font-bold">Notificações</span>
                  {naoLidas > 0 && <span className="text-[12px] font-bold bg-[var(--lima)] text-[var(--noite)] rounded-full px-2.5 py-0.5">{naoLidas} nova{naoLidas > 1 ? 's' : ''}</span>}
                </div>
                <ul className="max-h-80 overflow-y-auto border-t border-[var(--border)] divide-y divide-[var(--border)]">
                  {notificacoes.length === 0 ? (
                    <li className="px-5 py-8 text-center text-[13.5px] text-[var(--text-muted)]">Nenhuma notificação por enquanto.</li>
                  ) : (
                    notificacoes.slice(0, 6).map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`w-full text-left px-5 py-3.5 hover:bg-[var(--surface-2)] cursor-pointer ${!n.lida ? 'bg-[var(--lima-soft)]' : ''}`}
                        >
                          <span className="block text-[13.5px] font-semibold">{n.titulo}</span>
                          <span className="block mt-0.5 text-[13px] text-[var(--text-muted)] line-clamp-2">{n.mensagem}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuAberto((v) => !v)}
              aria-expanded={menuAberto}
              aria-label={`${semTitulo(currentUser.nome)}, ${currentUser.cargo}. Abrir menu da conta`}
              className="w-11 h-11 rounded-full bg-[var(--lima)] text-[var(--noite)] font-bold text-[14px] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[var(--noite)] hover:ring-offset-2 hover:ring-offset-[var(--bg)]"
            >
              {iniciais(currentUser.nome)}
            </button>
            {menuAberto && (
              <div className="absolute right-0 mt-2 w-72 bg-[var(--surface)] border border-[var(--border)] rounded-[22px] shadow-[var(--shadow-md)] z-50 overflow-hidden">
                <div className="px-5 py-4">
                  <p className="font-semibold text-[14.5px]">{currentUser.nome}</p>
                  <p className="text-[13px] text-[var(--text-muted)]">{currentUser.cargo}</p>
                  {currentUser.setor && <p className="text-[12.5px] text-[var(--text-subtle)] mt-0.5">{currentUser.setor}</p>}
                </div>

                {onSwitchUser && (
                  <div className="px-2 pb-2 border-t border-[var(--border)] pt-2">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Perfis da demonstração</p>
                    {USUARIOS_MOCK.map((u) => {
                      const atual = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => { onSwitchUser(u); setMenuAberto(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-[14px] text-left cursor-pointer ${atual ? 'bg-[var(--lima-soft)] font-semibold' : 'hover:bg-[var(--surface-2)]'}`}
                        >
                          <span>
                            <span className="block text-[13.5px]">{u.nome}</span>
                            <span className="block text-[12px] text-[var(--text-muted)]">{u.cargo}</span>
                          </span>
                          {atual && <UserCheck size={15} className="text-[var(--verde)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="p-2 border-t border-[var(--border)]">
                  <button type="button" onClick={() => { onNavigateApp('auditoria'); setMenuAberto(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-[13.5px] hover:bg-[var(--surface-2)] cursor-pointer">
                    <Shield size={16} className="text-[var(--text-muted)]" /> Auditoria
                  </button>
                  {onOpenDiagnostico && (
                    <button type="button" onClick={() => { onOpenDiagnostico(); setMenuAberto(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-[13.5px] hover:bg-[var(--surface-2)] cursor-pointer">
                      <Activity size={16} className="text-[var(--text-muted)]" /> Diagnóstico para o suporte
                    </button>
                  )}
                  <button type="button" onClick={alternarTema}
                    className="sm:hidden w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-[13.5px] hover:bg-[var(--surface-2)] cursor-pointer">
                    {escuro ? <Sun size={16} /> : <Moon size={16} />} {escuro ? 'Tema claro' : 'Tema escuro'}
                  </button>
                  {onSair && (
                    <button type="button" onClick={() => { setMenuAberto(false); onSair(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-[13.5px] hover:bg-[var(--surface-2)] cursor-pointer">
                      <LogOut size={16} className="text-[var(--text-muted)]" /> Sair
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
