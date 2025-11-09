"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteUserButtonProps {
  userId: string;
}

export default function DeleteUserButton({ userId }: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
        setShowConfirm(false);
      } else {
        alert('حدث خطأ أثناء حذف المستخدم');
      }
    } catch {
      alert('حدث خطأ أثناء حذف المستخدم');
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1 bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 border-2 border-slate-900"
        >
          {isDeleting ? "جاري الحذف..." : "تأكيد"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1 bg-slate-500 text-white text-sm font-bold hover:bg-slate-600 border-2 border-slate-900"
        >
          إلغاء
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-800 text-sm font-bold border-b-2 border-transparent hover:border-red-600"
    >
      حذف
    </button>
  );
}
