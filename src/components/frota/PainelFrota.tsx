import React, { useState } from 'react';
import { Janela } from '../ui/Janela';
import { Veiculo, Agendamento, StatusVeiculo } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { soundFX } from '../../services/soundFx';
import { Plus, Search, Users, Fuel, Gauge, CalendarDays, AlertCircle } from 'lucide-react';

interface PainelFrotaProps {
  veiculos: Veiculo[];
  agendamentos: Agendamento[];
  onAdicionarVeiculo: (v: Veiculo) => void;
  onAtualizarVeiculo?: (vId: string, dados: Partial<Veiculo>) => void;
}

type Filtro = 'todos' | StatusVeiculo;

const STATUS: Record<StatusVeiculo, { texto: string; cls: string; ponto: string }> = {
  disponivel: { texto: 'No pátio', cls: 'bg-[var(--verde-soft)] text-[var(--verde)]', ponto: 'bg-[#00A859]' },
  em_missao: { texto: 'Em viagem', cls: 'bg-[var(--brand-soft)] text-[var(--brand)]', ponto: 'bg-[#0072BB]' },
  manutencao: { texto: 'Manutenção', cls: 'bg-[var(--warning-soft)] text-[var(--warning)]', ponto: 'bg-[#D98A00]' },
};

const ATIVOS = ['pendente', 'aprovado', 'em_andamento'];
// Placa Mercosul (ABC1D23) ou antiga (ABC1234)
const PLACA_VALIDA = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

const hojeIso = () => new Date().toISOString().slice(0, 10);
const formatarData = (d: string) => d.split('-').reverse().slice(0, 2).join('/');

const BarraTanque: React.FC<{ nivel: number }> = ({ nivel }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-3)]" role="img" aria-label={`Tanque com ${nivel}%`}>
    <div
      className={`h-full rounded-full ${nivel < 25 ? 'bg-[#C8372D]' : nivel < 50 ? 'bg-[#D98A00]' : 'bg-[#00A859]'}`}
      style={{ width: `${Math.max(0, Math.min(100, nivel))}%` }}
    />
  </div>
);

