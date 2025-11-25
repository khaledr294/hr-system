"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PackageBonus {
  packageName: string;
  bonusAmount: number;
  enabled: boolean;
}

export default function MarketerBonusSettings() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackageBonus, setNewPackageBonus] = useState(50);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/marketer-bonus');
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const importPackages = async () => {
    setImporting(true);
    try {
      const response = await fetch('/api/packages');
      if (response.ok) {
        const allPackages = await response.json();
        
        // Add packages that don't already exist
        const newPackages = [...packages];
        let addedCount = 0;
        
        allPackages.forEach((pkg: { name: string }) => {
          const exists = packages.some(p => 
            p.packageName.toLowerCase() === pkg.name.toLowerCase()
          );
          
          if (!exists) {
            newPackages.push({
              packageName: pkg.name,
              bonusAmount: 50,
              enabled: true,
            });
            addedCount++;
          }
        });
        
        setPackages(newPackages);
        alert(`تم استيراد ${addedCount} باقة جديدة`);
      }
    } catch (error) {
      console.error('Error importing packages:', error);
      alert('حدث خطأ أثناء استيراد الباقات');
    } finally {
      setImporting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/marketer-bonus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packages }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('تم حفظ الإعدادات بنجاح');
      } else {
        console.error('Save failed:', data);
        alert(`فشل في حفظ الإعدادات: ${data.details || data.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const addPackage = () => {
    if (!newPackageName.trim()) {
      alert('يرجى إدخال اسم الباقة');
      return;
    }

    if (packages.some(p => p.packageName === newPackageName.trim())) {
      alert('هذه الباقة موجودة بالفعل');
      return;
    }

    setPackages([...packages, {
      packageName: newPackageName.trim(),
      bonusAmount: newPackageBonus,
      enabled: true,
    }]);
    setNewPackageName('');
    setNewPackageBonus(50);
  };

  const removePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const togglePackage = (index: number) => {
    setPackages(packages.map((pkg, i) => 
      i === index ? { ...pkg, enabled: !pkg.enabled } : pkg
    ));
  };

  const updateBonus = (index: number, amount: number) => {
    setPackages(packages.map((pkg, i) => 
      i === index ? { ...pkg, bonusAmount: amount } : pkg
    ));
  };

  if (loading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إعدادات بونص المسوقين</h1>
        <p className="text-gray-600 mt-2">
          حدد الباقات المؤهلة لاحتساب البونص الشهري للمسوقين وقيمة البونص لكل باقة
        </p>
      </div>

      {/* Add New Package */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">إضافة باقة جديدة</h2>
          <button
            onClick={importPackages}
            disabled={importing}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
          >
            {importing ? 'جاري الاستيراد...' : '📥 استيراد من الباقات'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم الباقة</label>
            <input
              type="text"
              value={newPackageName}
              onChange={(e) => setNewPackageName(e.target.value)}
              placeholder="مثال: خادمة منزلية"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">قيمة البونص (ريال)</label>
            <input
              type="number"
              value={newPackageBonus}
              onChange={(e) => setNewPackageBonus(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addPackage}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              إضافة يدوياً
            </button>
          </div>
        </div>
      </div>

      {/* Packages List */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">الباقات المؤهلة للبونص</h2>
        
        {packages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا توجد باقات مضافة بعد</p>
        ) : (
          <div className="space-y-3">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 border rounded-lg ${
                  pkg.enabled ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={pkg.enabled}
                  onChange={() => togglePackage(index)}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{pkg.packageName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">البونص:</label>
                  <input
                    type="number"
                    value={pkg.bonusAmount}
                    onChange={(e) => updateBonus(index, parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span className="text-sm text-gray-600">ريال</span>
                </div>
                <button
                  onClick={() => removePackage(index)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          إلغاء
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>
    </div>
  );
}
