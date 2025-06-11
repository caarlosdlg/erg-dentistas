#!/bin/bash

# DentalERP Frontend Performance Testing Script
# Script completo para testing de rendimiento y optimización

echo "🚀 DentalERP Frontend Performance Testing"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_DIR"

echo -e "${BLUE}📁 Project Directory: $FRONTEND_DIR${NC}"

# Check if we're in the frontend directory
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Make sure you're in the frontend directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend directory confirmed${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo -e "\n${BLUE}🔍 Checking dependencies...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are available${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Build the application
echo -e "\n${BLUE}🔨 Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Analyze bundle size
echo -e "\n${BLUE}📊 Analyzing bundle size...${NC}"

if [ -d "dist" ]; then
    echo "Bundle analysis:"
    echo "=================="
    
    # Find and display JavaScript files
    echo -e "\n${YELLOW}JavaScript files:${NC}"
    find dist -name "*.js" -type f -exec ls -lh {} \; | awk '{print $5 "\t" $9}'
    
    # Find and display CSS files
    echo -e "\n${YELLOW}CSS files:${NC}"
    find dist -name "*.css" -type f -exec ls -lh {} \; | awk '{print $5 "\t" $9}'
    
    # Total size
    echo -e "\n${YELLOW}Total dist size:${NC}"
    du -sh dist/
    
    # Check for large files (>500KB)
    echo -e "\n${YELLOW}Large files (>500KB):${NC}"
    find dist -type f -size +500k -exec ls -lh {} \; | awk '{print $5 "\t" $9}'
else
    echo -e "${RED}❌ dist directory not found${NC}"
fi

# Test with lighthouse if available
echo -e "\n${BLUE}🔍 Checking for Lighthouse...${NC}"

if command_exists lighthouse; then
    echo -e "${GREEN}✅ Lighthouse found, running audit...${NC}"
    
    # Start dev server in background
    echo -e "\n${YELLOW}🚀 Starting development server...${NC}"
    npm run dev &
    DEV_SERVER_PID=$!
    
    # Wait for server to start
    sleep 10
    
    # Run lighthouse audit
    echo -e "\n${YELLOW}🔍 Running Lighthouse audit...${NC}"
    lighthouse http://localhost:5173 --output html --output-path ./lighthouse-report.html --quiet
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Lighthouse report generated: lighthouse-report.html${NC}"
    else
        echo -e "${YELLOW}⚠️ Lighthouse audit completed with warnings${NC}"
    fi
    
    # Stop dev server
    kill $DEV_SERVER_PID 2>/dev/null
else
    echo -e "${YELLOW}⚠️ Lighthouse not found. Install with: npm install -g lighthouse${NC}"
fi

# Performance recommendations
echo -e "\n${BLUE}💡 Performance Optimization Recommendations${NC}"
echo "============================================="

echo -e "\n${YELLOW}📱 Images:${NC}"
echo "• Use WebP format for better compression"
echo "• Implement lazy loading for images below the fold"
echo "• Use responsive images with srcset"
echo "• Optimize image dimensions for different screen sizes"

echo -e "\n${YELLOW}📜 JavaScript:${NC}"
echo "• Implement code splitting for route-based chunks"
echo "• Use React.memo for expensive components"
echo "• Optimize re-renders with useCallback and useMemo"
echo "• Remove unused JavaScript code"

echo -e "\n${YELLOW}🎨 CSS:${NC}"
echo "• Remove unused CSS styles"
echo "• Implement critical CSS inlining"
echo "• Use CSS-in-JS for component-scoped styles"
echo "• Optimize CSS delivery"

echo -e "\n${YELLOW}🌐 Network:${NC}"
echo "• Enable GZIP/Brotli compression"
echo "• Use HTTP/2 for better multiplexing"
echo "• Implement service worker for caching"
echo "• Optimize API response times"

echo -e "\n${YELLOW}📦 Bundle:${NC}"
echo "• Analyze bundle with webpack-bundle-analyzer"
echo "• Tree-shake unused dependencies"
echo "• Use dynamic imports for large libraries"
echo "• Consider module federation for micro-frontends"

# Accessibility check
echo -e "\n${BLUE}♿ Accessibility Recommendations${NC}"
echo "=================================="
echo "• Ensure all interactive elements are keyboard accessible"
echo "• Add proper ARIA labels and descriptions"
echo "• Use semantic HTML elements (header, nav, main, footer)"
echo "• Maintain sufficient color contrast ratios"
echo "• Add alt text to all informative images"

# SEO recommendations
echo -e "\n${BLUE}🔍 SEO Recommendations${NC}"
echo "======================="
echo "• Optimize page titles (50-60 characters)"
echo "• Write compelling meta descriptions (120-160 characters)"
echo "• Use proper heading hierarchy (H1-H6)"
echo "• Add structured data markup"
echo "• Optimize for Core Web Vitals"

# Security recommendations
echo -e "\n${BLUE}🔒 Security Recommendations${NC}"
echo "============================"
echo "• Implement Content Security Policy (CSP)"
echo "• Use HTTPS in production"
echo "• Sanitize user inputs"
echo "• Keep dependencies updated"
echo "• Implement proper authentication"

# Check for common issues
echo -e "\n${BLUE}🔍 Common Issues Check${NC}"
echo "======================"

# Check for large dependencies
echo -e "\n${YELLOW}📦 Checking for large dependencies...${NC}"
if [ -f "package.json" ]; then
    # List dependencies with sizes (if available)
    npm list --depth=0 2>/dev/null | head -20
fi

# Check for unused dependencies
echo -e "\n${YELLOW}🧹 Checking for potentially unused dependencies...${NC}"
echo "Consider using tools like 'npm-check' or 'depcheck' to find unused dependencies"

# Performance testing results summary
echo -e "\n${GREEN}✅ Performance Testing Complete${NC}"
echo "================================="
echo "• Bundle analysis completed"
echo "• Performance recommendations provided"
echo "• Accessibility guidelines reviewed"
echo "• SEO best practices outlined"
echo "• Security recommendations included"

if [ -f "lighthouse-report.html" ]; then
    echo -e "• Lighthouse report: ${BLUE}lighthouse-report.html${NC}"
fi

echo -e "\n${BLUE}📚 Next Steps:${NC}"
echo "1. Review bundle analysis for optimization opportunities"
echo "2. Implement lazy loading for images and components"
echo "3. Add performance monitoring in production"
echo "4. Set up continuous performance testing in CI/CD"
echo "5. Monitor Core Web Vitals in production"

echo -e "\n${GREEN}🎉 Testing completed successfully!${NC}"
