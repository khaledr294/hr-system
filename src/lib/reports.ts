import { prisma } from './prisma';
import ExcelJS from 'exceljs';

/**
 * مكتبة التقارير المتقدمة
 * Advanced Reports Library
 */

/**
 * تقرير العمالة الشامل
 */
export interface WorkersReport {
  summary: {
    total: number;
    available: number;
    contracted: number;
    reserved: number;
    byNationality: { nationality: string; count: number }[];
  };
  details: Array<{
    id: string;
    name: string;
    code: number;
    nationality: string;
    status: string;
    salary: number | null;
    contractsCount: number;
    createdAt: Date;
  }>;
}

export async function generateWorkersReport(
  startDate?: Date,
  endDate?: Date
): Promise<WorkersReport> {
  const where: any = {};
  if (startDate && endDate) {
    where.createdAt = { gte: startDate, lte: endDate };
  }

  // الملخص
  const [total, available, contracted, reserved, byNationality] = await Promise.all([
    prisma.worker.count({ where }),
    prisma.worker.count({ where: { ...where, status: 'AVAILABLE' } }),
    prisma.worker.count({ where: { ...where, status: 'CONTRACTED' } }),
    prisma.worker.count({ where: { ...where, status: 'RESERVED' } }),
    prisma.worker.groupBy({
      by: ['nationality'],
      where,
      _count: { nationality: true },
    }),
  ]);

  // التفاصيل
  const details = await prisma.worker.findMany({
    where,
    select: {
      id: true,
      name: true,
      code: true,
      nationality: true,
      status: true,
      salary: true,
      createdAt: true,
      _count: {
        select: { contracts: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    summary: {
      total,
      available,
      contracted,
      reserved,
      byNationality: byNationality.map(n => ({
        nationality: n.nationality,
        count: n._count.nationality,
      })),
    },
    details: details.map(w => ({
      id: w.id,
      name: w.name,
      code: w.code,
      nationality: w.nationality,
      status: w.status,
      salary: w.salary,
      contractsCount: w._count.contracts,
      createdAt: w.createdAt,
    })),
  };
}

/**
 * تقرير العقود الشامل
 */
export interface ContractsReport {
  summary: {
    total: number;
    active: number;
    expired: number;
    pending: number;
    byStatus: { status: string; count: number }[];
    totalRevenue: number;
  };
  details: Array<{
    id: string;
    workerName: string;
    workerCode: number;
    clientName: string;
    startDate: Date;
    endDate: Date;
    status: string;
    totalCost: number;
    createdAt: Date;
  }>;
}

export async function generateContractsReport(
  startDate?: Date,
  endDate?: Date
): Promise<ContractsReport> {
  const where: any = {};
  if (startDate && endDate) {
    where.createdAt = { gte: startDate, lte: endDate };
  }

  // الملخص
  const [total, active, expired, pending, byStatus, contracts] = await Promise.all([
    prisma.contract.count({ where }),
    prisma.contract.count({ where: { ...where, status: 'ACTIVE' } }),
    prisma.contract.count({ where: { ...where, status: 'EXPIRED' } }),
    prisma.contract.count({ where: { ...where, status: 'PENDING' } }),
    prisma.contract.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    }),
    prisma.contract.findMany({
      where,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        worker: {
          select: {
            name: true,
            code: true,
          },
        },
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalRevenue = contracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  return {
    summary: {
      total,
      active,
      expired,
      pending,
      byStatus: byStatus.map(s => ({
        status: s.status,
        count: s._count.status,
      })),
      totalRevenue,
    },
    details: contracts.map(c => ({
      id: c.id,
      workerName: c.worker.name,
      workerCode: c.worker.code,
      clientName: c.client.name,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      totalCost: c.totalAmount || 0,
      createdAt: c.createdAt,
    })),
  };
}

/**
 * تقرير العملاء الشامل
 */
export interface ClientsReport {
  summary: {
    total: number;
    withActiveContracts: number;
    totalContracts: number;
    totalRevenue: number;
  };
  details: Array<{
    id: string;
    name: string;
    phone: string;
    address: string;
    contractsCount: number;
    totalSpent: number;
    createdAt: Date;
  }>;
}

export async function generateClientsReport(
  startDate?: Date,
  endDate?: Date
): Promise<ClientsReport> {
  const where: any = {};
  if (startDate && endDate) {
    where.createdAt = { gte: startDate, lte: endDate };
  }

  const clients = await prisma.client.findMany({
    where,
    include: {
      contracts: {
        select: {
          totalAmount: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const withActiveContracts = clients.filter((c: any) =>
    c.contracts.some((con: any) => con.status === 'ACTIVE')
  ).length;

  const totalContracts = clients.reduce((sum: number, c: any) => sum + c.contracts.length, 0);
  const totalRevenue = clients.reduce(
    (sum: number, c: any) => sum + c.contracts.reduce((s: number, con: any) => s + (con.totalAmount || 0), 0),
    0
  );

  return {
    summary: {
      total: clients.length,
      withActiveContracts,
      totalContracts,
      totalRevenue,
    },
    details: clients.map((c: any) => {
      const totalSpent = c.contracts.reduce((s: number, con: any) => s + (con.totalAmount || 0), 0);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        address: c.address,
        contractsCount: c.contracts.length,
        totalSpent,
        createdAt: c.createdAt,
      };
    }),
  };
}

/**
 * تقرير شهري شامل
 */
export interface MonthlyReport {
  month: string;
  workers: {
    added: number;
    total: number;
  };
  contracts: {
    created: number;
    active: number;
    expired: number;
    revenue: number;
  };
  clients: {
    added: number;
    total: number;
  };
}

export async function generateMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const [
    workersAdded,
    totalWorkers,
    contractsCreated,
    activeContracts,
    expiredContracts,
    contracts,
    clientsAdded,
    totalClients,
  ] = await Promise.all([
    prisma.worker.count({
      where: { createdAt: { gte: startDate, lte: endDate } },
    }),
    prisma.worker.count(),
    prisma.contract.count({
      where: { createdAt: { gte: startDate, lte: endDate } },
    }),
    prisma.contract.count({
      where: { status: 'ACTIVE' },
    }),
    prisma.contract.count({
      where: {
        status: 'EXPIRED',
        endDate: { gte: startDate, lte: endDate },
      },
    }),
    prisma.contract.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { totalAmount: true },
    }),
    prisma.client.count({
      where: { createdAt: { gte: startDate, lte: endDate } },
    }),
    prisma.client.count(),
  ]);

  const revenue = contracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  return {
    month: `${year}-${month.toString().padStart(2, '0')}`,
    workers: {
      added: workersAdded,
      total: totalWorkers,
    },
    contracts: {
      created: contractsCreated,
      active: activeContracts,
      expired: expiredContracts,
      revenue,
    },
    clients: {
      added: clientsAdded,
      total: totalClients,
    },
  };
}

/**
 * تصدير تقرير إلى Excel
 */
export async function exportWorkersToExcel(report: WorkersReport): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('تقرير العمالة');

  // العنوان
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'تقرير العمالة الشامل';
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // الملخص
  worksheet.addRow([]);
  worksheet.addRow(['الملخص']);
  worksheet.addRow(['إجمالي العمالة', report.summary.total]);
  worksheet.addRow(['متاحة', report.summary.available]);
  worksheet.addRow(['متعاقد عليها', report.summary.contracted]);
  worksheet.addRow(['محجوزة', report.summary.reserved]);

  // التفاصيل
  worksheet.addRow([]);
  worksheet.addRow(['التفاصيل']);
  const headerRow = worksheet.addRow([
    'الرقم',
    'الاسم',
    'الكود',
    'الجنسية',
    'الحالة',
    'الراتب',
    'عدد العقود',
  ]);
  
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };

  report.details.forEach((worker, index) => {
    worksheet.addRow([
      index + 1,
      worker.name,
      worker.code,
      worker.nationality,
      worker.status,
      worker.salary || 0,
      worker.contractsCount,
    ]);
  });

  // تنسيق
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function exportContractsToExcel(report: ContractsReport): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('تقرير العقود');

  // العنوان
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'تقرير العقود الشامل';
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // الملخص
  worksheet.addRow([]);
  worksheet.addRow(['الملخص']);
  worksheet.addRow(['إجمالي العقود', report.summary.total]);
  worksheet.addRow(['نشطة', report.summary.active]);
  worksheet.addRow(['منتهية', report.summary.expired]);
  worksheet.addRow(['قيد الانتظار', report.summary.pending]);
  worksheet.addRow(['إجمالي الإيرادات', report.summary.totalRevenue]);

  // التفاصيل
  worksheet.addRow([]);
  worksheet.addRow(['التفاصيل']);
  const headerRow = worksheet.addRow([
    'الرقم',
    'اسم العاملة',
    'كود العاملة',
    'اسم العميل',
    'تاريخ البداية',
    'تاريخ النهاية',
    'الحالة',
    'التكلفة',
  ]);
  
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };

  report.details.forEach((contract, index) => {
    worksheet.addRow([
      index + 1,
      contract.workerName,
      contract.workerCode,
      contract.clientName,
      contract.startDate.toLocaleDateString('ar-SA'),
      contract.endDate.toLocaleDateString('ar-SA'),
      contract.status,
      contract.totalCost,
    ]);
  });

  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
