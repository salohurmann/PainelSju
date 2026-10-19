import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Usuario } from '../../types';
import { eventBus } from '../../services/eventBus';
import { 
  Activity, 
  Copy, 
  Check, 
  Terminal, 
  ShieldCheck, 
  Server, 
  HardDrive, 
  Cpu, 
  UserCheck,
  RefreshCw
} from 'lucide-react';

interface PainelDiagnosticoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
}

export const PainelDiagnosticoModal: React.FC<PainelDiagnosticoModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [copiado, setCopiado] = useState(false);

  // Coleta dados de telemetria do ambiente
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconhecido';
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const screenRes = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A';
  
  // Medição do LocalStorage
  let storageBytes = 0;
  let chavesContadas = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        storageBytes += (key.length + val.length) * 2;
        chavesContadas++;
      }
    }
  } catch {
    // Ignora se indisponível
  }

  const eventosRecentes = eventBus.getHistorico().slice(0, 8);

  const dadosDiagnostico = {
    sistema: 'SEJU · Gestão Integrada',
    versao: '2.4.0',
    ambiente: 'GovCloud Paraná (ICP-PR)',
    timestamp: new Date().toISOString(),
    statusRede: online ? 'ONLINE' : 'OFFLINE',
    resolucaoTela: screenRes,
    navegador: userAgent,
    usuario: {
      nome: currentUser.nome,
      username: currentUser.username,
      cargo: currentUser.cargo,
      setor: currentUser.setor,
      role: currentUser.role
    },
    armazenamentoLocal: {
      totalBytes: storageBytes,
      totalChaves: chavesContadas,
      tamanhoKb: (storageBytes / 1024).toFixed(2)
    },
    eventosRecentes: eventosRecentes.map(e => ({
      tipo: e.tipo,
      timestamp: e.timestamp,
      id: e.id
    }))
  };

  const handleCopiarDiagnostico = () => {
    navigator.clipboard.writeText(JSON.stringify(dadosDiagnostico, null, 2));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Painel de Diagnóstico & Suporte N1/N2"
      description="Telemetria operacional em tempo real para auditoria e suporte técnico da Celepar / SEJU."
      size="lg"
    >
      <div className="space-y-5 py-2">
        {/* Strip de Status do Sistema */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-1">
            <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] flex items-center gap-1">
              <Server size={11} className="text-[var(--brand)]" /> GovCloud PR
            </span>
            <div className="text-xs font-bold text-[var(--success)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
              99.98% Operacional
            </div>
          </div>

          <div className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-1">
            <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] flex items-center gap-1">
              <ShieldCheck size={11} className="text-[var(--brand)]" /> Criptografia
            </span>
            <div className="text-xs font-bold text-[var(--text)]">
              ICP-PR SHA-256
            </div>
          </div>

          <div className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-1">
            <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] flex items-center gap-1">
              <HardDrive size={11} className="text-[var(--brand)]" /> Armazenamento
            </span>
            <div className="text-xs font-bold text-[var(--text)]">
              {(storageBytes / 1024).toFixed(1)} KB ({chavesContadas} chaves)
            </div>
          </div>

          <div className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-1">
            <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] flex items-center gap-1">
              <UserCheck size={11} className="text-[var(--brand)]" /> Sessão Ativa
            </span>
            <div className="text-xs font-bold text-[var(--text)] truncate">
              {currentUser.nome.split(' ')[0]} ({currentUser.role})
            </div>
          </div>
        </div>

        {/* Telemetria de Eventos de Domínio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Activity size={12} className="text-[var(--brand)]" /> Últimos Eventos de Domínio (EventBus)
            </h4>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              {eventosRecentes.length} no buffer
            </span>
          </div>

          <div className="max-h-40 overflow-y-auto divide-y divide-[var(--border-subtle)] border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface-2)]/30 font-mono text-[11px]">
            {eventosRecentes.length === 0 ? (
              <div className="p-4 text-center text-[var(--text-muted)]">
                Nenhum evento registrado nesta sessão.
              </div>
            ) : (
              eventosRecentes.map((evt) => (
                <div key={evt.id} className="p-2.5 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-[var(--brand-subtle)] text-[var(--brand)] font-bold text-[10px]">
                      {evt.tipo}
                    </span>
                    <span className="text-[var(--text-muted)] text-[10px]">
                      ID: {evt.id}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Botão de Copiar JSON Estruturado de Suporte */}
        <div className="pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-[var(--text-muted)] text-center sm:text-left">
            Envie este pacote de diagnóstico ao abrir chamado de suporte técnico na Celepar.
          </div>

          <Button
            variant={copiado ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleCopiarDiagnostico}
            icon={copiado ? <Check size={14} /> : <Copy size={14} />}
            className="w-full sm:w-auto shrink-0"
          >
            {copiado ? 'Relatório Copiado!' : 'Copiar Relatório de Suporte'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
