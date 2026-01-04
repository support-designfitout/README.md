#!/bin/bash
# Script to update PR #49 description with the comprehensive documentation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PR_NUMBER=49
DESCRIPTION_FILE="$REPO_ROOT/docs/pull-requests/PR-49-KV-Ops-Snapshot-Description.md"

echo "🔄 Updating PR #$PR_NUMBER description..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "📦 Install it from: https://cli.github.com/"
    echo ""
    echo "📋 Manual update instructions:"
    echo "1. View the description file:"
    echo "   cat $DESCRIPTION_FILE"
    echo "2. Copy the content"
    echo "3. Navigate to: https://github.com/support-designfitout/Designfitout-Github/pull/$PR_NUMBER"
    echo "4. Click 'Edit' and paste the content"
    exit 1
fi

# Check if description file exists
if [ ! -f "$DESCRIPTION_FILE" ]; then
    echo "❌ Description file not found: $DESCRIPTION_FILE"
    exit 1
fi

# Update the PR description
echo "📝 Reading description from: $DESCRIPTION_FILE"
gh pr edit "$PR_NUMBER" --body-file "$DESCRIPTION_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Successfully updated PR #$PR_NUMBER description"
    echo "🔗 View PR: https://github.com/support-designfitout/Designfitout-Github/pull/$PR_NUMBER"
else
    echo "❌ Failed to update PR description"
    echo ""
    echo "📋 Manual update instructions:"
    echo "1. View the description file:"
    echo "   cat $DESCRIPTION_FILE"
    echo "2. Copy the content"
    echo "3. Navigate to: https://github.com/support-designfitout/Designfitout-Github/pull/$PR_NUMBER"
    echo "4. Click 'Edit' and paste the content"
    exit 1
fi
