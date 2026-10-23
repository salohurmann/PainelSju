import React, { useState, useEffect } from 'react';
import { Agendamento, Veiculo, PeriodoAgendamento, ModalidadeAgendamento } from '../../types';
import { PlacaMercosul } from '../ui/PlacaMercosul';
import { 
  Calendar as CalendarIcon, 
  Car, 
  User, 
  Phone, 
  Mail, 
  
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
  
  Navigation,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Compass,
  Sparkles,
  Route
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
        const agora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      return setErro('Selecione um veículo oficial no Showroom para a missão.');
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
  const step2Completo = Boolean(veiculoId && datasSelecionadas.length > 0 && destino.trim() && !capacidadeExcedida);

  return (
    <div className="space-y-6 font-sans">
      {/* Cabeçalho Executivo & Indicador de Etapas */}
      <div className="relative bg-[var(--surface)] rounded-[var(--radius-lg)] p-5 sm:p-6 border border-[var(--border)] overflow-hidden">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-[18px] bg-[#0B1B2E] text-white flex items-center justify-center shrink-0 border border-[#22324C]/80">
              <Car size={20} className="text-[var(--brand)]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] tabular-nums uppercase tracking-[0.18em] text-[var(--text-muted)] font-bold">
                  ORDEM DE TRÁFEGO OFICIAL · SEJU/PR
                </span>
                <span className="text-[10px] tabular-nums font-semibold bg-[var(--brand-soft)] text-[var(--brand)] px-2 py-0.5 rounded-md border border-[var(--brand-border)]/80 flex items-center gap-1">
                  <Sparkles size={10} /> Despacho Express 1-Clique
                </span>
              </div>
              <h2 className="text-lg font-bold text-[var(--text)] tracking-tight mt-0.5">
                Nova Requisição de Viatura Oficial
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <p className="text-xs text-[var(--text-muted)]">
                  Selecione a viatura no Showroom Digital, configure o computador de rota e envie para chancela da Chefia.
                </p>
                {rascunhoSalvoEm && (
                  <div className="flex items-center gap-1.5 text-[11px] bg-[var(--surface-2)] text-[var(--text-muted)] px-2.5 py-0.5 rounded-full border border-[var(--border)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A859] " />
                    <span>Rascunho salvo ({rascunhoSalvoEm})</span>
                    <button
                      type="button"
                      onClick={limparRascunho}
                      className="text-[10px] text-[var(--danger)] hover:underline ml-1 cursor-pointer font-medium"
                      title="Descartar rascunho salvo"
                    >
                      Limpar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stepper Horizontal Tátil */}
          <div className="flex items-center gap-1.5 self-start md:self-center bg-[var(--surface-2)]/80 p-1.5 rounded-[18px] border border-[var(--border)]/90 ">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              step1Completo
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs border border-[var(--verde-border)]/80'
                : 'bg-[var(--surface)]/60 text-[var(--text)] border border-transparent'
            }`}>
              <span className={`w-5 h-5 rounded-lg text-[10px] tabular-nums font-bold flex items-center justify-center transition-colors ${
                step1Completo ? 'bg-[#00703C] text-white ' : 'bg-[#0B1B2E] text-white'
              }`}>
                {step1Completo ? '✓' : '01'}
              </span>
              <span className="hidden sm:inline">Servidor</span>
            </div>

            <ChevronRight size={13} className="text-[var(--text-subtle)]" />

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              step2Completo
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs border border-[var(--verde-border)]/80'
                : 'text-[var(--text-muted)]'
            }`}>
              <span className={`w-5 h-5 rounded-lg text-[10px] tabular-nums font-bold flex items-center justify-center transition-colors ${
                step2Completo
                  ? 'bg-[#00703C] text-white '
                  : step1Completo
                  ? 'bg-[#0B1B2E] text-white'
                  : 'bg-[var(--surface-3)] text-[var(--text-muted)]'
              }`}>
                {step2Completo ? '✓' : '02'}
              </span>
              <span className="hidden sm:inline">Showroom & Rota</span>
            </div>

            <ChevronRight size={13} className="text-[var(--text-subtle)]" />

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              step1Completo && step2Completo ? 'bg-[#0B1B2E] text-white shadow-xs' : 'text-[var(--text-muted)]'
            }`}>
              <span className={`w-5 h-5 rounded-lg text-[10px] tabular-nums font-bold flex items-center justify-center ${
                step1Completo && step2Completo ? 'bg-[#0072BB] text-[var(--text)]' : 'bg-[var(--surface-3)] text-[var(--text-muted)]'
              }`}>
                03
              </span>
              <span className="hidden sm:inline">Chancela</span>
            </div>
          </div>
        </div>

        {erro && (
          <div className="mt-5 p-3.5 bg-[var(--danger-soft)]/90 border border-[var(--danger-border)] rounded-xl text-xs text-[var(--danger)] flex items-center gap-2.5 shadow-2xs">
            <AlertCircle size={16} className="text-[var(--danger)] shrink-0" />
            <span className="font-semibold">{erro}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal: Etapas 1 e 2 */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: IDENTIFICAÇÃO DO SERVIDOR */}
          <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] p-5 sm:p-6 border border-[var(--border)] space-y-5">

            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#0B1B2E] text-white tabular-nums text-xs font-bold flex items-center justify-center shadow-2xs">
                  01
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)] tracking-tight">
                    Credencial Funcional do Servidor Requisitante
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Dados oficiais do responsável pela missão e emissão do QR-Pass de portaria
                  </p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]/80 text-[10px] tabular-nums text-[var(--text-muted)] flex items-center gap-1.5">
                <User size={12} className="text-[var(--text-muted)]" /> CADASTRO SEJU
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Nome Completo do Servidor *
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-2.5 text-[var(--text-subtle)]" />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Nome completo do servidor"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-[var(--surface-2)]/80 border border-[var(--border)]/90 rounded-xl focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[#22324C] focus:bg-[var(--surface)] outline-hidden transition font-medium text-[var(--text)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  CPF Funcional *
                </label>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={e => setCpf(formatarCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full text-xs px-3.5 py-2.5 bg-[var(--surface-2)]/80 border border-[var(--border)]/90 rounded-xl focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[#22324C] focus:bg-[var(--surface)] outline-hidden tabular-nums font-semibold text-[var(--text)] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Telefone Funcional / WhatsApp *
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-2.5 text-[var(--text-subtle)]" />
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={e => setTelefone(formatarTelefone(e.target.value))}
                    placeholder="(41) 99999-9999"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-[var(--surface-2)]/80 border border-[var(--border)]/90 rounded-xl focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[#22324C] focus:bg-[var(--surface)] outline-hidden tabular-nums font-medium text-[var(--text)] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  E-mail Institucional
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-2.5 text-[var(--text-subtle)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="servidor@seju.pr.gov.br"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-[var(--surface-2)]/80 border border-[var(--border)]/90 rounded-xl focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[#22324C] focus:bg-[var(--surface)] outline-hidden transition text-[var(--text)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: SHOWROOM DE SELEÇÃO DO VEÍCULO & COMPUTADOR DE BORDO */}
          <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] p-5 sm:p-6 border border-[var(--border)] space-y-6">

            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#0B1B2E] text-white tabular-nums text-xs font-bold flex items-center justify-center shadow-2xs">
                  02
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)] tracking-tight">
                    Showroom de Viaturas & Computador de Rota
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Selecione a viatura oficial abaixo, defina a condução e programe a telemetria rodoviária
                  </p>
                </div>
              </div>
              <span className="text-[10px] tabular-nums uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#0B1B2E] text-[var(--brand)] font-semibold">
                {veiculos.length} VIATURAS NO PÁTIO
              </span>
            </div>

            {/* Cards de Seleção de Veículo Estilo Showroom com Borda Iluminada */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Car size={13} className="text-[var(--text)]" /> Selecione a Viatura no Showroom *
                </label>
                {/* Select rápido auxiliar sincronizado */}
                <select
                  value={veiculoId}
                  onChange={e => {
                    soundFX.playClick();
                    setVeiculoId(e.target.value);
                    setDatasSelecionadas([]);
                  }}
                  className="text-[11px] font-medium px-2.5 py-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg text-[var(--text)] outline-hidden focus:border-[#22324C] cursor-pointer"
                >
                  <option value="">Troca rápida por lista...</option>
                  {veiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.modelo} ({v.placa})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {veiculos.map(v => {
                  const selecionado = veiculoId === v.id;
                  const disp = v.status === 'disponivel';
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        soundFX.playClick();
                        setVeiculoId(v.id);
                        setDatasSelecionadas([]);
                      }}
                      className={`relative rounded-[18px] p-4 border transition-all duration-300 cursor-pointer select-none overflow-hidden group ${
                        selecionado
                          ? ' bg-[#0B1B2E]   text-white border-[var(--brand)]  -translate-y-0.5'
                          : 'bg-[var(--surface-2)]/70 hover:bg-[var(--surface)] text-[var(--text)] border-[var(--border)]/90 hover:border-[var(--border-strong)] hover:shadow-sm'
                      }`}
                    >
                      {selecionado && (
                        <div className="absolute inset-x-6 top-0 h-[1.5px] bg-[var(--brand)]" />
                      )}

                      <div className="flex items-start justify-between gap-2 mb-3">
                        <PlacaMercosul placa={v.placa} uf="PR" className="scale-90 origin-top-left" />
                        <span className={`text-[10px] tabular-nums font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          selecionado
                            ? 'bg-[#0072BB]/20 text-[#DCEEFB] border-[var(--brand)]/40'
                            : disp
                            ? 'bg-[var(--verde-soft)] text-[var(--verde)] border-[var(--verde-border)]'
                            : 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-border)]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            selecionado ? 'bg-[#0072BB] ' : disp ? 'bg-[#00A859]' : 'bg-[#D98A00]'
                          }`} />
                          {selecionado ? 'SELECIONADO' : disp ? 'PÁTIO LIVRE' : v.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="font-bold text-sm tracking-tight truncate">
                        {v.modelo}
                      </div>

                      <div className={`flex items-center justify-between text-[11px] mt-2 pt-2 border-t ${
                        selecionado ? 'border-[#22324C] text-[var(--ink-muted)]' : 'border-[var(--border)]/70 text-[var(--text-muted)]'
                      }`}>
                        <span className="flex items-center gap-1 font-medium">
                          <Users size={12} className={selecionado ? 'text-[var(--brand)]' : 'text-[var(--text-subtle)]'} />
                          {v.capacidade} lug · {v.cor}
                        </span>
                        <span className="flex items-center gap-1.5 tabular-nums text-[10px]">
                          <Fuel size={11} className={v.nivelCombustivel > 30 ? 'text-[var(--verde)]' : 'text-[var(--warning)]'} />
                          {v.nivelCombustivel}%
                          <span className="opacity-50">|</span>
                          {(v.kmAtual / 1000).toFixed(1)}k km
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modalidade de Condução Tátil */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Modalidade de Condução Oficial *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'com_motorista',
                    titulo: 'Com Motorista Oficial SEJU',
                    sub: 'Condutor credenciado designado pelo Setor de Transporte',
                    badge: 'RECOMENDADO'
                  },
                  {
                    id: 'sem_motorista',
                    titulo: 'Condução Própria (Servidor Autorizado)',
                    sub: 'Requer CNH válida e termo de responsabilidade funcional',
                    badge: 'AUTÔNOMO'
                  }
                ].map(mod => {
                  const ativo = modalidade === mod.id;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setModalidade(mod.id as ModalidadeAgendamento);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        ativo
                          ? 'bg-[#0B1B2E] text-white border-[#22324C] '
                          : 'bg-[var(--surface-2)]/70 hover:bg-[var(--surface)] text-[var(--text)] border-[var(--border)]/90'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{mod.titulo}</div>
                        <div className={`text-[10px] mt-0.5 ${ativo ? 'text-[var(--ink-muted)]' : 'text-[var(--text-muted)]'}`}>
                          {mod.sub}
                        </div>
                      </div>
                      <span className={`text-[9px] tabular-nums font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        ativo ? 'bg-[#0072BB]/20 text-[#DCEEFB] border border-[var(--brand)]/30' : 'bg-[var(--surface-3)]/70 text-[var(--text-muted)]'
                      }`}>
                        {mod.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendário e Período em Grid Dividido com Acabamento Tátil */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
              {/* Calendário */}
              <div className="md:col-span-7 p-4.5 bg-[var(--surface-2)]/80 border border-[var(--border)]/90 rounded-[18px] space-y-3.5 ">
                <div className="flex items-center justify-between bg-[var(--surface)] px-3.5 py-2 rounded-xl border border-[var(--border)]/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={15} className="text-[var(--text)]" />
                    <span className="text-xs font-bold text-[var(--text)] tracking-tight">
                      {mesesNomes[calMes]} <span className="tabular-nums text-[var(--text-muted)]">{calAno}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleNavMes(-1)}
                      className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[#0B1B2E] hover:text-white text-[var(--text)] border border-[var(--border)]/80 transition cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavMes(1)}
                      className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[#0B1B2E] hover:text-white text-[var(--text)] border border-[var(--border)]/80 transition cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {!veiculoId ? (
                  <div className="py-12 px-4 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-strong)] rounded-xl bg-[var(--surface)]/80 space-y-1.5">
                    <Car size={22} className="mx-auto text-[var(--text-subtle)]" />
                    <div className="font-semibold text-[var(--text)]">Nenhuma viatura selecionada</div>
                    <div className="text-[11px] text-[var(--text-subtle)]">
                      Clique em um dos veículos do Showroom acima para sincronizar a agenda do pátio.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] tabular-nums font-bold text-[var(--text-subtle)] uppercase">
                      <span>Dom</span>
                      <span>Seg</span>
                      <span>Ter</span>
                      <span>Qua</span>
                      <span>Qui</span>
                      <span>Sex</span>
                      <span>Sáb</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 text-xs">
                      {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-8.5" />
                      ))}

                      {Array.from({ length: diasNoMes }).map((_, i) => {
                        const diaNum = i + 1;
                        const diaStr = String(diaNum).padStart(2, '0');
                        const mesStr = String(calMes + 1).padStart(2, '0');
                        const dataKey = `${calAno}-${mesStr}-${diaStr}`;
                        const isSelected = datasSelecionadas.includes(dataKey);
                        const { ocupado, parcial, passado } = checkDataStatus(dataKey);

                        let bgClass = 'bg-[var(--surface)] hover:bg-[#0B1B2E] hover:text-white text-[var(--text)] border-[var(--border)]/90 shadow-2xs';
                        if (passado) {
                          bgClass = 'bg-[var(--surface-2)]/50 text-[var(--ink-muted)] border-transparent cursor-not-allowed';
                        } else if (ocupado) {
                          bgClass = 'bg-[var(--danger-soft)]/80 text-[var(--danger)] border-[var(--danger-border)]/70 cursor-not-allowed line-through';
                        } else if (isSelected) {
                          bgClass = 'bg-[#0B1B2E] text-[#DCEEFB] border-[var(--brand)] font-bold  scale-[1.03]';
                        } else if (parcial) {
                          bgClass = 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-border)] font-semibold';
                        }

                        return (
                          <button
                            key={dataKey}
                            type="button"
                            disabled={ocupado || passado}
                            onClick={() => handleToggleData(dataKey)}
                            className={`h-8.5 rounded-xl border flex items-center justify-center tabular-nums text-[11px] transition-all cursor-pointer ${bgClass}`}
                          >
                            {diaNum}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 text-[10px] font-medium text-[var(--text-muted)] border-t border-[var(--border)]/80">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[var(--surface)] border border-[var(--border-strong)]" /> Livre
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#0B1B2E] border border-[var(--brand)]" /> Selecionado
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#D98A00]" /> Parcial
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#C8372D]" /> Reservado
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Período e Datas Selecionadas com Acabamento Tátil */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Seletor Tátil de Turno *
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'manha', label: 'Turno Matutino', desc: '08:00 — 12:00', code: 'AM' },
                      { id: 'tarde', label: 'Turno Vespertino', desc: '13:00 — 18:00', code: 'PM' },
                      { id: 'dia_todo', label: 'Missão Integral', desc: '08:00 — 18:00', code: 'FULL' }
                    ].map(p => {
                      const active = periodo === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setPeriodo(p.id as PeriodoAgendamento);
                          }}
                          className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            active
                              ? 'border-[var(--brand)] bg-[#0B1B2E] text-white '
                              : 'border-[var(--border)]/90 bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-8 h-8 rounded-lg tabular-nums text-[10px] font-black flex items-center justify-center border ${
                              active
                                ? 'bg-[#0072BB]/20 text-[#DCEEFB] border-[var(--brand)]/40'
                                : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'
                            }`}>
                              {p.code}
                            </span>
                            <div>
                              <div className="text-xs font-bold">{p.label}</div>
                              <div className={`text-[10px] tabular-nums ${active ? 'text-[var(--ink-muted)]' : 'text-[var(--text-subtle)]'}`}>
                                {p.desc}
                              </div>
                            </div>
                          </div>
                          <Clock size={14} className={active ? 'text-[var(--brand)]' : 'text-[var(--text-subtle)]'} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chips de Datas */}
                <div className="p-3.5 bg-[var(--surface-2)]/90 rounded-[18px] border border-[var(--border)]/90 ">
                  <div className="text-[10px] tabular-nums uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center justify-between">
                    <span>Diárias Selecionadas</span>
                    <span className="tabular-nums font-black text-xs px-2 py-0.5 rounded-md bg-[#0B1B2E] text-[#DCEEFB]">
                      {datasSelecionadas.length}
                    </span>
                  </div>
                  {datasSelecionadas.length === 0 ? (
                    <div className="text-[11px] text-[var(--text-subtle)] py-1">
                      Toque nos dias livres do calendário ao lado.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {datasSelecionadas.map(d => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1 bg-[var(--surface)] text-[var(--text)] text-[11px] tabular-nums font-bold px-2.5 py-1 rounded-lg border border-[var(--border-strong)] shadow-2xs"
                        >
                          {d.split('-').reverse().join('/')}
                          <button
                            type="button"
                            onClick={() => handleToggleData(d)}
                            className="text-[var(--text-subtle)] hover:text-[var(--danger)] cursor-pointer ml-0.5"
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

            {/* COMPUTADOR DE BORDO & TELEMETRIA DE ROTA (BR-277 / BR-376) */}
            <div className="pt-5 border-t border-[var(--border-subtle)] space-y-4">
              <div className="bg-[#0B1B2E] text-white rounded-[18px] p-5 border border-[#22324C] relative overflow-hidden space-y-4">
                {/* Highlight especular superior */}

                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#22324C]/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Compass size={16} className="text-[var(--brand)] " />
                    <span className="text-[11px] tabular-nums uppercase tracking-[0.16em] text-white/90 font-bold">
                      COMPUTADOR DE BORDO · TELEMETRIA RODOVIÁRIA PR
                    </span>
                  </div>
                  <span className="text-[10px] tabular-nums text-[var(--verde)] bg-[#0B1B2E]/60 border border-[var(--verde)]/30 px-2.5 py-0.5 rounded-md">
                    DER-PR / MALHA BR-277 & BR-376
                  </span>
                </div>

                {/* Botões de Rotas Oficiais Estilo Cockpit */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {DESTINOS_PARANA.map(d => {
                    const isSel = cidadeDestino === d.cidade || (destino && destino.toLowerCase().includes(d.cidade.toLowerCase()));
                    const isBR277 = d.rota.includes('BR-277');
                    return (
                      <button
                        key={d.cidade}
                        type="button"
                        onClick={() => {
                          setCidadeDestino(d.cidade);
                          soundFX.playClick();
                          setDestino(`${d.cidade}/PR via ${d.rota} — Vistoria técnica institucional e atendimento regional SEJU`);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                          isSel
                            ? 'border-[var(--brand)] bg-[#0B1B2E]/60 text-white '
                            : 'border-[#22324C] bg-[#0B1B2E]/70 hover:bg-[#0B1B2E] hover:border-[#22324C] text-[var(--ink-muted)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[9px] tabular-nums font-bold px-1.5 py-0.2 rounded-xs ${
                            isBR277 ? 'bg-[#D98A00]/20 text-[#FFE2A8]' : 'bg-[#0072BB]/20 text-[#DCEEFB]'
                          }`}>
                            {d.rota.split(' ')[0]}
                          </span>
                          <Navigation size={10} className={isSel ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'} />
                        </div>
                        <div className="text-xs font-bold truncate">{d.cidade}</div>
                        <div className="text-[10px] tabular-nums text-[var(--text-subtle)] mt-0.5">
                          {d.km} km <span className="text-[var(--text-muted)]">·</span> ida
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Leitura de Telemetria da Rota Selecionada */}
                {destInfo ? (
                  <div className="p-4 bg-[#060911] border border-[#22324C]/90 rounded-xl space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#22324C]/70 pb-2.5">
                      <span className="font-bold text-white flex items-center gap-2">
                        <Route size={14} className="text-[var(--brand)]" />
                        Rota Calculada: Curitiba (Sede Hauer) ⇄ {destInfo.cidade}
                      </span>
                      <span className="text-[10px] tabular-nums font-bold text-[#DCEEFB] bg-[#0B1B2E]/70 px-2.5 py-0.5 rounded-md border border-[var(--brand)]/30">
                        EIXO {destInfo.rota.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="bg-[#0B1B2E]/70 p-3 rounded-xl border border-[#22324C]">
                        <div className="text-[9px] tabular-nums uppercase text-[var(--text-subtle)]">Distância Ida/Volta</div>
                        <div className="font-bold text-white tabular-nums text-base mt-0.5">
                          {destInfo.km * 2} <span className="text-xs text-[var(--brand)]">km</span>
                        </div>
                      </div>
                      <div className="bg-[#0B1B2E]/70 p-3 rounded-xl border border-[#22324C]">
                        <div className="text-[9px] tabular-nums uppercase text-[var(--text-subtle)]">Combustível Est.</div>
                        <div className="font-bold text-white tabular-nums text-base mt-0.5">
                          {((destInfo.km * 2) / 10.8).toFixed(1)} <span className="text-xs text-[var(--warning)]">L</span>
                        </div>
                      </div>
                      <div className="bg-[#0B1B2E]/70 p-3 rounded-xl border border-[#22324C]">
                        <div className="text-[9px] tabular-nums uppercase text-[var(--text-subtle)]">Custo Combustível</div>
                        <div className="font-bold text-[var(--verde)] tabular-nums text-base mt-0.5">
                          R$ {(((destInfo.km * 2) / 10.8) * 5.89).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      <div className="bg-[#0B1B2E]/70 p-3 rounded-xl border border-[#22324C]">
                        <div className="text-[9px] tabular-nums uppercase text-[var(--text-subtle)]">Tempo de Voo/Trecho</div>
                        <div className="font-bold text-white tabular-nums text-base mt-0.5">
                          ~{Math.floor(destInfo.km / 82)}h{Math.round(((destInfo.km / 82) % 1) * 60).toString().padStart(2, '0')}m
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] tabular-nums text-[var(--text-subtle)] flex items-center justify-between px-1">
                    <span>Selecione um destino rápido acima para simular consumo, pedágios e telemetria BR-277 / BR-376.</span>
                    <span className="text-[var(--brand)] hidden sm:inline">GPS PRONTO</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Destino e Finalidade Oficial da Missão *
                </label>
                <textarea
                  required
                  rows={3}
                  value={destino}
                  onChange={e => setDestino(e.target.value)}
                  placeholder="Descreva a cidade, órgão visitado e objetivo institucional da viagem..."
                  className="w-full text-xs px-3.5 py-2.5 bg-[var(--surface-2)]/80 border border-[var(--border)]/90 rounded-xl focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[#22324C] focus:bg-[var(--surface)] outline-hidden transition text-[var(--text)] font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Passageiros Adicionais (separados por vírgula)
                  </label>
                  {veicSel && (
                    <span className="text-[11px] tabular-nums text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                      Lotação: <strong className={capacidadeExcedida ? 'text-[var(--danger)]' : 'text-[var(--text)]'}>{totalOcupantes}</strong>/{veicSel.capacidade} assentos
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Users size={14} className="absolute left-3.5 top-2.5 text-[var(--text-subtle)]" />
                  <input
                    type="text"
                    value={passageiros}
                    onChange={e => setPassageiros(e.target.value)}
                    placeholder="Ex: Carlos Silveira, Ana Beatriz"
                    className={`w-full text-xs pl-9 pr-3.5 py-2.5 border rounded-xl outline-hidden transition ${
                      capacidadeExcedida
                        ? 'border-[var(--danger)] bg-[var(--danger-soft)]/60 focus:border-[var(--danger)] text-[var(--danger)]'
                        : 'bg-[var(--surface-2)]/80 border-[var(--border)]/90 focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[#22324C] focus:bg-[var(--surface)] text-[var(--text)]'
                    }`}
                  />
                </div>
              </div>

              {capacidadeExcedida && veicSel && (
                <div className="p-3.5 bg-[var(--danger-soft)] border border-[var(--danger-border)] rounded-xl text-xs text-[var(--danger)] flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-[var(--danger)] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Limite de assentos excedido</div>
                    <p className="text-[11px] text-[var(--danger)] mt-0.5">
                      A viatura {veicSel.modelo} comporta até {veicSel.capacidade} ocupantes, mas foram informados {totalOcupantes}. Escolha um utilitário maior no Showroom.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Lateral: STEP 3: CONFIRMAÇÃO & SUBMISSÃO COM BRILHO EXECUTIVO */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
          <div className="relative bg-[var(--surface)] rounded-[18px] p-6 border border-[var(--border)]/90 space-y-5 overflow-hidden">
            {/* Faixa superior executiva */}
            <div className="absolute inset-x-0 top-0 h-1 bg-[#0B1B2E]  " />

            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#0B1B2E] text-[var(--brand)] tabular-nums text-xs font-bold flex items-center justify-center shadow-2xs">
                  03
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)] tracking-tight">
                    Ordem de Tráfego Digital
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Conferência pré-despacho da Chefia
                  </p>
                </div>
              </div>
              <ShieldCheck size={18} className="text-[var(--verde)]" />
            </div>

            {/* Card da Viatura Selecionada no Resumo */}
            {veicSel ? (
              <div className="p-3.5 rounded-xl bg-[#0B1B2E] text-white border border-[#22324C] space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <PlacaMercosul placa={veicSel.placa} uf="PR" className="scale-90 origin-left" />
                  <span className="text-[10px] tabular-nums text-[var(--verde)] bg-[#0B1B2E]/80 border border-[var(--verde)]/30 px-2 py-0.5 rounded-md">
                    {veicSel.nivelCombustivel}% TANQUE
                  </span>
                </div>
                <div className="text-xs font-bold text-white tracking-tight">
                  {veicSel.modelo}
                </div>
                <div className="text-[10px] tabular-nums text-[var(--text-subtle)] flex items-center justify-between pt-1 border-t border-[#22324C]">
                  <span>HODÔMETRO: {veicSel.kmAtual.toLocaleString('pt-BR')} KM</span>
                  <span>{veicSel.capacidade} LUGARES</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-dashed border-[var(--border-strong)] text-center text-[11px] text-[var(--text-subtle)]">
                Selecione uma viatura no Showroom para visualizar o cartão de tráfego.
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-[var(--surface-2)]/90 rounded-xl border border-[var(--border)]/80 space-y-2.5">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[var(--text-subtle)] font-medium">Servidor</span>
                  <span className="font-bold text-[var(--text)] text-right truncate max-w-[180px]">
                    {nome || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--text-subtle)] font-medium">CPF</span>
                  <span className="tabular-nums font-semibold text-[var(--text)]">
                    {cpf || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2 pt-2 border-t border-[var(--border)]/70">
                  <span className="text-[var(--text-subtle)] font-medium">Condução</span>
                  <span className="text-[var(--text)] font-semibold">
                    {modalidade === 'com_motorista' ? 'Motorista Oficial' : 'Condução Própria'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--text-subtle)] font-medium">Diárias</span>
                  <span className="tabular-nums text-[var(--text)] font-bold">
                    {datasSelecionadas.length > 0 ? `${datasSelecionadas.length} dia(s)` : 'Nenhuma'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--text-subtle)] font-medium">Lotação</span>
                  <span className="text-[var(--text)] font-semibold">
                    {totalOcupantes} {totalOcupantes === 1 ? 'ocupante' : 'ocupantes'}
                  </span>
                </div>
              </div>

              {destino && (
                <div className="p-3.5 bg-[var(--surface-2)]/90 rounded-xl border border-[var(--border)]/80">
                  <span className="text-[10px] tabular-nums uppercase tracking-wider text-[var(--text-subtle)] font-semibold block mb-1">
                    Roteiro & Missão Oficial
                  </span>
                  <p className="text-[var(--text)] font-medium line-clamp-3 leading-relaxed">
                    {destino}
                  </p>
                </div>
              )}
            </div>

            {/* Botão de Submissão com Brilho Executivo */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                className="relative w-full overflow-hidden bg-[#0B1B2E] hover:bg-[#0B1B2E] text-white text-xs font-bold px-5 py-4 rounded-xl border border-[#22324C]/80 transition-all flex items-center justify-center gap-2.5 cursor-pointer group active:scale-[0.99]"
              >
                {/* Reflexo luminoso superior no botão */}
                <CheckCircle2 size={16} className="text-[var(--brand)] shrink-0" />
                <span className="tracking-wide">Protocolar & Enviar à Chefia</span>
                <ArrowRight size={14} className="text-[#DCEEFB] group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
              <p className="text-[10px] text-[var(--text-subtle)] text-center leading-relaxed">
                Emite protocolo auditável imediato e notifica a Chefia de Gabinete para deliberação em 1 clique.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Comprovante de Solicitação */}
      {comprovante && (
        <div className="fixed inset-0 bg-[#0B1B2E]/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-[18px] max-w-lg w-full p-6 border border-[var(--border)]/90 animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[#00A859]  " />
            <div className="text-center border-b border-[var(--border-subtle)] pb-5 mb-5">
              <div className="w-12 h-12 rounded-[18px] bg-[var(--verde-soft)] text-[var(--verde)] border border-[var(--verde-border)]/80 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <FileCheck2 size={24} />
              </div>
              <span className="text-[10px] tabular-nums uppercase tracking-wider text-[var(--verde)] bg-[var(--verde-soft)] px-3 py-0.5 rounded-full border border-[var(--verde-border)] font-bold">
                Ordem de Tráfego Protocolada
              </span>
              <h3 className="text-base font-bold text-[var(--text)] mt-2">
                Solicitação Registrada com Sucesso
              </h3>
              <div className="text-xs tabular-nums text-[var(--text)] font-bold mt-1 bg-[var(--surface-2)] inline-block px-3 py-1 rounded-lg border border-[var(--border)]">
                Protocolo: {comprovante.ticket}
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[var(--text-muted)] mb-6 bg-[var(--surface-2)]/90 p-4 rounded-xl border border-[var(--border)]/80">
              <div className="flex justify-between py-1 border-b border-[var(--border)]/60">
                <span className="text-[var(--text-subtle)]">Solicitante</span>
                <span className="font-bold text-[var(--text)]">{comprovante.nome}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/60">
                <span className="text-[var(--text-subtle)]">Viatura</span>
                <span className="font-bold text-[var(--text)]">{comprovante.veiculoNome} ({comprovante.veiculoPlaca})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]/60">
                <span className="text-[var(--text-subtle)]">Data(s)</span>
                <span className="tabular-nums font-semibold text-[var(--text)]">{comprovante.datas.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]/60">
                <span className="text-[var(--text-subtle)]">Destino</span>
                <span className="font-medium text-[var(--text)] text-right max-w-xs">{comprovante.destino}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[var(--text-subtle)]">Status</span>
                <span className="text-[11px] font-bold text-[var(--warning)] bg-[var(--warning-soft)] border border-[var(--warning-border)] px-2.5 py-0.5 rounded-full">
                  Aguardando Chancela
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Printer size={15} /> Imprimir Guia
              </button>
              <button
                type="button"
                onClick={() => setComprovante(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B1B2E] text-white hover:bg-[#0B1B2E] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
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

