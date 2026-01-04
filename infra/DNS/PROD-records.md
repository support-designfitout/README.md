# Production DNS Records for designfitout.com

This document details the DNS records required for production deployment of designfitout.com, including email (Google Workspace), web hosting, and security configurations.

## Table of Contents

- [MX Records (Email Routing)](#mx-records-email-routing)
- [TXT Records (Email Authentication)](#txt-records-email-authentication)
- [A Records (Web Hosting)](#a-records-web-hosting)
- [MTA-STS Configuration](#mta-sts-configuration)
- [Cloudflare Proxy Recommendations](#cloudflare-proxy-recommendations)
- [TTL Configuration](#ttl-configuration)

---

## MX Records (Email Routing)

Google Workspace requires five MX records for optimal mail delivery and redundancy:

| Type | Name | Content | Priority | TTL | Proxied |
|------|------|---------|----------|-----|---------|
| MX | designfitout.com | aspmx.l.google.com | 1 | 3600 | ❌ DNS only |
| MX | designfitout.com | alt1.aspmx.l.google.com | 5 | 3600 | ❌ DNS only |
| MX | designfitout.com | alt2.aspmx.l.google.com | 5 | 3600 | ❌ DNS only |
| MX | designfitout.com | alt3.aspmx.l.google.com | 10 | 3600 | ❌ DNS only |
| MX | designfitout.com | alt4.aspmx.l.google.com | 10 | 3600 | ❌ DNS only |

**Notes:**
- MX records **MUST NOT** be proxied through Cloudflare
- Priority values determine mail server preference (lower = higher priority)
- Primary server (priority 1) handles most email traffic
- Alternative servers provide redundancy and load balancing

---

## TXT Records (Email Authentication)

### SPF (Sender Policy Framework)

Authorizes Google Workspace to send email on behalf of designfitout.com:

| Type | Name | Content | TTL | Proxied |
|------|------|---------|-----|---------|
| TXT | designfitout.com | `v=spf1 include:_spf.google.com ~all` | 3600 | ❌ DNS only |

**Explanation:**
- `v=spf1` - SPF version 1
- `include:_spf.google.com` - Allow Google's mail servers
- `~all` - Soft fail for other servers (recommended for initial setup)
- Consider changing to `-all` (hard fail) after confirming setup

### DMARC (Domain-based Message Authentication, Reporting & Conformance)

Email authentication and reporting policy:

| Type | Name | Content | TTL | Proxied |
|------|------|---------|-----|---------|
| TXT | _dmarc.designfitout.com | `v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s` | 3600 | ❌ DNS only |

**Explanation:**
- `v=DMARC1` - DMARC version 1
- `p=none` - Policy: monitor mode (no enforcement)
- `rua=mailto:dmarc@designfitout.com` - Aggregate reports destination
- `pct=100` - Apply policy to 100% of messages
- `adkim=s` - Strict DKIM alignment
- `aspf=s` - Strict SPF alignment

**Policy Progression:**
1. **Phase 1 (Initial):** `p=none` - Monitor and collect data
2. **Phase 2 (Testing):** `p=quarantine` - Send suspicious email to spam
3. **Phase 3 (Production):** `p=reject` - Block unauthorized email

### DKIM (DomainKeys Identified Mail)

**Note:** DKIM records must be generated in Google Workspace Admin Console. Example format:

| Type | Name | Content | TTL | Proxied |
|------|------|---------|-----|---------|
| TXT | selector1._domainkey.designfitout.com | `v=DKIM1; k=rsa; p=MIIBIjANBg...` | 3600 | ❌ DNS only |

**Steps to generate DKIM:**
1. Log in to [Google Workspace Admin Console](https://admin.google.com)
2. Navigate to Apps > Google Workspace > Gmail > Authenticate email
3. Click "Generate new record"
4. Select 2048-bit key length (recommended)
5. Copy the TXT record provided
6. Add to DNS with the selector name (e.g., `google._domainkey` or `selector1._domainkey`)

---

## MTA-STS Configuration

MTA-STS (Mail Transfer Agent Strict Transport Security) enforces TLS for email delivery:

### DNS Record

| Type | Name | Content | TTL | Proxied |
|------|------|---------|-----|---------|
| TXT | _mta-sts.designfitout.com | `v=STSv1; id=2025-11-09` | 3600 | ❌ DNS only |

**Note:** Update the `id` value when changing the MTA-STS policy file.

### A Record for MTA-STS Subdomain

| Type | Name | Content | TTL | Proxied |
|------|------|---------|-----|---------|
| A | mta-sts.designfitout.com | [Your Cloudflare IP or origin IP] | 3600 | ✅ Proxied* |

**Important:**
- The MTA-STS subdomain serves a policy file at `https://mta-sts.designfitout.com/.well-known/mta-sts.txt`
- Can be proxied through Cloudflare if using Cloudflare Pages Functions
- Must have valid SSL/TLS certificate (automatic with Cloudflare)
- Policy file is served by the Cloudflare Pages Function in this repository

### MTA-STS Policy File Content

The policy is served by `functions/.well-known/mta-sts.txt.ts`:

```
version: STSv1
mode: enforce
mx: *.gmail.com
mx: *.google.com
max_age: 86400
```

---

## A Records (Web Hosting)

Root domain and www subdomain:

| Type | Name | Content | TTL | Proxied |
|------|------|---------|-----|---------|
| A | designfitout.com | [Your origin IP or Cloudflare IP] | 3600 | ✅ Proxied (Recommended) |
| A | www.designfitout.com | [Your origin IP or Cloudflare IP] | 3600 | ✅ Proxied (Recommended) |

**Notes:**
- Proxied A records benefit from Cloudflare CDN, DDoS protection, and caching
- Ensure you have a valid SSL/TLS certificate (Cloudflare provides free Edge certificates)
- Configure appropriate Page Rules for caching and redirects

---

## Cloudflare Proxy Recommendations

| Record Type | Proxied | Reason |
|-------------|---------|--------|
| **MX** | ❌ **NO** | Email delivery requires direct DNS resolution to Google servers |
| **TXT (SPF/DMARC/DKIM)** | ❌ **NO** | Email authentication records must be directly accessible |
| **TXT (_mta-sts)** | ❌ **NO** | MTA-STS DNS record must be directly accessible |
| **A (root/www)** | ✅ **YES** | Web traffic benefits from CDN, caching, and DDoS protection |
| **A (mta-sts)** | ✅ **YES*** | Can be proxied when served via Cloudflare Pages Functions |

**\*Caveat for mta-sts subdomain:**
- If using Cloudflare Pages Functions to serve the MTA-STS policy, proxying is recommended
- Ensures policy is always accessible with valid certificate
- If using external origin server, evaluate based on your setup

---

## TTL Configuration

All records use a TTL of **3600 seconds (1 hour)**:

**Benefits:**
- ✅ Fast enough for production changes (1 hour propagation)
- ✅ Reduces unnecessary DNS queries
- ✅ Provides good balance between flexibility and caching

**When to adjust:**
- **Shorter TTL (300-600s):** During migration or when making frequent changes
- **Longer TTL (86400s):** For stable records that rarely change (consider after setup is complete)

---

## Terraform Configuration Example

For infrastructure-as-code deployment:

```hcl
# MX Records
resource "cloudflare_record" "mx_primary" {
  zone_id  = var.zone_id
  name     = "@"
  type     = "MX"
  value    = "aspmx.l.google.com"
  priority = 1
  ttl      = 3600
  proxied  = false
}

resource "cloudflare_record" "mx_alt1" {
  zone_id  = var.zone_id
  name     = "@"
  type     = "MX"
  value    = "alt1.aspmx.l.google.com"
  priority = 5
  ttl      = 3600
  proxied  = false
}

# SPF Record
resource "cloudflare_record" "spf" {
  zone_id = var.zone_id
  name    = "@"
  type    = "TXT"
  value   = "v=spf1 include:_spf.google.com ~all"
  ttl     = 3600
  proxied = false
}

# DMARC Record
resource "cloudflare_record" "dmarc" {
  zone_id = var.zone_id
  name    = "_dmarc"
  type    = "TXT"
  value   = "v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s"
  ttl     = 3600
  proxied = false
}

# MTA-STS DNS Record
resource "cloudflare_record" "mta_sts" {
  zone_id = var.zone_id
  name    = "_mta-sts"
  type    = "TXT"
  value   = "v=STSv1; id=2025-11-09"
  ttl     = 3600
  proxied = false
}
```

---

## Verification Commands

After configuring DNS records, verify with these commands:

```bash
# MX Records
dig MX designfitout.com +short

# SPF Record
dig TXT designfitout.com +short | grep spf

# DMARC Record
dig TXT _dmarc.designfitout.com +short

# MTA-STS DNS
dig TXT _mta-sts.designfitout.com +short

# MTA-STS Policy
curl https://mta-sts.designfitout.com/.well-known/mta-sts.txt

# Comprehensive verification
./scripts/verify_email_setup.sh
```

---

## Additional Resources

- [Google Workspace MX Records](https://support.google.com/a/answer/174125)
- [SPF Record Syntax](https://datatracker.ietf.org/doc/html/rfc7208)
- [DMARC Overview](https://dmarc.org/)
- [MTA-STS RFC 8461](https://datatracker.ietf.org/doc/html/rfc8461)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [MXToolbox](https://mxtoolbox.com/) - DNS and email diagnostics

---

## Troubleshooting

### Email Not Receiving

1. Verify MX records: `dig MX designfitout.com +short`
2. Check MX priorities are correct (1, 5, 5, 10, 10)
3. Ensure MX records are NOT proxied in Cloudflare
4. Wait for DNS propagation (up to 48 hours, typically 30 minutes)
5. Test with [MXToolbox](https://mxtoolbox.com/SuperTool.aspx?action=mx%3adesignfitout.com)

### Email Marked as Spam

1. Verify SPF record exists and includes Google
2. Configure and verify DKIM in Google Workspace Admin
3. Check DMARC record is present
4. Send test emails and check headers for authentication results
5. Ensure reverse DNS (PTR) is configured correctly

### MTA-STS Policy Not Loading

1. Verify DNS record: `dig TXT _mta-sts.designfitout.com +short`
2. Check HTTPS endpoint: `curl -I https://mta-sts.designfitout.com/.well-known/mta-sts.txt`
3. Verify SSL certificate is valid
4. Ensure Cloudflare Pages Function is deployed
5. Check policy file syntax matches RFC 8461

---

**Last Updated:** 2025-11-09  
**Maintained by:** DevOps Team  
**Review Schedule:** Quarterly or after major infrastructure changes
