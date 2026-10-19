import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  ShieldAlert, 
  Sparkles, 
  HelpCircle, 
  PhoneCall, 
  Lock, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Usuario } from '../../types';

interface AssistenteLgpdModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
}

interface MensagemChat {
  id: string;
  autor: 'user' | 'assistente';
  texto: string;
  hora: string;
}

export const AssistenteLgpdModal: React.FC<AssistenteLgpdModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const isNas = currentUser.setor.toUpperCase().includes('NAS');
  const isUtec = currentUser.setor.toUpperCase().includes('UTEC');

  const [inputTexto, setInputTexto] = useState('');
  const [mensagens, setMensagens] = useState<MensagemChat[]>([
    {
      id: 'm-1',
      autor: 'assistente',
      texto: `Olá, ${currentUser.nome.split(' ')[0]}! Sou o Assistente Virtual do Justiça 2.0. Já sei que você atua no setor **${currentUser.setor}**. Posso te orientar sobre sistemas, procedimentos da Secretaria, pastas de rede e ramais. Como posso ajudar?`,
      hora: 'Agora'
    }
  ]);

  if (!isOpen) return null;

  const handleEnviar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputTexto.trim()) return;

    const textoUsuario = inputTexto;
    setInputTexto('');

    const novaMensagemUsuario: MensagemChat = {
      id: String(Date.now()),
      autor: 'user',
      texto: textoUsuario,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMensagens((prev) => [...prev, novaMensagemUsuario]);

    // Resposta contextual baseada no setor e no catálogo offline (Slide 7)
    setTimeout(() => {
      let resposta = '';
      const t = textoUsuario.toLowerCase();

      if (t.includes('pasta') || t.includes('rede') || t.includes('drive')) {
        resposta = isNas
          ? 'Para acessar as pastas do Núcleo Administrativo, utilize o caminho de rede **S:\\NAS\\Processos_Gerais** pelo Explorador de Arquivos do Windows (Win+R). Os arquivos em nuvem ficam sincronizados no Google Drive compartilhado do setor.'
          : 'As pastas técnicas da UTEC estão localizadas no endereço de rede **S:\\UTEC\\Documentacao_Tecnica**. Os instaladores públicos podem ser obtidos em **S:\\Publico\\Softwares_Drivers**.';
      } else if (t.includes('frota') || t.includes('veiculo') || t.includes('viatura') || t.includes('viagem')) {
        resposta = 'Para requisição de veículos oficiais, utilize o módulo **Gestão de Frotas & Viaturas** no Portal. A solicitação passa por deliberação da Chefia de Gabinete e exige vistoria pericial fotográfica na saída e devolução.';
      } else if (t.includes('diaria') || t.includes('diárias') || t.includes('decreto')) {
        resposta = 'O cálculo de indenização de diárias segue a tabela oficial do **Decreto Estadual nº 1.428/PR**. Acesse o módulo **Diárias & Viagens** para traçar a rota com o mapa interativo do Paraná e gerar o Anexo I para empenho.';
      } else if (t.includes('cense') || t.includes('fundo') || t.includes('nota') || t.includes('nf')) {
        resposta = 'A prestação de contas do **Fundo Rotativo CENSE** abrange as 19 unidades socioeducativas do Paraná. O sistema conta com Scanner Inteligente de DANFE (chave de 44 dígitos) e separação legal entre as rubricas 33.90.30 e 33.90.39 conforme o TCE-PR.';
      } else if (t.includes('chamado') || t.includes('computador') || t.includes('internet') || t.includes('suporte')) {
        resposta = 'Problemas com informática, link de internet ou impressoras devem ser abertos no módulo **Chamados & Suporte TI**. O tempo médio de atendimento é de 42 minutos com SLA monitorado em tempo real.';
      } else if (t.includes('ramal') || t.includes('telefone') || t.includes('contato')) {
        resposta = 'Você pode consultar o guia completo com 142 ramais VoIP da Sede Hauer e regionais no módulo **Telefonia & Ramais**. Se preferir falar diretamente com o suporte da UTEC, o ramal direto é **2444**.';
      } else {
        resposta = `Consultei o catálogo e a base de conhecimento do setor **${currentUser.setor}**. Não encontrei um procedimento exato para este termo. Recomendo contatar o suporte interno da UTEC pelo ramal **2444** ou pelo e-mail **suporte.utec@seju.pr.gov.br** para que possamos catalogar esta dúvida.`;
      }

      const novaRespostaAssistente: MensagemChat = {
        id: String(Date.now() + 1),
        autor: 'assistente',
        texto: resposta,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMensagens((prev) => [...prev, novaRespostaAssistente]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl h-[620px] max-h-[92vh] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-2xl flex flex-col overflow-hidden text-[var(--text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo do Assistente com Alerta LGPD */}
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--brand-soft)] border border-[var(--brand-border)] text-[var(--brand)] flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight font-heading">
                  Assistente Virtual · Justiça 2.0
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Modo Seguro Offline
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Responde com base na Central de Ajuda oficial, ciente da lotação ({currentUser.setor}).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition cursor-pointer"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Banner Oficial de Cuidados com a LGPD (Slide 7) */}
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-snug text-[11px]">
            <strong>Cuidados com a LGPD:</strong> Recebe apenas seu nome, cargo e setor. 
            <span className="font-semibold text-amber-700 dark:text-amber-300"> Não envie CPF, senhas de sistemas ou processos sigilosos.</span>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[var(--surface)]">
          {mensagens.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.autor === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                m.autor === 'user'
                  ? 'bg-[var(--brand)] text-white'
                  : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--brand)]'
              }`}>
                {m.autor === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                m.autor === 'user'
                  ? 'bg-[var(--brand)] text-white font-medium rounded-tr-xs'
                  : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-tl-xs'
              }`}>
                <p className="whitespace-pre-line">{m.texto}</p>
                <span className={`block text-[9px] mt-1 text-right font-mono ${
                  m.autor === 'user' ? 'text-white/70' : 'text-[var(--text-muted)]'
                }`}>
                  {m.hora}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sugestões de Perguntas Rápidas */}
        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-2)]/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
          <span className="text-[10px] text-[var(--text-muted)] font-medium shrink-0">Sugestões:</span>
          <button
            type="button"
            onClick={() => setInputTexto('Como acessar a pasta de rede do meu setor?')}
            className="px-2.5 py-1 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] shrink-0 transition cursor-pointer"
          >
            Pastas de rede
          </button>
          <button
            type="button"
            onClick={() => setInputTexto('Como solicitar um veículo oficial na frota?')}
            className="px-2.5 py-1 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] shrink-0 transition cursor-pointer"
          >
            Solicitar veículo
          </button>
          <button
            type="button"
            onClick={() => setInputTexto('Como funciona a prestação do Fundo Rotativo CENSE?')}
            className="px-2.5 py-1 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] shrink-0 transition cursor-pointer"
          >
            Fundo Rotativo
          </button>
          <button
            type="button"
            onClick={() => setInputTexto('Qual é o ramal de suporte da UTEC?')}
            className="px-2.5 py-1 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] shrink-0 transition cursor-pointer"
          >
            Ramal UTEC
          </button>
        </div>

        {/* Input de Envio de Mensagem */}
        <form onSubmit={handleEnviar} className="p-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center gap-2">
          <input
            type="text"
            placeholder="Digite sua dúvida sobre sistemas ou rotinas da SEJU..."
            value={inputTexto}
            onChange={(e) => setInputTexto(e.target.value)}
            className="flex-1 h-10 px-3 text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--brand)]"
          />
          <button
            type="submit"
            disabled={!inputTexto.trim()}
            className="h-10 px-4 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
          >
            <span>Enviar</span>
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};
