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
1. **Install Dependencies**:
   ```bash
   # Node.js 16.x or later required
   node --version  # Verify installation
   ```

2. **Configure Repository**:
   ```bash
   # Clone and setup
   git clone https://github.com/support-designfitout/Designfitout-Github.git
   cd Designfitout-Github
   
   # Create local configuration (optional)
   cp config.template.json config.json
   # Edit config.json with your cloud provider settings
   ```

3. **Initial Validation**:
   ```bash
   # ALWAYS run this first to ensure repository integrity
   node test-brand-neutrality.js
   ```

### Bootstrap
- **Preconditions**:
  - Node.js 16.x or later installed
  - Git configured with proper credentials
  - Access to cloud provider (optional for local development)
  - Understanding of cloud-agnostic development principles

### Build
- **No traditional build step required** - this is a serverless web platform
- Assets and functions deployed directly to cloud providers
- Configuration managed through `config.json` (local) and `config.template.json` (template)

### Testing and Validation

#### Core Test Suite (Required)
```bash
# 1. Brand neutrality and configuration validation
node test-brand-neutrality.js

# 2. MrketOz CRM functionality testing  
node test-mrketoz-crm.js

# Expected output for both: "All tests passed!"
```

#### Manual Validation Checklist
- [ ] DNS resolution for dual domains (`fitoutlab.app`, `designfitout.com`)
- [ ] CSP headers properly configured
- [ ] Core Web Vitals performance metrics acceptable
- [ ] Video integration functioning (YouTube embeds)
- [ ] Strategic analysis module operational
- [ ] No hard-coded cloud provider references in code

#### Advanced Configuration Testing
```bash
# Validate configuration management
node config-manager.js validate

# Generate environment report
node config-manager.js report development
```

### Deployment
1. **Pre-deployment validation**:
   ```bash
   node test-brand-neutrality.js && node test-mrketoz-crm.js
   ```

2. **Configure cloud provider** (see `CLOUD_PROVIDERS.md` for multi-cloud options)

3. **Deploy** (cloud-specific commands):
   ```bash
   # Example for Google Cloud:
   firebase deploy --only hosting,functions
   
   # Example for other providers: see CLOUD_PROVIDERS.md
   ```

4. **Post-deployment verification**: Test all smoke test criteria listed above

---

## Project Layout

### Directory Structure
```plaintext
/
├── .github/                     # GitHub configuration and workflows
│   └── copilot-instructions.md  # This file - AI coding assistant guidance
├── public/                      # Frontend assets and pages
│   ├── index.html              # Main landing page with video integration
│   ├── ind2x.html              # FitOutLab capsule interface  
│   ├── strategic-analysis.js   # Real-time competitor analysis module
│   └── styles.css              # Main stylesheet with glassmorphism effects
├── functions/                   # Serverless functions
│   ├── index.js                # Main cloud functions implementation
│   └── mrketoz-crm-chat.js     # MrketOz CRM chat endpoint logic
├── config.template.json         # Configuration template (commit this)
├── config.json                  # Local configuration (never commit - in .gitignore)
├── config-manager.js            # Advanced configuration management system
├── hosting.json                # Hosting configuration (cloud-agnostic)
├── deploy                      # Deployment scripts and documentation  
├── roots                       # Domain routing configuration
├── examples/                   # Example configuration files
├── test-brand-neutrality.js    # Core test suite - brand neutrality & structure
├── test-mrketoz-crm.js         # CRM functionality test suite
├── demo-mrketoz-crm.js         # CRM demonstration script
├── DEVELOPMENT.md              # Detailed development guide
├── CONTRIBUTION_GUIDELINES.md   # Contribution standards and workflow
├── CLOUD_PROVIDERS.md          # Multi-cloud deployment guide
├── DUAL_DOMAIN_CONFIG_GUIDE.md # Dual domain configuration guide
├── MRKETOZ_CRM_DOCS.md         # MrketOz CRM API documentation
├── VIDEO_SIMULATION_DOCS.md    # Video integration feature documentation
└── issues/                     # Project issues and migration notes
```

### Key Files and Their Purpose
- **`test-brand-neutrality.js`**: **Critical** - validates cloud-agnostic architecture
- **`config.template.json`**: Template for cloud provider configuration  
- **`config.json`**: Local configuration (auto-ignored by git)
- **`public/index.html`**: Main landing page with video integration
- **`public/ind2x.html`**: FitOutLab capsule interface
- **`functions/mrketoz-crm-chat.js`**: CRM chat endpoint implementation

### Validation Pipelines

#### Automated Testing Framework
1. **Brand Neutrality Testing** (`test-brand-neutrality.js`):
   - Configuration template validation
   - Banned term detection (`firebase`, `cloudflare`, `ga4`, `gsc`)
   - File structure integrity checks
   - Dual domain configuration validation
   - Environment variable handling validation

