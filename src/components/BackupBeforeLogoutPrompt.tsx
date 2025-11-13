"use client";

import { useEffect } from 'react';

export default function BackupBeforeLogoutPrompt() {

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

  return null; // يمكن إضافة UI لاحقاً
}
