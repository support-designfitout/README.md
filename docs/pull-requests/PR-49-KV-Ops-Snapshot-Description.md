# KV-backed Ops Snapshot System and Nightly Mirroring

## 🎯 Overview

This PR implements a comprehensive KV-backed operational snapshot system with automated nightly mirroring to Git. The system provides real-time operational state management that can be updated without redeployment, following the established patterns from `functions/api/mrketoz.json.ts` and `functions/api/registrar.json.ts`.

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    KV-backed Ops Snapshot                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐      ┌──────────────────────┐         │
│  │  KV Store        │◄─────┤  Pages Function      │         │
│  │  (OPS_KV)        │      │  /ops/snapshot.json  │         │
│  │                  │      │                      │         │
│  │  • GET: Read     │      │  • Secured by        │         │
│  │  • POST: Update  │      │    MRKETOZ_SHARED_   │         │
│  │                  │      │    SECRET            │         │
│  └────────┬─────────┘      └──────────────────────┘         │
│           │                                                  │
│           │ Nightly Sync (3:00 UTC)                         │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────┐          │
│  │  GitHub Actions Workflow                      │          │
│  │  (.github/workflows/ops-snapshot-sync.yml)    │          │
│  │                                                │          │
│  │  1. Fetch from KV                             │          │
│  │  2. Compare with Git version                  │          │
│  │  3. Upload as artifact                        │          │
│  │  4. Commit if changed                         │          │
│  └────────┬──────────────────────────────────────┘          │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────┐          │
│  │  Git Repository                               │          │
│  │  milestones/OPS_SNAPSHOT.json                 │          │
│  │                                                │          │
│  │  • Historical record                          │          │
│  │  • Version controlled                         │          │
│  │  • Audit trail                                │          │
│  └───────────────────────────────────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Implementation Components

### 1. KV Snapshot Endpoint (`functions/ops/snapshot.json.ts`)

**Purpose**: Cloudflare Pages Function for managing operational snapshots via KV storage.

**Features**:
- **GET Request**: Retrieve current operational snapshot
- **POST Request**: Update operational snapshot (secured with `MRKETOZ_SHARED_SECRET`)
- **Fallback Behavior**: Returns sensible defaults if KV is empty
- **Cloud-agnostic Pattern**: Follows repository brand neutrality standards

**Example GET Response**:
```json
{
  "timestamp": "2025-10-04T23:00:00.000Z",
  "environment": "production",
  "status": "operational",
  "services": {
    "web": { "status": "up", "latency_ms": 245 },
    "api": { "status": "up", "latency_ms": 189 },
    "functions": { "status": "up", "latency_ms": 156 }
  },
  "metrics": {
    "uptime_pct": 99.95,
    "requests_24h": 45823,
    "errors_24h": 12
  },
  "deployments": {
    "last_deploy": "2025-10-03T14:30:00Z",
    "active_version": "v2.4.1",
    "commit_sha": "1b2c7d5"
  }
}
```

**Example POST Request**:
```bash
curl -X POST https://app.fitoutlab.app/ops/snapshot.json \
  -H "Authorization: Bearer ${MRKETOZ_SHARED_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-10-04T23:00:00.000Z",
    "environment": "production",
    "status": "operational",
    ...
  }'
```

### 2. KV Namespace Binding (`wrangler.toml`)

**Purpose**: Configure KV namespace binding for the Pages Function.

**Configuration**:
```toml
[[kv_namespaces]]
binding = "OPS_KV"
id = "${KV_NAMESPACE_ID}"
preview_id = "${KV_PREVIEW_ID}"
```

**Setup Steps**:
1. Create KV namespace: `wrangler kv:namespace create "OPS_KV"`
2. Note the namespace ID from output
3. Add binding to `wrangler.toml`
4. Configure environment variable in Cloudflare dashboard

### 3. Nightly Mirroring Workflow (`.github/workflows/ops-snapshot-sync.yml`)

**Purpose**: Automated workflow to sync KV snapshot to Git repository.

**Schedule**: Daily at 3:00 AM UTC (cron: `0 3 * * *`)

**Workflow Steps**:
1. **Fetch Snapshot**: Retrieve current snapshot from KV via GET request
2. **Validate Structure**: Ensure JSON is valid and complete
3. **Compare Changes**: Check if snapshot differs from Git version
4. **Upload Artifact**: Store snapshot as workflow artifact for review
5. **Commit Changes**: Auto-commit to `milestones/OPS_SNAPSHOT.json` if changed
6. **Notification**: Optional Slack/Discord notification on changes

**Manual Trigger**: Supports `workflow_dispatch` for on-demand syncing

