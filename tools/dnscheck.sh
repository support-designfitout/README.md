#!/usr/bin/env bash
# tools/dnscheck.sh
set -euo pipefail

DOMAINS=("$@"); [[ ${#DOMAINS[@]} -gt 0 ]] || DOMAINS=(designfitout.com fitoutlab.app)

GREEN='\033[32m'; YELLOW='\033[33m'; RED='\033[31m'; CYAN='\033[36m'; NC='\033[0m'
ok(){ echo -e "${GREEN}✅ $*${NC}"; }
warn(){ echo -e "${YELLOW}⚠️  $*${NC}"; }
err(){ echo -e "${RED}❌ $*${NC}"; }
info(){ echo -e "${CYAN}$*${NC}"; }

overall_rc=0

check_domain () {
  local d="$1"
  echo
  info "=== DNS Email Health: ${d} ==="

  # MX
  local mx; mx=$(dig +short MX "$d" | sort -n | tr -s ' ')
  if [ -z "$mx" ]; then err "No MX records found"; overall_rc=1; else ok "MX present"; echo "$mx" | sed 's/^/   • /'; fi

  # SPF
  local spf; spf=$(dig +short TXT "$d" | tr -d '"' | grep -i 'v=spf1' || true)
  if [ -z "$spf" ]; then err "SPF record not found"; overall_rc=1; else
    ok "SPF present"; echo "   • $spf"
    [[ "$spf" =~ _spf.google.com ]] || warn "SPF missing Google (_spf.google.com)"
    [[ "$spf" =~ spf.improvmx.com ]] || warn "SPF missing ImprovMX (spf.improvmx.com)"
  fi

  # DMARC
  local dmarc; dmarc=$(dig +short TXT "_dmarc.${d}" | tr -d '"' || true)
  if [ -z "$dmarc" ]; then err "DMARC record not found"; overall_rc=1; else
    ok "DMARC present"; echo "   • $dmarc"
    if   echo "$dmarc" | grep -qi 'p=reject'; then ok "DMARC policy p=reject"
    elif echo "$dmarc" | grep -qi 'p=quarantine'; then ok "DMARC policy p=quarantine"
    elif echo "$dmarc" | grep -qi 'p=none'; then warn "DMARC policy is p=none (monitoring)"
    else warn "DMARC policy not detected (p=...)"; fi
    echo "$dmarc" | grep -qi 'rua=mailto:dmarc@designfitout.com' || warn "DMARC rua not set to dmarc@designfitout.com"
    echo "$dmarc" | grep -qi 'ruf=mailto:dmarc@designfitout.com' || warn "DMARC ruf not set to dmarc@designfitout.com"
  fi
}

for d in "${DOMAINS[@]}"; do check_domain "$d"; done
echo
if [ $overall_rc -eq 0 ]; then ok "All checks completed without critical failures."; else err "One or more critical checks failed."; fi
exit $overall_rc
