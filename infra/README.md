# Infrastructure Documentation

This directory contains infrastructure-as-code documentation and configuration for the Designfitout platform.

## Directory Structure

```
infra/
├── DNS/
│   └── PROD-records.md    # Production DNS records specification
└── README.md              # This file
```

## DNS Configuration

### Production DNS Records

Location: [`DNS/PROD-records.md`](DNS/PROD-records.md)

Complete DNS configuration for **designfitout.com**, including:

- **Email (Google Workspace)**:
  - MX records (5 mail servers with priorities)
  - SPF record (sender policy)
  - DMARC record (authentication policy)
  - DKIM records (digital signatures)
  - MTA-STS records (transport security)

- **Web Hosting**:
  - A records (root domain)
  - CNAME records (www, mta-sts)
  - Cloudflare proxy configuration

- **Security**:
  - TLS/SSL certificate requirements
  - Cloudflare proxy recommendations
  - TTL optimization

### Automation Scripts

DNS records can be configured automatically:
- **Setup**: [`scripts/cf_dns_setup.sh`](../scripts/cf_dns_setup.sh)
- **Verification**: [`scripts/verify_email_setup.sh`](../scripts/verify_email_setup.sh)

See [`scripts/README.md`](../scripts/README.md) for usage instructions.

## Related Documentation

- **Setup Guide**: [`docs/GoogleWorkspaceSetup.md`](../docs/GoogleWorkspaceSetup.md)
- **MTA-STS Policy**: [`functions/.well-known/mta-sts.txt.ts`](../functions/.well-known/mta-sts.txt.ts)
- **Scripts README**: [`scripts/README.md`](../scripts/README.md)

---

**Last Updated**: 2025-11-09  
**Maintained By**: DevOps Team
