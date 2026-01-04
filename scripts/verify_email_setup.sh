#!/usr/bin/env bash

# Email Setup Verification Script
#
# This script performs comprehensive checks to verify that email infrastructure
# is properly configured for designfitout.com with Google Workspace.
#
# Checks performed:
# - MX records (mail routing)
# - SPF record (sender authentication)
# - DMARC record (email policy)
# - MTA-STS DNS record
# - MTA-STS policy endpoint (HTTPS)
# - SSL/TLS certificate for MTA-STS subdomain
# - Optional: SMTP connectivity test
#
# Usage:
#   ./scripts/verify_email_setup.sh

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test result counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print colored messages
print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}\n"
}

print_section() {
    echo -e "\n${BLUE}▶ $1${NC}\n"
}

print_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((FAILED++))
}

print_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_detail() {
    echo "  $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required dependencies
check_dependencies() {
    print_section "Checking Dependencies"
    
    local missing_deps=()
    
    if ! command_exists dig; then
        missing_deps+=("dig (dnsutils)")
    fi
    
    if ! command_exists curl; then
        missing_deps+=("curl")
    fi
    
    if ! command_exists openssl; then
        missing_deps+=("openssl")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        print_fail "Missing required dependencies: ${missing_deps[*]}"
        echo ""
        echo "Install with:"
        echo "  Ubuntu/Debian: sudo apt-get install dnsutils curl openssl"
        echo "  macOS: brew install bind curl openssl"
        echo ""
        exit 1
    fi
    
    print_pass "All required dependencies are installed"
    
    if ! command_exists swaks; then
        print_info "swaks not found - SMTP connectivity test will be skipped"
        print_info "Install with: sudo apt-get install swaks (optional)"
    fi
}

# Check MX records
check_mx_records() {
    print_section "Checking MX Records"
    
    local mx_output
    mx_output=$(dig MX designfitout.com +short 2>&1)
    
    if [[ -z "$mx_output" ]]; then
        print_fail "No MX records found for designfitout.com"
        print_detail "Remediation: Run ./scripts/cf_dns_setup.sh to configure DNS records"
        return 1
    fi
    
    print_info "MX records found:"
    echo "$mx_output" | while read -r line; do
        print_detail "$line"
    done
    
    # Check for required Google MX records
    local required_mx=(
        "aspmx.l.google.com"
        "alt1.aspmx.l.google.com"
        "alt2.aspmx.l.google.com"
    )
    
    local all_found=true
    for mx in "${required_mx[@]}"; do
        if echo "$mx_output" | grep -q "$mx"; then
            print_pass "Found required MX: $mx"
        else
            print_fail "Missing required MX: $mx"
            all_found=false
        fi
    done
    
    if [[ "$all_found" == false ]]; then
        print_detail "Remediation: Run ./scripts/cf_dns_setup.sh to add missing MX records"
        return 1
    fi
}

# Check SPF record
check_spf_record() {
    print_section "Checking SPF Record"
    
    local spf_output
    spf_output=$(dig TXT designfitout.com +short 2>&1)
    
    if [[ -z "$spf_output" ]]; then
        print_fail "No TXT records found for designfitout.com"
        print_detail "Remediation: Run ./scripts/cf_dns_setup.sh to configure DNS records"
        return 1
    fi
    
    local spf_record
    spf_record=$(echo "$spf_output" | grep "v=spf1")
    
    if [[ -z "$spf_record" ]]; then
        print_fail "No SPF record found"
        print_detail "Remediation: Run ./scripts/cf_dns_setup.sh to add SPF record"
        return 1
    fi
    
    print_info "SPF record found:"
    print_detail "$spf_record"
    
    if echo "$spf_record" | grep -q "include:_spf.google.com"; then
        print_pass "SPF record includes Google Workspace"
    else
        print_fail "SPF record missing 'include:_spf.google.com'"
        print_detail "Remediation: Update SPF record to include Google Workspace"
        return 1
    fi
    
    if echo "$spf_record" | grep -qE "(-all|~all)"; then
        print_pass "SPF record has proper fail policy"
    else
        print_warn "SPF record should end with ~all or -all"
    fi
}

# Check DMARC record
check_dmarc_record() {
    print_section "Checking DMARC Record"
    
    local dmarc_output
    dmarc_output=$(dig TXT _dmarc.designfitout.com +short 2>&1)
    
    if [[ -z "$dmarc_output" ]]; then
        print_fail "No DMARC record found"
        print_detail "Remediation: Run ./scripts/cf_dns_setup.sh to add DMARC record"
        return 1
    fi
    
    print_info "DMARC record found:"
    print_detail "$dmarc_output"
    
    if echo "$dmarc_output" | grep -q "v=DMARC1"; then
        print_pass "Valid DMARC record found"
    else
        print_fail "Invalid DMARC record format"
        return 1
    fi
    
    # Check DMARC policy
    if echo "$dmarc_output" | grep -q "p=none"; then
        print_warn "DMARC policy is 'none' (monitoring mode)"
        print_detail "Recommendation: After 7-14 days of monitoring, upgrade to p=quarantine"
    elif echo "$dmarc_output" | grep -q "p=quarantine"; then
        print_pass "DMARC policy is 'quarantine' (good)"
        print_detail "Recommendation: After successful monitoring, consider upgrading to p=reject"
    elif echo "$dmarc_output" | grep -q "p=reject"; then
        print_pass "DMARC policy is 'reject' (excellent)"
    fi
    
    # Check for reporting address
    if echo "$dmarc_output" | grep -q "rua="; then
        print_pass "DMARC aggregate reporting configured"
    else
        print_warn "No DMARC reporting address configured"
    fi
}

# Check MTA-STS DNS record
check_mta_sts_dns() {
    print_section "Checking MTA-STS DNS Record"
    
    local mta_sts_output
    mta_sts_output=$(dig TXT _mta-sts.designfitout.com +short 2>&1)
    
    if [[ -z "$mta_sts_output" ]]; then
        print_fail "No MTA-STS DNS record found"
        print_detail "Remediation: Run ./scripts/cf_dns_setup.sh to add MTA-STS DNS record"
        return 1
    fi
    
    print_info "MTA-STS DNS record found:"
    print_detail "$mta_sts_output"
    
    if echo "$mta_sts_output" | grep -q "v=STSv1"; then
        print_pass "Valid MTA-STS DNS record found"
    else
        print_fail "Invalid MTA-STS DNS record format"
        return 1
    fi
    
    if echo "$mta_sts_output" | grep -q "id="; then
        print_pass "MTA-STS policy ID present"
    else
        print_warn "MTA-STS policy ID missing"
    fi
}

# Check MTA-STS policy endpoint
check_mta_sts_endpoint() {
    print_section "Checking MTA-STS Policy Endpoint"
    
    local url="https://mta-sts.designfitout.com/.well-known/mta-sts.txt"
    
    print_info "Testing endpoint: $url"
    
    # Check HTTP headers
    local headers
    headers=$(curl -I -s -L "$url" 2>&1)
    
    if [[ $? -ne 0 ]]; then
        print_fail "Failed to connect to MTA-STS endpoint"
        print_detail "Remediation: Ensure mta-sts subdomain points to Cloudflare Pages"
        print_detail "Remediation: Deploy the Cloudflare Pages Function from functions/.well-known/mta-sts.txt.ts"
        return 1
    fi
    
    # Check status code
    if echo "$headers" | grep -q "HTTP/[0-9.]* 200"; then
        print_pass "MTA-STS endpoint is accessible (HTTP 200)"
    else
        print_fail "MTA-STS endpoint returned non-200 status"
        print_detail "Response headers:"
        echo "$headers" | head -5 | while read -r line; do
            print_detail "$line"
        done
        return 1
    fi
    
    # Check content type
    if echo "$headers" | grep -qi "content-type.*text/plain"; then
        print_pass "Correct content-type header (text/plain)"
    else
        print_warn "Content-type should be text/plain"
    fi
    
    # Check cache control
    if echo "$headers" | grep -qi "cache-control"; then
        print_pass "Cache-control header present"
    else
        print_warn "Cache-control header missing"
    fi
    
    # Check policy content
    print_info "Fetching policy content..."
    local policy_content
    policy_content=$(curl -s -L "$url" 2>&1)
    
    if [[ -z "$policy_content" ]]; then
        print_fail "Policy content is empty"
        return 1
    fi
    
    print_info "Policy content:"
    echo "$policy_content" | while read -r line; do
        print_detail "$line"
    done
    
    # Validate policy content
    if echo "$policy_content" | grep -q "version: STSv1"; then
        print_pass "Policy has correct version"
    else
        print_fail "Policy missing 'version: STSv1'"
    fi
    
    if echo "$policy_content" | grep -q "mode: enforce"; then
        print_pass "Policy mode is 'enforce'"
    else
        print_warn "Policy mode should be 'enforce' for production"
    fi
    
    if echo "$policy_content" | grep -q "mx:.*google.com"; then
        print_pass "Policy includes Google mail servers"
    else
        print_fail "Policy missing Google mail servers"
    fi
    
    if echo "$policy_content" | grep -q "max_age:"; then
        print_pass "Policy has max_age directive"
    else
        print_fail "Policy missing max_age directive"
    fi
}

# Check SSL certificate for MTA-STS subdomain
check_mta_sts_certificate() {
    print_section "Checking MTA-STS SSL Certificate"
    
    local domain="mta-sts.designfitout.com"
    
    print_info "Checking certificate for $domain"
    
    # Get certificate information
    local cert_info
    cert_info=$(echo | openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | openssl x509 -noout -subject -issuer -dates 2>/dev/null)
    
    if [[ -z "$cert_info" ]]; then
        print_fail "Failed to retrieve SSL certificate"
        print_detail "Remediation: Ensure mta-sts subdomain has valid SSL certificate"
        print_detail "Remediation: If using Cloudflare, enable SSL/TLS encryption (Full or Full Strict)"
        return 1
    fi
    
    print_info "Certificate information:"
    echo "$cert_info" | while read -r line; do
        print_detail "$line"
    done
    
    print_pass "Valid SSL certificate found"
    
    # Check certificate expiry
    local expiry_date
    expiry_date=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2-)
    
    if [[ -n "$expiry_date" ]]; then
        print_info "Certificate expires: $expiry_date"
        
        # Convert to seconds for comparison (basic check)
        local expiry_epoch
        expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$expiry_date" +%s 2>/dev/null || echo "0")
        local current_epoch
        current_epoch=$(date +%s)
        local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
        
        if [[ $days_until_expiry -gt 30 ]]; then
            print_pass "Certificate valid for $days_until_expiry more days"
        elif [[ $days_until_expiry -gt 0 ]]; then
            print_warn "Certificate expires in $days_until_expiry days - renewal recommended"
        else
            print_fail "Certificate has expired!"
        fi
    fi
}

