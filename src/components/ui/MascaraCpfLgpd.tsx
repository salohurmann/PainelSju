import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { eventBus } from '../../services/eventBus';

interface MascaraCpfLgpdProps {
  cpf: string;
  servidorConsultorNome?: string;
  contexto?: string;
  className?: string;
  mostrarIcone?: boolean;
}

/**
 * Componente de Proteção de Dados LGPD para exibição de CPF
 * - Mascarado por padrão (***.456.789-**)
 * - Revelação temporária (10s) auditada e registrada no log imutável SHA-256
 */
export const MascaraCpfLgpd: React.FC<MascaraCpfLgpdProps> = ({
  cpf,
  servidorConsultorNome = 'Servidor Autenticado',
  contexto = 'Consulta em Tela',
  className = '',
  mostrarIcone = true
}) => {
  const [revelado, setRevelado] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Formata o CPF puro ou com pontuação
  const limpo = cpf.replace(/\D/g, '');
  const cpfFormatado = limpo.length === 11
    ? `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`
    : cpf;

  // Máscara com apenas os dígitos centrais visíveis
  const cpfMascarado = limpo.length === 11
    ? `***.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-**`
    : '***.***.***-**';

  const toggleRevelar = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!revelado) {
      setRevelado(true);

      // Emite auditoria para o barramento de segurança LGPD
      eventBus.emit('seguranca.cpf_revelado', {
        servidorConsultor: servidorConsultorNome,
        cpfConsultado: cpfFormatado,
        contexto
      });

      // Temporizador de auto-mascaramento de 10 segundos
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setRevelado(false);
      }, 10000);
    } else {
      setRevelado(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono select-none ${className}`}>
      <span className={revelado ? 'text-[var(--text)] font-semibold' : 'text-[var(--text-muted)]'}>
        {revelado ? cpfFormatado : cpfMascarado}
      </span>

      {mostrarIcone && (
        <button
          type="button"
          onClick={toggleRevelar}
          title={revelado ? 'Ocultar CPF (Auditado LGPD)' : 'Revelar CPF (Ação auditada via SHA-256)'}
          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--brand)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          aria-label={revelado ? 'Ocultar CPF' : 'Revelar CPF'}
        >
          {revelado ? <EyeOff size={13} className="text-[var(--brand)]" /> : <Eye size={13} />}
        </button>
      )}
    </span>
  );
};
