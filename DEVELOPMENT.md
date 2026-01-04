# Development Guide

This guide provides detailed instructions for setting up, developing, and deploying the Designfitout platform.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/support-designfitout/Designfitout-Github.git
cd Designfitout-Github

# Run validation tests
node test-brand-neutrality.js

# Set up configuration (optional)
cp config.template.json config.json
```

## 🛠️ Development Commands

### Core Development Commands

#### `node test-brand-neutrality.js`
**Purpose**: Validate code structure, brand neutrality, and configuration

**What it does**:
- ✅ Validates `config.template.json` structure
- ✅ Checks for banned brand-specific terms (`firebase`, `cloudflare`, `ga4`, `gsc`)
- ✅ Ensures all required files exist
- ✅ Confirms brand-neutral, cloud-agnostic codebase

**Usage**:
```bash
node test-brand-neutrality.js
```

**Expected Output**:
```
Running brand neutrality tests...

Testing configuration template...
✅ Configuration template is valid

Testing brand neutrality...
✅ No brand-specific terms found in main files

Testing file structure...
✅ All required files present

Tests completed: 3/3 passed
🎉 All tests passed! Repository is brand-neutral.
```

**When to Run**:
- Before making any code changes
- Before committing changes
- Before submitting pull requests
- After modifying configuration files

### Local Development Server

#### Option 1: Cloud Provider CLI (Recommended)
```bash
# Install your cloud provider's CLI
# Example: npm install -g cloud-provider-cli

# Login to your cloud provider
# provider-cli login

# Serve locally on http://localhost:5000
# provider-cli serve

# Deploy to hosting (if configured)
# provider-cli deploy --only hosting
# provider-cli deploy --only functions
```

#### Option 2: Simple HTTP Server
```bash
# Using Python (Python 3)
cd public && python -m http.server 8000

# Using Node.js (if http-server is installed)
npx http-server public -p 8000

# Using PHP
cd public && php -S localhost:8000
```

### Configuration Management

#### `cp config.template.json config.json`
**Purpose**: Create your local configuration file

**Steps**:
1. Copy the template: `cp config.template.json config.json`
2. Edit `config.json` with your cloud provider settings
3. Never commit `config.json` to version control (it's in `.gitignore`)

**Template Structure**:
```json
{
  "cloud": {
    "provider": "CLOUD_PROVIDER",
    "hosting": {
      "service": "HOSTING_SERVICE",
      "functions": "SERVERLESS_FUNCTIONS_SERVICE"
    }
  },
  "domains": {
    "primary": "fitoutlab.app",
    "secondary": "designfitout.com"
  }
}
```

## 📁 Project Structure Deep Dive

### Frontend (`public/` directory)

#### `public/index.html`
- **Main landing page** with video integration
- **Features**: Glassmorphism effects, scroll animations, strategic analysis
- **Performance**: Optimized for Core Web Vitals
- **Security**: CSP headers implemented

#### `public/ind2x.html`
- **FitOutLab capsule interface**
- **Purpose**: Tool-facing capsule for architecture workflows
- **Modules**: FIX24, SpecLab, SeveNue integration

#### `public/strategic-analysis.js`
- **Competitor benchmarking module**
- **Features**: Real-time data simulation, animated metrics
- **Performance**: 30-second update intervals
- **API**: Modular class-based architecture

### Backend (`functions/` directory)

#### `functions/index.js`
- **Serverless functions** for cloud providers
- **Purpose**: Handle backend logic and API endpoints
- **Architecture**: Cloud-agnostic implementation

### Configuration Files

#### `hosting.json`
- **Cloud hosting configuration**
- **Features**: Rewrites, security headers, CSP
- **Customizable**: Can be adapted for different hosting providers

#### `config.template.json`
- **Cloud provider configuration template**
- **Purpose**: Environment-specific settings without vendor lock-in
- **Usage**: Copy to `config.json` and customize

### Documentation

#### `VIDEO_SIMULATION_DOCS.md`
- **Comprehensive feature documentation**
- **Covers**: Technical architecture, customization, deployment
- **Audience**: Developers and technical users

#### `CLOUD_PROVIDERS.md`
- **Multi-cloud deployment guide**
- **Supports**: Google Cloud, AWS, Azure, and others
- **Migration**: Instructions for switching providers

## 🧪 Testing Strategy

### Current Test Suite
The project uses a custom testing framework focused on:

1. **Brand Neutrality Testing**
   - Scans code for hard-coded vendor references
   - Ensures cloud-agnostic architecture
   - Validates configuration templates

2. **File Structure Validation**
   - Confirms required files exist
   - Checks file permissions and accessibility
   - Validates project organization

3. **Configuration Validation**
   - Tests JSON structure integrity
   - Validates required configuration fields
   - Ensures template completeness

### Expanding Test Coverage

#### Adding New Tests
To add new test functions to `test-brand-neutrality.js`:

```javascript
function testNewFeature() {
    console.log('Testing new feature...');
    
    // Your test logic here
    let testPassed = true;
    
    if (testPassed) {
        console.log('✅ New feature test passed');
        return true;
    } else {
        console.error('❌ New feature test failed');
        return false;
    }
}