export const PainelFrota: React.FC<PainelFrotaProps> = ({ veiculos, agendamentos, onAdicionarVeiculo, onAtualizarVeiculo }) => {
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busca, setBusca] = useState('');
  const [fichaId, setFichaId] = useState<string | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);

  const termo = busca.trim().toLowerCase();
  const lista = veiculos.filter(
    v =>
      (filtro === 'todos' || v.status === filtro) &&
      (!termo || v.modelo.toLowerCase().includes(termo) || v.placa.toLowerCase().includes(termo)),
  );
  const contagem = (f: Filtro) => (f === 'todos' ? veiculos.length : veiculos.filter(v => v.status === f).length);
  const proximas = (vId: string) =>
    agendamentos
      .filter(a => a.veiculoId === vId && ATIVOS.includes(a.status) && a.datas.some(d => d >= hojeIso()))
      .sort((a, b) => (a.datas[0] ?? '').localeCompare(b.datas[0] ?? ''));

  const ficha = veiculos.find(v => v.id === fichaId) ?? null;

  const filtros: Array<{ id: Filtro; rotulo: string }> = [
    { id: 'todos', rotulo: 'Todos' },
    { id: 'disponivel', rotulo: 'No pátio' },
    { id: 'em_missao', rotulo: 'Em viagem' },
    { id: 'manutencao', rotulo: 'Manutenção' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1" role="tablist" aria-label="Filtrar veículos">
          {filtros.map(f => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors cursor-pointer ${
                filtro === f.id
                  ? 'bg-[#00385E] text-white'
                  : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {f.rotulo}
              <span
                className={`rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                  filtro === f.id ? 'bg-[#C6E86B] text-[#0B1B2E]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                }`}
              >
                {contagem(f.id)}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative block flex-1 lg:w-72">
            <span className="sr-only">Buscar veículo</span>
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Modelo ou placa"
              className="h-11 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none focus:border-[var(--brand)]"
            />
          </label>
          <button
            type="button"
            onClick={() => setNovoAberto(true)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#0072BB] px-5 text-sm font-semibold text-white hover:bg-[#005A9C] cursor-pointer"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Cadastrar</span>
          </button>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-14 text-center">
          <div className="font-display text-xl font-bold text-[var(--text)]">Nenhum veículo encontrado.</div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Tente outro filtro ou cadastre um veículo novo.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map(v => {
            const st = STATUS[v.status];
            const reservas = proximas(v.id);
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setFichaId(v.id);
                  }}
                  className="flex h-full w-full flex-col rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 text-left transition-colors hover:border-[var(--border-strong)] cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <PlacaMercosul placa={v.placa} uf="PR" className="scale-90 origin-top-left" />
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.ponto}`} /> {st.texto}
                    </span>
                  </div>
                  <div className="font-display mt-3 text-lg font-bold leading-tight text-[var(--text)]">{v.modelo}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1"><Users size={13} /> {v.capacidade} lugares</span>
                    <span>{v.cor}</span>
                    {v.ano && <span>{v.ano}</span>}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]"><Gauge size={12} /> Quilometragem</div>
                      <div className="font-bold tabular-nums text-[var(--text)]">{v.kmAtual.toLocaleString('pt-BR')} km</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]"><Fuel size={12} /> Tanque {v.nivelCombustivel}%</div>
                      <div className="mt-1.5"><BarraTanque nivel={v.nivelCombustivel} /></div>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 text-xs text-[var(--text-muted)]">
                    {reservas.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} /> Próxima reserva:{' '}
                        <strong className="tabular-nums text-[var(--text)]">{formatarData(reservas[0].datas[0])}</strong>
                        {reservas.length > 1 && ` e mais ${reservas.length - 1}`}
                      </span>
                    ) : (
                      'Sem reservas marcadas'
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {ficha && (
        <FichaVeiculo
          veiculo={ficha}
          agendamentos={agendamentos.filter(a => a.veiculoId === ficha.id)}
          onFechar={() => setFichaId(null)}
          onAtualizar={dados => onAtualizarVeiculo?.(ficha.id, dados)}
        />
      )}
      {novoAberto && (
        <NovoVeiculo
          placasExistentes={veiculos.map(v => v.placa.replace(/\W/g, ''))}
          onFechar={() => setNovoAberto(false)}
          onSalvar={v => {
            soundFX.playSuccess();
            onAdicionarVeiculo(v);
            setNovoAberto(false);
          }}
        />
      )}
    </div>
  );
};


const FichaVeiculo: React.FC<{
  veiculo: Veiculo;
  agendamentos: Agendamento[];
  onFechar: () => void;
  onAtualizar: (dados: Partial<Veiculo>) => void;
}> = ({ veiculo: v, agendamentos, onFechar, onAtualizar }) => {
  const historico = [...agendamentos].sort((a, b) => (b.datas[0] ?? '').localeCompare(a.datas[0] ?? ''));
  return (
    <Janela titulo={v.modelo} onFechar={onFechar} largura="xl">
      <div className="flex flex-wrap items-center gap-3">
        <PlacaMercosul placa={v.placa} uf="PR" />
        <span className="text-sm text-[var(--text-muted)]">
          {v.cor} · {v.capacidade} lugares{v.ano ? ` · ${v.ano}` : ''}
        </span>
      </div>

      <div className="mt-5">
        <span className="mb-2 block text-[13px] font-semibold text-[var(--text)]">Situação</span>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(STATUS) as StatusVeiculo[]).map(s => (
            <button
              key={s}
              type="button"
              aria-pressed={v.status === s}
              onClick={() => {
                soundFX.playClick();
                onAtualizar({ status: s });
              }}
              className={`h-11 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
                v.status === s ? 'bg-[#00385E] text-white' : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]'
              }`}
            >
              {STATUS[s].texto}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[18px] bg-[var(--surface-2)] p-4">
          <div className="text-[11px] text-[var(--text-muted)]">Quilometragem</div>
          <div className="font-display text-2xl font-bold tabular-nums text-[var(--text)]">{v.kmAtual.toLocaleString('pt-BR')} km</div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">Atualizada a cada vistoria.</div>
        </div>
        <div className="rounded-[18px] bg-[var(--surface-2)] p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">Tanque</span>
            <button
              type="button"
              onClick={() => onAtualizar({ nivelCombustivel: 100 })}
              className="text-xs font-semibold text-[var(--brand)] hover:underline cursor-pointer"
            >
              Marcar como cheio
            </button>
          </div>
          <div className="font-display text-2xl font-bold tabular-nums text-[var(--text)]">{v.nivelCombustivel}%</div>
          <div className="mt-2"><BarraTanque nivel={v.nivelCombustivel} /></div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-display text-lg font-bold text-[var(--text)]">Viagens deste veículo</h4>
        {historico.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--text-muted)]">Nenhuma viagem registrada ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {historico.map(a => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-[var(--text)]">{a.destino}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {a.nome} · <span className="tabular-nums">{a.datas.map(formatarData).join(', ')}</span>
                  </div>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-[var(--text-subtle)]">{a.ticket}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Janela>
  );
};

const NovoVeiculo: React.FC<{
  placasExistentes: string[];
  onFechar: () => void;
  onSalvar: (v: Veiculo) => void;
}> = ({ placasExistentes, onFechar, onSalvar }) => {
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('');
  const [capacidade, setCapacidade] = useState('5');
  const [km, setKm] = useState('');
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [erro, setErro] = useState<string | null>(null);

  const placaLimpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const campo =
    'h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]';
  const rotulo = 'mb-1.5 block text-[13px] font-semibold text-[var(--text)]';

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (modelo.trim().length < 3) return setErro('Informe o modelo do veículo.');
    if (!PLACA_VALIDA.test(placaLimpa)) return setErro('Placa inválida. Use o formato ABC1D23 ou ABC1234.');
    if (placasExistentes.includes(placaLimpa)) return setErro('Já existe um veículo com essa placa.');
    onSalvar({
      id: 'v-' + Date.now(),
      modelo: modelo.trim(),
      placa: placaLimpa.replace(/^([A-Z]{3})/, '$1-'),
      cor: cor.trim() || 'Não informada',
      capacidade: Math.max(1, Number(capacidade) || 5),
      status: 'disponivel',
      kmAtual: Number(km) || 0,
      nivelCombustivel: 100,
      ano: Number(ano) || undefined,
    });
  };

  return (
    <Janela titulo="Cadastrar veículo" onFechar={onFechar}>
      <form onSubmit={salvar} className="space-y-4">
        <div className="flex justify-center rounded-[18px] bg-[var(--surface-2)] py-5">
          <PlacaMercosul placa={placaLimpa ? placaLimpa.replace(/^([A-Z]{3})/, '$1-') : 'ABC-1D23'} uf="PR" />
        </div>
        <div>
          <label htmlFor="nv-modelo" className={rotulo}>Modelo</label>
          <input id="nv-modelo" value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ex.: Fiat Cronos 1.3" className={campo} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="nv-placa" className={rotulo}>Placa</label>
            <input
              id="nv-placa"
              value={placa}
              onChange={e => setPlaca(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="ABC1D23"
              className={`${campo} uppercase tabular-nums`}
            />
          </div>
          <div>
            <label htmlFor="nv-cor" className={rotulo}>Cor</label>
            <input id="nv-cor" value={cor} onChange={e => setCor(e.target.value)} placeholder="Ex.: Prata" className={campo} />
          </div>
          <div>
            <label htmlFor="nv-lugares" className={rotulo}>Lugares</label>
            <input id="nv-lugares" inputMode="numeric" value={capacidade} onChange={e => setCapacidade(e.target.value.replace(/\D/g, '').slice(0, 2))} className={campo} />
          </div>
          <div>
            <label htmlFor="nv-ano" className={rotulo}>Ano</label>
            <input id="nv-ano" inputMode="numeric" value={ano} onChange={e => setAno(e.target.value.replace(/\D/g, '').slice(0, 4))} className={campo} />
          </div>
        </div>
        <div>
          <label htmlFor="nv-km" className={rotulo}>Quilometragem atual</label>
          <input id="nv-km" inputMode="numeric" value={km} onChange={e => setKm(e.target.value.replace(/\D/g, '').slice(0, 7))} placeholder="0" className={`${campo} tabular-nums`} />
        </div>
        {erro && (
          <p role="alert" className="flex items-start gap-2 rounded-[14px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
            <AlertCircle size={16} className="mt-px shrink-0" /> {erro}
          </p>
        )}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onFechar} className="h-11 flex-1 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="h-11 flex-1 rounded-full bg-[#0072BB] text-sm font-semibold text-white hover:bg-[#005A9C] cursor-pointer">
            Cadastrar
          </button>
        </div>
      </form>
    </Janela>
  );
};
