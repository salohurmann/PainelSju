import React, { useEffect, useState } from 'react';
import { Usuario } from '../../types';
import { soundFX } from '../../services/soundFx';
import { ModuloCabecalho, AbasModulo, NumeroModulo } from '../modulo/ModuloCabecalho';
import { RAMAIS_DATA, RamalItem } from './dadosRamais';
import { Search, Copy, Check, Mail, Phone, Star, Users, Building2, MapPin } from 'lucide-react';

export type { RamalItem } from './dadosRamais';

interface GuiaRamaisViewProps {
  currentUser?: Usuario;
  onVoltarHub: () => void;
}

type Visao = 'lista' | 'setores' | 'favoritos';

const CHAVE_FAVORITOS = 'seju_ramais_favoritos';
const ANDARES = ['Térreo', '1º Andar', '2º Andar', '3º Andar'];

const iniciais = (nome: string) => {
  const partes = nome.replace(/^(Dra?\.|Prof\.|Eng\.)\s+/i, '').split(/\s+/).filter(Boolean);
  if (!partes.length) return '·';
  return (partes.length === 1 ? partes[0].slice(0, 2) : partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};
const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const lerFavoritos = (): string[] => {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_FAVORITOS) ?? 'null');
    if (Array.isArray(salvo)) return salvo;
  } catch {
    /* sem armazenamento: usa os padrões */
  }
  return RAMAIS_DATA.filter(r => r.favorito).map(r => r.id);
};

