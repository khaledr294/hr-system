import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const entities = searchParams.get('entities')?.split(',') || ['workers', 'contracts', 'clients', 'users'];
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // فلاتر إضافية
    const status = searchParams.get('status');
    const nationality = searchParams.get('nationality');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!query && !status && !nationality && !startDate) {
      return NextResponse.json({ 
        error: 'يرجى إدخال كلمة بحث أو فلتر واحد على الأقل' 
      }, { status: 400 });
    }

    const results: any = {
      query,
      total: 0,
      workers: [],
      contracts: [],
      clients: [],
      users: []
    };

    // البحث في العمالة
    if (entities.includes('workers') && query) {
      const workerFilter: Prisma.WorkerWhereInput = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nationality: { contains: query, mode: 'insensitive' } },
          { passportNumber: { contains: query, mode: 'insensitive' } }
        ]
      };

      if (status) {
        workerFilter.status = status as any;
      }
      if (nationality) {
        workerFilter.nationality = nationality;
      }

      const workers = await prisma.worker.findMany({
        where: workerFilter,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contracts: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      results.workers = workers.map((w: any) => ({
        id: w.id,
        name: w.name,
        code: w.code,
        nationality: w.nationality,
        status: w.status,
        passportNumber: w.passportNumber,
        contractsCount: w.contracts.length,
        type: 'worker'
      }));
      results.total += results.workers.length;
    }

    // البحث في العقود
    if (entities.includes('contracts')) {
      const contractFilter: Prisma.ContractWhereInput = {};

      if (query) {
        contractFilter.OR = [
          { worker: { name: { contains: query, mode: 'insensitive' } } },
          { client: { name: { contains: query, mode: 'insensitive' } } }
        ];
      }

      if (status) {
        contractFilter.status = status as any;
      }

      if (startDate) {
        contractFilter.startDate = { gte: new Date(startDate) };
      }

      if (endDate) {
        contractFilter.endDate = { lte: new Date(endDate) };
      }

      const contracts = await prisma.contract.findMany({
        where: contractFilter,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          worker: {
            select: { id: true, name: true, code: true, nationality: true }
          },
          client: {
            select: { id: true, name: true, phone: true }
          }
        }
      });

      results.contracts = contracts.map((c: any) => ({
        id: c.id,
        workerName: c.worker.name,
        workerCode: c.worker.code,
        clientName: c.client.name,
        startDate: c.startDate,
        endDate: c.endDate,
        status: c.status,
        totalAmount: c.totalAmount,
        type: 'contract'
      }));
      results.total += results.contracts.length;
    }

    // البحث في العملاء
    if (entities.includes('clients') && query) {
      const clientFilter: Prisma.ClientWhereInput = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { idNumber: { contains: query } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      };

      const clients = await prisma.client.findMany({
        where: clientFilter,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contracts: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      results.clients = clients.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        idNumber: c.idNumber,
        email: c.email,
        contractsCount: c.contracts.length,
        type: 'client'
      }));
      results.total += results.clients.length;
    }

    // البحث في المستخدمين (يتطلب صلاحية VIEW_USERS)
    const canViewUsers = await hasPermission(session.user.id, 'VIEW_USERS');
    if (entities.includes('users') && query && canViewUsers) {
      const userFilter: Prisma.UserWhereInput = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      };

      const users = await prisma.user.findMany({
        where: userFilter,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      results.users = users.map((u: any) => ({
        ...u,
        type: 'user'
      }));
      results.total += results.users.length;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('خطأ في البحث:', error);
    return NextResponse.json(
      { error: 'فشل في تنفيذ البحث' },
      { status: 500 }
    );
  }
}
