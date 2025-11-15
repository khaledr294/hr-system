import { NextResponse } from 'next/server';
import { 
  archiveContract, 
  restoreContract, 
  searchArchivedContracts,
  getArchiveStats 
} from '@/lib/archive';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

export const dynamic = 'force-dynamic';

// GET: البحث في الأرشيف أو الحصول على الإحصائيات
export const GET = withApiAuth<{ params: Promise<Record<string, never>> }>(
  { permissions: [Permission.VIEW_ARCHIVE] },
  async ({ req }) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');

    // الحصول على الإحصائيات
    if (action === 'stats') {
      const stats = await getArchiveStats();
      return NextResponse.json(stats);
    }

    // البحث في الأرشيف
    const query: Record<string, string | Date | number> = {};
    
    if (searchParams.get('workerName')) {
      query.workerName = searchParams.get('workerName')!;
    }
    if (searchParams.get('clientName')) {
      query.clientName = searchParams.get('clientName')!;
    }
    if (searchParams.get('startDate')) {
      query.startDate = new Date(searchParams.get('startDate')!);
    }
    if (searchParams.get('endDate')) {
      query.endDate = new Date(searchParams.get('endDate')!);
    }
    if (searchParams.get('archiveReason')) {
      query.archiveReason = searchParams.get('archiveReason')!;
    }
    if (searchParams.get('limit')) {
      query.limit = parseInt(searchParams.get('limit')!);
    }

    const contracts = await searchArchivedContracts(query);
    return NextResponse.json(contracts);
  } catch (error) {
    console.error('خطأ في API الأرشيف:', error);
    return NextResponse.json(
      { error: 'فشل في تنفيذ العملية' },
      { status: 500 }
    );
  }
}
);

// POST: أرشفة أو استرجاع
export const POST = withApiAuth<{ params: Promise<Record<string, never>> }>(
  { permissions: [Permission.MANAGE_ARCHIVE], auditAction: 'ARCHIVE_ACTION' },
  async ({ req, session }) => {
  try {
    const body = await req.json();
    const { action, contractId, archivedContractId, reason } = body;

    // أرشفة عقد
    if (action === 'archive') {
      if (!contractId) {
        return NextResponse.json(
          { error: 'معرف العقد مطلوب' },
          { status: 400 }
        );
      }

      const archivedContract = await archiveContract(
        contractId,
        session.user.id,
        reason
      );

      return NextResponse.json({
        success: true,
        message: 'تم أرشفة العقد بنجاح',
        data: archivedContract
      });
    }

    // استرجاع عقد
    if (action === 'restore') {
      if (!archivedContractId) {
        return NextResponse.json(
          { error: 'معرف العقد المؤرشف مطلوب' },
          { status: 400 }
        );
      }

      const restoredContract = await restoreContract(
        archivedContractId,
        session.user.id
      );

      return NextResponse.json({
        success: true,
        message: 'تم استرجاع العقد بنجاح',
        data: restoredContract
      });
    }

    return NextResponse.json(
      { error: 'إجراء غير معروف' },
      { status: 400 }
    );
  } catch (error) {
    console.error('خطأ في أرشفة/استرجاع:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'فشل في تنفيذ العملية' },
      { status: 500 }
    );
  }
}
);
