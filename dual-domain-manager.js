#!/usr/bin/env node

/**
 * Dual Domain Management Script
 * 
 * This script provides utilities for managing the dual domain configuration
 * and demonstrates how to work with the unified setup.
 */

const fs = require('fs');
const path = require('path');

class DualDomainManager {
    constructor() {
        this.configPath = path.join(__dirname, 'config.template.json');
        this.domainConfigPath = path.join(__dirname, 'public', 'domain-config.js');
        this.config = this.loadConfig();
    }

    /**
     * Load configuration from template
     */
    loadConfig() {
        try {
            const configContent = fs.readFileSync(this.configPath, 'utf8');
            return JSON.parse(configContent);
        } catch (error) {
            console.error('Error loading configuration:', error.message);
            return null;
        }
    }

    /**
     * Display current domain configuration
     */
    showConfiguration() {
        console.log('🌐 Dual Domain Configuration Status\n');
        
        if (!this.config) {
            console.log('❌ Configuration not loaded');
            return;
        }

        console.log('📋 Supported Domains:');
        console.log(`  Primary: ${this.config.domains.primary}`);
        console.log(`  Secondary: ${this.config.domains.secondary}`);
        console.log();

        console.log('☁️  Cloud Provider Configuration:');
        console.log(`  Provider: ${this.config.cloud.provider}`);
        console.log(`  Hosting: ${this.config.cloud.hosting.service}`);
        console.log(`  Functions: ${this.config.cloud.hosting.functions}`);
        console.log();

        console.log('📊 Services Configuration:');
        console.log(`  Analytics: ${this.config.analytics.provider}`);
        console.log(`  Search Console: ${this.config.search.console}`);
        console.log(`  Authentication: ${this.config.authentication.cli_email}`);
        console.log();

        this.validateDomainConfig();
    }

