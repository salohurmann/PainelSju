#!/usr/bin/env bash
# Recria um banco de teste, aplica stub + migrations + seed e roda os testes SQL.
# Uso: PGHOST=... PGPORT=... PGUSER=postgres bash supabase/tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/.."

DB="${TEST_DB:-painel_sju_test}"
PSQL=(psql -X -q -v ON_ERROR_STOP=1 --set=SHOW_CONTEXT=never)

"${PSQL[@]}" -d postgres -c "drop database if exists $DB with (force);" >/dev/null
"${PSQL[@]}" -d postgres -c "create database $DB;" >/dev/null

"${PSQL[@]}" -d "$DB" -f tests/00_stub_supabase.sql >/dev/null
for f in migrations/*.sql; do
  echo "→ migration $(basename "$f")"
  "${PSQL[@]}" -d "$DB" -f "$f" >/dev/null
done
echo "→ seed.sql"
"${PSQL[@]}" -d "$DB" -f seed.sql >/dev/null

status=0
for t in tests/[1-9]*.sql; do
  echo "→ teste $(basename "$t")"
  if ! "${PSQL[@]}" -d "$DB" -f "$t" >/dev/null; then status=1; fi
done
exit $status
