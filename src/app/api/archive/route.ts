import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  archiveContract, 
  restoreContract, 
  searchArchivedContracts,
  getArchiveStats 
} from '@/lib/archive';

export const dynamic = 'force-dynamic';

// GET: البحث في الأرشيف أو الحصول على الإحصائيات
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // الحصول على الإحصائيات
    if (action === 'stats') {
      const stats = await getArchiveStats();
      return NextResponse.json(stats);
    }

    // البحث في الأرشيف
    const query: any = {};
    
    if (searchParams.get('workerName')) {
      query.workerName = searchParams.get('workerName');
    }
    if (searchParams.get('clientName')) {
      query.clientName = searchParams.get('clientName');
    }
    if (searchParams.get('startDate')) {
      query.startDate = new Date(searchParams.get('startDate')!);
    }
    if (searchParams.get('endDate')) {
      query.endDate = new Date(searchParams.get('endDate')!);
    }
    if (searchParams.get('archiveReason')) {
      query.archiveReason = searchParams.get('archiveReason');
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

    // فقط المدراء يمكنهم الأرشفة
    if (session.user.role !== 'ADMIN' && session.user.role !== 'GENERAL_MANAGER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
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
  } catch (error: any) {
    console.error('خطأ في أرشفة/استرجاع:', error);
    return NextResponse.json(
      { error: error.message || 'فشل في تنفيذ العملية' },
      { status: 500 }
    );
  }
}