**Workflow Features**:
- Automatic retry on transient failures
- Artifact retention for 30 days
- Detailed logging for debugging
- Respects brand neutrality standards

### 4. Starter Template (`milestones/OPS_SNAPSHOT.template.json`)

**Purpose**: Human-readable example of the snapshot structure for documentation and testing.

**Template Structure**:
```json
{
  "_comment": "Operational snapshot template - DO NOT commit actual secrets",
  "timestamp": "ISO-8601 timestamp",
  "environment": "production|staging|development",
  "status": "operational|degraded|outage",
  "services": {
    "service_name": {
      "status": "up|down|degraded",
      "latency_ms": "number",
      "last_check": "ISO-8601 timestamp"
    }
  },
  "metrics": {
    "uptime_pct": "number (0-100)",
    "requests_24h": "integer",
    "errors_24h": "integer",
    "avg_response_time_ms": "number"
  },
  "deployments": {
    "last_deploy": "ISO-8601 timestamp",
    "active_version": "semantic version",
    "commit_sha": "git commit SHA",
    "deployed_by": "username or automation"
  },
  "alerts": {
    "active_count": "integer",
    "severity_breakdown": {
      "critical": "integer",
      "warning": "integer",
      "info": "integer"
    }
  }
}
```

## ✅ Components Checklist

### Implementation Tasks
- [x] Design KV-backed snapshot architecture
- [x] Document system components and data flow
- [ ] Create `functions/ops/snapshot.json.ts` endpoint
  - [ ] Implement GET handler with KV read
  - [ ] Implement POST handler with authentication
  - [ ] Add fallback behavior for empty KV
  - [ ] Include proper TypeScript types
  - [ ] Add JSDoc comments
- [ ] Configure KV namespace in `wrangler.toml`
  - [ ] Add `[[kv_namespaces]]` configuration
  - [ ] Document environment variable setup
- [ ] Create `.github/workflows/ops-snapshot-sync.yml`
  - [ ] Configure cron schedule (3:00 AM UTC)
  - [ ] Implement KV fetch logic
  - [ ] Add artifact upload step
  - [ ] Configure auto-commit on changes
  - [ ] Add manual trigger support
- [ ] Create `milestones/OPS_SNAPSHOT.template.json`
  - [ ] Define complete snapshot structure
  - [ ] Add inline documentation comments
  - [ ] Include example values
- [ ] Update repository documentation
  - [ ] Add section to README.md
  - [ ] Update DEVELOPMENT.md with setup steps
  - [ ] Document in CONTRIBUTION_GUIDELINES.md

### Testing Tasks
- [ ] Validate brand neutrality
  - [ ] Run `node test-brand-neutrality.js`
  - [ ] Ensure no hard-coded provider references
- [ ] Test KV endpoint functionality
  - [ ] Test GET request with empty KV
  - [ ] Test GET request with populated KV
  - [ ] Test POST request with valid secret
  - [ ] Test POST request with invalid secret
  - [ ] Test POST request with malformed JSON
- [ ] Test workflow execution
  - [ ] Manual trigger test
  - [ ] Verify artifact creation
  - [ ] Verify Git commit on change
  - [ ] Verify no commit when unchanged
- [ ] Integration testing
  - [ ] End-to-end snapshot flow
  - [ ] KV → Workflow → Git verification

### Documentation Tasks
- [ ] Code documentation
  - [ ] JSDoc comments for all functions
  - [ ] Inline comments for complex logic
  - [ ] TypeScript type definitions
- [ ] User documentation
  - [ ] Setup instructions
  - [ ] API documentation
  - [ ] Troubleshooting guide
  - [ ] Example usage scenarios

## 🧪 Testing Instructions

### Prerequisites
```bash
# Install dependencies
npm install

# Ensure Node.js 16.x or later
node --version
```

### 1. Brand Neutrality Validation
```bash
# Run brand neutrality tests
node test-brand-neutrality.js

# Expected output:
# ✅ Configuration template is valid
# ✅ No brand-specific terms found in main files
# ✅ All tests passed!
```

### 2. Local Development Testing

**Test KV Endpoint Locally**:
```bash
# Start local development server with Wrangler
wrangler pages dev public --kv OPS_KV

# In another terminal, test GET request
curl http://localhost:8788/ops/snapshot.json

# Test POST request
curl -X POST http://localhost:8788/ops/snapshot.json \
  -H "Authorization: Bearer test-secret" \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2025-10-04T23:00:00Z","status":"operational"}'
```

### 3. Workflow Testing

**Manual Workflow Trigger**:
```bash
# Trigger workflow manually via GitHub CLI
gh workflow run ops-snapshot-sync.yml

# Monitor workflow execution
gh run list --workflow=ops-snapshot-sync.yml --limit 1

# View workflow logs
gh run view --log
```

