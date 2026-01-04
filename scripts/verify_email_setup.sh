#!/bin/bash
#
# Email Setup Verification Script
# =================================
#
# This script performs comprehensive checks on DNS records and email
# infrastructure for designfitout.com domain.
#
# Checks performed:
# - MX records validation
# - SPF record verification
# - DMARC policy validation
# - MTA-STS configuration check
# - TLS/SSL certificate validation
# - Optional SMTP connectivity test
#
# Usage:
#   ./scripts/verify_email_setup.sh

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="designfitout.com"
MTA_STS_DOMAIN="mta-sts.designfitout.com"
EXPECTED_MX_COUNT=5
EXIT_CODE=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    EXIT_CODE=1
}

# Print section header
section_header() {
    echo ""
    echo "============================================================================="
    echo "$1"
    echo "============================================================================="
    echo ""
}

# Check if required tools are available
check_tools() {
    local missing_tools=()
    
    for tool in dig curl openssl; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        echo ""
        echo "Please install missing tools:"
        echo "  Ubuntu/Debian: sudo apt-get install dnsutils curl openssl"
        echo "  CentOS/RHEL:   sudo yum install bind-utils curl openssl"
        echo "  macOS:         brew install bind curl openssl"
        exit 1
    fi
}

# Check MX records
check_mx_records() {
    section_header "MX Records Verification"
    
    log_info "Querying MX records for ${DOMAIN}..."
    
    local mx_records=$(dig +short MX "$DOMAIN" | sort)
    
    if [[ -z "$mx_records" ]]; then
        log_error "No MX records found for ${DOMAIN}"
        echo "  Action: Run ./scripts/cf_dns_setup.sh to configure DNS"
        return
    fi
    
    echo "$mx_records"
    echo ""
    
    # Count MX records
    local mx_count=$(echo "$mx_records" | wc -l)
    
    if [[ $mx_count -eq $EXPECTED_MX_COUNT ]]; then
        log_success "Found ${mx_count} MX records (expected ${EXPECTED_MX_COUNT})"
    else
        log_warning "Found ${mx_count} MX records (expected ${EXPECTED_MX_COUNT})"
    fi
    
    # Check for Google MX records
    local google_mx_found=0
    while IFS= read -r line; do
        if [[ "$line" =~ aspmx.*google\.com ]]; then
            ((google_mx_found++))
        fi
    done <<< "$mx_records"
    
    if [[ $google_mx_found -gt 0 ]]; then
        log_success "Google Workspace MX records detected (${google_mx_found} records)"
    else
        log_error "No Google Workspace MX records found"
        echo "  Expected records:"
        echo "    1  aspmx.l.google.com"
        echo "    5  alt1.aspmx.l.google.com"
        echo "    5  alt2.aspmx.l.google.com"
        echo "    10 alt3.aspmx.l.google.com"
        echo "    10 alt4.aspmx.l.google.com"
    fi
}

# Check SPF record
check_spf_record() {
    section_header "SPF Record Verification"
    
    log_info "Querying SPF record for ${DOMAIN}..."
    
    local spf_records=$(dig +short TXT "$DOMAIN" | grep -i "v=spf1")
    
    if [[ -z "$spf_records" ]]; then
        log_error "No SPF record found for ${DOMAIN}"
        echo "  Expected: v=spf1 include:_spf.google.com ~all"
        echo "  Action: Run ./scripts/cf_dns_setup.sh to configure DNS"
        return
    fi
    
    echo "$spf_records"
    echo ""
    
    if echo "$spf_records" | grep -q "include:_spf.google.com"; then
        log_success "SPF record includes Google Workspace (_spf.google.com)"
    else
        log_error "SPF record does not include Google Workspace"
        echo "  Expected to contain: include:_spf.google.com"
    fi
    
    # Check SPF mechanism
    if echo "$spf_records" | grep -qE "(~all|-all)"; then
        log_success "SPF record has valid enforcement mechanism"
    else
        log_warning "SPF record missing enforcement mechanism (~all or -all)"
    fi
}

