import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CornerDownLeft, Car, CheckSquare, ClipboardCheck, Wrench, CalendarDays, Plane, Receipt, Phone, LayoutGrid, ShieldCheck, Building2 } from 'lucide-react';
import { useJanela } from '../ui/Janela';
import { RAMAIS_DATA } from '../ramais/dadosRamais';

type Destino = 'hub' | 'frota' | 'chamados' | 'salas' | 'diarias' | 'cense' | 'ramais' | 'votacao' | 'admin' | 'auditoria';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (appId: Destino, subTab?: string) => void;
  /** Módulos que o usuário pode abrir; os demais não aparecem. */
  modulosPermitidos?: string[];
}

interface Item {
  id: string;
  grupo: 'Fazer' | 'Ir para' | 'Ramais';
  titulo: string;
  detalhe: string;
  icone: React.ReactNode;
  modulo: Destino;
  aba?: string;
  palavras?: string;
}

const ACOES: Item[] = [
  { id: 'a-veiculo', grupo: 'Fazer', titulo: 'Pedir um veículo', detalhe: 'Frotas', icone: <Car size={18} />, modulo: 'frota', aba: 'nova-solicitacao', palavras: 'carro viatura viagem' },
  { id: 'a-aprovar', grupo: 'Fazer', titulo: 'Autorizar pedidos de veículo', detalhe: 'Frotas · chefia', icone: <CheckSquare size={18} />, modulo: 'frota', aba: 'aprovacoes', palavras: 'aprovar chefia' },
  { id: 'a-vistoria', grupo: 'Fazer', titulo: 'Registrar saída ou volta de veículo', detalhe: 'Frotas · vistoria', icone: <ClipboardCheck size={18} />, modulo: 'frota', aba: 'checkin-checkout', palavras: 'chave km fotos' },
  { id: 'a-chamado', grupo: 'Fazer', titulo: 'Abrir um chamado', detalhe: 'Chamados', icone: <Wrench size={18} />, modulo: 'chamados', palavras: 'suporte ti impressora computador manutenção' },
  { id: 'a-sala', grupo: 'Fazer', titulo: 'Reservar uma sala', detalhe: 'Salas', icone: <CalendarDays size={18} />, modulo: 'salas', palavras: 'auditório reunião' },
  { id: 'a-diaria', grupo: 'Fazer', titulo: 'Pedir diária de viagem', detalhe: 'Diárias', icone: <Plane size={18} />, modulo: 'diarias', palavras: 'viagem pernoite' },
  { id: 'a-nota', grupo: 'Fazer', titulo: 'Lançar nota fiscal do CENSE', detalhe: 'CENSE', icone: <Receipt size={18} />, modulo: 'cense', palavras: 'nf-e fundo rotativo' },
];

const MODULOS: Item[] = [
  { id: 'm-hub', grupo: 'Ir para', titulo: 'Mesa', detalhe: 'O que precisa de você', icone: <LayoutGrid size={18} />, modulo: 'hub', palavras: 'início home' },
  { id: 'm-frota', grupo: 'Ir para', titulo: 'Frotas', detalhe: 'Veículos oficiais', icone: <Car size={18} />, modulo: 'frota' },
  { id: 'm-chamados', grupo: 'Ir para', titulo: 'Chamados', detalhe: 'TI, manutenção e material', icone: <Wrench size={18} />, modulo: 'chamados' },
  { id: 'm-salas', grupo: 'Ir para', titulo: 'Salas', detalhe: 'Salas e auditórios', icone: <CalendarDays size={18} />, modulo: 'salas' },
  { id: 'm-diarias', grupo: 'Ir para', titulo: 'Diárias', detalhe: 'Viagens a serviço', icone: <Plane size={18} />, modulo: 'diarias' },
  { id: 'm-cense', grupo: 'Ir para', titulo: 'CENSE', detalhe: 'Fundo rotativo das unidades', icone: <Building2 size={18} />, modulo: 'cense' },
  { id: 'm-ramais', grupo: 'Ir para', titulo: 'Ramais', detalhe: 'Contatos da sede', icone: <Phone size={18} />, modulo: 'ramais' },
  { id: 'm-votacao', grupo: 'Ir para', titulo: 'Votação', detalhe: 'Eleições das entidades', icone: <CheckSquare size={18} />, modulo: 'votacao', palavras: 'eleição votar entidades utsc' },
  { id: 'm-admin', grupo: 'Ir para', titulo: 'Administração', detalhe: 'Pessoas e acessos', icone: <ShieldCheck size={18} />, modulo: 'admin', palavras: 'permissões setores papéis usuários' },
  { id: 'm-auditoria', grupo: 'Ir para', titulo: 'Auditoria', detalhe: 'Registro de ações', icone: <ShieldCheck size={18} />, modulo: 'auditoria' },
];

