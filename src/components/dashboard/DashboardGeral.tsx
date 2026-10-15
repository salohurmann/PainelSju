import React from 'react';
import { Agendamento, Veiculo, Usuario } from '../../types';
import { ActiveTab } from '../common/Sidebar';
import { 
  Car, 
  CheckSquare, 
  ClipboardCheck, 
  Building2, 
  Calendar, 
  Wrench, 
  Plane, 
  PhoneCall, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Megaphone,
  Bell
} from 'lucide-react';

interface DashboardGeralProps {
  veiculos: Veiculo[];
  agendamentos: Agendamento[];
  currentUser: Usuario;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardGeral: React.FC<DashboardGeralProps> = ({
  veiculos,
  agendamentos,
  currentUser,
  onNavigate
}) => {
  const frotaAtiva = veiculos.length;
  const emMissao = veiculos.filter(v => v.status === 'em_missao').length;
  const pendentesChefia = agendamentos.filter(a => a.status === 'pendente').length;
  const aprovadas = agendamentos.filter(a => a.status === 'aprovado' || a.status === 'realizado').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. Banner Institucional Principal */}
      <div className="bg-linear-to-r from-[#0072BB] via-[#00538a] to-[#00385e] rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold text-blue-100 uppercase tracking-wider mb-3">
            Governo do Estado do Paraná · SEJU
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            Portal Integrado de Serviços e Gestão Pública
          </h1>
          <p className="text-sm text-blue-100/90 mt-2 leading-relaxed">
            Plataforma corporativa centralizada para solicitação de frotas, reservas inteligentes, chamados de TI e diárias oficiais com auditoria criptográfica.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('nova-solicitacao')}
              className="bg-white text-[#0072BB] hover:bg-blue-50 text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Car size={16} /> Solicitar Veículo Oficial
            </button>
            <button
              onClick={() => onNavigate('aprovacoes')}
              className="bg-blue-400/20 hover:bg-blue-400/30 text-white border border-white/20 text-xs font-bold px-5 py-2.5 rounded-lg transition flex items-center gap-2 cursor-pointer"
            >
              <CheckSquare size={16} /> Fila de Aprovação ({pendentesChefia})
            </button>
          </div>
        </div>

        {/* Efeito gráfico decorativo */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <Building2 size={320} />
        </div>
      </div>

      {/* 2. Métricas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Frota Total</span>
            <Car size={18} className="text-[#0072BB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{frotaAtiva}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>● {emMissao} em missão oficial</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pendentes Chefia</span>
            <CheckSquare size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600">{pendentesChefia}</div>
          <div className="text-xs text-gray-500 mt-1">
            Aprovação ágil com 1 clique
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Viagens Autorizadas</span>
            <ClipboardCheck size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{aprovadas}</div>
          <div className="text-xs text-gray-500 mt-1">
            Com carimbo SHA-256
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Segurança</span>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">100%</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            Auditoria Ativa
          </div>
        </div>
      </div>

      {/* 3. Mural de Avisos Oficiais SEJU */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-[#0072BB]" />
            <h2 className="text-sm font-bold text-gray-900">Mural de Avisos & Comunicados da Pasta</h2>
          </div>
          <span className="text-[11px] bg-blue-50 text-[#0072BB] font-semibold px-2 py-0.5 rounded">
            Atualizado Hoje
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0072BB]">COMUNICADO GABINETE Nº 04/2026</span>
              <span className="text-[10px] text-gray-400">15/10/2026</span>
            </div>
            <h3 className="text-xs font-bold text-gray-800">
              Obrigatoriedade do Registro de 4 Fotos no Check-in/Check-out
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Conforme portaria interna, todos os servidores e motoristas devem obrigatoriamente registrar os 4 ângulos do veículo pelo celular no momento da retirada e devolução das chaves na central de transportes.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">CENTRAL DE NOTIFICAÇÕES BREVO</span>
              <span className="text-[10px] text-gray-400">Ativo</span>
            </div>
            <h3 className="text-xs font-bold text-gray-800">
              Disparo Automático de E-mails para Solicitantes e Chefia
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              O sistema dispara e-mails em tempo real para os gestores aprovarem os pedidos pendentes e avisa o servidor instantaneamente assim que sua missão for autorizada ou justificada.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Vitrine da Arquitetura Modular (Apresentação Interna para a Chefia) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-900">
            Arquitetura Modular Plug & Play: Expansão da Pasta
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Com a estrutura básica e segura pronta no Piloto de Veículos, os demais módulos podem ser plugados sem necessidade de contratação de softwares externos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigate('modulo-salas')}
            className="p-4 rounded-xl border border-gray-200 hover:border-[#0072BB] hover:shadow-xs transition cursor-pointer group bg-gray-50/30"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Calendar size={18} />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-900">Reserva de Salas</h3>
              <span className="text-[9px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Módulo 2</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">
              Auditório, salas de gabinete e kits de videoconferência sem choque de horários.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('modulo-chamados')}
            className="p-4 rounded-xl border border-gray-200 hover:border-[#0072BB] hover:shadow-xs transition cursor-pointer group bg-gray-50/30"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Wrench size={18} />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-900">Chamados & OS TI</h3>
              <span className="text-[9px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Módulo 3</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">
              Quadro Kanban (A Fazer, Andamento, Concluído) e tempo de resposta de suporte.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('modulo-diarias')}
            className="p-4 rounded-xl border border-gray-200 hover:border-[#0072BB] hover:shadow-xs transition cursor-pointer group bg-gray-50/30"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Plane size={18} />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-900">Diárias & Adiantamentos</h3>
              <span className="text-[9px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Módulo 4</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">
              Cálculo automatizado pela tabela oficial e geração de formulário PDF pronto para assinatura.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('modulo-ramais')}
            className="p-4 rounded-xl border border-gray-200 hover:border-[#0072BB] hover:shadow-xs transition cursor-pointer group bg-gray-50/30"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <PhoneCall size={18} />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-900">Ramais Internos</h3>
              <span className="text-[9px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Módulo 5</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">
              Guia telefônico e lista de coordenações atualizada em tempo real para todos os setores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
