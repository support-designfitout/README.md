#!/usr/bin/env bash
set -euo pipefail

BASE="https://designfitout.com"
PATHS=(/health /api/mrketoz.json /api/registrar.json /api/planet.json)

THRESH_MS=800       # latency SLO per endpoint (ms)
RETRIES=2           # extra tries on failure/timeout
TIMEOUT=8           # seconds per request
UA="DF-Status-Check/1.0"

# Per-endpoint schema checks (jq expressions that must be true)
declare -A SCHEMA=(
  [/health]='has("ok") and has("kv") and has("now") and has("region")'
  [/api/mrketoz.json]='has("stage") and has("branch") and has("updated_at")'
  [/api/registrar.json]='has("domain") and has("dnssec") and has("nameservers")'
  [/api/planet.json]='has("note")'
)

ok=1

check_one () {
  local path="$1"
  local attempt=0 code=000 secs=0 ms=0 body
  body=$(mktemp)
  while (( attempt <= RETRIES )); do
    attempt=$((attempt+1))
    read -r code secs < <(curl -sS -m "$TIMEOUT" -A "$UA" -o "$body" \
      -w "%{http_code} %{time_total}" "$BASE$path") || code=000
    [[ "$code" == "200" ]] && break
    (( attempt <= RETRIES )) || break
    sleep 1
  done

  ms=$(awk -v s="$secs" 'BEGIN{printf "%.0f", s*1000}')
  printf "👉 %-22s code=%-3s time_ms=%-4s\n" "$path" "$code" "$ms"

  if jq . >/dev/null 2>&1 <"$body"; then
    jq . <"$body"
  else
    cat "$body"
  fi
  echo

  if [[ "$code" != "200" ]]; then
    echo "   ❌ non-200 for $path"; ok=0
  elif (( ms > THRESH_MS )); then
    echo "   ⚠️  slow (> ${THRESH_MS}ms) — investigate latency"
    # To fail on SLO breach as well, uncomment next line:
    # ok=0
  fi

  if jq . >/dev/null 2>&1 <"$body"; then
    if ! jq -e "${SCHEMA[$path]:-true}" <"$body" >/dev/null; then
      echo "   ❌ schema check failed for $path"; ok=0
    fi
  fi

  rm -f "$body"
}

for p in "${PATHS[@]}"; do check_one "$p"; done

[[ $ok -eq 1 ]] && echo "✅ All endpoints healthy" || { echo "❌ Checks failed"; exit 1; }