**Validate Workflow Output**:
```bash
# Check if OPS_SNAPSHOT.json was updated
git log -1 --oneline -- milestones/OPS_SNAPSHOT.json

# View the snapshot content
cat milestones/OPS_SNAPSHOT.json | jq '.'
```

### 4. Integration Testing

**Complete Flow Test**:
```bash
# 1. Update KV via POST request
curl -X POST https://app.fitoutlab.app/ops/snapshot.json \
  -H "Authorization: Bearer ${MRKETOZ_SHARED_SECRET}" \
  -H "Content-Type: application/json" \
  -d @milestones/OPS_SNAPSHOT.template.json

# 2. Verify GET request returns updated data
curl https://app.fitoutlab.app/ops/snapshot.json | jq '.'

# 3. Wait for nightly workflow or trigger manually
gh workflow run ops-snapshot-sync.yml

# 4. Verify Git repository was updated
git pull origin main
git log -1 --oneline -- milestones/OPS_SNAPSHOT.json
```

### 5. Performance Testing
```bash
# Test endpoint response time
time curl https://app.fitoutlab.app/ops/snapshot.json

# Expected: < 500ms response time
```

## 🚀 Setup Steps

### For Repository Maintainers

#### Step 1: Create KV Namespace
```bash
# Login to Cloudflare account
wrangler login

# Create production KV namespace
wrangler kv:namespace create "OPS_KV"
# Output: { binding = "OPS_KV", id = "abc123..." }

# Create preview KV namespace (for testing)
wrangler kv:namespace create "OPS_KV" --preview
# Output: { binding = "OPS_KV", preview_id = "xyz789..." }
```

#### Step 2: Configure wrangler.toml
```toml
# Add to wrangler.toml
name = "designfitout-github"

[[kv_namespaces]]
binding = "OPS_KV"
id = "abc123..."  # Replace with your actual KV namespace ID
preview_id = "xyz789..."  # Replace with your preview namespace ID
```

#### Step 3: Set Up Environment Variables

**Cloudflare Dashboard**:
1. Navigate to Workers & Pages → designfitout-github → Settings → Environment Variables
2. Add `MRKETOZ_SHARED_SECRET`: (generate secure random string)
3. Save and deploy

**GitHub Secrets**:
1. Navigate to Repository Settings → Secrets and variables → Actions
2. Add repository secret: `MRKETOZ_SHARED_SECRET`
3. Use the same value as Cloudflare environment variable

#### Step 4: Initialize KV with Template Data
```bash
# Option 1: Using wrangler CLI
wrangler kv:key put \
  --namespace-id=abc123... \
  "current" \
  "$(cat milestones/OPS_SNAPSHOT.template.json)"

# Option 2: Using curl POST request
curl -X POST https://app.fitoutlab.app/ops/snapshot.json \
  -H "Authorization: Bearer ${MRKETOZ_SHARED_SECRET}" \
  -H "Content-Type: application/json" \
  -d @milestones/OPS_SNAPSHOT.template.json
```

#### Step 5: Test the Workflow
```bash
# Manually trigger the workflow
gh workflow run ops-snapshot-sync.yml

# Wait for completion
sleep 60

# Check workflow status
gh run list --workflow=ops-snapshot-sync.yml --limit 1

# Verify the file was created/updated
cat milestones/OPS_SNAPSHOT.json
```

### For Contributors

#### Quick Setup
```bash
# 1. Clone the repository
git clone https://github.com/support-designfitout/Designfitout-Github.git
cd Designfitout-Github

# 2. Install dependencies
npm install

# 3. Run validation tests
node test-brand-neutrality.js

# 4. Review the template
cat milestones/OPS_SNAPSHOT.template.json | jq '.'

# 5. Set up local development (optional)
cp config.template.json config.json
# Edit config.json with your local settings
```

#### Local Development with KV Emulation
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare (optional, for remote KV)
wrangler login

# Start local development server with KV emulation
wrangler pages dev public --kv OPS_KV

