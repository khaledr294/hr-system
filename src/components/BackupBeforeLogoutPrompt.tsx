"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Download, AlertCircle } from 'lucide-react';

export default function BackupBeforeLogoutPrompt() {
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    // اعتراض محاولة تسجيل الخروج
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'هل ترغب في إنشاء نسخة احتياطية قبل الخروج؟';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const createBackup = async () => {
    try {
      setIsCreatingBackup(true);
      
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // تحويل Base64 إلى Blob وتنزيله
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/gzip' });
        
        // تنزيل الملف
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.backup.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('تم إنشاء النسخة الاحتياطية وتنزيلها بنجاح!');
      } else {
        alert('فشل في إنشاء النسخة الاحتياطية');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('حدث خطأ أثناء إنشاء النسخة الاحتياطية');
    } finally {
      setIsCreatingBackup(false);
      setShowPrompt(false);
    }
  };

  return null; // يمكن إضافة UI لاحقاً
}
