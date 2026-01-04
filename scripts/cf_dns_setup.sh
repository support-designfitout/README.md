#!/usr/bin/env bash

#############################################################################
# Cloudflare DNS Setup Script for designfitout.com
#
# This script configures DNS records for Google Workspace email including:
# - MX records for Gmail
# - SPF record for email authentication
# - DMARC record for email policy
# - MTA-STS record for secure email transport
#
# Environment Variables Required:
#   - CF_API_TOKEN (preferred) - Cloudflare API token with DNS edit permissions
#   OR
#   - CF_API_KEY + CF_API_EMAIL - Legacy API authentication
#   AND
#   - ZONE_ID - Cloudflare zone identifier for designfitout.com
#
# Usage:
#   export CF_API_TOKEN="your-token-here"
#   export ZONE_ID="your-zone-id-here"
#   ./scripts/cf_dns_setup.sh
#
# Safety Features:
#   - Interactive confirmation before making any changes
#   - Idempotent: checks existing records before creating/updating
#   - Detailed logging of all operations
#
#############################################################################

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Cloudflare API endpoint
readonly CF_API_BASE="https://api.cloudflare.com/client/v4"

# Domain configuration
readonly DOMAIN="designfitout.com"

#############################################################################
# Helper Functions
#############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

#############################################################################
# Validate Environment
#############################################################################

validate_environment() {
    log_info "Validating environment variables..."
    
    # Check for ZONE_ID
    if [[ -z "${ZONE_ID:-}" ]]; then
        log_error "ZONE_ID environment variable is required"
        echo ""
        echo "Please set the ZONE_ID:"
        echo "  export ZONE_ID=\"your-cloudflare-zone-id\""
        echo ""
        echo "You can find your Zone ID in the Cloudflare dashboard:"
        echo "  1. Log in to https://dash.cloudflare.com/"
        echo "  2. Select your domain (${DOMAIN})"
        echo "  3. Zone ID is shown in the right sidebar"
        exit 1
    fi
    
    # Check for authentication - prefer API token
    if [[ -n "${CF_API_TOKEN:-}" ]]; then
        AUTH_HEADER="Authorization: Bearer ${CF_API_TOKEN}"
        log_success "Using CF_API_TOKEN for authentication"
    elif [[ -n "${CF_API_KEY:-}" ]] && [[ -n "${CF_API_EMAIL:-}" ]]; then
        AUTH_HEADER="X-Auth-Key: ${CF_API_KEY}"
        AUTH_EMAIL_HEADER="X-Auth-Email: ${CF_API_EMAIL}"
        log_success "Using CF_API_KEY + CF_API_EMAIL for authentication"
    else
        log_error "Authentication credentials not found"
        echo ""
        echo "Please set one of the following:"
        echo ""
        echo "Option 1 (Recommended) - API Token:"
        echo "  export CF_API_TOKEN=\"your-api-token\""
        echo ""
        echo "Option 2 - Legacy API Key:"
        echo "  export CF_API_KEY=\"your-global-api-key\""
        echo "  export CF_API_EMAIL=\"your-cloudflare-email\""
        echo ""
        echo "To create an API Token:"
        echo "  1. Go to https://dash.cloudflare.com/profile/api-tokens"
        echo "  2. Click 'Create Token'"
        echo "  3. Use 'Edit zone DNS' template"
        echo "  4. Select your zone: ${DOMAIN}"
        exit 1
    fi
    
    log_success "Environment validation complete"
}

#############################################################################
# Cloudflare API Functions
#############################################################################

# Make API request to Cloudflare
cf_api_request() {
    local method="$1"
    local endpoint="$2"
    local data="${3:-}"
    
    local curl_cmd="curl -s -X ${method}"
    curl_cmd+=" -H \"${AUTH_HEADER}\""
    
    # Add email header if using legacy auth
    if [[ -n "${AUTH_EMAIL_HEADER:-}" ]]; then
        curl_cmd+=" -H \"${AUTH_EMAIL_HEADER}\""
    fi
    
    curl_cmd+=" -H \"Content-Type: application/json\""
    
    if [[ -n "${data}" ]]; then
        curl_cmd+=" -d '${data}'"
    fi
    
    curl_cmd+=" \"${CF_API_BASE}${endpoint}\""
    
    eval "${curl_cmd}"
}

# Get existing DNS record by name and type
get_dns_record() {
    local record_name="$1"
    local record_type="$2"
    
    local response
    response=$(cf_api_request "GET" "/zones/${ZONE_ID}/dns_records?name=${record_name}&type=${record_type}")
    
    echo "${response}"
}

