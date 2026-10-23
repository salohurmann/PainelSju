// =====================================================================
// Edge Function: admin-usuarios
// Criação de contas e redefinição de acesso. Precisa da service role, por
// isso roda no servidor. Só atende quem tem a permissão usuarios:gerenciar
// (verificada no banco com o token de quem chamou).
//
// POST { acao: "criar", email, nome, setor_sigla?, papel_id?, cargo?, telefone? }
//   → cria a conta e envia convite por e-mail para a pessoa definir a senha.
// POST { acao: "reenviar_convite", email }
// POST { acao: "redefinir_senha", email }
//   → envia link de redefinição de senha.
// Desativar / trocar papel / trocar setor: direto na tabela perfis (RLS).
// =====================================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") ?? "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Entrada = {
  acao?: string;
  email?: string;
  nome?: string;
  setor_sigla?: string;
  papel_id?: string;
  cargo?: string;
  telefone?: string;
};

Deno.serve(async (req) => {
  const origem = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origem) });
  if (req.method !== "POST") return json({ erro: "Método não permitido." }, 405, origem);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ erro: "Sessão ausente." }, 401, origem);

  // Cliente com o token de quem chamou: as regras do banco valem para ele.
  const comoUsuario = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: pode, error: erroPerm } = await comoUsuario.rpc("tem_permissao", {
    p_permissao: "usuarios:gerenciar",
  });
  if (erroPerm) return json({ erro: "Sessão inválida." }, 401, origem);
  if (!pode) return json({ erro: "Sem permissão para gerir usuários." }, 403, origem);

  let entrada: Entrada;
  try {
    entrada = await req.json();
  } catch {
    return json({ erro: "Corpo da requisição inválido." }, 400, origem);
  }

  const email = (entrada.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ erro: "Informe um e-mail válido." }, 400, origem);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  // O Supabase anexa o token ao endereço; o front detecta o tipo do link
  // (convite ou recuperação) e abre a tela de definir senha.
  const redirectTo = SITE_URL || undefined;

  switch (entrada.acao) {
    case "criar": {
      const nome = (entrada.nome ?? "").trim();
      if (nome.length < 3) return json({ erro: "Informe o nome completo." }, 400, origem);

      if (entrada.papel_id) {
        const { data: papel } = await admin.from("papeis").select("id").eq("id", entrada.papel_id).maybeSingle();
        if (!papel) return json({ erro: "Papel inexistente." }, 400, origem);
      }
      if (entrada.setor_sigla) {
        const { data: setor } = await admin
          .from("setores").select("id").eq("sigla", entrada.setor_sigla.toUpperCase()).maybeSingle();
        if (!setor) return json({ erro: "Setor inexistente." }, 400, origem);
      }

      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: {
          nome,
          setor_sigla: entrada.setor_sigla ?? null,
          papel_id: entrada.papel_id ?? "servidor",
          cargo: entrada.cargo ?? "",
          telefone: entrada.telefone ?? null,
        },
      });
      if (error) {
        const jaExiste = /already|registered|exists/i.test(error.message);
        return json({ erro: jaExiste ? "Já existe uma conta com este e-mail." : "Não foi possível criar a conta." },
          jaExiste ? 409 : 500, origem);
      }
      return json({ ok: true, id: data.user?.id }, 201, origem);
    }

    case "reenviar_convite": {
      const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
      if (error) return json({ erro: "Não foi possível reenviar o convite." }, 500, origem);
      return json({ ok: true }, 200, origem);
    }

    case "redefinir_senha": {
      const { error } = await admin.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) return json({ erro: "Não foi possível enviar o link de redefinição." }, 500, origem);
      return json({ ok: true }, 200, origem);
    }

    default:
      return json({ erro: "Ação desconhecida." }, 400, origem);
  }
});
