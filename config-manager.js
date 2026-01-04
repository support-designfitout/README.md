#!/usr/bin/env node

/**
 * Enhanced Configuration Manager for Dual Domain Support
 * Provides dynamic environment handling, URL validation, and optimized domain-specific configurations
 */

const fs = require('fs');
const path = require('path');
const url = require('url');

class ConfigurationManager {
  constructor() {
    this.configPath = path.join(__dirname, 'config.template.json');
    this.userConfigPath = path.join(__dirname, 'config.json');
    this.envConfigCache = new Map();
  }

  /**
   * Load and validate configuration template
   * @returns {Object} Parsed configuration template
   */
  loadTemplate() {
    try {
      if (!fs.existsSync(this.configPath)) {
        throw new Error('Configuration template not found');
      }
      
      const templateContent = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(templateContent);
    } catch (error) {
      throw new Error(`Failed to load configuration template: ${error.message}`);
    }
  }

  /**
   * Load user configuration if it exists
   * @returns {Object|null} User configuration or null if not found
   */
  loadUserConfig() {
    try {
      if (fs.existsSync(this.userConfigPath)) {
        const userContent = fs.readFileSync(this.userConfigPath, 'utf8');
        return JSON.parse(userContent);
      }
      return null;
    } catch (error) {
      console.warn(`Warning: Failed to load user config: ${error.message}`);
      return null;
    }
  }

  /**
   * Validate URL format and accessibility
   * @param {string} inputUrl - URL to validate
   * @param {string} context - Context for error messages
   * @returns {Object} Validation result
   */
  validateUrl(inputUrl, context = 'URL') {
    const result = {
      isValid: false,
      url: inputUrl,
      errors: [],
      warnings: [],
      metadata: {}
    };

    try {
      // Basic URL format validation
      const parsedUrl = new URL(inputUrl);
      
      // Check protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        result.errors.push(`${context}: Protocol must be HTTP or HTTPS`);
      } else {
        result.metadata.protocol = parsedUrl.protocol;
      }

      // Check hostname format
      const hostname = parsedUrl.hostname;
      if (!hostname || hostname === 'localhost') {
        if (hostname === 'localhost') {
          result.warnings.push(`${context}: Using localhost - ensure this is intended`);
        } else {
          result.errors.push(`${context}: Invalid hostname`);
        }
      }

      // Domain-specific validation for known domains
      const knownDomains = ['fitoutlab.app', 'designfitout.com'];
      if (knownDomains.some(domain => hostname.includes(domain))) {
        result.metadata.isDomainSpecific = true;
        result.metadata.matchedDomain = knownDomains.find(domain => hostname.includes(domain));
      }

      // Check for common patterns
      if (hostname.includes('www.')) {
        result.metadata.hasWww = true;
      }

      // Set validity based on errors
      result.isValid = result.errors.length === 0;
      
    } catch (error) {
      result.errors.push(`${context}: Invalid URL format - ${error.message}`);
    }

