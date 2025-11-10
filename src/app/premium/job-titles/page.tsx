"use client";

import { useState, useEffect } from "react";
import { Briefcase, Plus, Edit, Trash2, Save, X, Shield, Users, CheckCircle, Circle } from "lucide-react";

interface JobTitle {
  id: string;
  name: string;
  nameAr: string;
  description: string | null;
  permissions: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

// الصلاحيات المتاحة
const AVAILABLE_PERMISSIONS = [
  { id: "VIEW_WORKERS", label: "عرض العمال", category: "workers", icon: "👁️" },
  { id: "CREATE_WORKERS", label: "إضافة عمال", category: "workers", icon: "➕" },
  { id: "EDIT_WORKERS", label: "تعديل العمال", category: "workers", icon: "✏️" },
  { id: "DELETE_WORKERS", label: "حذف العمال", category: "workers", icon: "🗑️" },
  { id: "RESERVE_WORKERS", label: "حجز العاملات", category: "workers", icon: "🔒" },
  
  { id: "VIEW_CONTRACTS", label: "عرض العقود", category: "contracts", icon: "👁️" },
  { id: "CREATE_CONTRACTS", label: "إنشاء عقود", category: "contracts", icon: "➕" },
  { id: "EDIT_CONTRACTS", label: "تعديل العقود", category: "contracts", icon: "✏️" },
  { id: "DELETE_CONTRACTS", label: "حذف العقود", category: "contracts", icon: "🗑️" },
  
  { id: "VIEW_CLIENTS", label: "عرض العملاء", category: "clients", icon: "👁️" },
  { id: "CREATE_CLIENTS", label: "إضافة عملاء", category: "clients", icon: "➕" },
  { id: "EDIT_CLIENTS", label: "تعديل العملاء", category: "clients", icon: "✏️" },
  { id: "DELETE_CLIENTS", label: "حذف العملاء", category: "clients", icon: "🗑️" },
  
  { id: "VIEW_USERS", label: "عرض المستخدمين", category: "users", icon: "👁️" },
  { id: "CREATE_USERS", label: "إضافة مستخدمين", category: "users", icon: "➕" },
  { id: "EDIT_USERS", label: "تعديل المستخدمين", category: "users", icon: "✏️" },
  { id: "DELETE_USERS", label: "حذف المستخدمين", category: "users", icon: "🗑️" },
  
  { id: "VIEW_REPORTS", label: "عرض التقارير", category: "reports", icon: "📊" },
  { id: "EXPORT_DATA", label: "تصدير البيانات", category: "reports", icon: "💾" },
  
  { id: "VIEW_LOGS", label: "عرض السجلات", category: "system", icon: "📋" },
  { id: "MANAGE_SETTINGS", label: "إدارة الإعدادات", category: "system", icon: "⚙️" },
  { id: "MANAGE_JOB_TITLES", label: "إدارة المسميات الوظيفية", category: "system", icon: "💼" },
];

const PERMISSION_CATEGORIES = {
  workers: { label: "العمال", icon: "👷", color: "blue" },
  contracts: { label: "العقود", icon: "📄", color: "purple" },
  clients: { label: "العملاء", icon: "👥", color: "green" },
  users: { label: "المستخدمين", icon: "🔐", color: "orange" },
  reports: { label: "التقارير", icon: "📊", color: "pink" },
  system: { label: "النظام", icon: "⚙️", color: "gray" },
};

export default function JobTitlesPage() {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    description: "",
    permissions: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    fetchJobTitles();
  }, []);

  const fetchJobTitles = async () => {
    try {
      const response = await fetch("/api/job-titles");
      if (response.ok) {
        const data = await response.json();
        setJobTitles(data);
      }
    } catch (error) {
      console.error("Error fetching job titles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/job-titles/${editingId}` : "/api/job-titles";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchJobTitles();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error saving job title:", error);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المسمى الوظيفي؟")) return;

    try {
      const response = await fetch(`/api/job-titles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchJobTitles();
      } else {
        const error = await response.json();
        alert(error.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error deleting job title:", error);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleEdit = (jobTitle: JobTitle) => {
    setEditingId(jobTitle.id);
    setFormData({
      name: jobTitle.name,
      nameAr: jobTitle.nameAr,
      description: jobTitle.description || "",
      permissions: JSON.parse(jobTitle.permissions),
      isActive: jobTitle.isActive,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setCurrentStep(1);
    setFormData({
      name: "",
      nameAr: "",
      description: "",
      permissions: [],
      isActive: true,
    });
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", hover: "hover:bg-blue-100" },
      purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", hover: "hover:bg-purple-100" },
      green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", hover: "hover:bg-green-100" },
      orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", hover: "hover:bg-orange-100" },
      pink: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", hover: "hover:bg-pink-100" },
      gray: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", hover: "hover:bg-gray-100" },
    };
    return colors[color] || colors.gray;
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const selectAllInCategory = (category: string) => {
    const categoryPerms = AVAILABLE_PERMISSIONS
      .filter((p) => p.category === category)
      .map((p) => p.id);
    
    const allSelected = categoryPerms.every((p) => formData.permissions.includes(p));
    
    if (allSelected) {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => !categoryPerms.includes(p)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPerms])],
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">المسميات الوظيفية</h1>
            <p className="text-sm text-gray-600">إدارة المسميات الوظيفية والصلاحيات</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة مسمى وظيفي</span>
        </button>
      </div>

      {/* Job Titles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobTitles.map((jobTitle) => {
          const permissions = JSON.parse(jobTitle.permissions);
          return (
            <div
              key={jobTitle.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{jobTitle.nameAr}</h3>
                  <p className="text-sm text-gray-500">{jobTitle.name}</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  jobTitle.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {jobTitle.isActive ? "نشط" : "غير نشط"}
                </div>
              </div>

              {jobTitle.description && (
                <p className="text-sm text-gray-600 mb-3">{jobTitle.description}</p>
              )}

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>{permissions.length} صلاحية</span>
                </div>
                {jobTitle._count && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{jobTitle._count.users} مستخدم</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(jobTitle)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDelete(jobTitle.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  disabled={jobTitle._count && jobTitle._count.users > 0}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal - Improved Design */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-8">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? "تعديل مسمى وظيفي" : "إضافة مسمى وظيفي جديد"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentStep === 1 ? "أدخل البيانات الأساسية" : "اختر الصلاحيات المناسبة"}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Steps Indicator */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    currentStep === 1 ? 'bg-purple-600 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {currentStep === 1 ? '1' : '✓'}
                  </div>
                  <span className={`text-sm font-medium ${currentStep === 1 ? 'text-purple-600' : 'text-gray-600'}`}>
                    البيانات الأساسية
                  </span>
                </div>
                <div className={`flex-1 h-0.5 ${currentStep === 2 ? 'bg-purple-600' : 'bg-gray-300'}`} />
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    currentStep === 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    2
                  </div>
                  <span className={`text-sm font-medium ${currentStep === 2 ? 'text-purple-600' : 'text-gray-400'}`}>
                    الصلاحيات
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {currentStep === 1 ? (
                /* Step 1: Basic Info */
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        الاسم بالعربية <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nameAr}
                        onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="مثال: مدير قسم الموارد البشرية"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        الاسم بالإنجليزية <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Example: HR Department Manager"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      الوصف
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                      rows={4}
                      placeholder="وصف المسمى الوظيفي ومسؤولياته..."
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">
                      نشط (يمكن اختياره عند إضافة مستخدم جديد)
                    </label>
                  </div>
                </div>
              ) : (
                /* Step 2: Permissions */
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-bold text-gray-900">الصلاحيات المحددة</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-purple-600">{formData.permissions.length}</span>
                      <span className="text-gray-600">من أصل {AVAILABLE_PERMISSIONS.length} صلاحية</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(PERMISSION_CATEGORIES).map(([category, info]) => {
                      const categoryPerms = AVAILABLE_PERMISSIONS.filter((p) => p.category === category);
                      const selectedCount = categoryPerms.filter((p) => formData.permissions.includes(p.id)).length;
                      const allSelected = selectedCount === categoryPerms.length;
                      const colors = getColorClasses(info.color);
                      
                      return (
                        <div key={category} className={`p-5 border-2 rounded-2xl ${colors.border} ${colors.bg}`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{info.icon}</span>
                              <div>
                                <h4 className="font-bold text-gray-800">{info.label}</h4>
                                <p className="text-xs text-gray-600">{selectedCount}/{categoryPerms.length} محددة</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => selectAllInCategory(category)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                allSelected
                                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  : `${colors.bg} ${colors.text} ${colors.hover} border ${colors.border}`
                              }`}
                            >
                              {allSelected ? 'إلغاء الكل' : 'تحديد الكل'}
                            </button>
                          </div>
                          <div className="space-y-2">
                            {categoryPerms.map((permission) => {
                              const isSelected = formData.permissions.includes(permission.id);
                              return (
                                <button
                                  key={permission.id}
                                  type="button"
                                  onClick={() => togglePermission(permission.id)}
                                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                    isSelected
                                      ? 'bg-white shadow-sm border-2 border-purple-300'
                                      : 'bg-white/50 border-2 border-transparent hover:border-gray-300'
                                  }`}
                                >
                                  {isSelected ? (
                                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  )}
                                  <span className="text-sm mr-1">{permission.icon}</span>
                                  <span className={`text-sm font-medium text-right ${
                                    isSelected ? 'text-gray-900' : 'text-gray-600'
                                  }`}>
                                    {permission.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
              <div className="flex justify-between items-center">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    ← السابق
                  </button>
                )}
                <div className={`flex gap-3 ${currentStep === 1 ? 'mr-auto' : ''}`}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all"
                  >
                    إلغاء
                  </button>
                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.name || !formData.nameAr) {
                          alert('الرجاء إدخال الاسم بالعربية والإنجليزية');
                          return;
                        }
                        setCurrentStep(2);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                      التالي: اختيار الصلاحيات →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                      <Save className="w-5 h-5" />
                      {editingId ? "حفظ التغييرات" : "إنشاء المسمى الوظيفي"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