export const GuiaRamaisView: React.FC<GuiaRamaisViewProps> = ({ onVoltarHub }) => {
  const [busca, setBusca] = useState('');
  const [andar, setAndar] = useState<string>('todos');
  const [visao, setVisao] = useState<Visao>('lista');
  const [favoritos, setFavoritos] = useState<string[]>(lerFavoritos);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos));
    } catch {
      /* segue só nesta sessão */
    }
  }, [favoritos]);

  const termo = semAcento(busca.trim());
  const lista = RAMAIS_DATA.filter(
    r =>
      (andar === 'todos' || r.andar.startsWith(andar)) &&
      (visao !== 'favoritos' || favoritos.includes(r.id)) &&
      (!termo || [r.setor, r.departamento, r.responsavel, r.cargo, r.ramal, r.email].some(c => semAcento(c).includes(termo))),
  ).sort((a, b) => a.setor.localeCompare(b.setor, 'pt-BR'));

  const departamentos = [...new Set(RAMAIS_DATA.map(r => r.departamento))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const alternarFavorito = (id: string) => {
    soundFX.playClick();
    setFavoritos(f => (f.includes(id) ? f.filter(x => x !== id) : [...f, id]));
  };

  const copiar = async (r: RamalItem) => {
    try {
      await navigator.clipboard.writeText(r.ramal);
      setCopiado(r.id);
      setTimeout(() => setCopiado(c => (c === r.id ? null : c)), 1800);
    } catch {
      /* navegador sem permissão de área de transferência */
    }
  };

  const Cartao: React.FC<{ r: RamalItem }> = ({ r }) => {
    const fav = favoritos.includes(r.id);
    return (
      <li className="flex flex-col rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCEEFB] text-sm font-bold text-[#00385E]">{iniciais(r.responsavel)}</span>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold text-[var(--text)]">{r.setor}</div>
              <div className="truncate text-xs text-[var(--text-muted)]">{r.responsavel} · {r.cargo}</div>
            </div>
          </div>
          <button
            type="button"
            aria-pressed={fav}
            aria-label={fav ? `Tirar ${r.setor} dos favoritos` : `Guardar ${r.setor} nos favoritos`}
            onClick={() => alternarFavorito(r.id)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full cursor-pointer ${fav ? 'bg-[var(--warning-soft)] text-[var(--warning)]' : 'bg-[var(--surface-2)] text-[var(--text-subtle)] hover:text-[var(--text)]'}`}
          >
            <Star size={16} className={fav ? 'fill-current' : ''} />
          </button>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Ramal</div>
            <div className="font-display text-4xl font-bold leading-none tabular-nums text-[var(--text)]">{r.ramal}</div>
          </div>
          <button
            type="button"
            onClick={() => copiar(r)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer"
          >
            {copiado === r.id ? <><Check size={14} strokeWidth={3} className="text-[var(--verde)]" /> Copiado</> : <><Copy size={14} /> Copiar</>}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1"><MapPin size={13} /> {r.andar}</span>
          <span className="inline-flex items-center gap-1"><Building2 size={13} /> {r.departamento}</span>
        </div>

        <div className="mt-auto flex gap-2 pt-4">
          <a href={`tel:${r.telefoneDireto.replace(/\D/g, '')}`} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#0072BB] text-[13px] font-semibold text-white hover:bg-[#005A9C]">
            <Phone size={15} /> <span className="tabular-nums">{r.telefoneDireto}</span>
          </a>
          <a href={`mailto:${r.email}`} aria-label={`Enviar e-mail para ${r.email}`} title={r.email} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--border)] px-4 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]">
            <Mail size={15} /> E-mail
          </a>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-5 font-sans pb-12">
      <ModuloCabecalho
        cor="ceu"
        rotulo="Contatos · Sede e unidades"
        titulo="Ramais"
        descricao="Encontre o ramal de qualquer setor ou pessoa, filtre por andar e guarde os contatos que você mais usa."
        onVoltar={onVoltarHub}
      >
        <div className="flex flex-wrap gap-2">
          <NumeroModulo rotulo="Contatos" valor={RAMAIS_DATA.length} />
          <NumeroModulo rotulo="Setores" valor={departamentos.length} />
          <NumeroModulo rotulo="Seus favoritos" valor={favoritos.length} />
        </div>
        <AbasModulo<Visao>
          ativa={visao}
          onChange={id => {
            soundFX.playClick();
            setVisao(id);
          }}
          itens={[
            { id: 'lista', rotulo: 'Todos', icone: <Users size={14} /> },
            { id: 'setores', rotulo: 'Por setor', icone: <Building2 size={14} /> },
            { id: 'favoritos', rotulo: 'Favoritos', icone: <Star size={14} />, contagem: favoritos.length },
          ]}
        />
      </ModuloCabecalho>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:w-[420px]">
          <span className="sr-only">Buscar ramal</span>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Setor, pessoa, cargo ou número"
            className="h-12 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-[15px] text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none focus:border-[var(--brand)]"
          />
        </label>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1" role="group" aria-label="Filtrar por andar">
          {['todos', ...ANDARES].map(a => (
            <button
              key={a}
              type="button"
              aria-pressed={andar === a}
              onClick={() => setAndar(a)}
              className={`h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold cursor-pointer ${
                andar === a ? 'bg-[#00385E] text-white' : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {a === 'todos' ? 'Todos os andares' : a}
            </button>
          ))}
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-14 text-center">
          <div className="font-display text-xl font-bold text-[var(--text)]">
            {visao === 'favoritos' && !termo ? 'Nenhum favorito ainda.' : 'Nenhum ramal encontrado.'}
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {visao === 'favoritos' && !termo ? 'Toque na estrela de um contato para guardar aqui.' : 'Tente outra palavra ou outro andar.'}
          </p>
        </div>
      ) : visao === 'setores' ? (
        <div className="space-y-6">
          {departamentos
            .map(d => ({ d, itens: lista.filter(r => r.departamento === d) }))
            .filter(g => g.itens.length)
            .map(g => (
              <section key={g.d}>
                <h3 className="font-display mb-3 flex items-baseline gap-2 text-xl font-bold text-[var(--text)]">
                  {g.d} <span className="text-sm font-semibold text-[var(--text-subtle)]">{g.itens.length}</span>
                </h3>
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {g.itens.map(r => <Cartao key={r.id} r={r} />)}
                </ul>
              </section>
            ))}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lista.map(r => <Cartao key={r.id} r={r} />)}
        </ul>
      )}
    </div>
  );
};
