import React, { useState } from 'react';
import { Search, ExternalLink, ArrowRight, Mail, HardDrive, Video, Globe, FileText, Package, Car, Wrench, CalendarDays, Plane, Building2, Phone, ShieldCheck, Archive, Vote } from 'lucide-react';
import type { AppModuleId } from '../../types';
import { Janela } from '../ui/Janela';

interface CatalogoSistemasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: AppModuleId | 'auditoria', subTab?: string) => void;
  setor?: string;
  /** Módulos internos que o usuário pode abrir. */
  modulosPermitidos?: string[];
}

interface Interno {
  id: AppModuleId | 'auditoria';
  nome: string;
  descricao: string;
  icone: React.ReactNode;
}
interface Externo {
  id: string;
  nome: string;
  descricao: string;
  url?: string;
  icone: React.ReactNode;
  emLevantamento?: boolean;
}

const INTERNOS: Interno[] = [
  { id: 'frota', nome: 'Frotas', descricao: 'Pedir carro oficial, autorizar e registrar vistoria.', icone: <Car size={20} /> },
  { id: 'chamados', nome: 'Chamados', descricao: 'Suporte de TI, manutenção do prédio e material.', icone: <Wrench size={20} /> },
  { id: 'salas', nome: 'Salas', descricao: 'Reservar sala de reunião e auditório.', icone: <CalendarDays size={20} /> },
  { id: 'diarias', nome: 'Diárias', descricao: 'Calcular e pedir diária de viagem.', icone: <Plane size={20} /> },
  { id: 'cense', nome: 'CENSE', descricao: 'Fundo rotativo e notas fiscais das unidades.', icone: <Building2 size={20} /> },
  { id: 'votacao', nome: 'Votação', descricao: 'Eleições das entidades (UTSC).', icone: <Vote size={20} /> },
  { id: 'ramais', nome: 'Ramais', descricao: 'Telefones e e-mails dos setores.', icone: <Phone size={20} /> },
  { id: 'auditoria', nome: 'Auditoria', descricao: 'Quem fez o quê, e quando.', icone: <ShieldCheck size={20} /> },
];

const EXTERNOS: Externo[] = [
  { id: 'eprotocolo', nome: 'e-Protocolo', descricao: 'Processos administrativos do Estado.', url: 'https://www.eprotocolo.pr.gov.br', icone: <FileText size={20} /> },
  { id: 'gms', nome: 'GMS', descricao: 'Compras, contratos e estoque.', url: 'https://www.gms.pr.gov.br', icone: <Package size={20} /> },
  { id: 'email', nome: 'E-mail institucional', descricao: 'Sua caixa de entrada.', url: 'https://mail.google.com', icone: <Mail size={20} /> },
  { id: 'drive', nome: 'Google Drive', descricao: 'Documentos e planilhas do setor.', url: 'https://drive.google.com', icone: <HardDrive size={20} /> },
  { id: 'meet', nome: 'Google Meet', descricao: 'Reuniões por vídeo.', url: 'https://meet.google.com', icone: <Video size={20} /> },
  { id: 'site', nome: 'Site da SEJU', descricao: 'Portal público da Secretaria.', url: 'https://www.justica.pr.gov.br', icone: <Globe size={20} /> },
  { id: 'patrimonio', nome: 'Patrimônio', descricao: 'Inventário e termos de responsabilidade.', icone: <Archive size={20} />, emLevantamento: true },
];

const normalizar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const CatalogoSistemasModal: React.FC<CatalogoSistemasModalProps> = ({ isOpen, onClose, onOpenApp, modulosPermitidos }) => {
  const [busca, setBusca] = useState('');
  if (!isOpen) return null;

  const t = normalizar(busca.trim());
  const casa = (x: { nome: string; descricao: string }) => !t || normalizar(`${x.nome} ${x.descricao}`).includes(t);
  const internos = INTERNOS.filter(i => (!modulosPermitidos || modulosPermitidos.includes(i.id)) && casa(i));
  const externos = EXTERNOS.filter(casa);

  return (
    <Janela titulo="Todos os sistemas" onFechar={onClose} largura="xl">
      <label className="relative block">
        <span className="sr-only">Buscar sistema</span>
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
        <input
          autoFocus
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar sistema"
          className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface-2)] pl-11 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none focus:border-[var(--brand)]"
        />
      </label>

      {internos.length > 0 && (
        <section className="mt-5">
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Aqui no Painel</h4>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {internos.map(i => (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => {
                    onOpenApp(i.id);
                    onClose();
                  }}
                  className="group flex w-full items-center gap-3 rounded-[18px] border border-[var(--border)] p-3.5 text-left hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] cursor-pointer"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0072BB] text-white">{i.icone}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-[var(--text)]">{i.nome}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{i.descricao}</span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-[var(--text-subtle)] group-hover:text-[var(--brand)]" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {externos.length > 0 && (
        <section className="mt-5">
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Sistemas do Estado e do Google</h4>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {externos.map(e => {
              const conteudo = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text)]">{e.icone}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-[var(--text)]">{e.nome}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{e.emLevantamento ? 'Em levantamento: ainda sem acesso pelo Painel.' : e.descricao}</span>
                  </span>
                  {e.url && <ExternalLink size={15} className="shrink-0 text-[var(--text-subtle)]" />}
                </>
              );
              return (
                <li key={e.id}>
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-[18px] border border-[var(--border)] p-3.5 hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]">
                      {conteudo}
                      <span className="sr-only">(abre em outra aba)</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 rounded-[18px] border border-dashed border-[var(--border-strong)] p-3.5 opacity-75">{conteudo}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!internos.length && !externos.length && <p className="mt-8 text-center text-sm text-[var(--text-muted)]">Nenhum sistema encontrado.</p>}
    </Janela>
  );
};
