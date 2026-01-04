#!/usr/bin/env bash
#
# Email Setup Verification Script
# ================================
#
# Verifies DNS records and email configuration for designfitout.com
# Tests MX, SPF, DMARC, DKIM, and MTA-STS setup
#
# USAGE:
# ------
#   chmod +x scripts/verify_email_setup.sh
#   ./scripts/verify_email_setup.sh
#
# OPTIONAL DEPENDENCIES:
# ----------------------
# - dig (dnsutils) - DNS lookups (required)
# - curl - HTTP requests (required)
# - openssl - TLS/SSL checks (required)
# - swaks - SMTP testing (optional, for connectivity tests)
#

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Domain configuration
readonly DOMAIN="designfitout.com"
readonly MTA_STS_DOMAIN="mta-sts.${DOMAIN}"
readonly MTA_STS_URL="https://${MTA_STS_DOMAIN}/.well-known/mta-sts.txt"

# Exit code tracking
EXIT_CODE=0

# Logging functions
log_info() { echo -e "${BLUE}ℹ ${NC}$*"; }
log_success() { echo -e "${GREEN}✅${NC} $*"; }
log_warning() { echo -e "${YELLOW}⚠️ ${NC} $*"; }
log_error() { echo -e "${RED}❌${NC} $*"; EXIT_CODE=1; }
log_section() { echo -e "\n${CYAN}═══ $* ═══${NC}\n"; }

