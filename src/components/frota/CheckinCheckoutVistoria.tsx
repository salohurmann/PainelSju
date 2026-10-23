import React, { useState } from 'react';
import { Agendamento, Veiculo, Vistoria, Usuario, VistoriaFotos } from '../../types';
import { generateAuditHash } from '../../services/crypto';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { soundFX } from '../../services/soundFx';
import { Camera, Check, ImagePlus, X, AlertCircle, KeyRound } from 'lucide-react';

interface CheckinCheckoutVistoriaProps {
  agendamentos: Agendamento[];
  veiculos: Veiculo[];
  vistorias: Vistoria[];
  currentUser: Usuario;
  onRegistrarVistoria: (vistoria: Vistoria, veiculoAtualizado: Partial<Veiculo>) => void;
}

type Aba = 'checkin' | 'checkout' | 'historico';

const LADOS: Array<{ key: keyof VistoriaFotos; rotulo: string }> = [
  { key: 'frente', rotulo: 'Frente' },
  { key: 'traseira', rotulo: 'Traseira' },
  { key: 'lateralDireita', rotulo: 'Lado direito' },
  { key: 'lateralEsquerda', rotulo: 'Lado esquerdo' },
];

const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const LIMITE_FOTO = 5 * 1024 * 1024;
const FOTOS_VAZIAS: VistoriaFotos = { frente: '', traseira: '', lateralDireita: '', lateralEsquerda: '' };

const formatarData = (d: string) => d.split('-').reverse().slice(0, 2).join('/');
const nivelTanque = (n: number) => (n >= 88 ? 'Cheio' : n >= 63 ? '3/4' : n >= 38 ? '1/2' : n >= 13 ? '1/4' : 'Reserva');

