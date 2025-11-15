import { NextResponse } from 'next/server';
import { Permission } from '@prisma/client';
import {
  generateWorkersReport,
  generateContractsReport,
  generateClientsReport,
  exportWorkersToExcel,
  exportContractsToExcel,
} from '@/lib/reports';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

/**
 * GET /api/reports
 * جلب التقارير المتقدمة
 */
export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_REPORTS], auditAction: 'REPORT_VIEW' },
  async ({ req }) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    switch (type) {
      case 'workers': {
        const report = await generateWorkersReport(start, end);
        
        if (format === 'excel') {
          const buffer = await exportWorkersToExcel(report);
          const uint8Array = new Uint8Array(buffer);
          return new NextResponse(uint8Array, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment; filename="workers-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
            },
          });
        }

        return NextResponse.json(report);
      }

      case 'contracts': {
        const report = await generateContractsReport(start, end);
        
        if (format === 'excel') {
          const buffer = await exportContractsToExcel(report);
          const uint8Array = new Uint8Array(buffer);
          return new NextResponse(uint8Array, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment; filename="contracts-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
            },
          });
        }

        return NextResponse.json(report);
      }

      case 'clients': {
        const report = await generateClientsReport(start, end);
        return NextResponse.json(report);
      }

      case 'monthly': {
        // تقرير شامل مع بيانات الرسوم البيانية
        const [
          // إحصائيات أساسية
          totalContracts,
          activeContracts,
          expiredContracts,
          totalWorkers,
          availableWorkers,
          reservedWorkers,
          rentedWorkers,
          totalClients,
          totalUsers,

          // بيانات الرسوم البيانية
          revenueByMonth,
          contractsByMonth,
          workersByNationality,
          topClients,
        ] = await Promise.all([
          // الإحصائيات الأساسية
          prisma.contract.count(),
          prisma.contract.count({ where: { status: 'ACTIVE' } }),
          prisma.contract.count({ where: { status: 'EXPIRED' } }),
          prisma.worker.count(),
          prisma.worker.count({ where: { status: 'AVAILABLE' } }),
          prisma.worker.count({ where: { status: 'RESERVED' } }),
          prisma.worker.count({ where: { status: 'CONTRACTED' } }),
          prisma.client.count(),
          prisma.user.count(),

          // الإيرادات الشهرية (آخر 12 شهر)
          prisma.$queryRaw<Array<{ month: string; revenue: Prisma.Decimal | number }>>`
            SELECT 
              TO_CHAR(DATE_TRUNC('month', "startDate"), 'YYYY-MM') as month,
              COALESCE(SUM("totalAmount"), 0)::numeric as revenue
            FROM "Contract"
            WHERE "startDate" >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', "startDate")
            ORDER BY month DESC
            LIMIT 12
          `,

          // العقود الشهرية (آخر 12 شهر)
          prisma.$queryRaw<Array<{ month: string; count: bigint | number }>>`
            SELECT 
              TO_CHAR(DATE_TRUNC('month', "startDate"), 'YYYY-MM') as month,
              COUNT(*)::integer as count
            FROM "Contract"
            WHERE "startDate" >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', "startDate")
            ORDER BY month DESC
            LIMIT 12
          `,

          // العمال حسب الجنسية
          prisma.worker.groupBy({
            by: ['nationality'],
            _count: { nationality: true },
          }),

          // أفضل 10 عملاء
          prisma.client.findMany({
            take: 10,
            select: {
              name: true,
              _count: {
                select: { contracts: true },
              },
              contracts: {
                select: { totalAmount: true },
              },
            },
            orderBy: {
              contracts: { _count: 'desc' },
            },
          }),
        ]);

        // حساب إجمالي الإيرادات
        const allContracts = await prisma.contract.findMany({
          select: { totalAmount: true },
        });
        const totalRevenue = allContracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

        // حساب الإيرادات الشهرية الحالية
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const monthlyContracts = await prisma.contract.findMany({
          where: {
            startDate: {
              gte: currentMonth,
              lt: nextMonth,
            },
          },
          select: { totalAmount: true },
        });
        const monthlyRevenue = monthlyContracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

        return NextResponse.json({
          totalContracts,
          activeContracts,
          expiredContracts,
          totalRevenue,
          monthlyRevenue,
          totalWorkers,
          availableWorkers,
          reservedWorkers,
          rentedWorkers,
          totalClients,
          totalUsers,
          revenueByMonth: revenueByMonth
            .map((r) => ({
              month: r.month,
              revenue: Number(r.revenue),
            }))
            .reverse(),
          contractsByMonth: contractsByMonth
            .map((c) => ({
              month: c.month,
              count: Number(c.count),
            }))
            .reverse(),
          workersByNationality: workersByNationality.map((w) => ({
            nationality: w.nationality,
            count: w._count.nationality,
          })),
          topClients: topClients.map((client) => ({
            name: client.name,
            contracts: client._count.contracts,
            revenue: client.contracts.reduce(
              (sum, contract) => sum + Number(contract.totalAmount ?? 0),
              0
            ),
          })),
        });
      }

      case 'daily':
      case 'weekly':
      case 'yearly':
        return NextResponse.json({ error: 'نوع التقرير غير مدعوم حالياً' }, { status: 400 });

      default:
        return NextResponse.json({ error: 'نوع التقرير غير معروف' }, { status: 400 });
    }
  } catch (error) {
    console.error('خطأ في GET /api/reports:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'حدث خطأ' },
      { status: 500 }
    );
  }
}
);
