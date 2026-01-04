# Enhanced Dual Domain Configuration Guide

This guide explains the enhanced dual domain configuration system that supports dynamic environment handling, URL validation, and optimized domain-specific configurations.

## Overview

The enhanced configuration system provides:

- **Dual Domain Support**: Manages both `fitoutlab.app` (primary) and `designfitout.com` (secondary)
- **Environment-Specific Variables**: Automatic configuration for development, staging, and production
- **URL Validation**: Comprehensive validation of domain URLs and configurations
- **Domain Optimization**: CDN, caching, and analytics optimization per domain
- **Brand Neutrality**: Maintains cloud-agnostic architecture

## Files

### Core Files
- `config.template.json` - Enhanced configuration template with environment support
- `config-manager.js` - Complete configuration management system
- `test-brand-neutrality.js` - Enhanced test suite with dual domain validation

## Configuration Structure

### Enhanced Template (`config.template.json`)

```json
{
  "domains": {
    "primary": "fitoutlab.app",
    "secondary": "designfitout.com",
    "configuration": {
      "primaryDomainFeatures": {
        "toolFacing": true,
        "capsuleLogic": true,
        "architectureWorkflows": true
      },
      "secondaryDomainFeatures": {
        "publicFacing": true,
        "marketing": true,
        "clientPortal": true
      }
    }
  },
  "environment": {
    "variables": {
      "NODE_ENV": "${NODE_ENV:development}",
      "API_BASE_URL": "${API_BASE_URL}",
      "CDN_BASE_URL": "${CDN_BASE_URL}"
    },
    "validation": {
      "requireHttps": true,
      "allowedOrigins": ["*.fitoutlab.app", "*.designfitout.com"]
    }
  }
}
```

## Usage

### Configuration Manager CLI

#### Validate Configuration
```bash
node config-manager.js validate
```
- Validates template structure
- Checks required sections
- Reports errors and warnings

#### Generate Environment Report
```bash
node config-manager.js report [environment]
```
- `development` (default)
- `staging` 
- `production`

Example:
```bash
node config-manager.js report production
```

#### Optimize Configuration
```bash
node config-manager.js optimize [environment]
```
Generates optimized configuration with:
- Domain-specific CDN settings
- Caching strategies
- Analytics configuration
- Cross-domain support

### Programmatic Usage

```javascript
const ConfigurationManager = require('./config-manager.js');

const manager = new ConfigurationManager();

// Get environment-specific configuration
const devConfig = manager.getEnvironmentConfig('development');
const stagingConfig = manager.getEnvironmentConfig('staging');
const prodConfig = manager.getEnvironmentConfig('production');

// Validate domains
const validation = manager.validateDomainConfig({
  primary: 'fitoutlab.app',
  secondary: 'designfitout.com'
});

// Optimize configuration
const optimized = manager.optimizeDomainConfig(config);
```

## Environment-Specific Behavior

### Development Environment
- **Domain Prefixes**: `development.fitoutlab.app`, `development.designfitout.com`
- **CDN**: Disabled for local development
- **Hosting**: Uses `LOCAL_DEV_SERVER`

### Staging Environment
- **Domain Prefixes**: `staging.fitoutlab.app`, `staging.designfitout.com`
- **CDN**: Enabled with proxy
- **Hosting**: Uses `STAGING_HOST`

### Production Environment
- **Domains**: Uses template values as-is
- **CDN**: Full optimization enabled
- **Hosting**: Production configuration

## URL Validation

The system validates:
- **URL Format**: Proper HTTP/HTTPS protocol
- **Domain Matching**: Recognizes known domains
- **Subdomain Handling**: Supports www and environment prefixes
- **Error Reporting**: Detailed validation results

```javascript
const validation = manager.validateUrl('https://fitoutlab.app');
console.log(validation.isValid); // true
console.log(validation.metadata); // { protocol: 'https:', isDomainSpecific: true }
```

## Domain Optimization Features

### Automatic Optimizations
- **CDN Configuration**: Per-domain CDN settings
- **Caching Strategies**: Aggressive for primary, standard for secondary
- **Compression**: Enabled for both domains
- **Cross-Domain Support**: CORS and session sharing
- **Analytics**: Domain-specific tracking configurations

### Generated Optimizations
```json
{
  "domainOptimizations": {
    "primaryDomain": {
      "cdnEnabled": true,
      "cacheStrategy": "aggressive",
      "compressionEnabled": true
    },
    "secondaryDomain": {
      "cdnEnabled": true,
      "cacheStrategy": "standard", 
      "compressionEnabled": true
    },
    "crossDomainSupport": {
      "corsEnabled": true,
      "cookieDomain": ".fitoutlab.app",
      "sessionSharing": true
    }
  }
}
```

