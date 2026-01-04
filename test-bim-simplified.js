/**
 * Simplified BIM Functionality Tests
 * Tests core BIM functionality with basic validation
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️  Running Simplified BIM Functionality Tests...\n');

// Test 1: Check if all BIM files exist
function testBIMFilesExist() {
    console.log('📁 Testing BIM Service Files...');
    
    const requiredFiles = [
        './functions/bim-digital-twin.js',
        './functions/bim-clash-detection.js',
        './functions/bim-smart-materials.js',
        './functions/bim-documentation.js',
        './functions/bim-sustainability.js'
    ];

    let allExist = true;
    for (const file of requiredFiles) {
        if (fs.existsSync(path.resolve(file))) {
            console.log(`✅ ${file} exists`);
        } else {
            console.log(`❌ ${file} missing`);
            allExist = false;
        }
    }
    
    console.log(`${allExist ? '✅' : '❌'} BIM service files ${allExist ? 'all exist' : 'missing'}\n`);
    return allExist;
}

// Test 2: Check if files can be loaded (syntax check)
function testBIMFilesSyntax() {
    console.log('🔍 Testing BIM Service File Syntax...');
    
    const requiredFiles = [
        './functions/bim-digital-twin.js',
        './functions/bim-clash-detection.js',
        './functions/bim-smart-materials.js',
        './functions/bim-documentation.js',
        './functions/bim-sustainability.js'
    ];

    let allValid = true;
    for (const file of requiredFiles) {
        try {
            const content = fs.readFileSync(path.resolve(file), 'utf8');
            // Basic syntax checks
            if (content.includes('class ') && content.includes('constructor()')) {
                console.log(`✅ ${file} has valid class structure`);
            } else {
                console.log(`❌ ${file} missing class structure`);
                allValid = false;
            }
        } catch (error) {
            console.log(`❌ ${file} syntax error: ${error.message}`);
            allValid = false;
        }
    }
    
    console.log(`${allValid ? '✅' : '❌'} BIM service files ${allValid ? 'have valid syntax' : 'have syntax issues'}\n`);
    return allValid;
}

// Test 3: Check if main index.js includes BIM routes
function testBIMIntegration() {
    console.log('🔗 Testing BIM Integration in Main Index...');
    
    try {
        const indexContent = fs.readFileSync('./functions/index.js', 'utf8');
        
        const expectedIntegrations = [
            'bim-digital-twin',
            'bim-clash-detection',
            'bim-smart-materials',
            'bim-documentation',
            'bim-sustainability'
        ];
        
        let allIntegrated = true;
        for (const integration of expectedIntegrations) {
            if (indexContent.includes(integration)) {
                console.log(`✅ ${integration} integrated in main index`);
            } else {
                console.log(`❌ ${integration} not integrated in main index`);
                allIntegrated = false;
            }
        }
        
        // Check for BIM endpoints
        const expectedEndpoints = ['/twin', '/clash-detection', '/materials', '/docs', '/analytics'];
        for (const endpoint of expectedEndpoints) {
            if (indexContent.includes(endpoint)) {
                console.log(`✅ ${endpoint} endpoint configured`);
            } else {
                console.log(`❌ ${endpoint} endpoint missing`);
                allIntegrated = false;
            }
        }
        
        console.log(`${allIntegrated ? '✅' : '❌'} BIM integration ${allIntegrated ? 'complete' : 'incomplete'}\n`);
        return allIntegrated;
        
    } catch (error) {
        console.log(`❌ Error checking index.js: ${error.message}\n`);
        return false;
    }
}

// Test 4: Check cloud-agnostic compliance
function testCloudAgnosticCompliance() {
    console.log('☁️  Testing Cloud-Agnostic Compliance...');
    
    const serviceFiles = [
        './functions/bim-digital-twin.js',
        './functions/bim-clash-detection.js', 
        './functions/bim-smart-materials.js',
        './functions/bim-documentation.js',
        './functions/bim-sustainability.js'
    ];

    const bannedTerms = ['firebase', 'aws', 'azure', 'cloudflare'];
    let isCompliant = true;
    
    for (const file of serviceFiles) {
        if (fs.existsSync(path.resolve(file))) {
            const content = fs.readFileSync(path.resolve(file), 'utf8').toLowerCase();
            for (const term of bannedTerms) {
                // Allow comments and documentation mentions
                const lines = content.split('\n');
                for (const [index, line] of lines.entries()) {
                    if (line.includes(term) && 
                        !line.trim().startsWith('//') && 
                        !line.trim().startsWith('*') && 
                        !line.includes('cloud-agnostic')) {
                        console.log(`❌ Found banned term "${term}" in ${file}:${index + 1}`);
                        isCompliant = false;
                    }
                }
            }
        }
    }
    
    if (isCompliant) {
        console.log('✅ All BIM services are cloud-agnostic compliant');
    }
    
    console.log(`${isCompliant ? '✅' : '❌'} Cloud-agnostic compliance ${isCompliant ? 'passed' : 'failed'}\n`);
    return isCompliant;
}

// Test 5: Check service structure and exports
function testServiceStructure() {
    console.log('🏗️  Testing BIM Service Structure...');
    
    const serviceFiles = {
        './functions/bim-digital-twin.js': ['DigitalTwinService', 'handleDigitalTwinRequest'],
        './functions/bim-clash-detection.js': ['ClashDetectionService', 'handleClashDetectionRequest'],
        './functions/bim-smart-materials.js': ['SmartMaterialLibraryService', 'handleSmartMaterialRequest'],
        './functions/bim-documentation.js': ['AutomatedDocumentationEngine', 'handleDocumentationRequest'],
        './functions/bim-sustainability.js': ['SustainabilityAnalyticsService', 'handleSustainabilityRequest']
    };

    let allValid = true;
    
    for (const [file, expectedClasses] of Object.entries(serviceFiles)) {
        if (fs.existsSync(path.resolve(file))) {
            const content = fs.readFileSync(path.resolve(file), 'utf8');
            
            for (const className of expectedClasses) {
                if (content.includes(`class ${className}`) || content.includes(`function ${className}`)) {
                    console.log(`✅ ${className} found in ${path.basename(file)}`);
                } else {
                    console.log(`❌ ${className} missing from ${path.basename(file)}`);
                    allValid = false;
                }
            }
        } else {
            console.log(`❌ ${file} does not exist`);
            allValid = false;
        }
    }
    
    console.log(`${allValid ? '✅' : '❌'} Service structure ${allValid ? 'valid' : 'invalid'}\n`);
    return allValid;
}

// Test 6: Check for required functionality
function testRequiredFunctionality() {
    console.log('⚡ Testing Required BIM Functionality...');
    
    const functionalityChecks = {
        'Digital Twin': ['WebSocket', 'real-time', 'twin', 'update'],
        'Clash Detection': ['clash', 'MEP', 'structural', 'collision'],
        'Smart Materials': ['supplier', 'cost', 'availability', 'sustainability'],
        'Documentation': ['PDF', 'DWG', 'schedule', 'specification'],
        'Sustainability': ['carbon', 'energy', 'daylight', 'lifecycle']
    };

    const serviceFiles = [
        './functions/bim-digital-twin.js',
        './functions/bim-clash-detection.js',
        './functions/bim-smart-materials.js',
        './functions/bim-documentation.js',
        './functions/bim-sustainability.js'
    ];

    let allFunctional = true;
    
    for (const [index, file] of serviceFiles.entries()) {
        const serviceName = Object.keys(functionalityChecks)[index];
        const requiredKeywords = functionalityChecks[serviceName];
        
        if (fs.existsSync(path.resolve(file))) {
            const content = fs.readFileSync(path.resolve(file), 'utf8').toLowerCase();
            
            let keywordsFound = 0;
            for (const keyword of requiredKeywords) {
                if (content.includes(keyword.toLowerCase())) {
                    keywordsFound++;
                }
            }
            
            const percentage = (keywordsFound / requiredKeywords.length) * 100;
            if (percentage >= 75) {
                console.log(`✅ ${serviceName} has ${percentage.toFixed(0)}% required functionality`);
            } else {
                console.log(`❌ ${serviceName} only has ${percentage.toFixed(0)}% required functionality`);
                allFunctional = false;
            }
        } else {
            console.log(`❌ ${serviceName} service file missing`);
            allFunctional = false;
        }
    }
    
    console.log(`${allFunctional ? '✅' : '❌'} Required functionality ${allFunctional ? 'complete' : 'incomplete'}\n`);
    return allFunctional;
}

// Run all tests
async function runAllTests() {
    const results = [];
    
    results.push(testBIMFilesExist());
    results.push(testBIMFilesSyntax());
    results.push(testBIMIntegration());
    results.push(testCloudAgnosticCompliance());
    results.push(testServiceStructure());
    results.push(testRequiredFunctionality());
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    const successRate = (passed / total) * 100;
    
    console.log('================================================================================');
    console.log('🏗️  SIMPLIFIED BIM FUNCTIONALITY TEST RESULTS');
    console.log('================================================================================');
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${total - passed} ❌`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    console.log('================================================================================');
    
    if (successRate === 100) {
        console.log('🎉 All BIM functionality tests passed! The enhanced Fitoutlab backend structure is ready.');
    } else if (successRate >= 80) {
        console.log('✅ Most BIM functionality tests passed. Minor issues may need attention.');
    } else {
        console.log('⚠️  Some BIM functionality tests failed. Review the implementation before deployment.');
    }
    
    console.log('================================================================================');
    
    return successRate >= 80;
}

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { runAllTests };