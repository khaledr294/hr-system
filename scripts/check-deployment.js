#!/usr/bin/env node

import fs from 'fs';

console.log('🔍 Checking deployment readiness...\n');

const checks = [
  {
    name: 'Environment Variables',
    check: () => {
      const envExists = fs.existsSync('.env.production');
      const envExample = fs.existsSync('.env.production.example');
      return { 
        passed: envExists || envExample, 
        message: envExists ? 'Production env file exists' : 'Use .env.production.example as template'
      };
    }
  },
  {
    name: 'Database Configuration',
    check: () => {
      const schemaExists = fs.existsSync('prisma/schema.prisma');
      return { 
        passed: schemaExists, 
        message: schemaExists ? 'Prisma schema found' : 'Prisma schema missing'
      };
    }
  },
  {
    name: 'Build Configuration',
    check: () => {
      const nextConfigExists = fs.existsSync('next.config.ts') || fs.existsSync('next.config.js');
      return { 
        passed: nextConfigExists, 
        message: nextConfigExists ? 'Next.js config found' : 'Next.js config missing'
      };
    }
  },
  {
    name: 'Security Headers',
    check: () => {
      const configContent = fs.readFileSync('next.config.ts', 'utf8');
      const hasHeaders = configContent.includes('headers()');
      return { 
        passed: hasHeaders, 
        message: hasHeaders ? 'Security headers configured' : 'Consider adding security headers'
      };
    }
  },
  {
    name: 'Dependencies',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const hasPostinstall = packageJson.scripts && packageJson.scripts.postinstall;
      return { 
        passed: hasPostinstall, 
        message: hasPostinstall ? 'Postinstall script configured' : 'Consider adding postinstall script for Prisma'
      };
    }
  }
];

let allPassed = true;

checks.forEach((check) => {
  try {
    const result = check.check();
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${check.name}: ${result.message}`);
    if (!result.passed) allPassed = false;
  } catch (error) {
    console.log(`❌ ${check.name}: Error - ${error.message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🚀 Your application is ready for deployment!');
  console.log('\nRecommended deployment platforms:');
  console.log('1. Vercel (Best for Next.js)');
  console.log('2. Railway (Great for databases)');
  console.log('3. Netlify (Simple deployment)');
} else {
  console.log('⚠️  Please address the issues above before deploying.');
}

console.log('\n📚 Check DEPLOYMENT_GUIDE.md for detailed instructions.');
console.log('🔐 Remember to set up your environment variables on the deployment platform.');