# Create DNS record
create_dns_record() {
    local record_type="$1"
    local record_name="$2"
    local record_content="$3"
    local ttl="$4"
    local proxied="$5"
    local priority="${6:-}"
    
    local data="{\"type\":\"${record_type}\",\"name\":\"${record_name}\",\"content\":\"${record_content}\",\"ttl\":${ttl},\"proxied\":${proxied}"
    
    if [[ -n "${priority}" ]]; then
        data+=",\"priority\":${priority}"
    fi
    
    data+="}"
    
    log_info "Creating ${record_type} record: ${record_name} -> ${record_content}"
    
    local response
    response=$(cf_api_request "POST" "/zones/${ZONE_ID}/dns_records" "${data}")
    
    if echo "${response}" | grep -q '"success":true'; then
        log_success "Created ${record_type} record successfully"
        return 0
    else
        log_error "Failed to create ${record_type} record"
        echo "${response}" | grep -o '"message":"[^"]*"' || echo "${response}"
        return 1
    fi
}

# Update DNS record
update_dns_record() {
    local record_id="$1"
    local record_type="$2"
    local record_name="$3"
    local record_content="$4"
    local ttl="$5"
    local proxied="$6"
    local priority="${7:-}"
    
    local data="{\"type\":\"${record_type}\",\"name\":\"${record_name}\",\"content\":\"${record_content}\",\"ttl\":${ttl},\"proxied\":${proxied}"
    
    if [[ -n "${priority}" ]]; then
        data+=",\"priority\":${priority}"
    fi
    
    data+="}"
    
    log_info "Updating ${record_type} record: ${record_name} -> ${record_content}"
    
    local response
    response=$(cf_api_request "PUT" "/zones/${ZONE_ID}/dns_records/${record_id}" "${data}")
    
    if echo "${response}" | grep -q '"success":true'; then
        log_success "Updated ${record_type} record successfully"
        return 0
    else
        log_error "Failed to update ${record_type} record"
        echo "${response}" | grep -o '"message":"[^"]*"' || echo "${response}"
        return 1
    fi
}

