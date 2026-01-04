# LayOps

[![MrketOz Review](https://github.com/support-designfitout/Designfitout-Github/actions/workflows/mrketoz-review.yml/badge.svg)](https://github.com/support-designfitout/Designfitout-Github/actions/workflows/mrketoz-review.yml)

## Deployment

This project uses serverless edge workers with environment-specific configurations.

### Quick Start

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Configure KV Namespaces:**
   See [Edge Worker Deployment Guide](docs/EDGE_WORKER_DEPLOYMENT.md) for detailed instructions.

3. **Deploy:**
   ```bash
   # Staging
   wrangler deploy --env staging
   
   # Production
   wrangler deploy --env production
   ```

For complete deployment instructions, see [docs/EDGE_WORKER_DEPLOYMENT.md](docs/EDGE_WORKER_DEPLOYMENT.md).