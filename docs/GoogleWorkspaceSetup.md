# Google Workspace Email Setup Guide

Complete step-by-step guide for setting up Google Workspace email for **designfitout.com** with enhanced security (SPF, DKIM, DMARC, MTA-STS).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [DNS Configuration](#dns-configuration)
3. [Domain Verification](#domain-verification)
4. [MX Records Setup](#mx-records-setup)
5. [DKIM Configuration](#dkim-configuration)
6. [SPF Record](#spf-record)
7. [DMARC Setup and Tuning](#dmarc-setup-and-tuning)
8. [MTA-STS Configuration](#mta-sts-configuration)
9. [Verification and Testing](#verification-and-testing)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Active Google Workspace account
- ✅ Admin access to Google Workspace Admin Console
- ✅ Admin access to Cloudflare DNS (or domain registrar)
- ✅ Cloudflare API Token with DNS Edit permissions
- ✅ Zone ID for designfitout.com

### Getting Your Cloudflare Credentials

**API Token** (Recommended):
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Edit zone DNS**
4. Set Zone Resources: Include → Specific zone → designfitout.com
5. Copy the token securely

**Zone ID**:
1. Go to: https://dash.cloudflare.com
2. Select **designfitout.com**
3. Find Zone ID in the right sidebar under **API** section

---

## DNS Configuration

### Automated Setup (Recommended)

Use the provided automation script to configure all DNS records:

```bash
# Set environment variables
export CF_API_TOKEN="your_cloudflare_api_token_here"
export ZONE_ID="your_zone_id_here"

# Run the setup script
cd /path/to/repository
chmod +x scripts/cf_dns_setup.sh
./scripts/cf_dns_setup.sh
```

The script will configure:
- 5 MX records (Google Workspace mail servers)
- SPF record (authorize Google to send email)
- DMARC record (email authentication policy)
- MTA-STS TXT record (SMTP security)

### Manual Setup (Alternative)

If you prefer manual configuration, follow the DNS records specified in `infra/DNS/PROD-records.md`.

---

## Domain Verification

Google requires domain ownership verification before you can use it with Workspace.

### Steps to Verify Domain

1. **Access Admin Console**
   - Go to: https://admin.google.com
   - Sign in with your admin account

2. **Navigate to Domains**
   - Click **Account** → **Domains** → **Manage domains**
   - Select **designfitout.com** (or add it if not present)

3. **Choose Verification Method**
   - Select **TXT record** method (recommended)
   - Google will provide a verification code like:
     ```
     google-site-verification=abc123def456...
     ```

4. **Add TXT Record to Cloudflare**

   **Via Cloudflare Dashboard**:
   - Go to: https://dash.cloudflare.com
   - Select **designfitout.com** → **DNS** → **Records**
   - Click **Add record**
   - Type: `TXT`
   - Name: `@` (or leave empty for root domain)
   - Content: `google-site-verification=abc123def456...`
   - TTL: Auto (or 3600)
   - Proxy status: DNS only (automatic for TXT records)
   - Click **Save**

   **Via Cloudflare API**:
   ```bash
   export CF_API_TOKEN="your_token"
   export ZONE_ID="your_zone_id"
   
   curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
     -H "Authorization: Bearer ${CF_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{
       "type": "TXT",
       "name": "@",
       "content": "google-site-verification=abc123def456...",
       "ttl": 3600
     }'
   ```

5. **Verify in Google Admin**
   - Wait 5-10 minutes for DNS propagation
   - Return to Google Admin Console
   - Click **Verify** button
   - If verification fails, wait another 10 minutes and retry

**Troubleshooting Verification**:
```bash
# Check if TXT record is visible
dig +short TXT designfitout.com | grep google-site-verification

# Or use nslookup
nslookup -type=TXT designfitout.com
```

---

## MX Records Setup

MX records tell other mail servers where to deliver email for your domain.

### Verify MX Records

The automated script (`cf_dns_setup.sh`) configures all required MX records. Verify with:

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

### Activate Gmail in Google Workspace

1. Go to: **Admin Console** → **Apps** → **Google Workspace** → **Gmail**
2. Verify the status shows: **MX records setup correctly**
3. If not detected, click **Refresh** or wait a few more minutes

---

## DKIM Configuration

DKIM (DomainKeys Identified Mail) adds a digital signature to your outgoing emails, proving they came from your domain.

### Why DKIM Matters

- ✅ Prevents email spoofing
- ✅ Improves email deliverability
- ✅ Required for DMARC compliance
- ✅ Builds sender reputation

### Generate DKIM Key in Google Workspace

1. **Navigate to DKIM Settings**
   - Go to: **Admin Console** → **Apps** → **Google Workspace** → **Gmail**
   - Click **Authenticate email**

2. **Select Your Domain**
   - Choose **designfitout.com** from the domain list

3. **Generate New Record**
   - Click **Generate new record**
   - **Key length**: Select **2048 bits** (recommended for better security)
   - **Prefix selector**: Usually `google` (default, can be customized)
   - Click **Generate**

4. **Copy DKIM Record Details**
   
   Google will display:
   - **DNS Host/Name**: `google._domainkey` (or your custom selector)
   - **TXT Record Value**: A long string starting with `v=DKIM1; k=rsa; p=...`
   
   Example:
   ```
   google._domainkey.designfitout.com
   
   v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr3...
   (continues for ~300+ characters)
   ```

### Add DKIM Record to Cloudflare

**Via Cloudflare Dashboard**:

1. Go to: https://dash.cloudflare.com
2. Select **designfitout.com** → **DNS** → **Records**
3. Click **Add record**
4. Configure:
   - **Type**: `TXT`
   - **Name**: `google._domainkey` (or your selector)
   - **Content**: Paste the full DKIM TXT value from Google
   - **TTL**: 3600 (1 hour)
   - **Proxy status**: DNS only (automatic for TXT)
5. Click **Save**

**Via Cloudflare API**:

```bash
export CF_API_TOKEN="your_token"
export ZONE_ID="your_zone_id"
export DKIM_CONTENT="v=DKIM1; k=rsa; p=MIIBIjANBgkq..." # Full value from Google

curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\": \"TXT\",
    \"name\": \"google._domainkey\",
    \"content\": \"${DKIM_CONTENT}\",
    \"ttl\": 3600
  }"
```

### Verify DKIM Record

Check if the record is published:

```bash
dig +short TXT google._domainkey.designfitout.com
```

Should return the DKIM public key (long string).

### Start DKIM Authentication in Google

1. Return to **Admin Console** → **Apps** → **Gmail** → **Authenticate email**
2. Wait 5-10 minutes for DNS propagation
3. Click **Start authentication**
4. Status should change to **Authenticating email** ✅

**Note**: DKIM activation may take up to 48 hours to fully propagate.

---

## SPF Record

SPF (Sender Policy Framework) authorizes Google's mail servers to send email on behalf of your domain.

### Verify SPF Record

The automated script configures this. Verify with:

```bash
dig +short TXT designfitout.com | grep spf
```

Expected output:
```
"v=spf1 include:_spf.google.com ~all"
```

### SPF Syntax Explained

- `v=spf1` - SPF version 1
- `include:_spf.google.com` - Authorize all Google mail servers
- `~all` - **Soft fail** for other servers (recommended)
  - Alternative: `-all` for **hard fail** (strictest, use after validation)

### When to Use `-all` (Hard Fail)

Only switch to `-all` after:
- Verifying all legitimate email sources are included
- Testing email delivery for 1-2 weeks
- Confirming no valid emails are being rejected

---

## DMARC Setup and Tuning

DMARC (Domain-based Message Authentication, Reporting and Conformance) tells receiving mail servers what to do with emails that fail SPF or DKIM checks.

### Initial DMARC Record (Monitoring Mode)

The automated script configures a monitoring-mode DMARC record:

```
v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com; ruf=mailto:dmarc@designfitout.com; fo=1
```

**Components**:
- `v=DMARC1` - Version
- `p=none` - **Policy: Monitor only** (no action on failures)
- `rua=mailto:dmarc@designfitout.com` - Aggregate reports destination
- `ruf=mailto:dmarc@designfitout.com` - Forensic reports destination
- `fo=1` - Generate forensic reports for any authentication failure

### DMARC Policy Progression (Recommended Timeline)

DMARC should be implemented gradually to avoid blocking legitimate email:

#### **Phase 1: Monitoring (2-4 weeks)**

```
v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com; ruf=mailto:dmarc@designfitout.com; fo=1
```

**Goals**:
- Collect baseline data
- Identify all legitimate email sources
- Review daily/weekly aggregate reports
- Fix any SPF/DKIM misconfigurations

**Actions**:
- Check `dmarc@designfitout.com` daily for reports
- Use tools like [DMARC Analyzer](https://www.dmarcanalyzer.com/) or [Postmark DMARC](https://dmarc.postmarkapp.com/)
- Identify any failing sources and fix SPF/DKIM

#### **Phase 2: Quarantine (2-4 weeks)**

After confirming all legitimate email passes SPF/DKIM:

```
v=DMARC1; p=quarantine; pct=10; rua=mailto:dmarc@designfitout.com; ruf=mailto:dmarc@designfitout.com; fo=1
```

**Changes**:
- `p=quarantine` - Failed emails go to spam/junk
- `pct=10` - Start with 10% of emails, gradually increase to 100%

**Goals**:
- Test impact on email delivery
- Monitor for false positives
- Gradually increase `pct` value (10 → 25 → 50 → 100)

**Update Command**:
```bash
export CF_API_TOKEN="your_token"
export ZONE_ID="your_zone_id"

# Get record ID
RECORD_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=TXT&name=_dmarc.designfitout.com" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" | jq -r '.result[0].id')

# Update record
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${RECORD_ID}" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "TXT",
    "name": "_dmarc",
    "content": "v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@designfitout.com; ruf=mailto:dmarc@designfitout.com; fo=1",
    "ttl": 3600
  }'
```

#### **Phase 3: Reject (Final State)**

After successful quarantine testing with no issues:

```
v=DMARC1; p=reject; rua=mailto:dmarc@designfitout.com; ruf=mailto:dmarc@designfitout.com; fo=1
```

**Changes**:
- `p=reject` - Failed emails are rejected entirely (strictest policy)
- Remove `pct` parameter (applies to 100% of emails by default)

**Result**: Maximum protection against email spoofing and phishing.

### Reading DMARC Reports

Reports are sent to `dmarc@designfitout.com` in XML format.

**Report Types**:
1. **Aggregate Reports (rua)**: Daily summaries of email authentication results
2. **Forensic Reports (ruf)**: Individual failure details (optional)

**Tools for Analysis**:
- [DMARC Analyzer](https://www.dmarcanalyzer.com/) - Commercial, full-featured
- [Postmark DMARC Digests](https://dmarc.postmarkapp.com/) - Free for small volumes
- [dmarcian](https://dmarcian.com/) - Commercial with free tier
- [parsedmarc](https://github.com/domainaware/parsedmarc) - Open-source self-hosted

---

## MTA-STS Configuration

MTA-STS (Mail Transfer Agent Strict Transport Security) ensures email is always delivered over encrypted connections.

### How MTA-STS Works

1. Receiving mail server checks DNS for `_mta-sts.designfitout.com` TXT record
2. If found, fetches policy from `https://mta-sts.designfitout.com/.well-known/mta-sts.txt`
3. Enforces TLS connection to MX servers listed in policy
4. Caches policy for `max_age` duration (24 hours)

### Components

#### 1. DNS TXT Record (Already Configured)

```
_mta-sts.designfitout.com → v=STSv1; id=2025-11-09
```

The `id` should be updated whenever the policy file changes.

#### 2. Policy File (Cloudflare Pages Function)

Location: `functions/.well-known/mta-sts.txt.ts`

The Cloudflare Pages Function serves the policy:

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

**Mode Options**:
- `testing` - Report violations but don't enforce (safe for initial setup)
- `enforce` - Reject non-TLS connections (recommended for production)
- `none` - Disable MTA-STS

#### 3. HTTPS Requirement

The `mta-sts.designfitout.com` subdomain **must**:
- Be accessible over HTTPS (port 443)
- Have a valid TLS certificate
- Serve the policy at `/.well-known/mta-sts.txt`

**Cloudflare Setup**:
1. Add DNS record: `mta-sts` → CNAME → `designfitout.com` (proxied)
2. Cloudflare automatically provides TLS certificate
3. Deploy Pages Function (see repository deployment docs)

### Verify MTA-STS Setup

```bash
# Run verification script
./scripts/verify_email_setup.sh

# Or manual checks:
dig +short TXT _mta-sts.designfitout.com
curl -I https://mta-sts.designfitout.com/.well-known/mta-sts.txt
curl https://mta-sts.designfitout.com/.well-known/mta-sts.txt
```

---

## Verification and Testing

### Run Automated Verification

Use the provided verification script:

```bash
chmod +x scripts/verify_email_setup.sh
./scripts/verify_email_setup.sh
```

The script checks:
- ✅ MX records
- ✅ SPF record
- ✅ DMARC record
- ✅ DKIM record
- ✅ MTA-STS DNS and policy
- ✅ TLS certificate
- ✅ SMTP connectivity (optional, requires `swaks`)

### Manual Verification

#### Test Email Sending

1. Log into Google Workspace Gmail: https://mail.google.com
2. Send a test email to an external address (e.g., Gmail, Outlook)
3. Check email headers for:
   - `SPF: PASS`
   - `DKIM: PASS`
   - `DMARC: PASS`

**View Headers** (Gmail):
- Open the email → Three dots menu → **Show original**
- Look for `Authentication-Results`

#### Test Email Receiving

1. Send an email **to** your `@designfitout.com` address from external email
2. Check if email arrives in Gmail
3. Verify no delays or bounces

### Online Tools

Use these tools for comprehensive validation:

1. **MXToolbox SuperTool**: https://mxtoolbox.com/SuperTool.aspx
   - Enter: `designfitout.com`
   - Check: MX, SPF, DMARC, DKIM

2. **Google Admin Toolbox**: https://toolbox.googleapps.com/apps/checkmx/
   - Enter: `designfitout.com`
   - Comprehensive Google-specific checks

3. **DMARC Analyzer**: https://www.dmarcanalyzer.com/
   - Free DMARC record checker and report analysis

4. **MTA-STS Validator**: https://aykevl.nl/apps/mta-sts/
   - Validates MTA-STS configuration

5. **Mail-Tester**: https://www.mail-tester.com/
   - Send email to provided address
   - Get spam score and authentication analysis

---

## Troubleshooting

### Common Issues

#### Domain Verification Fails

**Symptom**: Google can't verify domain ownership

**Solutions**:
1. Verify TXT record is published:
   ```bash
   dig +short TXT designfitout.com | grep google-site-verification
   ```
2. Wait up to 1 hour for DNS propagation
3. Clear DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```
4. Try verification from different network (mobile data)

#### Emails Not Arriving

**Symptom**: Emails sent to `@designfitout.com` don't arrive

**Solutions**:
1. Verify MX records are correct:
   ```bash
   dig +short MX designfitout.com
   ```
2. Check MX records are **NOT** proxied in Cloudflare (must be DNS only)
3. Check Google Workspace Gmail is activated
4. Review bounce messages for errors
5. Check Google Workspace logs: **Admin Console** → **Reports** → **Email log search**

#### DKIM Not Working

**Symptom**: Emails fail DKIM authentication

**Solutions**:
1. Verify DKIM record exists:
   ```bash
   dig +short TXT google._domainkey.designfitout.com
   ```
2. Ensure record selector matches Google's configuration
3. Check for typos in the long DKIM public key
4. Wait 24-48 hours for full DKIM propagation
5. Regenerate DKIM key in Google Admin and update DNS

#### SPF Fails

**Symptom**: Emails fail SPF checks

**Solutions**:
1. Verify SPF record syntax:
   ```bash
   dig +short TXT designfitout.com | grep "v=spf1"
   ```
2. Ensure only ONE SPF record exists (multiple SPF records cause failures)
3. Check `include:_spf.google.com` is present
4. If using other email services, add them: `include:_spf.otherprovider.com`
5. Keep SPF lookups under 10 (SPF specification limit)

#### DMARC Reports Not Arriving

**Symptom**: No DMARC reports received at `dmarc@designfitout.com`

**Solutions**:
1. Ensure `dmarc@designfitout.com` mailbox exists and is monitored
2. Check spam/junk folder for reports
3. Reports are sent by receiving mail servers, not immediate
4. Wait 24-48 hours for first reports
5. Use external tool to parse XML reports

#### MTA-STS Policy Not Loading

**Symptom**: `curl https://mta-sts.designfitout.com/.well-known/mta-sts.txt` fails

**Solutions**:
1. Verify `mta-sts` DNS record exists and is proxied
2. Check TLS certificate is valid:
   ```bash
   openssl s_client -connect mta-sts.designfitout.com:443 -servername mta-sts.designfitout.com
   ```
3. Verify Cloudflare Pages Function is deployed
4. Check Cloudflare SSL/TLS mode is **Full** or **Full (Strict)**
5. Test from multiple locations (different networks/countries)

---

## Best Practices

### Email Security

1. **Start Conservative, Tighten Gradually**
   - Begin with `p=none` for DMARC
   - Monitor for 2-4 weeks before enforcement
   - Use `pct=` parameter to gradually roll out quarantine/reject

2. **Keep SPF Record Simple**
   - Only include necessary services
   - Use `include:` for third-party services
   - Stay under 10 DNS lookups (SPF limit)

3. **Use Strong DKIM Keys**
   - Always choose 2048-bit keys (more secure than 1024-bit)
   - Rotate keys annually for best security
   - Keep private keys secure (Google manages this automatically)

4. **Monitor DMARC Reports**
   - Review aggregate reports weekly
   - Investigate unexpected sources
   - Use a DMARC analytics tool for easier parsing

5. **Update MTA-STS Policy ID**
   - Change `id=` value in `_mta-sts` TXT record when policy changes
   - Use timestamps (YYYY-MM-DD) or version numbers
   - Ensures mail servers fetch updated policy

### Maintenance

1. **Regular Audits**
   - Run `verify_email_setup.sh` monthly
   - Check MXToolbox quarterly
   - Review DMARC reports weekly

2. **Keep Documentation Updated**
   - Document any DNS changes
   - Update `infra/DNS/PROD-records.md` when modifying records
   - Note policy progression dates

3. **Monitor Email Deliverability**
   - Track bounce rates in Google Workspace
   - Monitor spam complaints
   - Check sender reputation: https://senderscore.org/

4. **Plan for Changes**
   - Lower TTL values before making DNS changes
   - Test changes in non-production environment if possible
   - Have rollback plan ready

---

## Post-Setup Checklist

After completing all steps, verify:

- [ ] Domain verified in Google Workspace ✅
- [ ] MX records configured (5 records) ✅
- [ ] SPF record published and correct ✅
- [ ] DKIM generated, configured, and authenticated ✅
- [ ] DMARC record published (starting with p=none) ✅
- [ ] MTA-STS TXT record published ✅
- [ ] MTA-STS policy file accessible via HTTPS ✅
- [ ] Test email sent successfully ✅
- [ ] Test email received successfully ✅
- [ ] Email headers show SPF, DKIM, DMARC passing ✅
- [ ] MXToolbox validation passed ✅
- [ ] DMARC reporting mailbox monitored ✅
- [ ] Calendar reminder set for DMARC policy progression ✅

---

## Additional Resources

### Official Documentation

- [Google Workspace Admin Help](https://support.google.com/a/)
- [Google Workspace MX Setup](https://support.google.com/a/answer/174125)
- [Google Workspace DKIM](https://support.google.com/a/answer/174124)
- [Cloudflare DNS Docs](https://developers.cloudflare.com/dns/)

### Email Security Standards

- [SPF RFC 7208](https://datatracker.ietf.org/doc/html/rfc7208)
- [DKIM RFC 6376](https://datatracker.ietf.org/doc/html/rfc6376)
- [DMARC RFC 7489](https://datatracker.ietf.org/doc/html/rfc7489)
- [MTA-STS RFC 8461](https://datatracker.ietf.org/doc/html/rfc8461)

### Testing Tools

- [MXToolbox](https://mxtoolbox.com/)
- [Google Admin Toolbox](https://toolbox.googleapps.com/)
- [DMARC Analyzer](https://www.dmarcanalyzer.com/)
- [Mail-Tester](https://www.mail-tester.com/)
- [MTA-STS Validator](https://aykevl.nl/apps/mta-sts/)

### Repository Files

- DNS Setup Script: `scripts/cf_dns_setup.sh`
- Verification Script: `scripts/verify_email_setup.sh`
- DNS Records Documentation: `infra/DNS/PROD-records.md`
- MTA-STS Function: `functions/.well-known/mta-sts.txt.ts`

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-09  
**Maintained By**: DevOps Team  
**Support**: Contact Google Workspace support or your IT administrator