## Testing

### Enhanced Test Suite

Run the complete test suite:
```bash
node test-brand-neutrality.js
```

**Tests Include:**
1. **Configuration Template**: Validates structure and required sections
2. **Dual Domain Configuration**: Tests domain validation and environment configs
3. **Environment Variables**: Verifies environment-specific handling
4. **URL Validation**: Tests URL validation functionality
5. **Brand Neutrality**: Ensures no hard-coded vendor references
6. **File Structure**: Validates required files exist
7. **Configuration Optimization**: Tests optimization generation

### Test Output
```
Running enhanced brand neutrality and configuration tests...

Testing configuration template...
✅ Configuration template is valid

Testing dual domain configuration...
✅ Dual domain configuration is valid

Testing environment variable handling...
✅ Environment variable handling is working correctly

Testing URL validation...
✅ URL validation is working correctly

Testing brand neutrality...
✅ No brand-specific terms found in main files

Testing file structure...
✅ All required files present

Testing configuration optimization...
✅ Configuration optimization is working correctly

Tests completed: 7/7 passed
🎉 All tests passed! Repository supports enhanced dual domain configuration.
```

## Environment Variables

### Supported Variables
- `NODE_ENV`: Environment name (development/staging/production)
- `API_BASE_URL`: Base URL for API endpoints
- `CDN_BASE_URL`: CDN base URL for static assets
- `ANALYTICS_ID`: Analytics tracking ID
- `SEARCH_CONSOLE_ID`: Search console verification ID
- `DATABASE_URL`: Database connection URL
- `STORAGE_BUCKET`: Cloud storage bucket name

### Variable Syntax
Variables use the format: `${VARIABLE_NAME:default_value}`

Example:
```json
{
  "NODE_ENV": "${NODE_ENV:development}",
  "API_BASE_URL": "${API_BASE_URL}"
}
```

## Security Features

### Validation Rules
- **HTTPS Required**: Production environments require HTTPS
- **Allowed Origins**: Whitelist for CORS origins
- **CSP Enabled**: Content Security Policy enforcement

### Domain Security
- **Cross-Origin**: Proper CORS configuration
- **Cookie Domain**: Secure cookie domain settings
- **Session Sharing**: Secure session management across domains

## Best Practices

### Configuration Management
1. **Never commit `config.json`**: Keep user configs in `.gitignore`
2. **Use environment variables**: For sensitive data
3. **Test all environments**: Validate dev, staging, and production
4. **Regular validation**: Run tests before deployment

### Domain Management
1. **Consistent naming**: Use environment prefixes consistently
2. **HTTPS everywhere**: Always use HTTPS in production
3. **Monitor both domains**: Set up monitoring for both primary and secondary
4. **Cache optimization**: Use appropriate caching strategies per domain

### Development Workflow
1. **Copy template**: `cp config.template.json config.json`
2. **Customize**: Edit `config.json` with your settings
3. **Validate**: Run `node config-manager.js validate`
4. **Test**: Run `node test-brand-neutrality.js`
5. **Deploy**: Use environment-specific configurations

## Troubleshooting

### Common Issues

**Configuration validation fails**
- Check all required sections are present
- Verify domain format is correct
- Ensure JSON syntax is valid

**Environment prefixes not applied**
- Verify environment name is correct
- Check deep merge is working properly
- Validate configuration generation

**URL validation fails**
- Ensure proper HTTP/HTTPS protocol
- Check domain format
- Verify no typos in domain names

**Tests failing**
- Run individual test functions to isolate issues
- Check file permissions
- Verify all required files exist

### Debug Commands

```bash
# Validate configuration
node config-manager.js validate

# Generate detailed report
node config-manager.js report development

# Test specific environment
node config-manager.js optimize staging

# Run full test suite
node test-brand-neutrality.js
```

## Migration Guide

### From Previous Configuration

If upgrading from the basic dual domain setup:

1. **Backup existing config**: `cp config.json config.json.backup`
2. **Copy new template**: `cp config.template.json config.json`  
3. **Migrate settings**: Transfer your custom values to new structure
4. **Run validation**: `node config-manager.js validate`
5. **Test thoroughly**: `node test-brand-neutrality.js`

### Breaking Changes
- Template now requires `environment` and `deployment` sections
- Domain configuration has new nested structure
- Test suite expects new configuration format

---

For more information, see:
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup
- [CLOUD_PROVIDERS.md](CLOUD_PROVIDERS.md) - Cloud deployment
- [README.md](README.md) - Project overview