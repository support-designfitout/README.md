# Google Workspace Setup Guide

Complete step-by-step instructions for setting up Google Workspace email for designfitout.com, including domain verification, DKIM configuration, and DMARC policy management.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Domain Verification](#domain-verification)
- [MX Record Configuration](#mx-record-configuration)
- [DKIM Setup](#dkim-setup)
- [DMARC Configuration and Tuning](#dmarc-configuration-and-tuning)
- [Testing and Validation](#testing-and-validation)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Active Google Workspace account
- ✅ Admin access to Google Workspace Admin Console
- ✅ Access to Cloudflare DNS management for designfitout.com
- ✅ `CF_API_TOKEN` and `ZONE_ID` environment variables (for automated setup)
- ✅ Command-line tools: `dig`, `curl`, `openssl` (for verification)

---

## Domain Verification

Google Workspace requires domain ownership verification before you can use email services.

### Step 1: Get Verification TXT Record

1. Log in to [Google Workspace Admin Console](https://admin.google.com)
2. Navigate to **Account** > **Domains** > **Manage domains**
3. Click **Add a domain** or select your existing domain
4. Choose **TXT record verification** method
5. Copy the verification code (format: `google-site-verification=xxxxxxxxxxxxx`)

### Step 2: Add Verification Record to DNS

**Manual Method (Cloudflare Dashboard):**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select **designfitout.com** domain
3. Go to **DNS** > **Records**
4. Click **Add record**
5. Configure:
   - **Type:** TXT
   - **Name:** @ (or designfitout.com)
   - **Content:** `google-site-verification=xxxxxxxxxxxxx` (your code)
   - **TTL:** 3600 (or Auto)
   - **Proxy status:** DNS only (orange cloud OFF)
6. Click **Save**

**Automated Method (using API):**

```bash
# Set your Cloudflare credentials
export CF_API_TOKEN="your-api-token"
export ZONE_ID="your-zone-id"

# Add verification record
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "TXT",
    "name": "@",
    "content": "google-site-verification=xxxxxxxxxxxxx",
    "ttl": 3600,
    "proxied": false
  }'
```

### Step 3: Verify Domain Ownership

1. Wait 5-10 minutes for DNS propagation
2. Return to Google Workspace Admin Console
3. Click **Verify domain** button
4. If verification fails, wait longer and try again (can take up to 48 hours)

**Verification Command:**

```bash
# Check if TXT record is live
dig TXT designfitout.com +short | grep google-site-verification
```

---

## MX Record Configuration

MX records route email to Google's mail servers.

### Step 1: Configure MX Records

**Automated Method (Recommended):**

```bash
# Ensure environment variables are set
export CF_API_TOKEN="your-api-token"
export ZONE_ID="your-zone-id"

# Run the DNS setup script
./scripts/cf_dns_setup.sh
```

The script will:
- Display planned changes
- Prompt for confirmation
- Create/update all required MX records
- Provide verification commands

**Manual Method (Cloudflare Dashboard):**

Add the following 5 MX records:

| Priority | Mail Server |
|----------|-------------|
| 1 | aspmx.l.google.com |
| 5 | alt1.aspmx.l.google.com |
| 5 | alt2.aspmx.l.google.com |
| 10 | alt3.aspmx.l.google.com |
| 10 | alt4.aspmx.l.google.com |

For each record:
1. Type: **MX**
2. Name: **@** (or designfitout.com)
3. Mail server: (see table above)
4. Priority: (see table above)
5. TTL: **3600**
6. Proxy status: **DNS only** (orange cloud OFF)

### Step 2: Verify MX Records

**Command Line:**

```bash
# Check MX records
dig MX designfitout.com +short

# Expected output (order may vary):
# 1 aspmx.l.google.com.
# 5 alt1.aspmx.l.google.com.
# 5 alt2.aspmx.l.google.com.
# 10 alt3.aspmx.l.google.com.
# 10 alt4.aspmx.l.google.com.
```

**Online Tool:**

Visit [MXToolbox](https://mxtoolbox.com/SuperTool.aspx?action=mx%3adesignfitout.com) and verify:
- ✅ All 5 MX records present
- ✅ Correct priorities (1, 5, 5, 10, 10)
- ✅ All servers resolve to Google IPs

### Step 3: Activate Gmail in Google Workspace

1. Go to **Apps** > **Google Workspace** > **Gmail**
2. Click **Activate Gmail**
3. Wait for activation (can take 10-30 minutes)
4. Send a test email to verify delivery

---

## DKIM Setup

DKIM (DomainKeys Identified Mail) cryptographically signs outgoing emails to prevent spoofing.

### Why DKIM is Important

- ✅ Prevents email spoofing and phishing
- ✅ Improves email deliverability and inbox placement
- ✅ Required for strong DMARC enforcement
- ✅ Industry best practice for email authentication

### Step 1: Generate DKIM Key

1. Go to [Google Workspace Admin Console](https://admin.google.com)
2. Navigate to **Apps** > **Google Workspace** > **Gmail** > **Authenticate email**
3. Click **Generate new record**
4. Configure DKIM settings:
   - **DKIM key bit length:** **2048-bit** (recommended for security)
   - **Prefix selector:** Use default (usually `google`) or custom (e.g., `selector1`)
5. Click **Generate**
6. Copy the generated TXT record values:
   - **DNS Host Name:** (e.g., `google._domainkey.designfitout.com`)
   - **TXT Record Value:** (long string starting with `v=DKIM1; k=rsa; p=...`)

**Why 2048-bit?**
- Higher security than 1024-bit
- Widely supported by email providers
- Recommended by security standards
- Future-proof for long-term use

### Step 2: Add DKIM Record to DNS

**Example DKIM Record:**

```
Type: TXT
Name: google._domainkey.designfitout.com
Content: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
TTL: 3600
Proxied: No (DNS only)
```

**Manual Method (Cloudflare Dashboard):**

1. Log in to Cloudflare
2. Go to **DNS** > **Records**
3. Click **Add record**
4. Configure:
   - **Type:** TXT
   - **Name:** `google._domainkey` (or your selector name)
   - **Content:** (paste the full TXT record value from Google)
   - **TTL:** 3600
   - **Proxy status:** DNS only
5. Click **Save**

**Automated Method:**

```bash
export CF_API_TOKEN="your-api-token"
export ZONE_ID="your-zone-id"
export DKIM_SELECTOR="google"  # or your custom selector
export DKIM_VALUE="v=DKIM1; k=rsa; p=MIIBIjAN..."  # your full DKIM value

curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\": \"TXT\",
    \"name\": \"${DKIM_SELECTOR}._domainkey\",
    \"content\": \"${DKIM_VALUE}\",
    \"ttl\": 3600,
    \"proxied\": false
  }"
```

### Step 3: Verify DKIM Record

**Command Line:**

```bash
# Replace 'google' with your selector name if different
dig TXT google._domainkey.designfitout.com +short

# Expected output (truncated):
# "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
```

**Verify Length:**

```bash
# DKIM records can be long; check for complete record
dig TXT google._domainkey.designfitout.com | grep "v=DKIM1"
```

### Step 4: Enable DKIM Signing in Google Workspace

1. Return to **Apps** > **Google Workspace** > **Gmail** > **Authenticate email**
2. Find your DKIM configuration
3. Click **Start authentication**
4. Status will change to "Authenticating email"
5. Wait 24-48 hours for full propagation

**Monitor DKIM Status:**

Status indicators:
- 🟢 **Authenticating email:** DKIM is active
- 🟡 **Waiting to activate:** DNS record found, activation pending
- 🔴 **Generating new record:** Record not found or invalid

---

## DMARC Configuration and Tuning

DMARC (Domain-based Message Authentication, Reporting & Conformance) protects against email spoofing and provides reporting.

### Initial DMARC Setup

The DNS setup script creates an initial DMARC record with monitoring mode.

**Initial DMARC Policy:**

```
v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s
```

**Policy Explanation:**
- `v=DMARC1` - DMARC version 1
- `p=none` - Policy: monitor only (no enforcement)
- `rua=mailto:dmarc@designfitout.com` - Send aggregate reports here
- `pct=100` - Apply policy to 100% of messages
- `adkim=s` - Strict DKIM alignment (domain must match exactly)
- `aspf=s` - Strict SPF alignment (domain must match exactly)

### DMARC Policy Progression

**⚠️ Important:** Move through phases gradually after monitoring results.

#### Phase 1: Monitoring Mode (Initial - 2-4 weeks)

```
v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s
```

**Goals:**
- Collect data on email sources
- Identify all legitimate sending sources
- Establish baseline metrics

**Actions:**
1. Monitor DMARC aggregate reports (XML format sent to dmarc@designfitout.com)
2. Verify all legitimate email sources pass SPF and DKIM
3. Identify and fix any alignment issues
4. Wait at least 2 weeks before proceeding

#### Phase 2: Quarantine Mode (Testing - 2-4 weeks)

```
v=DMARC1; p=quarantine; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s
```

**Goals:**
- Test enforcement without blocking email
- Suspicious emails go to spam folder
- Final validation before full enforcement

**Update Command:**

```bash
# Update DMARC record in Cloudflare
export CF_API_TOKEN="your-api-token"
export ZONE_ID="your-zone-id"

# Get existing DMARC record ID
RECORD_ID=$(curl -s -X GET \
  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=TXT&name=_dmarc.designfitout.com" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Update to quarantine mode
curl -X PUT \
  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${RECORD_ID}" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "TXT",
    "name": "_dmarc",
    "content": "v=DMARC1; p=quarantine; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s",
    "ttl": 3600,
    "proxied": false
  }'
```

**Actions:**
1. Continue monitoring reports
2. Verify no legitimate email is quarantined
3. Wait at least 2 weeks before final phase

#### Phase 3: Reject Mode (Production)

```
v=DMARC1; p=reject; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s
```

**Goals:**
- Full DMARC enforcement
- Block all unauthenticated email
- Maximum domain protection

**Update to Reject Mode:**

```bash
# Update to reject mode
curl -X PUT \
  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${RECORD_ID}" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "TXT",
    "name": "_dmarc",
    "content": "v=DMARC1; p=reject; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s",
    "ttl": 3600,
    "proxied": false
  }'
```

### Monitoring DMARC Reports

**Report Types:**

1. **Aggregate Reports (RUA):**
   - Sent daily to rua address
   - XML format with email statistics
   - Shows pass/fail counts for SPF and DKIM

2. **Forensic Reports (RUF) - Optional:**
   - Real-time failure reports
   - Add `ruf=mailto:dmarc-forensic@designfitout.com` to policy
   - Contains sample message headers

**Processing Reports:**

Use a DMARC report analyzer:
- [DMARC Analyzer](https://www.dmarcanalyzer.com/) (commercial)
- [Postmark DMARC](https://dmarc.postmarkapp.com/) (free)
- [dmarcian](https://dmarcian.com/) (commercial)
- Parse XML reports manually

**Example Report Analysis:**

```xml
<record>
  <row>
    <source_ip>209.85.220.41</source_ip>
    <count>25</count>
    <policy_evaluated>
      <disposition>none</disposition>
      <dkim>pass</dkim>
      <spf>pass</spf>
    </policy_evaluated>
  </row>
  <!-- More rows... -->
</record>
```

---

## Testing and Validation

### Complete Email Setup Verification

**Automated Verification:**

```bash
# Run comprehensive verification script
./scripts/verify_email_setup.sh

# Should show:
# ✅ MX records configured
# ✅ SPF record valid
# ✅ DMARC record present
# ✅ MTA-STS configured
# ⚠️  DKIM pending (until enabled in Google Workspace)
```

### Send Test Email

1. Send email from your Google Workspace account
2. Send to a personal Gmail account
3. View original message source (Gmail: three dots menu > "Show original")
4. Check authentication results:

**Expected Headers:**

```
Authentication-Results: mx.google.com;
  spf=pass (google.com: domain of user@designfitout.com designates XXX.XXX.XXX.XXX as permitted sender) smtp.mailfrom=user@designfitout.com;
  dkim=pass header.i=@designfitout.com header.s=google header.b=XXXXXXXX;
  dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=designfitout.com
```

**What to Look For:**
- ✅ `spf=pass` - SPF authentication succeeded
- ✅ `dkim=pass` - DKIM signature verified
- ✅ `dmarc=pass` - DMARC policy passed

### Command-Line Verification

```bash
# Check all DNS records
dig MX designfitout.com +short
dig TXT designfitout.com +short
dig TXT _dmarc.designfitout.com +short
dig TXT google._domainkey.designfitout.com +short
dig TXT _mta-sts.designfitout.com +short

# Check MTA-STS policy endpoint
curl https://mta-sts.designfitout.com/.well-known/mta-sts.txt

# Verify TTL values
dig MX designfitout.com | grep "IN\s*MX"
```

### Online Testing Tools

1. **MXToolbox Suite:**
   - MX Lookup: https://mxtoolbox.com/SuperTool.aspx?action=mx%3adesignfitout.com
   - SPF Check: https://mxtoolbox.com/spf.aspx
   - DMARC Check: https://mxtoolbox.com/dmarc.aspx
   - DKIM Check: https://mxtoolbox.com/dkim.aspx

2. **Google Admin Toolbox:**
   - Message Header Analyzer: https://toolbox.googleapps.com/apps/messageheader/
   - Check MX: https://toolbox.googleapps.com/apps/checkmx/

3. **Mail Tester:**
   - Send email to test@mail-tester.com
   - View report at https://www.mail-tester.com/
   - Aim for 10/10 score

---

## Monitoring and Maintenance

### Regular Checks

**Weekly:**
- ✅ Review DMARC aggregate reports
- ✅ Check for authentication failures
- ✅ Verify email deliverability

**Monthly:**
- ✅ Review DKIM key rotation policy (rotate annually)
- ✅ Update DMARC policy if needed
- ✅ Check for DNS changes or TTL adjustments

**Quarterly:**
- ✅ Run full verification suite
- ✅ Update documentation
- ✅ Review security best practices

### Maintenance Commands

```bash
# Quick health check
dig MX designfitout.com +short && \
dig TXT designfitout.com +short | grep spf && \
dig TXT _dmarc.designfitout.com +short

# Full verification
./scripts/verify_email_setup.sh

# Check certificate expiration for MTA-STS
echo | openssl s_client -connect mta-sts.designfitout.com:443 -servername mta-sts.designfitout.com 2>&1 | openssl x509 -noout -dates
```

---

## Troubleshooting

### Issue: Domain Verification Fails

**Symptoms:**
- Google Workspace shows "Unable to verify domain"
- Verification TXT record not found

**Solutions:**
1. Verify DNS record exists:
   ```bash
   dig TXT designfitout.com +short | grep google-site-verification
   ```
2. Check TTL has expired (wait at least TTL duration)
3. Ensure record is not proxied in Cloudflare
4. Try alternative verification method (HTML file or meta tag)

### Issue: Emails Not Being Received

**Symptoms:**
- Sent emails don't arrive
- No bounce messages

**Solutions:**
1. Verify MX records:
   ```bash
   dig MX designfitout.com +short
   ```
2. Check MX priority values (should be 1, 5, 5, 10, 10)
3. Ensure MX records are NOT proxied
4. Wait for DNS propagation (up to 48 hours)
5. Check Google Workspace activation status
6. Test with [MXToolbox](https://mxtoolbox.com/diagnostic.aspx)

### Issue: Emails Going to Spam

**Symptoms:**
- Emails arrive in spam/junk folder
- Low sender reputation

**Solutions:**
1. Verify SPF passes:
   ```bash
   dig TXT designfitout.com +short | grep spf
   ```
2. Enable and verify DKIM:
   ```bash
   dig TXT google._domainkey.designfitout.com +short
   ```
3. Check DMARC alignment in email headers
4. Send test email and check headers for authentication results
5. Build sender reputation gradually (send to engaged recipients first)
6. Ensure content quality (avoid spam trigger words)

### Issue: DKIM Not Working

**Symptoms:**
- `dkim=fail` or `dkim=neutral` in headers
- DKIM status "Not authenticating" in Google Workspace

**Solutions:**
1. Verify DNS record:
   ```bash
   dig TXT google._domainkey.designfitout.com
   ```
2. Check for typos in DKIM value (especially long strings)
3. Ensure record is not proxied
4. Verify selector name matches Google Workspace configuration
5. Wait 24-48 hours after adding record
6. Click "Start authentication" in Google Workspace Admin

### Issue: MTA-STS Policy Not Loading

**Symptoms:**
- Policy URL returns 404 or error
- MTA-STS validation tools fail

**Solutions:**
1. Verify DNS record:
   ```bash
   dig TXT _mta-sts.designfitout.com +short
   ```
2. Check HTTPS endpoint:
   ```bash
   curl -I https://mta-sts.designfitout.com/.well-known/mta-sts.txt
   ```
3. Verify Cloudflare Pages Function is deployed
4. Check SSL certificate:
   ```bash
   echo | openssl s_client -connect mta-sts.designfitout.com:443 -servername mta-sts.designfitout.com
   ```
5. Review policy file syntax

### Issue: DMARC Reports Not Arriving

**Symptoms:**
- No XML reports received at rua address
- Empty dmarc@designfitout.com inbox

**Solutions:**
1. Verify DMARC record includes rua:
   ```bash
   dig TXT _dmarc.designfitout.com +short | grep rua
   ```
2. Check dmarc@designfitout.com mailbox exists and can receive email
3. Reports typically arrive 24-48 hours after DMARC setup
4. Some senders may not send reports if volume is low
5. Consider adding external DMARC report service

---

## Additional Resources

### Official Documentation

- [Google Workspace Admin Help](https://support.google.com/a/)
- [Gmail MX Records Setup](https://support.google.com/a/answer/174125)
- [Google DKIM Setup](https://support.google.com/a/answer/174124)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)

### Email Authentication Standards

- [SPF (RFC 7208)](https://datatracker.ietf.org/doc/html/rfc7208)
- [DKIM (RFC 6376)](https://datatracker.ietf.org/doc/html/rfc6376)
- [DMARC (RFC 7489)](https://datatracker.ietf.org/doc/html/rfc7489)
- [MTA-STS (RFC 8461)](https://datatracker.ietf.org/doc/html/rfc8461)

### Useful Tools

- [MXToolbox](https://mxtoolbox.com/) - Comprehensive email diagnostics
- [DMARC Analyzer](https://www.dmarcanalyzer.com/) - DMARC report processing
- [Mail Tester](https://www.mail-tester.com/) - Email deliverability testing
- [Google Admin Toolbox](https://toolbox.googleapps.com/) - Google-specific tools

---

**Last Updated:** 2025-11-09  
**Maintained by:** DevOps Team  
**Review Schedule:** After Google Workspace updates or policy changes
