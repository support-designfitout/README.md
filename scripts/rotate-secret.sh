#!/usr/bin/env bash

################################################################################
# Secret Rotation Script for MRKETOZ_SHARED_SECRET
#
# Purpose: Safely rotate the shared secret used for HMAC authentication
#          in the ops snapshot service.
#
# Usage:
#   ./rotate-secret.sh              # Interactive rotation
#   DRY_RUN=1 ./rotate-secret.sh    # Dry run mode (print actions only)
#
# Requirements:
#   - openssl (for generating secure random secrets)
#   - wrangler CLI (configured and authenticated)
#   - gh CLI (authenticated with repository access)
#
# Security Notes:
#   - Generated secret is NOT echoed to stdout/logs
#   - Operator must manually store secret in organizational vault
#   - Secret is only passed to wrangler/gh via secure input methods
#   - This script does NOT commit secrets to git
#
################################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN="${DRY_RUN:-0}"
SECRET_LENGTH=32  # Base64 encoded bytes

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
# Preflight Checks
################################################################################

preflight_checks() {
    log_info "Running preflight checks..."
    
    # Check required commands
    check_command "openssl"
    check_command "wrangler"
    check_command "gh"
    
    # Check wrangler authentication
    if [[ "$DRY_RUN" != "1" ]]; then
        if ! wrangler whoami &> /dev/null; then
            log_error "wrangler is not authenticated. Run 'wrangler login' first."
            exit 1
        fi
        log_success "wrangler authentication verified"
        
        # Check gh authentication
        if ! gh auth status &> /dev/null; then
            log_error "gh CLI is not authenticated. Run 'gh auth login' first."
            exit 1
        fi
        log_success "gh CLI authentication verified"
    fi
}

################################################################################
# Secret Generation
################################################################################

generate_secret() {
    log_info "Generating new cryptographically secure secret..."
    
    # Generate a strong random secret
    NEW_SECRET=$(openssl rand -base64 "$SECRET_LENGTH")
    
    if [[ -z "$NEW_SECRET" ]]; then
        log_error "Failed to generate secret"
        exit 1
    fi
    
    log_success "New secret generated successfully (${#NEW_SECRET} characters)"
    log_warning "DO NOT echo or log the secret value!"
}

################################################################################
# Operator Instructions
################################################################################

display_operator_instructions() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "  CRITICAL: OPERATOR ACTION REQUIRED"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    log_warning "A new secret has been generated for MRKETOZ_SHARED_SECRET"
    echo ""
    echo "📋 REQUIRED ACTIONS:"
    echo ""
    echo "  1. Store the secret in your organizational password vault"
    echo "     Label: MRKETOZ_SHARED_SECRET-$(date +%Y%m%d)"
    echo "     Include: Rotation date, operator name, purpose"
    echo ""
    echo "  2. The secret will be set in Cloudflare via wrangler"
    echo "  3. The secret will be set in GitHub via gh CLI"
    echo "  4. Update wrangler.toml if KV namespace changes"
    echo "  5. Deploy the updated configuration"
    echo "  6. Notify team members to update local environments"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
}

################################################################################
# Update Cloudflare Secret
################################################################################

update_cloudflare_secret() {
    log_info "Updating Cloudflare secret via wrangler..."
    
    if [[ "$DRY_RUN" == "1" ]]; then
        echo "[DRY RUN] Would execute: echo \"\$NEW_SECRET\" | wrangler secret put MRKETOZ_SHARED_SECRET"
        return
    fi
    
    # Use echo with pipe to avoid exposing secret in process list
    if echo "$NEW_SECRET" | wrangler secret put MRKETOZ_SHARED_SECRET; then
        log_success "Cloudflare secret updated successfully"
    else
        log_error "Failed to update Cloudflare secret"
        exit 1
    fi
}

################################################################################
# Update GitHub Secret
################################################################################

update_github_secret() {
    log_info "Updating GitHub repository secret via gh CLI..."
    
    if [[ "$DRY_RUN" == "1" ]]; then
        echo "[DRY RUN] Would execute: gh secret set MRKETOZ_SHARED_SECRET"
        return
    fi
    
    # Use echo with pipe to avoid exposing secret in process list
    if echo "$NEW_SECRET" | gh secret set MRKETOZ_SHARED_SECRET; then
        log_success "GitHub secret updated successfully"
    else
        log_error "Failed to update GitHub secret"
        exit 1
    fi
}