const MODULO_DO_DESTINO: Record<Destino, string | null> = {
  hub: null, frota: 'frota', chamados: 'chamados', salas: 'salas', diarias: 'diarias', cense: 'cense', ramais: 'ramais', votacao: 'votacao', admin: 'admin', auditoria: 'auditoria',
};

const normalizar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate, modulosPermitidos }) => {
  const [busca, setBusca] = useState('');
  const [ativo, setAtivo] = useState(0);
  const listaRef = useRef<HTMLUListElement>(null);
  const ref = useJanela(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setBusca('');
      setAtivo(0);
    }
  }, [isOpen]);

  const permitido = (i: Item) => {
    const m = MODULO_DO_DESTINO[i.modulo];
    if (!m) return !(modulosPermitidos && modulosPermitidos.length === 1 && modulosPermitidos[0] === 'votacao');
    return !modulosPermitidos || modulosPermitidos.includes(m);
  };

  const itens = useMemo(() => {
    const t = normalizar(busca.trim());
    const base = [...ACOES, ...MODULOS].filter(permitido);
    const ramais: Item[] = RAMAIS_DATA.map(r => ({
      id: 'r-' + r.id,
      grupo: 'Ramais' as const,
      titulo: `${r.ramal} · ${r.setor}`,
      detalhe: `${r.responsavel} · ${r.andar}`,
      icone: <Phone size={18} />,
      modulo: 'ramais' as const,
      palavras: `${r.departamento} ${r.cargo} ${r.email}`,
    }));
    if (!t) return base;
    const casa = (i: Item) => normalizar(`${i.titulo} ${i.detalhe} ${i.palavras ?? ''}`).includes(t);
    return [...base.filter(casa), ...(permitido(ramais[0] ?? MODULOS[0]) ? ramais.filter(casa).slice(0, 5) : [])];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, modulosPermitidos]);

  useEffect(() => {
    listaRef.current?.querySelector<HTMLElement>(`[data-indice="${ativo}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [ativo]);

  if (!isOpen) return null;

  const abrir = (i: Item) => {
    onNavigate(i.modulo, i.aba);
    onClose();
  };

  const tecla = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAtivo(a => Math.min(itens.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAtivo(a => Math.max(0, a - 1));
    } else if (e.key === 'Enter' && itens[ativo]) {
      e.preventDefault();
      abrir(itens[ativo]);
    }
  };

  let ultimoGrupo = '';
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-[#0B1B2E]/60 p-4 pt-[12vh]" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Buscar no Painel" tabIndex={-1} className="w-full max-w-xl overflow-hidden rounded-[28px] bg-[var(--surface)] outline-none">
        <label className="flex items-center gap-3 border-b border-[var(--border)] px-5">
          <Search size={18} className="shrink-0 text-[var(--text-subtle)]" />
          <span className="sr-only">O que você procura</span>
          <input
            autoFocus
            value={busca}
            onChange={e => {
              setBusca(e.target.value);
              setAtivo(0);
            }}
            onKeyDown={tecla}
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-lista"
            aria-activedescendant={itens[ativo] ? `cmdk-${itens[ativo].id}` : undefined}
            placeholder="O que você procura? Ex.: carro, sala, ramal da TI"
            className="h-16 flex-1 bg-transparent text-[16px] text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none"
          />
          <kbd className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)]">Esc</kbd>
        </label>
        <ul id="cmdk-lista" ref={listaRef} role="listbox" className="max-h-[56vh] overflow-y-auto p-2">
          {itens.length === 0 && <li className="px-4 py-10 text-center text-sm text-[var(--text-muted)]">Nada encontrado para “{busca}”.</li>}
          {itens.map((i, idx) => {
            const cabecalho = i.grupo !== ultimoGrupo;
            ultimoGrupo = i.grupo;
            return (
              <React.Fragment key={i.id}>
                {cabecalho && (
                  <li role="presentation" className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                    {i.grupo}
                  </li>
                )}
                <li
                  id={`cmdk-${i.id}`}
                  role="option"
                  aria-selected={idx === ativo}
                  data-indice={idx}
                  onMouseMove={() => setAtivo(idx)}
                  onClick={() => abrir(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-[16px] px-3 py-2.5 ${idx === ativo ? 'bg-[var(--brand-soft)]' : ''}`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${idx === ativo ? 'bg-[#0072BB] text-white' : 'bg-[var(--surface-2)] text-[var(--text)]'}`}>{i.icone}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-[var(--text)]">{i.titulo}</span>
                    <span className="block truncate text-xs text-[var(--text-muted)]">{i.detalhe}</span>
                  </span>
                  {idx === ativo && <CornerDownLeft size={16} className="shrink-0 text-[var(--text-muted)]" />}
                </li>
              </React.Fragment>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--text-muted)]">
          <span>↑ ↓ para escolher · Enter para abrir</span>
          <span>
            <kbd className="font-semibold">?</kbd> mostra os atalhos
          </span>
        </div>
      </div>
    </div>
  );
};
