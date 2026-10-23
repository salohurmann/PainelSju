import React, { useEffect, useRef, useState } from 'react';
import { Usuario } from '../../types';
import { soundFX } from '../../services/soundFx';
import { eventBus } from '../../services/eventBus';
import { temPermissao } from '../../services/rbac';
import { ModuloCabecalho, AcaoModulo, NumeroModulo } from '../modulo/ModuloCabecalho';
import { Plus, Users, MapPin, Video, Projector, X, Check, AlertCircle, Coffee, Laptop, Radio, Mic, ChevronLeft, ChevronRight } from 'lucide-react';

/** Recursos extras: mesmos valores aceitos pelo banco (reservas.recursos_extras). */
type Recurso = 'copa' | 'suporte_ti' | 'transmissao_hibrida' | 'gravacao';

export interface Reserva {
  id: string;
  salaId: string;
  responsavel: string;
  motivo: string;
  data: string; // AAAA-MM-DD
  horaInicio: number;
  horaFim: number;
  participantes?: number;
  recursos: Recurso[];
}

interface Sala {
  id: string;
  codigo: string;
  nome: string;
  andar: string;
  capacidade: number;
  layout: string;
  equipamentos: string[];
  video: boolean;
  projetor: boolean;
}

const SALAS: Sala[] = [
  { id: 's1', codigo: 'AUD-01', nome: 'Auditório Principal', andar: 'Térreo · Ala Norte', capacidade: 120, layout: 'Auditório', equipamentos: ['Projetor', 'Microfones sem fio', 'Som ambiente'], video: true, projetor: true },
  { id: 's2', codigo: 'GAB-03', nome: 'Sala de Reunião do Gabinete', andar: '3º andar', capacidade: 18, layout: 'Mesa em U', equipamentos: ['Videoconferência', 'TV 75"', 'Quadro de vidro'], video: true, projetor: false },
  { id: 's3', codigo: 'MED-02', nome: 'Sala de Conciliação', andar: '2º andar · Bloco B', capacidade: 8, layout: 'Mesa redonda', equipamentos: ['Isolamento acústico', 'Ar-condicionado'], video: false, projetor: false },
  { id: 's4', codigo: 'LAB-01', nome: 'Laboratório de Treinamento', andar: '1º andar', capacidade: 35, layout: '20 computadores', equipamentos: ['Projetor', 'Lousa digital', 'Rede cabeada'], video: false, projetor: true },
];

const RECURSOS: Array<{ id: Recurso; rotulo: string; icone: React.ReactNode }> = [
  { id: 'copa', rotulo: 'Café e água', icone: <Coffee size={15} /> },
  { id: 'suporte_ti', rotulo: 'Apoio da TI', icone: <Laptop size={15} /> },
  { id: 'transmissao_hibrida', rotulo: 'Reunião online', icone: <Radio size={15} /> },
  { id: 'gravacao', rotulo: 'Gravação', icone: <Mic size={15} /> },
];

const HORA_ABRE = 8;
const HORA_FECHA = 18;
const HORAS = Array.from({ length: HORA_FECHA - HORA_ABRE }, (_, i) => HORA_ABRE + i);

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const diaMais = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};
const proximoDiaUtil = (n: number) => {
  const d = new Date();
  let somados = 0;
  while (somados < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) somados++;
  }
  return iso(d);
};
const hh = (h: number) => `${String(h).padStart(2, '0')}h`;

const RESERVAS_INICIAIS = (): Reserva[] => {
  const hoje = diaMais(0);
  const amanha = proximoDiaUtil(1);
  return [
    { id: 'r1', salaId: 's1', responsavel: 'Dra. Maria Helena', motivo: 'Abertura da Semana de Direitos Humanos', data: hoje, horaInicio: 9, horaFim: 12, participantes: 90, recursos: ['copa', 'gravacao', 'suporte_ti'] },
    { id: 'r2', salaId: 's2', responsavel: 'Carlos Silveira', motivo: 'Alinhamento com Conselhos Tutelares', data: hoje, horaInicio: 14, horaFim: 16, participantes: 12, recursos: ['transmissao_hibrida', 'copa'] },
    { id: 'r3', salaId: 's3', responsavel: 'Juliana Mendes', motivo: 'Mediação comunitária', data: hoje, horaInicio: 10, horaFim: 12, participantes: 6, recursos: [] },
    { id: 'r4', salaId: 's4', responsavel: 'Coordenação de TI', motivo: 'Treinamento do e-Protocolo', data: hoje, horaInicio: 15, horaFim: 18, participantes: 20, recursos: ['suporte_ti'] },
    { id: 'r5', salaId: 's1', responsavel: 'Superintendência de Direitos Humanos', motivo: 'Palestra sobre violência escolar', data: amanha, horaInicio: 14, horaFim: 17, participantes: 100, recursos: ['copa', 'suporte_ti'] },
    { id: 'r6', salaId: 's2', responsavel: 'Diretoria Geral', motivo: 'Comitê de orçamento', data: amanha, horaInicio: 9, horaFim: 11, participantes: 10, recursos: ['copa'] },
  ];
};