# Check for required tools
check_dependencies() {
  log_info "Checking dependencies..."
  
  local missing_deps=()
  
  for cmd in dig curl openssl; do
    if ! command -v "$cmd" &> /dev/null; then
      missing_deps+=("$cmd")
    fi
  done
  
  if [[ ${#missing_deps[@]} -gt 0 ]]; then
    log_error "Missing required tools: ${missing_deps[*]}"
    echo
    echo "Install with:"
    echo "  Ubuntu/Debian: sudo apt-get install dnsutils curl openssl"
    echo "  macOS:         brew install bind curl openssl"
    exit 1
  fi
  
  # Check for optional tools
  if ! command -v swaks &> /dev/null; then
    log_warning "swaks not found (optional) - SMTP connectivity test will be skipped"
    echo "  Install: sudo apt-get install swaks (Ubuntu/Debian) or brew install swaks (macOS)"
  fi
  
  log_success "All required dependencies present"
  echo
}

# Verify MX records
verify_mx_records() {
  log_section "MX Records (Mail Servers)"
  
  local mx_records
  mx_records=$(dig +short MX "$DOMAIN" | sort -n)
  
  if [[ -z "$mx_records" ]]; then
    log_error "No MX records found for ${DOMAIN}"
    return
  fi
  
  log_success "MX records found:"
  echo "$mx_records" | while read -r priority server; do
    echo "  Priority ${priority}: ${server}"
  done
  
  # Check for Google Workspace MX servers
  local expected_mx=("aspmx.l.google.com" "alt1.aspmx.l.google.com" "alt2.aspmx.l.google.com" "alt3.aspmx.l.google.com" "alt4.aspmx.l.google.com")
  
  for mx in "${expected_mx[@]}"; do
    if echo "$mx_records" | grep -q "$mx"; then
      log_success "Found expected MX: ${mx}"
    else
      log_warning "Missing expected MX: ${mx}"
    fi
  done
  
  echo
}

# Verify SPF record
verify_spf_record() {
  log_section "SPF Record (Sender Policy Framework)"
  
  local spf_record
  spf_record=$(dig +short TXT "$DOMAIN" | tr -d '"' | grep -i '^v=spf1' || true)
  
  if [[ -z "$spf_record" ]]; then
    log_error "SPF record not found for ${DOMAIN}"
    echo "  Expected: v=spf1 include:_spf.google.com ~all"
    return
  fi
  
  log_success "SPF record found:"
  echo "  ${spf_record}"
  
  # Check SPF components
  if echo "$spf_record" | grep -q "include:_spf.google.com"; then
    log_success "SPF includes Google Workspace (_spf.google.com)"
  else
    log_warning "SPF does not include Google Workspace (_spf.google.com)"
  fi
  
  if echo "$spf_record" | grep -qE '(~all|-all)'; then
    log_success "SPF has fail policy (softfail ~all or fail -all)"
  else
    log_warning "SPF should end with ~all or -all"
  fi
  
  echo
}

# Verify DMARC record
verify_dmarc_record() {
  log_section "DMARC Record (Domain-based Message Authentication)"
  
  local dmarc_record
  dmarc_record=$(dig +short TXT "_dmarc.${DOMAIN}" | tr -d '"' || true)
  
  if [[ -z "$dmarc_record" ]]; then
    log_error "DMARC record not found for _dmarc.${DOMAIN}"
    echo "  Expected: v=DMARC1; p=none; rua=mailto:dmarc@${DOMAIN}"
    return
  fi
  
  log_success "DMARC record found:"
  echo "  ${dmarc_record}"
  
  # Check DMARC policy
  if echo "$dmarc_record" | grep -qi 'p=reject'; then
    log_success "DMARC policy: reject (strictest)"
  elif echo "$dmarc_record" | grep -qi 'p=quarantine'; then
    log_success "DMARC policy: quarantine (recommended)"
  elif echo "$dmarc_record" | grep -qi 'p=none'; then
    log_warning "DMARC policy: none (monitoring only - consider upgrading to quarantine)"
  else
    log_warning "DMARC policy not clearly specified"
  fi
  
  # Check for reporting
  if echo "$dmarc_record" | grep -qi 'rua=mailto:'; then
    log_success "DMARC aggregate reports configured (rua)"
  else
    log_warning "DMARC aggregate reports not configured (rua=mailto:...)"
  fi
  
  if echo "$dmarc_record" | grep -qi 'ruf=mailto:'; then
    log_success "DMARC forensic reports configured (ruf)"
  else
    log_info "DMARC forensic reports not configured (ruf) - optional"
  fi
  
  echo
}

# Verify DKIM record
verify_dkim_record() {
  log_section "DKIM Record (DomainKeys Identified Mail)"
  
  log_info "Checking common DKIM selectors for Google Workspace..."
  
  local dkim_found=false
  local selectors=("google" "google._domainkey" "default" "selector1" "selector2")
  
  for selector in "${selectors[@]}"; do
    local dkim_record
    dkim_record=$(dig +short TXT "${selector}._domainkey.${DOMAIN}" 2>/dev/null | tr -d '"' || true)
    
    if [[ -n "$dkim_record" ]] && echo "$dkim_record" | grep -qi 'v=DKIM1'; then
      log_success "DKIM record found for selector: ${selector}"
      echo "  ${dkim_record:0:100}..." # Show first 100 chars
      dkim_found=true
      break
    fi
  done
  
  if [[ "$dkim_found" == false ]]; then
    log_warning "DKIM record not found with common selectors"
    echo
    echo "  To add DKIM:"
    echo "  1. Go to Google Admin Console > Apps > Google Workspace > Gmail > Authenticate email"
    echo "  2. Generate new record (select 2048-bit key)"
    echo "  3. Add the TXT record to Cloudflare DNS"
    echo "  4. Wait for DNS propagation (5-10 minutes)"
    echo "  5. Click 'Start authentication' in Google Admin"
    echo
    echo "  Record format: <selector>._domainkey.${DOMAIN} TXT \"v=DKIM1; k=rsa; p=<public_key>\""
  fi
  
  echo
}

# Verify MTA-STS DNS record
verify_mta_sts_dns() {
  log_section "MTA-STS DNS Record"
  
  local mta_sts_record
  mta_sts_record=$(dig +short TXT "_mta-sts.${DOMAIN}" | tr -d '"' || true)
  
  if [[ -z "$mta_sts_record" ]]; then
    log_error "MTA-STS TXT record not found for _mta-sts.${DOMAIN}"
    echo "  Expected: v=STSv1; id=<timestamp>"
    return
  fi
  
  log_success "MTA-STS TXT record found:"
  echo "  ${mta_sts_record}"
  
  if echo "$mta_sts_record" | grep -qi 'v=STSv1'; then
    log_success "MTA-STS version correct (STSv1)"
  else
    log_warning "MTA-STS version not found or incorrect"
  fi
  
  if echo "$mta_sts_record" | grep -qi 'id='; then
    log_success "MTA-STS policy ID present"
  else
    log_warning "MTA-STS policy ID (id=) not found"
  fi
  
  echo
}

# Verify MTA-STS policy file
verify_mta_sts_policy() {
  log_section "MTA-STS Policy File"
  
  log_info "Checking MTA-STS policy at ${MTA_STS_URL}"
  
  # Check HTTP headers
  local headers
  if headers=$(curl -sI "$MTA_STS_URL" 2>&1); then
    if echo "$headers" | grep -qi "HTTP/[12]\.[01] 200"; then
      log_success "MTA-STS policy endpoint accessible (HTTP 200)"
      
      # Check content type
      if echo "$headers" | grep -qi "content-type:.*text/plain"; then
        log_success "Content-Type is text/plain"
      else
        log_warning "Content-Type should be text/plain"
      fi
    else
      log_error "MTA-STS policy endpoint returned non-200 status"
      echo "$headers" | grep "HTTP/"
    fi
  else
    log_error "Failed to connect to MTA-STS policy endpoint"
    echo "  Error: $headers"
  fi
  
  # Fetch and validate policy content
  log_info "Fetching MTA-STS policy content..."
  local policy
  if policy=$(curl -s "$MTA_STS_URL" 2>&1); then
    if [[ -n "$policy" ]]; then
      log_success "Policy content retrieved:"
      echo "$policy" | sed 's/^/  /'
      
      # Validate policy content
      if echo "$policy" | grep -q "version: STSv1"; then
        log_success "Policy version is STSv1"
      else
        log_error "Policy version is not STSv1"
      fi
      
      if echo "$policy" | grep -qi "mode: enforce\|mode: testing"; then
        local mode
        mode=$(echo "$policy" | grep -i "^mode:" | cut -d: -f2 | tr -d ' ')
        log_success "Policy mode: ${mode}"
      else
        log_error "Policy mode not set to enforce or testing"
      fi
      
      if echo "$policy" | grep -q "mx:.*google\.com"; then
        log_success "Policy includes Google MX servers"
      else
        log_warning "Policy should include Google MX servers"
      fi
      
      if echo "$policy" | grep -q "max_age:"; then
        local max_age
        max_age=$(echo "$policy" | grep "^max_age:" | cut -d: -f2 | tr -d ' ')
        log_success "Policy max_age: ${max_age} seconds"
      else
        log_error "Policy max_age not specified"
      fi
    else
      log_error "Policy content is empty"
    fi
  else
    log_error "Failed to fetch MTA-STS policy"
    echo "  Error: $policy"
  fi
  
  echo
}

# Verify TLS certificate for MTA-STS domain
verify_mta_sts_tls() {
  log_section "MTA-STS TLS Certificate"
  
  log_info "Checking TLS certificate for ${MTA_STS_DOMAIN}..."
  
  local cert_info
  if cert_info=$(echo | openssl s_client -connect "${MTA_STS_DOMAIN}:443" -servername "${MTA_STS_DOMAIN}" 2>&1 </dev/null); then
    if echo "$cert_info" | grep -q "Verify return code: 0 (ok)"; then
      log_success "TLS certificate is valid"
      
      # Extract certificate details
      local subject
      subject=$(echo "$cert_info" | openssl x509 -noout -subject 2>/dev/null | sed 's/subject=//' || echo "Unknown")
      echo "  Subject: ${subject}"
      
      local issuer
      issuer=$(echo "$cert_info" | openssl x509 -noout -issuer 2>/dev/null | sed 's/issuer=//' || echo "Unknown")
      echo "  Issuer: ${issuer}"
      
      local not_after
      not_after=$(echo "$cert_info" | openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d= -f2 || echo "Unknown")
      echo "  Expires: ${not_after}"
    else
      log_warning "TLS certificate validation failed"
      echo "$cert_info" | grep "Verify return code"
    fi
  else
    log_error "Failed to connect to ${MTA_STS_DOMAIN}:443"
    echo "  Ensure the domain resolves and HTTPS is configured"
  fi
  
  echo
}

# Test SMTP connectivity (optional - requires swaks)
test_smtp_connectivity() {
  if ! command -v swaks &> /dev/null; then
    return
  fi
  
  log_section "SMTP Connectivity Test (Optional)"
  
  log_info "Testing SMTP connection to primary MX server..."
  
  local primary_mx
  primary_mx=$(dig +short MX "$DOMAIN" | sort -n | head -1 | awk '{print $2}')
  
  if [[ -z "$primary_mx" ]]; then
    log_warning "No MX server found for connectivity test"
    return
  fi
  
  log_info "Testing connection to ${primary_mx}..."
  
  # Test TLS connectivity (don't send actual email)
  if timeout 10 swaks --to "test@${DOMAIN}" \
                       --from "verify@${DOMAIN}" \
                       --server "${primary_mx}" \
                       --quit-after BANNER \
                       --hide-all 2>&1 | grep -q "220"; then
    log_success "SMTP server ${primary_mx} is accepting connections"
  else
    log_warning "Could not verify SMTP connectivity to ${primary_mx}"
  fi
  
  echo
}

# Print recommendations
print_recommendations() {
  log_section "Recommendations"
  
  if [[ $EXIT_CODE -eq 0 ]]; then
    log_success "All critical email security checks passed!"
  else
    log_warning "Some checks failed - review errors above"
  fi
  
  echo
  echo "Additional steps:"
  echo "  • Test sending email from Google Workspace"
  echo "  • Test receiving email at your domain"
  echo "  • Use MXToolbox (https://mxtoolbox.com/SuperTool.aspx?action=mx:${DOMAIN})"
  echo "  • Monitor DMARC reports at dmarc@${DOMAIN}"
  echo "  • After monitoring, consider upgrading DMARC policy:"
  echo "    - Start with p=none (current)"
  echo "    - Move to p=quarantine (recommended)"
  echo "    - Finally to p=reject (strictest)"
  echo
  echo "Documentation: docs/GoogleWorkspaceSetup.md"
  echo
}

# Main execution
main() {
  echo
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  Email Setup Verification for ${DOMAIN}         ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo
  
  check_dependencies
  
  verify_mx_records
  verify_spf_record
  verify_dmarc_record
  verify_dkim_record
  verify_mta_sts_dns
  verify_mta_sts_policy
  verify_mta_sts_tls
  test_smtp_connectivity
  
  print_recommendations
  
  exit $EXIT_CODE
}

main "$@"
