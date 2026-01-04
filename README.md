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
│   ├── index.html            # Main landing page with video integration
│   ├── ind2x.html           # FitOutLab capsule interface
│   └── strategic-analysis.js # Real-time competitor analysis module
├── functions/                # Serverless functions
│   └── index.js             # Cloud functions implementation
├── config.template.json     # Enhanced configuration template with environment support
├── config-manager.js         # Advanced configuration management system
├── hosting.json            # Hosting configuration (cloud-agnostic)
├── deploy                  # Deployment scripts and documentation
├── roots                   # Domain routing configuration
├── test-brand-neutrality.js # Enhanced test suite with dual domain validation
├── examples/               # Example configuration files
├── DUAL_DOMAIN_CONFIG_GUIDE.md # Comprehensive configuration guide
├── CLOUD_PROVIDERS.md      # Multi-cloud deployment guide
├── VIDEO_SIMULATION_DOCS.md # Detailed feature documentation
└── issues/                 # Project issues and migration notes
```

## 🛠️ Development Commands

### Enhanced Configuration Management
```bash
# Validate configuration template
node config-manager.js validate

# Generate environment-specific configuration report
node config-manager.js report [development|staging|production]

# Optimize configuration for deployment
node config-manager.js optimize [environment]
```

### Testing and Quality Assurance
```bash
# Run enhanced brand neutrality and dual domain tests
node test-brand-neutrality.js

# Test MrketOz CRM chat endpoint functionality
node test-mrketoz-crm.js

# Test specific configuration aspects
node config-manager.js validate  # Validates structure and domains
```

### Local Development
```bash
# Set up local configuration
cp config.template.json config.json  # Copy template
# Edit config.json with your settings

# Serve locally (using cloud provider CLI)
# Example: provider-cli serve (for Google Cloud)
# Example: aws s3 sync public/ s3://bucket (for AWS)

# Deploy to hosting (provider-specific)
# See CLOUD_PROVIDERS.md for detailed instructions

# Deploy functions (provider-specific)
# Configuration handled via config.json
```

### Enhanced Dual Domain Configuration
The repository now supports advanced dual domain configuration with:
- **Environment-Specific Variables**: Automatic dev/staging/production configuration
- **URL Validation**: Comprehensive domain and URL validation
- **Domain Optimization**: CDN, caching, and analytics optimization per domain
- **Dynamic Configuration**: Runtime configuration generation based on environment

**Quick Setup:**
```bash
# Use development configuration
cp examples/config.example.development.json config.json

# Use Google Cloud configuration
cp examples/config.example.google-cloud.json config.json

# Validate your configuration
node config-manager.js validate
```

See [DUAL_DOMAIN_CONFIG_GUIDE.md](DUAL_DOMAIN_CONFIG_GUIDE.md) for complete documentation.

### Code Standards
- **HTML/CSS/JS**: Follow modern web standards and best practices
- **Security**: Implement Content Security Policy (CSP) headers
- **Performance**: Optimize for Core Web Vitals (LCP, FID, CLS)
- **Accessibility**: Follow WCAG compliance guidelines
- **Brand Neutrality**: Avoid hard-coded platform-specific references

## 🧱 Core Modules
- **FIX24**: Diagnostic flows and BOQ normalization
- **SpecLab**: Spec-driven schema overlays for design workflows
- **SeveNue**: Dispatch publishing and quotation logic
- **MrketOz CRM**: Dynamic customer operations with automated chat workflows
- **Video Integration**: YouTube embed with custom controls
- **Strategic Analysis**: Real-time competitor benchmarking
- **Visual Simulation**: Glassmorphism effects and scroll animations

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

- [MrketOz CRM Chat Endpoint](MRKETOZ_CRM_DOCS.md)
- [Video Integration & Visual Simulation](VIDEO_SIMULATION_DOCS.md)
- [Cloud Provider Configuration](CLOUD_PROVIDERS.md)
- [Domain Migration Summary](DOMAIN_IDENTITY_MIGRATION_SUMMARY.md)

## 🔧 Technical Lead
**Arun K Ravi** - `this4arun@gmail.com`
