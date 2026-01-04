# Cloudflare Deployment Guide

## Prerequisites
- Cloudflare account with Workers enabled
- Wrangler CLI installed: `npm install -g wrangler`
- KV namespaces created for production and staging

## Step 1: Retrieve KV Namespace IDs

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **KV**
3. Click on your namespace (e.g., `DESIGNFITOUT_CACHE`)
4. Copy the **Namespace ID** (long alphanumeric string)
5. Repeat for both production and staging namespaces

## Step 2: Update Configuration

Replace placeholders in `wrangler.toml`:
- `YOUR_PRODUCTION_KV_ID_HERE` → Your production KV namespace ID
- `YOUR_STAGING_KV_ID_HERE` → Your staging KV namespace ID

## Step 3: Authentication

```bash
wrangler login
```

## Step 4: Deploy

**Staging:**
```bash
wrangler deploy --env staging
```

**Production:**
```bash
wrangler deploy --env production
```

## Environment Isolation Benefits

- **Separate KV Storage**: Each environment has its own isolated data
- **Different Routes**: Staging and production use distinct URLs
- **Safe Testing**: Test changes in staging without affecting production
- **Clear Deployment**: Explicit environment targeting prevents mistakes

## Troubleshooting

### Error: "KV namespace not found"
- Verify KV namespace IDs in wrangler.toml
- Ensure namespaces are created in Cloudflare dashboard
- Check that IDs match your account

### Error: "Route already exists"
- Verify route patterns don't conflict with existing workers
- Check zone_name matches your Cloudflare domain

## Next Steps

After successful deployment:
1. Test staging environment thoroughly
2. Monitor logs: `wrangler tail --env staging`
3. Deploy to production when ready
4. Set up CI/CD for automated deployments (see `.github/workflows/`)
