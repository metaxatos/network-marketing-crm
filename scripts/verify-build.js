#!/usr/bin/env node

/**
 * Build Verification Script
 * Checks for common build issues before the actual build starts
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running build verification...');

// Check for phantom directories that might cause import issues
const phantomDirectories = ['services', 'lib/magic', 'utils/magic'];
let hasPhantomDirs = false;

phantomDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.warn(`⚠️  Warning: Found phantom directory: ${dir}`);
    hasPhantomDirs = true;
  }
});

// Check for problematic imports in TypeScript/JavaScript files
const checkForProblematicImports = (dir) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      // Skip node_modules and .next
      if (!['node_modules', '.next', '.git'].includes(file.name)) {
        checkForProblematicImports(fullPath);
      }
    } else if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for magic-sdk imports
        if (content.includes('magic-sdk')) {
          console.error(`❌ Found magic-sdk import in: ${fullPath}`);
          process.exit(1);
        }
        
        // Check for services/ imports
        if (content.includes("from 'services/") || content.includes('from "services/')) {
          console.error(`❌ Found services/ import in: ${fullPath}`);
          process.exit(1);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }
};

console.log('🔍 Checking for problematic imports...');
checkForProblematicImports('./src');

if (!hasPhantomDirs) {
  console.log('✅ No phantom directories found');
}

console.log('✅ Build verification completed successfully');
console.log('🚀 Proceeding with build...\n'); 