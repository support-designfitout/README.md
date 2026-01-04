#!/usr/bin/env bash

#############################################################################
# Email Setup Verification Script
#
# This script performs comprehensive checks on email DNS configuration
# and MTA-STS setup for designfitout.com
#
# Checks performed:
#   - MX records (mail routing)
#   - SPF record (sender policy framework)
#   - DMARC record (domain-based message authentication)
#   - MTA-STS DNS record
#   - MTA-STS policy endpoint
#   - SSL/TLS certificate for MTA-STS subdomain
#   - SMTP connectivity (optional)
#
# Exit Codes:
#   0 - All critical checks passed
#   1 - One or more critical checks failed
#   2 - Script error or missing dependencies
#
# Usage:
#   ./scripts/verify_email_setup.sh
#
#############################################################################

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

# Test results tracking
declare -i TOTAL_CHECKS=0
declare -i PASSED_CHECKS=0
declare -i FAILED_CHECKS=0
declare -i WARNING_CHECKS=0

#############################################################################
# Helper Functions
#############################################################################

log_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$*${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

log_subheader() {
    echo ""
    echo -e "${CYAN}▶ $*${NC}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $*"
    ((PASSED_CHECKS++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $*"
    ((FAILED_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $*"
    ((WARNING_CHECKS++))
}

log_result() {
    echo -e "  ${CYAN}→${NC} $*"
}

increment_check() {
    ((TOTAL_CHECKS++))
}

#############################################################################
# Dependency Checks
#############################################################################

check_dependencies() {
    log_header "Checking Dependencies"
    
    local missing_deps=()
    
    if ! command -v dig &> /dev/null; then
        log_fail "dig command not found (install dnsutils or bind-tools)"
        missing_deps+=("dig")
    else
        log_pass "dig is available"
    fi
    
    if ! command -v curl &> /dev/null; then
        log_fail "curl command not found"
        missing_deps+=("curl")
    else
        log_pass "curl is available"
    fi
    
    if ! command -v openssl &> /dev/null; then
        log_fail "openssl command not found"
        missing_deps+=("openssl")
    else
        log_pass "openssl is available"
    fi
    
    if ! command -v swaks &> /dev/null; then
        log_warning "swaks command not found (SMTP test will be skipped)"
        log_info "Install swaks for complete testing: apt-get install swaks or brew install swaks"
    else
        log_pass "swaks is available"
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        echo ""
        log_fail "Missing required dependencies: ${missing_deps[*]}"
        echo ""
        echo "Install missing dependencies:"
        echo "  Ubuntu/Debian: sudo apt-get install dnsutils curl openssl swaks"
        echo "  CentOS/RHEL:   sudo yum install bind-utils curl openssl"
        echo "  macOS:         brew install bind curl openssl swaks"
        exit 2
    fi
}

#############################################################################
# DNS Verification Functions
#############################################################################

verify_mx_records() {
    log_header "Verifying MX Records"
    increment_check
    
    log_info "Querying MX records for ${DOMAIN}..."
    local mx_output
    mx_output=$(dig MX "${DOMAIN}" +short 2>&1 || echo "ERROR")
    
    if [[ "${mx_output}" == "ERROR" ]] || [[ -z "${mx_output}" ]]; then
        log_fail "No MX records found for ${DOMAIN}"
        log_result "DNS query failed or returned empty result"
        return 1
    fi
    
    log_result "Raw output:"
    echo "${mx_output}" | while IFS= read -r line; do
        log_result "  ${line}"
    done
    
    # Check for expected Google MX records
    local expected_mx=(
        "aspmx.l.google.com"
        "alt1.aspmx.l.google.com"
        "alt2.aspmx.l.google.com"
        "alt3.aspmx.l.google.com"
        "alt4.aspmx.l.google.com"
    )
    
    local found_count=0
    for mx_host in "${expected_mx[@]}"; do
        if echo "${mx_output}" | grep -q "${mx_host}"; then
            ((found_count++))
        fi
    done
    
    if [[ ${found_count} -eq 5 ]]; then
        log_pass "All 5 Google Workspace MX records found"
    elif [[ ${found_count} -gt 0 ]]; then
        log_warning "Found ${found_count}/5 Google Workspace MX records"
        log_result "Missing some MX records - email routing may be suboptimal"
    else
        log_fail "No Google Workspace MX records found"
        log_result "Ensure you've configured MX records for Google Workspace"
        return 1
    fi
    
    # Check MX priorities
    if echo "${mx_output}" | grep -q "^1 " || echo "${mx_output}" | grep -q "^10 "; then
        log_pass "MX priority values detected"
    else
        log_warning "Could not verify MX priorities"
    fi
}

verify_spf_record() {
    log_header "Verifying SPF Record"
    increment_check
    
    log_info "Querying TXT records for ${DOMAIN}..."
    local txt_output
    txt_output=$(dig TXT "${DOMAIN}" +short 2>&1 || echo "ERROR")
    
    if [[ "${txt_output}" == "ERROR" ]]; then
        log_fail "DNS query failed for TXT records"
        return 1
    fi
    
    log_result "Raw output:"
    echo "${txt_output}" | while IFS= read -r line; do
        log_result "  ${line}"
    done
    
    # Check for SPF record
    if echo "${txt_output}" | grep -q "v=spf1"; then
        log_pass "SPF record found"
        
        # Check if it includes Google
        if echo "${txt_output}" | grep -q "_spf.google.com"; then
            log_pass "SPF record includes Google Workspace"
        else
            log_warning "SPF record found but doesn't include Google Workspace"
            log_result "Expected: v=spf1 include:_spf.google.com ~all"
        fi
    else
        log_fail "No SPF record found"
        log_result "Add SPF record: v=spf1 include:_spf.google.com ~all"
        return 1
    fi
}

verify_dmarc_record() {
    log_header "Verifying DMARC Record"
    increment_check
    
    log_info "Querying TXT records for _dmarc.${DOMAIN}..."
    local dmarc_output
    dmarc_output=$(dig TXT "_dmarc.${DOMAIN}" +short 2>&1 || echo "ERROR")
    
    if [[ "${dmarc_output}" == "ERROR" ]]; then
        log_fail "DNS query failed for DMARC record"
        return 1
    fi
    
    log_result "Raw output:"
    echo "${dmarc_output}" | while IFS= read -r line; do
        log_result "  ${line}"
    done
    
    # Check for DMARC record
    if echo "${dmarc_output}" | grep -q "v=DMARC1"; then
        log_pass "DMARC record found"
        
        # Check DMARC policy
        if echo "${dmarc_output}" | grep -q "p=none"; then
            log_warning "DMARC policy is 'none' (monitoring mode)"
            log_result "Consider moving to 'quarantine' or 'reject' after monitoring"
        elif echo "${dmarc_output}" | grep -q "p=quarantine"; then
            log_pass "DMARC policy is 'quarantine' (good security posture)"
        elif echo "${dmarc_output}" | grep -q "p=reject"; then
            log_pass "DMARC policy is 'reject' (strongest security)"
        fi
        
        # Check for reporting address
        if echo "${dmarc_output}" | grep -q "rua="; then
            log_pass "DMARC aggregate reporting configured"
        else
            log_warning "DMARC aggregate reporting not configured"
        fi
    else
        log_fail "No DMARC record found"
        log_result "Add DMARC record to _dmarc.${DOMAIN}"
        return 1
    fi
}

verify_mta_sts_dns() {
    log_header "Verifying MTA-STS DNS Record"
    increment_check
    
    log_info "Querying TXT records for _mta-sts.${DOMAIN}..."
    local mta_sts_output
    mta_sts_output=$(dig TXT "_mta-sts.${DOMAIN}" +short 2>&1 || echo "ERROR")
    
    if [[ "${mta_sts_output}" == "ERROR" ]]; then
        log_fail "DNS query failed for MTA-STS record"
        return 1
    fi
    
    log_result "Raw output:"
    echo "${mta_sts_output}" | while IFS= read -r line; do
        log_result "  ${line}"
    done
    
    # Check for MTA-STS record
    if echo "${mta_sts_output}" | grep -q "v=STSv1"; then
        log_pass "MTA-STS DNS record found"
        
        # Extract and display ID
        local sts_id
        sts_id=$(echo "${mta_sts_output}" | grep -o "id=[^;\"]*" | cut -d'=' -f2)
        if [[ -n "${sts_id}" ]]; then
            log_result "MTA-STS ID: ${sts_id}"
        fi
    else
        log_fail "No MTA-STS DNS record found"
        log_result "Add MTA-STS record to _mta-sts.${DOMAIN}"
        log_result "Example: v=STSv1; id=2025-11-09"
        return 1
    fi
}

#############################################################################
# HTTPS/MTA-STS Policy Verification
#############################################################################

verify_mta_sts_https() {
    log_header "Verifying MTA-STS HTTPS Endpoint"
    increment_check
    
    local mta_sts_url="https://${MTA_STS_DOMAIN}/.well-known/mta-sts.txt"
    
    log_info "Checking HTTP headers for ${mta_sts_url}..."
    local http_response
    http_response=$(curl -s -I -L --max-time 10 "${mta_sts_url}" 2>&1 || echo "ERROR")
    
    if [[ "${http_response}" == "ERROR" ]] || [[ -z "${http_response}" ]]; then
        log_fail "Failed to connect to ${mta_sts_url}"
        log_result "Ensure MTA-STS subdomain resolves and serves the policy"
        return 1
    fi
    
    log_result "Response headers:"
    echo "${http_response}" | head -20 | while IFS= read -r line; do
        log_result "  ${line}"
    done
    
    # Check for 200 OK
    if echo "${http_response}" | grep -q "200 OK\|200$"; then
        log_pass "MTA-STS endpoint returns 200 OK"
    else
        log_fail "MTA-STS endpoint did not return 200 OK"
        local status_code
        status_code=$(echo "${http_response}" | grep -i "HTTP" | head -1)
        log_result "Received: ${status_code}"
        return 1
    fi
    
    # Verify policy content
    log_info "Fetching MTA-STS policy content..."
    local policy_content
    policy_content=$(curl -s -L --max-time 10 "${mta_sts_url}" 2>&1 || echo "ERROR")
    
    if [[ "${policy_content}" == "ERROR" ]]; then
        log_fail "Failed to fetch policy content"
        return 1
    fi
    
    log_result "Policy content:"
    echo "${policy_content}" | while IFS= read -r line; do
        log_result "  ${line}"
    done
    
    # Validate policy structure
    if echo "${policy_content}" | grep -q "version: STSv1"; then
        log_pass "Policy contains correct version"
    else
        log_fail "Policy missing or incorrect version"
    fi
    
    if echo "${policy_content}" | grep -q "mode: enforce\|mode: testing"; then
        log_pass "Policy mode is valid"
    else
        log_warning "Policy mode may be invalid"
    fi
    
    if echo "${policy_content}" | grep -q "mx:.*google\.com\|mx:.*gmail\.com"; then
        log_pass "Policy includes Google MX servers"
    else
        log_fail "Policy missing Google MX servers"
    fi
    
    if echo "${policy_content}" | grep -q "max_age:"; then
        log_pass "Policy includes max_age directive"
    else
        log_warning "Policy missing max_age directive"
    fi
}

verify_ssl_certificate() {
    log_header "Verifying SSL/TLS Certificate"
    increment_check
    
    log_info "Checking SSL certificate for ${MTA_STS_DOMAIN}..."
    
    # Use openssl to check certificate
    local cert_info
    cert_info=$(echo | openssl s_client -connect "${MTA_STS_DOMAIN}:443" -servername "${MTA_STS_DOMAIN}" 2>&1 || echo "ERROR")
    
    if [[ "${cert_info}" == "ERROR" ]] || [[ -z "${cert_info}" ]]; then
        log_fail "Failed to retrieve SSL certificate"
        return 1
    fi
    
    # Check if connection succeeded
    if echo "${cert_info}" | grep -q "Verify return code: 0"; then
        log_pass "SSL certificate is valid and trusted"
    else
        local verify_code
        verify_code=$(echo "${cert_info}" | grep "Verify return code:" | head -1)
        log_fail "SSL certificate verification failed"
        log_result "${verify_code}"
    fi
    
    # Extract certificate details
    local subject
    subject=$(echo "${cert_info}" | grep "subject=" | head -1 | sed 's/subject=//')
    if [[ -n "${subject}" ]]; then
        log_result "Certificate subject: ${subject}"
    fi
    
    local issuer
    issuer=$(echo "${cert_info}" | grep "issuer=" | head -1 | sed 's/issuer=//')
    if [[ -n "${issuer}" ]]; then
        log_result "Certificate issuer: ${issuer}"
    fi
    
    # Check certificate validity dates
    local not_before
    not_before=$(echo "${cert_info}" | grep "notBefore=" | head -1 | sed 's/.*notBefore=//')
    if [[ -n "${not_before}" ]]; then
        log_result "Valid from: ${not_before}"
    fi
    
    local not_after
    not_after=$(echo "${cert_info}" | grep "notAfter=" | head -1 | sed 's/.*notAfter=//')
    if [[ -n "${not_after}" ]]; then
        log_result "Valid until: ${not_after}"
    fi
}

#############################################################################
# SMTP Connectivity Check (Optional)
#############################################################################

verify_smtp_connectivity() {
    log_header "Verifying SMTP Connectivity (Optional)"
    
    if ! command -v swaks &> /dev/null; then
        log_warning "swaks not available - skipping SMTP connectivity test"
        log_info "Install swaks to enable SMTP testing"
        return 0
    fi
    
    increment_check
    
    log_info "Testing SMTP connection to aspmx.l.google.com:25..."
    log_warning "Note: This test may fail in restricted network environments"
    
    # Try to connect to Google's MX server
    local smtp_output
    smtp_output=$(swaks --to test@example.com --from noreply@"${DOMAIN}" --server aspmx.l.google.com --port 25 --quit-after BANNER --timeout 10 2>&1 || echo "ERROR")
    
    if [[ "${smtp_output}" == "ERROR" ]] || echo "${smtp_output}" | grep -q "ERROR"; then
        log_warning "SMTP connectivity test failed"
        log_result "This may be due to network restrictions or firewall rules"
        log_result "If other checks pass, email should still work"
    else
        log_result "SMTP response:"
        echo "${smtp_output}" | grep -i "220\|SMTP" | while IFS= read -r line; do
            log_result "  ${line}"
        done
        
        if echo "${smtp_output}" | grep -q "220.*google.com"; then
            log_pass "Successfully connected to Google SMTP server"
        else
            log_warning "Connected but didn't receive expected Google SMTP banner"
        fi
    fi
}

#############################################################################
# Summary and Recommendations
#############################################################################

print_summary() {
    log_header "Verification Summary"
    
    echo ""
    echo -e "${CYAN}Test Results:${NC}"
    echo -e "  Total Checks:   ${TOTAL_CHECKS}"
    echo -e "  ${GREEN}Passed:${NC}         ${PASSED_CHECKS}"
    echo -e "  ${RED}Failed:${NC}         ${FAILED_CHECKS}"
    echo -e "  ${YELLOW}Warnings:${NC}       ${WARNING_CHECKS}"
    echo ""
    
    if [[ ${FAILED_CHECKS} -eq 0 ]]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║          ✓ All Critical Checks Passed!                       ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        if [[ ${WARNING_CHECKS} -gt 0 ]]; then
            echo -e "${YELLOW}Note: Some warnings were found. Review the output above.${NC}"
            echo ""
        fi
        
        echo -e "${CYAN}Your email setup appears to be configured correctly.${NC}"
        echo ""
        echo -e "${YELLOW}Next Steps:${NC}"
        echo "  1. Send a test email to verify end-to-end delivery"
        echo "  2. Check email headers for SPF, DKIM, and DMARC results"
        echo "  3. If DKIM is not configured, add it in Google Workspace Admin"
        echo "  4. Monitor DMARC reports and adjust policy as needed"
        echo "  5. Consider enabling additional security features"
        echo ""
    else
        echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║          ✗ Some Checks Failed                                ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Remediation Steps:${NC}"
        echo ""
        
        if dig MX "${DOMAIN}" +short | grep -q "google.com"; then
            :
        else
            echo -e "${RED}▶ MX Records:${NC}"
            echo "  Run the DNS setup script: ./scripts/cf_dns_setup.sh"
            echo "  Or manually add MX records in Cloudflare dashboard"
            echo ""
        fi
        
        if dig TXT "${DOMAIN}" +short | grep -q "v=spf1"; then
            :
        else
            echo -e "${RED}▶ SPF Record:${NC}"
            echo "  Add TXT record: v=spf1 include:_spf.google.com ~all"
            echo ""
        fi
        
        if dig TXT "_dmarc.${DOMAIN}" +short | grep -q "v=DMARC1"; then
            :
        else
            echo -e "${RED}▶ DMARC Record:${NC}"
            echo "  Add TXT record to _dmarc.${DOMAIN}"
            echo "  Example: v=DMARC1; p=none; rua=mailto:dmarc@${DOMAIN}"
            echo ""
        fi
        
        if curl -s -I "https://${MTA_STS_DOMAIN}/.well-known/mta-sts.txt" | grep -q "200"; then
            :
        else
            echo -e "${RED}▶ MTA-STS Policy:${NC}"
            echo "  Ensure https://${MTA_STS_DOMAIN}/.well-known/mta-sts.txt is accessible"
            echo "  Deploy the Cloudflare Pages Function from this repository"
            echo ""
        fi
        
        echo -e "${YELLOW}Additional Resources:${NC}"
        echo "  - Google Workspace Setup Guide: docs/GoogleWorkspaceSetup.md"
        echo "  - DNS Records Documentation: infra/DNS/PROD-records.md"
        echo "  - MXToolbox: https://mxtoolbox.com/SuperTool.aspx"
        echo ""
    fi
}

#############################################################################
# Main Execution
#############################################################################

main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     Email Setup Verification for ${DOMAIN}     ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    
    # Check dependencies first
    check_dependencies
    
    # Run all verification checks
    verify_mx_records
    verify_spf_record
    verify_dmarc_record
    verify_mta_sts_dns
    verify_mta_sts_https
    verify_ssl_certificate
    verify_smtp_connectivity
    
    # Print summary
    print_summary
    
    # Exit with appropriate code
    if [[ ${FAILED_CHECKS} -gt 0 ]]; then
        exit 1
    else
        exit 0
    fi
}

# Run main function
main "$@"
