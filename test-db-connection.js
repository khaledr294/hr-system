// Test Prisma Accelerate connection
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing Prisma Accelerate connection...');
    
    // Simple query to test connection
    const userCount = await prisma.user.count();
    console.log(`✅ Connected successfully! Found ${userCount} users in the database.`);
    
    // Test a simple user query
    const users = await prisma.user.findMany({
      take: 2,
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    console.log('Sample users:', users);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();