interface ReservaSalasViewProps {
  currentUser: Usuario;
  onVoltarHub: () => void;
}

export const ReservaSalasView: React.FC<ReservaSalasViewProps> = ({ currentUser, onVoltarHub }) => {
  const podeCancelarQualquer = temPermissao(currentUser, 'salas:cancelar_qualquer');
  const [reservas, setReservas] = useState<Reserva[]>(RESERVAS_INICIAIS);
  const [inicioJanela, setInicioJanela] = useState(0);
  const [data, setData] = useState(diaMais(0));
  const [filtro, setFiltro] = useState<'todas' | 'video' | 'projetor'>('todas');
  const [agora, setAgora] = useState(() => new Date());
  const [detalhe, setDetalhe] = useState<Reserva | null>(null);
  const [feita, setFeita] = useState<Reserva | null>(null);

  // Formulário
  const [salaId, setSalaId] = useState('s1');
  const [inicio, setInicio] = useState(() => Math.min(HORA_FECHA - 1, Math.max(HORA_ABRE, new Date().getHours() + 1)));
  const [fim, setFim] = useState(() => Math.min(HORA_FECHA, Math.max(HORA_ABRE, new Date().getHours() + 1) + 1));
  const [participantes, setParticipantes] = useState('');
  const [motivo, setMotivo] = useState('');
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const motivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const hoje = iso(agora);
  const ehHoje = data === hoje;
  const horaAgora = agora.getHours() + agora.getMinutes() / 60;
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + inicioJanela + i);
    return d;
  });

  const doDia = reservas.filter(r => r.data === data);
  const salas = SALAS.filter(s => (filtro === 'video' ? s.video : filtro === 'projetor' ? s.projetor : true));
  const sala = SALAS.find(s => s.id === salaId) ?? SALAS[0];
  const choque = (sId: string, d: string, ini: number, f: number, ignorar?: string) =>
    reservas.find(r => r.id !== ignorar && r.salaId === sId && r.data === d && ini < r.horaFim && f > r.horaInicio);
  const conflito = choque(salaId, data, inicio, fim);
  const pessoas = Number(participantes) || 0;
  const lotado = pessoas > sala.capacidade;
  const passado = ehHoje && inicio < Math.ceil(horaAgora);

  const salasLivresAgora = SALAS.filter(
    s => !reservas.some(r => r.salaId === s.id && r.data === hoje && horaAgora >= r.horaInicio && horaAgora < r.horaFim),
  ).length;
  const minhas = reservas
    .filter(r => r.responsavel === currentUser.nome && r.data >= hoje)
    .sort((a, b) => (a.data + a.horaInicio).localeCompare(b.data + b.horaInicio));

  const preencher = (sId: string, hora: number) => {
    soundFX.playClick();
    setSalaId(sId);
    setInicio(hora);
    const proxima = reservas
      .filter(r => r.salaId === sId && r.data === data && r.horaInicio > hora)
      .sort((a, b) => a.horaInicio - b.horaInicio)[0];
    setFim(Math.max(hora + 1, Math.min(hora + 2, proxima?.horaInicio ?? HORA_FECHA)));
    setErro(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => motivoRef.current?.focus(), 250);
  };

  const abrirFormulario = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => motivoRef.current?.focus(), 300);
  };

  const reservar = (e: React.FormEvent) => {
    e.preventDefault();
    if (fim <= inicio) return setErro('O fim precisa ser depois do início.');
    if (passado) return setErro('Esse horário já passou. Escolha um horário a partir de agora.');
    if (motivo.trim().length < 3) return setErro('Escreva o motivo da reunião.');
    if (lotado) return setErro(`${sala.nome} comporta até ${sala.capacidade} pessoas.`);
    const c = choque(salaId, data, inicio, fim);
    if (c) return setErro(`Já está reservada das ${hh(c.horaInicio)} às ${hh(c.horaFim)} (${c.motivo}).`);
    const nova: Reserva = {
      id: 'r-' + Date.now(),
      salaId,
      responsavel: currentUser.nome,
      motivo: motivo.trim(),
      data,
      horaInicio: inicio,
      horaFim: fim,
      participantes: pessoas || undefined,
      recursos,
    };
    setReservas(prev => [...prev, nova]);
    eventBus.emit('sala.reservada', {
      reservaId: nova.id,
      salaNome: sala.nome,
      horario: `${hh(inicio)}–${hh(fim)}`,
      data,
      solicitante: nova.responsavel,
      pauta: nova.motivo,
    });
    soundFX.playSuccess();
    setFeita(nova);
    setMotivo('');
    setParticipantes('');
    setRecursos([]);
    setErro(null);
  };

  const cancelar = (r: Reserva) => {
    soundFX.playClick();
    setReservas(prev => prev.filter(x => x.id !== r.id));
    setDetalhe(null);
  };

  const dataLonga = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const opcoesHora = (de: number, ate: number) => Array.from({ length: ate - de + 1 }, (_, i) => de + i);
  // Campos sobre a faixa verde: fundo branco fixo e texto escuro nos dois temas.
  const campo = 'h-11 w-full rounded-[12px] border border-transparent bg-white px-3 text-sm text-[#0B1B2E] outline-none focus:ring-2 focus:ring-[#C6E86B]';

  return (
    <div className="space-y-5 font-sans">
      <ModuloCabecalho
        cor="verde"
        rotulo="Espaços · Salas e auditórios"
        titulo="Salas"
        descricao="Veja o que está livre, reserve sala ou auditório e peça café ou apoio da TI. Duas reservas nunca ficam no mesmo horário."
        onVoltar={onVoltarHub}
        acoes={
          <AcaoModulo destaque icone={<Plus size={15} />} onClick={abrirFormulario}>
            Reservar sala
          </AcaoModulo>
        }
      >
        <div className="flex flex-wrap gap-2">
          <NumeroModulo rotulo="Livres agora" valor={salasLivresAgora} detalhe={`de ${SALAS.length} espaços`} />
          <NumeroModulo rotulo={ehHoje ? 'Reservas hoje' : 'Reservas no dia'} valor={doDia.length} />
          <NumeroModulo rotulo="Suas próximas" valor={minhas.length} />
        </div>
      </ModuloCabecalho>

      {/* Dias */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Dias anteriores"
          disabled={inicioJanela === 0}
          onClick={() => setInicioJanela(v => Math.max(0, v - 7))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 py-0.5">
          {dias.map(d => {
            const chave = iso(d);
            const ativo = chave === data;
            const n = reservas.filter(r => r.data === chave).length;
            const fds = d.getDay() === 0 || d.getDay() === 6;
            return (
              <button
                key={chave}
                type="button"
                aria-pressed={ativo}
                onClick={() => setData(chave)}
                className={`flex min-w-[76px] shrink-0 flex-col items-center rounded-[18px] px-3 py-2 transition-colors cursor-pointer ${
                  ativo ? 'bg-[#00703C] text-white' : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]'
                } ${fds && !ativo ? 'opacity-60' : ''}`}
              >
                <span className={`text-[11px] font-semibold uppercase ${ativo ? 'text-white/75' : 'text-[var(--text-muted)]'}`}>
                  {chave === hoje ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </span>
                <span className="font-display text-xl font-bold tabular-nums leading-tight">{d.getDate()}</span>
                <span className={`text-[11px] tabular-nums ${ativo ? 'text-white/75' : 'text-[var(--text-subtle)]'}`}>
                  {n ? `${n} reserva${n > 1 ? 's' : ''}` : 'livre'}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Próximos dias"
          onClick={() => setInicioJanela(v => v + 7)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 items-start">
        {/* Agenda do dia */}
        <section className="xl:col-span-8 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display text-xl font-bold first-letter:uppercase text-[var(--text)]">{dataLonga(data)}</h3>
            <div className="flex gap-1.5">
              {[
                { id: 'todas', rotulo: 'Todas' },
                { id: 'video', rotulo: 'Com vídeo' },
                { id: 'projetor', rotulo: 'Com projetor' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filtro === f.id}
                  onClick={() => setFiltro(f.id as typeof filtro)}
                  className={`h-9 rounded-full px-3.5 text-[13px] font-semibold cursor-pointer ${
                    filtro === f.id ? 'bg-[#00385E] text-white' : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]'
                  }`}
                >
                  {f.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[620px]">
              <div className="ml-[122px] sm:ml-[170px] grid text-[11px] font-semibold tabular-nums text-[var(--text-subtle)]" style={{ gridTemplateColumns: `repeat(${HORAS.length}, 1fr)` }}>
                {HORAS.map(h => (
                  <span key={h}>{hh(h)}</span>
                ))}
              </div>
              <ul className="mt-2 space-y-2">
                {salas.map(s => {
                  const blocos = doDia.filter(r => r.salaId === s.id);
                  return (
                    <li key={s.id} className="flex items-stretch gap-3">
                      <div className="w-[110px] sm:w-[158px] shrink-0 py-1.5">
                        <div className="truncate text-sm font-semibold text-[var(--text)]">{s.nome}</div>
                        <div className="text-xs text-[var(--text-muted)]">{s.capacidade} pessoas</div>
                      </div>
                      <div className="relative h-14 flex-1 overflow-hidden rounded-[14px] bg-[var(--surface-2)]">
                        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${HORAS.length}, 1fr)` }}>
                          {HORAS.map(h => {
                            const ocupado = blocos.some(r => h >= r.horaInicio && h < r.horaFim);
                            const jaFoi = ehHoje && h + 1 <= horaAgora;
                            return (
                              <button
                                key={h}
                                type="button"
                                disabled={ocupado || jaFoi}
                                onClick={() => preencher(s.id, h)}
                                aria-label={`Reservar ${s.nome} às ${hh(h)}`}
                                className={`border-l border-[var(--border)] first:border-l-0 ${
                                  jaFoi ? 'bg-[var(--surface-3)]/60 cursor-not-allowed' : 'hover:bg-[var(--verde-soft)] cursor-pointer'
                                }`}
                              />
                            );
                          })}
                        </div>
                        {blocos.map(r => {
                          const esq = ((r.horaInicio - HORA_ABRE) / HORAS.length) * 100;
                          const larg = ((r.horaFim - r.horaInicio) / HORAS.length) * 100;
                          const minha = r.responsavel === currentUser.nome;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setDetalhe(r)}
                              className={`absolute inset-y-1 flex flex-col justify-center overflow-hidden rounded-[10px] px-2.5 text-left text-white cursor-pointer ${
                                minha ? 'bg-[#0072BB]' : 'bg-[#00385E]'
                              }`}
                              style={{ left: `calc(${esq}% + 2px)`, width: `calc(${larg}% - 4px)` }}
                              title={`${r.motivo} · ${hh(r.horaInicio)}–${hh(r.horaFim)}`}
                            >
                              <span className="truncate text-xs font-semibold">{r.motivo}</span>
                              <span className="truncate text-[11px] tabular-nums text-white/70">
                                {hh(r.horaInicio)}–{hh(r.horaFim)} · {r.responsavel}
                              </span>
                            </button>
                          );
                        })}
                        {ehHoje && horaAgora >= HORA_ABRE && horaAgora <= HORA_FECHA && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-y-0 w-0.5 bg-[#C8372D]"
                            style={{ left: `${((horaAgora - HORA_ABRE) / HORAS.length) * 100}%` }}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 ml-[122px] sm:ml-[170px] flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#0072BB]" /> Suas reservas</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#00385E]" /> Outras reservas</span>
                {ehHoje && <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-0.5 bg-[#C8372D]" /> Agora</span>}
                <span>Toque num horário livre para reservar.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Reserva */}
        <form ref={formRef} onSubmit={reservar} className="xl:col-span-4 xl:sticky xl:top-24 rounded-[28px] bg-[#00703C] p-6 text-white">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">Nova reserva</div>
          <div className="font-display mt-1 text-xl font-bold first-letter:uppercase">{dataLonga(data)}</div>

          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="rs-sala" className="mb-1.5 block text-[13px] font-semibold">Sala</label>
              <select id="rs-sala" value={salaId} onChange={e => setSalaId(e.target.value)} className={`${campo} cursor-pointer`}>
                {SALAS.map(s => (
                  <option key={s.id} value={s.id}>{s.nome} · até {s.capacidade}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="rs-ini" className="mb-1.5 block text-[13px] font-semibold">Começa</label>
                <select
                  id="rs-ini"
                  value={inicio}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setInicio(v);
                    if (fim <= v) setFim(v + 1);
                  }}
                  className={`${campo} cursor-pointer tabular-nums`}
                >
                  {opcoesHora(HORA_ABRE, HORA_FECHA - 1).map(h => <option key={h} value={h}>{hh(h)}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="rs-fim" className="mb-1.5 block text-[13px] font-semibold">Termina</label>
                <select id="rs-fim" value={fim} onChange={e => setFim(Number(e.target.value))} className={`${campo} cursor-pointer tabular-nums`}>
                  {opcoesHora(inicio + 1, HORA_FECHA).map(h => <option key={h} value={h}>{hh(h)}</option>)}
                </select>
              </div>
            </div>
            <p className={`rounded-[12px] px-3 py-2 text-[13px] font-medium ${conflito || passado ? 'bg-[#FFD3CC] text-[#7A160E]' : 'bg-white/12 text-white'}`}>
              {conflito
                ? `Ocupada das ${hh(conflito.horaInicio)} às ${hh(conflito.horaFim)}.`
                : passado
                  ? 'Esse horário já passou.'
                  : `Livre das ${hh(inicio)} às ${hh(fim)}.`}
            </p>
            <div>
              <label htmlFor="rs-motivo" className="mb-1.5 block text-[13px] font-semibold">Motivo</label>
              <input
                id="rs-motivo"
                ref={motivoRef}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                maxLength={300}
                placeholder="Ex.: reunião com a equipe do CENSE"
                className={`${campo} placeholder:text-[#6B7A8C]`}
              />
            </div>
            <div>
              <label htmlFor="rs-pessoas" className="mb-1.5 block text-[13px] font-semibold">
                Quantas pessoas <span className="font-normal text-white/65">(opcional)</span>
              </label>
              <input
                id="rs-pessoas"
                inputMode="numeric"
                value={participantes}
                onChange={e => setParticipantes(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={`até ${sala.capacidade}`}
                aria-invalid={lotado}
                className={`${campo} tabular-nums placeholder:text-[#6B7A8C] ${lotado ? 'ring-2 ring-[#FFD3CC]' : ''}`}
              />
            </div>
            <fieldset>
              <legend className="mb-1.5 text-[13px] font-semibold">Precisa de algo?</legend>
              <div className="grid grid-cols-2 gap-2">
                {RECURSOS.map(r => {
                  const marcado = recursos.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={marcado}
                      onClick={() => setRecursos(v => (marcado ? v.filter(x => x !== r.id) : [...v, r.id]))}
                      className={`inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors cursor-pointer ${
                        marcado ? 'bg-[#C6E86B] text-[#0B1B2E]' : 'bg-white/12 text-white hover:bg-white/20'
                      }`}
                    >
                      {marcado ? <Check size={15} strokeWidth={3} /> : r.icone}
                      {r.rotulo}
                    </button>
                  );
                })}
              </div>
              {(recursos.includes('suporte_ti') || recursos.includes('transmissao_hibrida')) && (
                <p className="mt-2 text-xs text-white/70">A TI recebe um aviso com a data e o horário.</p>
              )}
            </fieldset>
          </div>

          {erro && (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-[14px] bg-[#FFD3CC] p-3 text-[13px] font-medium text-[#7A160E]">
              <AlertCircle size={16} className="mt-px shrink-0" /> {erro}
            </p>
          )}
          <button
            type="submit"
            disabled={Boolean(conflito) || passado}
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#C6E86B] text-sm font-bold text-[#0B1B2E] hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Reservar
          </button>
        </form>
      </div>

      {/* Salas */}
      <section>
        <h3 className="font-display mb-3 text-xl font-bold text-[var(--text)]">Os espaços</h3>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SALAS.map(s => {
            const emUso = reservas.find(r => r.salaId === s.id && r.data === hoje && horaAgora >= r.horaInicio && horaAgora < r.horaFim);
            const ocupadasHoje = reservas.filter(r => r.salaId === s.id && r.data === hoje).reduce((t, r) => t + (r.horaFim - r.horaInicio), 0);
            return (
              <li key={s.id} className="flex flex-col rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold tabular-nums text-[var(--text-muted)]">{s.codigo}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${emUso ? 'bg-[var(--warning-soft)] text-[var(--warning)]' : 'bg-[var(--verde-soft)] text-[var(--verde)]'}`}>
                    {emUso ? `Em uso até ${hh(emUso.horaFim)}` : 'Livre agora'}
                  </span>
                </div>
                <div className="font-display mt-2 text-lg font-bold leading-tight text-[var(--text)]">{s.nome}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1"><MapPin size={12} /> {s.andar}</span>
                  <span className="inline-flex items-center gap-1"><Users size={12} /> {s.capacidade} pessoas</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.video && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text)]"><Video size={12} /> Vídeo</span>}
                  {s.projetor && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text)]"><Projector size={12} /> Projetor</span>}
                  {s.equipamentos.filter(e => !/projetor|videoconfer/i.test(e)).map(e => (
                    <span key={e} className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]">{e}</span>
                  ))}
                </div>
                <div className="mt-auto pt-4">
                  <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Ocupação hoje</span>
                    <span className="tabular-nums">{ocupadasHoje}h de {HORAS.length}h</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <div className="h-full rounded-full bg-[#00A859]" style={{ width: `${(ocupadasHoje / HORAS.length) * 100}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Suas reservas */}
      <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h3 className="font-display text-xl font-bold text-[var(--text)]">Suas próximas reservas</h3>
        {minhas.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--text-muted)]">Você não tem reservas marcadas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {minhas.map(r => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--text)]">{r.motivo}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    <span className="first-letter:uppercase">{r.data === hoje ? 'Hoje' : dataLonga(r.data)}</span> · {hh(r.horaInicio)}–{hh(r.horaFim)} · {SALAS.find(s => s.id === r.salaId)?.nome}
                  </div>
                </div>
                <button type="button" onClick={() => setDetalhe(r)} className="h-9 shrink-0 rounded-full bg-[var(--surface-2)] px-4 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer">
                  Ver
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {detalhe && (
        <Janela titulo={detalhe.motivo} onFechar={() => setDetalhe(null)}>
          <dl className="space-y-2 rounded-[18px] bg-[var(--surface-2)] p-4 text-sm">
            <Linha rotulo="Sala" valor={SALAS.find(s => s.id === detalhe.salaId)?.nome ?? ''} />
            <Linha rotulo="Quando" valor={`${dataLonga(detalhe.data)} · ${hh(detalhe.horaInicio)}–${hh(detalhe.horaFim)}`} />
            <Linha rotulo="Responsável" valor={detalhe.responsavel} />
            {detalhe.participantes && <Linha rotulo="Pessoas" valor={String(detalhe.participantes)} />}
            <Linha rotulo="Pedidos extras" valor={detalhe.recursos.length ? detalhe.recursos.map(id => RECURSOS.find(r => r.id === id)?.rotulo).join(', ') : 'Nenhum'} />
          </dl>
          {(detalhe.responsavel === currentUser.nome || podeCancelarQualquer) ? (
            <button
              type="button"
              onClick={() => cancelar(detalhe)}
              className="mt-5 h-11 w-full rounded-full border border-[var(--danger-border)] text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)] cursor-pointer"
            >
              Cancelar reserva e liberar o horário
            </button>
          ) : (
            <p className="mt-4 text-xs text-[var(--text-muted)]">Só quem reservou ou a administração pode cancelar.</p>
          )}
        </Janela>
      )}

      {feita && (
        <Janela titulo="Sala reservada." onFechar={() => setFeita(null)}>
          <p className="text-sm text-[var(--text-muted)]">
            {SALAS.find(s => s.id === feita.salaId)?.nome}, <span className="first-letter:lowercase">{dataLonga(feita.data)}</span>, das {hh(feita.horaInicio)} às {hh(feita.horaFim)}.
          </p>
          <button type="button" onClick={() => setFeita(null)} className="mt-5 h-11 w-full rounded-full bg-[#00703C] text-sm font-semibold text-white hover:bg-[#005C31] cursor-pointer">
            Pronto
          </button>
        </Janela>
      )}
    </div>
  );
};

const Linha: React.FC<{ rotulo: string; valor: string }> = ({ rotulo, valor }) => (
  <div className="flex justify-between gap-3">
    <dt className="text-[var(--text-muted)]">{rotulo}</dt>
    <dd className="text-right font-semibold first-letter:uppercase text-[var(--text)]">{valor}</dd>
  </div>
);

const Janela: React.FC<{ titulo: string; onFechar: () => void; children: React.ReactNode }> = ({ titulo, onFechar, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B1B2E]/60 sm:items-center sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-label={titulo}
    onClick={e => e.target === e.currentTarget && onFechar()}
  >
    <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-[var(--surface)] p-6 sm:rounded-[28px] sm:p-7">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl font-bold leading-tight text-[var(--text)]">{titulo}</h3>
        <button type="button" onClick={onFechar} aria-label="Fechar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)] cursor-pointer">
          <X size={16} />
        </button>
      </div>
      {children}
    </div>
  </div>
);
