# Quick Start Guide: Ops Snapshot System

## What Was Implemented

A complete KV-backed operational snapshot system with these components:

1. **Snapshot Endpoint** - `functions/ops/snapshot.json.ts`
   - GET: Read current snapshot from KV
   - POST: Update snapshot (secured with shared secret)

2. **Configuration** - `wrangler.toml`
   - OPS_KV namespace binding
   - Environment setup

3. **Nightly Sync** - `.github/workflows/ops-snapshot-sync.yml`
   - Runs at 2:00 AM UTC daily
   - Fetches snapshot from KV
   - Commits to `milestones/OPS_SNAPSHOT.json`

4. **Template** - `milestones/OPS_SNAPSHOT.template.json`
   - Example snapshot structure

## Setup Steps (5 minutes)

### Step 1: Create KV Namespace
```bash
wrangler kv:namespace create "OPS_KV"
# Output: Created namespace with ID: abc123...
```

### Step 2: Update wrangler.toml
Replace `YOUR_OPS_KV_ID_HERE` with your actual KV namespace ID:
```toml
[[kv_namespaces]]
binding = "OPS_KV"
id = "abc123..."  # Your actual ID from Step 1
```

### Step 3: Set Shared Secret
```bash
# In Cloudflare
wrangler secret put MRKETOZ_SHARED_SECRET
# Enter your secret when prompted
```

### Step 4: Deploy
```bash
wrangler pages deploy
```

### Step 5: Configure GitHub (Optional)
Add secrets in GitHub: Settings > Secrets and variables > Actions
- `MRKETOZ_SHARED_SECRET` - Same value as Cloudflare
- `OPS_SNAPSHOT_URL` - (Optional) Custom endpoint URL

## Test the Endpoint

### Read Snapshot
```bash
curl https://app.fitoutlab.app/ops/snapshot.json
```

### Update Snapshot
```bash
curl -X POST https://app.fitoutlab.app/ops/snapshot.json \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"status": "operational", "metrics": {"uptime_pct": 99.9}}'
```

## Test the Workflow

1. Go to GitHub Actions tab
2. Select "Ops Snapshot Sync"
3. Click "Run workflow"
4. Check the run results

## File Structure

```
├── functions/ops/snapshot.json.ts       # Endpoint implementation
├── wrangler.toml                         # Configuration
├── .github/workflows/ops-snapshot-sync.yml  # Nightly sync
├── milestones/
│   ├── OPS_SNAPSHOT.template.json        # Example
│   └── OPS_SNAPSHOT.json                 # Synced data (created by workflow)
├── test-ops-snapshot.js                  # Tests
└── OPS_SNAPSHOT_DOCS.md                  # Full documentation
```

## Verify Installation

```bash
npm run test:ops-snapshot
# Should show: 15/15 tests passing
```

## Common Issues

**401 Unauthorized**: Check that MRKETOZ_SHARED_SECRET matches in both Cloudflare and your request

**Workflow not running**: Enable the workflow in GitHub Actions tab

**No KV data**: Use POST endpoint to create initial snapshot

## Next Steps

1. Review full documentation in `OPS_SNAPSHOT_DOCS.md`
2. Customize snapshot structure for your needs
3. Integrate with monitoring dashboards
4. Set up automated updates from monitoring systems

## Support

- Full docs: `OPS_SNAPSHOT_DOCS.md`
- Run tests: `npm run test:ops-snapshot`
- Check workflow: GitHub Actions > Ops Snapshot Sync
