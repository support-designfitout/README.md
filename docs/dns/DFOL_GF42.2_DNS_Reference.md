# DFOL GF42.2 — DNS Reference & Verification Guide

Scope: designfitout.com, fitoutlab.app

## Record Types We Care About

- **A** — IPv4 address (web / API endpoints)
- **AAAA** — IPv6 address
- **CNAME** — canonical name aliases (www → apex or → Pages)
- **MX** — mail exchange for email delivery
- **TXT** — SPF, DKIM, DMARC, verification and ledger digests
- **DS** — DNSSEC delegation signer (if DNSSEC enabled)
- **NS** — authoritative nameservers (where the zone is hosted)

## Quick Commands (dig)

```bash
# Apex A / AAAA
dig +short A    designfitout.com
dig +short AAAA designfitout.com

# WWW CNAME / A
dig +short CNAME www.designfitout.com
dig +short A     www.designfitout.com

# MX / TXT
dig +short MX  designfitout.com
dig +short TXT designfitout.com

# Ledger TXT
dig +short TXT _ledger.designfitout.com
dig +short TXT _ledger.fitoutlab.app

# NS (should be Cloudflare ashley / ivan)
dig +short NS designfitout.com
dig +short NS fitoutlab.app
```

Expected Nameservers (Cloudflare)

ashley.ns.cloudflare.com.
ivan.ns.cloudflare.com.

Ledger Digest

The canonical GF42.2 online certificate digest is:

sha256=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

This value must match the TXT records at:

_ledger.designfitout.com.
_ledger.fitoutlab.app.

Any mismatch indicates an out-of-sync ledger and must be corrected via the DFOL ledger:upsert-and-verify workflow.