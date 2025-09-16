"use client";

interface RolePermissionsSummaryProps {
  selectedRole: string;
}

const rolePermissions = {
  HR: {
    label: "مدير الموارد البشرية",
    permissions: [
      "إدارة جميع العاملات والبيانات",
      "تحديد الجنسيات والرواتب",
      "حساب الرواتب الشهرية",
      "إدارة المستخدمين",
      "الوصول لجميع أقسام النظام"
    ],
    color: "bg-blue-50 border-blue-200 text-blue-800"
  },
  GENERAL_MANAGER: {
    label: "المدير العام",
    permissions: [
      "عرض لوحة المعلومات الرئيسية فقط",
      "مراجعة التقارير الإجمالية",
      "مراقبة الأداء العام"
    ],
    color: "bg-purple-50 border-purple-200 text-purple-800"
  },
  MARKETER: {
    label: "مسوق",
    permissions: [
      "إدارة العملاء",
      "إنشاء وإدارة العقود",
      "متابعة طلبات العملاء"
    ],
    color: "bg-green-50 border-green-200 text-green-800"
  },
  STAFF: {
    label: "موظف",
    permissions: [
      "صلاحيات محدودة",
      "عرض البيانات فقط",
      "لا يمكن التعديل أو الإضافة"
    ],
    color: "bg-gray-50 border-gray-200 text-gray-800"
  }
};

export default function RolePermissionsSummary({ selectedRole }: RolePermissionsSummaryProps) {
  if (!selectedRole || !rolePermissions[selectedRole as keyof typeof rolePermissions]) {
    return null;
  }

  const role = rolePermissions[selectedRole as keyof typeof rolePermissions];

  return (
    <div className={`mt-3 p-4 rounded-lg border-2 ${role.color}`}>
      <h4 className="font-semibold mb-2">{role.label}</h4>
      <ul className="text-sm space-y-1">
        {role.permissions.map((permission, index) => (
          <li key={index} className="flex items-start">
            <span className="text-green-600 ml-2">•</span>
            {permission}
          </li>
        ))}
      </ul>
    </div>
  );
}