# Check DMARC record
check_dmarc_record() {
    section_header "DMARC Record Verification"
    
    log_info "Querying DMARC record for ${DOMAIN}..."
    
    local dmarc_record=$(dig +short TXT "_dmarc.${DOMAIN}" | tr -d '"')
    
    if [[ -z "$dmarc_record" ]]; then
        log_error "No DMARC record found for _dmarc.${DOMAIN}"
        echo "  Expected: v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com"
        echo "  Action: Run ./scripts/cf_dns_setup.sh to configure DNS"
        return
    fi
    
    echo "$dmarc_record"
    echo ""
    
    if echo "$dmarc_record" | grep -q "v=DMARC1"; then
        log_success "Valid DMARC record found"
    else
        log_error "Invalid DMARC record format"
    fi
    
    # Check policy
    if echo "$dmarc_record" | grep -qE "p=(none|quarantine|reject)"; then
        local policy=$(echo "$dmarc_record" | grep -oE "p=(none|quarantine|reject)" | cut -d= -f2)
        log_info "DMARC policy: ${policy}"
        
        if [[ "$policy" == "none" ]]; then
            log_warning "DMARC policy is 'none' (monitoring only)"
            echo "  Recommendation: Monitor reports, then upgrade to 'quarantine' or 'reject'"
        else
            log_success "DMARC policy is enforced (${policy})"
        fi
    else
        log_error "DMARC policy not properly configured"
    fi
    
    # Check for reporting email
    if echo "$dmarc_record" | grep -q "rua="; then
        log_success "DMARC aggregate reports configured"
    else
        log_warning "DMARC aggregate reports not configured"
    fi
}

# Check MTA-STS DNS record
check_mta_sts_dns() {
    section_header "MTA-STS DNS Record Verification"
    
    log_info "Querying MTA-STS TXT record for ${DOMAIN}..."
    
    local mta_sts_txt=$(dig +short TXT "_mta-sts.${DOMAIN}" | tr -d '"')
    
    if [[ -z "$mta_sts_txt" ]]; then
        log_error "No MTA-STS TXT record found for _mta-sts.${DOMAIN}"
        echo "  Expected: v=STSv1; id=<timestamp>"
        echo "  Action: Run ./scripts/cf_dns_setup.sh to configure DNS"
        return
    fi
    
    echo "$mta_sts_txt"
    echo ""
    
    if echo "$mta_sts_txt" | grep -q "v=STSv1"; then
        log_success "Valid MTA-STS TXT record found"
    else
        log_error "Invalid MTA-STS TXT record format"
    fi
    
    if echo "$mta_sts_txt" | grep -q "id="; then
        local policy_id=$(echo "$mta_sts_txt" | grep -oE "id=[^ ;]+" | cut -d= -f2)
        log_info "MTA-STS Policy ID: ${policy_id}"
    fi
}

# Check MTA-STS policy file
check_mta_sts_policy() {
    section_header "MTA-STS Policy File Verification"
    
    log_info "Checking MTA-STS policy at https://${MTA_STS_DOMAIN}/.well-known/mta-sts.txt..."
    
    # Check HTTP headers
    local http_response=$(curl -sI "https://${MTA_STS_DOMAIN}/.well-known/mta-sts.txt" 2>&1 || true)
    
    if echo "$http_response" | grep -q "HTTP.*200"; then
        log_success "MTA-STS policy endpoint is accessible (HTTP 200)"
    else
        log_error "MTA-STS policy endpoint is not accessible"
        echo "  URL: https://${MTA_STS_DOMAIN}/.well-known/mta-sts.txt"
        echo "  Action: Deploy Cloudflare Pages Function from functions/.well-known/mta-sts.txt.ts"
        return
    fi
    
    # Check Content-Type
    if echo "$http_response" | grep -iq "content-type:.*text/plain"; then
        log_success "Correct Content-Type header (text/plain)"
    else
        log_warning "Content-Type may not be text/plain"
    fi
    
    echo ""
    log_info "Fetching MTA-STS policy content..."
    echo ""
    
    local policy_content=$(curl -s "https://${MTA_STS_DOMAIN}/.well-known/mta-sts.txt" 2>&1 || true)
    
    if [[ -n "$policy_content" ]]; then
        echo "$policy_content"
        echo ""
        
        # Validate policy content
        if echo "$policy_content" | grep -q "version: STSv1"; then
            log_success "Valid MTA-STS policy version"
        else
            log_error "Invalid or missing MTA-STS policy version"
        fi
        
        if echo "$policy_content" | grep -qE "mode: (enforce|testing|none)"; then
            local mode=$(echo "$policy_content" | grep -oE "mode: (enforce|testing|none)" | cut -d: -f2 | xargs)
            log_info "MTA-STS mode: ${mode}"
            
            if [[ "$mode" == "enforce" ]]; then
                log_success "MTA-STS is enforcing TLS"
            else
                log_warning "MTA-STS mode is '${mode}' (not enforcing)"
            fi
        fi
        
        if echo "$policy_content" | grep -q "mx:.*google.com"; then
            log_success "MX entries include Google mail servers"
        else
            log_error "MX entries do not include Google mail servers"
        fi
        
        if echo "$policy_content" | grep -q "max_age:"; then
            local max_age=$(echo "$policy_content" | grep -oE "max_age: [0-9]+" | cut -d: -f2 | xargs)
            log_info "MTA-STS max_age: ${max_age} seconds"
        fi
    else
        log_error "Failed to fetch MTA-STS policy content"
    fi
}

