// =====================================================================
// Edge Function: enviar-emails
// Lê a fila public.email_outbox e envia pelo Brevo. A chave do Brevo fica
// só nos secrets do Supabase (nunca no navegador).
// Disparo: agendamento (cron do Supabase) a cada 1–5 minutos, chamando
// POST com o cabeçalho "x-cron-secret: <CRON_SECRET>".
//
// Secrets necessários:
//   BREVO_API_KEY, EMAIL_REMETENTE, EMAIL_REMETENTE_NOME (opcional), CRON_SECRET
// =====================================================================
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";
const REMETENTE = Deno.env.get("EMAIL_REMETENTE") ?? "";
const REMETENTE_NOME = Deno.env.get("EMAIL_REMETENTE_NOME") ?? "Painel SJU";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

const LOTE = 25;
const MAX_TENTATIVAS = 5;

function segredoConfere(recebido: string): boolean {
  if (!CRON_SECRET || recebido.length !== CRON_SECRET.length) return false;
  let diff = 0;
  for (let i = 0; i < recebido.length; i++) diff |= recebido.charCodeAt(i) ^ CRON_SECRET.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Método não permitido.", { status: 405 });
  if (!segredoConfere(req.headers.get("x-cron-secret") ?? "")) {
    return new Response("Não autorizado.", { status: 401 });
  }
  if (!BREVO_API_KEY || !REMETENTE) {
    return Response.json({ erro: "BREVO_API_KEY e EMAIL_REMETENTE não configurados." }, { status: 503 });
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data: fila, error } = await db
    .from("email_outbox")
    .select("id, destinatario_email, assunto, corpo, tentativas")
    .neq("status", "enviado")
    .lt("tentativas", MAX_TENTATIVAS)
    .order("criado_em", { ascending: true })
    .limit(LOTE);
  if (error) return Response.json({ erro: error.message }, { status: 500 });

  let enviados = 0;
  let falhas = 0;
  for (const m of fila ?? []) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: { email: REMETENTE, name: REMETENTE_NOME },
          to: [{ email: m.destinatario_email }],
          subject: m.assunto,
          textContent: m.corpo,
        }),
      });
      if (!res.ok) throw new Error(`Brevo respondeu ${res.status}: ${(await res.text()).slice(0, 300)}`);
      await db.from("email_outbox")
        .update({ status: "enviado", enviado_em: new Date().toISOString(), tentativas: m.tentativas + 1, ultimo_erro: null })
        .eq("id", m.id);
      enviados++;
    } catch (e) {
      await db.from("email_outbox")
        .update({ status: "erro", tentativas: m.tentativas + 1, ultimo_erro: String(e).slice(0, 500) })
        .eq("id", m.id);
      falhas++;
    }
  }
  return Response.json({ processados: (fila ?? []).length, enviados, falhas });
});
