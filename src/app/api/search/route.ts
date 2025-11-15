import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission, Prisma } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';
import { sessionHasPermission } from '@/lib/permissions';

type EmptyContext = { params: Promise<Record<string, never>> };

export const dynamic = 'force-dynamic';

interface WorkerSearchResult {
  id: string;
  name: string;
  code: string;
  nationality: string;
  status: string;
  passportNumber: string | null;
  contractsCount: number;
  type: 'worker';
}

interface ContractSearchResult {
  id: string;
  workerName: string;
  workerCode: string;
  clientName: string;
  startDate: Date;
  endDate: Date;
  status: string;
  totalAmount: number;
  type: 'contract';
}

interface ClientSearchResult {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  email: string | null;
  contractsCount: number;
  type: 'client';
}

interface UserSearchResult {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  createdAt: Date;
  type: 'user';
}

interface SearchResponse {
  query: string;
  total: number;
  workers: WorkerSearchResult[];
  contracts: ContractSearchResult[];
  clients: ClientSearchResult[];
  users: UserSearchResult[];
}

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.VIEW_SEARCH] },
  async ({ req, session }) => {
    try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
  const entities = searchParams.get('entities')?.split(',') || ['workers', 'contracts', 'clients', 'users'];
  const parsedLimit = Number.parseInt(searchParams.get('limit') || '10', 10);
  const limit = Number.isNaN(parsedLimit) ? 10 : parsedLimit;
    
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

    const results: SearchResponse = {
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
        workerFilter.status = status;
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

      results.workers = workers.map((w) => ({
        id: w.id,
        name: w.name,
        code: w.code,
        nationality: w.nationality,
        status: w.status,
        passportNumber: w.passportNumber ?? null,
        contractsCount: w.contracts.length,
        type: 'worker' as const,
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
        contractFilter.status = status;
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

      results.contracts = contracts.map((c) => ({
        id: c.id,
        workerName: c.worker.name,
        workerCode: c.worker.code,
        clientName: c.client.name,
        startDate: c.startDate,
        endDate: c.endDate,
        status: c.status,
        totalAmount: c.totalAmount,
        type: 'contract' as const,
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

      results.clients = clients.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        idNumber: c.idNumber,
        email: c.email ?? null,
        contractsCount: c.contracts.length,
        type: 'client' as const,
      }));
      results.total += results.clients.length;
    }

    // البحث في المستخدمين (يتطلب صلاحية VIEW_USERS)
    const canViewUsers = sessionHasPermission(session, Permission.VIEW_USERS);
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
          createdAt: true,
          jobTitle: {
            select: { name: true }
          }
        }
      });

      results.users = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.jobTitle?.name ?? 'غير محدد',
        createdAt: u.createdAt,
        type: 'user' as const,
      }));
      results.total += results.users.length;
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error('خطأ في البحث:', error);
    const message = error instanceof Error ? error.message : 'فشل في تنفيذ البحث';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
  }
);
