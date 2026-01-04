# Google Workspace Setup Guide for designfitout.com

This guide provides step-by-step instructions for setting up Google Workspace email for the designfitout.com domain.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Domain Verification](#domain-verification)
3. [DKIM Configuration](#dkim-configuration)
4. [DMARC Monitoring and Tuning](#dmarc-monitoring-and-tuning)
5. [Post-Setup Verification](#post-setup-verification)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

## Prerequisites

Before starting, ensure you have:

- ✅ Google Workspace account (any plan: Business Starter, Standard, Plus, or Enterprise)
- ✅ Admin access to Google Workspace Admin Console
- ✅ Access to Cloudflare account for designfitout.com
- ✅ DNS records configured (see [DNS Records Documentation](../infra/DNS/PROD-records.md))

### Required DNS Records

Run the DNS setup script to configure all required records:

```bash
export CF_API_TOKEN="your-cloudflare-api-token"
export ZONE_ID="your-zone-id"
./scripts/cf_dns_setup.sh
```

This script configures:
- MX records (email routing)
- SPF record (sender authentication)
- DMARC record (email policy)
- MTA-STS record (transport security)

## Domain Verification

Domain verification proves to Google that you own designfitout.com.

### Step 1: Access Google Workspace Admin Console

1. Go to [admin.google.com](https://admin.google.com)
2. Sign in with your Google Workspace admin account
3. Navigate to **Account** → **Domains** → **Manage domains**

### Step 2: Add Your Domain

1. Click **Add a domain** or **Add domain**
2. Enter `designfitout.com`
3. Select domain purpose:
   - Choose **User email addresses** for primary email domain
   - Or **Secondary domain** if you already have another primary domain

### Step 3: Choose Verification Method

Google offers several verification methods. **TXT record method is recommended**.

#### Option A: TXT Record Verification (Recommended)

1. Google will provide a verification code that looks like:
   ```
   google-site-verification=ABC123xyz456...
   ```

2. Add this as a TXT record in Cloudflare:
   
   **Using Cloudflare Dashboard**:
   - Log in to Cloudflare
   - Select designfitout.com domain
   - Go to **DNS** → **Records**
   - Click **Add record**
   - Type: `TXT`
   - Name: `@` (or leave as `designfitout.com`)
   - Content: Paste the verification code from Google
   - TTL: `Auto` or `3600`
   - Proxy status: **DNS only** (grey cloud)
   - Click **Save**

   **Using Cloudflare API**:
   ```bash
   curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
     -H "Authorization: Bearer ${CF_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{
       "type":"TXT",
       "name":"designfitout.com",
       "content":"google-site-verification=YOUR_CODE_HERE",
       "ttl":3600,
       "proxied":false
     }'
   ```

3. Wait 5-10 minutes for DNS propagation

4. Verify DNS propagation:
   ```bash
   dig TXT designfitout.com +short | grep google-site-verification
   ```

5. Return to Google Admin Console and click **Verify**

#### Option B: CNAME Record Verification

1. Google provides a unique CNAME record
2. Add the CNAME record to Cloudflare DNS
3. Wait for propagation and click **Verify**

#### Option C: HTML File Upload

1. Download the HTML verification file from Google
2. Upload to `https://designfitout.com/[filename].html`
3. Click **Verify**

### Step 4: Activate Gmail

After verification:
1. Google Admin Console → **Apps** → **Google Workspace** → **Gmail**
2. Click **Activate Gmail**
3. Confirm activation

**Note**: It may take up to 24 hours for Gmail activation to complete, but typically takes 5-30 minutes.

## DKIM Configuration

DKIM (DomainKeys Identified Mail) adds a digital signature to outgoing emails, proving they came from your domain.

### Step 1: Generate DKIM Key

1. Google Admin Console → **Apps** → **Google Workspace** → **Gmail**
2. Click **Authenticate email**
3. Select **Generate new record**
4. Configure DKIM settings:
   - **Prefix selector**: Use default `google` or custom name
   - **DKIM key length**: Select **2048 bits** (recommended for security)
   - Click **Generate**

### Step 2: Get DKIM DNS Record

Google will generate a DKIM record that looks like:

```
Hostname/Name: google._domainkey.designfitout.com
Type: TXT
Value: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
```

**Important Notes**:
- The value is very long (300+ characters)
- Google may display it in multiple parts that need to be concatenated
- Remove any spaces when concatenating parts

### Step 3: Add DKIM Record to Cloudflare

**Using Cloudflare Dashboard**:
1. Cloudflare Dashboard → **DNS** → **Records**
2. Click **Add record**
3. Configure:
   - Type: `TXT`
   - Name: `google._domainkey` (or `google._domainkey.designfitout.com`)
   - Content: Paste the full DKIM public key (including `v=DKIM1; k=rsa; p=...`)
   - TTL: `3600`
   - Proxy status: **DNS only** (grey cloud)
4. Click **Save**

**Using Cloudflare API**:
```bash
DKIM_VALUE="v=DKIM1; k=rsa; p=YOUR_LONG_PUBLIC_KEY_HERE"

curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\":\"TXT\",
    \"name\":\"google._domainkey.designfitout.com\",
    \"content\":\"${DKIM_VALUE}\",
    \"ttl\":3600,
    \"proxied\":false
  }"
```

### Step 4: Verify DKIM Record

1. Wait 5-10 minutes for DNS propagation
2. Verify the record:
   ```bash
   dig TXT google._domainkey.designfitout.com +short
   ```
   
3. Expected output should show your DKIM public key

### Step 5: Start DKIM Signing

1. Return to Google Admin Console → **Authenticate email**
2. Find your DKIM record
3. Click **Start authentication**
4. Status should change to "Authenticating email"

**Note**: 
- It can take up to 48 hours for DKIM signing to fully activate
- Usually completes within 1-2 hours
- During this time, some emails may not have DKIM signatures

### Multiple Selectors (Advanced)

For email continuity during key rotation, you can configure multiple DKIM selectors:

1. Generate a second DKIM key with different selector (e.g., `google2`)
2. Add both DNS records
3. Activate the new key while keeping the old one active
4. After 24-48 hours, deactivate the old key

## DMARC Monitoring and Tuning

DMARC provides email authentication policy and reporting. The DNS record is already configured by the setup script.

### Current DMARC Policy

```
v=DMARC1; p=none; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s
```

**Policy Breakdown**:
- `p=none`: Monitor-only mode (no enforcement)
- `rua=mailto:dmarc@designfitout.com`: Send aggregate reports here
- `pct=100`: Apply policy to 100% of emails
- `adkim=s`: Strict DKIM alignment
- `aspf=s`: Strict SPF alignment

### Step 1: Set Up DMARC Report Inbox

1. Create email alias: `dmarc@designfitout.com`
2. Forward to a monitored mailbox
3. Set up email filters for DMARC reports (they arrive as XML attachments)

**In Google Workspace**:
1. Admin Console → **Account** → **Domains** → **Manage domains**
2. Click on `designfitout.com`
3. Click **Domain aliases** or **Add domain alias**
4. Add email routing rule: `dmarc@designfitout.com` → your admin email

### Step 2: Monitor DMARC Reports (Week 1-2)

DMARC reports are sent daily by recipient email servers (Gmail, Outlook, etc.).

**What to Look For**:
- ✅ **SPF Pass**: Emails passing SPF authentication
- ✅ **DKIM Pass**: Emails passing DKIM authentication  
- ✅ **DMARC Pass**: Emails passing overall DMARC check
- ⚠️ **Failures**: Investigate sources of failed authentication

**Report Analysis Tools**:
- **Dmarcian**: https://dmarcian.com/ (free tier available)
- **Postmark DMARC**: https://dmarc.postmarkapp.com/ (free)
- **MXToolbox DMARC**: https://mxtoolbox.com/dmarc.aspx
- **Manual**: Parse XML reports with Python/script

**Example Python parser**:
```python
import xml.etree.ElementTree as ET
import glob

for report_file in glob.glob('*.xml'):
    tree = ET.parse(report_file)
    root = tree.getroot()
    
    for record in root.findall('.//record'):
        source_ip = record.find('.//source_ip').text
        count = record.find('.//count').text
        spf = record.find('.//spf').text
        dkim = record.find('.//dkim').text
        
        print(f"IP: {source_ip}, Count: {count}, SPF: {spf}, DKIM: {dkim}")
```

### Step 3: Investigate Failures

Common failure scenarios:

#### Forwarded Emails
- **Issue**: Email forwarding breaks SPF
- **Solution**: This is expected; DKIM should still pass

#### Third-party Senders
- **Issue**: Marketing platforms, CRM systems sending on your behalf
- **Solution**: Add their domains to SPF record or ensure they support DKIM

#### Spoofing Attempts
- **Issue**: Unauthorized senders using your domain
- **Solution**: This is why DMARC exists; they should fail

### Step 4: Upgrade to Quarantine (Week 3-4)

After 7-14 days of monitoring with no unexpected failures:

1. Update DMARC policy to quarantine mode:
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s
   ```

2. Update DNS record in Cloudflare:
   ```bash
   # Find existing DMARC record ID
   curl -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=TXT&name=_dmarc.designfitout.com" \
     -H "Authorization: Bearer ${CF_API_TOKEN}"
   
   # Update record (replace RECORD_ID)
   curl -X PUT "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/RECORD_ID" \
     -H "Authorization: Bearer ${CF_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{
       "type":"TXT",
       "name":"_dmarc.designfitout.com",
       "content":"v=DMARC1; p=quarantine; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s",
       "ttl":3600,
       "proxied":false
     }'
   ```

3. Monitor for another 7-14 days

**Quarantine Mode**:
- Emails failing DMARC go to spam/junk folder
- Legitimate emails still delivered to inbox
- Safer than reject mode

### Step 5: Upgrade to Reject (Week 5+)

After successful quarantine monitoring:

1. Update DMARC policy to reject mode:
   ```
   v=DMARC1; p=reject; rua=mailto:dmarc@designfitout.com; pct=100; adkim=s; aspf=s
   ```

2. Update DNS record using same API method as above

**Reject Mode**:
- Emails failing DMARC are rejected (not delivered)
- Maximum security and protection
- Only use after thorough testing

### Gradual Rollout (Recommended)

Start reject mode at low percentage, gradually increase:

```
Week 5:  p=reject; pct=10   (10% of emails)
Week 6:  p=reject; pct=25   (25% of emails)
Week 7:  p=reject; pct=50   (50% of emails)
Week 8:  p=reject; pct=100  (100% of emails)
```

Update `pct` value in DMARC record for each phase.

## Post-Setup Verification

### Automated Verification Script

Run the comprehensive verification script:

```bash
./scripts/verify_email_setup.sh
```

This checks:
- ✅ MX records
- ✅ SPF record
- ✅ DMARC record
- ✅ MTA-STS DNS and policy endpoint
- ✅ SSL certificates
- ✅ SMTP connectivity

### Manual Verification

#### Test Email Delivery

1. **Send Test Email**:
   - From: your-email@designfitout.com
   - To: your personal Gmail/Outlook account
   
2. **Check Headers** (in Gmail):
   - Open email → Three dots menu → **Show original**
   - Look for authentication results:
     ```
     Authentication-Results: mx.google.com;
       dkim=pass header.i=@designfitout.com;
       spf=pass smtp.mailfrom=designfitout.com;
       dmarc=pass
     ```

3. **Verify DKIM Signature**:
   - Should show: `dkim=pass`
   - Signature includes: `d=designfitout.com`

4. **Verify SPF**:
   - Should show: `spf=pass`
   - Mailfrom domain: `designfitout.com`

5. **Verify DMARC**:
   - Should show: `dmarc=pass`

#### Check Google Workspace Status

1. Admin Console → **Reports** → **Email log search**
2. Search for sent test email
3. View delivery status and authentication results

#### External Tools

Use online tools for comprehensive testing:

1. **Mail Tester**:
   - Send email to: test-xxxxx@mail-tester.com (get unique address from site)
   - Visit: https://www.mail-tester.com
   - Check score (aim for 10/10)

2. **MXToolbox**:
   - Visit: https://mxtoolbox.com/SuperTool.aspx
   - Test: `designfitout.com`
   - Check: MX Lookup, SPF Record, DMARC, DKIM

3. **Google Admin Toolbox**:
   - Visit: https://toolbox.googleapps.com/apps/checkmx/
   - Enter: `designfitout.com`
   - Review all checks

## Troubleshooting

### Issue: Domain Verification Fails

**Symptoms**: Google cannot verify domain ownership

**Solutions**:
1. Verify DNS record is correct:
   ```bash
   dig TXT designfitout.com +short | grep google-site-verification
   ```

2. Wait 10-15 minutes for DNS propagation

3. Clear DNS cache:
   ```bash
   # Linux
   sudo systemd-resolve --flush-caches
   
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   ```

4. Try verification again

5. If still failing, try alternative verification method (CNAME or HTML)

### Issue: Emails Not Being Received

**Symptoms**: Sent emails never arrive

**Solutions**:
1. Check MX records:
   ```bash
   dig MX designfitout.com +short
   ```
   Should show Google mail servers (aspmx.l.google.com)

2. Verify MX records are **not proxied** in Cloudflare (must be grey cloud)

3. Check Gmail is activated in Admin Console

4. Wait up to 24 hours for MX changes to propagate globally

5. Test with external SMTP:
   ```bash
   swaks --to test@designfitout.com --from external@gmail.com --server aspmx.l.google.com
   ```

### Issue: DKIM Not Signing Emails

**Symptoms**: Email headers show `dkim=none` or no DKIM signature

**Solutions**:
1. Verify DKIM DNS record:
   ```bash
   dig TXT google._domainkey.designfitout.com +short
   ```

2. Check DKIM is activated in Admin Console

3. Wait up to 48 hours for DKIM activation

4. Ensure DNS record is **not proxied**

5. Verify no typos in DKIM public key

### Issue: SPF Failures

**Symptoms**: Email headers show `spf=fail` or `spf=softfail`

**Solutions**:
1. Verify SPF record:
   ```bash
   dig TXT designfitout.com +short | grep spf
   ```

2. Ensure SPF includes Google Workspace:
   ```
   v=spf1 include:_spf.google.com ~all
   ```

3. Check for multiple SPF records (only one allowed)

4. Test SPF with online tool:
   ```
   https://mxtoolbox.com/spf.aspx
   ```

### Issue: DMARC Reports Not Received

**Symptoms**: No DMARC reports arriving at dmarc@designfitout.com

**Solutions**:
1. Verify email alias is configured

2. Check spam/junk folder

3. Wait 24-48 hours (reports sent daily, may take time to start)

4. Ensure DMARC record has correct `rua=` value

5. Some email providers send reports only if authentication fails

### Issue: MTA-STS Policy Not Accessible

**Symptoms**: Cannot access https://mta-sts.designfitout.com/.well-known/mta-sts.txt

**Solutions**:
1. Verify mta-sts DNS record:
   ```bash
   dig A mta-sts.designfitout.com +short
   ```

2. Ensure Cloudflare Pages Function is deployed

3. Check SSL certificate is valid

4. Test locally:
   ```bash
   curl -v https://mta-sts.designfitout.com/.well-known/mta-sts.txt
   ```

5. Deploy MTA-STS function from `functions/.well-known/mta-sts.txt.ts`

## Best Practices

### Email Security

1. **Use Strong Passwords**:
   - Enable 2FA for all admin accounts
   - Require strong passwords for all users

2. **Regular Monitoring**:
   - Review DMARC reports weekly
   - Monitor email delivery rates
   - Check for spoofing attempts

3. **Keep Software Updated**:
   - Update DKIM keys every 1-2 years
   - Monitor Google Workspace security advisories

### DMARC Policy Progression

✅ **Do**:
- Start with `p=none` (monitor)
- Analyze reports for 7-14 days minimum
- Gradually increase strictness
- Use `pct` parameter for gradual rollout

❌ **Don't**:
- Jump directly to `p=reject` without testing
- Ignore DMARC reports
- Set `p=reject` with `pct=100` on day one

### Email Deliverability

1. **Warm Up New Domain**:
   - Start with low email volume
   - Gradually increase over 2-4 weeks
   - Avoid mass emails initially

2. **Monitor Reputation**:
   - Check sender reputation: https://www.senderscore.org/
   - Monitor blocklists: https://mxtoolbox.com/blacklists.aspx

3. **Avoid Spam Triggers**:
   - Use clear subject lines
   - Include unsubscribe links in marketing emails
   - Maintain low complaint rates

### Documentation

Keep records of:
- Domain verification completion date
- DKIM activation date
- DMARC policy changes and dates
- Any email authentication issues and resolutions

## Additional Resources

### Official Documentation
- [Google Workspace Admin Help](https://support.google.com/a)
- [Gmail DKIM Setup](https://support.google.com/a/answer/174124)
- [Google DMARC Guide](https://support.google.com/a/answer/2466580)

### Email Authentication Standards
- [RFC 7208 - SPF](https://tools.ietf.org/html/rfc7208)
- [RFC 6376 - DKIM](https://tools.ietf.org/html/rfc6376)
- [RFC 7489 - DMARC](https://tools.ietf.org/html/rfc7489)
- [RFC 8461 - MTA-STS](https://tools.ietf.org/html/rfc8461)

### Testing Tools
- [Mail Tester](https://www.mail-tester.com/)
- [MXToolbox](https://mxtoolbox.com/)
- [Google Admin Toolbox](https://toolbox.googleapps.com/)
- [Dmarcian](https://dmarcian.com/)
- [MTA-STS Validator](https://aykevl.nl/apps/mta-sts/)

### Related Documentation
- [DNS Records Documentation](../infra/DNS/PROD-records.md)
- [DNS Setup Script](../scripts/cf_dns_setup.sh)
- [Verification Script](../scripts/verify_email_setup.sh)

---

**Support**: For issues not covered in this guide, contact Google Workspace support or consult the official documentation.

**Last Updated**: 2025-11-09
