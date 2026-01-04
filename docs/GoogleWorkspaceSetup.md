# Google Workspace Setup Guide for designfitout.com

This guide provides step-by-step instructions for setting up and configuring Google Workspace email for the `designfitout.com` domain.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Domain Verification](#domain-verification)
3. [MX Records Configuration](#mx-records-configuration)
4. [DKIM Setup](#dkim-setup)
5. [SPF Configuration](#spf-configuration)
6. [DMARC Setup and Tuning](#dmarc-setup-and-tuning)
7. [MTA-STS Configuration](#mta-sts-configuration)
8. [Post-Setup Verification](#post-setup-verification)
9. [Testing Email Delivery](#testing-email-delivery)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Active Google Workspace subscription
- ✅ Admin access to Google Workspace Admin Console
- ✅ Domain ownership of designfitout.com
- ✅ Cloudflare account with DNS management access
- ✅ Cloudflare API token or API key (for automation)
- ✅ This repository cloned locally

**Required Environment Variables:**
```bash
export CF_API_TOKEN="your-cloudflare-api-token"
export ZONE_ID="your-cloudflare-zone-id"
```

---

## Domain Verification

Domain verification proves to Google that you own designfitout.com.

### Step 1: Access Google Admin Console

1. Navigate to [Google Admin Console](https://admin.google.com)
2. Sign in with your Google Workspace admin account
3. Go to **Account → Domains → Manage domains**
4. Click **Add a domain** or select existing domain

### Step 2: Choose Verification Method

Google offers multiple verification methods. **TXT record** is recommended:

#### Option A: TXT Record Verification (Recommended)

1. Google will provide a TXT record like:
   ```
   google-site-verification=AbCdEfGhIjKlMnOpQrStUvWxYz123456789
   ```

2. Add this TXT record to Cloudflare DNS:
   - **Type:** TXT
   - **Name:** `designfitout.com` or `@`
   - **Content:** `google-site-verification=<provided-value>`
   - **TTL:** 3600
   - **Proxied:** No (DNS-only)

3. **Manual Method:**
   - Log in to Cloudflare Dashboard
   - Select designfitout.com domain
   - Go to DNS settings
   - Add TXT record with values above

4. **Automated Method:**
   ```bash
   # Using Cloudflare API (replace values)
   curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
     -H "Authorization: Bearer ${CF_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{
       "type": "TXT",
       "name": "designfitout.com",
       "content": "google-site-verification=YOUR_VERIFICATION_CODE",
       "ttl": 3600,
       "proxied": false
     }'
   ```

#### Option B: HTML File Upload

Upload verification file to your website root:
- Not recommended if using Cloudflare Pages/Workers
- Only use if you have direct web server access

#### Option C: Domain Name Provider

Link Cloudflare account (less common)

### Step 3: Verify Ownership

1. Wait 5-10 minutes for DNS propagation
2. Verify TXT record is live:
   ```bash
   dig +short TXT designfitout.com | grep google-site-verification
   ```
3. In Google Admin Console, click **Verify**
4. If successful, you'll see "Domain verified" message

**Troubleshooting:**
- DNS propagation can take up to 48 hours (usually < 1 hour)
- Use [Google's TXT record checker](https://toolbox.googleapps.com/apps/dig/#TXT/)
- Ensure no typos in verification code

---

## MX Records Configuration

MX records route email to Google's mail servers.

### Automated Setup (Recommended)

Run the provided script:
```bash
./scripts/cf_dns_setup.sh
```

This script will:
- Check prerequisites
- Prompt for confirmation
- Create/update all required DNS records including MX records

### Manual Setup

If you prefer manual configuration:

1. **Log in to Cloudflare Dashboard**
2. **Navigate to DNS settings** for designfitout.com
3. **Remove any existing MX records** (if present)
4. **Add Google Workspace MX records:**

| Priority | Mail Server |
|----------|-------------|
| 1 | aspmx.l.google.com |
| 5 | alt1.aspmx.l.google.com |
| 5 | alt2.aspmx.l.google.com |
| 10 | alt3.aspmx.l.google.com |
| 10 | alt4.aspmx.l.google.com |

**Important:**
- **Name:** `designfitout.com` or `@` (root domain)
- **TTL:** 3600 (1 hour)
- **Proxied:** ❌ No (must be DNS-only / grey cloud)

### Verification

Wait 5-10 minutes, then verify:
```bash
dig +short MX designfitout.com
```

Expected output:
```
1 aspmx.l.google.com.
5 alt1.aspmx.l.google.com.
5 alt2.aspmx.l.google.com.
10 alt3.aspmx.l.google.com.
10 alt4.aspmx.l.google.com.
```

### Google Admin Console Verification

1. Go to **Apps → Google Workspace → Gmail → Email authentication**
2. Google will automatically detect MX records
3. Status should show "Active" within a few hours

---

## DKIM Setup

DKIM (DomainKeys Identified Mail) digitally signs outgoing emails to prevent spoofing.

### Step 1: Generate DKIM Key in Google Admin Console

1. Navigate to [Google Admin Console](https://admin.google.com)
2. Go to **Apps → Google Workspace → Gmail**
3. Click **Authenticate email**
4. Select **Generate new record**

### Step 2: Configure DKIM Settings

**Recommended Configuration:**
- **Prefix selector:** `google` (default) or custom
- **DKIM key bit length:** **2048 bits** (recommended for security)
  - ⚠️ Avoid 1024 bits (legacy, less secure)
  - 2048 bits provides stronger cryptographic protection

### Step 3: Copy DNS Record Values

Google will provide:
- **DNS Host Name:** `google._domainkey.designfitout.com`
- **TXT Record Value:** Long string starting with `v=DKIM1; k=rsa; p=...`

**Example:**
```
DNS Host Name: google._domainkey
TXT Record Value: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx1...
```

### Step 4: Add DKIM TXT Record to Cloudflare

**Manual Method:**
1. Log in to Cloudflare Dashboard
2. Go to DNS settings for designfitout.com
3. Add TXT record:
   - **Type:** TXT
   - **Name:** `google._domainkey` (or full: `google._domainkey.designfitout.com`)
   - **Content:** Paste the TXT record value from Google (entire string)
   - **TTL:** 3600
   - **Proxied:** ❌ No (DNS-only)

**Automated Method:**
```bash
# Export the DKIM public key value
export DKIM_VALUE="v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_HERE"

# Add DKIM TXT record
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\": \"TXT\",
    \"name\": \"google._domainkey.designfitout.com\",
    \"content\": \"${DKIM_VALUE}\",
    \"ttl\": 3600,
    \"proxied\": false
  }"
```

### Step 5: Verify DKIM Record

Wait 5-10 minutes for DNS propagation:
```bash
dig +short TXT google._domainkey.designfitout.com
```

Expected output (truncated):
```
"v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg..."
```

### Step 6: Enable DKIM Signing in Google

1. Return to Google Admin Console → **Authenticate email**
2. Click **Start authentication** next to your DKIM record
3. Wait 24-48 hours for Google to begin signing emails
4. Status will change to "Authenticating email"

**Verification:**
- Send a test email to yourself
- View email headers
- Look for `DKIM-Signature:` header with `d=designfitout.com`

---

## SPF Configuration

SPF (Sender Policy Framework) specifies authorized mail servers.

### Automated Setup

The `cf_dns_setup.sh` script automatically configures SPF.

### Manual Setup

Add SPF TXT record to Cloudflare:
- **Type:** TXT
- **Name:** `designfitout.com` or `@`
- **Content:** `v=spf1 include:_spf.google.com ~all`
- **TTL:** 3600
- **Proxied:** No

### SPF Record Explained

```
v=spf1 include:_spf.google.com ~all
```

- `v=spf1` - SPF version 1
- `include:_spf.google.com` - Authorize Google's mail servers
- `~all` - Soft fail (recommended for initial deployment)
  - Unauthorized servers marked as suspicious but not rejected
  - Use `-all` for hard fail (strict) after testing

### Additional SPF Mechanisms

If you send email from other services (e.g., SendGrid, Mailchimp):
```
v=spf1 include:_spf.google.com include:sendgrid.net ~all
```

### Verification

```bash
dig +short TXT designfitout.com | grep spf
```

Expected output:
```
"v=spf1 include:_spf.google.com ~all"
```

### Testing SPF

Use [MXToolbox SPF Checker](https://mxtoolbox.com/spf.aspx):
- Enter: `designfitout.com`
- Verify: "Valid SPF record" with Google servers authorized

---

## DMARC Setup and Tuning

DMARC (Domain-based Message Authentication, Reporting & Conformance) builds on SPF and DKIM.

### Phase 1: Monitoring (Week 1-2)

**Goal:** Collect data without enforcing policy

1. **Create DMARC mailbox:**
   - Set up `dmarc@designfitout.com` in Google Workspace
   - This will receive aggregate reports

2. **Add initial DMARC record:**
   - **Type:** TXT
   - **Name:** `_dmarc.designfitout.com` or `_dmarc`
   - **Content:** `v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com`
   - **TTL:** 3600
   - **Proxied:** No

**Record Explanation:**
```
v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com
```
- `v=DMARC1` - DMARC version
- `p=none` - No enforcement (monitoring only)
- `rua=mailto:dmarc@designfitout.com` - Send aggregate reports here

**What to Do:**
- Monitor daily DMARC reports (XML format)
- Identify all legitimate email sources
- Ensure SPF and DKIM pass for legitimate emails
- Use [DMARC analyzer tools](https://dmarcian.com/) to parse reports

### Phase 2: Quarantine (Week 3-4)

**Goal:** Begin soft enforcement

1. **Update DMARC record:**
   ```
   v=DMARC1; p=quarantine; pct=10; rua=mailto:dmarc@designfitout.com
   ```
   - `p=quarantine` - Failed emails go to spam
   - `pct=10` - Apply to 10% of messages

2. **Gradual Rollout:**
   - Week 1: `pct=10`
   - Week 2: `pct=25`
   - Week 3: `pct=50`
   - Week 4: `pct=100`

3. **Monitor reports:**
   - Check for legitimate emails in quarantine
   - Adjust SPF/DKIM if needed
   - Fix any misconfigurations

### Phase 3: Reject (Week 5+)

**Goal:** Full enforcement

1. **Update DMARC record:**
   ```
   v=DMARC1; p=reject; rua=mailto:dmarc@designfitout.com; ruf=mailto:dmarc-forensic@designfitout.com
   ```
   - `p=reject` - Failed emails rejected outright
   - `ruf=mailto:dmarc-forensic@designfitout.com` - Forensic (failure) reports

2. **Optional Enhancements:**
   ```
   v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; pct=100; rua=mailto:dmarc@designfitout.com; ruf=mailto:dmarc-forensic@designfitout.com
   ```
   - `sp=reject` - Policy for subdomains
   - `adkim=s` - Strict DKIM alignment
   - `aspf=s` - Strict SPF alignment
   - `pct=100` - Apply to 100% of messages

### DMARC Record Verification

```bash
dig +short TXT _dmarc.designfitout.com
```

### DMARC Report Analysis

**Tools:**
- [Dmarcian](https://dmarcian.com/)
- [Postmark DMARC Digests](https://dmarc.postmarkapp.com/)
- [MXToolbox DMARC](https://mxtoolbox.com/dmarc.aspx)

**What to Look For:**
- **Pass rate:** Should be close to 100% for legitimate email
- **Fail sources:** Investigate unauthorized senders
- **Alignment:** Ensure SPF and DKIM align with From: domain

---

## MTA-STS Configuration

MTA-STS (Mail Transfer Agent Strict Transport Security) enforces TLS encryption.

### Step 1: Add MTA-STS TXT Record

The `cf_dns_setup.sh` script handles this automatically.

**Manual Setup:**
- **Type:** TXT
- **Name:** `_mta-sts.designfitout.com` or `_mta-sts`
- **Content:** `v=STSv1; id=2025-11-09`
- **TTL:** 3600
- **Proxied:** No

**Policy ID Guidelines:**
- Update `id` whenever policy changes
- Use date format: `YYYY-MM-DD` or timestamp
- Forces mail servers to re-fetch policy

### Step 2: Create MTA-STS Subdomain

Add A or CNAME record for `mta-sts.designfitout.com`:
- **Type:** A or CNAME
- **Name:** `mta-sts.designfitout.com` or `mta-sts`
- **Content:** Your Cloudflare Pages IP or root domain
- **Proxied:** ✅ Yes (recommended)

### Step 3: Deploy MTA-STS Policy

The policy is served via Cloudflare Pages Function.

**File Location:** `functions/.well-known/mta-sts.txt.ts`

**Deploy to Cloudflare Pages:**
1. Create Cloudflare Pages project
2. Connect to this GitHub repository
3. Set build settings:
   - **Build command:** (none)
   - **Build output directory:** `/`
4. Deploy

**Alternative - Manual Deployment:**
```bash
# Using Wrangler CLI
npx wrangler pages deploy . --project-name=designfitout
```

### Step 4: Verify MTA-STS

```bash
# Check TXT record
dig +short TXT _mta-sts.designfitout.com

# Check policy endpoint
curl -I https://mta-sts.designfitout.com/.well-known/mta-sts.txt

# Fetch policy content
curl https://mta-sts.designfitout.com/.well-known/mta-sts.txt
```

Expected output:
```
version: STSv1
mode: enforce
mx: aspmx.l.google.com
mx: alt1.aspmx.l.google.com
mx: alt2.aspmx.l.google.com
mx: alt3.aspmx.l.google.com
mx: alt4.aspmx.l.google.com
max_age: 86400
```

### Step 5: Test TLS Certificate

```bash
openssl s_client -servername mta-sts.designfitout.com -connect mta-sts.designfitout.com:443
```

Verify:
- Connection established
- Valid SSL certificate
- Certificate includes `mta-sts.designfitout.com`

---

## Post-Setup Verification

### Automated Verification

Run the comprehensive verification script:
```bash
./scripts/verify_email_setup.sh
```

This script checks:
- ✅ MX records
- ✅ SPF record
- ✅ DMARC policy
- ✅ MTA-STS TXT record
- ✅ MTA-STS policy file
- ✅ SSL/TLS certificate
- ✅ (Optional) SMTP connectivity

### Manual Verification

#### Check MX Records
```bash
dig +short MX designfitout.com
nslookup -type=MX designfitout.com
```

#### Check SPF
```bash
dig +short TXT designfitout.com | grep spf
```

#### Check DMARC
```bash
dig +short TXT _dmarc.designfitout.com
```

#### Check DKIM (after enabling)
```bash
dig +short TXT google._domainkey.designfitout.com
```

#### Check MTA-STS
```bash
dig +short TXT _mta-sts.designfitout.com
curl https://mta-sts.designfitout.com/.well-known/mta-sts.txt
```

### Online Tools

- **[MXToolbox](https://mxtoolbox.com/)** - Comprehensive email diagnostics
- **[Google Toolbox](https://toolbox.googleapps.com/apps/checkmx/)** - Check MX records
- **[DMARC Checker](https://dmarcian.com/dmarc-inspector/)** - Validate DMARC
- **[Hardenize](https://www.hardenize.com/)** - Security assessment

---

## Testing Email Delivery

### Step 1: Send Test Email

1. Log in to Gmail with your `@designfitout.com` account
2. Compose email to external address (Gmail, Outlook, etc.)
3. Send email

### Step 2: Verify Headers

**View Full Headers:**
- Gmail: Three dots menu → Show original
- Outlook: File → Properties → Internet headers

**Look for:**
```
Authentication-Results: ... spf=pass ... dkim=pass ... dmarc=pass
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=designfitout.com; ...
Received-SPF: pass
```

### Step 3: Test Inbound Email

1. Send email TO your `@designfitout.com` address from external account
2. Verify it arrives in inbox
3. Check delivery time (should be immediate)

### Step 4: Test Different Recipients

Send emails to:
- ✅ Gmail accounts
- ✅ Outlook/Hotmail accounts
- ✅ Yahoo accounts
- ✅ Corporate email addresses

**Check spam folders** - if emails land in spam, review:
- SPF alignment
- DKIM signature
- DMARC policy
- Domain reputation (new domains may have delays)

---

## Monitoring and Maintenance

### Daily Monitoring (First 2 Weeks)

- ✅ Check DMARC reports in `dmarc@designfitout.com`
- ✅ Monitor Google Admin Console for email delivery issues
- ✅ Review bounce/reject notifications

### Weekly Monitoring

- ✅ Review DMARC aggregate reports
- ✅ Check for authentication failures
- ✅ Verify no legitimate emails blocked

### Monthly Maintenance

- ✅ Update MTA-STS policy ID if policy changes
- ✅ Review DMARC policy enforcement level
- ✅ Check SSL certificate expiration (auto-renew with Cloudflare)
- ✅ Audit SPF record for third-party services

### DMARC Report Monitoring

**Setup Email Filtering:**
1. Create filter for `dmarc@designfitout.com`
2. Apply label: "DMARC Reports"
3. Archive automatically (optional)

**Report Frequency:**
- Most providers send daily aggregate reports
- Reports are XML files (use parser tools)

---

## Troubleshooting

### Issue: Emails Not Sending

**Symptoms:** Cannot send emails from Google Workspace

**Solutions:**
1. Verify MX records are set correctly
2. Check Google Admin Console → Gmail → Service Status
3. Ensure user account is active
4. Verify SMTP settings (if using email client)
5. Check for quota limits (sending limits)

### Issue: Emails Going to Spam

**Symptoms:** Sent emails land in recipient spam folders

**Solutions:**
1. Verify SPF passes: Check email headers
2. Enable DKIM and verify signature
3. Upgrade DMARC policy to quarantine/reject
4. Check domain reputation: [Google Postmaster Tools](https://postmaster.google.com/)
5. Warm up domain (gradually increase sending volume)
6. Ensure no blacklisting: [MXToolbox Blacklist Check](https://mxtoolbox.com/blacklists.aspx)

### Issue: DKIM Verification Failures

**Symptoms:** DKIM signature invalid or missing

**Solutions:**
1. Verify DKIM TXT record is correct (no typos)
2. Ensure TXT record is DNS-only (not proxied)
3. Check for DNS propagation: `dig +short TXT google._domainkey.designfitout.com`
4. Wait 24-48 hours after enabling DKIM in Google
5. Re-generate DKIM key in Google Admin Console
6. Verify selector matches (`google._domainkey`)

### Issue: MTA-STS Policy Not Loading

**Symptoms:** MTA-STS validation fails

**Solutions:**
1. Verify TXT record: `dig +short TXT _mta-sts.designfitout.com`
2. Test policy endpoint: `curl https://mta-sts.designfitout.com/.well-known/mta-sts.txt`
3. Check SSL certificate validity
4. Verify Content-Type header is `text/plain`
5. Ensure Cloudflare Pages Function is deployed
6. Check firewall/security rules not blocking access

### Issue: DMARC Failures with Forwarding

**Symptoms:** DMARC fails when emails are forwarded

**Solutions:**
1. This is a known limitation of DMARC
2. Options:
   - Use mailing lists (preserves headers)
   - Configure forwarding at Google Workspace level
   - Set DMARC policy to `p=none` if forwarding is critical
3. Consider subdomain policy: `sp=none` for forwarded domains

### Issue: DNS Propagation Delays

**Symptoms:** DNS changes not visible

**Solutions:**
1. Wait 5-10 minutes for initial propagation
2. Check different DNS servers:
   ```bash
   dig @8.8.8.8 MX designfitout.com
   dig @1.1.1.1 MX designfitout.com
   ```
3. Clear local DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```
4. Use online tools: [whatsmydns.net](https://whatsmydns.net/)

---

## Additional Resources

### Official Documentation

- [Google Workspace Admin Help](https://support.google.com/a)
- [MX Record Setup](https://support.google.com/a/answer/140034)
- [DKIM Setup](https://support.google.com/a/answer/174124)
- [SPF Records](https://support.google.com/a/answer/33786)
- [DMARC Policies](https://support.google.com/a/answer/2466580)

### Security Standards

- [RFC 7208 - SPF](https://www.rfc-editor.org/rfc/rfc7208.html)
- [RFC 6376 - DKIM](https://www.rfc-editor.org/rfc/rfc6376.html)
- [RFC 7489 - DMARC](https://www.rfc-editor.org/rfc/rfc7489.html)
- [RFC 8461 - MTA-STS](https://www.rfc-editor.org/rfc/rfc8461.html)

### Testing Tools

- [MXToolbox](https://mxtoolbox.com/) - All-in-one email testing
- [Mail-Tester](https://www.mail-tester.com/) - Email deliverability score
- [DMARC Analyzer](https://dmarcian.com/) - DMARC report parsing
- [Hardenize](https://www.hardenize.com/) - Security assessment
- [Google Postmaster Tools](https://postmaster.google.com/) - Reputation monitoring

### Support

- **Google Workspace Support:** [support.google.com/a/contact](https://support.google.com/a/contact)
- **Cloudflare Support:** [support.cloudflare.com](https://support.cloudflare.com/)
- **Repository Issues:** [GitHub Issues](https://github.com/support-designfitout/Designfitout-Github/issues)

---

## Checklist

Use this checklist to track your progress:

### Domain Verification
- [ ] Obtain Google verification TXT record
- [ ] Add TXT record to Cloudflare DNS
- [ ] Verify domain in Google Admin Console
- [ ] Confirm verification success

### MX Records
- [ ] Run `./scripts/cf_dns_setup.sh` or add manually
- [ ] Verify MX records with `dig` command
- [ ] Wait for Google to detect MX records
- [ ] Confirm Gmail service active in Admin Console

### DKIM
- [ ] Generate DKIM key in Google Admin Console (2048 bits)
- [ ] Add DKIM TXT record to Cloudflare DNS
- [ ] Verify DNS propagation
- [ ] Enable DKIM signing in Google Admin Console
- [ ] Wait 24-48 hours for activation
- [ ] Test DKIM signature in email headers

### SPF
- [ ] Add SPF TXT record (via script or manually)
- [ ] Verify with `dig` command
- [ ] Test SPF with MXToolbox

### DMARC
- [ ] Create `dmarc@designfitout.com` mailbox
- [ ] Add DMARC TXT record (p=none)
- [ ] Monitor reports for 1-2 weeks
- [ ] Upgrade to p=quarantine
- [ ] Monitor reports for 1-2 weeks
- [ ] Upgrade to p=reject

### MTA-STS
- [ ] Add MTA-STS TXT record
- [ ] Create mta-sts subdomain
- [ ] Deploy Cloudflare Pages Function
- [ ] Verify policy endpoint accessible
- [ ] Test SSL certificate validity

### Testing
- [ ] Run `./scripts/verify_email_setup.sh`
- [ ] Send test emails (outbound)
- [ ] Receive test emails (inbound)
- [ ] Check email headers for authentication
- [ ] Test multiple email providers

### Monitoring
- [ ] Set up DMARC report monitoring
- [ ] Review daily reports (first 2 weeks)
- [ ] Configure alerts for delivery issues
- [ ] Monitor domain reputation

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-09  
**Author:** DevOps Team
