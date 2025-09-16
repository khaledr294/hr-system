// مكتبة لإدارة الباقات والخدمات بشكل مؤقت (يمكن استبدالها بقاعدة بيانات لاحقاً)
export type ContractPackage = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

// بيانات افتراضية
export const defaultPackages: ContractPackage[] = [
  { id: 'monthly', name: 'شهري', duration: 30, price: 1000 },
  { id: 'quarterly', name: 'ربع سنوي', duration: 90, price: 2700 },
  { id: 'yearly', name: 'سنوي', duration: 365, price: 10000 },
];

// دالة لجلب الباقات (يمكن تعديلها لجلب من قاعدة البيانات)
export function getPackages(): ContractPackage[] {
  // هنا يمكن إضافة جلب من localStorage أو API
  return defaultPackages;
}
