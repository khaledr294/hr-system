"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";

interface ArchiveExpiredButtonProps {
  count: number;
}

export default function ArchiveExpiredButton({ count }: ArchiveExpiredButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleArchive = async () => {
    if (!confirm(`هل تريد نقل ${count} عقد منتهي إلى الأرشيف؟`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/contracts/archive-expired", {
        method: "POST"
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || `تم نقل ${data.archivedCount} عقد إلى الأرشيف`);
        router.refresh();
      } else {
        alert(data.error || "حدث خطأ أثناء نقل العقود");
      }
    } catch (error) {
      alert("حدث خطأ أثناء نقل العقود");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleArchive}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-slate-900"
    >
      <Archive className="w-5 h-5" />
      {loading ? "جاري النقل..." : `أرشفة العقود المنتهية (${count})`}
    </button>
  );
}
