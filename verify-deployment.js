#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Run this before deploying to production to catch common issues
 */

const fs = require('fs');
const path = require('path');

const errors = [];
const warnings = [];
const success = [];

console.log('🔍 Running Pre-Deployment Verification...\n');

// Check 1: Verify required files exist
console.log('📂 Checking required files...');
const requiredFiles = [
  'apps/api/package.json',
  'apps/api/src/main.ts',
  'apps/api/prisma/schema.prisma',
  'apps/api/.env.example',
  'apps/web/package.json',
  'apps/web/next.config.ts',
  'apps/web/.env.example',
  'vercel.json',
  'railway.json',
  'render.yaml',
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    success.push(`✅ Found: ${file}`);
  } else {
    errors.push(`❌ Missing: ${file}`);
  }
});

// Check 2: Verify package.json scripts
console.log('\n📜 Checking build scripts...');
try {
  const apiPkg = JSON.parse(fs.readFileSync('apps/api/package.json', 'utf8'));
  const webPkg = JSON.parse(fs.readFileSync('apps/web/package.json', 'utf8'));

  if (apiPkg.scripts.build && apiPkg.scripts['start:prod']) {
    success.push('✅ API build scripts configured');
  } else {
    errors.push('❌ API missing build or start:prod script');
  }

  if (webPkg.scripts.build && webPkg.scripts.start) {
    success.push('✅ Web build scripts configured');
  } else {
    errors.push('❌ Web missing build or start script');
  }

  if (apiPkg.scripts.postinstall && apiPkg.scripts.postinstall.includes('prisma generate')) {
    success.push('✅ Prisma postinstall hook configured');
  } else {
    warnings.push('⚠️  Missing Prisma postinstall hook (may cause deployment issues)');
  }
} catch (error) {
  errors.push(`❌ Error reading package.json files: ${error.message}`);
}

// Check 3: Verify environment variable examples
console.log('\n🔐 Checking environment variables...');
try {
  const apiEnvExample = fs.readFileSync('apps/api/.env.example', 'utf8');
  const webEnvExample = fs.readFileSync('apps/web/.env.example', 'utf8');

  const requiredApiVars = ['DATABASE_URL', 'JWT_SECRET', 'CLIENT_ORIGIN', 'PORT'];
  const requiredWebVars = ['NEXT_PUBLIC_API_URL'];

  requiredApiVars.forEach(varName => {
    if (apiEnvExample.includes(varName)) {
      success.push(`✅ API .env.example has ${varName}`);
    } else {
      errors.push(`❌ API .env.example missing ${varName}`);
    }
  });

  requiredWebVars.forEach(varName => {
    if (webEnvExample.includes(varName)) {
      success.push(`✅ Web .env.example has ${varName}`);
    } else {
      errors.push(`❌ Web .env.example missing ${varName}`);
    }
  });
} catch (error) {
  errors.push(`❌ Error checking .env.example files: ${error.message}`);
}

// Check 4: Verify no Turbopack in build
console.log('\n⚡ Checking for problematic configurations...');
try {
  const webPkg = JSON.parse(fs.readFileSync('apps/web/package.json', 'utf8'));
  
  if (webPkg.scripts.build && webPkg.scripts.build.includes('--turbopack')) {
    errors.push('❌ Remove --turbopack from build script (causes Vercel deployment failures)');
  } else {
    success.push('✅ No turbopack in build script');
  }
} catch (error) {
  warnings.push(`⚠️  Could not verify turbopack: ${error.message}`);
}

// Check 5: Verify Next.js config
console.log('\n⚙️  Checking Next.js configuration...');
try {
  const nextConfig = fs.readFileSync('apps/web/next.config.ts', 'utf8');
  
  if (nextConfig.includes("output: 'standalone'") || nextConfig.includes('output: "standalone"')) {
    success.push('✅ Next.js configured with standalone output');
  } else {
    warnings.push('⚠️  Consider adding output: "standalone" to next.config.ts for optimized builds');
  }

  if (nextConfig.includes('reactStrictMode')) {
    success.push('✅ React strict mode enabled');
  }
} catch (error) {
  warnings.push(`⚠️  Could not verify Next.js config: ${error.message}`);
}

// Check 6: Verify main.ts has CORS and validation
console.log('\n🌐 Checking API configuration...');
try {
  const mainTs = fs.readFileSync('apps/api/src/main.ts', 'utf8');
  
  if (mainTs.includes('enableCors')) {
    success.push('✅ CORS enabled in main.ts');
  } else {
    errors.push('❌ CORS not enabled in main.ts');
  }

  if (mainTs.includes('ValidationPipe')) {
    success.push('✅ Global validation pipe configured');
  } else {
    warnings.push('⚠️  No global validation pipe found');
  }

  if (mainTs.includes('0.0.0.0')) {
    success.push('✅ API listens on 0.0.0.0 (required for containers)');
  } else {
    warnings.push('⚠️  API should listen on 0.0.0.0 for containerized deployments');
  }

  if (mainTs.includes('/api/health') || fs.existsSync('apps/api/src/app.controller.ts')) {
    const appController = fs.readFileSync('apps/api/src/app.controller.ts', 'utf8');
    if (appController.includes('health')) {
      success.push('✅ Health check endpoint configured');
    } else {
      warnings.push('⚠️  Consider adding a /health endpoint for monitoring');
    }
  }
} catch (error) {
  errors.push(`❌ Error checking main.ts: ${error.message}`);
}

// Check 7: Verify deployment configs
console.log('\n🚀 Checking deployment configurations...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  if (vercelConfig.buildCommand || vercelConfig.outputDirectory) {
    success.push('✅ Vercel configuration present');
  }

  const railwayConfig = JSON.parse(fs.readFileSync('railway.json', 'utf8'));
  if (railwayConfig.build || railwayConfig.deploy) {
    success.push('✅ Railway configuration present');
  }
} catch (error) {
  warnings.push(`⚠️  Could not verify deployment configs: ${error.message}`);
}

// Print results
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION RESULTS\n');

if (success.length > 0) {
  console.log('✅ PASSED CHECKS:');
  success.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS (MUST FIX BEFORE DEPLOYMENT):');
  errors.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

console.log('='.repeat(60));

if (errors.length === 0) {
  console.log('\n✅ All critical checks passed! Ready for deployment.');
  console.log('\n📖 Next steps:');
  console.log('   1. Review warnings if any');
  console.log('   2. Set environment variables in deployment platform');
  console.log('   3. Deploy backend to Railway/Render');
  console.log('   4. Deploy frontend to Vercel');
  console.log('   5. Test the deployment');
  console.log('\n📚 See COMPLETE_DEPLOYMENT_GUIDE.md for detailed instructions');
  process.exit(0);
} else {
  console.log('\n❌ Found critical issues. Please fix before deploying.');
  console.log('   See errors above for details.');
  process.exit(1);
}
