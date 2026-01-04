# Ops Snapshot System

## Overview

The Ops Snapshot System provides a KV-backed operational telemetry solution with nightly Git mirroring. This system enables real-time monitoring and historical tracking of operational metrics, deployments, and alerts.

## Architecture

### Components

1. **KV Snapshot Endpoint** (`functions/ops/snapshot.json.ts`)
   - Cloudflare Pages Function handling operational snapshots
   - GET: Retrieves current snapshot from KV storage
   - POST: Updates snapshot (secured with `MRKETOZ_SHARED_SECRET`)

2. **Wrangler Configuration** (`wrangler.toml`)
   - Defines `OPS_KV` namespace binding
   - Configures environment variables

3. **Nightly Sync Workflow** (`.github/workflows/ops-snapshot-sync.yml`)
   - Fetches latest snapshot from KV endpoint
   - Syncs to `milestones/OPS_SNAPSHOT.json`
   - Uploads artifacts for review
   - Commits changes if snapshot updated

4. **Template** (`milestones/OPS_SNAPSHOT.template.json`)
   - Example snapshot structure
   - Human-readable documentation

## Setup

### 1. Configure KV Namespace

Create a KV namespace in Cloudflare:

```bash
# Using Wrangler CLI
wrangler kv:namespace create "OPS_KV"
```

Update `wrangler.toml` with your KV namespace ID:

```toml
[[kv_namespaces]]
binding = "OPS_KV"
id = "YOUR_KV_NAMESPACE_ID"
```

### 2. Set Shared Secret

Set the `MRKETOZ_SHARED_SECRET` environment variable:

```bash
# For Cloudflare Pages (via Wrangler)
wrangler secret put MRKETOZ_SHARED_SECRET

# Or via Cloudflare Dashboard:
# Pages > Settings > Environment Variables
```

Also add to GitHub repository secrets for the workflow:

```
Settings > Secrets and variables > Actions > New repository secret
Name: MRKETOZ_SHARED_SECRET
Value: [your-secure-secret]
```

### 3. Deploy Functions

Deploy the Cloudflare Pages Function:

```bash
# From project root
wrangler pages deploy
```

### 4. Configure Workflow URL (Optional)

By default, the workflow fetches from `https://app.fitoutlab.app/ops/snapshot.json`.

To customize, add a repository secret:

```
Settings > Secrets and variables > Actions > New repository secret
Name: OPS_SNAPSHOT_URL
Value: https://your-domain.com/ops/snapshot.json
```

## Usage

### Reading Snapshot

**Endpoint:** `GET /ops/snapshot.json`

```bash
curl https://app.fitoutlab.app/ops/snapshot.json
```

**Response:**

```json
{
  "timestamp": "2025-01-20T12:00:00.000Z",
  "status": "operational",
  "metrics": {
    "uptime_pct": 99.95,
    "latency_ms": 150,
    "error_count": 2,
    "requests_24h": 15420
  },
  "deployments": [...],
  "alerts": [...],
  "health_checks": {...},
  "notes": "All systems operational"
}
```

### Updating Snapshot

**Endpoint:** `POST /ops/snapshot.json`

**Headers:**
- `Authorization: Bearer YOUR_MRKETOZ_SHARED_SECRET`
- `Content-Type: application/json`

```bash
curl -X POST https://app.fitoutlab.app/ops/snapshot.json \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "operational",
    "metrics": {
      "uptime_pct": 99.95,
      "latency_ms": 150,
      "error_count": 2
    },
    "notes": "Updated snapshot"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Snapshot updated",
  "timestamp": "2025-01-20T12:00:00.000Z"
}
```

### Nightly Sync

The workflow runs automatically at 2:00 AM UTC daily. To trigger manually:

1. Go to **Actions** tab in GitHub
2. Select **Ops Snapshot Sync** workflow
3. Click **Run workflow**

The workflow will:
1. Fetch the latest snapshot from KV
2. Compare with existing `milestones/OPS_SNAPSHOT.json`
3. Upload artifact for review
4. Commit changes if snapshot updated

## Snapshot Structure

See `milestones/OPS_SNAPSHOT.template.json` for the complete structure:

