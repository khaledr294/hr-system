import { NextRequest } from 'next/server';
import { withApiAuth } from '@/lib/api-guard';
import { Permission } from '@prisma/client';
import { generateMarketersReport, exportMarketersReportToExcel } from '@/lib/reports';

type EmptyContext = { params: Promise<Record<string, never>> };

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_REPORTS], auditAction: 'MARKETERS_REPORT_VIEW' },
  async ({ req }) => {
    try {
      const { searchParams } = new URL(req.url);
      const month = searchParams.get('month');
      const format = searchParams.get('format') || 'json';

      if (!month) {
        return new Response('Month parameter is required (format: YYYY-MM)', { status: 400 });
      }

      // Validate month format
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return new Response('Invalid month format. Use YYYY-MM', { status: 400 });
      }

      const report = await generateMarketersReport(month);

      if (format === 'excel') {
        const buffer = await exportMarketersReportToExcel(report);
        return new Response(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="marketers-report-${month}.xlsx"`,
          },
        });
      }

      return Response.json(report);
    } catch (error) {
      console.error('Error generating marketers report:', error);
      return new Response('Failed to generate report', { status: 500 });
    }
  }
);
