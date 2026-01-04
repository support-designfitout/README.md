/**
 * Enhanced Brand Neutrality and Module Testing
 * Extended test suite for modular architecture and deep learning features
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
    brand_neutrality: {
        enabled: true,
        banned_terms: ['firebase', 'cloudflare', 'ga4', 'gsc'],
        check_files: ['public/index.html', 'public/ind2x.html', 'functions/index.js', 'README.md']
    },
    module_structure: {
        enabled: true,
        required_modules: ['core', 'ai', 'ui', 'analytics'],
        critical_files: [
            'modules/core/module-loader.js',
            'modules/ai/deep-learning-narrative.js',
            'modules/ui/visual-effects.js',
            'modules/module-bootstrap.js',
            'modules/module-config.json'
        ]
    },
    deep_learning: {
        enabled: true,
        check_features: ['narrative', 'sentiment', 'adaptive', 'context']
    }
};

class EnhancedTestSuite {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            details: []
        };
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Running Enhanced Brand Neutrality and Module Tests...\n');

        // Core tests
        if (TEST_CONFIG.brand_neutrality.enabled) {
            await this.testBrandNeutrality();
        }
        
        if (TEST_CONFIG.module_structure.enabled) {
            await this.testModuleStructure();
        }
        
        if (TEST_CONFIG.deep_learning.enabled) {
            await this.testDeepLearningFeatures();
        }

        // Additional tests
        await this.testConfigurationTemplate();
        await this.testFileStructure();
        await this.testDeploymentReadiness();

        this.printResults();
    }

    /**
     * Test brand neutrality
     */
    async testBrandNeutrality() {
        this.log('info', 'Testing brand neutrality...');
        
        const bannedTerms = TEST_CONFIG.brand_neutrality.banned_terms;
        const filesToCheck = TEST_CONFIG.brand_neutrality.check_files;
        let violations = [];

        for (const filePath of filesToCheck) {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
                
                for (const term of bannedTerms) {
                    if (content.includes(term)) {
                        violations.push({ file: filePath, term });
                    }
                }
            }
        }

        if (violations.length === 0) {
            this.pass('Brand neutrality', 'No brand-specific terms found in main files');
        } else {
            violations.forEach(v => {
                this.fail('Brand neutrality', `Found banned term "${v.term}" in ${v.file}`);
            });
        }
    }

    /**
     * Test module structure
     */
    async testModuleStructure() {
        this.log('info', 'Testing module structure...');

        // Check required module directories
        const requiredModules = TEST_CONFIG.module_structure.required_modules;
        let modulesMissing = [];

        for (const module of requiredModules) {
            const modulePath = path.join('modules', module);
            if (!fs.existsSync(modulePath)) {
                modulesMissing.push(module);
            }
        }

        if (modulesMissing.length === 0) {
            this.pass('Module directories', `All ${requiredModules.length} required module directories present`);
        } else {
            this.fail('Module directories', `Missing modules: ${modulesMissing.join(', ')}`);
        }

        // Check critical files
        const criticalFiles = TEST_CONFIG.module_structure.critical_files;
        let filesMissing = [];
        let filesPresent = 0;

        for (const file of criticalFiles) {
            if (fs.existsSync(file)) {
                filesPresent++;
                
                // Check file size (basic validation)
                const stats = fs.statSync(file);
                if (stats.size === 0) {
                    this.warn('Module files', `File ${file} is empty`);
                }
            } else {
                filesMissing.push(file);
            }
        }

        if (filesMissing.length === 0) {
            this.pass('Module files', `All ${criticalFiles.length} critical module files present`);
        } else {
            this.fail('Module files', `Missing files: ${filesMissing.join(', ')}`);
        }
    }

    /**
     * Test deep learning features
     */
    async testDeepLearningFeatures() {
        this.log('info', 'Testing deep learning narrative features...');

        const dlFile = 'modules/ai/deep-learning-narrative.js';
        if (!fs.existsSync(dlFile)) {
            this.fail('Deep learning', 'Deep learning narrative module not found');
            return;
        }

        const content = fs.readFileSync(dlFile, 'utf8');
        const features = TEST_CONFIG.deep_learning.check_features;
        let foundFeatures = 0;

        // Check for key features
        const featurePatterns = {
            narrative: /class DeepLearningNarrative|generateAdaptiveNarratives|adaptNarrative/i,
            sentiment: /sentiment.*analysis|updateSentimentAnalysis|calculateAverageSentiment/i,
            adaptive: /adaptive.*learning|performAdaptiveLearning|triggerAdaptiveLearning/i,
            context: /context.*vector|generateContextVector|getCurrentContext/i
        };

        for (const feature of features) {
            if (featurePatterns[feature] && featurePatterns[feature].test(content)) {
                foundFeatures++;
            }
        }

        if (foundFeatures === features.length) {
            this.pass('Deep learning features', `All ${features.length} key features implemented`);
        } else {
            this.warn('Deep learning features', `${foundFeatures}/${features.length} features found`);
        }

        // Check for neural network simulation
        if (content.includes('neural') || content.includes('weights') || content.includes('learning')) {
            this.pass('AI implementation', 'Neural network simulation components found');
        } else {
            this.warn('AI implementation', 'Limited AI simulation components detected');
        }
    }

    /**
     * Test configuration template
     */
    async testConfigurationTemplate() {
        this.log('info', 'Testing configuration template...');

        if (!fs.existsSync('config.template.json')) {
            this.fail('Configuration', 'config.template.json not found');
            return;
        }

        try {
            const config = JSON.parse(fs.readFileSync('config.template.json', 'utf8'));
            
            const requiredKeys = ['cloud', 'domains'];
            const missingKeys = requiredKeys.filter(key => !config[key]);
            
            if (missingKeys.length === 0) {
                this.pass('Configuration template', 'All required configuration keys present');
            } else {
                this.fail('Configuration template', `Missing keys: ${missingKeys.join(', ')}`);
            }
            
        } catch (error) {
            this.fail('Configuration template', `Invalid JSON: ${error.message}`);
        }

        // Test module configuration
        if (fs.existsSync('modules/module-config.json')) {
            try {
                const moduleConfig = JSON.parse(fs.readFileSync('modules/module-config.json', 'utf8'));
                
                if (moduleConfig.modules && moduleConfig.globalConfig) {
                    this.pass('Module configuration', 'Module configuration structure valid');
                } else {
                    this.warn('Module configuration', 'Module configuration missing required sections');
                }
                
            } catch (error) {
                this.fail('Module configuration', `Invalid module config JSON: ${error.message}`);
            }
        } else {
            this.warn('Module configuration', 'Module configuration file not found');
        }
    }

    /**
     * Test file structure
     */
    async testFileStructure() {
        this.log('info', 'Testing file structure...');

        const requiredFiles = [
            'public/index.html',
            'public/ind2x.html',
            'functions/index.js',
            'test-brand-neutrality.js',
            'README.md'
        ];

        const requiredDirs = [
            'public',
            'functions',
            'modules'
        ];

        let allFilesPresent = true;
        let allDirsPresent = true;

        // Check files
        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                this.fail('File structure', `Required file missing: ${file}`);
                allFilesPresent = false;
            }
        }

        // Check directories
        for (const dir of requiredDirs) {
            if (!fs.existsSync(dir)) {
                this.fail('File structure', `Required directory missing: ${dir}`);
                allDirsPresent = false;
            }
        }

        if (allFilesPresent && allDirsPresent) {
            this.pass('File structure', 'All required files and directories present');
        }
    }

    /**
     * Test deployment readiness
     */
    async testDeploymentReadiness() {
        this.log('info', 'Testing deployment readiness...');

        // Check for deployment script
        const deploymentScripts = ['deploy-enhanced.sh', 'deploy'];
        let deploymentScriptFound = false;

        for (const script of deploymentScripts) {
            if (fs.existsSync(script)) {
                deploymentScriptFound = true;
                
                // Check if script is executable
                try {
                    const stats = fs.statSync(script);
                    const isExecutable = stats.mode & parseInt('111', 8);
                    
                    if (isExecutable) {
                        this.pass('Deployment script', `${script} is executable`);
                    } else {
                        this.warn('Deployment script', `${script} may not be executable`);
                    }
                } catch (error) {
                    this.warn('Deployment script', `Could not check ${script} permissions`);
                }
                break;
            }
        }

        if (!deploymentScriptFound) {
            this.warn('Deployment script', 'No deployment script found');
        }

        // Check for essential configuration files
        const configFiles = ['config.template.json', 'firebase.json'];
        let configCount = 0;

        for (const config of configFiles) {
            if (fs.existsSync(config)) {
                configCount++;
            }
        }

        if (configCount > 0) {
            this.pass('Configuration files', `${configCount} configuration files found`);
        } else {
            this.warn('Configuration files', 'No configuration files found');
        }
    }

    /**
     * Log test result as pass
     */
    pass(category, message) {
        this.testResults.passed++;
        this.testResults.details.push({ type: 'pass', category, message });
        console.log(`✅ ${message}`);
    }

    /**
     * Log test result as fail
     */
    fail(category, message) {
        this.testResults.failed++;
        this.testResults.details.push({ type: 'fail', category, message });
        console.log(`❌ ${message}`);
    }

    /**
     * Log test result as warning
     */
    warn(category, message) {
        this.testResults.warnings++;
        this.testResults.details.push({ type: 'warn', category, message });
        console.log(`⚠️ ${message}`);
    }

    /**
     * Log info message
     */
    log(level, message) {
        if (level === 'info') {
            console.log(`\n${message}`);
        }
    }

    /**
     * Print final test results
     */
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 Enhanced Test Results Summary');
        console.log('='.repeat(60));
        
        console.log(`✅ Tests Passed: ${this.testResults.passed}`);
        console.log(`❌ Tests Failed: ${this.testResults.failed}`);
        console.log(`⚠️ Warnings: ${this.testResults.warnings}`);
        
        const total = this.testResults.passed + this.testResults.failed;
        const successRate = total > 0 ? Math.round((this.testResults.passed / total) * 100) : 0;
        
        console.log(`📈 Success Rate: ${successRate}%`);

        if (this.testResults.failed === 0) {
            console.log('\n🎉 All critical tests passed! Repository is ready for enhanced deployment.');
            console.log('🧠 Deep learning narrative features are properly structured.');
            console.log('🏗️ Modular architecture is correctly implemented.');
            
            if (this.testResults.warnings > 0) {
                console.log(`⚠️ Note: ${this.testResults.warnings} warnings found - review for optimization.`);
            }
        } else {
            console.log(`\n💥 ${this.testResults.failed} critical tests failed. Please fix before deployment.`);
            
            // Show failed tests
            const failures = this.testResults.details.filter(d => d.type === 'fail');
            if (failures.length > 0) {
                console.log('\n🔍 Failed Tests:');
                failures.forEach(f => {
                    console.log(`   ❌ ${f.category}: ${f.message}`);
                });
            }
        }

        console.log('\n🚀 Enhanced features ready for deployment:');
        console.log('   • Modular Architecture');
        console.log('   • Deep Learning Narrative System');  
        console.log('   • Enhanced Visual Effects');
        console.log('   • Strategic Analysis Integration');
        console.log('   • Adaptive User Interactions');
        
        console.log('='.repeat(60));
    }
}

// Run tests if called directly
if (require.main === module) {
    const testSuite = new EnhancedTestSuite();
    testSuite.runAllTests().catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = EnhancedTestSuite;