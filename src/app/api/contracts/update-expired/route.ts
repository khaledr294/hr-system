import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateExpiredContracts } from '@/lib/updateExpiredContracts';

export async function POST() {
  try {
    // التحقق من الصلاحيات
    const session = await getServerSession(authOptions);
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
        message: `تم تحديث ${result.updatedContracts} عقد منتهي بنجاح`,
        updatedContracts: result.updatedContracts
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