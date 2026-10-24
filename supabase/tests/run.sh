#!/usr/bin/env bash
# Recria um banco de teste, aplica stub + migrations + seed e roda os testes SQL.
# Uso: PGHOST=... PGPORT=... PGUSER=postgres bash supabase/tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/.."

DB="${TEST_DB:-painel_sju_test}"
# As regras do Painel usam o dia de São Paulo; os testes também (sem isso,
# entre 21h e 0h de Brasília o "hoje" do teste já seria amanhã em UTC).
export PGTZ=America/Sao_Paulo
PSQL=(psql -X -q -v ON_ERROR_STOP=1 --set=SHOW_CONTEXT=never)

"${PSQL[@]}" -d postgres -c "drop database if exists $DB with (force);" >/dev/null
"${PSQL[@]}" -d postgres -c "create database $DB;" >/dev/null

# No GitHub Actions, cada erro vira uma anotação visível no resumo do job.
aplicar() {
  local arq="$1" err
  if ! err=$("${PSQL[@]}" -d "$DB" -f "$arq" 2>&1 >/dev/null); then
    [ -n "${GITHUB_ACTIONS:-}" ] && echo "::error file=supabase/$arq::$(echo "$err" | grep -m3 -E 'ERROR|FALHOU' | tr '\n' ' ')"
    echo "$err" >&2
    return 1
  fi
  [ -n "$err" ] && echo "$err" >&2
  return 0
}

aplicar tests/00_stub_supabase.sql
for f in migrations/*.sql; do
  echo "→ migration $(basename "$f")"
  aplicar "$f"
done
echo "→ seed.sql"
aplicar seed.sql

status=0
for t in tests/[1-9]*.sql; do
  echo "→ teste $(basename "$t")"
  if ! aplicar "$t"; then status=1; fi
done
exit $status