# Test locally
curl http://localhost:8788/ops/snapshot.json
```

## 📋 API Reference

### GET `/ops/snapshot.json`

**Description**: Retrieve the current operational snapshot from KV storage.

**Authentication**: None required (read-only)

**Response**: `200 OK`
```json
{
  "timestamp": "2025-10-04T23:00:00.000Z",
  "environment": "production",
  "status": "operational",
  "services": { ... },
  "metrics": { ... },
  "deployments": { ... }
}
```

**Error Response**: `404 Not Found` (if KV is empty, returns default fallback)

### POST `/ops/snapshot.json`

**Description**: Update the operational snapshot in KV storage.

**Authentication**: Required - `Authorization: Bearer ${MRKETOZ_SHARED_SECRET}`

**Request Headers**:
```
Authorization: Bearer ${MRKETOZ_SHARED_SECRET}
Content-Type: application/json
```

**Request Body**: JSON object matching snapshot structure

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Snapshot updated successfully",
  "timestamp": "2025-10-04T23:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid authentication token
- `400 Bad Request`: Invalid JSON or malformed request body
- `500 Internal Server Error`: KV storage error

## 🔐 Security Considerations

### Authentication
- POST requests secured with `MRKETOZ_SHARED_SECRET`
- Secret stored in environment variables (never in code)
- Rotation recommended every 90 days

### Data Validation
- JSON schema validation on POST requests
- Sanitization of user-provided data
- Size limits to prevent abuse

### Access Control
- GET requests: Public (no sensitive data exposed)
- POST requests: Authenticated only
- KV namespace: Isolated per environment

### Audit Trail
- All changes logged in Git history via nightly sync
- Workflow artifacts retained for 30 days
- Timestamp tracking on all operations

## 🔍 Troubleshooting

### Common Issues

**Issue**: Workflow fails to fetch snapshot
```bash
# Solution: Verify environment variables
gh secret list
# Ensure MRKETOZ_SHARED_SECRET is set

# Test endpoint manually
curl https://app.fitoutlab.app/ops/snapshot.json
```

**Issue**: POST request returns 401 Unauthorized
```bash
# Solution: Check secret value
echo $MRKETOZ_SHARED_SECRET

# Test with explicit secret
curl -X POST https://app.fitoutlab.app/ops/snapshot.json \
  -H "Authorization: Bearer YOUR_SECRET_HERE" \
  -H "Content-Type: application/json" \
  -d '{"test":"value"}'
```

**Issue**: KV returns empty/default data
```bash
# Solution: Initialize KV with template data
wrangler kv:key put \
  --namespace-id=YOUR_NAMESPACE_ID \
  "current" \
  "$(cat milestones/OPS_SNAPSHOT.template.json)"
```

**Issue**: Workflow runs but doesn't commit changes
```bash
# Solution: Verify Git diff detection logic in workflow
# Check workflow logs for:
# - "No changes detected" message
# - Git diff output
# - Commit step execution
```

## 📚 Related Documentation

- **KV Storage Patterns**: See `functions/api/mrketoz.json.ts` and `functions/api/registrar.json.ts`
- **GitHub Actions Workflows**: See `.github/workflows/` directory
- **Brand Neutrality Standards**: See `.github/copilot-instructions.md`
- **Contribution Guidelines**: See `CONTRIBUTION_GUIDELINES.md`
- **Development Guide**: See `DEVELOPMENT.md`

## 🎯 Success Criteria

- [x] Architecture documented with clear diagrams
- [ ] All components implemented and tested
- [ ] Brand neutrality tests pass
- [ ] Workflow executes successfully on schedule
- [ ] KV endpoint responds correctly to GET/POST
- [ ] Git repository updates automatically
- [ ] Documentation complete and clear
- [ ] Security best practices followed

## 📝 Implementation Notes

### Design Decisions

1. **KV Over Database**: Chosen for serverless architecture, low latency, and automatic global replication
2. **Nightly Sync**: Balances Git history with reasonable commit frequency
3. **Template File**: Provides clear contract and documentation
4. **Shared Secret**: Simple, effective authentication for internal API

### Future Enhancements

- [ ] Multi-environment snapshot support (prod, staging, dev)
- [ ] Snapshot history retention (last N snapshots in KV)
- [ ] Alerting on significant metric changes
- [ ] Dashboard visualization of snapshot data
- [ ] Webhook notifications for snapshot updates
- [ ] GraphQL API endpoint for complex queries

### Known Limitations

- Single KV key per environment (no history in KV)
- Manual secret rotation required
- Workflow only runs on schedule or manual trigger
- No real-time change notifications

---

## 🔗 References

- **Cloudflare KV Documentation**: https://developers.cloudflare.com/kv/
- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **Repository Standards**: See `.github/copilot-instructions.md`
- **Existing Patterns**:
  - `functions/api/mrketoz.json.ts` - Similar KV-backed endpoint
  - `functions/api/registrar.json.ts` - Similar KV-backed endpoint
  - `.github/workflows/mrketoz.yml` - Similar workflow pattern

---

**Status**: 🚧 Work in Progress  
**Last Updated**: 2025-10-04  
**Related Issues**: None  
**Branch**: `copilot/fix-65d78f12-ae01-42e1-872e-b3c85efb84af`
