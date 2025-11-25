import { PrismaClient } from '@prisma/client';
import { createDatabaseBackup, restoreBackup } from '../src/lib/backup';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function testBackupUpdate() {
  console.log('🧪 Starting Backup System Verification...');

  try {
    // 1. Create Dummy Data
    console.log('📝 Creating dummy data...');
    
    // System Settings
    await prisma.systemSettings.upsert({
      where: { id: 'system' },
      update: { companyName: 'Test Company Backup' },
      create: { id: 'system', companyName: 'Test Company Backup' }
    });

    // Job Title
    const jobTitle = await prisma.jobTitle.create({
      data: {
        name: `Test Role ${uuidv4()}`,
        nameAr: 'تجربة',
        permissions: ['VIEW_USERS']
      }
    });

    // Marketer
    const marketer = await prisma.marketer.create({
      data: {
        name: 'Test Marketer',
        phone: '123456',
        email: 'marketer@test.com'
      }
    });

    // Archive Data
    await prisma.archivedWorker.create({
      data: {
        id: uuidv4(),
        originalId: uuidv4(),
        name: 'Archived Worker',
        code: 9999,
        nationality: 'Test',
        residencyNumber: '1234567890',
        dateOfBirth: new Date(),
        status: 'ARCHIVED'
      }
    });

    // 2. Create Backup
    console.log('💾 Creating backup...');
    const backupResult = await createDatabaseBackup('manual');
    console.log('✅ Backup created:', backupResult.backup.filename);

    // 3. Restore Backup
    console.log('🔄 Restoring backup...');
    const restoreResult = await restoreBackup(backupResult.backup.id);
    
    if (restoreResult.success) {
      console.log('✅ Restore successful');
      console.log('📊 Stats:', restoreResult.stats);

      // 4. Verify Data
      const settings = await prisma.systemSettings.findUnique({ where: { id: 'system' } });
      const restoredJobTitle = await prisma.jobTitle.findUnique({ where: { id: jobTitle.id } });
      const restoredMarketer = await prisma.marketer.findFirst({ where: { email: 'marketer@test.com' } });
      const archivedWorkers = await prisma.archivedWorker.findMany();

      if (settings?.companyName === 'Test Company Backup' && 
          restoredJobTitle && 
          restoredMarketer && 
          archivedWorkers.length > 0) {
        console.log('✅ Verification PASSED: All new tables restored correctly.');
      } else {
        console.error('❌ Verification FAILED: Some data missing.');
        console.log('Settings:', settings);
        console.log('JobTitle:', restoredJobTitle);
        console.log('Marketer:', restoredMarketer);
        console.log('ArchivedWorkers:', archivedWorkers.length);
      }

    } else {
      console.error('❌ Restore failed:', restoreResult.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    await prisma.jobTitle.deleteMany({ where: { name: { contains: 'Test Role' } } });
    await prisma.marketer.deleteMany({ where: { email: 'marketer@test.com' } });
    await prisma.archivedWorker.deleteMany({ where: { nationality: 'Test' } });
    await prisma.$disconnect();
  }
}

testBackupUpdate();