# Check SSL/TLS certificate for MTA-STS domain
check_mta_sts_ssl() {
    section_header "MTA-STS Domain SSL/TLS Certificate"
    
    log_info "Checking SSL/TLS certificate for ${MTA_STS_DOMAIN}..."
    
    local ssl_check=$(echo | openssl s_client -servername "$MTA_STS_DOMAIN" -connect "${MTA_STS_DOMAIN}:443" 2>&1 || true)
    
    if echo "$ssl_check" | grep -q "Verify return code: 0"; then
        log_success "Valid SSL/TLS certificate"
    elif echo "$ssl_check" | grep -q "unable to get local issuer certificate"; then
        log_warning "SSL certificate verification had issues (may be OK if using self-signed for testing)"
    else
        log_error "SSL/TLS certificate validation failed"
        echo "  Action: Ensure ${MTA_STS_DOMAIN} has a valid SSL certificate"
    fi
    
    # Extract and display certificate info
    if echo "$ssl_check" | grep -q "subject="; then
        local subject=$(echo "$ssl_check" | grep "subject=" | head -1)
        log_info "Certificate subject: ${subject}"
    fi
    
    if echo "$ssl_check" | grep -q "issuer="; then
        local issuer=$(echo "$ssl_check" | grep "issuer=" | head -1)
        log_info "Certificate issuer: ${issuer}"
    fi
}

# Optional SMTP connectivity test
check_smtp_connectivity() {
    section_header "SMTP Connectivity Test (Optional)"
    
    if ! command -v swaks &> /dev/null; then
        log_info "swaks not installed - skipping SMTP connectivity test"
        echo "  To enable: sudo apt-get install swaks (Ubuntu/Debian)"
        return
    fi
    
    log_info "Testing SMTP connectivity to Google mail servers..."
    
    local mx_server="aspmx.l.google.com"
    local test_result=$(swaks --to test@${DOMAIN} --server ${mx_server} --quit-after RCPT --hide-all 2>&1 || true)
    
    if echo "$test_result" | grep -q "250"; then
        log_success "SMTP server ${mx_server} is reachable and responding"
    else
        log_warning "SMTP connectivity test had issues (may be due to rate limiting)"
        echo "$test_result"
    fi
}

# Display final summary
display_summary() {
    section_header "Verification Summary"
    
    if [[ $EXIT_CODE -eq 0 ]]; then
        log_success "All critical checks passed!"
        echo ""
        echo "Email setup is properly configured for ${DOMAIN}"
        echo ""
        echo "Next steps:"
        echo "  1. Complete Google Workspace domain verification"
        echo "  2. Enable DKIM in Google Admin Console"
        echo "  3. Send test emails and monitor delivery"
        echo "  4. Review DMARC reports after 48-72 hours"
        echo "  5. Consider upgrading DMARC policy from 'none' to 'quarantine' or 'reject'"
    else
        log_error "Some checks failed - review the output above"
        echo ""
        echo "Common issues:"
        echo "  - DNS records not yet propagated (wait 5-10 minutes)"
        echo "  - Missing DNS records (run ./scripts/cf_dns_setup.sh)"
        echo "  - MTA-STS policy not deployed (deploy Cloudflare Pages Function)"
        echo ""
        echo "Resources:"
        echo "  - DNS Setup Script: ./scripts/cf_dns_setup.sh"
        echo "  - Documentation: docs/GoogleWorkspaceSetup.md"
        echo "  - DNS Records Reference: infra/DNS/PROD-records.md"
    fi
}

# Main execution
main() {
    echo ""
    log_info "Email Setup Verification for ${DOMAIN}"
    echo "=================================================="
    echo ""
    
    # Check for required tools
    check_tools
    
    # Run all checks
    check_mx_records
    check_spf_record
    check_dmarc_record
    check_mta_sts_dns
    check_mta_sts_policy
    check_mta_sts_ssl
    check_smtp_connectivity
    
    # Display summary
    display_summary
    
    echo ""
    exit $EXIT_CODE
}

# Run main function
main
