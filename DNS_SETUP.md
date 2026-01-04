# DNS Configuration Guide

## Overview

This document provides comprehensive DNS configuration details for the dual-domain setup supporting both `fitoutlab.app` (primary) and `designfitout.com` (secondary) domains. The configuration is optimized for Cloudflare proxy services and modern web performance standards.

## Domain Configuration Table

### fitoutlab.app (Primary Domain)

| Record Type | Name | Value | Proxy Status | TTL | Notes |
|-------------|------|-------|--------------|-----|-------|
| A | @ | 203.0.113.1 | ✅ Proxied | Auto | Root domain - points to hosting service |
| CNAME | www | fitoutlab.app | ✅ Proxied | Auto | WWW redirect to root |
| CNAME | api | fitoutlab.app | ✅ Proxied | Auto | API endpoint routing |
| CNAME | cdn | fitoutlab.app | ✅ Proxied | Auto | CDN asset delivery |
| MX | @ | mail.fitoutlab.app | ❌ DNS Only | Auto | Mail routing (priority 10) |
| MX | @ | mail2.fitoutlab.app | ❌ DNS Only | Auto | Backup mail (priority 20) |
| TXT | @ | "v=spf1 include:_spf.google.com ~all" | ❌ DNS Only | Auto | SPF record for email auth |
| TXT | _dmarc | "v=DMARC1; p=quarantine; rua=mailto:dmarc@fitoutlab.app" | ❌ DNS Only | Auto | DMARC policy |
| TXT | google._domainkey | "v=DKIM1; k=rsa; p=..." | ❌ DNS Only | Auto | DKIM signature key |
| CNAME | _acme-challenge | challenge.fitoutlab.app | ❌ DNS Only | Auto | SSL certificate validation |

### designfitout.com (Secondary Domain)

| Record Type | Name | Value | Proxy Status | TTL | Notes |
|-------------|------|-------|--------------|-----|-------|
| A | @ | 203.0.113.1 | ✅ Proxied | Auto | Root domain - points to hosting service |
| CNAME | www | designfitout.com | ✅ Proxied | Auto | WWW redirect to root |
| CNAME | api | designfitout.com | ✅ Proxied | Auto | API endpoint routing |
| CNAME | cdn | designfitout.com | ✅ Proxied | Auto | CDN asset delivery |
| MX | @ | mail.designfitout.com | ❌ DNS Only | Auto | Mail routing (priority 10) |
| MX | @ | mail2.designfitout.com | ❌ DNS Only | Auto | Backup mail (priority 20) |
| TXT | @ | "v=spf1 include:_spf.google.com ~all" | ❌ DNS Only | Auto | SPF record for email auth |
| TXT | _dmarc | "v=DMARC1; p=quarantine; rua=mailto:dmarc@designfitout.com" | ❌ DNS Only | Auto | DMARC policy |
| TXT | google._domainkey | "v=DKIM1; k=rsa; p=..." | ❌ DNS Only | Auto | DKIM signature key |
| CNAME | _acme-challenge | challenge.designfitout.com | ❌ DNS Only | Auto | SSL certificate validation |

## Environment-Specific Subdomains

### Development Environment

| Domain | Subdomain | Purpose | Proxy Status |
|--------|-----------|---------|--------------|
| fitoutlab.app | development.fitoutlab.app | Dev environment | ✅ Proxied |
| designfitout.com | development.designfitout.com | Dev environment | ✅ Proxied |

### Staging Environment

| Domain | Subdomain | Purpose | Proxy Status |
|--------|-----------|---------|--------------|
| fitoutlab.app | staging.fitoutlab.app | Staging environment | ✅ Proxied |
| designfitout.com | staging.designfitout.com | Staging environment | ✅ Proxied |

## DNS Cleanup Recommendations

### SPF Record Consolidation
- ✅ **Current**: Single SPF record per domain
- ❌ **Avoid**: Multiple SPF records (causes validation failures)
- 🔧 **Action**: Merge any duplicate SPF entries into single record

### DKIM Configuration
- ✅ **Verify**: DKIM keys are properly generated and published
- ✅ **Test**: Use `dig TXT google._domainkey.fitoutlab.app` to verify
- 🔧 **Action**: Rotate DKIM keys annually for security

### DMARC Policy Settings
- ✅ **Current**: Quarantine policy for gradual enforcement
- 📈 **Future**: Consider upgrading to `p=reject` after monitoring
- 📊 **Monitor**: Review DMARC reports regularly

## Cloudflare Configuration

### Proxy Settings
- **HTTP/HTTPS**: All web traffic proxied through Cloudflare
- **Email Records**: MX, SPF, DKIM, DMARC set to DNS-only
- **API Endpoints**: Proxied for DDoS protection and caching
- **CDN Assets**: Proxied with aggressive caching rules

### Security Headers
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' *.youtube.com; style-src 'self' 'unsafe-inline';
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### Performance Optimization
- **Minification**: Enabled for CSS, JS, HTML
- **Brotli Compression**: Enabled
- **Browser Cache TTL**: 4 hours for static assets
- **Edge Cache TTL**: 2 hours with smart tiered caching

## Security Recommendations

### Account Access Control
⚠️ **CRITICAL**: Restrict Cloudflare and DNS management access to authorized accounts only:

- **Primary Account**: `support@designfitout.com`
- **Backup Account**: `this4arun@gmail.com` (Technical Lead)
- **2FA Required**: All accounts must have two-factor authentication enabled
- **API Keys**: Limited scope, rotate every 90 days
- **Audit Logs**: Enable and monitor all DNS changes

### Domain Security
- **DNSSEC**: Enable for both domains
- **CAA Records**: Restrict certificate authorities
- **HSTS**: Enforce HTTPS with max-age=31536000
- **Certificate Transparency**: Monitor via Google CT logs

## Monitoring and Validation

### DNS Health Checks
```bash
# Verify DNS resolution
dig @8.8.8.8 fitoutlab.app
dig @8.8.8.8 designfitout.com

# Check MX records
dig @8.8.8.8 MX fitoutlab.app
dig @8.8.8.8 MX designfitout.com

# Validate SPF/DMARC
dig @8.8.8.8 TXT fitoutlab.app
dig @8.8.8.8 TXT _dmarc.fitoutlab.app
```

### Performance Testing
- **DNS Propagation**: Use whatsmydns.net for global verification
- **SSL/TLS**: Test with SSLLabs.com
- **Performance**: Monitor with GTmetrix and Core Web Vitals

## Deployment Checklist

### Pre-Deployment
- [ ] Backup existing DNS configuration
- [ ] Verify all record values are correct
- [ ] Test configuration in staging environment
- [ ] Prepare rollback plan

### During Deployment
- [ ] Update DNS records in batches
- [ ] Monitor DNS propagation globally
- [ ] Verify SSL certificates auto-renew
- [ ] Test all subdomains and endpoints

### Post-Deployment
- [ ] Run full DNS validation suite
- [ ] Verify email delivery functionality
- [ ] Monitor performance metrics
- [ ] Update documentation with any changes

## Troubleshooting

### Common Issues
1. **DNS Propagation Delays**: Allow 24-48 hours for global propagation
2. **SSL Certificate Issues**: Verify ACME challenge records are correct
3. **Email Delivery Problems**: Check SPF/DKIM/DMARC alignment
4. **Performance Issues**: Review Cloudflare cache settings

### Support Contacts
- **DNS Issues**: Cloudflare Support (Enterprise Plan)
- **Email Problems**: Email provider support
- **Technical Issues**: `this4arun@gmail.com`

---

*Last Updated: December 2024*
*Configuration Version: 2.0*