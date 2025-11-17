#!/bin/bash
set -e

echo "🚀 Bootstrapping Release Please Tags"
echo "======================================"

# Get the merge commit SHA from PR #1
MERGE_SHA="4eca00ae83fbb8f868d19ce5bf78d3ad39512005"

echo "📦 Creating tags at commit: $MERGE_SHA"

# Create tags for all packages
git tag -f @authsome/ui-core-v0.1.0 $MERGE_SHA
git tag -f @authsome/ui-react-v0.1.0 $MERGE_SHA
git tag -f @authsome/ui-react-headless-v0.1.0 $MERGE_SHA
git tag -f @authsome/ui-react-shadcn-v0.1.1 $MERGE_SHA
git tag -f @authsome/adapter-authsome-v0.1.0 $MERGE_SHA
git tag -f @authsome/adapter-clerk-v0.1.0 $MERGE_SHA
git tag -f @authsome/adapter-generic-v0.1.0 $MERGE_SHA
git tag -f @authsome/adapter-supabase-v0.1.0 $MERGE_SHA

echo "✅ Tags created locally"
echo ""
echo "📤 Pushing tags to origin..."

# Push tags to remote
git push origin --tags --force

echo "✅ Tags pushed to GitHub"
echo ""
echo "🎉 Bootstrap complete!"
echo ""
echo "Next steps:"
echo "  1. Make a feat: or fix: commit to trigger a release"
echo "  2. Release Please will create a new PR with version bumps"
echo ""
echo "Example:"
echo '  git commit --allow-empty -m "feat(core): initial stable release"'
echo "  git push origin main"

