#!/bin/bash
#
# Cloudflare DNS Setup Script for Google Workspace Email
# ======================================================
# 
# This script configures DNS records for designfitout.com domain to enable
# Google Workspace email with proper security (SPF, DMARC, MTA-STS).
#
# Prerequisites:
# - Cloudflare API Token with DNS:Edit permission OR API Key + Email
# - Zone ID for designfitout.com domain
#
# Usage:
#   export CF_API_TOKEN="your-token-here"
#   export ZONE_ID="your-zone-id-here"
#   ./scripts/cf_dns_setup.sh
#
# Alternative (legacy):
#   export CF_API_KEY="your-api-key"
#   export CF_EMAIL="your-email@example.com"
#   export ZONE_ID="your-zone-id"
#   ./scripts/cf_dns_setup.sh

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check for required tools
    for tool in curl jq; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is required but not installed. Please install it first."
            exit 1
        fi
    done
    
    # Check for authentication
    if [[ -z "$CF_API_TOKEN" && (-z "$CF_API_KEY" || -z "$CF_EMAIL") ]]; then
        log_error "Missing Cloudflare authentication!"
        echo ""
        echo "Please set one of the following:"
        echo "  Option 1 (Recommended): export CF_API_TOKEN=\"your-token-here\""
        echo "  Option 2 (Legacy):      export CF_API_KEY=\"your-key\" and CF_EMAIL=\"your-email\""
        echo ""
        echo "To create an API Token:"
        echo "  1. Go to https://dash.cloudflare.com/profile/api-tokens"
        echo "  2. Create Token -> Edit zone DNS template"
        echo "  3. Set Zone Resources to include designfitout.com"
        exit 1
    fi
    
    # Check for ZONE_ID
    if [[ -z "$ZONE_ID" ]]; then
        log_error "ZONE_ID environment variable is not set!"
        echo ""
        echo "To find your Zone ID:"
        echo "  1. Go to https://dash.cloudflare.com"
        echo "  2. Select designfitout.com domain"
        echo "  3. Copy Zone ID from the right sidebar (under API section)"
        echo ""
        echo "Then run: export ZONE_ID=\"your-zone-id-here\""
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Set up authentication headers
setup_auth() {
    if [[ -n "$CF_API_TOKEN" ]]; then
        AUTH_HEADER="Authorization: Bearer $CF_API_TOKEN"
        log_info "Using API Token authentication"
    else
        AUTH_HEADER="X-Auth-Key: $CF_API_KEY"
        EMAIL_HEADER="X-Auth-Email: $CF_EMAIL"
        log_info "Using API Key authentication"
    fi
}

# Make Cloudflare API request
cf_api() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    local url="https://api.cloudflare.com/client/v4/zones/${ZONE_ID}${endpoint}"
    
    if [[ -n "$CF_API_TOKEN" ]]; then
        if [[ -n "$data" ]]; then
            curl -s -X "$method" "$url" \
                -H "$AUTH_HEADER" \
                -H "Content-Type: application/json" \
                -d "$data"
        else
            curl -s -X "$method" "$url" \
                -H "$AUTH_HEADER"
        fi
    else
        if [[ -n "$data" ]]; then
            curl -s -X "$method" "$url" \
                -H "$AUTH_HEADER" \
                -H "$EMAIL_HEADER" \
                -H "Content-Type: application/json" \
                -d "$data"
        else
            curl -s -X "$method" "$url" \
                -H "$AUTH_HEADER" \
                -H "$EMAIL_HEADER"
        fi
    fi
}

# Check if a DNS record exists
get_dns_record() {
    local record_type="$1"
    local record_name="$2"
    
    local response=$(cf_api "GET" "/dns_records?type=${record_type}&name=${record_name}")
    echo "$response" | jq -r '.result[0].id // empty'
}