2. **CRM Functionality Testing** (`test-mrketoz-crm.js`):
   - Chat endpoint structure validation
   - Cloud-agnostic compatibility verification  
   - Security feature validation
   - Response structure validation

#### Manual Validation Requirements
- **Performance**: Core Web Vitals compliance (LCP, FID, CLS)
- **Security**: CSP header configuration
- **Accessibility**: WCAG compliance validation
- **Cross-browser**: Multi-browser compatibility testing
- **DNS**: Dual domain resolution verification
- **Content**: Video integration functionality

#### Continuous Integration Guidelines  
- All PRs must pass `node test-brand-neutrality.js`
- All PRs must pass `node test-mrketoz-crm.js`
- Manual smoke testing required for deployment-related changes
- Configuration changes require additional validation steps

---

## Key Notes for Efficient Coding
1. Always validate changes using `node test-brand-neutrality.js` before deploying.
2. Trust the environment setup instructions provided in `CLOUD_PROVIDERS.md` for cloud-specific configurations.
3. Use Google Cloud CLI tools for local development and deployment (e.g., `firebase`).
4. Follow coding standards for security (CSP headers), performance (Core Web Vitals), and accessibility (WCAG compliance).

<tool_calling>
You have the capability to call multiple tools in a single response. For maximum efficiency, whenever you need to perform multiple independent operations, ALWAYS invoke all relevant tools simultaneously rather than sequentially. Especially when exploring repository, reading files, viewing directories, validating changes or replying to comments.
</tool_calling>

---

## Additional Context for AI Development

### Brand Neutrality - Critical Requirement
This repository maintains strict **cloud-agnostic architecture**:
- ❌ **Banned terms**: `firebase`, `cloudflare`, `ga4`, `gsc` in main codebase
- ✅ **Required approach**: Use configuration templates and environment variables
- ✅ **Testing**: Always run `node test-brand-neutrality.js` before commits
- ✅ **Configuration**: All cloud-specific settings go in `config.json` (not committed)

### Development Workflow Standards
- **Always start with**: `node test-brand-neutrality.js` to ensure current state is valid
- **Configuration setup**: `cp config.template.json config.json` for local development
- **Testing order**: Brand neutrality tests → MrketOz CRM tests → Manual validation
- **File structure**: Maintain the documented directory structure in README.md

### Debugging and Troubleshooting
- **Test failures**: Check for banned terms using `grep -r "firebase\|cloudflare\|ga4\|gsc" public/ README.md deploy roots`
- **Configuration issues**: Validate JSON syntax with Node.js JSON parser
- **Performance debugging**: Use browser dev tools, check Core Web Vitals
- **Cloud deployment**: Refer to `CLOUD_PROVIDERS.md` for multi-cloud guidance

### Core Testing Infrastructure
The repository uses custom testing frameworks:
1. **`test-brand-neutrality.js`**: Validates configuration, brand neutrality, file structure
2. **`test-mrketoz-crm.js`**: Tests CRM chat endpoint functionality
3. **Manual validation**: DNS resolution, CSP headers, performance metrics

### Special Considerations
- **Dual domain support**: Primary (`fitoutlab.app`) and secondary (`designfitout.com`)
- **Video integration**: YouTube embed with custom controls in main pages
- **Strategic analysis**: Real-time competitor benchmarking module
- **Security focus**: CSP headers enforced, secrets management via symbolic paths
- **Performance priority**: Core Web Vitals optimization required

---

## Dependencies and Package Management

### Core Dependencies
```json
{
  "devDependencies": {
    "@playwright/test": "^1.55.1",
    "http-server": "^14.1.1"
  }
}
```

### Available npm Scripts
```bash
# Development server
npm run dev                    # Start local HTTP server on port 3000

# Testing commands
npm run test                   # Run Playwright E2E tests
npm run test:headed           # Run tests with browser UI visible
npm run test:ui               # Interactive test runner
npm run test:debug            # Debug mode with step-by-step execution
npm run test:validate         # Minimal validation tests
npm run test:brand-neutrality # Run brand neutrality validation
npm run test:all              # Run all validation tests

# Setup commands
npm run install:browsers      # Install Playwright browser binaries
```

### Development Dependencies
- **Playwright**: E2E testing framework for cross-browser validation
- **HTTP-Server**: Lightweight static file server for local development
- **Node.js**: Runtime environment (16.x or later required)

---

## Testing Strategy and Quality Assurance

### Testing Hierarchy
1. **Unit-level**: Configuration validation and JSON structure tests
2. **Integration**: Brand neutrality and CRM endpoint functionality
3. **E2E**: Playwright browser-based testing suite
4. **Manual**: Performance metrics and cross-browser compatibility

### Testing Philosophy
- **Fail-fast**: Run `test-brand-neutrality.js` before any changes
- **Cloud-agnostic**: Validate no vendor lock-in in codebase
- **Configuration-driven**: Test template-based environment handling
- **Performance-focused**: Core Web Vitals compliance validation

