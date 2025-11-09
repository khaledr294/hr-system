import { Redis } from '@upstash/redis';

/**
 * Redis Client للـ caching
 * يستخدم Upstash Redis (serverless)
 */

let redis: Redis | null = null;

/**
 * الحصول على Redis client
 */
export function getRedisClient(): Redis | null {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

/**
 * تخزين بيانات في الكاش
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number = 300): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) {
      console.log('⚠️ Redis غير متوفر، تخطي الكاش');
      return false;
    }

    await client.set(key, JSON.stringify(value), { ex: ttlSeconds });
    console.log(`✅ تم تخزين في الكاش: ${key} (TTL: ${ttlSeconds}s)`);
    return true;
  } catch (error) {
    console.error('❌ خطأ في setCache:', error);
    return false;
  }
}

/**
 * جلب بيانات من الكاش
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    if (!client) {
      return null;
    }

    const data = await client.get(key);
    if (!data) {
      console.log(`⚠️ لا توجد بيانات في الكاش: ${key}`);
      return null;
    }

    console.log(`✅ تم جلب من الكاش: ${key}`);
    return (typeof data === 'string' ? JSON.parse(data) : data) as T;
  } catch (error) {
    console.error('❌ خطأ في getCache:', error);
    return null;
  }
}

/**
 * حذف بيانات من الكاش
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) {
      return false;
    }

    await client.del(key);
    console.log(`🗑️ تم حذف من الكاش: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ خطأ في deleteCache:', error);
    return false;
  }
}

/**
 * حذف بيانات متعددة بنمط معين
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const client = getRedisClient();
    if (!client) {
      return 0;
    }

    const keys = await client.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }

    await client.del(...keys);
    console.log(`🗑️ تم حذف ${keys.length} مفاتيح من الكاش (${pattern})`);
    return keys.length;
  } catch (error) {
    console.error('❌ خطأ في deleteCachePattern:', error);
    return 0;
  }
}

/**
 * التحقق من وجود مفتاح في الكاش
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) {
      return false;
    }

    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('❌ خطأ في hasCache:', error);
    return false;
  }
}

/**
 * تخزين مع جلب (Cache-aside pattern)
 * إذا كانت البيانات موجودة في الكاش، يتم إرجاعها
 * وإلا يتم تنفيذ الدالة وتخزين النتيجة
 */
export async function cacheAside<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // محاولة جلب من الكاش
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // جلب من المصدر وتخزين
  const data = await fetcher();
  await setCache(key, data, ttlSeconds);
  return data;
}

/**
 * مسح كل الكاش (استخدم بحذر!)
 */
export async function clearAllCache(): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client) {
      return false;
    }

    await client.flushdb();
    console.log('🗑️ تم مسح كل الكاش');
    return true;
  } catch (error) {
    console.error('❌ خطأ في clearAllCache:', error);
    return false;
  }
}

/**
 * الحصول على معلومات الكاش
 */
export async function getCacheInfo(): Promise<{
  isAvailable: boolean;
  keysCount?: number;
  memory?: string;
}> {
  try {
    const client = getRedisClient();
    if (!client) {
      return { isAvailable: false };
    }

    const keys = await client.keys('*');
    
    return {
      isAvailable: true,
      keysCount: keys.length,
      memory: 'Redis is running',
    };
  } catch (error) {
    console.error('❌ خطأ في getCacheInfo:', error);
    return { isAvailable: false };
  }
}

/**
 * مفاتيح الكاش الشائعة
 */
export const CacheKeys = {
  // Dashboard
  DASHBOARD_STATS: 'dashboard:stats',
  DASHBOARD_RECENT_WORKERS: 'dashboard:recent-workers',
  DASHBOARD_RECENT_CONTRACTS: 'dashboard:recent-contracts',
  
  // Workers
  WORKERS_LIST: (page: number = 1) => `workers:list:${page}`,
  WORKER_BY_ID: (id: string) => `worker:${id}`,
  WORKERS_STATS: 'workers:stats',
  WORKERS_AVAILABLE: 'workers:available',
  
  // Clients
  CLIENTS_LIST: (page: number = 1) => `clients:list:${page}`,
  CLIENT_BY_ID: (id: string) => `client:${id}`,
  CLIENTS_STATS: 'clients:stats',
  
  // Contracts
  CONTRACTS_LIST: (page: number = 1) => `contracts:list:${page}`,
  CONTRACT_BY_ID: (id: string) => `contract:${id}`,
  CONTRACTS_STATS: 'contracts:stats',
  CONTRACTS_EXPIRING: 'contracts:expiring',
  
  // Payroll
  PAYROLL_LIST: (page: number = 1) => `payroll:list:${page}`,
  PAYROLL_STATS: 'payroll:stats',
  
  // Users
  USERS_LIST: 'users:list',
  USER_BY_ID: (id: string) => `user:${id}`,
  
  // Notifications
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  NOTIFICATIONS_UNREAD_COUNT: (userId: string) => `notifications:unread:${userId}`,
  
  // Backups
  BACKUPS_LIST: 'backups:list',
  BACKUPS_STATS: 'backups:stats',
};

/**
 * أوقات انتهاء الكاش (بالثواني)
 */
export const CacheTTL = {
  SHORT: 60,        // دقيقة واحدة - للبيانات المتغيرة
  MEDIUM: 300,      // 5 دقائق - الافتراضي
  LONG: 900,        // 15 دقيقة - للبيانات شبه الثابتة
  HOUR: 3600,       // ساعة - للبيانات الثابتة
  DAY: 86400,       // يوم - للإحصائيات
};
