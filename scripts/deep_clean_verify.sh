#!/bin/bash

# Deep Clean Verification Script
# Performs thorough check for Vercel artifacts, legacy environment variables, and project structure

set -e  # Exit on any error

echo "🔍 Deep Clean Verification Script for Cloudflare Migration"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Function to print status
print_status() {
    local status=$1
    local message=$2
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo ""
echo "🔧 1. VERCEL ARTIFACTS CHECK"
echo "----------------------------"

# Check for Vercel-specific files
VERCEL_FILES=(
    ".vercel"
    "vercel.json" 
    ".vercel.json"
    "api/vercel.json"
    "functions/vercel.json"
)

for file in "${VERCEL_FILES[@]}"; do
    if [ -e "$file" ]; then
        print_status "FAIL" "Found Vercel artifact: $file"
    else
        print_status "PASS" "No Vercel artifact: $file"
    fi
done

# Check for Vercel references in package.json
if [ -f "package.json" ]; then
    if grep -q "vercel" package.json; then
        print_status "FAIL" "Found Vercel references in package.json"
        echo "   Found: $(grep "vercel" package.json)"
    else
        print_status "PASS" "No Vercel references in package.json"
    fi
else
    print_status "WARN" "package.json not found"
fi

echo ""
echo "🌍 2. LEGACY ENVIRONMENT VARIABLES CHECK"
echo "----------------------------------------"

# Check for legacy environment variable references
LEGACY_ENV_PATTERNS=(
    "VERCEL_"
    "NOW_"
    "NEXT_PUBLIC_VERCEL"
    "FIREBASE_"
    "GOOGLE_CLOUD_"
    "GA4_"
    "GSC_"
)

ENV_FILES=(
    ".env"
    ".env.local"
    ".env.production" 
    ".env.development"
    ".env.example"
    "config.json"
)

for env_file in "${ENV_FILES[@]}"; do
    if [ -f "$env_file" ]; then
        for pattern in "${LEGACY_ENV_PATTERNS[@]}"; do
            if grep -q "$pattern" "$env_file" 2>/dev/null; then
                print_status "FAIL" "Found legacy environment variable pattern '$pattern' in $env_file"
            else
                print_status "PASS" "No legacy pattern '$pattern' in $env_file"
            fi
        done
    fi
done

echo ""
echo "📁 3. PROJECT STRUCTURE VALIDATION"
echo "-----------------------------------"

# Check required files
REQUIRED_FILES=(
    "README.md"
    "package.json"
    "config.template.json"
    "test-brand-neutrality.js"
    "test-mrketoz-crm.js"
    "public/index.html"
    "public/ind2x.html"
    "functions/index.js"
    "functions/mrketoz-crm-chat.js"
    "playwright.config.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "PASS" "Required file exists: $file"
    else
        print_status "FAIL" "Missing required file: $file"
    fi
done

# Check required directories
REQUIRED_DIRS=(
    "public"
    "functions"
    "tests"
    ".github/workflows"
    "docs"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_status "PASS" "Required directory exists: $dir"
    else
        print_status "FAIL" "Missing required directory: $dir"
    fi
done

# Check that config.json is NOT committed
if [ -f "config.json" ]; then
    print_status "FAIL" "config.json should not be committed (use config.template.json)"
else
    print_status "PASS" "config.json not committed (correct)"
fi

echo ""
echo "🚫 4. BANNED TERMS CHECK"
echo "------------------------"

# Check for banned cloud-specific terms
BANNED_TERMS=(
    "firebase"
    "cloudflare"
    "ga4"
    "gsc"
    "vercel"
)

FILES_TO_CHECK=(
    "README.md"
    "public/index.html"
    "public/ind2x.html"
    "deploy"
    "roots"
)

for term in "${BANNED_TERMS[@]}"; do
    found_in_files=()
    
    for file in "${FILES_TO_CHECK[@]}"; do
        if [ -f "$file" ] && grep -qi "$term" "$file" 2>/dev/null; then
            found_in_files+=("$file")
        fi
    done
    
    if [ ${#found_in_files[@]} -gt 0 ]; then
        print_status "FAIL" "Found banned term '$term' in: ${found_in_files[*]}"
    else
        print_status "PASS" "No banned term '$term' found in main files"
    fi
done

echo ""
echo "🧪 5. TEST INFRASTRUCTURE VALIDATION"
echo "-------------------------------------"

# Run existing test suites
if [ -f "test-brand-neutrality.js" ]; then
    if node test-brand-neutrality.js >/dev/null 2>&1; then
        print_status "PASS" "Brand neutrality tests pass"
    else
        print_status "FAIL" "Brand neutrality tests fail"
    fi
else
    print_status "FAIL" "Brand neutrality test script missing"
fi

if [ -f "test-mrketoz-crm.js" ]; then
    if node test-mrketoz-crm.js >/dev/null 2>&1; then
        print_status "PASS" "MrketOz CRM tests pass"
    else
        print_status "FAIL" "MrketOz CRM tests fail"
    fi
else
    print_status "FAIL" "MrketOz CRM test script missing"
fi

# Check Playwright configuration
if [ -f "playwright.config.ts" ]; then
    print_status "PASS" "Playwright configuration exists"
else
    print_status "FAIL" "Playwright configuration missing"
fi

# Check if new smoke tests exist
if [ -f "tests/health.spec.ts" ]; then
    print_status "PASS" "Health smoke tests exist"
else
    print_status "FAIL" "Health smoke tests missing"
fi

if [ -f "tests/redirects.spec.ts" ]; then
    print_status "PASS" "Redirect smoke tests exist" 
else
    print_status "FAIL" "Redirect smoke tests missing"
fi

echo ""
echo "⚙️  6. CI/CD VALIDATION"
echo "-----------------------"

# Check GitHub Actions workflows
if [ -f ".github/workflows/smoke-e2e.yml" ]; then
    print_status "PASS" "Smoke E2E workflow exists"
else
    print_status "FAIL" "Smoke E2E workflow missing"
fi

# Check other important workflows
WORKFLOW_FILES=(
    ".github/workflows/ci.yml"
    ".github/workflows/playwright.yml"
)

for workflow in "${WORKFLOW_FILES[@]}"; do
    if [ -f "$workflow" ]; then
        print_status "PASS" "Workflow exists: $workflow"
    else
        print_status "WARN" "Workflow missing: $workflow"
    fi
done

echo ""
echo "📚 7. DOCUMENTATION VALIDATION"
echo "-------------------------------"

# Check documentation files
DOC_FILES=(
    "docs/DEPLOYMENT_RUNBOOK.md"
    "CLOUD_PROVIDERS.md"
    "MRKETOZ_CRM_DOCS.md"
    "PLAYWRIGHT_SETUP.md"
)

for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        print_status "PASS" "Documentation exists: $doc"
    else
        print_status "FAIL" "Documentation missing: $doc"
    fi
done

echo ""
echo "🔐 8. SECURITY VALIDATION"
echo "-------------------------"

# Check for exposed secrets or credentials
SECRET_PATTERNS=(
    "api_key"
    "secret_key" 
    "password"
    "token"
    "credentials"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
    if find . -name "*.js" -o -name "*.json" -o -name "*.md" | xargs grep -i "$pattern" | grep -v "test\|example\|template\|docs" >/dev/null 2>&1; then
        print_status "WARN" "Found potential secret pattern '$pattern' - review manually"
    else
        print_status "PASS" "No exposed secrets for pattern '$pattern'"
    fi
done

# Check .gitignore exists and includes sensitive files
if [ -f ".gitignore" ]; then
    if grep -q "config.json" .gitignore && grep -q ".env" .gitignore; then
        print_status "PASS" ".gitignore properly configured"
    else
        print_status "WARN" ".gitignore may be missing sensitive file patterns"
    fi
else
    print_status "FAIL" ".gitignore missing"
fi

echo ""
echo "📋 FINAL SUMMARY"
echo "=================="
echo "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

# Exit with appropriate code
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical checks passed! Repository is ready for Cloudflare deployment.${NC}"
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}Note: $WARNINGS warnings were found. Please review them before deployment.${NC}"
    fi
    
    exit 0
else
    echo -e "${RED}❌ $FAILED_CHECKS critical checks failed. Please fix these issues before deployment.${NC}"
    exit 1
fi