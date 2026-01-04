# Designfitout-Github
Github-

# FitOutLab Capsule

## 🌐 Domain
- Primary: `fitoutlab.app`
- CNAME: `www.fitoutlab.app → fitoutlab.app` (Cloudflare proxy ON)

## 🧱 Modules
- `FIX24`: Diagnostic flows, BOQ normalization
- `SpecLab`: Spec-driven schema overlays
- `SeveNue`: Dispatch publishing, quotation logic
- `TabbyWorker`: Automated customer service workflow system

## 🔐 Credential Hygiene
- Secrets vault linked via symbolic path
- Audit logs injected for every fix and export
- Firebase CLI authenticated as `this4arun@gmail.com`

## 🚀 Deployment
- Firebase Hosting + Functions
- Global clones: 🇸🇦 🇿🇦 🇵🇭 🇨🇴 🇹🇷 🇧🇷 🇪🇬 🇮🇳
- Runtime export packaging per territory

## 🧪 Smoke Tests
- DNS: `fitoutlab.app` + `designfitout.com`
- GSC indexing + GA4 DebugView validated

## 🤖 Customer Service Automation

### Tabby Worker Flow
The MrketOz system now includes an automated customer service worker called "Tabby" that handles billing and account-related queries:

**Features:**
- Automatic ticket assignment based on keywords
- Guided response generation for common scenarios
- Complete interaction tracking and analytics
- Modular architecture for easy expansion

**Quick Start:**
```bash
cd functions
npm install
npm run lint
npm run test
firebase deploy --only functions
```

**Documentation:**
- [Full Documentation](docs/TABBY_WORKER_DOCUMENTATION.md)
- [Configuration Guide](docs/CONFIGURATION.md)

**Architecture:**
- `BaseWorker`: Abstract foundation for all workers
- `TabbyWorker`: Specialized for billing/account queries
- `WorkerFactory`: Manages multiple worker types
- Firebase Functions: Cloud processing and API endpoints
