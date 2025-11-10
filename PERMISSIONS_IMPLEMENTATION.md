# اختبار نظام الصلاحيات

تم تطبيق نظام التحقق من الصلاحيات على جميع API Endpoints الرئيسية:

## ✅ Workers API
- `GET /api/workers` - يتطلب VIEW_WORKERS
- `POST /api/workers` - يتطلب CREATE_WORKERS
- `GET /api/workers/[id]` - يتطلب VIEW_WORKERS
- `PUT /api/workers/[id]` - يتطلب EDIT_WORKERS
- `DELETE /api/workers/[id]` - يتطلب DELETE_WORKERS

## ✅ Contracts API
- `GET /api/contracts` - يتطلب VIEW_CONTRACTS
- `POST /api/contracts` - يتطلب CREATE_CONTRACTS
- `PATCH /api/contracts/[id]` - يتطلب EDIT_CONTRACTS
- `DELETE /api/contracts/[id]` - يتطلب DELETE_CONTRACTS

## ✅ Clients API
- `GET /api/clients` - يتطلب VIEW_CLIENTS
- `POST /api/clients` - يتطلب CREATE_CLIENTS
- `GET /api/clients/[id]` - يتطلب VIEW_CLIENTS
- `PUT /api/clients/[id]` - يتطلب EDIT_CLIENTS
- `DELETE /api/clients/[id]` - يتطلب DELETE_CLIENTS

## ✅ Users API
- `POST /api/users` - يتطلب CREATE_USERS
- `PUT /api/users/[id]` - يتطلب EDIT_USERS
- `DELETE /api/users/[id]` - يتطلب DELETE_USERS

## ✅ Pages
- `/workers` - يتطلب VIEW_WORKERS

## الملفات التي تم إنشاؤها
1. `src/lib/permission-middleware.ts` - دوال مساعدة للتحقق من الصلاحيات
2. `src/app/403/page.tsx` - صفحة عدم وجود صلاحية

## كيفية الاختبار
1. قم بتسجيل الدخول كمستخدم ذو صلاحيات محدودة
2. حاول الوصول لصفحة أو API ليس لديك صلاحية لها
3. يجب أن ترى:
   - في الصفحات: إعادة توجيه لصفحة 403
   - في API: رسالة خطأ 403 Forbidden

## الخطوات التالية
- [ ] حماية باقي الصفحات (contracts, clients, users, reports)
- [ ] تحديث Sidebar لإخفاء الروابط غير المصرح بها
- [ ] حماية API endpoints الإضافية (archive, reports, etc.)