### Continuous Integration Guidelines
- All PRs **must** pass brand neutrality tests
- All PRs **must** pass CRM functionality tests  
- E2E tests should pass on major browsers (Chrome, Firefox, Safari)
- Performance regression tests for Core Web Vitals thresholds

---

## Code Style and Standards

### File Naming Conventions
- **HTML files**: lowercase with hyphens (`index.html`, `strategic-analysis.html`)
- **JavaScript files**: camelCase or kebab-case (`strategic-analysis.js`, `configManager.js`)
- **CSS files**: kebab-case (`styles.css`, `glassmorphism-effects.css`)
- **Documentation**: UPPERCASE with underscores (`README.md`, `CLOUD_PROVIDERS.md`)

### Code Organization Principles
```javascript
// Preferred function structure for cloud-agnostic code
function createCloudFunction(config) {
  // Use config.cloud.provider instead of hard-coded values
  const provider = config.cloud.provider;
  
  // Configuration-driven implementation
  switch(provider) {
    case 'gcp': return createGCPFunction(config);
    case 'aws': return createAWSFunction(config); 
    case 'azure': return createAzureFunction(config);
    default: throw new Error(`Unsupported provider: ${provider}`);
  }
}
```

### Security Coding Standards
- **CSP Headers**: Always implement Content Security Policy
- **Input Validation**: Sanitize all user inputs
- **Environment Variables**: Use for sensitive configuration
- **HTTPS Enforcement**: All production deployments must use HTTPS
- **Dependency Updates**: Regular security updates via dependabot

### Performance Standards
- **Core Web Vitals Compliance**:
  - Largest Contentful Paint (LCP): < 2.5s
  - First Input Delay (FID): < 100ms  
  - Cumulative Layout Shift (CLS): < 0.1
- **Bundle Size**: Optimize for minimal JavaScript payload
- **Image Optimization**: Use modern formats (WebP, AVIF) when possible
- **Caching Strategy**: Leverage browser and CDN caching

---

## Common Patterns and Anti-patterns

### ✅ Recommended Patterns

#### Configuration Management
```javascript
// Good: Use configuration templates
const config = require('./config.json');
const cloudProvider = config.cloud.provider;

// Bad: Hard-coded provider references  
// const firebase = require('firebase'); // ❌ Banned
```

#### Error Handling
```javascript
// Good: Comprehensive error handling
try {
  const result = await cloudFunction(params);
  return { success: true, data: result };
} catch (error) {
  console.error('Cloud function failed:', error);
  return { success: false, error: error.message };
}
```

#### Testing Validation
```bash
# Good: Always validate before changes
node test-brand-neutrality.js && node test-mrketoz-crm.js

# Bad: Making changes without validation
# git add . && git commit -m "changes" # ❌ Skip validation
```

### ❌ Anti-patterns to Avoid

#### Hard-coded Cloud References
```javascript
// ❌ Never do this - violates brand neutrality
import firebase from 'firebase';
const functions = require('firebase-functions');
```

#### Configuration in Code
```javascript  
// ❌ Bad: Hard-coded configuration
const API_ENDPOINT = 'https://us-central1-myproject.cloudfunctions.net';

// ✅ Good: Configuration-driven
const API_ENDPOINT = config.cloud.functions.endpoint;
```

#### Skipping Validation
```bash
# ❌ Bad: No validation before deployment
git push origin main

# ✅ Good: Validate then deploy
npm run test:all && git push origin main
```

---

## Additional Context for AI Development

### Brand Neutrality - Critical Requirement
This repository maintains strict **cloud-agnostic architecture**:
- ❌ **Banned terms**: `firebase`, `cloudflare`, `ga4`, `gsc` in main codebase
- ✅ **Required approach**: Use configuration templates and environment variables
- ✅ **Testing**: Always run `node test-brand-neutrality.js` before commits
- ✅ **Configuration**: All cloud-specific settings go in `config.json` (not committed)

### Development Workflow Standards
- **Always start with**: `node test-brand-neutrality.js` to ensure current state is valid
- **Configuration setup**: `cp config.template.json config.json` for local development
- **Testing order**: Brand neutrality tests → MrketOz CRM tests → Manual validation
- **File structure**: Maintain the documented directory structure in README.md

### Debugging and Troubleshooting
- **Test failures**: Check for banned terms using `grep -r "firebase\|cloudflare\|ga4\|gsc" public/ README.md deploy roots`
- **Configuration issues**: Validate JSON syntax with Node.js JSON parser
- **Performance debugging**: Use browser dev tools, check Core Web Vitals
- **Cloud deployment**: Refer to `CLOUD_PROVIDERS.md` for multi-cloud guidance

### Core Testing Infrastructure
_(See lines 214-221 for details on testing frameworks and validation steps.)_

### Special Considerations
_(Refer to earlier documentation for domain support, video integration, strategic analysis, security, and performance priorities.)_
