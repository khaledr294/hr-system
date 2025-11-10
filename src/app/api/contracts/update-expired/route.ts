import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateExpiredContracts } from '@/lib/updateExpiredContracts';
import { hasPermission } from '@/lib/permissions';

export async function POST() {
  try {
    // التحقق من الصلاحيات
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // التحقق من صلاحية تعديل العقود
    const canEdit = await hasPermission(session.user.id, 'EDIT_CONTRACTS');
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Forbidden - ليس لديك صلاحية تحديث العقود' },
        { status: 403 }
      );
    }

    // تشغيل مهمة تحديث العقود المنتهية
    const result = await updateExpiredContracts();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `تم تحديث ${result.updatedCount} عقد منتهي بنجاح`,
        updatedContracts: result.updatedCount
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in update contracts API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}