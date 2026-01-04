#!/usr/bin/env bash
#
# create_cbpr_pr.sh - Helper script to create CBPR PR and trigger workflow
#
# This script helps create the PR and trigger the CBPR workflow
# Run this after reviewing the changes on the copilot/featemerald-pdf-cover branch

set -euo pipefail

REPO="support-designfitout/Designfitout-Github"
HEAD_BRANCH="copilot/featemerald-pdf-cover"
BASE_BRANCH="main"
PR_TITLE="CBPR: emerald-bar PDF cover & stitched board-ready PDF"

echo "🚀 CBPR PR Creation Helper"
echo "==========================="
echo ""

# Check if gh CLI is available and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI. Please run:"
    echo "   gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Create the PR
echo "📝 Creating pull request..."
echo "   Repository: $REPO"
echo "   From: $HEAD_BRANCH"
echo "   To: $BASE_BRANCH"
echo ""

PR_URL=$(gh pr create \
  --repo "$REPO" \
  --base "$BASE_BRANCH" \
  --head "$HEAD_BRANCH" \
  --title "$PR_TITLE" \
  --body "$(cat <<'EOF'
## CBPR Emerald-Bar PDF Feature

This PR adds infrastructure for generating CBPR (Comprehensive Business Process Review) quarterly readiness reports with professional emerald-bar styled PDF covers and board-ready stitched PDFs.

### Files Added/Updated:
- ✅ **Added**: `templates/emerald_bar/cover.html` - HTML template for emerald-bar PDF cover page
- ✅ **Added**: `.github/scripts/make_cbpr_pdf.sh` - Shell script to generate PDF with cover, checksum, and stitching (executable)
- ✅ **Added**: `.github/workflows/cbpr-quarterly.yml` - GitHub Actions workflow with poppler-utils installation
- ✅ **Added**: `Makefile` - Build targets for `cbpr:pdf` and `cbpr:report`
- ✅ **Updated**: `.gitignore` - Added reports/ directory

### Local Usage Instructions:
```bash
# Generate CBPR readiness report
make cbpr:report

# Generate CBPR PDF with emerald-bar cover
make cbpr:pdf
```

### Dependencies:
The workflow automatically installs:
- `poppler-utils` (for pdfunite PDF stitching)
- `wkhtmltopdf` (for HTML to PDF conversion)
- `xvfb` (for headless wkhtmltopdf execution)

### Testing:
The workflow can be triggered:
- Manually via the Actions tab after merge
- Automatically quarterly on the first day of Jan, Apr, Jul, and Oct

See `CBPR_IMPLEMENTATION_SUMMARY.md` for complete implementation details.
EOF
)" 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Pull request created successfully!"
    echo "   URL: $PR_URL"
    echo ""
    
    echo "📋 Next steps:"
    echo "   1. Review the PR: $PR_URL"
    echo "   2. Merge the PR to main"
    echo "   3. After merge, run this script with 'trigger' argument to start the workflow"
    echo ""
    echo "Usage: $0 trigger"
else
    echo "❌ Failed to create pull request"
    echo "$PR_URL"
    exit 1
fi
