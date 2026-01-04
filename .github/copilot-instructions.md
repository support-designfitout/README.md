# Copilot Instructions for Designfitout-Github Repository

## Summary
The `Designfitout-Github` repository powers a cloud-agnostic web platform for premium design and fitout solutions. It features video integration, visual simulation, and strategic competitor analysis to streamline workflows for luxury design and fitout services.

## High-Level Repository Information
- **Project Type**: Cloud-agnostic web platform with serverless functions.
- **Primary Languages**: JavaScript, HTML, CSS.
- **Frameworks**: No specific framework; uses Google Cloud CLI tools.
- **Target Runtimes**: Google Cloud or other static hosting and serverless platforms.
- **Repository Size**: Medium-sized project with structured directories for assets, functions, and configurations.

---

## Build and Validation Instructions

### Environment Setup
1. Copy `config.template.json` to `config.json`.
2. Update your cloud provider settings in `config.json`.
3. Set up authentication credentials for Google Cloud.
4. Install Node.js (recommended version: 16.x).

### Bootstrap
- **Preconditions**:
  - Ensure all required environment variables are set (see `.env.example` or `CLOUD_PROVIDERS.md`).
  - Verify Google Cloud CLI is installed and authenticated.

### Build
- No explicit build step is required; assets and functions are deployed directly to the cloud.

### Testing and Validation
1. **Run Brand Neutrality Validation**:
   ```bash
   node test-brand-neutrality.js
   ```
   - This validates platform-agnostic code and configuration templates.
2. **Smoke Tests**:
   - Verify DNS resolution for primary (`fitoutlab.app`) and secondary (`designfitout.com`) domains.
   - Ensure search indexing, analytics, and performance metrics monitoring.
   - Check Content Security Policy (CSP) headers.

### Deployment
1. Configure Google Cloud in `config.json`.
2. Run validation:
   ```bash
   node test-brand-neutrality.js
   ```
3. Deploy using Google Cloud commands:
   ```bash
   firebase deploy --only hosting,functions
   ```
4. Verify deployment with smoke tests.

---

## Project Layout
### Directory Structure
```plaintext
/
├── public/                    # Frontend assets and pages
│   ├── index.html             # Main landing page with video integration
│   ├── ind2x.html             # FitOutLab capsule interface
│   └── strategic-analysis.js  # Real-time competitor analysis module
├── functions/                 # Serverless functions
│   └── index.js               # Cloud functions implementation
├── config.template.json       # Configuration template for cloud providers
├── hosting.json               # Hosting configuration (cloud-agnostic)
├── deploy/                    # Deployment scripts and documentation
├── roots/                     # Domain routing configuration
├── test-brand-neutrality.js   # Brand neutrality and structure validation
├── CLOUD_PROVIDERS.md         # Multi-cloud deployment guide
├── VIDEO_SIMULATION_DOCS.md   # Detailed feature documentation
└── issues/                    # Project issues and migration notes
```

### Validation Pipelines
- **Automated Tests**:
  - Brand neutrality validation.
  - File structure and configuration validation.
- **Continuous Integration**: Not explicitly defined but should integrate smoke tests into CI pipelines.
- **Manual Validation**:
  - Verify runtime export packaging per region.
  - Test DNS and CDN performance.

---

## Key Notes for Efficient Coding
1. Always validate changes using `node test-brand-neutrality.js` before deploying.
2. Trust the environment setup instructions provided in `CLOUD_PROVIDERS.md` for cloud-specific configurations.
3. Use Google Cloud CLI tools for local development and deployment (e.g., `firebase`).
4. Follow coding standards for security (CSP headers), performance (Core Web Vitals), and accessibility (WCAG compliance).