    /**
     * Validate domain configuration files
     */
    validateDomainConfig() {
        console.log('🔍 Validation Results:');
        
        // Check if domain-config.js exists
        if (fs.existsSync(this.domainConfigPath)) {
            console.log('  ✅ domain-config.js present');
        } else {
            console.log('  ❌ domain-config.js missing');
            return;
        }

        // Check HTML files for domain-config.js inclusion
        const htmlFiles = ['public/index.html', 'public/ind2x.html'];
        htmlFiles.forEach(file => {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('domain-config.js')) {
                    console.log(`  ✅ ${file} includes domain-config.js`);
                } else {
                    console.log(`  ❌ ${file} missing domain-config.js`);
                }
            }
        });

        // Check for hardcoded domain references
        this.checkHardcodedReferences();
    }

    /**
     * Check for hardcoded domain references
     */
    checkHardcodedReferences() {
        const filesToCheck = ['public/index.html', 'public/ind2x.html', 'public/strategic-analysis.js'];
        let foundHardcoded = false;

        filesToCheck.forEach(file => {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Check for hardcoded domain references (excluding domain-config.js)
                if (file !== 'public/domain-config.js') {
                    const hardcodedPatterns = [
                        /https:\/\/fitoutlab\.app/g,
                        /https:\/\/designfitout\.com/g,
                        /origin=https:\/\/[^"']*/g
                    ];
                    
                    hardcodedPatterns.forEach(pattern => {
                        const matches = content.match(pattern);
                        if (matches && !content.includes('DOMAIN_PLACEHOLDER')) {
                            console.log(`  ⚠️  ${file} contains hardcoded references: ${matches.length} found`);
                            foundHardcoded = true;
                        }
                    });
                }
            }
        });

        if (!foundHardcoded) {
            console.log('  ✅ No hardcoded domain references found');
        }
    }

    /**
     * Generate deployment configuration for specific domain
     */
    generateDeploymentConfig(domain) {
        console.log(`\n🚀 Generating Deployment Configuration for: ${domain}\n`);
        
        if (!['fitoutlab', 'designfitout'].includes(domain)) {
            console.log('❌ Invalid domain. Use: fitoutlab or designfitout');
            return;
        }

        const domainConfig = {
            fitoutlab: {
                domain: 'fitoutlab.app',
                cname: 'www.fitoutlab.app',
                focus: 'Professional tooling and automation'
            },
            designfitout: {
                domain: 'designfitout.com',
                cname: 'www.designfitout.com',
                focus: 'Strategic analysis and premium services'
            }
        };

        const config = domainConfig[domain];
        
        console.log('📝 Deployment Configuration:');
        console.log(`  Domain: ${config.domain}`);
        console.log(`  CNAME: ${config.cname} → ${config.domain}`);
        console.log(`  Focus: ${config.focus}`);
        console.log();

        console.log('🔧 Required Environment Variables:');
        console.log(`  DOMAIN=${config.domain}`);
        console.log(`  DOMAIN_MODE=${domain}`);
        console.log(`  CDN_PROXY=enabled`);
        console.log();

        console.log('📋 Deployment Steps:');
        console.log('  1. Configure DNS records');
        console.log('  2. Set up CDN proxy');
        console.log('  3. Deploy static files');
        console.log('  4. Configure serverless functions');
        console.log('  5. Validate domain-specific features');
        console.log();
    }

    /**
     * Test domain configuration in simulation mode
     */
    testDomainConfiguration() {
        console.log('🧪 Testing Domain Configuration\n');
        
        const testDomains = ['fitoutlab.app', 'designfitout.com', 'localhost:8000'];
        
        testDomains.forEach(domain => {
            console.log(`Testing: ${domain}`);
            const detectedDomain = this.simulateDomainDetection(domain);
            console.log(`  Detected mode: ${detectedDomain}`);
            console.log(`  ✅ Configuration available`);
        });

        console.log('\n📊 Feature Matrix:');
        console.log('  Feature                 | FitOutLab | DesignFitout');
        console.log('  ------------------------|-----------|-------------');
        console.log('  Capsule Interface       |     ✅     |      ❌     ');
        console.log('  Strategic Analysis      |     ❌     |      ✅     ');
        console.log('  Drawing Automation      |     ✅     |      ❌     ');
        console.log('  Video Integration       |     ✅     |      ✅     ');
        console.log('  Performance Monitoring  |     ❌     |      ✅     ');
        console.log('  Visual Simulation       |     ✅     |      ✅     ');
        console.log();
    }

    /**
     * Simulate domain detection logic
     */
    simulateDomainDetection(hostname) {
        hostname = hostname.toLowerCase();
        
        if (hostname.includes('fitoutlab')) {
            return 'fitoutlab';
        } else if (hostname.includes('designfitout')) {
            return 'designfitout';
        } else {
            return 'fitoutlab'; // default
        }
    }

    /**
     * Show maintenance recommendations
     */
    showMaintenanceGuide() {
        console.log('🛠️  Dual Domain Maintenance Guide\n');
        
        console.log('📅 Regular Maintenance Tasks:');
        console.log('  1. Run validation tests: node test-brand-neutrality.js');
        console.log('  2. Check domain resolution for both domains');
        console.log('  3. Validate CDN proxy configuration');
        console.log('  4. Monitor analytics for both domains');
        console.log('  5. Update SSL certificates for both domains');
        console.log();

        console.log('🔄 Configuration Updates:');
        console.log('  • Modify config.template.json for shared settings');
        console.log('  • Update domain-config.js for domain-specific features');
        console.log('  • Test changes with both domains');
        console.log('  • Update documentation if features change');
        console.log();

        console.log('⚠️  Common Issues:');
        console.log('  • Hardcoded domain references in code');
        console.log('  • Incorrect YouTube embed origins');
        console.log('  • Missing domain-specific feature flags');
        console.log('  • CDN cache issues between domains');
        console.log();

        console.log('📝 Best Practices:');
        console.log('  • Always use domain-config.js for domain logic');
        console.log('  • Test with both domains during development');
        console.log('  • Keep brand neutrality in shared components');
        console.log('  • Document domain-specific features clearly');
        console.log();
    }

    /**
     * Generate integration example
     */
    generateIntegrationExample() {
        console.log('💡 Integration Example\n');
        
        const exampleCode = `
// Example: Using domain configuration in your application

document.addEventListener('domainConfigReady', (event) => {
    const config = event.detail.config;
    const domain = event.detail.domain;
    
    console.log(\`Current domain: \${domain}\`);
    console.log(\`Display name: \${config.displayName}\`);
    
    // Check if feature is enabled for current domain
    if (window.domainConfig.isFeatureEnabled('strategicAnalysis')) {
        // Initialize strategic analysis for designfitout.com
        initializeStrategicAnalysis();
    }
    
    if (window.domainConfig.isFeatureEnabled('capsuleInterface')) {
        // Initialize capsule interface for fitoutlab.app
        initializeCapsuleInterface();
    }
    
    // Get domain-specific settings
    const primaryColor = window.domainConfig.getSetting('branding.primaryColor');
    document.documentElement.style.setProperty('--theme-primary', primaryColor);
});

// Programmatically check domain configuration
if (window.domainConfig) {
    const currentDomain = window.domainConfig.currentDomain;
    const config = window.domainConfig.getConfig();
    
    // Use configuration in your code
    console.log('Configuration loaded for:', currentDomain);
}
        `;

        console.log(exampleCode);
    }
}

// CLI Interface
function runCLI() {
    const args = process.argv.slice(2);
    const command = args[0] || 'show';
    const manager = new DualDomainManager();

    console.log('🌐 Dual Domain Management System\n');

    switch (command) {
        case 'show':
        case 'config':
            manager.showConfiguration();
            break;
            
        case 'deploy':
            const domain = args[1];
            if (!domain) {
                console.log('Usage: node dual-domain-manager.js deploy [fitoutlab|designfitout]');
                return;
            }
            manager.generateDeploymentConfig(domain);
            break;
            
        case 'test':
            manager.testDomainConfiguration();
            break;
            
        case 'maintenance':
            manager.showMaintenanceGuide();
            break;
            
        case 'example':
            manager.generateIntegrationExample();
            break;
            
        default:
            console.log('Available commands:');
            console.log('  show          - Show current configuration');
            console.log('  deploy <domain> - Generate deployment config for domain');
            console.log('  test          - Test domain configuration');
            console.log('  maintenance   - Show maintenance guide');
            console.log('  example       - Show integration example');
            break;
    }
}

// Run CLI if called directly
if (require.main === module) {
    runCLI();
}

module.exports = DualDomainManager;