export const CheckinCheckoutVistoria: React.FC<CheckinCheckoutVistoriaProps> = ({
  agendamentos,
  veiculos,
  vistorias,
  currentUser,
  onRegistrarVistoria,
}) => {
  const [aba, setAba] = useState<Aba>(() =>
    !agendamentos.some(a => a.status === 'aprovado') && agendamentos.some(a => a.status === 'em_andamento') ? 'checkout' : 'checkin',
  );
  const [agendamentoId, setAgendamentoId] = useState('');
  const [km, setKm] = useState('');
  const [combustivel, setCombustivel] = useState(75);
  const [observacoes, setObservacoes] = useState('');
  const [fotos, setFotos] = useState<VistoriaFotos>(FOTOS_VAZIAS);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [feito, setFeito] = useState<Vistoria | null>(null);

  const saidas = agendamentos.filter(a => a.status === 'aprovado');
  const voltas = agendamentos.filter(a => a.status === 'em_andamento');
  const lista = aba === 'checkin' ? saidas : voltas;

  const ag = agendamentos.find(a => a.id === agendamentoId);
  const veiculo = veiculos.find(v => v.id === ag?.veiculoId);
  const kmNumero = Number(km.replace(/\D/g, ''));
  const kmRodado = veiculo && kmNumero ? kmNumero - veiculo.kmAtual : 0;
  const totalFotos = Object.values(fotos).filter(Boolean).length;

  const trocarAba = (nova: Aba) => {
    setAba(nova);
    setAgendamentoId('');
    setErro(null);
  };

  const escolher = (id: string) => {
    soundFX.playClick();
    setAgendamentoId(id);
    setErro(null);
    const v = veiculos.find(x => x.id === agendamentos.find(a => a.id === id)?.veiculoId);
    if (v) {
      setKm(String(v.kmAtual));
      setCombustivel(v.nivelCombustivel);
    }
    setFotos(FOTOS_VAZIAS);
    setObservacoes('');
  };

  const anexarFoto = (lado: keyof VistoriaFotos, arquivo?: File) => {
    if (!arquivo) return;
    if (!TIPOS_FOTO.includes(arquivo.type)) return setErro('Envie a foto em JPG, PNG ou WebP.');
    if (arquivo.size > LIMITE_FOTO) return setErro('A foto passa de 5 MB. Tire outra com resolução menor.');
    const leitor = new FileReader();
    leitor.onloadend = () => {
      setFotos(f => ({ ...f, [lado]: leitor.result as string }));
      setErro(null);
    };
    leitor.readAsDataURL(arquivo);
  };

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ag || !veiculo) return;
    if (!kmNumero) return setErro('Informe a quilometragem do painel.');
    if (kmNumero < veiculo.kmAtual) {
      return setErro(`A quilometragem não pode ser menor que a última registrada (${veiculo.kmAtual.toLocaleString('pt-BR')} km).`);
    }
    const tipo = aba === 'checkout' ? 'checkout' : 'checkin';
    setProcessando(true);
    try {
      const dataHora = new Date().toISOString();
      const hash = await generateAuditHash({
        action: `VISTORIA_${tipo.toUpperCase()}`,
        ticket: ag.ticket,
        cpf: currentUser.cpf,
        timestamp: dataHora,
        details: `Km: ${kmNumero} | Tanque: ${combustivel}% | Veículo: ${veiculo.placa}`,
      });
      const vistoria: Vistoria = {
        id: 'vis-' + Date.now(),
        agendamentoId: ag.id,
        ticket: ag.ticket,
        veiculoId: veiculo.id,
        tipo,
        km: kmNumero,
        nivelCombustivel: combustivel,
        fotos,
        motoristaNome: ag.nome,
        motoristaCpf: ag.cpf,
        observacoesAvarias: observacoes.trim(),
        dataHora,
        hashAuditoria: hash,
      };
      onRegistrarVistoria(vistoria, {
        kmAtual: kmNumero,
        nivelCombustivel: combustivel,
        status: tipo === 'checkin' ? 'em_missao' : 'disponivel',
      });
      soundFX.playSuccess();
      setFeito(vistoria);
      setAgendamentoId('');
    } finally {
      setProcessando(false);
    }
  };

  const abas: Array<{ id: Aba; rotulo: string; n: number }> = [
    { id: 'checkin', rotulo: 'Saída', n: saidas.length },
    { id: 'checkout', rotulo: 'Volta', n: voltas.length },
    { id: 'historico', rotulo: 'Registros', n: vistorias.length },
  ];

  return (
    <div className="space-y-5">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1" role="tablist" aria-label="Tipo de vistoria">
        {abas.map(a => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => trocarAba(a.id)}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors cursor-pointer ${
              aba === a.id
                ? 'bg-[#00385E] text-white'
                : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {a.rotulo}
            <span
              className={`rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                aba === a.id ? 'bg-[#C6E86B] text-[#0B1B2E]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
              }`}
            >
              {a.n}
            </span>
          </button>
        ))}
      </div>

      {aba === 'historico' ? (
        <Registros vistorias={vistorias} veiculos={veiculos} />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          <section className="lg:col-span-4 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <h3 className="font-display text-xl font-bold text-[var(--text)]">
              {aba === 'checkin' ? 'Prontos para sair' : 'Voltando da viagem'}
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {aba === 'checkin'
                ? 'Pedidos autorizados pela chefia. Escolha um para entregar a chave.'
                : 'Veículos na rua. Escolha um para receber a chave de volta.'}
            </p>
            {lista.length === 0 ? (
              <p className="mt-5 rounded-[18px] border border-dashed border-[var(--border-strong)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                {aba === 'checkin' ? 'Nenhuma saída autorizada no momento.' : 'Nenhum veículo fora agora.'}
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lista.map(a => {
                  const ativo = a.id === agendamentoId;
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => escolher(a.id)}
                        className={`w-full rounded-[18px] border-2 p-3.5 text-left transition-colors cursor-pointer ${
                          ativo
                            ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                            : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-[var(--text)]">{a.veiculoNome}</span>
                          <span className="shrink-0 text-xs font-semibold tabular-nums text-[var(--text-muted)]">{a.veiculoPlaca}</span>
                        </div>
                        <div className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                          {a.nome} · <span className="tabular-nums">{a.datas.map(formatarData).join(', ')}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="lg:col-span-8 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
            {!ag || !veiculo ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-muted)]">
                  <KeyRound size={24} />
                </span>
                <div className="font-display mt-4 text-xl font-bold text-[var(--text)]">Escolha uma viagem ao lado.</div>
                <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
                  Você vai anotar a quilometragem, o combustível e fotografar os quatro lados do carro.
                </p>
              </div>
            ) : (
              <form onSubmit={registrar} className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {aba === 'checkin' ? 'Vistoria de saída' : 'Vistoria de volta'} · {ag.ticket}
                    </div>
                    <div className="font-display mt-1 text-2xl font-bold text-[var(--text)]">{veiculo.modelo}</div>
                    <div className="text-sm text-[var(--text-muted)]">Responsável: {ag.nome}</div>
                  </div>
                  <PlacaMercosul placa={veiculo.placa} uf="PR" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="vis-km" className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">
                      Quilometragem no painel
                    </label>
                    <div className="relative">
                      <input
                        id="vis-km"
                        inputMode="numeric"
                        value={km}
                        onChange={e => setKm(e.target.value.replace(/\D/g, '').slice(0, 7))}
                        className="h-12 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 pr-12 text-lg font-bold tabular-nums text-[var(--text)] outline-none focus:border-[var(--brand)]"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">km</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Último registro: {veiculo.kmAtual.toLocaleString('pt-BR')} km
                      {kmRodado > 0 && <> · <strong className="text-[var(--text)]">+{kmRodado.toLocaleString('pt-BR')} km</strong></>}
                    </p>
                  </div>
                  <div>
                    <label htmlFor="vis-tanque" className="mb-1.5 flex items-baseline justify-between text-[13px] font-semibold text-[var(--text)]">
                      Combustível
                      <span className="font-display text-lg font-bold tabular-nums">
                        {nivelTanque(combustivel)} <span className="text-sm text-[var(--text-muted)]">· {combustivel}%</span>
                      </span>
                    </label>
                    <input
                      id="vis-tanque"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={combustivel}
                      onChange={e => setCombustivel(Number(e.target.value))}
                      className="mt-2 w-full accent-[#0072BB] cursor-pointer"
                    />
                    <div className="mt-1 flex justify-between text-[11px] text-[var(--text-subtle)]">
                      <span>Reserva</span><span>1/4</span><span>1/2</span><span>3/4</span><span>Cheio</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-[13px] font-semibold text-[var(--text)]">Fotos dos quatro lados</span>
                    <span className="text-xs tabular-nums text-[var(--text-muted)]">{totalFotos} de 4</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {LADOS.map(l => {
                      const src = fotos[l.key];
                      return (
                        <div key={l.key} className="relative">
                          <label
                            className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[18px] border-2 text-xs font-semibold transition-colors ${
                              src
                                ? 'border-transparent'
                                : 'border-dashed border-[var(--border-strong)] text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]'
                            }`}
                          >
                            {src ? (
                              <img src={src} alt={`Foto: ${l.rotulo}`} className="h-full w-full object-cover" />
                            ) : (
                              <>
                                <Camera size={20} />
                                {l.rotulo}
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              capture="environment"
                              className="sr-only"
                              aria-label={`Fotografar ${l.rotulo.toLowerCase()}`}
                              onChange={e => anexarFoto(l.key, e.target.files?.[0])}
                            />
                          </label>
                          {src && (
                            <>
                              <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-[#0B1B2E]/75 px-2 py-0.5 text-[11px] font-semibold text-white">
                                {l.rotulo}
                              </span>
                              <button
                                type="button"
                                aria-label={`Remover foto: ${l.rotulo}`}
                                onClick={() => setFotos(f => ({ ...f, [l.key]: '' }))}
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#0B1B2E]/75 text-white cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <ImagePlus size={14} /> No celular, abre a câmera direto. As fotos ficam guardadas junto com o registro.
                  </p>
                </div>

                <div>
                  <label htmlFor="vis-obs" className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">
                    Riscos, amassados ou problemas <span className="font-normal text-[var(--text-subtle)]">(se houver)</span>
                  </label>
                  <textarea
                    id="vis-obs"
                    rows={2}
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    placeholder="Ex.: risco pequeno na porta traseira esquerda."
                    className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)]"
                  />
                </div>

                {erro && (
                  <p role="alert" className="flex items-start gap-2 rounded-[14px] bg-[var(--danger-soft)] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
                    <AlertCircle size={16} className="mt-px shrink-0" /> {erro}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setAgendamentoId('')}
                    className="h-11 rounded-full px-5 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={processando}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0072BB] px-6 text-sm font-bold text-white hover:bg-[#005A9C] disabled:opacity-50 cursor-pointer"
                  >
                    <KeyRound size={16} />
                    {processando ? 'Registrando…' : aba === 'checkin' ? 'Registrar saída e entregar chave' : 'Registrar volta e receber chave'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

      {feito && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1B2E]/60 p-4" role="dialog" aria-modal="true" aria-labelledby="vis-ok">
          <div className="w-full max-w-md rounded-[28px] bg-[var(--surface)] p-6 sm:p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C6E86B] text-[#0B1B2E]">
              <Check size={24} strokeWidth={3} />
            </span>
            <h3 id="vis-ok" className="font-display mt-4 text-2xl font-bold text-[var(--text)]">
              {feito.tipo === 'checkin' ? 'Saída registrada.' : 'Volta registrada.'}
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {feito.tipo === 'checkin'
                ? 'Pode entregar a chave. O veículo aparece como "em missão" no catálogo.'
                : 'Chave recebida. O veículo voltou a ficar disponível.'}
            </p>
            <dl className="mt-5 space-y-2 rounded-[18px] bg-[var(--surface-2)] p-4 text-sm">
              <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Protocolo</dt><dd className="font-semibold tabular-nums text-[var(--text)]">{feito.ticket}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Quilometragem</dt><dd className="font-semibold tabular-nums text-[var(--text)]">{feito.km.toLocaleString('pt-BR')} km</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Combustível</dt><dd className="font-semibold text-[var(--text)]">{nivelTanque(feito.nivelCombustivel)}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Fotos</dt><dd className="font-semibold text-[var(--text)]">{Object.values(feito.fotos).filter(Boolean).length} de 4</dd></div>
            </dl>
            <button
              type="button"
              onClick={() => setFeito(null)}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#0072BB] text-sm font-semibold text-white hover:bg-[#005A9C] cursor-pointer"
            >
              Pronto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Registros: React.FC<{ vistorias: Vistoria[]; veiculos: Veiculo[] }> = ({ vistorias, veiculos }) => {
  if (vistorias.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-14 text-center">
        <div className="font-display text-xl font-bold text-[var(--text)]">Nenhuma vistoria ainda.</div>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Cada saída e volta registrada aparece aqui, com as fotos.</p>
      </div>
    );
  }
  const ordenadas = [...vistorias].sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  return (
    <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {ordenadas.map(v => {
        const veiculo = veiculos.find(x => x.id === v.veiculoId);
        const fotos = LADOS.map(l => ({ ...l, src: v.fotos[l.key] })).filter(f => f.src);
        return (
          <li key={v.id} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    v.tipo === 'checkin' ? 'bg-[var(--brand-soft)] text-[var(--brand)]' : 'bg-[var(--verde-soft)] text-[var(--verde)]'
                  }`}
                >
                  {v.tipo === 'checkin' ? 'Saída' : 'Volta'}
                </span>
                <div className="mt-2 text-[15px] font-semibold text-[var(--text)]">{veiculo?.modelo ?? 'Veículo'}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {v.motoristaNome} · {new Date(v.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              </div>
              <span className="text-xs font-semibold tabular-nums text-[var(--text-muted)]">{v.ticket}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-[14px] bg-[var(--surface-2)] px-3 py-2">
                <dt className="text-[11px] text-[var(--text-muted)]">Quilometragem</dt>
                <dd className="font-bold tabular-nums text-[var(--text)]">{v.km.toLocaleString('pt-BR')} km</dd>
              </div>
              <div className="rounded-[14px] bg-[var(--surface-2)] px-3 py-2">
                <dt className="text-[11px] text-[var(--text-muted)]">Combustível</dt>
                <dd className="font-bold text-[var(--text)]">{nivelTanque(v.nivelCombustivel)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[13px] text-[var(--text)]">
              <span className="text-[var(--text-muted)]">Observações: </span>
              {v.observacoesAvarias || 'Nada a registrar.'}
            </p>
            {fotos.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {fotos.map(f => (
                  <img key={f.key} src={f.src} alt={`${f.rotulo} — ${v.ticket}`} className="aspect-[4/3] w-full rounded-[12px] object-cover" />
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};
