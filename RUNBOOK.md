# Operational Runbook: MrketOz Ops Snapshot Service

## Purpose

This runbook documents operational procedures for managing the MrketOz Ops Snapshot service, a critical component for capturing and restoring operational state snapshots. The service provides a POST endpoint at `/ops/snapshot.json` that accepts authenticated snapshot data and stores it in Cloudflare KV.

**Service Owner:** Operations Team  
**Escalation Contact:** See [Contacts](#contacts) section

## Architecture Overview

- **Endpoint:** `https://[domain]/ops/snapshot.json`
- **Authentication:** HMAC-SHA256 signature validation + Bearer token fallback
- **Storage:** Cloudflare KV namespace
- **Secret:** `MRKETOZ_SHARED_SECRET` environment variable
- **Deployment:** Cloudflare Pages Functions

## Immediate Actions for Service Failures

### Symptom: 401 Unauthorized Responses

**Possible Causes:**
1. Invalid or expired HMAC signature
2. Clock skew between client and server (>5 minutes)
3. Incorrect shared secret
4. Missing authentication headers

**Immediate Actions:**
1. Verify client timestamp is within 5 minutes of current UTC time
2. Check that client is using the correct `MRKETOZ_SHARED_SECRET`
3. Verify HMAC signature calculation: `HMAC-SHA256(secret, "${timestamp}.${body}")`
4. Check logs for specific authentication failure details
5. Test with Bearer token fallback: `Authorization: Bearer ${MRKETOZ_SHARED_SECRET}`

### Symptom: 500 Internal Server Error

**Possible Causes:**
1. KV namespace not configured
2. Missing environment variables
3. Runtime errors in function code

**Immediate Actions:**
1. Check Cloudflare dashboard for function errors
2. Verify `MRKETOZ_SHARED_SECRET` is set in environment
3. Verify KV namespace binding in wrangler.toml
4. Review function logs in Cloudflare dashboard
5. Test GET endpoint `/ops/snapshot.json` to verify service is running

### Symptom: Data Loss or Corruption

**Immediate Actions:**
1. Check KV namespace for latest snapshot
2. Restore from GitHub Actions artifacts (see [Recovery](#kv-recovery-and-restore))
3. Verify data integrity after restore
4. Document incident details for post-mortem

## Secret Rotation Procedure

**When to Rotate:**
- Scheduled rotation (every 90 days recommended)
- After suspected compromise
- Team member departure
- Post-incident requirements

**Rotation Steps:**

### Prerequisites
- Access to Cloudflare account with wrangler CLI configured
- Access to GitHub repository with `gh` CLI authenticated
- Permissions to update secrets in both platforms

### Step-by-Step Process

1. **Generate New Secret** (use `scripts/rotate-secret.sh` or manual steps below)
   
   ```bash
   # Option A: Use the rotation script
   cd scripts
   ./rotate-secret.sh
   
   # Option B: Manual generation
   NEW_SECRET=$(openssl rand -base64 32)
   echo "New secret generated. Store securely in your password vault."
   ```

2. **Store Secret in Vault**
   - **CRITICAL:** Immediately save the generated secret to your organization's password vault
   - Label: `MRKETOZ_SHARED_SECRET-[DATE]`
   - Include rotation date and operator name in vault notes

3. **Update Cloudflare Secret**
   
   ```bash
   # Set the secret in Cloudflare (interactive prompt)
   wrangler secret put MRKETOZ_SHARED_SECRET
   # Paste the new secret when prompted
   ```

4. **Update GitHub Secret**
   
   ```bash
   # Set the secret in GitHub repository
   gh secret set MRKETOZ_SHARED_SECRET --body "$NEW_SECRET"
   ```

5. **Update Local Environments**
   - Notify all team members to update their local `.env` files
   - Update any CI/CD pipelines using the secret
   - Update monitoring and alerting systems

6. **Deploy Changes**
   
   ```bash
   # Deploy the updated configuration
   wrangler pages publish
   ```

7. **Verify Rotation**
   
   ```bash
   # Test with new secret using restore script
   MRKETOZ_SHARED_SECRET="[new-secret]" \
   SNAPSHOT_FILE="test-snapshot.json" \
   ./scripts/restore-snapshot.sh
   ```

8. **Monitor for Issues**
   - Watch error rates for 1 hour after rotation
   - Verify no 401 errors from legitimate clients
   - Confirm snapshot uploads continue successfully

### Rollback Procedure

If issues occur after rotation:

```bash
# Retrieve previous secret from vault
OLD_SECRET="[from-vault]"

# Update Cloudflare
echo "$OLD_SECRET" | wrangler secret put MRKETOZ_SHARED_SECRET

# Update GitHub
gh secret set MRKETOZ_SHARED_SECRET --body "$OLD_SECRET"

# Deploy
wrangler pages publish
```

## KV Recovery and Restore

### Backup Strategy

Snapshots are automatically backed up to:
1. **Primary:** Cloudflare KV namespace (live storage)
2. **Secondary:** GitHub Actions artifacts (retention: 90 days)
3. **Tertiary:** Manual exports (operations team responsibility)

### Restore from GitHub Actions Artifacts

1. **Locate Artifact**
   - Go to GitHub repository → Actions → Workflow runs
   - Find the relevant workflow run with snapshot artifacts
   - Download artifact ZIP file

2. **Extract Snapshot**
   
   ```bash
   unzip snapshot-artifact.zip
   # Extract the snapshot JSON file
   ```

3. **Restore to KV**
   
   ```bash
   # Use the restore script
   MRKETOZ_SHARED_SECRET="[your-secret]" \
   SNAPSHOT_FILE="path/to/snapshot.json" \
   DOMAIN="https://your-domain.com" \
   ./scripts/restore-snapshot.sh
   ```

4. **Verify Restoration**
   
   ```bash
   # Check the GET endpoint
   curl https://your-domain.com/ops/snapshot.json
   ```

### Manual KV Recovery

If automated restore fails:

```bash
# Export current KV data
wrangler kv:key list --namespace-id=[namespace-id] > kv-keys.json

# Get specific snapshot
wrangler kv:key get "ops-snapshot" --namespace-id=[namespace-id] > current-snapshot.json

# Put snapshot back
wrangler kv:key put "ops-snapshot" --path=current-snapshot.json --namespace-id=[namespace-id]
```

### Creating Emergency KV Namespace

If primary KV namespace is corrupted or lost:

```bash
# Create new namespace
wrangler kv:namespace create "SNAPSHOT_KV"

# Update wrangler.toml with new namespace ID
# Update environment variable bindings
# Deploy updated configuration
wrangler pages publish
```

## Post-Incident Tasks

After resolving any incident:

1. **Document Incident**
   - Create post-mortem document
   - Include timeline, root cause, impact assessment
   - Document resolution steps taken

2. **Update Runbook**
   - Add new troubleshooting steps discovered
   - Update contact information if needed
   - Revise procedures that proved ineffective

3. **Review Monitoring**
   - Ensure alerts fired appropriately
   - Add new alerts for gaps discovered
   - Update alert thresholds if needed

4. **Team Communication**
   - Brief team on incident and resolution
   - Share lessons learned
   - Update on-call procedures if needed

5. **Secret Rotation**
   - If incident involved potential secret exposure, rotate immediately
   - Follow [Secret Rotation Procedure](#secret-rotation-procedure)

## Pre-Incident Preparation

### Pre-commit Hooks Setup

Prevent accidental secret commits with pre-commit hooks:

1. **Install detect-secrets**
   
   ```bash
   pip install detect-secrets
   ```

2. **Initialize pre-commit hooks**
   
   ```bash
   # Install pre-commit framework
   pip install pre-commit
   
   # Install hooks from .pre-commit-config.yaml
   pre-commit install
   ```

3. **Alternative: Husky for Node.js projects**
   
   ```bash
   # Install husky
   npm install --save-dev husky
   
   # Initialize husky
   npx husky install
   
   # Use the sample pre-commit hook in .husky/pre-commit
   cp .husky/pre-commit.sample .husky/pre-commit
   chmod +x .husky/pre-commit
   ```

4. **Test pre-commit hooks**
   
   ```bash
   # Run manually to test
   pre-commit run --all-files
   
   # Or test a specific file
   detect-secrets scan --baseline .secrets.baseline
   ```

**Note:** Pre-commit hooks are optional but highly recommended for preventing secret leakage.

## Verification Checklist

Use this checklist after deployments or incident resolution:

- [ ] GET `/ops/snapshot.json` returns 200 OK
- [ ] POST with valid HMAC signature returns 200 OK
- [ ] POST with invalid signature returns 401 Unauthorized
- [ ] POST with expired timestamp (>5 min) returns 401 Unauthorized
- [ ] Bearer token fallback works correctly
- [ ] KV namespace contains latest snapshot data
- [ ] Environment variable `MRKETOZ_SHARED_SECRET` is set
- [ ] Cloudflare function logs show no errors
- [ ] GitHub Actions workflow `test-ops-snapshot` passes
- [ ] Secret is stored in organizational vault
- [ ] Team members have access to updated secrets
- [ ] Monitoring dashboards show healthy metrics
- [ ] Backup artifacts exist in GitHub Actions

## Links and Resources

### Documentation
- [HMAC Signature Specification](functions/ops/snapshot.json.ts) - Implementation details
- [Restore Script Documentation](scripts/restore-snapshot.sh) - Usage and examples
- [Rotation Script Documentation](scripts/rotate-secret.sh) - Secret rotation automation

### Artifacts
- GitHub Actions Artifacts: `https://github.com/[org]/[repo]/actions`
- Cloudflare Dashboard: `https://dash.cloudflare.com/`
- KV Namespace Viewer: Cloudflare Dashboard → Workers → KV

### Monitoring
- Function Logs: Cloudflare Dashboard → Pages → [Project] → Logs
- GitHub Actions Status: Repository → Actions tab
- Uptime Monitoring: [Add your monitoring tool URL]

## Contacts

**Primary On-Call:** Operations Team  
**Escalation:** Platform Engineering  
**Security Incidents:** Security Team  

**Communication Channels:**
- Slack: #ops-incidents
- Email: ops-team@designfitout.com
- Emergency: See internal emergency contact list

## Appendix: HMAC Signature Specification

### Client Implementation

To send an authenticated snapshot:

```javascript
// 1. Prepare timestamp (ISO 8601 or epoch milliseconds)
const timestamp = new Date().toISOString();

// 2. Prepare payload
const body = JSON.stringify(snapshotData);

// 3. Compute HMAC signature
const message = `${timestamp}.${body}`;
const signature = await computeHMAC(secret, message);

// 4. Send request
fetch('https://domain.com/ops/snapshot.json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Timestamp': timestamp,
    'X-Signature': signature
  },
  body: body
});
```

### HMAC Computation

```javascript
async function computeHMAC(secret, message) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### Bearer Token Fallback

For compatibility with legacy clients:

```bash
curl -X POST https://domain.com/ops/snapshot.json \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MRKETOZ_SHARED_SECRET}" \
  -d '{"data": "snapshot"}'
```

## Version History

- **v1.0** (2025-11-09): Initial runbook creation