# Create or update DNS record
upsert_dns_record() {
    local record_type="$1"
    local record_name="$2"
    local record_content="$3"
    local record_ttl="${4:-3600}"
    local record_proxied="${5:-false}"
    local record_priority="${6:-}"
    
    log_info "Processing ${record_type} record: ${record_name}"
    
    # Build JSON data
    local json_data=$(jq -n \
        --arg type "$record_type" \
        --arg name "$record_name" \
        --arg content "$record_content" \
        --argjson ttl "$record_ttl" \
        --argjson proxied "$record_proxied" \
        '{type: $type, name: $name, content: $content, ttl: $ttl, proxied: $proxied}')
    
    # Add priority for MX records
    if [[ "$record_type" == "MX" && -n "$record_priority" ]]; then
        json_data=$(echo "$json_data" | jq --argjson priority "$record_priority" '. + {priority: $priority}')
    fi
    
    # Check if record exists
    local existing_id=$(get_dns_record "$record_type" "$record_name")
    
    if [[ -n "$existing_id" ]]; then
        log_info "Record exists (ID: ${existing_id}), updating..."
        local response=$(cf_api "PUT" "/dns_records/${existing_id}" "$json_data")
        
        if echo "$response" | jq -e '.success' > /dev/null; then
            log_success "Updated ${record_type} record: ${record_name}"
        else
            log_error "Failed to update ${record_type} record: ${record_name}"
            echo "$response" | jq '.errors'
            return 1
        fi
    else
        log_info "Record does not exist, creating..."
        local response=$(cf_api "POST" "/dns_records" "$json_data")
        
        if echo "$response" | jq -e '.success' > /dev/null; then
            log_success "Created ${record_type} record: ${record_name}"
        else
            log_error "Failed to create ${record_type} record: ${record_name}"
            echo "$response" | jq '.errors'
            return 1
        fi
    fi
}

# Display summary of changes
show_summary() {
    cat << 'EOF'

=============================================================================
DNS Records Summary for Google Workspace Email
=============================================================================

MX Records (Mail Exchange):
  - aspmx.l.google.com (Priority: 1)
  - alt1.aspmx.l.google.com (Priority: 5)
  - alt2.aspmx.l.google.com (Priority: 5)
  - alt3.aspmx.l.google.com (Priority: 10)
  - alt4.aspmx.l.google.com (Priority: 10)

TXT Records:
  - SPF: v=spf1 include:_spf.google.com ~all
  - DMARC: v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com
  - MTA-STS: v=STSv1; id=2025-11-09

All records configured with:
  - TTL: 3600 seconds (1 hour)
  - Proxied: false (DNS-only for email records)

=============================================================================
EOF
}

# Main execution
main() {
    echo ""
    log_info "Cloudflare DNS Setup for Google Workspace Email"
    echo "=================================================="
    echo ""
    
    # Check prerequisites
    check_prerequisites
    setup_auth
    
    # Show what will be done
    show_summary
    
    # Confirm before proceeding
    echo ""
    read -p "$(echo -e ${YELLOW}Do you want to proceed with DNS changes? [y/N]:${NC} )" -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Operation cancelled by user"
        exit 0
    fi
    
    echo ""
    log_info "Starting DNS record creation/update..."
    echo ""
    
    # Create/Update MX records
    log_info "Configuring MX records..."
    upsert_dns_record "MX" "designfitout.com" "aspmx.l.google.com" 3600 false 1
    upsert_dns_record "MX" "designfitout.com" "alt1.aspmx.l.google.com" 3600 false 5
    upsert_dns_record "MX" "designfitout.com" "alt2.aspmx.l.google.com" 3600 false 5
    upsert_dns_record "MX" "designfitout.com" "alt3.aspmx.l.google.com" 3600 false 10
    upsert_dns_record "MX" "designfitout.com" "alt4.aspmx.l.google.com" 3600 false 10
    echo ""
    
    # Create/Update SPF record
    log_info "Configuring SPF record..."
    upsert_dns_record "TXT" "designfitout.com" "v=spf1 include:_spf.google.com ~all" 3600 false
    echo ""
    
    # Create/Update DMARC record
    log_info "Configuring DMARC record..."
    upsert_dns_record "TXT" "_dmarc.designfitout.com" "v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com" 3600 false
    echo ""
    
    # Create/Update MTA-STS record
    log_info "Configuring MTA-STS TXT record..."
    upsert_dns_record "TXT" "_mta-sts.designfitout.com" "v=STSv1; id=2025-11-09" 3600 false
    echo ""
    
    log_success "DNS setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Wait 5-10 minutes for DNS propagation"
    echo "  2. Run: ./scripts/verify_email_setup.sh"
    echo "  3. Complete Google Workspace domain verification"
    echo "  4. Enable DKIM in Google Admin Console (see docs/GoogleWorkspaceSetup.md)"
    echo "  5. Deploy MTA-STS policy endpoint (functions/.well-known/mta-sts.txt.ts)"
    echo ""
}

# Run main function
main
