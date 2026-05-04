#!/bin/bash

# ============================================
# 🌾 AgriPal Production Build Debug Script
# ============================================

echo "🔍 Starting production build check..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf build
echo ""

# Step 2: Run production build
echo "🏗️  Running production build..."
echo ""
npm run build 2>&1 | tee build-log.txt

# Step 3: Check if build succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ BUILD SUCCESSFUL!${NC}"
    echo ""
    echo "📦 Build size:"
    du -sh build/
    echo ""
    
    # Step 4: Check for common issues
    echo "🔍 Checking for common issues..."
    echo ""
    
    # Check for large bundle size
    BUILD_SIZE=$(du -k build/static/js | awk '{sum+=$1} END {print sum}')
    if [ $BUILD_SIZE -gt 5000 ]; then
        echo -e "${YELLOW}⚠️  WARNING: Bundle size is large (${BUILD_SIZE}KB)${NC}"
        echo "   Consider code-splitting or lazy loading"
        echo ""
    fi
    
    # Check for console.log statements
    LOG_COUNT=$(grep -r "console.log" src/ --include="*.js" --include="*.jsx" | wc -l)
    if [ $LOG_COUNT -gt 0 ]; then
        echo -e "${YELLOW}⚠️  FOUND ${LOG_COUNT} console.log statements in src/${NC}"
        echo "   Consider removing before production:"
        grep -r "console.log" src/ --include="*.js" --include="*.jsx" | head -5
        echo ""
    fi
    
    # Check for TODO comments
    TODO_COUNT=$(grep -r "TODO" src/ --include="*.js" --include="*.jsx" | wc -l)
    if [ $TODO_COUNT -gt 0 ]; then
        echo -e "${YELLOW}⚠️  FOUND ${TODO_COUNT} TODO comments in src/${NC}"
        echo ""
    fi
    
    echo -e "${GREEN}🎉 Ready to deploy!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. git add ."
    echo "2. git commit -m 'feat: production ready'"
    echo "3. git push origin main"
    echo ""
    
else
    echo ""
    echo -e "${RED}❌ BUILD FAILED!${NC}"
    echo ""
    echo "🔍 Error details saved to: build-log.txt"
    echo ""
    echo "Common fixes:"
    echo "1. Check for unterminated strings (multi-line text)"
    echo "2. Check for missing imports"
    echo "3. Check for undefined variables"
    echo "4. Check for syntax errors in JSX"
    echo ""
    echo "View full error log:"
    echo "cat build-log.txt"
    echo ""
    exit 1
fi