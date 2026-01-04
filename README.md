# Designfitout-Github

A cloud-agnostic web platform for premium design and fitout solutions, featuring video integration, visual simulation, and strategic competitor analysis.

## 🌐 Domains
- Primary: `fitoutlab.app`
- Secondary: `designfitout.com`
- CNAME: `www.fitoutlab.app → fitoutlab.app` (CDN proxy enabled)

## 📁 Repository Structure

```
/
├── public/                    # Frontend assets and pages
│   ├── index.html            # Main landing page with enhanced AI features
│   ├── ind2x.html           # FitOutLab capsule interface
│   ├── strategic-analysis.js # Real-time competitor analysis module
│   └── styles.css           # Core styling
├── modules/                   # Modular Architecture (NEW)
│   ├── core/                 # Core system modules
│   │   └── module-loader.js  # Dynamic module loading system
│   ├── ai/                   # AI and Machine Learning modules
│   │   └── deep-learning-narrative.js # AI narrative generation
│   ├── ui/                   # User Interface enhancement modules
│   │   └── visual-effects.js # Enhanced visual effects system
│   ├── analytics/            # Analytics and data modules
│   ├── module-bootstrap.js   # Module system bootstrap
│   └── module-config.json    # Module configuration
├── functions/                # Serverless functions
│   └── index.js             # Cloud functions implementation
├── build/                    # Deployment build directory
├── config.template.json     # Configuration template for cloud providers
├── hosting.json            # Hosting configuration (cloud-agnostic)
├── deploy-enhanced.sh      # Enhanced deployment script
├── test-enhanced-modules.js # Enhanced testing suite
├── deploy                  # Original deployment scripts
├── roots                   # Domain routing configuration
├── test-brand-neutrality.js # Brand neutrality validation
├── CLOUD_PROVIDERS.md      # Multi-cloud deployment guide
├── VIDEO_SIMULATION_DOCS.md # Feature documentation
└── issues/                 # Project issues and migration notes
```

## 🛠️ Development Commands

### Enhanced Testing and Development
```bash
# Run enhanced module and AI tests
node test-enhanced-modules.js

# Run traditional brand neutrality tests
node test-brand-neutrality.js

# Enhanced deployment with modular architecture
./deploy-enhanced.sh

# Staging deployment
DEPLOYMENT_ENV=staging ./deploy-enhanced.sh

# Production deployment  
DEPLOYMENT_ENV=production ./deploy-enhanced.sh
```

### Module Development
```bash
# Test module loading in browser console:
# Look for: "🎉 All modules ready - modulesReady event dispatched"

# Access loaded modules
window.moduleBootstrap.getAllModules()

# Get specific module (in browser console)
window.moduleBootstrap.getModule('deepLearningNarrative')

# Check AI narrative analytics
window.moduleBootstrap.getModule('deepLearningNarrative').getAnalytics()
```

### Traditional Testing and Quality Assurance
```bash
# Run brand neutrality and structure validation
node test-brand-neutrality.js

# Validate configuration template
node test-brand-neutrality.js  # Includes config validation
```

### Local Development
```bash
# Serve locally (using cloud provider CLI)
# Example: provider-cli serve (for Google Cloud)
# Example: aws s3 sync public/ s3://bucket (for AWS)

# Deploy to hosting (provider-specific)
# See CLOUD_PROVIDERS.md for detailed instructions

# Deploy functions (provider-specific)
# Configuration handled via config.json
```

### Code Standards
- **HTML/CSS/JS**: Follow modern web standards and best practices
- **Security**: Implement Content Security Policy (CSP) headers
- **Performance**: Optimize for Core Web Vitals (LCP, FID, CLS)
- **Accessibility**: Follow WCAG compliance guidelines
- **Brand Neutrality**: Avoid hard-coded platform-specific references

## 🧱 Core Modules

### Enhanced Modular Architecture
- **Module Loader**: Dynamic dependency resolution and module management
- **Bootstrap System**: Automated module initialization and configuration
- **Configuration Management**: Centralized module configuration and environment setup

### AI-Powered Features
- **Deep Learning Narrative**: AI-driven adaptive storytelling system
  - Sentiment analysis and user behavior tracking
  - Context-aware narrative generation
  - Neural network simulation for content optimization
  - Adaptive learning based on user interactions
- **Strategic Analysis**: Enhanced real-time competitor benchmarking
- **Predictive Content**: AI-powered content recommendations

### Traditional Modules
- **FIX24**: Diagnostic flows and BOQ normalization
- **SpecLab**: Spec-driven schema overlays for design workflows
- **SeveNue**: Dispatch publishing and quotation logic
- **Video Integration**: YouTube embed with custom controls
- **Visual Simulation**: Enhanced glassmorphism effects and animations

## 🔐 Security & Configuration

### Credential Management
- Secrets vault linked via symbolic paths
- Audit logs for all operations
- Cloud CLI authentication required
- CSP headers enforced for security

### Environment Setup
1. Copy `config.template.json` to `config.json`
2. Configure your cloud provider settings
3. Set up authentication credentials
4. Test with brand neutrality validation

## 🚀 Deployment

### Cloud-Agnostic Architecture
The platform supports multiple cloud providers:
- **Google Cloud**: Hosting + Functions, Database
- **AWS**: S3 + CloudFront, Lambda, DynamoDB  
- **Azure**: Static Web Apps, Functions, Cosmos DB
- **Other**: Any static hosting + serverless platform

### Global Distribution
- Multiple territorial deployments supported
- CDN proxy enabled for performance
- Runtime export packaging per region

### Deployment Process
1. Configure cloud provider in `config.json`
2. Run validation: `node test-brand-neutrality.js`
3. Deploy using provider-specific commands
4. Verify with smoke tests

## 🧪 Testing & Validation

### Automated Tests
- **Brand Neutrality**: Ensures platform-agnostic codebase
- **File Structure**: Validates required files and structure
- **Configuration**: Verifies template and settings validity

### Smoke Tests
- DNS resolution for both domains
- Search indexing and analytics validation
- Performance metrics monitoring
- Security header verification

## 📚 Additional Documentation

- [Video Integration & Visual Simulation](VIDEO_SIMULATION_DOCS.md)
- [Cloud Provider Configuration](CLOUD_PROVIDERS.md)
- [Domain Migration Summary](DOMAIN_IDENTITY_MIGRATION_SUMMARY.md)

## 🔧 Technical Lead
**Arun K Ravi** - `this4arun@gmail.com`