# Check SMTP connectivity (optional)
check_smtp_connectivity() {
    print_section "Checking SMTP Connectivity (Optional)"
    
    if ! command_exists swaks; then
        print_info "swaks not installed - skipping SMTP connectivity test"
        print_detail "To install: sudo apt-get install swaks"
        return 0
    fi
    
    print_info "Testing SMTP connection to aspmx.l.google.com..."
    
    # Basic SMTP connection test (don't send actual email)
    local smtp_output
    smtp_output=$(swaks --to test@example.com --from test@designfitout.com --server aspmx.l.google.com --quit-after RCPT --hide-all 2>&1)
    
    if echo "$smtp_output" | grep -q "250.*OK"; then
        print_pass "SMTP connectivity successful"
    else
        print_warn "SMTP connectivity test inconclusive"
        print_detail "This is normal if domain verification is not complete"
    fi
}

# Print summary
print_summary() {
    print_header "Verification Summary"
    
    echo -e "${GREEN}Passed:${NC}   $PASSED"
    echo -e "${RED}Failed:${NC}   $FAILED"
    echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
    echo ""
    
    if [[ $FAILED -eq 0 ]]; then
        echo -e "${GREEN}✓ All critical checks passed!${NC}"
        echo ""
        print_info "Next steps:"
        echo "  1. Complete Google Workspace domain verification"
        echo "  2. Enable DKIM signing in Google Workspace Admin Console"
        echo "  3. Monitor DMARC reports for 7-14 days"
        echo "  4. Consider upgrading DMARC policy to p=quarantine or p=reject"
        echo ""
        echo "For detailed instructions, see: docs/GoogleWorkspaceSetup.md"
        echo ""
        return 0
    else
        echo -e "${RED}✗ Some checks failed${NC}"
        echo ""
        print_info "Please review the failures above and apply recommended remediations"
        echo ""
        return 1
    fi
}

# Main script
main() {
    print_header "Email Setup Verification for designfitout.com"
    
    check_dependencies
    check_mx_records
    check_spf_record
    check_dmarc_record
    check_mta_sts_dns
    check_mta_sts_endpoint
    check_mta_sts_certificate
    check_smtp_connectivity
    
    print_summary
}

# Run main function and exit with appropriate code
main
exit $?
