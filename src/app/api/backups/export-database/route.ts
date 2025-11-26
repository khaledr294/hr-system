import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireHR } from '@/lib/require';
import ExcelJS from 'exceljs';

export async function GET() {
  try {
    await requireHR();

    // Fetch all data
    const [workers, clients, contracts, users, marketers, packages, logs] = await Promise.all([
      prisma.worker.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.client.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.contract.findMany({
        include: { client: true, worker: true, marketer: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        select: {
          name: true,
          email: true,
          createdAt: true,
          jobTitle: { select: { nameAr: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.marketer.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.package.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.log.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 }),
    ]);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HR System';
    workbook.created = new Date();

    // Workers Sheet
    const workersSheet = workbook.addWorksheet('العاملات');
    workersSheet.columns = [
      { header: 'الكود', key: 'code', width: 15 },
      { header: 'الاسم', key: 'name', width: 25 },
      { header: 'الجنسية', key: 'nationality', width: 15 },
      { header: 'رقم الإقامة', key: 'residencyNumber', width: 20 },
      { header: 'الحالة', key: 'status', width: 15 },
      { header: 'الراتب', key: 'salary', width: 12 },
      { header: 'تاريخ الإضافة', key: 'createdAt', width: 18 },
    ];
    workers.forEach(worker => {
      workersSheet.addRow({
        code: worker.code,
        name: worker.name,
        nationality: worker.nationality,
        residencyNumber: worker.residencyNumber,
        status: worker.status,
        salary: worker.salary,
        createdAt: worker.createdAt.toLocaleDateString('ar-SA'),
      });
    });
    workersSheet.getRow(1).font = { bold: true };

    // Clients Sheet
    const clientsSheet = workbook.addWorksheet('العملاء');
    clientsSheet.columns = [
      { header: 'الاسم', key: 'name', width: 25 },
      { header: 'رقم الهوية', key: 'idNumber', width: 20 },
      { header: 'رقم الجوال', key: 'phone', width: 18 },
      { header: 'العنوان', key: 'address', width: 35 },
      { header: 'تاريخ الإضافة', key: 'createdAt', width: 18 },
    ];
    clients.forEach(client => {
      clientsSheet.addRow({
        name: client.name,
        idNumber: client.idNumber,
        phone: client.phone,
        address: client.address,
        createdAt: client.createdAt.toLocaleDateString('ar-SA'),
      });
    });
    clientsSheet.getRow(1).font = { bold: true };

    // Contracts Sheet
    const contractsSheet = workbook.addWorksheet('العقود');
    contractsSheet.columns = [
      { header: 'رقم العقد', key: 'contractNumber', width: 15 },
      { header: 'العاملة', key: 'worker', width: 20 },
      { header: 'العميل', key: 'client', width: 20 },
      { header: 'المسوق', key: 'marketer', width: 20 },
      { header: 'تاريخ البداية', key: 'startDate', width: 15 },
      { header: 'تاريخ النهاية', key: 'endDate', width: 15 },
      { header: 'نوع الباقة', key: 'packageType', width: 20 },
      { header: 'المبلغ', key: 'totalAmount', width: 12 },
      { header: 'الحالة', key: 'status', width: 12 },
    ];
    contracts.forEach(contract => {
      contractsSheet.addRow({
        contractNumber: contract.contractNumber,
        worker: contract.worker.name,
        client: contract.client.name,
        marketer: contract.marketer?.name || '-',
        startDate: contract.startDate.toLocaleDateString('ar-SA'),
        endDate: contract.endDate.toLocaleDateString('ar-SA'),
        packageType: contract.packageName || contract.packageType,
        totalAmount: contract.totalAmount,
        status: contract.status,
      });
    });
    contractsSheet.getRow(1).font = { bold: true };

    // Users Sheet
    const usersSheet = workbook.addWorksheet('المستخدمون');
    usersSheet.columns = [
      { header: 'الاسم', key: 'name', width: 25 },
      { header: 'البريد الإلكتروني', key: 'email', width: 30 },
      { header: 'الدور', key: 'role', width: 20 },
      { header: 'تاريخ الإضافة', key: 'createdAt', width: 18 },
    ];
    users.forEach(user => {
      usersSheet.addRow({
        name: user.name,
        email: user.email,
        role: user.jobTitle?.nameAr || '-',
        createdAt: user.createdAt.toLocaleDateString('ar-SA'),
      });
    });
    usersSheet.getRow(1).font = { bold: true };

    // Marketers Sheet
    const marketersSheet = workbook.addWorksheet('المسوقون');
    marketersSheet.columns = [
      { header: 'الاسم', key: 'name', width: 25 },
      { header: 'البريد الإلكتروني', key: 'email', width: 30 },
      { header: 'رقم الجوال', key: 'phone', width: 18 },
      { header: 'تاريخ الإضافة', key: 'createdAt', width: 18 },
    ];
    marketers.forEach(marketer => {
      marketersSheet.addRow({
        name: marketer.name,
        email: marketer.email,
        phone: marketer.phone,
        createdAt: marketer.createdAt.toLocaleDateString('ar-SA'),
      });
    });
    marketersSheet.getRow(1).font = { bold: true };

    // Packages Sheet
    const packagesSheet = workbook.addWorksheet('الباقات');
    packagesSheet.columns = [
      { header: 'الاسم', key: 'name', width: 30 },
      { header: 'السعر', key: 'price', width: 12 },
      { header: 'تاريخ الإضافة', key: 'createdAt', width: 18 },
    ];
    packages.forEach(pkg => {
      packagesSheet.addRow({
        name: pkg.name,
        price: pkg.price,
        createdAt: pkg.createdAt.toLocaleDateString('ar-SA'),
      });
    });
    packagesSheet.getRow(1).font = { bold: true };

    // Logs Sheet (recent 1000)
    const logsSheet = workbook.addWorksheet('السجلات (آخر 1000)');
    logsSheet.columns = [
      { header: 'الإجراء', key: 'action', width: 25 },
      { header: 'الرسالة', key: 'message', width: 50 },
      { header: 'النوع', key: 'entity', width: 20 },
      { header: 'التاريخ', key: 'createdAt', width: 20 },
    ];
    logs.forEach(log => {
      logsSheet.addRow({
        action: log.action,
        message: log.message,
        entity: log.entity || '-',
        createdAt: log.createdAt.toLocaleString('ar-SA'),
      });
    });
    logsSheet.getRow(1).font = { bold: true };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Return file
    const filename = `database-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting database:', error);
    return NextResponse.json({ error: 'Failed to export database' }, { status: 500 });
  }
}
