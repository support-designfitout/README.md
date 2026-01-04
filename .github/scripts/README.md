# Health Check Scripts

This directory contains scripts for monitoring and validating API endpoint health.

## health_check.sh

Comprehensive health check script for Cloudflare Pages and API endpoints.

### Features

- **Retry Mechanism**: 3 attempts per endpoint with exponential backoff
- **Timeout Handling**: 10-second timeout per request
- **Latency Monitoring**: Warns when response time exceeds 800ms threshold
- **JSON Schema Validation**: Validates required fields for each endpoint
- **Slack Notifications**: Optional failure notifications via webhook
- **Detailed Logging**: Comprehensive logs uploaded as artifacts

### Monitored Endpoints

1. **`/health`** - Cloudflare Pages health endpoint
   - Required fields: `ok`, `kv`, `now`, `region`
   - Validates KV namespace availability
   - Returns Cloudflare region information

2. **`/api/mrketoz.json`** - MrketOz pipeline status
   - Required fields: `stage`, `branch`, `updated_at`
   - Tracks deployment pipeline state

3. **`/api/registrar.json`** - Domain registrar information
   - Required fields: `domain`, `dnssec`, `nameservers`
   - Monitors domain configuration

4. **`/api/planet.json`** - Planet touch configuration
   - Required fields: `note`
   - Current architectural stance and guidelines

### Usage

#### Basic Usage

```bash
# Run with default settings (production)
bash .github/scripts/health_check.sh

# Specify custom base URL
BASE_URL=https://staging.fitoutlab.app bash .github/scripts/health_check.sh

# Custom latency threshold
LATENCY_THRESHOLD=1000 bash .github/scripts/health_check.sh

# Enable Slack notifications
SLACK_WEBHOOK=https://hooks.slack.com/... bash .github/scripts/health_check.sh
```

#### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://app.fitoutlab.app` | Base URL for health checks |
| `MAX_RETRIES` | `3` | Maximum retry attempts per endpoint |
| `TIMEOUT` | `10` | Request timeout in seconds |
| `LATENCY_THRESHOLD` | `800` | Warning threshold in milliseconds |
| `LOG_FILE` | `health_check.log` | Output log file path |
| `SLACK_WEBHOOK` | (none) | Slack webhook URL for notifications |

### Output

The script generates a detailed log file (`health_check.log`) with:

- Timestamp for each check
- HTTP status codes
- Response latency measurements
- JSON validation results
- Error messages and retry attempts
- Summary statistics

### Exit Codes

- `0`: All health checks passed
- `1`: One or more health checks failed

### GitHub Actions Integration

The health check runs automatically via `.github/workflows/health-check.yml`:

- **Schedule**: Every 15 minutes
- **Pull Requests**: On changes to API endpoints
- **Manual Trigger**: Via workflow_dispatch

#### Workflow Features

- Uploads logs as artifacts (7-day retention)
- Comments on PRs with results summary
- Sends Slack notifications on failure
- Validates endpoints before deployment

### Example Output

```
=== Health Check Started at 2024-01-01T12:00:00Z ===
Base URL: https://app.fitoutlab.app

ℹ️  Checking endpoint: /health (Cloudflare Pages health endpoint)
ℹ️  HTTP Status: 200, Latency: 234ms
✅ Endpoint /health validated successfully (234ms)

ℹ️  Checking endpoint: /api/mrketoz.json (MrketOz pipeline status)
ℹ️  HTTP Status: 200, Latency: 156ms
✅ Endpoint /api/mrketoz.json validated successfully (156ms)

=== Health Check Summary ===
Total checks: 4
Passed: 4
Failed: 0

✅ All health checks passed!
```

### Slack Notification Format

When `SLACK_WEBHOOK` is configured, failures trigger notifications with:

- Status (success/failure)
- Total checks
- Passed count
- Failed count
- Timestamp

### Testing

Validate the health check implementation:

```bash
# Run validation tests
node test-health-check.js

# Check script syntax
bash -n .github/scripts/health_check.sh
```

### Troubleshooting

#### Common Issues

1. **curl: command not found**
   - Install curl: `apt-get install curl` or `yum install curl`

2. **jq: command not found**
   - Install jq: `apt-get install jq` or `yum install jq`

3. **bc: command not found**
   - Install bc: `apt-get install bc` or `yum install bc`

4. **Timeout errors**
   - Increase `TIMEOUT` value
   - Check network connectivity
   - Verify endpoint availability

5. **Latency warnings**
   - Check CDN cache status
   - Verify origin server performance
   - Adjust `LATENCY_THRESHOLD` if needed

### Maintenance

When adding new endpoints:

1. Update the script with new `check_endpoint` call
2. Specify required JSON fields
3. Update this README documentation
4. Add validation tests to `test-health-check.js`
5. Update workflow documentation

### Related Files

- `.github/workflows/health-check.yml` - GitHub Actions workflow
- `functions/health.ts` - Cloudflare Pages health endpoint
- `test-health-check.js` - Validation test suite
- `functions/api/mrketoz.json.ts` - MrketOz status endpoint
- `functions/api/registrar.json.ts` - Registrar status endpoint
- `functions/api/planet.json.ts` - Planet touch endpoint
