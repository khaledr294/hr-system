'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyState from '@/components/ui/empty-state';
import { motion } from 'framer-motion';
import { Database, Download, Upload, Clock, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface Backup {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  status: 'completed' | 'inProgress' | 'failed';
}

export default function BackupsPage() {
    // حذف نسخة احتياطية
    const handleDeleteBackup = async (backupId: string) => {
      if (!confirm('هل أنت متأكد أنك تريد حذف هذه النسخة الاحتياطية؟')) return;
      try {
        const response = await fetch(`/api/backups/${backupId}`, { method: 'DELETE' });
        if (!response.ok) {
          const data = await response.json();
          alert('فشل حذف النسخة الاحتياطية: ' + (data.error || response.statusText));
          return;
        }
        setBackups(backups => backups.filter(b => b.id !== backupId));
      } catch (error) {
        alert('حدث خطأ أثناء حذف النسخة الاحتياطية');
      }
    };
  const router = useRouter();
  const { data: session, status } = useSession();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');

  // التحقق من الصلاحيات
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const userRole = session.user.role;
    if (userRole !== 'HR_MANAGER' && userRole !== 'GENERAL_MANAGER') {
      router.push('/unauthorized');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchBackups();
    }
  }, [session]);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backups');
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في إنشاء نسخة احتياطية؟ سيتم تنزيل الملف مباشرة على جهازك.')) return;
    
    setCreating(true);
    try {
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Backup created:', result);
        
        // تنزيل الملف
        if (result.data) {
          const byteCharacters = atob(result.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/gzip' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = result.backup.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
        
        await fetchBackups();
        alert('تم إنشاء النسخة الاحتياطية وتنزيلها بنجاح!');
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ أثناء إنشاء النسخة الاحتياطية');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('حدث خطأ أثناء إنشاء النسخة الاحتياطية: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
    } finally {
      setCreating(false);
    }
  };

  const handleExportDatabase = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/backups/export-database');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `database-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('✅ تم تصدير قاعدة البيانات بنجاح!');
      } else {
        alert('❌ فشل تصدير قاعدة البيانات');
      }
    } catch (error) {
      console.error('Error exporting database:', error);
      alert('حدث خطأ أثناء تصدير قاعدة البيانات');
    } finally {
      setExporting(false);
    }
  };


  const downloadBackup = async (backupId: string, filename: string) => {
    try {
      const response = await fetch(`/api/backups?id=${backupId}&action=download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
    }
  };

  const handleRestoreClick = (backupId: string) => {
    setSelectedBackupId(backupId);
    setConfirmationCode('');
    setShowRestoreModal(true);
  };

  const handleRestoreConfirm = async () => {
    if (confirmationCode !== 'RESTORE') {
      alert('يرجى كتابة RESTORE للتأكيد');
      return;
    }

    if (!selectedBackupId) return;

    setRestoring(selectedBackupId);
    try {
      const response = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupId: selectedBackupId,
          confirmationCode,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        let msg = `✅ ${result.message}`;
        if (result.errors) {
          if (result.errors.workers?.length) {
            msg += `\n\n❗️ أخطاء استعادة العاملات:`;
            msg += '\n' + result.errors.workers.join('\n');
          }
          if (result.errors.contracts?.length) {
            msg += `\n\n❗️ أخطاء استعادة العقود:`;
            msg += '\n' + result.errors.contracts.join('\n');
          }
        }
        alert(msg);
        setShowRestoreModal(false);
        router.refresh();
      } else {
        const error = await response.text();
        alert(`❌ فشلت عملية الاستعادة: ${error}`);
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('حدث خطأ أثناء استعادة النسخة الاحتياطية');
    } finally {
      setRestoring(null);
      setSelectedBackupId(null);
      setConfirmationCode('');
    }
  };

  const handleUploadBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.gz')) {
      alert('يرجى اختيار ملف نسخة احتياطية بصيغة .gz');
      return;
    }

    if (!confirm(`هل تريد رفع النسخة الاحتياطية: ${file.name}؟`)) {
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/backups/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ تم رفع النسخة الاحتياطية بنجاح: ${result.backup.filename}`);
        await fetchBackups();
        event.target.value = '';
      } else {
        const error = await response.text();
        alert(`❌ فشل رفع النسخة الاحتياطية: ${error}`);
      }
    } catch (error) {
      console.error('Error uploading backup:', error);
      alert('حدث خطأ أثناء رفع النسخة الاحتياطية');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inProgress': return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'inProgress': return 'جاري الإنشاء';
      case 'failed': return 'فشلت';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="جاري التحميل..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-100 rounded-lg">
            <Database className="w-8 h-8 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">النسخ الاحتياطي</h1>
            <p className="text-gray-500">إدارة النسخ الاحتياطية لقاعدة البيانات</p>
          </div>
        </div>
        <div className="flex gap-3">
          <label htmlFor="upload-backup" className="cursor-pointer">
            <div className={`inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
              uploading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}>
              <div className="flex items-center gap-2">
                {uploading ? <LoadingSpinner size="sm" /> : <Download className="w-5 h-5" />}
                <span>{uploading ? 'جاري الرفع...' : 'رفع نسخة احتياطية'}</span>
              </div>
            </div>
          </label>
          <input
            id="upload-backup"
            type="file"
            accept=".gz"
            onChange={handleUploadBackup}
            className="hidden"
            disabled={uploading}
          />
          {session?.user?.role === 'HR_MANAGER' && (
            <Button onClick={handleExportDatabase} disabled={exporting} variant="secondary">
              <div className="flex items-center gap-2">
                {exporting ? <LoadingSpinner size="sm" /> : <Database className="w-5 h-5" />}
                <span>{exporting ? 'جاري التصدير...' : 'تصدير قاعدة البيانات (Excel)'}</span>
              </div>
            </Button>
          )}
          <Button onClick={createBackup} disabled={creating} variant="primary">
            <div className="flex items-center gap-2">
              {creating ? <LoadingSpinner size="sm" /> : <Upload className="w-5 h-5" />}
              <span>{creating ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية'}</span>
            </div>
          </Button>
        </div>
      </motion.div>

      {/* Backups List */}
      {backups.length === 0 ? (
        <EmptyState
          icon={Database}
          title="لا توجد نسخ احتياطية"
          description="قم بإنشاء أول نسخة احتياطية للبدء"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {backups.map((backup, index) => (
            <motion.div
              key={backup.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-cyan-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(backup.status)}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {backup.filename}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      <span>{formatSize(backup.size)}</span>
                      <span>•</span>
                      <span>{formatDate(backup.createdAt)}</span>
                      <span>•</span>
                      <span>{getStatusLabel(backup.status)}</span>
                    </div>
                  </div>
                </div>
                {backup.status === 'completed' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRestoreClick(backup.id)}
                      variant="secondary"
                      size="sm"
                      disabled={restoring !== null}
                    >
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        <span>{restoring === backup.id ? 'جاري الاستعادة...' : 'استعادة'}</span>
                      </div>
                    </Button>
                    <Button
                      onClick={() => downloadBackup(backup.id, backup.filename)}
                      variant="secondary"
                      size="sm"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span>تحميل</span>
                      </div>
                    </Button>
                    <Button
                      onClick={() => handleDeleteBackup(backup.id)}
                      variant="danger"
                      size="sm"
                      disabled={restoring !== null}
                    >
                      <div className="flex items-center gap-2">
                        <span>حذف</span>
                      </div>
                    </Button>

                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              تحذير: استعادة النسخة الاحتياطية
            </h3>
            <div className="space-y-4 mb-6">
              <p className="text-gray-700">
                ⚠️ <strong>تحذير:</strong> هذا الإجراء خطير!
              </p>
              <ul className="list-disc pr-5 text-sm text-gray-600 space-y-1">
                <li>سيتم حذف جميع البيانات الحالية (العاملات، العملاء، العقود)</li>
                <li>سيتم استبدالها ببيانات النسخة الاحتياطية المحددة</li>
                <li>سيتم إنشاء نسخة احتياطية تلقائية قبل الاستعادة</li>
                <li>لا يمكن التراجع عن هذا الإجراء بعد تنفيذه</li>
              </ul>
              <p className="text-gray-700 font-medium">
                للتأكيد، اكتب: <span className="text-red-600 font-bold">RESTORE</span>
              </p>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="اكتب RESTORE للتأكيد"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-red-500 focus:outline-none text-center font-mono text-lg"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackupId(null);
                  setConfirmationCode('');
                }}
                variant="secondary"
                disabled={restoring !== null}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleRestoreConfirm}
                variant="primary"
                disabled={confirmationCode !== 'RESTORE' || restoring !== null}
                className="bg-red-600 hover:bg-red-700"
              >
                {restoring ? 'جاري الاستعادة...' : 'تأكيد الاستعادة'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

