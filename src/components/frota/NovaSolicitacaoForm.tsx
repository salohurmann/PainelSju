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
  Sparkles,
  Navigation,
  AlertTriangle
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

  // Validador de CPF Real (mesmo da base do usuário)
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

  // Calendário: dias do mês atual
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
    today.setHours(0,0,0,0);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#0072BB]/10 text-[#0072BB] flex items-center justify-center font-bold">
            <Car size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Solicitação de Veículo Oficial
            </h2>
            <p className="text-xs text-gray-500">
              Preencha os dados da missão oficial. O pedido será encaminhado à Chefia de Gabinete para aprovação em 1 clique.
            </p>
          </div>
        </div>

        {erro && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção 1: Dados do Servidor */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <User size={14} /> Dados do Servidor Solicitante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Nome do servidor"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072BB] focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={e => setCpf(formatarCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072BB] focus:bg-white outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Telefone Funcional / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={telefone}
                  onChange={e => setTelefone(formatarTelefone(e.target.value))}
                  placeholder="(41) 99999-9999"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072BB] focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  E-mail Institucional (recebe confirmação e aprovação)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="servidor@seju.pr.gov.br"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072BB] focus:bg-white outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Escolha do Veículo e Período */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <Car size={14} /> Seleção do Veículo & Período
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Veículo Solicitado *
                </label>
                <select
                  required
                  value={veiculoId}
                  onChange={e => {
                    setVeiculoId(e.target.value);
                    setDatasSelecionadas([]);
                  }}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072BB] focus:bg-white outline-hidden"
                >
                  <option value="">Selecione um veículo da frota SEJU</option>
                  {veiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.modelo} — Placa: {v.placa} ({v.capacidade} lugares, {v.cor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Modalidade *
                </label>
                <select
                  value={modalidade}
                  onChange={e => setModalidade(e.target.value as ModalidadeAgendamento)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072BB] focus:bg-white outline-hidden"
                >
                  <option value="com_motorista">Com Motorista Oficial</option>
                  <option value="sem_motorista">Sem Motorista (Condução Própria)</option>
                </select>
              </div>
            </div>

            {/* Calendário Visual com Verificação de Bloqueio */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={16} className="text-[#0072BB]" />
                  <span className="text-xs font-bold text-gray-800">
                    Calendário de Disponibilidade: {mesesNomes[calMes]} de {calAno}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleNavMes(-1)}
                    className="p-1.5 rounded-md hover:bg-white text-gray-600 border border-transparent hover:border-gray-200 transition cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavMes(1)}
                    className="p-1.5 rounded-md hover:bg-white text-gray-600 border border-transparent hover:border-gray-200 transition cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {!veiculoId ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  Selecione um veículo acima para visualizar os dias livres e ocupados.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase py-1">
                    <span>Dom</span>
                    <span>Seg</span>
                    <span>Ter</span>
                    <span>Qua</span>
                    <span>Qui</span>
                    <span>Sex</span>
                    <span>Sáb</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {/* Espaços vazios antes do 1º dia */}
                    {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-9" />
                    ))}

                    {/* Dias do Mês */}
                    {Array.from({ length: diasNoMes }).map((_, i) => {
                      const diaNum = i + 1;
                      const diaStr = String(diaNum).padStart(2, '0');
                      const mesStr = String(calMes + 1).padStart(2, '0');
                      const dataKey = `${calAno}-${mesStr}-${diaStr}`;
                      const isSelected = datasSelecionadas.includes(dataKey);
                      const { ocupado, parcial, passado } = checkDataStatus(dataKey);

                      let bgClass = 'bg-white hover:bg-blue-50 text-gray-700 border-gray-200';
                      if (passado) {
                        bgClass = 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed';
                      } else if (ocupado) {
                        bgClass = 'bg-red-50 text-red-400 border-red-100 cursor-not-allowed line-through';
                      } else if (isSelected) {
                        bgClass = 'bg-[#0072BB] text-white border-[#0072BB] font-bold shadow-xs';
                      } else if (parcial) {
                        bgClass = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
                      }

                      return (
                        <button
                          key={dataKey}
                          type="button"
                          disabled={ocupado || passado}
                          onClick={() => handleToggleData(dataKey)}
                          className={`h-9 rounded-lg border flex items-center justify-center font-mono text-xs transition cursor-pointer ${bgClass}`}
                        >
                          {diaNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legenda do Calendário */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] text-gray-500 border-t border-gray-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300" /> Disponível
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0072BB]" /> Selecionado
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Parcialmente Ocupado
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Ocupado
                    </span>
                  </div>
                </>
              )}

              {/* Chips de Datas Selecionadas */}
              {datasSelecionadas.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-gray-600 mb-1.5">
                    Datas Escolhidas ({datasSelecionadas.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {datasSelecionadas.map(d => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 bg-[#0072BB]/10 text-[#0072BB] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#0072BB]/20"
                      >
                        {d.split('-').reverse().join('/')}
                        <button
                          type="button"
                          onClick={() => handleToggleData(d)}
                          className="hover:text-red-600 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Período */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Período da Utilização *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'manha', label: 'Manhã', desc: '08h às 12h' },
                  { id: 'tarde', label: 'Tarde', desc: '13h às 18h' },
                  { id: 'dia_todo', label: 'Dia Todo', desc: '08h às 18h' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriodo(p.id as PeriodoAgendamento)}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                      periodo === p.id
                        ? 'border-[#0072BB] bg-blue-50/60 text-[#0072BB]'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[10px] text-gray-400">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seção 3: Detalhes da Missão Oficial */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <MapPin size={14} /> Destino & Justificativa
            </h3>

            {/* Chips de Destinos Frequentes do Estado do Paraná */}
            <div className="mb-4">
              <div className="text-[11px] font-bold text-gray-600 mb-2 flex items-center gap-1.5">
                <Navigation size={13} className="text-[#0072BB]" /> Destinos Oficiais Recorrentes (Atalhos Rápidos SEJU)
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
                          ? 'border-[#0072BB] bg-[#0072BB]/10 text-[#0072BB] font-bold ring-1 ring-[#0072BB]'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{d.cidade}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{d.km} km (ida)</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Painel de Telemetria e Estimativa de Custos da Viagem */}
            {destInfo && (
              <div className="mb-4 p-3.5 bg-gradient-to-r from-blue-50/80 via-white to-emerald-50/60 border border-blue-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#00385E]">
                  <span className="flex items-center gap-1.5">
                    <Gauge size={14} className="text-[#0072BB]" /> Estimativa de Telemetria: Curitiba ⇄ {destInfo.cidade}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                    {destInfo.rota}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="bg-white/90 p-2 rounded-lg border border-gray-200/70">
                    <div className="text-[10px] text-gray-500 font-semibold">Distância Total</div>
                    <div className="font-bold text-gray-900 font-mono text-sm">{destInfo.km * 2} km</div>
                    <div className="text-[9px] text-gray-400">Trajeto ida e volta</div>
                  </div>
                  <div className="bg-white/90 p-2 rounded-lg border border-gray-200/70">
                    <div className="text-[10px] text-gray-500 font-semibold">Consumo Combustível</div>
                    <div className="font-bold text-[#0072BB] font-mono text-sm">{((destInfo.km * 2) / 10.5).toFixed(1)} L</div>
                    <div className="text-[9px] text-gray-400">Média 10,5 km/L</div>
                  </div>
                  <div className="bg-white/90 p-2 rounded-lg border border-gray-200/70">
                    <div className="text-[10px] text-gray-500 font-semibold">Cartão Combustível</div>
                    <div className="font-bold text-emerald-700 font-mono text-sm">
                      R$ {(((destInfo.km * 2) / 10.5) * 5.89).toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-[9px] text-gray-400">Ref. R$ 5,89/L Gov/PR</div>
                  </div>
                  <div className="bg-white/90 p-2 rounded-lg border border-gray-200/70">
                    <div className="text-[10px] text-gray-500 font-semibold">Tempo de Estrada</div>
                    <div className="font-bold text-gray-800 font-mono text-sm">
                      ~{Math.floor(destInfo.km / 80)}h{Math.round(((destInfo.km / 80) % 1) * 60).toString().padStart(2, '0')}min
                    </div>
                    <div className="text-[9px] text-gray-400">Estimativa por trecho</div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Destino e Finalidade da Viagem *
                </label>
                <textarea
                  required
                  rows={3}
                  value={destino}
                  onChange={e => setDestino(e.target.value)}
                  placeholder="Ex: Paranaguá/PR — Vistoria técnica da unidade de acolhimento socioeducativo conforme expediente nº 21.042/2026..."
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072BB] focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Passageiros Adicionais (Nomes e Funções)
                  </label>
                  {veicSel && (
                    <span className="text-[11px] font-medium text-gray-500">
                      Ocupação Estimada: <strong className={capacidadeExcedida ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>{totalOcupantes}</strong> de {veicSel.capacidade} lugares
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={passageiros}
                  onChange={e => setPassageiros(e.target.value)}
                  placeholder="Ex: Carlos Silveira (Assistente Social), Ana Beatriz (Psicóloga)"
                  className={`w-full text-xs p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#0072BB] focus:bg-white outline-hidden ${
                    capacidadeExcedida ? 'border-red-400 bg-red-50/50' : 'border-gray-300'
                  }`}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Separe os nomes por vírgula. O servidor solicitante é computado automaticamente no total de ocupantes.
                </p>
              </div>

              {capacidadeExcedida && veicSel && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
                  <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Capacidade de Ocupantes Excedida!</div>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      O veículo selecionado ({veicSel.modelo}) possui apenas <strong>{veicSel.capacidade} lugares</strong>, mas a lista de ocupantes soma <strong>{totalOcupantes} pessoas</strong>. Favor alterar a seleção do veículo para uma van ou utilitário de 7 lugares (ex: Chevrolet Spin) ou reduzir o número de servidores.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="bg-[#0072BB] hover:bg-[#00538a] text-white text-xs font-bold px-6 py-3 rounded-lg shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              Enviar para Validação da Chefia
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Comprovante de Solicitação com QR Code / Protocolo */}
      {comprovante && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <div className="text-center border-b border-dashed border-gray-200 pb-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-bold">
                <FileCheck2 size={24} />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Solicitação Registrada com Sucesso!
              </h3>
              <div className="text-xs font-mono text-[#0072BB] font-bold mt-1">
                Protocolo Oficial: {comprovante.ticket}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Notificação enviada automaticamente à Chefia de Gabinete para deliberação.
              </p>
            </div>

            <div className="space-y-2 text-xs text-gray-600 mb-6">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-400">SOLICITANTE:</span>
                <span className="font-bold text-gray-800">{comprovante.nome}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-400">VEÍCULO:</span>
                <span className="font-bold text-gray-800">{comprovante.veiculoNome} ({comprovante.veiculoPlaca})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-400">DATA(S):</span>
                <span className="font-bold text-gray-800">{comprovante.datas.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-400">DESTINO:</span>
                <span className="font-medium text-gray-800 text-right max-w-xs">{comprovante.destino}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="font-semibold text-gray-400">STATUS:</span>
                <span className="font-bold text-amber-600 uppercase bg-amber-50 px-2 py-0.5 rounded">
                  Aguardando Aprovação
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={16} /> Imprimir Comprovante
              </button>
              <button
                type="button"
                onClick={() => setComprovante(null)}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#0072BB] text-white hover:bg-[#00538a] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
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