```json
{
  "timestamp": "ISO-8601 timestamp",
  "status": "operational|degraded|maintenance",
  "metrics": {
    "uptime_pct": 99.95,
    "latency_ms": 150,
    "error_count": 2,
    "requests_24h": 15420
  },
  "deployments": [
    {
      "service": "service-name",
      "version": "v1.0.0",
      "deployed_at": "ISO-8601 timestamp",
      "status": "healthy|degraded|failed"
    }
  ],
  "alerts": [
    {
      "severity": "info|warning|error|critical",
      "message": "Alert message",
      "created_at": "ISO-8601 timestamp"
    }
  ],
  "health_checks": {
    "service_name": "pass|fail"
  },
  "notes": "Additional operational notes",
  "updated_by": "ops-automation|manual|username"
}
```

## Security

- **POST endpoint** requires `MRKETOZ_SHARED_SECRET` via Authorization header
- **GET endpoint** is public for monitoring dashboards
- Secrets managed via Cloudflare dashboard and GitHub secrets
- No secrets committed to repository

## Monitoring

### View Workflow Runs

Check workflow execution history:

```
Actions > Ops Snapshot Sync
```

Each run includes:
- Snapshot fetch status
- Change detection results
- Commit summary (if changes detected)
- Snapshot preview in job summary

### Download Artifacts

Artifacts are retained for 30 days:

1. Go to workflow run
2. Scroll to **Artifacts** section
3. Download `ops-snapshot-[run-number]`

## Testing

Run the test suite:

```bash
npm run test:ops-snapshot
```

Tests validate:
- File structure
- Endpoint handlers (GET/POST)
- KV bindings
- Workflow configuration
- Security implementation
- Brand neutrality

## Integration Examples

### Dashboard Integration

```javascript
// Fetch and display current ops status
async function fetchOpsSnapshot() {
  const response = await fetch('https://app.fitoutlab.app/ops/snapshot.json');
  const snapshot = await response.json();
  
  updateDashboard({
    status: snapshot.status,
    uptime: snapshot.metrics.uptime_pct,
    latency: snapshot.metrics.latency_ms
  });
}
```

### Automated Updates

```javascript
// Update snapshot from monitoring system
async function updateOpsSnapshot(metrics) {
  const response = await fetch('https://app.fitoutlab.app/ops/snapshot.json', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MRKETOZ_SHARED_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: metrics.healthy ? 'operational' : 'degraded',
      metrics: {
        uptime_pct: metrics.uptime,
        latency_ms: metrics.avgLatency,
        error_count: metrics.errors
      }
    })
  });
  
  return response.json();
}
```

## Troubleshooting

### Workflow Not Running

Check:
1. Workflow is enabled in Actions tab
2. Repository has write permissions
3. Secrets are configured correctly

### POST Returns 401

Verify:
1. `MRKETOZ_SHARED_SECRET` is set in Cloudflare
2. Authorization header format: `Bearer YOUR_SECRET`
3. Secret matches between Cloudflare and your client

### Snapshot Not Updating

Check:
1. KV namespace is bound correctly in `wrangler.toml`
2. Functions are deployed
3. Endpoint is accessible

## Related Documentation

- [MRKETOZ_CRM_DOCS.md](../MRKETOZ_CRM_DOCS.md) - CRM endpoint documentation
- [CLOUD_PROVIDERS.md](../CLOUD_PROVIDERS.md) - Multi-cloud deployment guide
- [milestones/M6_STOP_2025-10-04.md](../milestones/M6_STOP_2025-10-04.md) - Operational stop procedures

## Maintenance

### Regular Tasks

1. **Review snapshot accuracy** - Verify metrics reflect actual system state
2. **Update structure** - Extend snapshot schema as needed
3. **Monitor workflow** - Check nightly sync completion
4. **Artifact cleanup** - GitHub auto-deletes after 30 days

### Extending the System

To add new metrics:

1. Update POST handler to accept new fields
2. Update template documentation
3. Modify dashboard integrations
4. Update tests if needed

## Support

For issues or questions:
- Create GitHub issue with label `ops-snapshot`
- Check workflow run logs for debugging
- Review KV namespace in Cloudflare dashboard
