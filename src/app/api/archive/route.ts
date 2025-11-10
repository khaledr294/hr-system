import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  archiveContract, 
  restoreContract, 
  searchArchivedContracts,
  getArchiveStats 
} from '@/lib/archive';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

// GET: البحث في الأرشيف أو الحصول على الإحصائيات
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من صلاحية عرض العقود
    const canView = await hasPermission(session.user.id, 'VIEW_CONTRACTS');
    if (!canView) {
      return NextResponse.json({ error: 'ليس لديك صلاحية عرض الأرشيف' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
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

// POST: أرشفة أو استرجاع
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { action, contractId, archivedContractId, reason } = body;

    // التحقق من الصلاحيات بناءً على نوع العملية
    if (action === 'archive') {
      // أرشفة عقد تتطلب صلاحية حذف العقود
      const canDelete = await hasPermission(session.user.id, 'DELETE_CONTRACTS');
      if (!canDelete) {
        return NextResponse.json({ error: 'ليس لديك صلاحية أرشفة العقود' }, { status: 403 });
      }
    } else if (action === 'restore') {
      // استعادة عقد تتطلب صلاحية إنشاء عقود
      const canCreate = await hasPermission(session.user.id, 'CREATE_CONTRACTS');
      if (!canCreate) {
        return NextResponse.json({ error: 'ليس لديك صلاحية استعادة العقود' }, { status: 403 });
      }
    }

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
