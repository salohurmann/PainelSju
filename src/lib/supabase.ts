import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase do Painel SJU.
 *
 * A chave "anon" é pública por definição: ela só identifica o projeto.
 * Quem protege os dados são as regras RLS do banco (supabase/migrations).
 * Segredos de verdade (service role, Brevo) ficam apenas no servidor.
 *
 * Sem VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY o painel roda no modo
 * demonstração local (dados fictícios no navegador, sem login).
 */
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const supabaseConfigurado = Boolean(url && anonKey);

/**
 * Tipo do link que trouxe a pessoa até aqui (convite ou recuperação de senha).
 * Precisa ser lido ANTES de criar o cliente, que limpa o fragmento da URL.
 */
export const tipoLinkDeAcesso: 'invite' | 'recovery' | null = (() => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const tipo = params.get('type');
  return tipo === 'invite' || tipo === 'recovery' ? tipo : null;
})();

let cliente: SupabaseClient | null = null;
let iniciando: Promise<SupabaseClient> | null = null;

/**
 * Baixa a biblioteca do Supabase e cria o cliente. Só acontece com o banco
 * configurado: no modo demonstração esse pedaço nem é baixado.
 * A sessão (SessaoProvider) chama isto antes de qualquer consulta.
 */
export function iniciarSupabase(): Promise<SupabaseClient> {
  if (!supabaseConfigurado) {
    return Promise.reject(new Error('Supabase não configurado (defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).'));
  }
  iniciando ??= import('@supabase/supabase-js').then(({ createClient }) => {
    cliente = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'painel-sju-auth',
      },
    });
    return cliente;
  }).catch(erro => {
    iniciando = null; // deixa tentar de novo (ex.: a rede voltou)
    throw erro;
  });
  return iniciando;
}

/** Cliente já iniciado (as telas só existem depois de iniciarSupabase). */
export function supabase(): SupabaseClient {
  if (!supabaseConfigurado) {
    throw new Error('Supabase não configurado (defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).');
  }
  if (!cliente) throw new Error('Conexão com o banco ainda não iniciada.');
  return cliente;
}
