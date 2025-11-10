# 🛠️ خطة العمل التفصيلية - Action Plan

## 📅 جدول زمني للتحسينات

---

## 🔴 المرحلة 1: الأولويات الحرجة (1-3 أيام)

### ✅ المهمة 1: إضافة Error Boundaries
**الأهمية:** حرجة  
**الوقت المقدر:** 2 ساعة

#### الخطوات:
```bash
# 1. إنشاء Error Boundary عامة
touch src/app/(authenticated)/error.tsx
```

```tsx
// src/app/(authenticated)/error.tsx
'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4 text-gradient">
          حدث خطأ غير متوقع
        </h2>
        <p className="text-slate-600 mb-6">
          عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-4">
            رقم الخطأ: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>
            المحاولة مرة أخرى
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => window.location.href = '/'}
          >
            العودة للرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}
```

#### الاختبار:
```bash
npm run dev
# جرب رمي خطأ في أي صفحة لاختبار Error Boundary
```

---

### ✅ المهمة 2: تحسين Console.log Statements
**الأهمية:** متوسطة  
**الوقت المقدر:** 3 ساعات

#### الخطوات:

```typescript
// 1. إنشاء Logger utility محسّن
// src/lib/logger.ts (تحديث)

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV === 'development';

export function log(level: LogLevel, message: string, meta?: object) {
  if (!isDev && level === 'debug') return;
  
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case 'error':
      console.error(logMessage, meta);
      // TODO: Send to Sentry/monitoring service
      break;
    case 'warn':
      console.warn(logMessage, meta);
      break;
    case 'info':
      console.info(logMessage, meta);
      break;
    case 'debug':
      console.log(logMessage, meta);
      break;
  }
}

export const logger = {
  debug: (message: string, meta?: object) => log('debug', message, meta),
  info: (message: string, meta?: object) => log('info', message, meta),
  warn: (message: string, meta?: object) => log('warn', message, meta),
  error: (message: string, meta?: object) => log('error', message, meta),
};
```

```typescript
// 2. استبدال console.log في المشروع
// مثال: src/lib/cache.ts

// ❌ قبل
console.log(`✅ تم تخزين في الكاش: ${key}`);

// ✅ بعد
import { logger } from './logger';
logger.debug(`تم تخزين في الكاش: ${key}`);
```

#### البحث والاستبدال:
```bash
# ابحث عن جميع console.log
grep -r "console\.log" src/ --include="*.ts" --include="*.tsx"

# استبدلها بـ logger.debug أو المستوى المناسب
```

---

### ✅ المهمة 3: إزالة Implicit Any Types
**الأهمية:** متوسطة  
**الوقت المقدر:** 2 ساعة

#### الملفات المطلوب تحديثها:

```typescript
// src/app/api/contracts/route.ts:29
// ❌ قبل
const whereClause: any = {};

// ✅ بعد
import type { Prisma } from '@prisma/client';
const whereClause: Prisma.ContractWhereInput = {};
```

```typescript
// src/app/api/workers/route.ts:151
// ❌ قبل
} catch (error: unknown) {
  const prismaError = error as { code?: string };

// ✅ بعد
import { Prisma } from '@prisma/client';

} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2022') {
      // Handle missing column error
    }
  } else {
    throw error;
  }
}
```

---

## 🟡 المرحلة 2: التحسينات المهمة (1-2 أسبوع)

### ✅ المهمة 4: إضافة Zod Validation
**الأهمية:** عالية  
**الوقت المقدر:** 3 أيام

#### التثبيت:
```bash
npm install zod
```

#### إنشاء Schemas:
```typescript
// src/lib/validations/worker.ts
import { z } from 'zod';

export const workerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  code: z.number().int().positive('الكود يجب أن يكون رقم موجب'),
  nationality: z.string().min(2),
  residencyNumber: z.string().regex(/^\d{10}$/, 'رقم الإقامة يجب أن يكون 10 أرقام'),
  dateOfBirth: z.string().datetime(),
  phone: z.string().regex(/^05\d{8}$/, 'رقم الجوال يجب أن يبدأ بـ 05 ويحتوي على 10 أرقام'),
  borderNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  religion: z.string().optional(),
  iban: z.string().regex(/^SA\d{22}$/).optional(),
});

export type WorkerInput = z.infer<typeof workerSchema>;
```

