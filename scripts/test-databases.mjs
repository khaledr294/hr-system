#!/usr/bin/env node

// Database Testing Script for HR System
// This helps identify which Prisma database contains your actual data

import { PrismaClient } from '@prisma/client';

async function testDatabase(dbUrl, dbName) {
  console.log(`\n🔍 Testing database: ${dbName}`);
  console.log(`URL: ${dbUrl.substring(0, 50)}...`);
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    });

    // Test connection
    await prisma.$connect();
    console.log(`✅ Connection successful to ${dbName}`);

    // Check for users table and admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@hr-system.com' }
    });
    
    if (adminUser) {
      console.log(`✅ Admin user found in ${dbName}`);
      console.log(`   Name: ${adminUser.name}`);
    } else {
      console.log(`❌ No admin user found in ${dbName}`);
    }

    // Check total users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in ${dbName}: ${userCount}`);

    // Check workers
    const workerCount = await prisma.worker.count();
    console.log(`📊 Total workers in ${dbName}: ${workerCount}`);

    // Check contracts
    const contractCount = await prisma.contract.count();
    console.log(`📊 Total contracts in ${dbName}: ${contractCount}`);

    await prisma.$disconnect();
    
    return {
      name: dbName,
      connected: true,
      hasAdmin: !!adminUser,
      userCount,
      workerCount,
      contractCount,
      score: (adminUser ? 10 : 0) + userCount + workerCount + contractCount
    };

  } catch (error) {
    console.log(`❌ Error connecting to ${dbName}: ${error.message}`);
    return {
      name: dbName,
      connected: false,
      error: error.message,
      score: 0
    };
  }
}

async function main() {
  console.log('🏢 HR System Database Identification Tool');
  console.log('==========================================');
  
  console.log('\n📝 Instructions:');
  console.log('1. Get Prisma Accelerate URLs from https://cloud.prisma.io/');
  console.log('2. Replace the URLs below with your actual database URLs');
  console.log('3. Run this script to test both databases');
  
  // You need to replace these with your actual Prisma Accelerate URLs
  const databases = [
    {
      name: 'saed-hr-system',
      url: 'REPLACE_WITH_SAED_HR_SYSTEM_ACCELERATE_URL'
    },
    {
      name: 'hr-system-db', 
      url: 'REPLACE_WITH_HR_SYSTEM_DB_ACCELERATE_URL'
    }
  ];

  const results = [];
  
  for (const db of databases) {
    if (db.url.startsWith('REPLACE_WITH')) {
      console.log(`\n⚠️  Please replace the URL for ${db.name}`);
      continue;
    }
    
    const result = await testDatabase(db.url, db.name);
    results.push(result);
  }

  // Show recommendations
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('===================');
  
  if (results.length === 0) {
    console.log('❌ No databases tested. Please update the URLs in this script.');
    return;
  }

  const bestDb = results.reduce((best, current) => 
    current.score > best.score ? current : best
  );

  console.log(`\n🏆 Recommended database: ${bestDb.name}`);
  console.log(`   Score: ${bestDb.score} (higher is better)`);
  console.log(`   Has admin user: ${bestDb.hasAdmin ? 'Yes' : 'No'}`);
  console.log(`   Total data: ${bestDb.userCount + bestDb.workerCount + bestDb.contractCount} records`);

  const otherDbs = results.filter(db => db.name !== bestDb.name);
  if (otherDbs.length > 0) {
    console.log('\n🗑️  Databases you can safely delete:');
    otherDbs.forEach(db => {
      console.log(`   - ${db.name} (Score: ${db.score})`);
    });
  }

  console.log('\n📋 Next steps:');
  console.log(`1. Use ${bestDb.name} as your production database`);
  console.log(`2. Update GitHub SECRET 'DATABASE_URL' with ${bestDb.name} URL`);
  console.log('3. Delete the other database from Prisma Cloud');
  console.log('4. Redeploy your application');
}

main().catch(console.error);