#!/usr/bin/env node

/**
 * Enhanced Brand Neutrality and Module Testing
 * Tests for SeveNue, MrketOz, Customer Engagement, and Security modules
 */

const fs = require('fs');
const path = require('path');

// Enhanced test configuration
const CONFIG_FILE = 'config.template.json';
const BANNED_TERMS = ['firebase', 'cloudflare', 'ga4', 'gsc'];
const REQUIRED_FILES = [
    'public/index.html',
    'public/ind2x.html', 
    'public/strategic-analysis.js',
    'public/styles.css',
    'public/sevenue-module.js',
    'public/mrketoz-module.js',
    'public/customer-engagement.js',
    'public/security-observability.js',
    'functions/index.js',
    'test-brand-neutrality.js',
    'config.template.json'
];

// New module-specific test files
const MODULE_FILES = [
    'public/sevenue-module.js',
    'public/mrketoz-module.js', 
    'public/customer-engagement.js',
    'public/security-observability.js'
];

let totalTests = 0;
let passedTests = 0;

function runTests() {
    console.log('Running enhanced brand neutrality and module tests...\n');
    
    const tests = [
        testConfigTemplate,
        testBrandNeutrality,
        testFileStructure,
        testModuleIntegration,
        testSeveNueModule,
        testMrketOzModule,
        testCustomerEngagementModule,
        testSecurityObservabilityModule,
        testModuleAPIs
    ];
    
    tests.forEach(test => {
        try {
            totalTests++;
            if (test()) {
                passedTests++;
            }
        } catch (error) {
            console.error(`❌ Test failed with error: ${error.message}`);
        }
        console.log(''); // Add spacing between tests
    });
    
    // Final results
    console.log(`Tests completed: ${passedTests}/${totalTests} passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Repository is brand-neutral and modules are properly integrated.');
        process.exit(0);
    } else {
        console.log(`❌ ${totalTests - passedTests} tests failed. Please review and fix issues.`);
        process.exit(1);
    }
}

function testConfigTemplate() {
    console.log('Testing configuration template...');
    
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            console.error(`❌ Configuration template file not found: ${CONFIG_FILE}`);
            return false;
        }
        
        const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
        const config = JSON.parse(configContent);
        
        // Test required structure
        const requiredKeys = ['cloud', 'domains', 'analytics', 'search', 'authentication'];
        
        for (const key of requiredKeys) {
            if (!(key in config)) {
                console.error(`❌ Missing required configuration key: ${key}`);
                return false;
            }
        }
        
        // Test cloud provider neutrality
        if (config.cloud.provider !== 'CLOUD_PROVIDER') {
            console.error('❌ Cloud provider should be placeholder value');
            return false;
        }
        
        console.log('✅ Configuration template is valid');
        return true;
        
    } catch (error) {
        console.error(`❌ Configuration template error: ${error.message}`);
        return false;
    }
}

function testBrandNeutrality() {
    console.log('Testing brand neutrality...');
    
    const filesToCheck = [
        'README.md',
        'public/index.html',
        'public/ind2x.html',
        'public/strategic-analysis.js',
        'functions/index.js',
        'deploy',
        'roots'
    ];
    
    let violations = [];
    
    filesToCheck.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            
            BANNED_TERMS.forEach(term => {
                if (content.toLowerCase().includes(term.toLowerCase())) {
                    violations.push(`${file}: contains "${term}"`);
                }
            });
        }
    });
    
    if (violations.length > 0) {
        console.error('❌ Brand neutrality violations found:');
        violations.forEach(violation => console.error(`   ${violation}`));
        return false;
    }
    
    console.log('✅ No brand-specific terms found in main files');
    return true;
}

function testFileStructure() {
    console.log('Testing file structure...');
    
    let missingFiles = [];
    
    REQUIRED_FILES.forEach(file => {
        if (!fs.existsSync(file)) {
            missingFiles.push(file);
        }
    });
    
    if (missingFiles.length > 0) {
        console.error('❌ Missing required files:');
        missingFiles.forEach(file => console.error(`   ${file}`));
        return false;
    }
    
    console.log('✅ All required files present');
    return true;
}

function testModuleIntegration() {
    console.log('Testing module integration...');
    
    try {
        // Check if modules are properly referenced in index.html
        const indexContent = fs.readFileSync('public/index.html', 'utf8');
        
        const moduleScripts = [
            'security-observability.js',
            'sevenue-module.js',
            'mrketoz-module.js',
            'customer-engagement.js'
        ];
        
        let missingReferences = [];
        moduleScripts.forEach(script => {
            if (!indexContent.includes(script)) {
                missingReferences.push(script);
            }
        });
        
        if (missingReferences.length > 0) {
            console.error('❌ Missing module script references in index.html:');
            missingReferences.forEach(ref => console.error(`   ${ref}`));
            return false;
        }
        
        // Check for DesignfitoutSystem integration
        if (!indexContent.includes('DesignfitoutSystem')) {
            console.error('❌ DesignfitoutSystem integration not found in index.html');
            return false;
        }
        
        console.log('✅ Module integration verified');
        return true;
        
    } catch (error) {
        console.error(`❌ Module integration test error: ${error.message}`);
        return false;
    }
}

function testSeveNueModule() {
    console.log('Testing SeveNue module...');
    
    try {
        const moduleContent = fs.readFileSync('public/sevenue-module.js', 'utf8');
        
        // Check for required SeveNue components
        const requiredComponents = [
            'class SeveNueModule',
            'initializeDispatchSystem',
            'initializeQuotationEngine',
            'initializeFFmpegRenderer',
            'generateLuxuryQuotation',
            'handleRenderRequest'
        ];
        
        let missingComponents = [];
        requiredComponents.forEach(component => {
            if (!moduleContent.includes(component)) {
                missingComponents.push(component);
            }
        });
        
        if (missingComponents.length > 0) {
            console.error('❌ Missing SeveNue components:');
            missingComponents.forEach(comp => console.error(`   ${comp}`));
            return false;
        }
        
        // Check for FFmpeg rendering capabilities
        if (!moduleContent.includes('FFmpeg') || !moduleContent.includes('rendering')) {
            console.error('❌ FFmpeg rendering capabilities not found');
            return false;
        }
        
        // Check for quotation logic
        if (!moduleContent.includes('quotation') || !moduleContent.includes('luxury_villa_joinery')) {
            console.error('❌ Quotation logic for luxury services not found');
            return false;
        }
        
        console.log('✅ SeveNue module structure validated');
        return true;
        
    } catch (error) {
        console.error(`❌ SeveNue module test error: ${error.message}`);
        return false;
    }
}

function testMrketOzModule() {
    console.log('Testing MrketOz module...');
    
    try {
        const moduleContent = fs.readFileSync('public/mrketoz-module.js', 'utf8');
        
        // Check for required MrketOz AI components
        const requiredComponents = [
            'class MrketOzModule',
            'initializeAIEngine',
            'initializeMarketIntelligence',
            'initializeCustomerProfiling',
            'neuralNetwork',
            'customerBehavior',
            'marketTrends'
        ];
        
        let missingComponents = [];
        requiredComponents.forEach(component => {
            if (!moduleContent.includes(component)) {
                missingComponents.push(component);
            }
        });
        
        if (missingComponents.length > 0) {
            console.error('❌ Missing MrketOz AI components:');
            missingComponents.forEach(comp => console.error(`   ${comp}`));
            return false;
        }
        
        // Check for AI learning capabilities
        if (!moduleContent.includes('learning') || !moduleContent.includes('prediction')) {
            console.error('❌ AI learning and prediction capabilities not found');
            return false;
        }
        
        // Check for market intelligence
        if (!moduleContent.includes('market') || !moduleContent.includes('intelligence')) {
            console.error('❌ Market intelligence features not found');
            return false;
        }
        
        console.log('✅ MrketOz AI module structure validated');
        return true;
        
    } catch (error) {
        console.error(`❌ MrketOz module test error: ${error.message}`);
        return false;
    }
}

function testCustomerEngagementModule() {
    console.log('Testing Customer Engagement module...');
    
    try {
        const moduleContent = fs.readFileSync('public/customer-engagement.js', 'utf8');
        
        // Check for required engagement components
        const requiredComponents = [
            'class CustomerEngagementModule',
            'initializeEngagementEngine',
            'initializePersonalization',
            'initializeRecommendationEngine',
            'luxury_villa_joinery',
            'turnkey_service',
            'fitout_service',
            'generateSmartSuggestions'
        ];
        
        let missingComponents = [];
        requiredComponents.forEach(component => {
            if (!moduleContent.includes(component)) {
                missingComponents.push(component);
            }
        });
        
        if (missingComponents.length > 0) {
            console.error('❌ Missing Customer Engagement components:');
            missingComponents.forEach(comp => console.error(`   ${comp}`));
            return false;
        }
        
        // Check for luxury service recommendations
        if (!moduleContent.includes('luxury') || !moduleContent.includes('villa')) {
            console.error('❌ Luxury service recommendations not found');
            return false;
        }
        
        // Check for smart suggestions
        if (!moduleContent.includes('smart') || !moduleContent.includes('suggestions')) {
            console.error('❌ Smart suggestions functionality not found');
            return false;
        }
        
        console.log('✅ Customer Engagement module structure validated');
        return true;
        
    } catch (error) {
        console.error(`❌ Customer Engagement module test error: ${error.message}`);
        return false;
    }
}

function testSecurityObservabilityModule() {
    console.log('Testing Security & Observability module...');
    
    try {
        const moduleContent = fs.readFileSync('public/security-observability.js', 'utf8');
        
        // Check for required security components
        const requiredComponents = [
            'class SecurityObservabilityModule',
            'initializeSecurity',
            'initializeMonitoring',
            'initializeAuditLogging',
            'initializeAlertSystem',
            'trackWebVitals',
            'monitorCSP',
            'auditLog'
        ];
        
        let missingComponents = [];
        requiredComponents.forEach(component => {
            if (!moduleContent.includes(component)) {
                missingComponents.push(component);
            }
        });
        
        if (missingComponents.length > 0) {
            console.error('❌ Missing Security & Observability components:');
            missingComponents.forEach(comp => console.error(`   ${comp}`));
            return false;
        }
        
        // Check for enhanced security measures
        if (!moduleContent.includes('security') || !moduleContent.includes('monitoring')) {
            console.error('❌ Enhanced security measures not found');
            return false;
        }
        
        // Check for observability features
        if (!moduleContent.includes('observability') || !moduleContent.includes('audit')) {
            console.error('❌ Observability features not found');
            return false;
        }
        
        console.log('✅ Security & Observability module structure validated');
        return true;
        
    } catch (error) {
        console.error(`❌ Security & Observability module test error: ${error.message}`);
        return false;
    }
}

function testModuleAPIs() {
    console.log('Testing module API integrations...');
    
    try {
        const indexContent = fs.readFileSync('public/index.html', 'utf8');
        
        // Check for integrated API methods
        const requiredAPIs = [
            'generateSmartQuotation',
            'engageNewCustomer',
            'getSystemStatus',
            'SeveNue',
            'MrketOz',
            'CustomerEngagement',
            'SecurityObservability'
        ];
        
        let missingAPIs = [];
        requiredAPIs.forEach(api => {
            if (!indexContent.includes(api)) {
                missingAPIs.push(api);
            }
        });
        
        if (missingAPIs.length > 0) {
            console.error('❌ Missing integrated API methods:');
            missingAPIs.forEach(api => console.error(`   ${api}`));
            return false;
        }
        
        // Check for backend functions integration
        const functionsContent = fs.readFileSync('functions/index.js', 'utf8');
        const requiredFunctions = [
            'processVideoRender',
            'processAIAnalysis', 
            'processCustomerEngagement',
            'generateEnhancedQuotation',
            'securityAuditLog',
            'recordPerformanceMetrics'
        ];
        
        let missingFunctions = [];
        requiredFunctions.forEach(func => {
            if (!functionsContent.includes(func)) {
                missingFunctions.push(func);
            }
        });
        
        if (missingFunctions.length > 0) {
            console.error('❌ Missing backend functions:');
            missingFunctions.forEach(func => console.error(`   ${func}`));
            return false;
        }
        
        console.log('✅ Module API integrations validated');
        return true;
        
    } catch (error) {
        console.error(`❌ Module API test error: ${error.message}`);
        return false;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = {
    runTests,
    testConfigTemplate,
    testBrandNeutrality,
    testFileStructure,
    testModuleIntegration,
    testSeveNueModule,
    testMrketOzModule,
    testCustomerEngagementModule,
    testSecurityObservabilityModule,
    testModuleAPIs
};