#### الاستخدام في API Routes:
```typescript
// src/app/api/workers/route.ts
import { workerSchema } from '@/lib/validations/worker';

export async function POST(req: NextRequest) {
  // ... authentication & authorization
  
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = workerSchema.parse(body);
    
    // Create worker with validated data
    const worker = await prisma.worker.create({
      data: validatedData
    });
    
    // ... rest of the code
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({
        error: 'بيانات غير صحيحة',
        details: error.errors
      }), { status: 400 });
    }
    // ... other error handling
  }
}
```

#### Schemas للإنشاء:
- ✅ `src/lib/validations/worker.ts`
- ✅ `src/lib/validations/contract.ts`
- ✅ `src/lib/validations/client.ts`
- ✅ `src/lib/validations/user.ts`

---

### ✅ المهمة 5: إضافة Unit Tests
**الأهمية:** عالية  
**الوقت المقدر:** 1 أسبوع

#### التثبيت:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

#### إعداد Vitest:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

#### مثال: اختبار Permissions System:
```typescript
// src/lib/__tests__/permissions.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hasPermission, hasAllPermissions } from '../permissions';
import { prisma } from '../prisma';

// Mock Prisma
vi.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Permissions System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should grant all permissions to HR_MANAGER', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      role: 'HR_MANAGER',
      jobTitle: null,
    } as any);

    const result = await hasPermission('user-1', 'VIEW_WORKERS');
    expect(result).toBe(true);
  });

  it('should check job title permissions for STAFF', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-2',
      role: 'STAFF',
      jobTitle: {
        id: 'job-1',
        permissions: JSON.stringify(['VIEW_WORKERS', 'CREATE_WORKERS']),
        isActive: true,
      },
    } as any);

    const canView = await hasPermission('user-2', 'VIEW_WORKERS');
    const canDelete = await hasPermission('user-2', 'DELETE_WORKERS');
    
    expect(canView).toBe(true);
    expect(canDelete).toBe(false);
  });
});
```

#### مثال: اختبار Cache System:
```typescript
// src/lib/__tests__/cache.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setCache, getCache, deleteCache } from '../cache';

describe('Cache System', () => {
  it('should return null when Redis is not configured', async () => {
    const result = await getCache('test-key');
    expect(result).toBeNull();
  });

  it('should handle cache set/get operations', async () => {
    const testData = { name: 'Test', value: 123 };
    await setCache('test-key', testData, 60);
    
    const cached = await getCache('test-key');
    expect(cached).toEqual(testData);
  });
});
```

#### Scripts في package.json:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

### ✅ المهمة 6: إضافة Monitoring (Sentry)
**الأهمية:** عالية  
**الوقت المقدر:** 4 ساعات

#### التثبيت:
```bash
npx @sentry/wizard@latest -i nextjs
```

#### التكوين:
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Don't send errors from dev
  enabled: process.env.NODE_ENV === 'production',
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
});
```

#### استخدام في Error Logger:
```typescript
// src/lib/logger.ts (تحديث)
import * as Sentry from '@sentry/nextjs';

export function log(level: LogLevel, message: string, meta?: object) {
  // ... existing code
  
  if (level === 'error' && process.env.NODE_ENV === 'production') {
    Sentry.captureException(new Error(message), {
      extra: meta,
    });
  }
}
```

---

## 🟢 المرحلة 3: التحسينات طويلة المدى (1-3 أشهر)

### ✅ المهمة 7: E2E Testing مع Playwright
**الأهمية:** متوسطة  
**الوقت المقدر:** 2 أسبوع

#### التثبيت:
```bash
npm init playwright@latest
```

#### مثال: اختبار تسجيل الدخول:
```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/login');
  
  await page.fill('[name="identifier"]', 'admin');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('text=مرحباً')).toBeVisible();
});

