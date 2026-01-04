#!/bin/bash

# Designfitout.com Enhanced Deployment Script
# Supports modular architecture and deep learning features

set -e  # Exit on any error

echo "🚀 Starting Designfitout.com Enhanced Deployment..."

# Configuration
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
BUILD_VERSION="2.1.0"
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "📋 Deployment Configuration:"
echo "  Environment: $DEPLOYMENT_ENV"
echo "  Version: $BUILD_VERSION"
echo "  Build Date: $BUILD_DATE"

# Create build directory
echo "🏗️ Preparing build directory..."
mkdir -p build
mkdir -p build/public
mkdir -p build/modules
mkdir -p build/functions

# Copy core files
echo "📂 Copying core application files..."
cp -r public/* build/public/
cp -r functions/* build/functions/
cp -r modules/* build/modules/

# Copy configuration files
cp config.template.json build/
cp firebase.json build/
cp package.json build/ 2>/dev/null || echo "No package.json found, skipping..."

# Process module configuration
echo "🔧 Processing module configuration..."
if [ -f "modules/module-config.json" ]; then
    # Update build information in module config
    sed "s/BUILD_TIMESTAMP/$BUILD_DATE/g" modules/module-config.json > build/modules/module-config.json
    sed -i "s/DEPLOYMENT_ENVIRONMENT/$DEPLOYMENT_ENV/g" build/modules/module-config.json
    echo "  ✅ Module configuration updated"
else
    echo "  ⚠️ Module configuration not found, using defaults"
fi

# Validate module structure
echo "🧪 Validating module structure..."
node_modules_check() {
    if command -v node >/dev/null 2>&1; then
        echo "  📦 Node.js available - running module validation..."
        
        # Create temporary validation script
        cat > validate_modules.js << 'EOF'
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating module structure...');

const moduleDir = './build/modules';
const requiredModules = ['core', 'ai', 'ui', 'analytics'];
const criticalFiles = [
    'core/module-loader.js',
    'ai/deep-learning-narrative.js',
    'ui/visual-effects.js',
    'module-bootstrap.js',
    'module-config.json'
];

let validationPassed = true;

// Check required directories
requiredModules.forEach(module => {
    const modulePath = path.join(moduleDir, module);
    if (!fs.existsSync(modulePath)) {
        console.error(`❌ Missing required module directory: ${module}`);
        validationPassed = false;
    } else {
        console.log(`✅ Module directory found: ${module}`);
    }
});

// Check critical files
criticalFiles.forEach(file => {
    const filePath = path.join(moduleDir, file);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Missing critical file: ${file}`);
        validationPassed = false;
    } else {
        const stats = fs.statSync(filePath);
        console.log(`✅ Critical file found: ${file} (${stats.size} bytes)`);
    }
});

if (validationPassed) {
    console.log('🎉 Module structure validation passed!');
    process.exit(0);
} else {
    console.error('💥 Module structure validation failed!');
    process.exit(1);
}
EOF

        node validate_modules.js
        rm validate_modules.js
    else
        echo "  ⚠️ Node.js not available, skipping module validation"
    fi
}

node_modules_check

# Run brand neutrality test
echo "🧪 Running brand neutrality tests..."
if [ -f "test-brand-neutrality.js" ]; then
    if command -v node >/dev/null 2>&1; then
        node test-brand-neutrality.js
        echo "  ✅ Brand neutrality tests passed"
    else
        echo "  ⚠️ Node.js not available, skipping tests"
    fi
else
    echo "  ⚠️ Brand neutrality test file not found"
fi

# Optimize files for production
echo "🚀 Optimizing for production..."

# Minify JavaScript files (simple approach)
if command -v sed >/dev/null 2>&1; then
    echo "  🗜️ Removing comments and debugging code..."
    
    find build/ -name "*.js" -exec sed -i '/console\.log/d; /\/\*.*\*\//d; /^\s*\/\//d' {} \;
    echo "  ✅ JavaScript optimization completed"
fi

# Generate deployment manifest
echo "📄 Generating deployment manifest..."
cat > build/deployment-manifest.json << EOF
{
  "deployment": {
    "version": "$BUILD_VERSION",
    "buildDate": "$BUILD_DATE",
    "environment": "$DEPLOYMENT_ENV",
    "features": {
      "modularArchitecture": true,
      "deepLearningNarrative": true,
      "enhancedVisualEffects": true,
      "strategicAnalysis": true,
      "adaptiveUI": true
    }
  },
  "modules": {
    "core": ["module-loader"],
    "ai": ["deep-learning-narrative"],
    "ui": ["visual-effects"],
    "analytics": ["strategic-analysis"]
  },
  "assets": {
    "html": ["public/index.html", "public/ind2x.html"],
    "css": ["public/styles.css"],
    "javascript": [
      "modules/module-bootstrap.js",
      "modules/core/module-loader.js",
      "modules/ai/deep-learning-narrative.js",
      "modules/ui/visual-effects.js",
      "public/strategic-analysis.js"
    ],
    "configuration": [
      "modules/module-config.json",
      "config.template.json",
      "firebase.json"
    ]
  },
  "deployment_commands": [
    "Upload build/ directory to cloud hosting",
    "Configure serverless functions from build/functions/",
    "Update CDN cache",
    "Verify module loading",
    "Test AI narrative system",
    "Validate performance metrics"
  ]
}
EOF

echo "  ✅ Deployment manifest generated"

# Generate environment-specific instructions
echo "📋 Generating deployment instructions..."
cat > build/DEPLOY_INSTRUCTIONS.md << EOF
# Deployment Instructions - Designfitout.com Enhanced

## Version: $BUILD_VERSION
## Build Date: $BUILD_DATE
## Environment: $DEPLOYMENT_ENV

## 🚀 Quick Deploy Commands

### 1. Upload Files
\`\`\`bash
# Upload the entire build/ directory to your cloud hosting
rsync -av build/ your-hosting-destination/
\`\`\`

### 2. Configure Functions
\`\`\`bash
# Deploy serverless functions
cd build/functions
# Follow your cloud provider's function deployment process
\`\`\`

### 3. Update Configuration
1. Copy \`config.template.json\` to \`config.json\`
2. Update with your specific cloud provider settings
3. Ensure all environment variables are set

### 4. Verify Modules
- Check that \`modules/module-config.json\` loads correctly
- Verify AI narrative system initializes
- Test visual effects and animations
- Confirm strategic analysis module loads

## 🔧 Post-Deployment Checklist

- [ ] All HTML pages load correctly
- [ ] Module system initializes without errors
- [ ] Deep learning narrative system is active
- [ ] Visual effects render properly
- [ ] Strategic analysis displays metrics
- [ ] Mobile responsiveness works
- [ ] All animations are smooth
- [ ] CDN cache is updated

## 🧪 Testing Commands

\`\`\`bash
# Test module loading
curl https://your-domain.com/modules/module-config.json

# Verify main pages
curl https://your-domain.com/
curl https://your-domain.com/ind2x.html

# Check console for module initialization
# Look for: "🎉 All modules ready - modulesReady event dispatched"
\`\`\`

## 🐛 Troubleshooting

### Module Loading Issues
- Check network tab for failed module loads
- Verify module-config.json is accessible
- Check console for JavaScript errors

### AI Narrative Not Working
- Verify deep-learning-narrative.js loads
- Check for "Deep learning narrative system activated" in console
- Ensure sufficient user interaction for learning

### Visual Effects Issues  
- Check for WebGL/canvas support
- Verify visual-effects.js initializes
- Test on different devices/browsers

## 📊 Performance Monitoring
- Monitor Core Web Vitals
- Check module loading times
- Verify AI system performance impact
- Monitor user engagement metrics
EOF

echo "  ✅ Deployment instructions generated"

# Create deployment summary
echo "📊 Creating deployment summary..."
TOTAL_FILES=$(find build/ -type f | wc -l)
TOTAL_SIZE=$(du -sh build/ | cut -f1)

echo "
🎉 Deployment Preparation Complete!

📊 Build Summary:
  - Total Files: $TOTAL_FILES
  - Total Size: $TOTAL_SIZE
  - Modules: 4 (Core, AI, UI, Analytics)
  - Features: Deep Learning Narrative, Enhanced Visuals
  - Version: $BUILD_VERSION
  - Environment: $DEPLOYMENT_ENV

📁 Build Contents:
  - build/public/          (Frontend assets)
  - build/modules/         (Modular architecture)
  - build/functions/       (Serverless functions)
  - build/*.json           (Configuration files)

🚀 Next Steps:
  1. Review build/DEPLOY_INSTRUCTIONS.md
  2. Upload build/ directory to your hosting
  3. Configure your cloud provider settings
  4. Test all functionality
  5. Monitor performance and user engagement

💡 New Features Ready:
  ✅ Modular Architecture
  ✅ Deep Learning Narrative System
  ✅ Enhanced Visual Effects
  ✅ Adaptive User Interactions
  ✅ Strategic Analysis Integration
"

echo "🎯 Deployment package ready in ./build/ directory"
echo "📖 See build/DEPLOY_INSTRUCTIONS.md for detailed deployment steps"