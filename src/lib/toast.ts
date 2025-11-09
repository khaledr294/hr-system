import toast from 'react-hot-toast';

// نجاح
export const showSuccess = (message: string) => {
  toast.success(message, {
    icon: '✅',
  });
};

// خطأ
export const showError = (message: string) => {
  toast.error(message, {
    icon: '❌',
  });
};

// تحميل
export const showLoading = (message: string) => {
  return toast.loading(message);
};

// تحديث Toast موجود
export const updateToast = (toastId: string, type: 'success' | 'error', message: string) => {
  if (type === 'success') {
    toast.success(message, { id: toastId });
  } else {
    toast.error(message, { id: toastId });
  }
};

// معلومات
export const showInfo = (message: string) => {
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
    },
  });
};

// تحذير
export const showWarning = (message: string) => {
  toast(message, {
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
    },
  });
};

// Toast مخصص مع Promise
export const showPromise = async <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
): Promise<T> => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
};

// مثال الاستخدام:
// import { showSuccess, showError, showPromise } from '@/lib/toast';
//
// showSuccess('تم الحفظ بنجاح');
// showError('حدث خطأ');
//
// await showPromise(
//   fetchData(),
//   {
//     loading: 'جاري التحميل...',
//     success: 'تم التحميل بنجاح',
//     error: 'فشل التحميل'
//   }
// );
