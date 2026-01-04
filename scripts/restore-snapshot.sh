#!/usr/bin/env bash

################################################################################
# Snapshot Restore Script
#
# Purpose: Post a snapshot JSON file to the ops snapshot endpoint with
#          proper HMAC authentication.
#
# Usage:
#   MRKETOZ_SHARED_SECRET="secret" \
#   SNAPSHOT_FILE="snapshot.json" \
#   DOMAIN="https://your-domain.com" \
#   ./restore-snapshot.sh
#
# Environment Variables:
#   MRKETOZ_SHARED_SECRET (required) - Shared secret for HMAC authentication
#   SNAPSHOT_FILE (required)          - Path to snapshot JSON file
#   DOMAIN (optional)                 - Target domain (default: from config)
#
# Requirements:
#   - curl (for HTTP requests)
#   - openssl (for HMAC computation)
#   - jq (for JSON validation, optional)
#
################################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# Configuration
################################################################################

MRKETOZ_SHARED_SECRET="${MRKETOZ_SHARED_SECRET:-}"
SNAPSHOT_FILE="${SNAPSHOT_FILE:-}"
DOMAIN="${DOMAIN:-https://fitoutlab.app}"
ENDPOINT="/ops/snapshot.json"

################################################################################
# Helper Functions
################################################################################

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

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command '$1' not found. Please install it first."
        exit 1
    fi
}

################################################################################
# Input Validation
################################################################################

validate_inputs() {
    log_info "Validating inputs..."
    
    # Check for required commands
    check_command "curl"
    check_command "openssl"
    
    # Check for required environment variables
    if [[ -z "$MRKETOZ_SHARED_SECRET" ]]; then
        log_error "MRKETOZ_SHARED_SECRET environment variable is required"
        echo ""
        echo "Usage:"
        echo "  MRKETOZ_SHARED_SECRET=\"your-secret\" \\"
        echo "  SNAPSHOT_FILE=\"snapshot.json\" \\"
        echo "  ./restore-snapshot.sh"
        echo ""
        exit 1
    fi
    
    if [[ -z "$SNAPSHOT_FILE" ]]; then
        log_error "SNAPSHOT_FILE environment variable is required"
        echo ""
        echo "Usage:"
        echo "  MRKETOZ_SHARED_SECRET=\"your-secret\" \\"
        echo "  SNAPSHOT_FILE=\"snapshot.json\" \\"
        echo "  ./restore-snapshot.sh"
        echo ""
        exit 1
    fi
    
    # Check if snapshot file exists
    if [[ ! -f "$SNAPSHOT_FILE" ]]; then
        log_error "Snapshot file not found: $SNAPSHOT_FILE"
        exit 1
    fi
    
    # Validate JSON (if jq is available)
    if command -v jq &> /dev/null; then
        if ! jq empty "$SNAPSHOT_FILE" 2>/dev/null; then
            log_error "Invalid JSON in snapshot file: $SNAPSHOT_FILE"
            exit 1
        fi
        log_success "Snapshot file is valid JSON"
    else
        log_warning "jq not found - skipping JSON validation"
    fi
    
    # Validate domain format
    if [[ ! "$DOMAIN" =~ ^https?:// ]]; then
        log_error "Invalid domain format: $DOMAIN (must start with http:// or https://)"
        exit 1
    fi
    
    log_success "Input validation passed"
}

################################################################################
# HMAC Signature Computation
################################################################################

compute_hmac_signature() {
    local timestamp="$1"
    local body="$2"
    local secret="$3"
    
    # Construct message: timestamp.body
    local message="${timestamp}.${body}"
    
    # Compute HMAC-SHA256 signature
    local signature
    signature=$(echo -n "$message" | openssl dgst -sha256 -hmac "$secret" -binary | xxd -p -c 256)
    
    echo "$signature"
}

################################################################################
# Post Snapshot
################################################################################

post_snapshot() {
    log_info "Preparing to post snapshot to $DOMAIN$ENDPOINT"
    
    # Read snapshot file content
    local body
    body=$(cat "$SNAPSHOT_FILE")
    
    # Generate timestamp (ISO 8601 format)
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Compute HMAC signature
    log_info "Computing HMAC-SHA256 signature..."
    local signature
    signature=$(compute_hmac_signature "$timestamp" "$body" "$MRKETOZ_SHARED_SECRET")
    
    log_info "Signature computed: ${signature:0:16}..."
    
    # Post to endpoint
    log_info "Posting snapshot..."
    
    local response_code
    local response_body
    local temp_response
    temp_response=$(mktemp)
    
    response_code=$(curl -s -w "%{http_code}" -o "$temp_response" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "X-Timestamp: $timestamp" \
        -H "X-Signature: $signature" \
        -d "$body" \
        "$DOMAIN$ENDPOINT")
    
    response_body=$(cat "$temp_response")
    rm -f "$temp_response"
    
    # Check response
    if [[ "$response_code" == "200" ]]; then
        log_success "Snapshot posted successfully!"
        echo ""
        echo "Response:"
        echo "$response_body" | jq . 2>/dev/null || echo "$response_body"
        echo ""
        return 0
    else
        log_error "Failed to post snapshot (HTTP $response_code)"
        echo ""
        echo "Response:"
        echo "$response_body"
        echo ""
        return 1
    fi
}

################################################################################
# Fallback: Bearer Token Authentication
################################################################################

post_snapshot_bearer() {
    log_warning "Trying Bearer token authentication as fallback..."
    
    # Read snapshot file content
    local body
    body=$(cat "$SNAPSHOT_FILE")
    
    # Post to endpoint with Bearer token
    local response_code
    local response_body
    local temp_response
    temp_response=$(mktemp)
    
    response_code=$(curl -s -w "%{http_code}" -o "$temp_response" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $MRKETOZ_SHARED_SECRET" \
        -d "$body" \
        "$DOMAIN$ENDPOINT")
    
    response_body=$(cat "$temp_response")
    rm -f "$temp_response"
    
    # Check response
    if [[ "$response_code" == "200" ]]; then
        log_success "Snapshot posted successfully via Bearer token!"
        echo ""
        echo "Response:"
        echo "$response_body" | jq . 2>/dev/null || echo "$response_body"
        echo ""
        return 0
    else
        log_error "Failed to post snapshot via Bearer token (HTTP $response_code)"
        echo ""
        echo "Response:"
        echo "$response_body"
        echo ""
        return 1
    fi
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "  Snapshot Restore Script"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    
    # Validate inputs
    validate_inputs
    
    echo ""
    echo "Configuration:"
    echo "  Domain:        $DOMAIN"
    echo "  Endpoint:      $ENDPOINT"
    echo "  Snapshot File: $SNAPSHOT_FILE"
    echo "  File Size:     $(wc -c < "$SNAPSHOT_FILE") bytes"
    echo ""
    
    # Try HMAC authentication first
    if post_snapshot; then
        log_success "Snapshot restoration completed successfully!"
        exit 0
    fi
    
    # If HMAC fails, try Bearer token fallback
    log_warning "HMAC authentication failed, trying Bearer token fallback..."
    echo ""
    
    if post_snapshot_bearer; then
        log_success "Snapshot restoration completed via fallback authentication!"
        exit 0
    fi
    
    # Both methods failed
    log_error "Snapshot restoration failed"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Verify MRKETOZ_SHARED_SECRET is correct"
    echo "  2. Check that the endpoint is accessible: $DOMAIN$ENDPOINT"
    echo "  3. Verify system clock is synchronized (for HMAC timestamp validation)"
    echo "  4. Check server logs for detailed error information"
    echo ""
    exit 1
}

# Execute main function
main "$@"
