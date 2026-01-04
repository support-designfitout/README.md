# Changelog

All notable changes to the Designfitout-Github project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Operational Runbook (RUNBOOK.md)**: Comprehensive operational procedures for the MrketOz Ops Snapshot service
  - Secret rotation procedures with step-by-step instructions
  - KV recovery and restore from GitHub Actions artifacts
  - Incident response playbook with troubleshooting steps
  - Post-incident tasks and verification checklist
  - HMAC signature specification and client implementation examples
- **Secret Rotation Script (scripts/rotate-secret.sh)**: Safe, leakage-protected bash script for rotating MRKETOZ_SHARED_SECRET
  - Generates cryptographically secure secrets using openssl
  - Updates Cloudflare secrets via wrangler CLI
  - Updates GitHub repository secrets via gh CLI
  - Creates recovery KV namespace
  - Supports DRY_RUN mode for testing
  - Comprehensive operator guidance and safety checks
- **Snapshot Restore Script (scripts/restore-snapshot.sh)**: Helper script for posting snapshots to the endpoint
  - HMAC-SHA256 signature computation
  - Automatic timestamp generation
  - Bearer token fallback support
  - JSON validation and input checking
- **HMAC Authentication for Ops Snapshot Endpoint (functions/ops/snapshot.json.ts)**: Cloudflare Pages Function with secure authentication
  - HMAC-SHA256 signature validation using Web Crypto API
  - Timestamp-based replay attack prevention (5-minute skew window)
  - Timing-safe signature comparison
  - Bearer token fallback for compatibility
  - GET endpoint for snapshot retrieval
  - POST endpoint for snapshot storage in Cloudflare KV
- **Pre-commit Security Hooks**:
  - `.pre-commit-config.yaml` with detect-secrets integration
  - `.husky/pre-commit` sample hook for npm test and secret scanning
  - Documentation in RUNBOOK.md for setup instructions
- **GitHub Actions Workflow (test-ops-snapshot.yml)**:
  - Runs on pull requests and nightly at 02:10 UTC
  - Validates ops snapshot endpoint functionality
  - Tests HMAC signature computation
  - Checks for accidental secret leakage
  - Verifies script executability
- **Test Suite (test-ops-snapshot.js)**: Comprehensive tests for ops snapshot functionality
  - HMAC signature computation validation
  - Timestamp validation and format checking
  - Request structure verification
  - Function file structure validation
  - Script file validation
  - Documentation completeness checks
  - Security checks for secret leakage
  - Pre-commit hook validation

### Changed
- Updated package.json to include `test:ops-snapshot` script
- Updated `test:all` script to include ops-snapshot tests

### Security
- All scripts designed to prevent secret leakage (no echoing of secrets to logs)
- HMAC authentication prevents unauthorized snapshot modifications
- Timing-safe comparison prevents timing attack vectors
- Pre-commit hooks help prevent accidental secret commits
- Comprehensive secret rotation procedures documented

## [1.0.0] - 2025-01-24

### Added
- Cloud-agnostic web platform for premium design and fitout solutions
- Video integration with YouTube embeds and custom controls
- Visual simulation with glassmorphism effects and scroll animations
- Strategic competitor analysis module with real-time benchmarking
- MrketOz CRM with automated chat workflows and dynamic customer operations
- Dual domain support (primary: `fitoutlab.app`, secondary: `designfitout.com`)
- Comprehensive testing suite with Playwright for cross-browser compatibility
- Brand neutrality validation system to maintain cloud-agnostic architecture
- Multi-cloud deployment support (Google Cloud, AWS, Cloudflare, etc.)
- Advanced configuration management system with environment templates
- CSP headers enforcement for enhanced security
- Core Web Vitals optimization for performance
- WCAG compliance for accessibility
- Comprehensive documentation for all modules and features

### Core Modules
- **FIX24**: Diagnostic flows and BOQ normalization
- **SpecLab**: Spec-driven schema overlays for design workflows  
- **SeveNue**: Dispatch publishing and quotation logic
- **MrketOz CRM**: Dynamic customer operations with automated workflows
- **Video Integration**: Custom YouTube embed controls
- **Strategic Analysis**: Real-time competitor benchmarking
- **Visual Simulation**: Modern glassmorphism UI effects

### Documentation
- Complete setup and deployment guides
- Cloud provider configuration documentation
- Dual domain configuration guide
- API documentation for MrketOz CRM
- Video integration feature documentation
- Comprehensive testing documentation
- Contribution guidelines and development workflow

### Technical Features
- Serverless functions for cloud-agnostic deployment
- Secrets management via symbolic paths
- Audit logging for all operations
- Performance monitoring and optimization
- Cross-browser testing automation
- Responsive design across all viewports
- Modern web standards compliance

[1.0.0]: https://github.com/support-designfitout/Designfitout-Github/releases/tag/v1.0.0