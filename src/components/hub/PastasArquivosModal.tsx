import React, { useState } from 'react';
import { X, FolderGit2, HardDrive, Copy, Check, ExternalLink, ShieldCheck, FileText, Info } from 'lucide-react';
import { Usuario } from '../../types';

interface PastasArquivosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
}

export const PastasArquivosModal: React.FC<PastasArquivosModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [copiadoPath, setCopiadoPath] = useState<string | null>(null);

  if (!isOpen) return null;

  const isNas = currentUser.setor.toUpperCase().includes('NAS');
  const isUtec = currentUser.setor.toUpperCase().includes('UTEC');

  const pastasDeRede = isNas
    ? [
        {
          id: 'p-1',
          nome: 'S:\\NAS\\Processos_Gerais',
          descricao: 'Processos de compras, requisições de material e termos do Núcleo Administrativo.',
          tipo: 'Pasta de Rede Windows (SMB)',
          tamanho: '14.2 GB',
          restricao: 'Exclusivo NAS / Chefia'
        },
        {
          id: 'p-2',
          nome: 'S:\\NAS\\Contratos_Vigentes_2026',
          descricao: 'Cópias digitais de termos aditivos, notas de empenho e atestados de recebimento.',
          tipo: 'Pasta de Rede Windows (SMB)',
          tamanho: '8.4 GB',
          restricao: 'Leitura e Escrita'
        },
        {
          id: 'p-3',
          nome: 'S:\\Publico\\Modelos_Oficiais_SEJU',
          descricao: 'Papéis timbrados oficiais, formulários de diárias e modelos padrão de despacho.',
          tipo: 'Pasta Compartilhada da SEJU',
          tamanho: '1.2 GB',
          restricao: 'Somente Leitura'
        }
      ]
    : isUtec
    ? [
        {
          id: 'p-1',
          nome: 'S:\\UTEC\\Documentacao_Tecnica',
          descricao: 'Topologia de rede, manuais de configuração de switches e relatórios GovCloud.',
          tipo: 'Pasta de Rede Windows (SMB)',
          tamanho: '22.8 GB',
          restricao: 'Exclusivo UTEC / TI'
        },
        {
          id: 'p-2',
          nome: 'S:\\UTEC\\Backups_Scripts',
          descricao: 'Rotinas automatizadas de backup e inventário de ativos de tecnologia.',
          tipo: 'Pasta de Rede Windows (SMB)',
          tamanho: '45.1 GB',
          restricao: 'Exclusivo Administradores'
        },
        {
          id: 'p-3',
          nome: 'S:\\Publico\\Softwares_Drivers',
          descricao: 'Instaladores padrão de impressoras e certificados digitais ICP-Brasil.',
          tipo: 'Pasta Compartilhada da SEJU',
          tamanho: '6.4 GB',
          restricao: 'Somente Leitura'
        }
      ]
    : [
        {
          id: 'p-1',
          nome: `S:\\${currentUser.setor}\\Documentos`,
          descricao: 'Arquivos setoriais de trabalho e relatórios da equipe.',
          tipo: 'Pasta de Rede Windows (SMB)',
          tamanho: '5.6 GB',
          restricao: 'Exclusivo do Setor'
        },
        {
          id: 'p-2',
          nome: 'S:\\Publico\\Modelos_Oficiais_SEJU',
          descricao: 'Papéis timbrados oficiais, formulários de diárias e modelos padrão.',
          tipo: 'Pasta Compartilhada da SEJU',
          tamanho: '1.2 GB',
          restricao: 'Somente Leitura'
        }
      ];

  const handleCopiar = (caminho: string) => {
    navigator.clipboard.writeText(caminho);
    setCopiadoPath(caminho);
    setTimeout(() => setCopiadoPath(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[88vh] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-2xl flex flex-col overflow-hidden text-[var(--text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo do Modal */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]/40">
          <div>
            <div className="flex items-center gap-2">
              <FolderGit2 className="text-[var(--brand)]" size={20} />
              <h2 className="text-lg font-bold tracking-tight font-heading">
                Pastas e Arquivos · {currentUser.setor}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Endereços diretos dos drives de rede (S:\) e pastas no Google Workspace vinculadas ao seu login.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition cursor-pointer"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instrução Rápida de Mapeamento Windows */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-sky-200 flex items-start gap-3">
            <Info size={16} className="shrink-0 text-[var(--brand)] mt-0.5" />
            <p className="leading-relaxed">
              <strong>Como abrir no Windows:</strong> Pressione <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono text-[10px] border border-blue-200">Win + R</kbd>, cole o caminho da pasta abaixo e aperte Enter, ou copie e acesse pelo Explorador de Arquivos.
            </p>
          </div>

          {/* Seção 1: Pastas de Rede no Servidor Windows (S:\) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 font-heading">
              <HardDrive size={14} className="text-[var(--brand)]" />
              Pastas de Rede Locais (Storage Sede Hauer)
            </h3>

            <div className="space-y-2.5">
              {pastasDeRede.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xs hover:border-[var(--brand)] transition-all space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--text)] select-all bg-[var(--surface-2)] px-2 py-1 rounded border border-[var(--border)]">
                        {p.nome}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded">
                        {p.restricao}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopiar(p.nome)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-[var(--text)] border border-[var(--border)] transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      {copiadoPath === p.nome ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span>{copiadoPath === p.nome ? 'Caminho copiado!' : 'Copiar caminho'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-[var(--text-muted)]">
                    {p.descricao}
                  </p>

                  <div className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-2 pt-1 border-t border-[var(--border-subtle)]">
                    <span>{p.tipo}</span>
                    <span>·</span>
                    <span>Espaço em disco: {p.tamanho}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seção 2: Drives Compartilhados no Google Workspace */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 font-heading">
              <FolderGit2 size={14} className="text-emerald-600" />
              Drives Compartilhados na Nuvem (Google Workspace)
            </h3>

            <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-[var(--text)] font-heading">
                  Drive Compartilhado · {currentUser.setor}
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Acesso sincronizado em tempo real para todos os integrantes do grupo {currentUser.email.split('@')[1]}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.open('https://drive.google.com', '_blank')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white shadow-2xs transition flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
              >
                <span>Abrir Google Drive</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--surface-2)]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface)] text-xs font-semibold text-[var(--text)] border border-[var(--border)] transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
