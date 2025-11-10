'use client';

import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export default function TwoFactorSettingsPage() {
  return (
    <div dir="rtl" className="max-w-3xl mx-auto py-12 px-6 space-y-8">
      <header className="flex items-center gap-3">
        <div className="rounded-2xl bg-rose-100 p-3">
          <ShieldOff className="h-6 w-6 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المصادقة الثنائية متوقفة</h1>
          <p className="text-sm text-slate-600">
            تم تعطيل المصادقة الثنائية في النظام، ويمكن تسجيل الدخول عبر اسم المستخدم وكلمة المرور فقط.
          </p>
        </div>
      </header>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">كيف نحافظ على الأمان؟</h2>
        <ul className="list-disc space-y-2 pr-6 text-sm text-slate-700">
          <li>التأكد من استخدام كلمات مرور قوية ومختلفة لكل مستخدم.</li>
          <li>تغيير كلمات المرور بشكل دوري خصوصاً للحسابات الحساسة.</li>
          <li>مراقبة عمليات الدخول غير الاعتيادية من خلال صفحة التقارير.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-700">
        <p>
          في حال الرغبة في إعادة تفعيل المصادقة الثنائية مستقبلاً، يرجى التواصل مع فريق التطوير لإعداد الميزة بشكل
          صحيح لجميع المستخدمين.
        </p>
        <p>
          للعودة إلى الإعدادات العامة، يمكنك زيارة{' '}
          <Link href="/settings" className="font-semibold text-indigo-600 hover:underline">
            صفحة الإعدادات
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
