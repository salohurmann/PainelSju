import React, { useState } from 'react';
import { Agendamento, Veiculo, PeriodoAgendamento, ModalidadeAgendamento } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Car, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Printer,
  FileCheck2,
  AlertCircle,
  Fuel,
  Gauge,
  Navigation,
  AlertTriangle,
  ShieldCheck,
  ArrowRight
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
  { cidade: 'Ponta Grossa', km: 115, rota: 'BR-376 (Campos Gerais)' },
  { cidade: 'Londrina', km: 380, rota: 'BR-376 (Norte do PR)' },
  { cidade: 'Maringá', km: 425, rota: 'BR-376 (Noroeste)' },
  { cidade: 'Cascavel', km: 498, rota: 'BR-277 (Oeste do PR)' },
  { cidade: 'Foz do Iguaçu', km: 635, rota: 'BR-277 (Fronteira)' },
  { cidade: 'Paranaguá', km: 90, rota: 'BR-277 (Litoral do PR)' }
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

  // Verificação de Capacidade e Telemetria de Viagem
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
      return setErro('Informe o nome completo do solicitante.');
    }
    if (!validarCPF(cpf)) {
      soundFX.playWarning();
      return setErro('CPF inválido. Verifique o número digitado.');
    }
    if (!telefone.trim()) {
      soundFX.playWarning();
      return setErro('Informe o telefone de contato funcional.');
    }
    if (!veiculoId) {
      soundFX.playWarning();
      return setErro('Selecione um veículo oficial para a missão.');
    }
    if (datasSelecionadas.length === 0) {
      soundFX.playWarning();
      return setErro('Selecione ao menos uma data disponível no calendário.');
    }
    if (!destino.trim()) {
      soundFX.playWarning();
      return setErro('Descreva o destino e a finalidade oficial da missão.');
    }
    if (capacidadeExcedida) {
      soundFX.playWarning();
      return setErro(`Capacidade de passageiros excedida: o veículo ${veicSel?.modelo} possui ${veicSel?.capacidade} lugares, mas a missão possui ${totalOcupantes} ocupantes.`);
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

    // Reset formulário
    setDatasSelecionadas([]);
    setDestino('');
    setPassageiros('');
    setCidadeDestino(null);
  };

  // Status de preenchimento das etapas para indicador visual
  const step1Completo = Boolean(nome.trim() && cpf.replace(/\D/g, '').length === 11 && telefone.trim());
  const step2Completo = Boolean(veiculoId && datasSelecionadas.length > 0 && destino.trim() && !capacidadeExcedida);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho Executivo & Indicador de Etapas */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Car size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  REQUISIÇÃO DE FROTA OFICIAL
                </span>
                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/80">
                  Fluxo 1-Clique
                </span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5">
                Nova Solicitação de Veículo Oficial
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Preencha as três etapas abaixo para submeter a missão à deliberação da Chefia de Gabinete.
              </p>
            </div>
          </div>

          {/* Stepper Horizontal */}
          <div className="flex items-center gap-2 self-start md:self-center bg-slate-50 p-1.5 rounded-xl border border-slate-200/80">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              step1Completo ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60' : 'text-slate-600'
            }`}>
              <span className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center ${
                step1Completo ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
              }`}>
                {step1Completo ? '✓' : '1'}
              </span>
              <span className="hidden sm:inline">Servidor</span>
            </div>

            <ChevronRight size={14} className="text-slate-300" />

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              step2Completo ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60' : 'text-slate-600'
            }`}>
              <span className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center ${
                step2Completo ? 'bg-emerald-600 text-white' : step1Completo ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {step2Completo ? '✓' : '2'}
              </span>
              <span className="hidden sm:inline">Veículo & Roteiro</span>
            </div>

            <ChevronRight size={14} className="text-slate-300" />

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600">
              <span className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center ${
                step1Completo && step2Completo ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </span>
              <span className="hidden sm:inline">Confirmação</span>
            </div>
          </div>
        </div>

        {erro && (
          <div className="mt-5 p-3.5 bg-red-50/80 border border-red-200/80 rounded-xl text-xs text-red-700 flex items-center gap-2.5">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span className="font-medium">{erro}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal: Etapas 1 e 2 */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: IDENTIFICAÇÃO DO SERVIDOR */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-800 font-mono text-xs font-bold flex items-center justify-center">
                  01
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Identificação do Servidor
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Dados funcionais do responsável pela requisição e recebimento do passe digital
                  </p>
                </div>
              </div>
              <User size={16} className="text-slate-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Nome completo do servidor"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  CPF *
                </label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={e => setCpf(formatarCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden font-mono transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Telefone Funcional / WhatsApp *
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={e => setTelefone(formatarTelefone(e.target.value))}
                    placeholder="(41) 99999-9999"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  E-mail Institucional
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="servidor@seju.pr.gov.br"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: SELEÇÃO DO VEÍCULO & ROTEIRO */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-800 font-mono text-xs font-bold flex items-center justify-center">
                  02
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Seleção do Veículo & Roteiro
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Escolha a viatura oficial, datas disponíveis e especifique o destino da missão
                  </p>
                </div>
              </div>
              <MapPin size={16} className="text-slate-400" />
            </div>

            {/* Veículo e Modalidade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Veículo Solicitado *
                </label>
                <select
                  required
                  value={veiculoId}
                  onChange={e => {
                    setVeiculoId(e.target.value);
                    setDatasSelecionadas([]);
                  }}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden transition"
                >
                  <option value="">Selecione um veículo da frota oficial SEJU</option>
                  {veiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.modelo} — Placa {v.placa} ({v.capacidade} lugares, {v.cor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Modalidade de Condução *
                </label>
                <select
                  value={modalidade}
                  onChange={e => setModalidade(e.target.value as ModalidadeAgendamento)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden transition"
                >
                  <option value="com_motorista">Com Motorista Oficial</option>
                  <option value="sem_motorista">Condução Própria</option>
                </select>
              </div>
            </div>

            {/* Calendário e Período em Grid Dividido */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
              {/* Calendário */}
              <div className="md:col-span-7 p-4 bg-slate-50/60 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={15} className="text-slate-700" />
                    <span className="text-xs font-semibold text-slate-800">
                      {mesesNomes[calMes]} {calAno}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleNavMes(-1)}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-600 border border-transparent hover:border-slate-200/80 transition cursor-pointer"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavMes(1)}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-600 border border-transparent hover:border-slate-200/80 transition cursor-pointer"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                {!veiculoId ? (
                  <div className="py-10 px-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
                    Selecione um veículo acima para consultar a disponibilidade no calendário.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400 uppercase">
                      <span>Dom</span>
                      <span>Seg</span>
                      <span>Ter</span>
                      <span>Qua</span>
                      <span>Qui</span>
                      <span>Sex</span>
                      <span>Sáb</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-8" />
                      ))}

                      {Array.from({ length: diasNoMes }).map((_, i) => {
                        const diaNum = i + 1;
                        const diaStr = String(diaNum).padStart(2, '0');
                        const mesStr = String(calMes + 1).padStart(2, '0');
                        const dataKey = `${calAno}-${mesStr}-${diaStr}`;
                        const isSelected = datasSelecionadas.includes(dataKey);
                        const { ocupado, parcial, passado } = checkDataStatus(dataKey);

                        let bgClass = 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/80';
                        if (passado) {
                          bgClass = 'bg-slate-100/60 text-slate-300 border-transparent cursor-not-allowed';
                        } else if (ocupado) {
                          bgClass = 'bg-red-50/70 text-red-400 border-red-100 cursor-not-allowed line-through';
                        } else if (isSelected) {
                          bgClass = 'bg-slate-900 text-white border-slate-900 font-semibold shadow-2xs';
                        } else if (parcial) {
                          bgClass = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
                        }

                        return (
                          <button
                            key={dataKey}
                            type="button"
                            disabled={ocupado || passado}
                            onClick={() => handleToggleData(dataKey)}
                            className={`h-8 rounded-lg border flex items-center justify-center font-mono text-[11px] transition cursor-pointer ${bgClass}`}
                          >
                            {diaNum}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-slate-500 border-t border-slate-200/60">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white border border-slate-300" /> Livre
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-900" /> Selecionado
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> Parcial
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-400" /> Ocupado
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Período e Datas Selecionadas */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Turno de Utilização *
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'manha', label: 'Período da Manhã', desc: '08h00 às 12h00' },
                      { id: 'tarde', label: 'Período da Tarde', desc: '13h00 às 18h00' },
                      { id: 'dia_todo', label: 'Integral (Dia Todo)', desc: '08h00 às 18h00' }
                    ].map(p => {
                      const active = periodo === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPeriodo(p.id as PeriodoAgendamento)}
                          className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                            active
                              ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                              : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold">{p.label}</div>
                            <div className={`text-[10px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>{p.desc}</div>
                          </div>
                          <Clock size={14} className={active ? 'text-white' : 'text-slate-400'} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chips de Datas */}
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  <div className="text-[11px] font-medium text-slate-500 mb-2 flex items-center justify-between">
                    <span>Datas selecionadas</span>
                    <span className="font-mono font-bold text-slate-800">{datasSelecionadas.length}</span>
                  </div>
                  {datasSelecionadas.length === 0 ? (
                    <div className="text-[11px] text-slate-400">
                      Nenhuma data marcada no calendário.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {datasSelecionadas.map(d => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1 bg-white text-slate-800 text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs"
                        >
                          {d.split('-').reverse().join('/')}
                          <button
                            type="button"
                            onClick={() => handleToggleData(d)}
                            className="text-slate-400 hover:text-red-600 cursor-pointer ml-0.5"
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

            {/* Destinos Rápidos & Telemetria */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Navigation size={13} className="text-slate-500" /> Rotas Oficiais Frequentes (Atalhos)
                  </label>
                  <span className="text-[10px] text-slate-400">Preenche roteiro e calcula estimativa</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {DESTINOS_PARANA.map(d => {
                    const isSel = cidadeDestino === d.cidade || (destino && destino.toLowerCase().includes(d.cidade.toLowerCase()));
                    return (
                      <button
                        key={d.cidade}
                        type="button"
                        onClick={() => {
                          setCidadeDestino(d.cidade);
                          soundFX.playClick();
                          setDestino(`${d.cidade}/PR via ${d.rota} — Vistoria técnica institucional e atendimento regional SEJU`);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          isSel
                            ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                            : 'border-slate-200/80 bg-slate-50/50 hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="text-xs font-semibold truncate">{d.cidade}</div>
                        <div className={`text-[10px] font-mono mt-0.5 ${isSel ? 'text-slate-300' : 'text-slate-400'}`}>
                          {d.km} km
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {destInfo && (
                <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Gauge size={14} className="text-slate-600" /> Estimativa de Deslocamento: Curitiba ⇄ {destInfo.cidade}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-slate-600 bg-white px-2.5 py-0.5 rounded-md border border-slate-200/80">
                      {destInfo.rota}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                      <div className="text-[10px] text-slate-400">Distância Total</div>
                      <div className="font-semibold text-slate-900 font-mono text-sm mt-0.5">{destInfo.km * 2} km</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                      <div className="text-[10px] text-slate-400">Combustível Est.</div>
                      <div className="font-semibold text-slate-900 font-mono text-sm mt-0.5">{((destInfo.km * 2) / 10.5).toFixed(1)} L</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                      <div className="text-[10px] text-slate-400">Custo Estimado</div>
                      <div className="font-semibold text-emerald-700 font-mono text-sm mt-0.5">
                        R$ {(((destInfo.km * 2) / 10.5) * 5.89).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                      <div className="text-[10px] text-slate-400">Tempo por Trecho</div>
                      <div className="font-semibold text-slate-900 font-mono text-sm mt-0.5">
                        ~{Math.floor(destInfo.km / 80)}h{Math.round(((destInfo.km / 80) % 1) * 60).toString().padStart(2, '0')}m
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Destino e Finalidade Oficial da Missão *
                </label>
                <textarea
                  required
                  rows={3}
                  value={destino}
                  onChange={e => setDestino(e.target.value)}
                  placeholder="Descreva a cidade, órgão visitado e objetivo institucional da viagem..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white outline-hidden transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    Passageiros Adicionais (separados por vírgula)
                  </label>
                  {veicSel && (
                    <span className="text-[11px] text-slate-500">
                      Ocupação: <strong className={capacidadeExcedida ? 'text-red-600' : 'text-slate-900'}>{totalOcupantes}</strong>/{veicSel.capacidade} lugares
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Users size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={passageiros}
                    onChange={e => setPassageiros(e.target.value)}
                    placeholder="Ex: Carlos Silveira, Ana Beatriz"
                    className={`w-full text-xs pl-9 pr-3.5 py-2.5 border rounded-xl outline-hidden transition ${
                      capacidadeExcedida
                        ? 'border-red-300 bg-red-50/50 focus:border-red-500'
                        : 'bg-slate-50/70 border-slate-200/90 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {capacidadeExcedida && veicSel && (
                <div className="p-3.5 bg-red-50/80 border border-red-200/80 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Limite de ocupantes excedido</div>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      O veículo {veicSel.modelo} comporta {veicSel.capacidade} pessoas, mas há {totalOcupantes} ocupantes listados. Selecione um utilitário maior ou ajuste a lista.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Lateral: STEP 3: CONFIRMAÇÃO & SUBMISSÃO */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                  03
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Revisão & Confirmação
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Resumo da ordem de tráfego
                  </p>
                </div>
              </div>
              <ShieldCheck size={16} className="text-slate-400" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2.5">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-400">Solicitante</span>
                  <span className="font-medium text-slate-900 text-right truncate max-w-[180px]">
                    {nome || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400">CPF</span>
                  <span className="font-mono text-slate-700">
                    {cpf || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-2 pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400">Viatura</span>
                  <span className="font-medium text-slate-900 text-right">
                    {veicSel ? `${veicSel.modelo} (${veicSel.placa})` : 'Não selecionada'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400">Modalidade</span>
                  <span className="text-slate-700 font-medium">
                    {modalidade === 'com_motorista' ? 'Com Motorista' : 'Condução Própria'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400">Datas</span>
                  <span className="font-mono text-slate-800 font-medium">
                    {datasSelecionadas.length > 0 ? `${datasSelecionadas.length} dia(s)` : 'Nenhuma'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400">Ocupação</span>
                  <span className="text-slate-700 font-medium">
                    {totalOcupantes} {totalOcupantes === 1 ? 'ocupante' : 'ocupantes'}
                  </span>
                </div>
              </div>

              {destino && (
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Roteiro Especificado
                  </span>
                  <p className="text-slate-700 line-clamp-3 leading-relaxed">
                    {destino}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-3.5 rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                Enviar para Validação da Chefia
                <ArrowRight size={14} />
              </button>
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Gera protocolo auditável imediato e notifica a Chefia de Gabinete para aprovação em 1 clique.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Comprovante de Solicitação */}
      {comprovante && (
        <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200/80 animate-in zoom-in-95">
            <div className="text-center border-b border-slate-100 pb-5 mb-5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center mx-auto mb-3">
                <FileCheck2 size={22} />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 font-semibold">
                Requisição Protocolada
              </span>
              <h3 className="text-base font-semibold text-slate-900 mt-2">
                Solicitação Registrada com Sucesso
              </h3>
              <div className="text-xs font-mono text-slate-700 font-semibold mt-1">
                Protocolo: {comprovante.ticket}
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 mb-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Solicitante</span>
                <span className="font-semibold text-slate-900">{comprovante.nome}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Veículo</span>
                <span className="font-semibold text-slate-900">{comprovante.veiculoNome} ({comprovante.veiculoPlaca})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Data(s)</span>
                <span className="font-mono font-medium text-slate-800">{comprovante.datas.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Destino</span>
                <span className="font-medium text-slate-800 text-right max-w-xs">{comprovante.destino}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Status</span>
                <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
                  Aguardando Aprovação
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200/90 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Printer size={15} /> Imprimir
              </button>
              <button
                type="button"
                onClick={() => setComprovante(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
