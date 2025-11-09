import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  generateWorkersReport,
  generateContractsReport,
  generateClientsReport,
  generateMonthlyReport,
  exportWorkersToExcel,
  exportContractsToExcel,
} from '@/lib/reports';

/**
 * GET /api/reports
 * جلب التقارير المتقدمة
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
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
          return new NextResponse(buffer as any, {
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
          return new NextResponse(buffer as any, {
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
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
        
        const report = await generateMonthlyReport(year, month);
        return NextResponse.json(report);
      }

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