    return result;
  }

  /**
   * Validate domain-specific configuration
   * @param {Object} domainConfig - Domain configuration object
   * @returns {Object} Validation result
   */
  validateDomainConfig(domainConfig) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      validatedDomains: {}
    };

    if (!domainConfig || typeof domainConfig !== 'object') {
      result.errors.push('Domain configuration must be an object');
      result.isValid = false;
      return result;
    }

    // Validate primary domain
    if (domainConfig.primary) {
      const primaryValidation = this.validateUrl(`https://${domainConfig.primary}`, 'Primary domain');
      result.validatedDomains.primary = primaryValidation;
      
      if (!primaryValidation.isValid) {
        result.errors.push(...primaryValidation.errors);
      }
      result.warnings.push(...primaryValidation.warnings);
    } else {
      result.errors.push('Primary domain is required');
    }

    // Validate secondary domain
    if (domainConfig.secondary) {
      const secondaryValidation = this.validateUrl(`https://${domainConfig.secondary}`, 'Secondary domain');
      result.validatedDomains.secondary = secondaryValidation;
      
      if (!secondaryValidation.isValid) {
        result.errors.push(...secondaryValidation.errors);
      }
      result.warnings.push(...secondaryValidation.warnings);
    }

    // Check for domain conflicts
    if (domainConfig.primary && domainConfig.secondary) {
      if (domainConfig.primary === domainConfig.secondary) {
        result.errors.push('Primary and secondary domains cannot be identical');
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Get environment-specific configuration
   * @param {string} environment - Environment name (development, staging, production)
   * @param {Object} baseConfig - Base configuration object
   * @returns {Object} Environment-specific configuration
   */
  getEnvironmentConfig(environment = 'development', baseConfig = null) {
    const cacheKey = `${environment}_${Date.now()}`;
    
    if (this.envConfigCache.has(environment)) {
      const cached = this.envConfigCache.get(environment);
      // Cache for 5 minutes
      if (Date.now() - cached.timestamp < 300000) {
        return cached.config;
      }
    }

    const template = baseConfig || this.loadTemplate();
    const userConfig = this.loadUserConfig();
    
    // Create environment-specific configuration
    const envConfig = JSON.parse(JSON.stringify(template)); // Deep clone

    // Apply environment-specific overrides
    const environmentOverrides = {
      development: {
        cloud: {
          cdn: { proxy: false },
          hosting: { service: 'LOCAL_DEV_SERVER' }
        },
        domains: {
          primary: `development.${template.domains?.primary || 'fitoutlab.app'}`,
          secondary: `development.${template.domains?.secondary || 'designfitout.com'}`
        }
      },
      staging: {
        cloud: {
          cdn: { proxy: true },
          hosting: { service: 'STAGING_HOST' }
        },
        domains: {
          primary: `staging.${template.domains?.primary || 'fitoutlab.app'}`,
          secondary: `staging.${template.domains?.secondary || 'designfitout.com'}`
        }
      },
      production: {
        // Use template values as-is for production
      }
    };

    // Apply environment overrides
    if (environmentOverrides[environment]) {
      this.deepMerge(envConfig, environmentOverrides[environment]);
    }

    // Apply user configuration overrides if available
    if (userConfig) {
      this.deepMerge(envConfig, userConfig);
    }

    // Add environment metadata
    envConfig.environment = {
      name: environment,
      timestamp: new Date().toISOString(),
      configSource: userConfig ? 'user_override' : 'template'
    };

    // Cache the result
    this.envConfigCache.set(environment, {
      config: envConfig,
      timestamp: Date.now()
    });

    return envConfig;
  }

  /**
   * Deep merge two objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   */
  deepMerge(target, source) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key] || typeof target[key] !== 'object') target[key] = {};
          this.deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }

  /**
   * Optimize domain-specific configuration
   * @param {Object} config - Configuration object
   * @returns {Object} Optimized configuration
   */
  optimizeDomainConfig(config) {
    const optimized = JSON.parse(JSON.stringify(config)); // Deep clone
    
    // Add domain-specific optimizations
    if (optimized.domains) {
      optimized.domainOptimizations = {
        primaryDomain: {
          cdnEnabled: optimized.cloud?.cdn?.proxy || false,
          cacheStrategy: 'aggressive',
          compressionEnabled: true
        },
        secondaryDomain: {
          cdnEnabled: optimized.cloud?.cdn?.proxy || false,
          cacheStrategy: 'standard',
          compressionEnabled: true
        },
        crossDomainSupport: {
          corsEnabled: true,
          cookieDomain: `.${optimized.domains.primary}`,
          sessionSharing: true
        }
      };

      // Add domain-specific analytics configuration
      if (optimized.analytics) {
        optimized.domainAnalytics = {
          primaryDomain: {
            provider: optimized.analytics.provider,
            trackingEnabled: true,
            ecommerceEnabled: false
          },
          secondaryDomain: {
            provider: optimized.analytics.provider,
            trackingEnabled: true,
            ecommerceEnabled: true
          }
        };
      }
    }

    return optimized;
  }

  /**
   * Comprehensive configuration validation
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation results
   */
  validateConfiguration(config) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sections: {}
    };

    // Validate required sections
    const requiredSections = ['cloud', 'analytics', 'search', 'authentication', 'domains'];
    for (const section of requiredSections) {
      if (!config[section]) {
        result.errors.push(`Missing required section: ${section}`);
      } else {
        result.sections[section] = { exists: true, valid: true };
      }
    }

    // Validate domains section specifically
    if (config.domains) {
      const domainValidation = this.validateDomainConfig(config.domains);
      result.sections.domains = domainValidation;
      
      if (!domainValidation.isValid) {
        result.errors.push(...domainValidation.errors);
      }
      result.warnings.push(...domainValidation.warnings);
    }

    // Validate cloud section
    if (config.cloud) {
      if (!config.cloud.provider) {
        result.warnings.push('Cloud provider not specified');
      }
      if (!config.cloud.hosting) {
        result.warnings.push('Hosting configuration missing');
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Generate configuration report
   * @param {string} environment - Environment name
   * @returns {Object} Configuration report
   */
  generateConfigReport(environment = 'development') {
    const config = this.getEnvironmentConfig(environment);
    const validation = this.validateConfiguration(config);
    
    return {
      environment,
      timestamp: new Date().toISOString(),
      configuration: config,
      validation,
      summary: {
        isValid: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        domainsConfigured: config.domains ? Object.keys(config.domains).length : 0
      }
    };
  }
}

// CLI interface
if (require.main === module) {
  const manager = new ConfigurationManager();
  const command = process.argv[2] || 'validate';
  const environment = process.argv[3] || 'development';

  try {
    switch (command) {
      case 'validate':
        console.log('🔍 Validating configuration...');
        const template = manager.loadTemplate();
        const validation = manager.validateConfiguration(template);
        
        if (validation.isValid) {
          console.log('✅ Configuration is valid');
        } else {
          console.log('❌ Configuration validation failed:');
          validation.errors.forEach(error => console.log(`  • ${error}`));
        }
        
        if (validation.warnings.length > 0) {
          console.log('⚠️ Warnings:');
          validation.warnings.forEach(warning => console.log(`  • ${warning}`));
        }
        break;

      case 'report':
        console.log(`📊 Generating configuration report for ${environment}...`);
        const report = manager.generateConfigReport(environment);
        console.log(JSON.stringify(report, null, 2));
        break;

      case 'optimize':
        console.log(`⚡ Optimizing configuration for ${environment}...`);
        const config = manager.getEnvironmentConfig(environment);
        const optimized = manager.optimizeDomainConfig(config);
        console.log(JSON.stringify(optimized, null, 2));
        break;

      default:
        console.log('Usage: node config-manager.js [validate|report|optimize] [environment]');
        console.log('Environments: development, staging, production');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = ConfigurationManager;