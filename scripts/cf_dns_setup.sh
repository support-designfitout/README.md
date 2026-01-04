#!/usr/bin/env bash

# Cloudflare DNS Setup Script for Google Workspace Email
# 
# This script configures DNS records for designfitout.com to enable Google Workspace email.
# It creates/updates MX, SPF, DMARC, and MTA-STS records using the Cloudflare API.
#
# Prerequisites:
# 1. Cloudflare API Token with DNS edit permissions:
#    - Go to https://dash.cloudflare.com/profile/api-tokens
#    - Create Token → Edit zone DNS template
#    - Select the zone for designfitout.com
#    - Export as: export CF_API_TOKEN="your-token-here"
#
# 2. Zone ID for designfitout.com:
#    - Go to https://dash.cloudflare.com
#    - Select your domain → Overview → API section (right sidebar)
#    - Copy the Zone ID
#    - Export as: export ZONE_ID="your-zone-id-here"
#
# Alternatively, you can use legacy authentication:
#    export CF_API_KEY="your-global-api-key"
#    export CF_API_EMAIL="your-cloudflare-email"
#
# Usage:
#   export CF_API_TOKEN="your-token"
#   export ZONE_ID="your-zone-id"
#   ./scripts/cf_dns_setup.sh

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check required environment variables
check_env_vars() {
    local missing_vars=()
    
    if [[ -z "${ZONE_ID:-}" ]]; then
        missing_vars+=("ZONE_ID")
    fi
    
    # Check for API token or legacy API key + email
    if [[ -z "${CF_API_TOKEN:-}" ]]; then
        if [[ -z "${CF_API_KEY:-}" ]] || [[ -z "${CF_API_EMAIL:-}" ]]; then
            missing_vars+=("CF_API_TOKEN (or CF_API_KEY and CF_API_EMAIL)")
        fi
    fi
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "To obtain these values:"
        echo ""
        echo "1. Cloudflare API Token (recommended):"
        echo "   - Visit: https://dash.cloudflare.com/profile/api-tokens"
        echo "   - Create Token → Edit zone DNS template"
        echo "   - Select zone: designfitout.com"
        echo "   - Copy token and run: export CF_API_TOKEN=\"your-token-here\""
        echo ""
        echo "2. Zone ID:"
        echo "   - Visit: https://dash.cloudflare.com"
        echo "   - Select domain → Overview → API section (right sidebar)"
        echo "   - Copy Zone ID and run: export ZONE_ID=\"your-zone-id-here\""
        echo ""
        echo "3. Alternative: Legacy API Key (not recommended):"
        echo "   - Visit: https://dash.cloudflare.com/profile/api-tokens"
        echo "   - View Global API Key"
        echo "   - Run: export CF_API_KEY=\"your-key\" && export CF_API_EMAIL=\"your-email\""
        echo ""
        exit 1
    fi
}

# Set up authentication headers
setup_auth_headers() {
    if [[ -n "${CF_API_TOKEN:-}" ]]; then
        AUTH_HEADER="Authorization: Bearer ${CF_API_TOKEN}"
        print_info "Using API Token authentication"
    else
        AUTH_HEADER="X-Auth-Key: ${CF_API_KEY}"
        EMAIL_HEADER="X-Auth-Email: ${CF_API_EMAIL}"
        print_info "Using legacy API Key authentication"
    fi
}

# Function to make Cloudflare API requests
cf_api_request() {
    local method="$1"
    local endpoint="$2"
    local data="${3:-}"
    
    local base_url="https://api.cloudflare.com/client/v4"
    local url="${base_url}${endpoint}"
    
    local curl_cmd="curl -s -X ${method} \"${url}\""
    curl_cmd="${curl_cmd} -H \"Content-Type: application/json\""
    curl_cmd="${curl_cmd} -H \"${AUTH_HEADER}\""
    
    if [[ -n "${EMAIL_HEADER:-}" ]]; then
        curl_cmd="${curl_cmd} -H \"${EMAIL_HEADER}\""
    fi
    
    if [[ -n "$data" ]]; then
        curl_cmd="${curl_cmd} -d '${data}'"
    fi
    
    eval "$curl_cmd"
}

# Function to get existing DNS records
get_existing_records() {
    local record_type="$1"
    local record_name="$2"
    
    local response
    response=$(cf_api_request "GET" "/zones/${ZONE_ID}/dns_records?type=${record_type}&name=${record_name}")
    
    echo "$response"
}

# Function to create DNS record
create_dns_record() {
    local record_type="$1"
    local record_name="$2"
    local record_content="$3"
    local ttl="${4:-3600}"
    local proxied="${5:-false}"
    local priority="${6:-}"
    
    local data="{\"type\":\"${record_type}\",\"name\":\"${record_name}\",\"content\":\"${record_content}\",\"ttl\":${ttl},\"proxied\":${proxied}"
    
    if [[ -n "$priority" ]]; then
        data="${data},\"priority\":${priority}"
    fi
    
    data="${data}}"
    
    local response
    response=$(cf_api_request "POST" "/zones/${ZONE_ID}/dns_records" "$data")
    
    echo "$response"
}

# Function to update DNS record
update_dns_record() {
    local record_id="$1"
    local record_type="$2"
    local record_name="$3"
    local record_content="$4"
    local ttl="${5:-3600}"
    local proxied="${6:-false}"
    local priority="${7:-}"
    
    local data="{\"type\":\"${record_type}\",\"name\":\"${record_name}\",\"content\":\"${record_content}\",\"ttl\":${ttl},\"proxied\":${proxied}"
    
    if [[ -n "$priority" ]]; then
        data="${data},\"priority\":${priority}"
    fi
    
    data="${data}}"
    
    local response
    response=$(cf_api_request "PUT" "/zones/${ZONE_ID}/dns_records/${record_id}" "$data")
    
    echo "$response"
}

# Function to check if record needs update
needs_update() {
    local existing_content="$1"
    local new_content="$2"
    local existing_priority="${3:-}"
    local new_priority="${4:-}"
    
    if [[ "$existing_content" != "$new_content" ]]; then
        return 0
    fi
    
    if [[ -n "$new_priority" ]] && [[ "$existing_priority" != "$new_priority" ]]; then
        return 0
    fi
    
    return 1
}

# Function to process a DNS record (create or update)
process_record() {
    local record_type="$1"
    local record_name="$2"
    local record_content="$3"
    local ttl="${4:-3600}"
    local proxied="${5:-false}"
    local priority="${6:-}"
    
    print_info "Processing ${record_type} record: ${record_name}"
    
    # Get existing records
    local existing_response
    existing_response=$(get_existing_records "$record_type" "$record_name")
    
    # Check if we got a valid response
    if ! echo "$existing_response" | grep -q '"success":true'; then
        print_error "Failed to query existing records: $(echo "$existing_response" | grep -o '"message":"[^"]*"' | head -1)"
        return 1
    fi
    
    local record_count
    record_count=$(echo "$existing_response" | grep -o '"result":\[' | wc -l)
    
    if [[ $(echo "$existing_response" | grep -o '"id":"[^"]*"' | wc -l) -eq 0 ]]; then
        # Record doesn't exist, create it
        print_info "  → Creating new record"
        local create_response
        create_response=$(create_dns_record "$record_type" "$record_name" "$record_content" "$ttl" "$proxied" "$priority")
        
        if echo "$create_response" | grep -q '"success":true'; then
            print_success "  Created ${record_type} record: ${record_name} → ${record_content}"
        else
            print_error "  Failed to create record: $(echo "$create_response" | grep -o '"message":"[^"]*"' | head -1)"
            return 1
        fi
    else
        # Record exists, check if update is needed
        local existing_id
        existing_id=$(echo "$existing_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        
        local existing_content
        existing_content=$(echo "$existing_response" | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4)
        
        local existing_priority=""
        if [[ -n "$priority" ]]; then
            existing_priority=$(echo "$existing_response" | grep -o '"priority":[0-9]*' | head -1 | cut -d':' -f2)
        fi
        
        if needs_update "$existing_content" "$record_content" "$existing_priority" "$priority"; then
            print_info "  → Updating existing record"
            local update_response
            update_response=$(update_dns_record "$existing_id" "$record_type" "$record_name" "$record_content" "$ttl" "$proxied" "$priority")
            
            if echo "$update_response" | grep -q '"success":true'; then
                print_success "  Updated ${record_type} record: ${record_name} → ${record_content}"
            else
                print_error "  Failed to update record: $(echo "$update_response" | grep -o '"message":"[^"]*"' | head -1)"
                return 1
            fi
        else
            print_success "  Record already up to date: ${record_name}"
        fi
    fi
}

# Main script
main() {
    echo ""
    echo "=========================================="
    echo "Cloudflare DNS Setup for Google Workspace"
    echo "Domain: designfitout.com"
    echo "=========================================="
    echo ""
    
    # Check environment variables
    check_env_vars
    
    # Setup authentication
    setup_auth_headers
    
    echo ""
    print_info "The following DNS records will be configured:"
    echo ""
    echo "  MX Records (for email routing):"
    echo "    - aspmx.l.google.com (priority 1)"
    echo "    - alt1.aspmx.l.google.com (priority 5)"
    echo "    - alt2.aspmx.l.google.com (priority 5)"
    echo "    - alt3.aspmx.l.google.com (priority 10)"
    echo "    - alt4.aspmx.l.google.com (priority 10)"
    echo ""
    echo "  TXT Records (for email security):"
    echo "    - SPF: v=spf1 include:_spf.google.com ~all"
    echo "    - DMARC: v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s"
    echo "    - MTA-STS: v=STSv1; id=2025-11-09"
    echo ""
    print_warning "All records will use TTL=3600 and proxied=false"
    echo ""
    
    # Confirmation prompt
    read -p "Do you want to proceed? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Operation cancelled by user"
        exit 0
    fi
    
    echo ""
    print_info "Starting DNS record configuration..."
    echo ""
    
    # Configure MX records
    print_info "Configuring MX records..."
    process_record "MX" "designfitout.com" "aspmx.l.google.com" 3600 false 1
    process_record "MX" "designfitout.com" "alt1.aspmx.l.google.com" 3600 false 5
    process_record "MX" "designfitout.com" "alt2.aspmx.l.google.com" 3600 false 5
    process_record "MX" "designfitout.com" "alt3.aspmx.l.google.com" 3600 false 10
    process_record "MX" "designfitout.com" "alt4.aspmx.l.google.com" 3600 false 10
    
    echo ""
    
    # Configure TXT records
    print_info "Configuring TXT records..."
    process_record "TXT" "designfitout.com" "v=spf1 include:_spf.google.com ~all" 3600 false
    process_record "TXT" "_dmarc.designfitout.com" "v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s" 3600 false
    process_record "TXT" "_mta-sts.designfitout.com" "v=STSv1; id=2025-11-09" 3600 false
    
    echo ""
    echo "=========================================="
    print_success "DNS configuration completed!"
    echo "=========================================="
    echo ""
    print_info "Next steps:"
    echo "  1. Wait 5-10 minutes for DNS propagation"
    echo "  2. Run ./scripts/verify_email_setup.sh to verify the configuration"
    echo "  3. Complete Google Workspace setup (see docs/GoogleWorkspaceSetup.md)"
    echo "  4. Enable DKIM signing in Google Workspace Admin Console"
    echo ""
}

# Run main function
main
