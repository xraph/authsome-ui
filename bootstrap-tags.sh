#!/bin/bash
set -e

echo "🏷️  One-Time Tag Bootstrap for PR #1"
echo "======================================="
echo ""
echo "PR #1 was merged but didn't create tags, blocking Release Please."
echo "This script creates those tags so automation can proceed."
echo ""

# The commit SHA where PR #1 was merged
MERGE_SHA="4eca00ae83fbb8f868d19ce5bf78d3ad39512005"

echo "📦 Creating tags at merge commit: $MERGE_SHA"
echo ""

# Create tags for all packages at the versions in the manifest
# Release Please expects tags without the @authsome/ prefix
git tag -a ui-core-v0.1.0 $MERGE_SHA -m "chore: release @authsome/ui-core 0.1.0" -f
git tag -a ui-react-v0.1.0 $MERGE_SHA -m "chore: release @authsome/ui-react 0.1.0" -f
git tag -a ui-react-headless-v0.1.0 $MERGE_SHA -m "chore: release @authsome/ui-react-headless 0.1.0" -f
git tag -a ui-react-shadcn-v0.1.1 $MERGE_SHA -m "chore: release @authsome/ui-react-shadcn 0.1.1" -f
git tag -a ui-next-v0.1.0 $MERGE_SHA -m "chore: release @authsome/ui-next 0.1.0" -f
git tag -a adapter-authsome-v0.1.0 $MERGE_SHA -m "chore: release @authsome/adapter-authsome 0.1.0" -f
git tag -a adapter-clerk-v0.1.0 $MERGE_SHA -m "chore: release @authsome/adapter-clerk 0.1.0" -f
git tag -a adapter-generic-v0.1.0 $MERGE_SHA -m "chore: release @authsome/adapter-generic 0.1.0" -f
git tag -a adapter-supabase-v0.1.0 $MERGE_SHA -m "chore: release @authsome/adapter-supabase 0.1.0" -f

echo "✅ Created 9 tags locally"
echo ""
echo "📤 Pushing tags to GitHub..."
echo ""

# Push all tags to remote
git push origin --tags

echo ""
echo "✅ Done! Tags pushed to GitHub"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Bootstrap Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Release Please will now work automatically."
echo ""
echo "Next steps:"
echo "  1. Make a feat: or fix: commit"
echo "  2. Push to main"
echo "  3. Release Please will automatically create a PR"
echo "  4. Merge the PR - tags created automatically"
echo ""
echo "Example commit:"
echo '  git commit --allow-empty -m "feat: enable automated releases"'
echo "  git push origin main"
echo ""

