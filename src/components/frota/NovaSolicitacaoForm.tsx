import React, { useState, useEffect, useRef } from 'react';
import { useJanela } from '../ui/Janela';
import { imprimir } from '../../lib/imprimir';
import { Agendamento, Veiculo, PeriodoAgendamento, ModalidadeAgendamento } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import {
  Users,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  AlertCircle,
  Fuel,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { soundFX } from '../../services/soundFx';

interface NovaSolicitacaoFormProps {
  veiculos: Veiculo[];
  agendamentos: Agendamento[];
  onSubmit: (novoAg: Agendamento) => void;
  defaultNome?: string;
  defaultEmail?: string;
  defaultCpf?: string;
}

const DESTINOS_PARANA = [
  { cidade: 'Ponta Grossa', km: 115, rota: 'BR-376 (Campos Gerais)', pedagios: 2 },
  { cidade: 'Londrina', km: 380, rota: 'BR-376 (Norte do PR)', pedagios: 5 },
  { cidade: 'Maringá', km: 425, rota: 'BR-376 (Noroeste)', pedagios: 6 },
  { cidade: 'Cascavel', km: 498, rota: 'BR-277 (Oeste do PR)', pedagios: 5 },
  { cidade: 'Foz do Iguaçu', km: 635, rota: 'BR-277 (Fronteira)', pedagios: 7 },
  { cidade: 'Paranaguá', km: 90, rota: 'BR-277 (Litoral do PR)', pedagios: 1 }
];

export const NovaSolicitacaoForm: React.FC<NovaSolicitacaoFormProps> = ({
  veiculos,
  agendamentos,
  onSubmit,
  defaultNome = '',
  defaultEmail = '',
  defaultCpf = ''
}) => {
  // Estados do Formulário
  const [nome, setNome] = useState(defaultNome);
  const [cpf, setCpf] = useState(defaultCpf);
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [veiculoId, setVeiculoId] = useState('');
  const [datasSelecionadas, setDatasSelecionadas] = useState<string[]>([]);
  const [periodo, setPeriodo] = useState<PeriodoAgendamento>('dia_todo');
  const [modalidade, setModalidade] = useState<ModalidadeAgendamento>('com_motorista');
  const [destino, setDestino] = useState('');
  const [passageiros, setPassageiros] = useState('');
  const [cidadeDestino, setCidadeDestino] = useState<string | null>(null);
  const [rascunhoSalvoEm, setRascunhoSalvoEm] = useState<string | null>(null);

  // Carregar rascunho salvo do localStorage ao montar
  useEffect(() => {
    try {
      const savedJson = localStorage.getItem('seju_rascunho_solicitacao_frota');
      if (savedJson) {
        const d = JSON.parse(savedJson);
        if (d.telefone) setTelefone(d.telefone);
        if (d.veiculoId) setVeiculoId(d.veiculoId);
        if (Array.isArray(d.datasSelecionadas) && d.datasSelecionadas.length > 0) {
          setDatasSelecionadas(d.datasSelecionadas);
        }
        if (d.periodo) setPeriodo(d.periodo);
        if (d.modalidade) setModalidade(d.modalidade);
        if (d.destino) setDestino(d.destino);
        if (d.passageiros) setPassageiros(d.passageiros);
        if (d.salvoEm) setRascunhoSalvoEm(d.salvoEm);
      }
    } catch {
      // Ignorar erros de parse de rascunho corrompido
    }
  }, []);

  // Debounce de 500ms para salvar rascunho automaticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      if (destino || telefone || veiculoId || datasSelecionadas.length > 0 || passageiros) {
        const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const draftData = {
          telefone,
          veiculoId,
          datasSelecionadas,
          periodo,
          modalidade,
          destino,
          passageiros,
          salvoEm: agora
        };
        localStorage.setItem('seju_rascunho_solicitacao_frota', JSON.stringify(draftData));
        setRascunhoSalvoEm(agora);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [telefone, veiculoId, datasSelecionadas, periodo, modalidade, destino, passageiros]);

  const limparRascunho = () => {
    localStorage.removeItem('seju_rascunho_solicitacao_frota');
    setTelefone('');
    setVeiculoId('');
    setDatasSelecionadas([]);
    setDestino('');
    setPassageiros('');
    setCidadeDestino(null);
    setRascunhoSalvoEm(null);
  };

  // Lotação e destino escolhido
  const veicSel = veiculos.find(v => v.id === veiculoId);
  const extraPassageiros = passageiros.split(/[,;\n]/).map(p => p.trim()).filter(Boolean);
  const totalOcupantes = 1 + extraPassageiros.length;
  const capacidadeExcedida = veicSel ? totalOcupantes > veicSel.capacidade : false;

  const destInfo = DESTINOS_PARANA.find(d => 
    cidadeDestino === d.cidade || (destino && destino.toLowerCase().includes(d.cidade.toLowerCase()))
  );

  // Navegação do Calendário
  const hoje = new Date();
  const [calAno, setCalAno] = useState(hoje.getFullYear());
  const [calMes, setCalMes] = useState(hoje.getMonth()); // 0-11

  // Erros e Validação
  const [erro, setErro] = useState<string | null>(null);
  const [comprovante, setComprovante] = useState<Agendamento | null>(null);
  const comprovanteRef = useRef<HTMLDivElement>(null);
  const comprovanteJanela = useJanela(Boolean(comprovante), () => setComprovante(null));

  // Validador de CPF Real
  const validarCPF = (strCPF: string) => {
    const clean = strCPF.replace(/\D/g, '');
    if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(clean[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(clean[9])) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(clean[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(clean[10]);
  };

  // Máscaras
  const formatarCpf = (v: string) => {
    let clean = v.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.slice(0, 11);
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatarTelefone = (v: string) => {
    let clean = v.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.slice(0, 11);
    if (clean.length <= 10) {
      return clean.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return clean.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const primeiroDiaSemana = new Date(calAno, calMes, 1).getDay();
  const diasNoMes = new Date(calAno, calMes + 1, 0).getDate();

  const handleToggleData = (dataStr: string) => {
    soundFX.playClick();
    if (datasSelecionadas.includes(dataStr)) {
      setDatasSelecionadas(datasSelecionadas.filter(d => d !== dataStr));
    } else {
      setDatasSelecionadas([...datasSelecionadas, dataStr].sort());
    }
  };

  // Verificação de Conflitos
  const checkDataStatus = (dataStr: string) => {
    if (!veiculoId) return { ocupado: false, parcial: false };
    const dt = new Date(dataStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dt < today) return { ocupado: true, passado: true };

    const conflitos = agendamentos.filter(
      a => a.veiculoId === veiculoId && 
           a.datas.includes(dataStr) && 
           ['pendente', 'aprovado', 'em_andamento'].includes(a.status)
    );

    const temDiaTodo = conflitos.some(a => a.periodo === 'dia_todo');
    const temManha = conflitos.some(a => a.periodo === 'manha');
    const temTarde = conflitos.some(a => a.periodo === 'tarde');

    if (temDiaTodo || (temManha && temTarde)) {
      return { ocupado: true, passado: false };
    }
    if (temManha || temTarde) {
      return { ocupado: false, parcial: true };
    }
    return { ocupado: false, parcial: false };
  };

  const handleNavMes = (dir: number) => {
    soundFX.playClick();
    let novoMes = calMes + dir;
    let novoAno = calAno;
    if (novoMes > 11) {
      novoMes = 0;
      novoAno++;
    } else if (novoMes < 0) {
      novoMes = 11;
      novoAno--;
    }
    setCalMes(novoMes);
    setCalAno(novoAno);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      soundFX.playWarning();
      return setErro('Informe seu nome completo.');
    }
    if (!validarCPF(cpf)) {
      soundFX.playWarning();
      return setErro('CPF inválido. Verifique o número digitado.');
    }
    if (!telefone.trim()) {
      soundFX.playWarning();
      return setErro('Informe um telefone para contato.');
    }
    if (!veiculoId) {
      soundFX.playWarning();
      return setErro('Escolha um veículo.');
    }
    if (datasSelecionadas.length === 0) {
      soundFX.playWarning();
      return setErro('Escolha pelo menos um dia livre no calendário.');
    }
    if (!destino.trim()) {
      soundFX.playWarning();
      return setErro('Conte para onde vai e o motivo da viagem.');
    }
    if (capacidadeExcedida) {
      soundFX.playWarning();
      return setErro(`O ${veicSel?.modelo} leva até ${veicSel?.capacidade} pessoas e o pedido tem ${totalOcupantes}.`);
    }

    const novoTicket = `AG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const novoAgendamento: Agendamento = {
      id: 'ag-' + Date.now(),
      ticket: novoTicket,
      nome: nome.trim(),
      cpf: cpf.trim(),
      telefone: telefone.trim(),
      email: email.trim() || 'servidor@seju.pr.gov.br',
      veiculoId,
      veiculoNome: veicSel?.modelo || 'Veículo Oficial',
      veiculoPlaca: veicSel?.placa || '',
      datas: datasSelecionadas,
      periodo,
      modalidade,
      destino: destino.trim(),
      passageiros: passageiros.trim() || nome.trim(),
      status: 'pendente',
      criadoEm: new Date().toISOString()
    };

    onSubmit(novoAgendamento);
    soundFX.playSuccess();
    setComprovante(novoAgendamento);

    // Reset formulário e limpa rascunho persistido
    localStorage.removeItem('seju_rascunho_solicitacao_frota');
    setRascunhoSalvoEm(null);
    setDatasSelecionadas([]);
    setDestino('');
    setPassageiros('');
    setCidadeDestino(null);
  };

  // Status de preenchimento das etapas para indicador visual
  const step1Completo = Boolean(nome.trim() && cpf.replace(/\D/g, '').length === 11 && telefone.trim());

  const campo =
    'w-full h-11 px-3.5 text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-[12px] text-[var(--text)] placeholder:text-[var(--text-subtle)] outline-none transition-colors focus:border-[var(--brand)] focus:bg-[var(--surface)]';
  const rotulo = 'block text-[13px] font-semibold text-[var(--text)] mb-1.5';
  const opcao = (ativo: boolean) =>
    `rounded-[18px] border-2 p-4 text-left transition-colors cursor-pointer ${
      ativo
        ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
        : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]'
    }`;

  const destinoRapido = DESTINOS_PARANA.find(d => d.cidade === cidadeDestino) ?? destInfo;
  const horasTrecho = destinoRapido ? destinoRapido.km / 80 : 0;
  const formatarData = (d: string) => d.split('-').reverse().slice(0, 2).join('/');
  const turnos: Array<{ id: PeriodoAgendamento; titulo: string; horario: string }> = [
    { id: 'manha', titulo: 'Manhã', horario: '08h–12h' },
    { id: 'tarde', titulo: 'Tarde', horario: '13h–18h' },
    { id: 'dia_todo', titulo: 'Dia todo', horario: '08h–18h' },
  ];

  return (
    <div className="font-sans">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Quem pede */}
          <Etapa numero={1} titulo="Quem está pedindo" feito={step1Completo}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ns-nome" className={rotulo}>Nome completo</label>
                <input id="ns-nome" required value={nome} onChange={e => setNome(e.target.value)} className={campo} />
              </div>
              <div>
                <label htmlFor="ns-cpf" className={rotulo}>CPF</label>
                <input
                  id="ns-cpf"
                  required
                  inputMode="numeric"
                  value={cpf}
                  onChange={e => setCpf(formatarCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className={`${campo} tabular-nums`}
                />
              </div>
              <div>
                <label htmlFor="ns-tel" className={rotulo}>Telefone para contato</label>
                <input
                  id="ns-tel"
                  required
                  inputMode="tel"
                  value={telefone}
                  onChange={e => setTelefone(formatarTelefone(e.target.value))}
                  placeholder="(41) 99999-9999"
                  className={`${campo} tabular-nums`}
                />
              </div>
              <div>
                <label htmlFor="ns-email" className={rotulo}>
                  E-mail <span className="font-normal text-[var(--text-subtle)]">(opcional)</span>
                </label>
                <input
                  id="ns-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nome@seju.pr.gov.br"
                  className={campo}
                />
              </div>
            </div>
          </Etapa>

          {/* 2. Veículo e condução */}
          <Etapa numero={2} titulo="Qual veículo" feito={Boolean(veiculoId)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {veiculos.map(v => {
                const selecionado = veiculoId === v.id;
                const livre = v.status === 'disponivel';
                return (
                  <button
                    key={v.id}
                    type="button"
                    aria-pressed={selecionado}
                    onClick={() => {
                      soundFX.playClick();
                      setVeiculoId(v.id);
                      setDatasSelecionadas([]);
                    }}
                    className={opcao(selecionado)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <PlacaMercosul placa={v.placa} uf="PR" className="scale-90 origin-top-left" />
                      {selecionado ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0072BB] text-white">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            livre
                              ? 'bg-[var(--verde-soft)] text-[var(--verde)]'
                              : 'bg-[var(--warning-soft)] text-[var(--warning)]'
                          }`}
                        >
                          {livre ? 'No pátio' : v.status === 'em_missao' ? 'Em uso' : 'Manutenção'}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-[15px] font-semibold text-[var(--text)]">{v.modelo}</div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Users size={13} /> {v.capacidade} lugares
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Fuel size={13} /> {v.nivelCombustivel}%
                      </span>
                      <span>{v.cor}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <span className={rotulo}>Quem dirige</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'com_motorista', titulo: 'Motorista do Transporte', sub: 'O setor de Transporte indica o motorista.' },
                  { id: 'sem_motorista', titulo: 'Eu mesmo dirijo', sub: 'Precisa de CNH válida e termo de responsabilidade.' },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={modalidade === m.id}
                    onClick={() => {
                      soundFX.playClick();
                      setModalidade(m.id as ModalidadeAgendamento);
                    }}
                    className={opcao(modalidade === m.id)}
                  >
                    <div className="text-sm font-semibold text-[var(--text)]">{m.titulo}</div>
                    <div className="mt-0.5 text-xs text-[var(--text-muted)]">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </Etapa>

          {/* 3. Quando */}
          <Etapa numero={3} titulo="Quando" feito={datasSelecionadas.length > 0}>
            {!veiculoId ? (
              <div className="rounded-[18px] border border-dashed border-[var(--border-strong)] px-4 py-10 text-center text-sm text-[var(--text-muted)]">
                Escolha um veículo para ver os dias livres na agenda dele.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-7">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-[var(--text)]">
                      {mesesNomes[calMes]} <span className="text-[var(--text-subtle)]">{calAno}</span>
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleNavMes(-1)}
                        aria-label="Mês anterior"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavMes(1)}
                        aria-label="Próximo mês"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[var(--text-subtle)]">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                      <span key={i} className="py-1">{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
                      <div key={`vazio-${i}`} />
                    ))}
                    {Array.from({ length: diasNoMes }).map((_, i) => {
                      const dia = i + 1;
                      const chave = `${calAno}-${String(calMes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                      const marcado = datasSelecionadas.includes(chave);
                      const { ocupado, parcial, passado } = checkDataStatus(chave);
                      let cls = 'text-[var(--text)] hover:bg-[var(--surface-2)]';
                      if (passado) cls = 'text-[var(--text-subtle)] opacity-40 cursor-not-allowed';
                      else if (ocupado) cls = 'text-[var(--danger)] line-through opacity-70 cursor-not-allowed';
                      else if (marcado) cls = 'bg-[#0072BB] text-white font-bold';
                      else if (parcial) cls = 'bg-[var(--warning-soft)] text-[var(--warning)] font-semibold';
                      return (
                        <button
                          key={chave}
                          type="button"
                          disabled={ocupado || passado}
                          aria-pressed={marcado}
                          aria-label={`Dia ${dia}${ocupado ? ', reservado' : parcial ? ', meio período livre' : ''}`}
                          onClick={() => handleToggleData(chave)}
                          className={`h-10 rounded-full text-sm tabular-nums transition-colors cursor-pointer ${cls}`}
                        >
                          {dia}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#0072BB]" /> Escolhido</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[var(--warning)]" /> Meio período livre</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]" /> Reservado</span>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-4">
                  <div>
                    <span className={rotulo}>Período</span>
                    <div className="grid grid-cols-3 gap-2">
                      {turnos.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          aria-pressed={periodo === t.id}
                          onClick={() => {
                            soundFX.playClick();
                            setPeriodo(t.id);
                          }}
                          className={`rounded-[14px] border-2 px-2 py-2.5 text-center transition-colors cursor-pointer ${
                            periodo === t.id
                              ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                              : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <div className="text-sm font-semibold text-[var(--text)]">{t.titulo}</div>
                          <div className="text-[11px] tabular-nums text-[var(--text-muted)]">{t.horario}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[18px] bg-[var(--surface-2)] p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] font-semibold text-[var(--text)]">Dias escolhidos</span>
                      <span className="font-display text-2xl font-bold tabular-nums text-[var(--text)]">{datasSelecionadas.length}</span>
                    </div>
                    {datasSelecionadas.length === 0 ? (
                      <p className="mt-1 text-xs text-[var(--text-muted)]">Toque nos dias livres do calendário.</p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {datasSelecionadas.map(d => (
                          <span key={d} className="inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--text)]">
                            {formatarData(d)}
                            <button
                              type="button"
                              aria-label={`Remover ${formatarData(d)}`}
                              onClick={() => handleToggleData(d)}
                              className="text-[var(--text-subtle)] hover:text-[var(--danger)] cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Etapa>

          {/* 4. Para onde */}
          <Etapa numero={4} titulo="Para onde e por quê" feito={Boolean(destino.trim()) && !capacidadeExcedida}>
            <span className={rotulo}>Destinos frequentes</span>
            <div className="flex flex-wrap gap-2">
              {DESTINOS_PARANA.map(d => {
                const ativo = destinoRapido?.cidade === d.cidade;
                return (
                  <button
                    key={d.cidade}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => {
                      soundFX.playClick();
                      setCidadeDestino(d.cidade);
                      if (!destino.trim() || DESTINOS_PARANA.some(x => destino.startsWith(x.cidade))) {
                        setDestino(`${d.cidade}/PR — `);
                      }
                    }}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-colors cursor-pointer ${
                      ativo
                        ? 'bg-[#00385E] text-white'
                        : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface-3)]'
                    }`}
                  >
                    {d.cidade}
                    <span className={`text-[11px] tabular-nums ${ativo ? 'text-white/70' : 'text-[var(--text-subtle)]'}`}>{d.km} km</span>
                  </button>
                );
              })}
            </div>

            {destinoRapido && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Dado rotulo="Ida e volta" valor={`${destinoRapido.km * 2} km`} />
                <Dado
                  rotulo="Tempo de ida"
                  valor={`~${Math.floor(horasTrecho)}h${String(Math.round((horasTrecho % 1) * 60)).padStart(2, '0')}`}
                />
                <Dado rotulo="Rodovia" valor={destinoRapido.rota.split(' ')[0]} />
              </div>
            )}

            <div className="mt-5">
              <label htmlFor="ns-destino" className={rotulo}>Destino e motivo da viagem</label>
              <textarea
                id="ns-destino"
                required
                rows={3}
                value={destino}
                onChange={e => setDestino(e.target.value)}
                placeholder="Ex.: Londrina/PR — visita técnica ao CENSE e reunião com a equipe regional."
                className={`${campo} h-auto py-3 leading-relaxed`}
              />
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="ns-passageiros" className="text-[13px] font-semibold text-[var(--text)]">
                  Outros passageiros <span className="font-normal text-[var(--text-subtle)]">(separe por vírgula)</span>
                </label>
                {veicSel && (
                  <span className={`text-xs tabular-nums font-semibold ${capacidadeExcedida ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>
                    {totalOcupantes} de {veicSel.capacidade} lugares
                  </span>
                )}
              </div>
              <input
                id="ns-passageiros"
                value={passageiros}
                onChange={e => setPassageiros(e.target.value)}
                placeholder="Ex.: Carlos Silveira, Ana Beatriz"
                aria-invalid={capacidadeExcedida}
                className={`${campo} ${capacidadeExcedida ? 'border-[var(--danger)]' : ''}`}
              />
              {capacidadeExcedida && veicSel && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-[var(--danger)]">
                  <AlertTriangle size={14} className="mt-px shrink-0" />
                  O {veicSel.modelo} leva até {veicSel.capacidade} pessoas. Escolha um veículo maior ou tire passageiros.
                </p>
              )}
            </div>
          </Etapa>
        </div>

        {/* Resumo e envio */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-[28px] bg-[#00385E] p-6 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Resumo do pedido</div>
            {veicSel ? (
              <div className="mt-3">
                <PlacaMercosul placa={veicSel.placa} uf="PR" className="scale-90 origin-left" />
                <div className="font-display mt-2 text-xl font-bold leading-tight">{veicSel.modelo}</div>
              </div>
            ) : (
              <div className="font-display mt-3 text-xl font-bold leading-tight text-white/50">Nenhum veículo escolhido</div>
            )}

            <dl className="mt-5 space-y-2.5 text-sm">
              <LinhaResumo rotulo="Quem pede" valor={nome || '—'} />
              <LinhaResumo rotulo="Quem dirige" valor={modalidade === 'com_motorista' ? 'Motorista do Transporte' : 'O próprio servidor'} />
              <LinhaResumo
                rotulo="Dias"
                valor={datasSelecionadas.length ? datasSelecionadas.map(formatarData).join(', ') : '—'}
              />
              <LinhaResumo rotulo="Período" valor={turnos.find(t => t.id === periodo)?.titulo ?? '—'} />
              <LinhaResumo rotulo="Pessoas" valor={String(totalOcupantes)} />
            </dl>
            {destino.trim() && (
              <p className="mt-4 rounded-[14px] bg-white/10 p-3 text-[13px] leading-relaxed text-white/85 line-clamp-4">{destino}</p>
            )}

            {erro && (
              <div role="alert" className="mt-4 flex items-start gap-2 rounded-[14px] bg-[#FFD3CC] p-3 text-[13px] font-medium text-[#7A160E]">
                <AlertCircle size={16} className="mt-px shrink-0" />
                {erro}
              </div>
            )}

            <button
              type="submit"
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#C6E86B] text-sm font-bold text-[#0B1B2E] transition-opacity hover:opacity-90 cursor-pointer"
            >
              Enviar para a chefia <ArrowRight size={16} />
            </button>
            <p className="mt-3 text-center text-xs text-white/60">
              A chefia recebe o pedido na Mesa e você é avisado quando ela decidir.
            </p>
            {rascunhoSalvoEm && (
              <p className="mt-3 text-center text-xs text-white/50">
                Rascunho salvo às {rascunhoSalvoEm} ·{' '}
                <button type="button" onClick={limparRascunho} className="underline hover:text-white cursor-pointer">
                  limpar
                </button>
              </p>
            )}
          </div>
        </aside>
      </form>

      {comprovante && (
        <div ref={comprovanteJanela} tabIndex={-1} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1B2E]/60 p-4 outline-none" role="dialog" aria-modal="true" aria-labelledby="ns-ok">
          <div ref={comprovanteRef} className="w-full max-w-md rounded-[28px] bg-[var(--surface)] p-6 sm:p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C6E86B] text-[#0B1B2E]">
              <Check size={24} strokeWidth={3} />
            </span>
            <h3 id="ns-ok" className="font-display mt-4 text-2xl font-bold text-[var(--text)]">Pedido enviado.</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Protocolo <strong className="tabular-nums text-[var(--text)]">{comprovante.ticket}</strong>. Agora é com a chefia.
            </p>
            <dl className="mt-5 space-y-2 rounded-[18px] bg-[var(--surface-2)] p-4 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">Veículo</dt><dd className="text-right font-semibold text-[var(--text)]">{comprovante.veiculoNome} · {comprovante.veiculoPlaca}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">Dias</dt><dd className="text-right font-semibold tabular-nums text-[var(--text)]">{comprovante.datas.map(formatarData).join(', ')}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">Situação</dt><dd className="font-semibold text-[var(--warning)]">Aguardando a chefia</dd></div>
            </dl>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => imprimir(comprovanteRef.current, `Pedido de veículo ${comprovante.ticket}`)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                <Printer size={15} /> Imprimir
              </button>
              <button
                type="button"
                onClick={() => setComprovante(null)}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[#0072BB] text-sm font-semibold text-white hover:bg-[#005A9C] cursor-pointer"
              >
                Pronto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Etapa: React.FC<{ numero: number; titulo: string; feito: boolean; children: React.ReactNode }> = ({
  numero,
  titulo,
  feito,
  children,
}) => (
  <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
    <div className="mb-5 flex items-center gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          feito ? 'bg-[#C6E86B] text-[#0B1B2E]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
        }`}
      >
        {feito ? <Check size={16} strokeWidth={3} /> : numero}
      </span>
      <h3 className="font-display text-xl font-bold text-[var(--text)]">{titulo}</h3>
    </div>
    {children}
  </section>
);

const Dado: React.FC<{ rotulo: string; valor: string }> = ({ rotulo, valor }) => (
  <div className="rounded-[14px] bg-[var(--surface-2)] px-3 py-2.5">
    <div className="text-[11px] text-[var(--text-muted)]">{rotulo}</div>
    <div className="text-sm font-bold tabular-nums text-[var(--text)]">{valor}</div>
  </div>
);

const LinhaResumo: React.FC<{ rotulo: string; valor: string }> = ({ rotulo, valor }) => (
  <div className="flex justify-between gap-3">
    <dt className="text-white/60">{rotulo}</dt>
    <dd className="text-right font-semibold">{valor}</dd>
  </div>
);
