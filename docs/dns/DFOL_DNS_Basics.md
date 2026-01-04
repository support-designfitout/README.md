# DFOL DNS Basics — designfitout.com / fitoutlab.app

Owner: Arun K Ravi
Scope: Studio36OS / Design FitOut Lab / FitOut Lab App

---

## 1. Record types we care about

- **A** – IPv4 address for the host (web / APIs).
- **AAAA** – IPv6 address for the host.
- **CNAME** – Canonical name (aliases; typical for `www` → apex or Pages).
- **MX** – Mail exchangers (incoming email).
- **TXT** – Misc text (SPF, DKIM, DMARC, verification).
- **DS** – DNSSEC delegation (only present if DNSSEC is enabled).
- **NS** – Authoritative nameservers for the zone.

---

## 2. How to query the records (dig)

Examples for `designfitout.com`:

```bash
dig +short A designfitout.com
dig +short AAAA designfitout.com
dig +short CNAME www.designfitout.com

dig +short MX  designfitout.com
dig +short TXT designfitout.com
dig +short DS  designfitout.com

dig +short NS  designfitout.com

Same pattern for fitoutlab.app:

dig +short A fitoutlab.app
dig +short CNAME www.fitoutlab.app
dig +short MX fitoutlab.app
dig +short TXT fitoutlab.app
dig +short NS fitoutlab.app

You can also add @1.1.1.1 to force Cloudflare’s resolver:

dig +short NS designfitout.com @1.1.1.1
```

⸻

3. How to read typical outputs
	•	A

104.21.xx.xx
172.67.xx.xx

→ IPv4 addresses (Cloudflare edge IPs for proxied zones).

	•	CNAME

studio36os-site.pages.dev.

→ www (or other subdomain) is an alias for the Pages project.

	•	MX

1 aspmx.l.google.com.
5 alt1.aspmx.l.google.com.

→ Google Workspace handling mail; smaller number = higher priority.

	•	TXT

"v=spf1 include:_spf.google.com ~all"
"v=DMARC1; p=reject; rua=mailto:…"

→ SPF + DMARC examples. There may be multiple TXT records.

	•	NS

ashley.ns.cloudflare.com.
ivan.ns.cloudflare.com.

→ Zone is managed in the Studio36OS Cloudflare account.

	•	DS

12345 13 2 ABCD1234…

→ DNSSEC delegation; presence means DNSSEC is enabled.

⸻

4. Expected configuration — Studio36OS canonical state

designfitout.com
	•	NS: ashley.ns.cloudflare.com., ivan.ns.cloudflare.com.
	•	A / AAAA: Cloudflare edge IPs (proxied).
	•	CNAME www → designfitout.com or studio36os-site.pages.dev.
	•	MX: Google Workspace MX set (aspmx + alts).
	•	TXT:
	•	SPF: v=spf1 include:_spf.google.com …
	•	DKIM: google._domainkey.designfitout.com
	•	DMARC: _dmarc.designfitout.com with p=reject.

fitoutlab.app
	•	NS: same pair – ashley.ns.cloudflare.com., ivan.ns.cloudflare.com.
	•	A / AAAA: Cloudflare edge IPs (proxied).
	•	CNAME www → fitoutlab.app or studio36os-site.pages.dev.
	•	MX/TXT: same pattern as above when mail is active.

⸻

5. One-shot health check (manual)
From any machine with dig + curl:

# Nameservers
dig +short NS designfitout.com @1.1.1.1
dig +short NS fitoutlab.app     @1.1.1.1

# Web reachability (HTTPS)
curl -I https://designfitout.com
curl -I https://www.designfitout.com
curl -I https://fitoutlab.app
curl -I https://www.fitoutlab.app

Healthy state:
	•	NS shows ashley / ivan for both domains.
	•	each curl -I returns HTTP/2 200 or a clean 301/302 with server: cloudflare.

If any of those checks fail, file a MISS ticket and run the automated DNS repair / verification flow in Studio36OS.

---