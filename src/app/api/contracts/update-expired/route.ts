import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateExpiredContracts } from '@/lib/updateExpiredContracts';

export async function POST() {
  try {
    // التحقق من الصلاحيات
    const session = await auth();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'HR')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or HR access required' },
        { status: 401 }
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