import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate Limiter للحماية من الطلبات الزائدة
 */

let rateLimiter: Ratelimit | null = null;

/**
 * الحصول على Rate Limiter
 */
function getRateLimiter(): Ratelimit | null {
  if (!rateLimiter && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 طلبات كل 10 ثوان
      analytics: true,
    });
  }
  return rateLimiter;
}

/**
 * التحقق من Rate Limit
 * @param identifier - معرّف المستخدم (IP, user ID, etc)
 * @returns success: true إذا كان ضمن الحد، false إذا تجاوز
 */
export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    const limiter = getRateLimiter();
    if (!limiter) {
      // إذا لم يكن Rate Limiter متوفر، اسمح بالطلب
      return {
        success: true,
        limit: 0,
        remaining: 0,
        reset: 0,
      };
    }

    const result = await limiter.limit(identifier);
    
    if (!result.success) {
      console.log(`⚠️ تجاوز الحد الأقصى للطلبات: ${identifier}`);
    }

    return result;
  } catch (error) {
    console.error('❌ خطأ في checkRateLimit:', error);
    // في حالة الخطأ، اسمح بالطلب
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }
}

/**
 * Rate limiters مخصصة لعمليات مختلفة
 */

// Rate limiter للـ Login (محاولات تسجيل الدخول)
let loginLimiter: Ratelimit | null = null;

export function getLoginRateLimiter(): Ratelimit | null {
  if (!loginLimiter && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    loginLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 محاولات كل 15 دقيقة
      analytics: true,
      prefix: 'ratelimit:login',
    });
  }
  return loginLimiter;
}

export async function checkLoginRateLimit(identifier: string) {
  try {
    const limiter = getLoginRateLimiter();
    if (!limiter) {
      return { success: true, limit: 0, remaining: 0, reset: 0 };
    }

    const result = await limiter.limit(identifier);
    
    if (!result.success) {
      console.log(`🚫 تجاوز محاولات تسجيل الدخول: ${identifier}`);
    }

    return result;
  } catch (error) {
    console.error('❌ خطأ في checkLoginRateLimit:', error);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

// Rate limiter للـ API calls الثقيلة
let heavyApiLimiter: Ratelimit | null = null;

export function getHeavyApiRateLimiter(): Ratelimit | null {
  if (!heavyApiLimiter && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    heavyApiLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'), // 3 طلبات كل دقيقة
      analytics: true,
      prefix: 'ratelimit:heavy',
    });
  }
  return heavyApiLimiter;
}

export async function checkHeavyApiRateLimit(identifier: string) {
  try {
    const limiter = getHeavyApiRateLimiter();
    if (!limiter) {
      return { success: true, limit: 0, remaining: 0, reset: 0 };
    }

    const result = await limiter.limit(identifier);
    
    if (!result.success) {
      console.log(`🚫 تجاوز الحد للعمليات الثقيلة: ${identifier}`);
    }

    return result;
  } catch (error) {
    console.error('❌ خطأ في checkHeavyApiRateLimit:', error);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

// Rate limiter للـ File uploads
let uploadLimiter: Ratelimit | null = null;

export function getUploadRateLimiter(): Ratelimit | null {
  if (!uploadLimiter && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    uploadLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '5 m'), // 5 رفع ملفات كل 5 دقائق
      analytics: true,
      prefix: 'ratelimit:upload',
    });
  }
  return uploadLimiter;
}

export async function checkUploadRateLimit(identifier: string) {
  try {
    const limiter = getUploadRateLimiter();
    if (!limiter) {
      return { success: true, limit: 0, remaining: 0, reset: 0 };
    }

    const result = await limiter.limit(identifier);
    
    if (!result.success) {
      console.log(`🚫 تجاوز رفع الملفات: ${identifier}`);
    }

    return result;
  } catch (error) {
    console.error('❌ خطأ في checkUploadRateLimit:', error);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

/**
 * دالة مساعدة للحصول على IP من الطلب
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

/**
 * Middleware للـ Rate Limiting
 */
export async function rateLimitMiddleware(
  request: Request,
  limiterType: 'default' | 'login' | 'heavy' | 'upload' = 'default'
): Promise<{
  allowed: boolean;
  headers: Record<string, string>;
  response?: Response;
}> {
  const identifier = getClientIdentifier(request);

  let result;
  switch (limiterType) {
    case 'login':
      result = await checkLoginRateLimit(identifier);
      break;
    case 'heavy':
      result = await checkHeavyApiRateLimit(identifier);
      break;
    case 'upload':
      result = await checkUploadRateLimit(identifier);
      break;
    default:
      result = await checkRateLimit(identifier);
  }

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  if (!result.success) {
    return {
      allowed: false,
      headers,
      response: new Response(
        JSON.stringify({
          error: 'تم تجاوز الحد الأقصى للطلبات',
          message: 'يرجى المحاولة لاحقاً',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
            ...headers,
          },
        }
      ),
    };
  }

  return {
    allowed: true,
    headers,
  };
}
