# Email Setup Scripts

Automation scripts for configuring Google Workspace email with Cloudflare DNS.

## Overview

This directory contains scripts for:
- **DNS Configuration**: Automated setup of MX, SPF, DMARC, and MTA-STS records
- **Verification**: Comprehensive validation of email setup

## Prerequisites

### Required Tools
- `curl` - HTTP client for API calls
- `jq` - JSON processor
- `dig` (dnsutils) - DNS lookups
- `openssl` - TLS certificate checks

### Required Credentials
- **Cloudflare API Token**: With DNS Edit permissions
- **Zone ID**: For your domain (designfitout.com)

### Getting Cloudflare Credentials

**API Token** (Recommended):
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Edit zone DNS**
4. Set Zone Resources: Include → Specific zone → designfitout.com
5. Copy and save the token securely

**Zone ID**:
1. Go to: https://dash.cloudflare.com
2. Select **designfitout.com**
3. Find Zone ID in the right sidebar under **API** section

## Scripts

### 1. cf_dns_setup.sh

Configures all required DNS records for Google Workspace email.

**What it does**:
- Creates 5 MX records (Google Workspace mail servers)
- Configures SPF record (authorize Google to send email)
- Configures DMARC record (email authentication policy)
- Configures MTA-STS TXT record (SMTP security)
- Idempotently checks for existing records
- Prompts for confirmation before making changes

**Usage**:
```bash
# Set credentials
export CF_API_TOKEN="your_cloudflare_api_token_here"
export ZONE_ID="your_zone_id_here"

# Run script
./scripts/cf_dns_setup.sh
```

**Features**:
- ✅ Idempotent (safe to run multiple times)
- ✅ Interactive confirmation prompts
- ✅ Color-coded output
- ✅ Detailed error messages
- ✅ Uses environment variables (no hardcoded secrets)

**Records Created**:
- 5 MX records with priorities (1, 5, 5, 10, 10)
- SPF: `v=spf1 include:_spf.google.com ~all`
- DMARC: `v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com`
- MTA-STS: `v=STSv1; id=2025-11-09`

**Exit Codes**:
- `0` - Success
- `1` - Missing prerequisites or API error

---

### 2. verify_email_setup.sh

Comprehensive verification of email DNS and configuration.

**What it does**:
- Verifies MX records
- Checks SPF record and policy
- Validates DMARC record and configuration
- Searches for DKIM records (common selectors)
- Tests MTA-STS DNS record
- Fetches and validates MTA-STS policy file
- Checks TLS certificate for mta-sts subdomain
- Optional: Tests SMTP connectivity (requires `swaks`)

**Usage**:
```bash
# No credentials required for DNS checks
./scripts/verify_email_setup.sh
```

**Features**:
- ✅ No credentials required
- ✅ Color-coded results (green/yellow/red)
- ✅ Detailed guidance messages
- ✅ Exit code indicates pass/fail
- ✅ Checks both DNS and HTTPS endpoints

**Exit Codes**:
- `0` - All critical checks passed
- `1` - One or more critical checks failed

**Example Output**:
```
═══ MX Records (Mail Servers) ═══
✅ MX records found:
  Priority 1: aspmx.l.google.com.
  Priority 5: alt1.aspmx.l.google.com.
  ...

═══ SPF Record ═══
✅ SPF record found:
  v=spf1 include:_spf.google.com ~all
✅ SPF includes Google Workspace
```

---

## Quick Start Guide

### 1. Install Dependencies
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y curl jq dnsutils openssl

# macOS
brew install curl jq bind openssl

# Optional: SMTP testing
sudo apt-get install -y swaks  # Ubuntu/Debian
brew install swaks             # macOS
```

### 2. Configure DNS Records
```bash
# Set environment variables
export CF_API_TOKEN="your_token_here"
export ZONE_ID="your_zone_id_here"

# Run DNS setup
cd /path/to/repository
./scripts/cf_dns_setup.sh
```

### 3. Wait for DNS Propagation
Wait 5-10 minutes for DNS changes to propagate globally.

### 4. Verify Setup
```bash
# Run verification
./scripts/verify_email_setup.sh
```

### 5. Complete Google Workspace Setup
Follow the steps in `docs/GoogleWorkspaceSetup.md`:
- Verify domain ownership
- Generate and add DKIM key
- Monitor DMARC reports
- Tune DMARC policy (p=none → p=quarantine → p=reject)

---

## Troubleshooting

### DNS Setup Script Issues

**Error: "Required tool 'X' is not installed"**
- Install missing tools (see Quick Start Guide above)

**Error: "Authentication required!"**
- Set `CF_API_TOKEN` or `CF_API_KEY`/`CF_EMAIL` environment variables
- Verify token has DNS Edit permissions

**Error: "ZONE_ID environment variable is required!"**
- Get Zone ID from Cloudflare Dashboard
- Export: `export ZONE_ID="your_zone_id"`

**API errors when creating records**
- Verify API token permissions (need DNS Edit)
- Check Zone ID is correct
- Ensure domain is active on Cloudflare

### Verification Script Issues

**Error: "No MX records found"**
- DNS may not have propagated yet (wait 5-10 minutes)
- Run DNS setup script first
- Check records in Cloudflare Dashboard

**Warning: "DKIM record not found"**
- Generate DKIM key in Google Admin Console first
- Add DKIM TXT record to Cloudflare DNS
- See `docs/GoogleWorkspaceSetup.md` for instructions

**Error: "Failed to connect to MTA-STS policy endpoint"**
- Ensure `mta-sts.designfitout.com` DNS record exists
- Deploy Cloudflare Pages Function (`functions/.well-known/mta-sts.txt.ts`)
- Verify HTTPS is configured with valid certificate

### General DNS Issues

**DNS not propagating**
- Wait up to 1 hour for full propagation
- Check TTL values (lower = faster propagation)
- Test from different networks/locations
- Use online tools: https://dnschecker.org/

**MX records not working**
- Ensure MX records are **NOT** proxied (must be DNS-only)
- Verify MX priorities are correct (1, 5, 5, 10, 10)
- Check for typos in server names

---

## Security Best Practices

### Environment Variables
- ✅ Always use environment variables for credentials
- ✅ Never commit credentials to git
- ✅ Use `.env` files locally (add to `.gitignore`)
- ✅ Store in GitHub Secrets for CI/CD

### API Token Permissions
- ✅ Use token-based auth (more secure than Global API Key)
- ✅ Limit token scope to specific zone
- ✅ Set token permissions to DNS Edit only
- ✅ Rotate tokens regularly

### Testing
- ✅ Test scripts in non-production environment first
- ✅ Review changes before confirming
- ✅ Keep DNS record backups
- ✅ Lower TTL before making changes

---

## Related Documentation

- **Complete Setup Guide**: [`docs/GoogleWorkspaceSetup.md`](../docs/GoogleWorkspaceSetup.md)
- **DNS Records Reference**: [`infra/DNS/PROD-records.md`](../infra/DNS/PROD-records.md)
- **MTA-STS Policy**: [`functions/.well-known/mta-sts.txt.ts`](../functions/.well-known/mta-sts.txt.ts)
- **GitHub Actions Workflow**: [`.github/workflows/email-setup-verify.yml`](../.github/workflows/email-setup-verify.yml)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `docs/GoogleWorkspaceSetup.md`
3. Check Cloudflare DNS dashboard
4. Review Google Workspace Admin Console
5. Contact repository maintainers

---

**Last Updated**: 2025-11-09  
**Maintained By**: DevOps Team
