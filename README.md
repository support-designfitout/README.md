# LayOps

[![MrketOz Review](https://github.com/support-designfitout/Designfitout-Github/actions/workflows/mrketoz-review.yml/badge.svg)](https://github.com/support-designfitout/Designfitout-Github/actions/workflows/mrketoz-review.yml)

## Edge Workers

This repository includes cloud-agnostic edge workers for improved performance and API management:

- **edge-cache**: Intelligent edge caching worker
- **api-gateway**: Unified API gateway with routing and CORS support

### Quick Deploy

Workers can be deployed to multiple cloud platforms:

```bash
# Example: Deploy using your cloud provider's CLI
cd workers/edge-cache
# Follow deployment instructions in workers/edge-cache/README.md

cd ../api-gateway
# Follow deployment instructions in workers/api-gateway/README.md
```

For detailed multi-cloud deployment instructions (including AWS, Azure, Google Cloud, and others), see [WORKER_DEPLOYMENT.md](WORKER_DEPLOYMENT.md).

### Testing

```bash
# Test worker implementations
node test-workers.js

# Test brand neutrality
node test-brand-neutrality.js
```