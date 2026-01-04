# Dual Domain Configuration Guide

This repository now supports a unified dual domain configuration system that seamlessly manages both `fitoutlab.app` and `designfitout.com` from a single codebase.

## 🌟 Key Features

- **Single Script Management**: One script handles both domains dynamically
- **Domain Detection**: Automatic domain detection based on hostname
- **Feature Flags**: Domain-specific features enabled/disabled per domain
- **Brand Neutrality**: Maintains cloud-agnostic architecture
- **Backward Compatibility**: Preserves existing single-domain functionality
- **Modular Design**: Easy to extend and maintain

## 🏗️ Architecture

The dual domain system consists of three main components:

### 1. Domain Configuration Script (`public/domain-config.js`)
- Detects current domain from `window.location.hostname`
- Loads appropriate configuration for detected domain
- Applies domain-specific branding and features
- Dispatches configuration ready events

### 2. Unified Configuration Template (`config.template.json`)
- Shared cloud provider settings
- Domain definitions (primary/secondary)
- Service configurations

### 3. Management Script (`dual-domain-manager.js`)
- CLI tool for managing dual domain setup
- Validation and testing utilities
- Deployment configuration generator

## 🚀 Quick Start

### 1. Include Domain Configuration

Add to your HTML pages:
```html
<!-- Domain Configuration Script - Must load first -->
<script src="domain-config.js"></script>
```

### 2. Listen for Configuration Ready

```javascript
document.addEventListener('domainConfigReady', (event) => {
    const config = event.detail.config;
    const domain = event.detail.domain;
    
    console.log(`Loaded configuration for: ${config.displayName}`);
    
    // Use domain-specific configuration
    if (window.domainConfig.isFeatureEnabled('strategicAnalysis')) {
        initializeStrategicAnalysis();
    }
});
```

### 3. Access Configuration

```javascript
// Get current domain mode
const currentDomain = window.domainConfig.currentDomain; // 'fitoutlab' or 'designfitout'

// Check feature availability
const hasFeature = window.domainConfig.isFeatureEnabled('capsuleInterface');

// Get domain-specific setting
const primaryColor = window.domainConfig.getSetting('branding.primaryColor');

// Get complete configuration
const config = window.domainConfig.getConfig();
```

## 📊 Domain-Specific Features

| Feature | FitOutLab | DesignFitout |
|---------|-----------|--------------|
| Capsule Interface | ✅ | ❌ |
| Strategic Analysis | ❌ | ✅ |
| Drawing Automation | ✅ | ❌ |
| Video Integration | ✅ | ✅ |
| Performance Monitoring | ❌ | ✅ |
| Visual Simulation | ✅ | ✅ |

## 🔧 Configuration Structure

```javascript
{
  shared: {
    // Common settings for both domains
    analytics: { provider: 'ANALYTICS_SERVICE' },
    cloud: { provider: 'CLOUD_PROVIDER' },
    features: { videoIntegration: true }
  },
  
  domains: {
    fitoutlab: {
      domain: 'fitoutlab.app',
      displayName: 'FitOutLab',
      branding: { primaryColor: '#1976d2' },
      features: { capsuleInterface: true }
    },
    
    designfitout: {
      domain: 'designfitout.com',
      displayName: 'DesignFitout',
      branding: { primaryColor: '#2e7d32' },
      features: { strategicAnalysis: true }
    }
  }
}
```

## 🛠️ Management Commands

Use the dual domain manager for common tasks:

```bash
# Show current configuration
node dual-domain-manager.js show

# Test domain configuration
node dual-domain-manager.js test

# Generate deployment config for specific domain
node dual-domain-manager.js deploy fitoutlab
node dual-domain-manager.js deploy designfitout

# Show maintenance guide
node dual-domain-manager.js maintenance

# Show integration examples
node dual-domain-manager.js example
```

## 🧪 Testing

The system includes comprehensive validation:

```bash
# Run all tests including dual domain validation
node test-brand-neutrality.js
```

Tests validate:
- ✅ Configuration template structure
- ✅ Brand neutrality compliance
- ✅ File structure integrity
- ✅ Dual domain configuration
- ✅ HTML file integration
- ✅ No hardcoded domain references

## 📝 Implementation Examples

### Domain-Aware Components

```javascript
// Component that adapts to current domain
class DomainAwareComponent {
    constructor() {
        this.config = window.domainConfig.getConfig();
        this.initializeForDomain();
    }
    
    initializeForDomain() {
        if (this.config.currentDomain === 'fitoutlab') {
            this.setupToolingInterface();
        } else if (this.config.currentDomain === 'designfitout') {
            this.setupAnalyticsInterface();
        }
    }
}
```

### Feature Flags

```javascript
// Conditional feature loading
if (window.domainConfig.isFeatureEnabled('strategicAnalysis')) {
    import('./strategic-analysis.js').then(module => {
        new module.StrategicAnalysis();
    });
}
```

### Dynamic Content

```javascript
// Update content based on domain
document.addEventListener('domainConfigReady', (event) => {
    const config = event.detail.config;
    
    // Update page title
    document.title = config.content.title;
    
    // Apply branding
    document.documentElement.style.setProperty(
        '--primary-color', 
        config.branding.primaryColor
    );
    
    // Update YouTube embeds with correct origin
    const embeds = document.querySelectorAll('iframe[src*="youtube.com"]');
    embeds.forEach(iframe => {
        const src = iframe.src.replace(
            /origin=[^&]+/, 
            `origin=${encodeURIComponent('https://' + config.domain)}`
        );
        iframe.src = src;
    });
});
```

## 🔄 Deployment

### Single Deployment, Multiple Domains

1. **Build once**: Single build process for both domains
2. **Deploy everywhere**: Same artifacts deployed to all environments
3. **Configure domains**: DNS and CDN configuration per domain
4. **Validate**: Test both domains after deployment

### Environment Variables

```bash
# Optional: Override default domain detection for testing
FORCE_DOMAIN=fitoutlab  # or designfitout
CDN_PROXY=enabled
DUAL_DOMAIN=enabled
```

## 🔐 Security Considerations

- **CSP Headers**: Updated to support both domains
- **CORS Policy**: Configured for dual domain setup
- **Origin Validation**: YouTube embeds use correct origin per domain
- **Brand Neutrality**: No hardcoded domain references in code

## 📚 Migration from Single Domain

If you had a single domain setup:

1. **Backup**: Your existing configuration is preserved
2. **Include Script**: Add `domain-config.js` to your HTML
3. **Update References**: Replace hardcoded domains with dynamic configuration
4. **Test**: Use the validation tools to ensure compatibility

## 🐛 Troubleshooting

### Common Issues

1. **Domain not detected**: Check hostname includes expected domain parts
2. **Features not loading**: Verify feature flags in domain configuration
3. **Hardcoded references**: Use validation tools to find and fix
4. **Cache issues**: Clear CDN cache when switching between domains

### Debug Mode

```javascript
// Enable debug logging
window.domainConfig.debugMode = true;

// Check current configuration
console.log('Current domain:', window.domainConfig.currentDomain);
console.log('Configuration:', window.domainConfig.getConfig());
```

## 🎯 Demo

Visit `public/dual-domain-demo.html` to see the dual domain system in action with:
- Real-time domain switching
- Feature matrix visualization
- Configuration display
- Integration examples

## 📞 Support

For issues related to dual domain configuration:

1. Run validation: `node test-brand-neutrality.js`
2. Check configuration: `node dual-domain-manager.js show`
3. Review logs for domain detection issues
4. Ensure all HTML files include `domain-config.js`

The system maintains backward compatibility while providing powerful new dual domain capabilities.