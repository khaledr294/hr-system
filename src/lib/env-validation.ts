/**
 * التحقق من متغيرات البيئة المطلوبة
 */
export function validateEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `المتغيرات البيئية المطلوبة مفقودة: ${missingVars.join(', ')}`
    );
  }

  // التحقق من صحة قاعدة البيانات
  if (!process.env.DATABASE_URL?.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL يجب أن يكون PostgreSQL connection string');
  }

  // التحقق من طول NEXTAUTH_SECRET
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    console.warn('NEXTAUTH_SECRET يجب أن يكون على الأقل 32 حرف للأمان الأمثل');
  }

  console.log('✅ جميع متغيرات البيئة صحيحة');
}

/**
 * الحصول على معلومات البيئة
 */
export function getEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    nextVersion: process.env.npm_package_version,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    databaseConnected: !!process.env.DATABASE_URL,
    authConfigured: !!process.env.NEXTAUTH_SECRET,
  };
}