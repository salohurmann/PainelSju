import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Lock, Mail } from 'lucide-react';
import { BrasaoParana } from '../components/common/BrasaoParana';
import { Pinheiral } from '../components/marca/Araucaria';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import * as sessaoApi from '../data/supabase/sessao';
import { useSessao } from './contexto';

/** Moldura institucional comum às telas de acesso. */
const Moldura: React.FC<{ titulo: string; subtitulo?: string; children: React.ReactNode }> = ({ titulo, subtitulo, children }) => (
  <div className="min-h-screen grid lg:grid-cols-[minmax(320px,440px)_1fr] bg-[var(--bg)]">
    <aside className="relative overflow-hidden hidden lg:flex flex-col justify-between bg-[#00385E] text-white px-10 py-12">
      <div className="flex items-center gap-3">
        <BrasaoParana size="md" />
        <div className="leading-tight">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Governo do Estado do Paraná</p>
          <p className="text-sm font-semibold">Secretaria da Justiça e Cidadania</p>
        </div>
      </div>
      <div className="relative z-10 -mt-24">
        <p className="font-display text-[44px] font-bold leading-[1.02]">
          Painel de <span className="text-[#3CC27F]">/</span><br />Gestão Integrada
        </p>
        <p className="mt-3 text-sm text-white/75 max-w-xs leading-relaxed">
          Frotas, chamados, salas, diárias e fundo rotativo em um só lugar, com cada decisão registrada.
        </p>
      </div>
      <Pinheiral className="absolute left-8 right-8 bottom-[88px] h-[32%]" />
      <p className="relative text-[11px] text-white/70">Acesso restrito a servidores autorizados.</p>
    </aside>

    <main className="flex items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-sm">
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <BrasaoParana size="sm" />
          <p className="text-xs font-semibold text-[var(--text)]">SEJU · Painel de Gestão Integrada</p>
        </div>
        <h1 className="font-display text-[30px] font-bold text-[var(--text)]">{titulo}</h1>
        {subtitulo && <p className="mt-1.5 text-sm text-[var(--text-muted)] leading-relaxed">{subtitulo}</p>}
        <div className="mt-7">{children}</div>
      </div>
    </main>
  </div>
);

const Alerta: React.FC<{ tipo: 'erro' | 'sucesso'; children: React.ReactNode }> = ({ tipo, children }) => (
  <div
    role={tipo === 'erro' ? 'alert' : 'status'}
    className={`flex items-start gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 text-xs leading-relaxed ${
      tipo === 'erro'
        ? 'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]'
        : 'border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]'
    }`}
  >
    {tipo === 'erro' ? <AlertCircle size={14} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={14} className="mt-0.5 shrink-0" />}
    <span>{children}</span>
  </div>
);

export const TelaLogin: React.FC = () => {
  const { entrar } = useSessao();
  const [modo, setModo] = useState<'entrar' | 'recuperar'>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const aoEntrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email, senha);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
      setEnviando(false);
    }
  };

  const aoRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await sessaoApi.solicitarRedefinicaoSenha(email, window.location.origin + window.location.pathname);
      setAviso('Se o e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.');
    } catch {
      setAviso('Se o e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.');
    } finally {
      setEnviando(false);
    }
  };

  if (modo === 'recuperar') {
    return (
      <Moldura titulo="Recuperar acesso" subtitulo="Informe seu e-mail institucional para receber o link de redefinição.">
        <form onSubmit={aoRecuperar} className="space-y-4" noValidate>
          <Input label="E-mail institucional" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail size={14} />} />
          {aviso && <Alerta tipo="sucesso">{aviso}</Alerta>}
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={enviando} disabled={!email}>
            Enviar link
          </Button>
          <Button type="button" variant="ghost" size="md" className="w-full" icon={<ArrowLeft size={14} />}
            onClick={() => { setModo('entrar'); setAviso(null); }}>
            Voltar para o login
          </Button>
        </form>
      </Moldura>
    );
  }

  return (
    <Moldura titulo="Entrar" subtitulo="Use o e-mail e a senha da sua conta no painel.">
      <form onSubmit={aoEntrar} className="space-y-4" noValidate>
        <Input label="E-mail institucional" type="email" autoComplete="username" required value={email}
          onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail size={14} />} />
        <Input label="Senha" type="password" autoComplete="current-password" required value={senha}
          onChange={(e) => setSenha(e.target.value)} leftIcon={<Lock size={14} />} />
        {erro && <Alerta tipo="erro">{erro}</Alerta>}
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={enviando} disabled={!email || !senha}>
          Entrar
        </Button>
        <button type="button" onClick={() => { setModo('recuperar'); setErro(null); }}
          className="w-full text-center text-xs text-[var(--brand)] hover:underline underline-offset-2 cursor-pointer py-1">
          Esqueci minha senha
        </button>
      </form>
      <p className="mt-8 text-[11px] text-[var(--text-muted)] leading-relaxed">
        Não tem conta? Solicite à administração do painel. Contas são criadas apenas por convite.
      </p>
    </Moldura>
  );
};

export const TelaDefinirSenha: React.FC<{ motivo: 'invite' | 'recovery' }> = ({ motivo }) => {
  const { senhaDefinida } = useSessao();
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const aoSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const problema = sessaoApi.validarSenha(senha) ?? (senha !== confirmacao ? 'As senhas não conferem.' : null);
    if (problema) { setErro(problema); return; }
    setErro(null);
    setEnviando(true);
    try {
      await sessaoApi.definirSenha(senha);
      await senhaDefinida();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar a senha.');
      setEnviando(false);
    }
  };

  return (
    <Moldura
      titulo={motivo === 'invite' ? 'Boas-vindas ao painel' : 'Criar nova senha'}
      subtitulo={motivo === 'invite' ? 'Para concluir seu cadastro, crie uma senha de acesso.' : 'Escolha uma nova senha para a sua conta.'}
    >
      <form onSubmit={aoSalvar} className="space-y-4" noValidate>
        <Input label="Nova senha" type="password" autoComplete="new-password" required value={senha}
          onChange={(e) => setSenha(e.target.value)} hint="Mínimo de 10 caracteres, com maiúsculas, minúsculas e números." />
        <Input label="Confirme a senha" type="password" autoComplete="new-password" required value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)} />
        {erro && <Alerta tipo="erro">{erro}</Alerta>}
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={enviando} disabled={!senha || !confirmacao}>
          Salvar senha e entrar
        </Button>
      </form>
    </Moldura>
  );
};

export const TelaCarregando: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]" role="status" aria-live="polite">
    <div className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
      <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
      Carregando o painel…
    </div>
  </div>
);

export const TelaAviso: React.FC<{ titulo: string; mensagem: string; acao?: { rotulo: string; aoClicar: () => void } }> = ({ titulo, mensagem, acao }) => (
  <Moldura titulo={titulo} subtitulo={mensagem}>
    {acao && (
      <Button variant="secondary" size="lg" className="w-full" onClick={acao.aoClicar}>
        {acao.rotulo}
      </Button>
    )}
  </Moldura>
);
