import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

/**
 * Query optimization utilities
 * دوال مساعدة لتحسين استعلامات قاعدة البيانات
 */

/**
 * Pagination helper
 * مساعد للصفحات مع معلومات تفصيلية
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

type SortOrderRecord = Record<string, Prisma.SortOrder>;

interface PaginateDelegate<T, Where, Include> {
  count: (args?: { where?: Where }) => Promise<number>;
  findMany: (args: {
    where?: Where;
    include?: Include;
    skip?: number;
    take?: number;
    orderBy?: SortOrderRecord;
  }) => Promise<T[]>;
}

export async function paginate<T, Where = unknown, Include = unknown>(
  model: PaginateDelegate<T, Where, Include>,
  params: PaginationParams,
  where?: Where,
  include?: Include
): Promise<PaginatedResult<T>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const skip = (page - 1) * pageSize;

  // الحصول على إجمالي العدد
  const total = await model.count(where ? { where } : undefined);

  // جلب البيانات
  const data = await model.findMany({
    where,
    include,
    skip,
    take: pageSize,
    orderBy: (params.sortBy
      ? { [params.sortBy]: params.sortOrder || 'desc' }
      : { createdAt: 'desc' }) as SortOrderRecord,
  });

  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Batch operations helper
 * تنفيذ عمليات دفعية لتحسين الأداء
 */
export async function batchCreate<T>(
  model: {
    createMany: (args: { data: T[]; skipDuplicates?: boolean }) => Promise<{ count: number }>;
  },
  data: T[],
  batchSize: number = 100
): Promise<number> {
  let totalCreated = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const result = await model.createMany({
      data: batch,
      skipDuplicates: true,
    });
    totalCreated += result.count;
  }

  return totalCreated;
}

/**
 * Optimized queries لـ Workers
 */
export const WorkerQueries = {
  /**
   * جلب العمالة المتاحة مع معلومات محسّنة
   */
  async getAvailableWorkers(limit: number = 50) {
    return prisma.worker.findMany({
      where: {
        status: 'AVAILABLE',
      },
      select: {
        id: true,
        name: true,
        code: true,
        nationality: true,
        phone: true,
        salary: true,
        dateOfBirth: true,
        createdAt: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * إحصائيات العمالة محسّنة
   */
  async getStats() {
    const [total, available, reserved, contracted] = await Promise.all([
      prisma.worker.count(),
      prisma.worker.count({ where: { status: 'AVAILABLE' } }),
      prisma.worker.count({ where: { status: 'RESERVED' } }),
      prisma.worker.count({ where: { status: 'CONTRACTED' } }),
    ]);

    return { total, available, reserved, contracted };
  },

  /**
   * جلب عاملة مع كل معلوماتها (محسّن)
   */
  async getWorkerWithDetails(id: string) {
    return prisma.worker.findUnique({
      where: { id },
      include: {
        contracts: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
        },
        _count: {
          select: {
            contracts: true,
          },
        },
      },
    });
  },
};

/**
 * Optimized queries لـ Contracts
 */
export const ContractQueries = {
  /**
   * جلب العقود المنتهية قريباً (محسّن)
   */
  async getExpiringContracts(daysAhead: number = 7) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return prisma.contract.findMany({
      where: {
        endDate: {
          gte: today,
          lte: futureDate,
        },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        worker: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        endDate: 'asc',
      },
    });
  },

  /**
   * إحصائيات العقود محسّنة
   */
  async getStats() {
    const [total, active, expired, pending] = await Promise.all([
      prisma.contract.count(),
      prisma.contract.count({ where: { status: 'ACTIVE' } }),
      prisma.contract.count({ where: { status: 'EXPIRED' } }),
      prisma.contract.count({ where: { status: 'PENDING' } }),
    ]);

    return { total, active, expired, pending };
  },

  /**
   * جلب عقد مع كل التفاصيل (محسّن)
   */
  async getContractWithDetails(id: string) {
    return prisma.contract.findUnique({
      where: { id },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            code: true,
            nationality: true,
            residencyNumber: true,
            phone: true,
            dateOfBirth: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            idNumber: true,
            phone: true,
            address: true,
            dateOfBirth: true,
          },
        },
      },
    });
  },
};

/**
 * Optimized queries لـ Dashboard
 */
export const DashboardQueries = {
  /**
   * إحصائيات الـ Dashboard الرئيسية
   */
  async getMainStats() {
    const [workers, contracts, clients] = await Promise.all([
      WorkerQueries.getStats(),
      ContractQueries.getStats(),
      prisma.client.count(),
    ]);

    return {
      workers,
      contracts,
      clients: { total: clients },
    };
  },

  /**
   * أحدث الإضافات
   */
  async getRecentActivity() {
    const [recentWorkers, recentContracts, recentClients] = await Promise.all([
      prisma.worker.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          code: true,
          nationality: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.contract.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          createdAt: true,
          worker: {
            select: {
              name: true,
              code: true,
            },
          },
          client: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.client.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          idNumber: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      recentWorkers,
      recentContracts,
      recentClients,
    };
  },
};

/**
 * Query performance monitoring
 */
export async function measureQueryPerformance<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      console.warn(`⚠️ استعلام بطيء: ${queryName} استغرق ${duration}ms`);
    } else {
      console.log(`✅ ${queryName} استغرق ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ فشل ${queryName} بعد ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Connection pool monitoring
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latency: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    return { connected: true, latency };
  } catch (error) {
    const latency = Date.now() - start;
    return {
      connected: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
