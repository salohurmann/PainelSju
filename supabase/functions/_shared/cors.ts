// Cabeçalhos CORS. Defina ALLOWED_ORIGINS (separadas por vírgula) nos
// secrets da função, ex.: "https://salohurmann.github.io,http://localhost:5173".
const permitidas = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export function corsHeaders(origem: string | null): Record<string, string> {
  const liberada = origem && permitidas.includes(origem) ? origem : permitidas[0] ?? "";
  return {
    "Access-Control-Allow-Origin": liberada,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function json(body: unknown, status: number, origem: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origem), "Content-Type": "application/json; charset=utf-8" },
  });
}
