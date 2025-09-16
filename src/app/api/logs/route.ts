import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session || !['GENERAL_MANAGER', 'HR'].includes(session.user?.role || '')) {
    return new Response('Unauthorized', { status: 401 });
  }
  // جلب آخر 20 عملية
  const logs = await prisma.log.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return new Response(JSON.stringify(logs), { headers: { 'Content-Type': 'application/json' } });
}