// Add to the tests array in runTests()
const tests = [
    testConfigTemplate,
    testBrandNeutrality,
    testFileStructure,
    testNewFeature  // Add your new test here
];
```

#### Performance Testing
Consider adding:
- Core Web Vitals monitoring
- Load time validation
- Bundle size checks
- Accessibility testing

## 🎨 Frontend Development

### CSS Architecture
- **CSS Custom Properties**: Used for theming and consistency
- **Glassmorphism**: Modern glass-like UI effects
- **Responsive Design**: Mobile-first approach with breakpoints
- **Performance**: Hardware acceleration and optimized animations

### JavaScript Standards
- **Vanilla JS**: No framework dependencies for maximum compatibility
- **ES6+ Features**: Modern JavaScript syntax and features
- **Modular Design**: Self-contained modules and classes
- **Error Handling**: Comprehensive error handling and validation

### Performance Optimization
- **Resource Preloading**: Critical fonts and external resources
- **Lazy Loading**: Content loads as needed
- **Minimal JavaScript**: Optimized for fast loading
- **CDN Integration**: External resource optimization

## 🔧 Backend Development

### Serverless Functions
- **Cloud-Agnostic**: Works with multiple serverless platforms
- **Minimal Dependencies**: Lightweight implementation
- **Error Handling**: Robust error handling and logging
- **Scalability**: Designed for high-volume traffic

### API Design
- **RESTful**: Standard REST API conventions
- **JSON**: Standard JSON request/response format
- **Authentication**: Secure authentication integration
- **Rate Limiting**: Built-in rate limiting and security

## 🚀 Deployment Process

### Pre-Deployment Checklist
- [ ] All tests pass: `node test-brand-neutrality.js`
- [ ] Configuration is properly set up
- [ ] Performance metrics are acceptable
- [ ] Security headers are configured
- [ ] Cross-browser testing completed

### Cloud Provider Setup

#### Google Cloud Platform
```bash
# Install cloud provider CLI
npm install -g google-cloud-cli

# Initialize project
cloud-cli init

# Deploy
cloud-cli deploy
```

#### AWS
```bash
# Configure AWS CLI
aws configure

# Deploy static site to S3
aws s3 sync public/ s3://your-bucket-name

# Set up CloudFront distribution
# Configure Lambda functions
```

#### Azure
```bash
# Install Azure CLI
az extension add --name staticwebapp

# Deploy to Azure Static Web Apps
az staticwebapp create \
  --name your-app-name \
  --source https://github.com/your-repo \
  --location "East US 2"
```

### Post-Deployment Validation
- Verify all pages load correctly
- Test Core Web Vitals performance
- Validate security headers
- Check analytics and monitoring
- Test cross-browser compatibility

## 🐛 Debugging and Troubleshooting

### Common Issues

#### Test Failures
```bash
# If brand neutrality test fails
# Check for banned terms: firebase, cloudflare, ga4, gsc
grep -r "firebase\|cloudflare\|ga4\|gsc" public/ README.md deploy roots
```

#### Configuration Issues
```bash
# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('config.template.json', 'utf8')))"
```

#### Performance Issues
- Check Core Web Vitals in browser dev tools
- Use Lighthouse for comprehensive performance audit
- Monitor network requests for optimization opportunities

### Development Tips
- Use browser dev tools for debugging JavaScript
- Test responsive design with device emulation
- Validate HTML with W3C validator
- Check accessibility with axe or similar tools

## 📈 Performance Monitoring

### Key Metrics
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Page Load Time**: < 3s
- **Time to Interactive**: < 5s

### Monitoring Tools
- Google PageSpeed Insights
- Lighthouse CI
- WebPageTest
- Browser dev tools

## 🔐 Security Considerations

### Content Security Policy
Implemented in `firebase.json` and HTML:
```javascript
"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.youtube.com https://www.gstatic.com; ..."
```

### Best Practices
- Regular dependency updates
- Input validation and sanitization
- Secure authentication implementation
- HTTPS enforcement
- Regular security audits

## 📞 Getting Help

- **Documentation**: Check existing documentation files
- **Issues**: Use GitHub Issues for bug reports
- **Questions**: Contact technical lead
- **Community**: Engage with other contributors

Happy developing! 🚀