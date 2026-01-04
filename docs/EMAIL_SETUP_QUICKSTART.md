# Email Setup Quick Start Guide

This guide provides a quick overview of setting up Google Workspace email for designfitout.com.

## Prerequisites

- [ ] Google Workspace subscription active
- [ ] Admin access to Google Workspace
- [ ] Cloudflare account with DNS access
- [ ] CF_API_TOKEN from Cloudflare
- [ ] ZONE_ID for designfitout.com

## Quick Setup (5-10 minutes)

### 1. Set Environment Variables

```bash
export CF_API_TOKEN="your-cloudflare-api-token"
export ZONE_ID="your-cloudflare-zone-id"
```

**Get CF_API_TOKEN:**
- Go to https://dash.cloudflare.com/profile/api-tokens
- Create Token → Edit zone DNS template
- Include zone: designfitout.com

**Get ZONE_ID:**
- Go to https://dash.cloudflare.com
- Select designfitout.com domain
- Copy Zone ID from right sidebar

### 2. Run DNS Setup Script

```bash
./scripts/cf_dns_setup.sh
```

This creates:
- 5 MX records (Google Workspace)
- SPF TXT record
- DMARC TXT record (p=none)
- MTA-STS TXT record

### 3. Verify Domain in Google Workspace

1. Go to https://admin.google.com
2. Navigate to **Account → Domains → Manage domains**
3. Add/verify designfitout.com
4. Add verification TXT record to Cloudflare
5. Click **Verify** in Google Admin Console

### 4. Enable DKIM

1. In Google Admin Console, go to **Apps → Google Workspace → Gmail**
2. Click **Authenticate email**
3. Generate new DKIM record (2048 bits recommended)
4. Add DKIM TXT record to Cloudflare DNS:
   - Name: `google._domainkey.designfitout.com`
   - Content: (provided by Google)
   - Proxied: No

### 5. Deploy MTA-STS Policy

Deploy `functions/.well-known/mta-sts.txt.ts` to Cloudflare Pages:

```bash
# Using Wrangler
npx wrangler pages deploy . --project-name=designfitout

# Or connect GitHub repo to Cloudflare Pages dashboard
```

Ensure `mta-sts.designfitout.com` points to your Cloudflare Pages deployment.

### 6. Verify Setup

```bash
./scripts/verify_email_setup.sh
```

All checks should pass (✓) after 5-10 minutes.

## Testing

1. Send test email from `@designfitout.com`
2. Receive test email to `@designfitout.com`
3. Check email headers for SPF/DKIM/DMARC pass
4. Monitor DMARC reports at `dmarc@designfitout.com`

## DMARC Policy Evolution

**Week 1-2: Monitoring**
```
v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com
```
- Current policy (set by script)
- Monitor reports, no enforcement

**Week 3-4: Quarantine**
```
v=DMARC1; p=quarantine; pct=10; rua=mailto:dmarc@designfitout.com
```
- Gradually increase `pct` from 10 → 100

**Week 5+: Reject**
```
v=DMARC1; p=reject; rua=mailto:dmarc@designfitout.com
```
- Full enforcement

## Troubleshooting

### DNS not propagating
```bash
# Check specific DNS server
dig @8.8.8.8 MX designfitout.com
dig @1.1.1.1 TXT designfitout.com

# Wait 5-10 minutes and retry
```

### Emails going to spam
- Verify DKIM is enabled (24-48 hour activation)
- Check SPF alignment in email headers
- Monitor domain reputation: https://postmaster.google.com/

### MTA-STS policy not accessible
```bash
# Test endpoint
curl https://mta-sts.designfitout.com/.well-known/mta-sts.txt

# Check SSL certificate
openssl s_client -servername mta-sts.designfitout.com -connect mta-sts.designfitout.com:443
```

## Documentation

- **Comprehensive Guide:** `docs/GoogleWorkspaceSetup.md`
- **DNS Records Reference:** `infra/DNS/PROD-records.md`
- **Verification Script:** `scripts/verify_email_setup.sh`
- **DNS Setup Script:** `scripts/cf_dns_setup.sh`

## Support

- Google Workspace: https://support.google.com/a
- Cloudflare: https://support.cloudflare.com
- Repository Issues: https://github.com/support-designfitout/Designfitout-Github/issues

## Timeline

- **Day 1:** DNS setup (10 minutes)
- **Day 1:** Google domain verification (30 minutes)
- **Day 1-2:** DKIM activation (24-48 hours)
- **Week 1-2:** DMARC monitoring
- **Week 3-4:** DMARC quarantine testing
- **Week 5+:** DMARC full enforcement

---

**Total setup time:** ~1 hour active work + 1-2 days for DNS/DKIM propagation