# Ensure DNS record exists with correct values (idempotent)
ensure_dns_record() {
    local record_type="$1"
    local record_name="$2"
    local record_content="$3"
    local ttl="$4"
    local proxied="$5"
    local priority="${6:-}"
    
    log_info "Checking ${record_type} record: ${record_name}"
    
    local response
    response=$(get_dns_record "${record_name}" "${record_type}")
    
    # Parse response to check if record exists
    local record_count
    record_count=$(echo "${response}" | grep -o '"result":\[' | wc -l)
    
    if [[ ${record_count} -eq 0 ]]; then
        log_warning "Record does not exist, will create"
        create_dns_record "${record_type}" "${record_name}" "${record_content}" "${ttl}" "${proxied}" "${priority}"
        return
    fi
    
    # Extract existing record details
    local existing_id
    existing_id=$(echo "${response}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    local existing_content
    existing_content=$(echo "${response}" | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    local existing_ttl
    existing_ttl=$(echo "${response}" | grep -o '"ttl":[0-9]*' | head -1 | cut -d':' -f2)
    
    local existing_proxied
    existing_proxied=$(echo "${response}" | grep -o '"proxied":[a-z]*' | head -1 | cut -d':' -f2)
    
    local existing_priority=""
    if [[ -n "${priority}" ]]; then
        existing_priority=$(echo "${response}" | grep -o '"priority":[0-9]*' | head -1 | cut -d':' -f2)
    fi
    
    # Check if update is needed
    local needs_update=false
    
    if [[ "${existing_content}" != "${record_content}" ]]; then
        log_info "Content differs: '${existing_content}' vs '${record_content}'"
        needs_update=true
    fi
    
    if [[ "${existing_ttl}" != "${ttl}" ]]; then
        log_info "TTL differs: ${existing_ttl} vs ${ttl}"
        needs_update=true
    fi
    
    if [[ "${existing_proxied}" != "${proxied}" ]]; then
        log_info "Proxied differs: ${existing_proxied} vs ${proxied}"
        needs_update=true
    fi
    
    if [[ -n "${priority}" ]] && [[ "${existing_priority}" != "${priority}" ]]; then
        log_info "Priority differs: ${existing_priority} vs ${priority}"
        needs_update=true
    fi
    
    if [[ "${needs_update}" == "true" ]]; then
        log_warning "Record exists but needs update"
        update_dns_record "${existing_id}" "${record_type}" "${record_name}" "${record_content}" "${ttl}" "${proxied}" "${priority}"
    else
        log_success "Record already exists with correct values"
    fi
}

#############################################################################
# DNS Records Configuration
#############################################################################

plan_dns_changes() {
    cat <<EOF

${BLUE}╔════════════════════════════════════════════════════════════════╗
║          DNS Configuration Plan for ${DOMAIN}          ║
╚════════════════════════════════════════════════════════════════╝${NC}

The following DNS records will be created or updated:

${YELLOW}MX Records (Email Routing):${NC}
  Priority 1:  aspmx.l.google.com
  Priority 5:  alt1.aspmx.l.google.com
  Priority 5:  alt2.aspmx.l.google.com
  Priority 10: alt3.aspmx.l.google.com
  Priority 10: alt4.aspmx.l.google.com

${YELLOW}TXT Records (Email Authentication):${NC}
  SPF:     v=spf1 include:_spf.google.com ~all
  DMARC:   v=DMARC1; p=none; rua=mailto:dmarc@${DOMAIN}; pct=100; adkim=s; aspf=s
  MTA-STS: v=STSv1; id=2025-11-09

${YELLOW}Configuration Details:${NC}
  - TTL: 3600 seconds (1 hour)
  - MX records: NOT proxied (DNS only)
  - TXT records: NOT proxied (DNS only)
  - All operations are idempotent (safe to run multiple times)

${YELLOW}Notes:${NC}
  - These records enable Google Workspace email for ${DOMAIN}
  - SPF authorizes Google to send email on your behalf
  - DMARC policy set to 'none' (monitoring mode) - adjust after testing
  - MTA-STS requires corresponding policy served at https://mta-sts.${DOMAIN}/.well-known/mta-sts.txt
  - After setup, you'll need to add DKIM records from Google Workspace Admin

EOF
}

confirm_execution() {
    echo ""
    read -p "Do you want to proceed with these DNS changes? (yes/no): " -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_warning "Operation cancelled by user"
        exit 0
    fi
    
    log_success "User confirmed, proceeding with DNS configuration..."
}

configure_dns_records() {
    log_info "Starting DNS record configuration..."
    echo ""
    
    # MX Records
    log_info "Configuring MX records..."
    ensure_dns_record "MX" "${DOMAIN}" "aspmx.l.google.com" 3600 false 1
    ensure_dns_record "MX" "${DOMAIN}" "alt1.aspmx.l.google.com" 3600 false 5
    ensure_dns_record "MX" "${DOMAIN}" "alt2.aspmx.l.google.com" 3600 false 5
    ensure_dns_record "MX" "${DOMAIN}" "alt3.aspmx.l.google.com" 3600 false 10
    ensure_dns_record "MX" "${DOMAIN}" "alt4.aspmx.l.google.com" 3600 false 10
    echo ""
    
    # SPF Record
    log_info "Configuring SPF record..."
    ensure_dns_record "TXT" "${DOMAIN}" "v=spf1 include:_spf.google.com ~all" 3600 false
    echo ""
    
    # DMARC Record
    log_info "Configuring DMARC record..."
    ensure_dns_record "TXT" "_dmarc.${DOMAIN}" "v=DMARC1; p=none; rua=mailto:dmarc@${DOMAIN}; pct=100; adkim=s; aspf=s" 3600 false
    echo ""
    
    # MTA-STS Record
    log_info "Configuring MTA-STS record..."
    ensure_dns_record "TXT" "_mta-sts.${DOMAIN}" "v=STSv1; id=2025-11-09" 3600 false
    echo ""
    
    log_success "DNS record configuration complete!"
}

print_next_steps() {
    cat <<EOF

${GREEN}╔════════════════════════════════════════════════════════════════╗
║                   Configuration Complete!                      ║
╚════════════════════════════════════════════════════════════════╝${NC}

${YELLOW}Next Steps:${NC}

1. ${BLUE}Wait for DNS propagation${NC} (usually 5-30 minutes)
   Run: dig MX ${DOMAIN} +short

2. ${BLUE}Verify email setup${NC}
   Run: ./scripts/verify_email_setup.sh

3. ${BLUE}Configure DKIM in Google Workspace${NC}
   - Log in to Google Workspace Admin Console
   - Go to Apps > Google Workspace > Gmail > Authenticate email
   - Generate a new DKIM key (use 2048-bit)
   - Add the DKIM TXT record to Cloudflare DNS

4. ${BLUE}Test email delivery${NC}
   - Send a test email from your Gmail
   - Check SPF, DKIM, and DMARC headers

5. ${BLUE}Deploy MTA-STS policy${NC}
   - Ensure https://mta-sts.${DOMAIN}/.well-known/mta-sts.txt is accessible
   - Use Cloudflare Pages Function (already in repo)

6. ${BLUE}Monitor DMARC reports${NC}
   - Check dmarc@${DOMAIN} for aggregate reports
   - After confirming all legitimate email passes, update DMARC policy:
     - Phase 1: p=none (current - monitoring only)
     - Phase 2: p=quarantine (suspicious emails go to spam)
     - Phase 3: p=reject (block unauthorized emails)

${YELLOW}Verification Commands:${NC}
  dig MX ${DOMAIN} +short
  dig TXT ${DOMAIN} +short
  dig TXT _dmarc.${DOMAIN} +short
  dig TXT _mta-sts.${DOMAIN} +short

${YELLOW}Useful Resources:${NC}
  - MXToolbox: https://mxtoolbox.com/SuperTool.aspx?action=mx%3a${DOMAIN}
  - DMARC Analyzer: https://www.dmarcanalyzer.com/
  - Google Workspace Admin: https://admin.google.com

EOF
}

#############################################################################
# Main Execution
#############################################################################

main() {
    echo ""
    log_info "Cloudflare DNS Setup for ${DOMAIN}"
    echo ""
    
    # Validate environment
    validate_environment
    echo ""
    
    # Show plan and get confirmation
    plan_dns_changes
    confirm_execution
    
    # Configure DNS records
    configure_dns_records
    
    # Show next steps
    print_next_steps
}

# Run main function
main "$@"
