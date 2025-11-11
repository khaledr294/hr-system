'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyState from '@/components/ui/empty-state';
import { motion } from 'framer-motion';
import { Database, Download, Upload, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Backup {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  status: 'completed' | 'inProgress' | 'failed';
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

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
        <Button onClick={createBackup} disabled={creating} variant="primary">
          <div className="flex items-center gap-2">
            {creating ? <LoadingSpinner size="sm" /> : <Upload className="w-5 h-5" />}
            <span>{creating ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية'}</span>
          </div>
        </Button>
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
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

