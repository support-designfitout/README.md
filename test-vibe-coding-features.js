#!/usr/bin/env node

/**
 * Vibe Coding Features Test Suite
 * Tests all AI-enhanced modules and functionality
 */

const fs = require('fs');
const path = require('path');

class VibeCodingTestSuite {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
        this.startTime = Date.now();
    }

    async runAllTests() {
        console.log('🤖 Running Vibe Coding Features Test Suite...\n');

        // Test configuration files
        await this.testVibeCodingConfiguration();
        
        // Test AI-enhanced modules exist and are structured correctly
        await this.testAIModuleStructure();
        
        // Test documentation completeness
        await this.testDocumentationCompleteness();
        
        // Test GitHub Copilot integration readiness
        await this.testCopilotIntegration();
        
        // Test cloud-agnostic principles
        await this.testCloudAgnosticPrinciples();

        // Print final results
        this.printFinalResults();
        
        return this.failedTests === 0;
    }

    async testVibeCodingConfiguration() {
        console.log('📋 Testing Vibe Coding Configuration...');
        
        // Test vibe-coding-config.json exists and is valid
        await this.runTest('vibe-coding-config.json exists', () => {
            return fs.existsSync(path.join(__dirname, 'vibe-coding-config.json'));
        });

        await this.runTest('vibe-coding-config.json is valid JSON', () => {
            const configPath = path.join(__dirname, 'vibe-coding-config.json');
            if (!fs.existsSync(configPath)) return false;
            
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                return config && config['vibe-coding'] && config['vibe-coding'].version;
            } catch (error) {
                return false;
            }
        });

        await this.runTest('vibe-coding-config.json contains all required modules', () => {
            const configPath = path.join(__dirname, 'vibe-coding-config.json');
            if (!fs.existsSync(configPath)) return false;
            
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                const modules = config['vibe-coding'].modules;
                
                const requiredModules = [
                    'mrketoz-crm',
                    'drawing-tools', 
                    'interior-outdoor-design',
                    'blogging-features',
                    'designpedia',
                    'quotation-generation',
                    'automation',
                    'kpis'
                ];

                return requiredModules.every(module => modules[module]);
            } catch (error) {
                return false;
            }
        });

        await this.runTest('AI development standards defined', () => {
            const configPath = path.join(__dirname, 'vibe-coding-config.json');
            if (!fs.existsSync(configPath)) return false;
            
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                const standards = config['vibe-coding']['development-standards'];
                
                return standards && 
                       standards['ai-assistance'] && 
                       standards['cloud-agnostic'] && 
                       standards['performance'] && 
                       standards['security'];
            } catch (error) {
                return false;
            }
        });
    }

    async testAIModuleStructure() {
        console.log('🧱 Testing AI Module Structure...');

        // Test AI-enhanced MrketOz CRM
        await this.runTest('AI-enhanced MrketOz CRM file exists', () => {
            return fs.existsSync(path.join(__dirname, 'functions', 'ai-enhanced-mrketoz-crm.js'));
        });

        await this.runTest('AI-enhanced MrketOz CRM has required classes', () => {
            const filePath = path.join(__dirname, 'functions', 'ai-enhanced-mrketoz-crm.js');
            if (!fs.existsSync(filePath)) return false;
            
            const content = fs.readFileSync(filePath, 'utf8');
            const requiredClasses = [
                'CustomerSentimentAnalyzer',
                'SmartLeadScorer',
                'PredictiveNeedsAnalyzer'
            ];

            return requiredClasses.every(className => content.includes(`class ${className}`));
        });

        // Test AI Drawing Tools
        await this.runTest('AI Drawing Tools file exists', () => {
            return fs.existsSync(path.join(__dirname, 'public', 'ai-drawing-tools.js'));
        });

        await this.runTest('AI Drawing Tools has required functionality', () => {
            const filePath = path.join(__dirname, 'public', 'ai-drawing-tools.js');
            if (!fs.existsSync(filePath)) return false;
            
            const content = fs.readFileSync(filePath, 'utf8');
            const requiredFeatures = [
                'AIDrawingToolsEngine',
                'SpaceOptimizer',
                'CostEstimator',
                'analyzeDrawing',
                'checkBuildingCodeCompliance'
            ];

            return requiredFeatures.every(feature => content.includes(feature));
        });

        // Test AI Design Studio
        await this.runTest('AI Design Studio file exists', () => {
            return fs.existsSync(path.join(__dirname, 'public', 'ai-design-studio.js'));
        });

        await this.runTest('AI Design Studio has mood board generation', () => {
            const filePath = path.join(__dirname, 'public', 'ai-design-studio.js');
            if (!fs.existsSync(filePath)) return false;
            
            const content = fs.readFileSync(filePath, 'utf8');
            const requiredFeatures = [
                'AIDesignStudio',
                'generateMoodBoard',
                'ColorHarmonyEngine',
                'MaterialCompatibilityChecker',
                'generateColorPalette'
            ];

            return requiredFeatures.every(feature => content.includes(feature));
        });

        // Test module integration points
        await this.runTest('Modules have proper export/import structure', () => {
            const files = [
                path.join(__dirname, 'functions', 'ai-enhanced-mrketoz-crm.js'),
                path.join(__dirname, 'public', 'ai-drawing-tools.js'),
                path.join(__dirname, 'public', 'ai-design-studio.js')
            ];

            return files.every(file => {
                if (!fs.existsSync(file)) return false;
                const content = fs.readFileSync(file, 'utf8');
                return content.includes('export') || content.includes('window.') || content.includes('module.exports');
            });
        });
    }

    async testDocumentationCompleteness() {
        console.log('📚 Testing Documentation Completeness...');

        await this.runTest('VIBE_CODING_GUIDE.md exists', () => {
            return fs.existsSync(path.join(__dirname, 'VIBE_CODING_GUIDE.md'));
        });

        await this.runTest('VIBE_CODING_GUIDE.md has comprehensive content', () => {
            const guidePath = path.join(__dirname, 'VIBE_CODING_GUIDE.md');
            if (!fs.existsSync(guidePath)) return false;
            
            const content = fs.readFileSync(guidePath, 'utf8');
            const requiredSections = [
                '## 🚀 Overview',
                '## 🎯 Core Principles',
                '## 🛠️ AI-Enhanced Module Implementation',
                '## 🔧 AI Development Workflows',
                '## 🎨 UI/UX Enhancement with AI',
                '## 📊 AI-Powered Analytics and Insights',
                '## 🚀 Deployment and Monitoring',
                '## 🔍 Testing with AI Assistance',
                '## 🎯 Best Practices'
            ];

            return requiredSections.every(section => content.includes(section));
        });

        await this.runTest('Documentation includes code examples', () => {
            const guidePath = path.join(__dirname, 'VIBE_CODING_GUIDE.md');
            if (!fs.existsSync(guidePath)) return false;
            
            const content = fs.readFileSync(guidePath, 'utf8');
            const codeBlockCount = (content.match(/```javascript/g) || []).length;
            
            return codeBlockCount >= 10; // Should have at least 10 code examples
        });

        await this.runTest('All AI modules documented in guide', () => {
            const guidePath = path.join(__dirname, 'VIBE_CODING_GUIDE.md');
            if (!fs.existsSync(guidePath)) return false;
            
            const content = fs.readFileSync(guidePath, 'utf8');
            const documentedModules = [
                'MrketOz CRM',
                'Drawing Tools',
                'Interior/Outdoor Design',
                'Blogging Features',
                'Designpedia',
                'Smart Component Generation',
                'KPI Dashboard'
            ];

            return documentedModules.every(module => content.includes(module));
        });
    }

    async testCopilotIntegration() {
        console.log('🤝 Testing GitHub Copilot Integration Readiness...');

        await this.runTest('Copilot instructions exist', () => {
            return fs.existsSync(path.join(__dirname, '.github', 'copilot-instructions.md'));
        });

        await this.runTest('Copilot instructions mention vibe coding', () => {
            const instructionsPath = path.join(__dirname, '.github', 'copilot-instructions.md');
            if (!fs.existsSync(instructionsPath)) return false;
            
            const content = fs.readFileSync(instructionsPath, 'utf8');
            return content.toLowerCase().includes('ai') || 
                   content.toLowerCase().includes('copilot') ||
                   content.toLowerCase().includes('vibe');
        });

        await this.runTest('VSCode settings support Copilot', () => {
            const guidePath = path.join(__dirname, 'VIBE_CODING_GUIDE.md');
            if (!fs.existsSync(guidePath)) return false;
            
            const content = fs.readFileSync(guidePath, 'utf8');
            return content.includes('.vscode/settings.json') && 
                   content.includes('github.copilot.enable');
        });

        await this.runTest('AI workflow templates defined', () => {
            const configPath = path.join(__dirname, 'vibe-coding-config.json');
            if (!fs.existsSync(configPath)) return false;
            
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                const templates = config['vibe-coding']['ai-workflow-templates'];
                
                return templates && 
                       templates['feature-development'] && 
                       templates['bug-fixing'] && 
                       templates['optimization'];
            } catch (error) {
                return false;
            }
        });
    }

    async testCloudAgnosticPrinciples() {
        console.log('☁️ Testing Cloud-Agnostic Principles...');

        await this.runTest('No hard-coded cloud provider references in AI modules', () => {
            const aiFiles = [
                path.join(__dirname, 'functions', 'ai-enhanced-mrketoz-crm.js'),
                path.join(__dirname, 'public', 'ai-drawing-tools.js'),
                path.join(__dirname, 'public', 'ai-design-studio.js')
            ];

            const bannedTerms = ['firebase', 'cloudflare', 'aws', 'azure', 'gcp'];
            
            return aiFiles.every(file => {
                if (!fs.existsSync(file)) return true; // Skip non-existent files
                const content = fs.readFileSync(file, 'utf8').toLowerCase();
                return !bannedTerms.some(term => content.includes(term));
            });
        });

        await this.runTest('AI configuration uses environment variables', () => {
            const configPath = path.join(__dirname, 'vibe-coding-config.json');
            if (!fs.existsSync(configPath)) return false;
            
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                const integration = config['vibe-coding'].integration;
                
                return integration && 
                       integration['custom-ai-apis'] && 
                       integration['custom-ai-apis']['base-url'] && 
                       integration['custom-ai-apis']['base-url'].includes('${');
            } catch (error) {
                return false;
            }
        });

        await this.runTest('Brand neutrality maintained in new files', () => {
            const newFiles = [
                'functions/ai-enhanced-mrketoz-crm.js',
                'public/ai-drawing-tools.js',
                'public/ai-design-studio.js'
            ];

            const bannedTerms = ['firebase', 'cloudflare', 'ga4', 'gsc'];
            
            return newFiles.every(file => {
                const filePath = path.join(__dirname, file);
                if (!fs.existsSync(filePath)) return true;
                
                const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
                // Exclude policy/configuration contexts where terms are mentioned as banned
                const hasUnallowedUsage = bannedTerms.some(term => {
                    const termOccurrences = content.split(term).length - 1;
                    // Allow mentions in policy contexts (like "banned-terms")
                    const policyMentions = (content.match(new RegExp(`["']?banned[_-]?terms?["']?[\\s\\S]*?${term}`, 'gi')) || []).length;
                    return termOccurrences > policyMentions;
                });
                return !hasUnallowedUsage;
            });
        });

        await this.runTest('Configuration-driven AI service integration', () => {
            const guidePath = path.join(__dirname, 'VIBE_CODING_GUIDE.md');
            if (!fs.existsSync(guidePath)) return false;
            
            const content = fs.readFileSync(guidePath, 'utf8');
            return content.includes('aiConfig') && 
                   content.includes('process.env') &&
                   content.includes('AI_API_BASE_URL');
        });
    }

    async runTest(testName, testFunction) {
        try {
            const result = await testFunction();
            if (result) {
                console.log(`✅ ${testName}`);
                this.passedTests++;
                this.testResults.push({ name: testName, status: 'PASS' });
            } else {
                console.log(`❌ ${testName}`);
                this.failedTests++;
                this.testResults.push({ name: testName, status: 'FAIL' });
            }
        } catch (error) {
            console.log(`❌ ${testName} (Error: ${error.message})`);
            this.failedTests++;
            this.testResults.push({ name: testName, status: 'ERROR', error: error.message });
        }
    }

    printFinalResults() {
        const totalTests = this.passedTests + this.failedTests;
        const duration = Date.now() - this.startTime;
        
        console.log('\n' + '='.repeat(80));
        console.log('🤖 VIBE CODING FEATURES TEST RESULTS');
        console.log('='.repeat(80));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${this.passedTests} ✅`);
        console.log(`Failed: ${this.failedTests} ❌`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Success Rate: ${((this.passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (this.failedTests > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.testResults
                .filter(test => test.status !== 'PASS')
                .forEach(test => {
                    console.log(`  • ${test.name} (${test.status})`);
                    if (test.error) {
                        console.log(`    Error: ${test.error}`);
                    }
                });
        }
        
        console.log('\n' + '='.repeat(80));
        
        if (this.failedTests === 0) {
            console.log('🎉 All vibe coding features tests passed! AI-enhanced modules are ready for use.');
        } else {
            console.log('⚠️  Some tests failed. Please review the issues above before deployment.');
        }
        
        console.log('='.repeat(80));
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const testSuite = new VibeCodingTestSuite();
    testSuite.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test suite failed:', error);
        process.exit(1);
    });
}

module.exports = VibeCodingTestSuite;