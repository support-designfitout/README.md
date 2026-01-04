#!/usr/bin/env bash
#
# Cloudflare DNS Setup Script for Google Workspace Email
# =======================================================
# 
# This script configures DNS records for designfitout.com to enable
# Google Workspace email with proper security (SPF, DMARC, MTA-STS).
#
# PREREQUISITES:
# --------------
# 1. Cloudflare API Token with DNS Edit permissions
#    - Create at: https://dash.cloudflare.com/profile/api-tokens
#    - Template: "Edit zone DNS"
#    - Permissions: Zone > DNS > Edit
#
# 2. Zone ID for designfitout.com
#    - Find at: Cloudflare Dashboard > Your Domain > Overview (right sidebar)
#    - Or use: curl -X GET "https://api.cloudflare.com/client/v4/zones" \
#              -H "Authorization: Bearer YOUR_TOKEN" | jq -r '.result[] | select(.name=="designfitout.com") | .id'
#
# USAGE:
# ------
# Export environment variables:
#   export CF_API_TOKEN="your_cloudflare_api_token_here"
#   export ZONE_ID="your_zone_id_here"
#
# Run the script:
#   chmod +x scripts/cf_dns_setup.sh
#   ./scripts/cf_dns_setup.sh
#
# Or use legacy API key (not recommended):
#   export CF_API_KEY="your_global_api_key"
#   export CF_EMAIL="your_cloudflare_email"
#   export ZONE_ID="your_zone_id_here"
#

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}ℹ ${NC}$*"; }
log_success() { echo -e "${GREEN}✅${NC} $*"; }
log_warning() { echo -e "${YELLOW}⚠️ ${NC} $*"; }
log_error() { echo -e "${RED}❌${NC} $*" >&2; }

# Domain configuration
readonly DOMAIN="designfitout.com"
readonly MTA_STS_DOMAIN="mta-sts.${DOMAIN}"

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."
  
  # Check for required tools
  for cmd in curl jq; do
    if ! command -v "$cmd" &> /dev/null; then
      log_error "Required tool '$cmd' is not installed."
      log_error "Install with: sudo apt-get install $cmd (Debian/Ubuntu) or brew install $cmd (macOS)"
      exit 1
    fi
  done
  
  # Check for authentication
  if [[ -z "${CF_API_TOKEN:-}" ]]; then
    if [[ -z "${CF_API_KEY:-}" || -z "${CF_EMAIL:-}" ]]; then
      log_error "Authentication required!"
      echo
      echo "Set one of the following:"
      echo "  Option 1 (Recommended): export CF_API_TOKEN='your_token'"
      echo "  Option 2 (Legacy):      export CF_API_KEY='your_key' CF_EMAIL='your_email'"
      echo
      echo "Get API Token: https://dash.cloudflare.com/profile/api-tokens"
      exit 1
    fi
    AUTH_HEADER="X-Auth-Email: ${CF_EMAIL}"
    AUTH_KEY_HEADER="X-Auth-Key: ${CF_API_KEY}"
  else
    AUTH_HEADER="Authorization: Bearer ${CF_API_TOKEN}"
    AUTH_KEY_HEADER=""
  fi
  
  # Check for ZONE_ID
  if [[ -z "${ZONE_ID:-}" ]]; then
    log_error "ZONE_ID environment variable is required!"
    echo
    echo "Find your Zone ID at: Cloudflare Dashboard > ${DOMAIN} > Overview"
    echo "Or run: curl -X GET 'https://api.cloudflare.com/client/v4/zones' \\"
    echo "        -H 'Authorization: Bearer YOUR_TOKEN' | jq -r '.result[] | select(.name==\"${DOMAIN}\") | .id'"
    exit 1
  fi
  
  log_success "All prerequisites satisfied"
}

# Make Cloudflare API request
cf_api() {
  local method="$1"
  local endpoint="$2"
  local data="${3:-}"
  
  local curl_opts=(
    -X "$method"
    -H "Content-Type: application/json"
    -H "$AUTH_HEADER"
    -s
  )
  
  if [[ -n "$AUTH_KEY_HEADER" ]]; then
    curl_opts+=(-H "$AUTH_KEY_HEADER")
  fi
  
  if [[ -n "$data" ]]; then
    curl_opts+=(--data "$data")
  fi
  
  curl "${curl_opts[@]}" "https://api.cloudflare.com/client/v4${endpoint}"
}

# Get existing DNS record ID
get_record_id() {
  local record_type="$1"
  local record_name="$2"
  
  local response
  response=$(cf_api GET "/zones/${ZONE_ID}/dns_records?type=${record_type}&name=${record_name}")
  
  echo "$response" | jq -r '.result[0].id // empty'
}