test('should show error on invalid credentials', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/login');
  
  await page.fill('[name="identifier"]', 'invalid');
  await page.fill('[name="password"]', 'wrong');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('text=بيانات خاطئة')).toBeVisible();
});
```

---

### ✅ المهمة 8: API Documentation
**الأهمية:** متوسطة  
**الوقت المقدر:** 1 أسبوع

#### إنشاء OpenAPI Specification:
```typescript
// src/app/api/docs/route.ts
import { NextResponse } from 'next/server';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'HR System API',
    version: '1.0.0',
    description: 'نظام إدارة الموارد البشرية - API Documentation',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
    {
      url: 'https://your-domain.com/api',
      description: 'Production server',
    },
  ],
  paths: {
    '/workers': {
      get: {
        summary: 'Get all workers',
        tags: ['Workers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'query',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search query',
          },
          {
            name: 'status',
            in: 'query',
            schema: { 
              type: 'string',
              enum: ['AVAILABLE', 'CONTRACTED', 'RESERVED']
            },
          },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Worker',
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        summary: 'Create a new worker',
        tags: ['Workers'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WorkerInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Worker created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Worker',
                },
              },
            },
          },
          400: { description: 'Invalid input' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    // ... more endpoints
  },
  components: {
    schemas: {
      Worker: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          code: { type: 'integer' },
          nationality: { type: 'string' },
          residencyNumber: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date-time' },
          phone: { type: 'string' },
          status: { 
            type: 'string',
            enum: ['AVAILABLE', 'CONTRACTED', 'RESERVED']
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      WorkerInput: {
        type: 'object',
        required: ['name', 'code', 'nationality', 'residencyNumber', 'dateOfBirth', 'phone'],
        properties: {
          name: { type: 'string', minLength: 2 },
          code: { type: 'integer', minimum: 1 },
          nationality: { type: 'string' },
          residencyNumber: { type: 'string', pattern: '^\\d{10}$' },
          dateOfBirth: { type: 'string', format: 'date-time' },
          phone: { type: 'string', pattern: '^05\\d{8}$' },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec);
}
```

#### إضافة Swagger UI:
```bash
npm install swagger-ui-react
```

```tsx
// src/app/api-docs/page.tsx
'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      <SwaggerUI url="/api/docs" />
    </div>
  );
}
```

---

## 📊 متابعة التقدم

### Checklist شامل:

#### المرحلة 1 (1-3 أيام):
- [ ] Error Boundaries
- [ ] تحسين Logger
- [ ] إزالة Implicit Any

#### المرحلة 2 (1-2 أسبوع):
- [ ] Zod Validation
- [ ] Unit Tests
- [ ] Sentry Monitoring

#### المرحلة 3 (1-3 أشهر):
- [ ] E2E Tests
- [ ] API Documentation
- [ ] Performance Dashboard

---

## 🎯 الأولويات الموصى بها

### أولوية عليا (ابدأ بها):
1. ✅ Error Boundaries
2. ✅ Sentry Monitoring
3. ✅ Zod Validation

### أولوية متوسطة (بعد الأولى):
4. ✅ Unit Tests
5. ✅ تحسين Logger
6. ✅ إزالة Any Types

### أولوية منخفضة (للمستقبل):
7. ✅ E2E Tests
8. ✅ API Documentation

---

## 📝 ملاحظات نهائية

- ✅ خذ وقتك في التطبيق
- ✅ اختبر كل تحسين بشكل منفصل
- ✅ راجع الكود بعد كل تغيير
- ✅ وثّق التغييرات في Git commits

**النظام ممتاز حالياً، والتحسينات هي إضافات تزيده قوة!**

---

**تاريخ الإنشاء:** 10 نوفمبر 2025  
**آخر تحديث:** 10 نوفمبر 2025
