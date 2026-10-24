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
// POST { acao: "senha_provisoria", email }
//   → gera uma senha provisória (logins de setor não recebem e-mail) e obriga
//     a troca no próximo acesso. A senha volta só para o admin que pediu.
// Desativar / trocar papel / trocar setor: direto na tabela perfis (RLS).
// =====================================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Endereço do Painel publicado (para onde o link do convite leva). Pode ser trocado pelo secret SITE_URL.
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://salohurmann.github.io/PainelSju/";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 12 caracteres sem ambíguos (0/O, 1/l/I); sempre com maiúscula, minúscula e número.
function gerarSenhaProvisoria(): string {
  const mai = "ABCDEFGHJKLMNPQRSTUVWXYZ", min = "abcdefghijkmnpqrstuvwxyz", num = "23456789";
  const todos = mai + min + num;
  const r = new Uint32Array(12);
  crypto.getRandomValues(r);
  const c = Array.from(r, (v, i) => (i === 0 ? mai : i === 1 ? min : i === 2 ? num : todos)[v % (i === 0 ? mai.length : i === 1 ? min.length : i === 2 ? num.length : todos.length)]);
  const m = new Uint32Array(12);
  crypto.getRandomValues(m);
  for (let i = c.length - 1; i > 0; i--) { const j = m[i] % (i + 1); [c[i], c[j]] = [c[j], c[i]]; }
  return c.join("");
}

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

    case "senha_provisoria": {
      const { data: perfil } = await admin.from("perfis").select("id").eq("email", email).maybeSingle();
      if (!perfil) return json({ erro: "Conta não encontrada." }, 404, origem);
      const senha = gerarSenhaProvisoria();
      const { error } = await admin.auth.admin.updateUserById(perfil.id, { password: senha });
      if (error) return json({ erro: "Não foi possível gerar a senha provisória." }, 500, origem);
      // Depois da troca (o gatilho libera a conta), volta a exigir senha nova.
      await admin.from("perfis").update({ trocar_senha: true }).eq("id", perfil.id);
      return json({ ok: true, senha }, 200, origem);
    }

    default:
      return json({ erro: "Ação desconhecida." }, 400, origem);
  }
});