################################################################################
# Create Recovery KV Namespace
################################################################################

create_recovery_namespace() {
    log_info "Creating recovery KV namespace..."
    
    if [[ "$DRY_RUN" == "1" ]]; then
        echo "[DRY RUN] Would execute: wrangler kv:namespace create SNAPSHOT_KV_BACKUP"
        return
    fi
    
    log_info "Creating backup KV namespace for disaster recovery..."
    
    if wrangler kv:namespace create "SNAPSHOT_KV_BACKUP"; then
        log_success "Recovery KV namespace created"
        echo ""
        log_warning "IMPORTANT: Update wrangler.toml with the new namespace ID"
        echo "Add the following to your wrangler.toml:"
        echo ""
        echo "[[kv_namespaces]]"
        echo "binding = \"SNAPSHOT_KV_BACKUP\""
        echo "id = \"<namespace-id-from-output-above>\""
        echo ""
    else
        log_warning "KV namespace creation skipped or failed (may already exist)"
    fi
}

################################################################################
# Post-Rotation Guidance
################################################################################

display_post_rotation_guidance() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "  POST-ROTATION STEPS"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    echo "✓ Secret generated and stored (verify in vault!)"
    echo "✓ Cloudflare secret updated"
    echo "✓ GitHub secret updated"
    echo "✓ Recovery KV namespace created (if applicable)"
    echo ""
    echo "📝 NEXT STEPS:"
    echo ""
    echo "  1. Verify secret is stored in password vault"
    echo ""
    echo "  2. Update wrangler.toml if KV namespace was created"
    echo ""
    echo "  3. Deploy the updated configuration:"
    echo "     $ wrangler pages publish"
    echo ""
    echo "  4. Test the endpoint with new secret:"
    echo "     $ MRKETOZ_SHARED_SECRET=\"\$NEW_SECRET\" \\"
    echo "       SNAPSHOT_FILE=\"test.json\" \\"
    echo "       ./scripts/restore-snapshot.sh"
    echo ""
    echo "  5. Monitor for errors for 1 hour:"
    echo "     - Check Cloudflare function logs"
    echo "     - Verify no 401 errors from legitimate clients"
    echo "     - Confirm snapshot uploads succeed"
    echo ""
    echo "  6. Notify team members:"
    echo "     - Update local .env files"
    echo "     - Update CI/CD pipeline secrets"
    echo "     - Update monitoring systems"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
}

################################################################################
# Confirmation Prompt
################################################################################

confirm_rotation() {
    if [[ "$DRY_RUN" == "1" ]]; then
        log_info "DRY RUN mode - skipping confirmation"
        return
    fi
    
    echo ""
    log_warning "This will rotate the MRKETOZ_SHARED_SECRET"
    echo ""
    echo "This will affect:"
    echo "  - All clients using HMAC authentication"
    echo "  - Cloudflare Pages Functions environment"
    echo "  - GitHub Actions workflows"
    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Rotation cancelled by operator"
        exit 0
    fi
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "  MRKETOZ Shared Secret Rotation Script"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    
    if [[ "$DRY_RUN" == "1" ]]; then
        log_info "Running in DRY RUN mode - no changes will be made"
        echo ""
    fi
    
    # Run preflight checks
    preflight_checks
    
    # Confirm with operator
    confirm_rotation
    
    # Generate new secret
    generate_secret
    
    # Display operator instructions
    display_operator_instructions
    
    # Pause for operator to read instructions
    if [[ "$DRY_RUN" != "1" ]]; then
        read -p "Press ENTER to continue with secret rotation..." -r
        echo ""
    fi
    
    # Update secrets in Cloudflare
    update_cloudflare_secret
    
    # Update secrets in GitHub
    update_github_secret
    
    # Create recovery namespace
    create_recovery_namespace
    
    # Display post-rotation guidance
    display_post_rotation_guidance
    
    log_success "Secret rotation completed successfully!"
    
    # Cleanup sensitive variable
    unset NEW_SECRET
}

# Execute main function
main "$@"
