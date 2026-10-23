import { supabase } from '../../lib/supabase';
import { exigir, traduzirErro } from './erros';
import type { ContextoSessao } from './tipos';

/** Entrar com e-mail e senha. */
export async function entrar(email: string, senha: string): Promise<void> {
  const { error } = await supabase().auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
  if (error) throw traduzirErro(error);
}

export async function sair(): Promise<void> {
  const { error } = await supabase().auth.signOut();
  if (error) throw traduzirErro(error);
}

/** Envia o link de redefinição de senha. Sempre "dá certo" para não revelar quais e-mails existem. */
export async function solicitarRedefinicaoSenha(email: string, urlRetorno: string): Promise<void> {
  await supabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: urlRetorno });
}

/** Define a senha (após convite ou link de recuperação). */
export async function definirSenha(novaSenha: string): Promise<void> {
  const { error } = await supabase().auth.updateUser({ password: novaSenha });
  if (error) throw traduzirErro(error);
}

/** Perfil, permissões efetivas, módulos do menu e contador de notificações. */
export async function carregarContexto(): Promise<ContextoSessao | null> {
  return exigir(await supabase().rpc('contexto_sessao')) as ContextoSessao | null;
}

/** Registra na auditoria que um dado pessoal (ex.: CPF) foi exibido. */
export async function registrarAcessoDadoPessoal(contexto: string, titularId: string): Promise<void> {
  exigir(await supabase().rpc('registrar_acesso_dado_pessoal', { p_contexto: contexto, p_titular_id: titularId }));
}

/** Regra de senha igual à configurada no Supabase (supabase/config.toml). */
export function validarSenha(senha: string): string | null {
  if (senha.length < 10) return 'A senha precisa ter pelo menos 10 caracteres.';
  if (!/[a-z]/.test(senha) || !/[A-Z]/.test(senha) || !/\d/.test(senha)) {
    return 'Use letras maiúsculas, minúsculas e números.';
  }
  return null;
}
