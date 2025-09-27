import { prisma } from '@/lib/prisma';

/**
 * إنشاء سجل جديد في قاعدة البيانات
 * @param userId - معرف المستخدم
 * @param action - نوع العملية
 * @param message - رسالة العملية
 * @param entity - نوع الكيان (اختياري)
 * @param entityId - معرف الكيان (اختياري)
 */
export async function createLog(
  userId: string,
  action: string,
  message: string,
  entity?: string,
  entityId?: string
): Promise<void> {
  try {
    // التحقق من صحة البيانات
    if (!userId || !action || !message) {
      console.warn('Logger: Missing required parameters');
      return;
    }

    await prisma.log.create({
      data: {
        userId,
        action: action.toUpperCase(),
        message,
        entity: entity || null,
        entityId: entityId || null,
      }
    });
  } catch (error) {
    console.error('Error creating log:', error);
    // لا نريد أن تؤثر أخطاء السجل على العمليات الأساسية
  }
}

/**
 * جلب سجلات المستخدم مع التصفح
 */
export async function getLogs(
  userId?: string,
  page: number = 1,
  limit: number = 50,
  action?: string
) {
  try {
    const skip = (page - 1) * limit;
    
    const whereClause: Record<string, unknown> = {};
    if (userId) whereClause.userId = userId;
    if (action) whereClause.action = action.toUpperCase();

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.log.count({ where: whereClause })
    ]);

    return {
      logs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw new Error('Failed to fetch logs');
  }
}