# Create or update DNS record
upsert_dns_record() {
  local record_type="$1"
  local record_name="$2"
  local record_content="$3"
  local record_priority="${4:-}"
  local record_proxied="${5:-false}"
  local record_ttl="${6:-3600}"
  
  local existing_id
  existing_id=$(get_record_id "$record_type" "$record_name")
  
  local data
  data=$(jq -n \
    --arg type "$record_type" \
    --arg name "$record_name" \
    --arg content "$record_content" \
    --argjson ttl "$record_ttl" \
    --argjson proxied "$record_proxied" \
    '{type: $type, name: $name, content: $content, ttl: $ttl, proxied: $proxied}')
  
  # Add priority for MX records
  if [[ "$record_type" == "MX" ]]; then
    data=$(echo "$data" | jq --argjson priority "$record_priority" '. + {priority: $priority}')
  fi
  
  local response
  if [[ -n "$existing_id" ]]; then
    log_info "Updating existing ${record_type} record: ${record_name}"
    response=$(cf_api PATCH "/zones/${ZONE_ID}/dns_records/${existing_id}" "$data")
  else
    log_info "Creating new ${record_type} record: ${record_name}"
    response=$(cf_api POST "/zones/${ZONE_ID}/dns_records" "$data")
  fi
  
  if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    log_success "${record_type} record ${record_name} configured"
  else
    log_error "Failed to configure ${record_type} record ${record_name}"
    echo "$response" | jq '.errors' >&2
    return 1
  fi
}

# Display summary of changes to be made
show_summary() {
  echo
  echo "════════════════════════════════════════════════════════════════"
  echo "  DNS Records to be configured for ${DOMAIN}"
  echo "════════════════════════════════════════════════════════════════"
  echo
  echo "MX Records (Google Workspace):"
  echo "  • aspmx.l.google.com           (priority 1)"
  echo "  • alt1.aspmx.l.google.com      (priority 5)"
  echo "  • alt2.aspmx.l.google.com      (priority 5)"
  echo "  • alt3.aspmx.l.google.com      (priority 10)"
  echo "  • alt4.aspmx.l.google.com      (priority 10)"
  echo
  echo "TXT Records:"
  echo "  • SPF:     v=spf1 include:_spf.google.com ~all"
  echo "  • DMARC:   v=DMARC1; p=none; rua=mailto:dmarc@${DOMAIN}"
  echo "  • MTA-STS: v=STSv1; id=2025-11-09"
  echo
  echo "Note: DKIM records will be added separately after generation in Google Workspace"
  echo "════════════════════════════════════════════════════════════════"
  echo
}

# Main execution
main() {
  echo
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  Cloudflare DNS Setup for Google Workspace Email            ║"
  echo "║  Domain: ${DOMAIN}                              ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo
  
  check_prerequisites
  show_summary
  
  # Confirmation prompt
  read -p "Continue with DNS record configuration? (yes/no): " -r
  echo
  if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log_warning "Operation cancelled by user"
    exit 0
  fi
  
  log_info "Starting DNS record configuration..."
  echo
  
  # Configure MX records for Google Workspace
  log_info "Configuring MX records..."
  upsert_dns_record "MX" "$DOMAIN" "aspmx.l.google.com" 1 false 3600
  upsert_dns_record "MX" "$DOMAIN" "alt1.aspmx.l.google.com" 5 false 3600
  upsert_dns_record "MX" "$DOMAIN" "alt2.aspmx.l.google.com" 5 false 3600
  upsert_dns_record "MX" "$DOMAIN" "alt3.aspmx.l.google.com" 10 false 3600
  upsert_dns_record "MX" "$DOMAIN" "alt4.aspmx.l.google.com" 10 false 3600
  echo
  
  # Configure SPF record
  log_info "Configuring SPF record..."
  upsert_dns_record "TXT" "$DOMAIN" "v=spf1 include:_spf.google.com ~all" "" false 3600
  echo
  
  # Configure DMARC record
  log_info "Configuring DMARC record..."
  upsert_dns_record "TXT" "_dmarc.${DOMAIN}" "v=DMARC1; p=none; rua=mailto:dmarc@${DOMAIN}; ruf=mailto:dmarc@${DOMAIN}; fo=1" "" false 3600
  echo
  
  # Configure MTA-STS DNS record
  log_info "Configuring MTA-STS TXT record..."
  upsert_dns_record "TXT" "_mta-sts.${DOMAIN}" "v=STSv1; id=2025-11-09" "" false 3600
  echo
  
  # Summary
  echo
  echo "════════════════════════════════════════════════════════════════"
  log_success "DNS configuration completed successfully!"
  echo "════════════════════════════════════════════════════════════════"
  echo
  echo "Next steps:"
  echo "  1. Wait 5-10 minutes for DNS propagation"
  echo "  2. Verify DNS records: ./scripts/verify_email_setup.sh"
  echo "  3. Complete Google Workspace domain verification"
  echo "  4. Generate DKIM key in Google Admin Console"
  echo "  5. Add DKIM TXT record to Cloudflare DNS"
  echo "  6. Monitor DMARC reports before changing p=none to p=quarantine"
  echo
  echo "Documentation: docs/GoogleWorkspaceSetup.md"
  echo
}

main "$@"
