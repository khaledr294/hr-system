"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AR_GREG_LOCALE } from "@/lib/date";
import Button from "@/components/ui/Button";

export default function LastUpdated({ className }: { className?: string }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [ts, setTs] = useState<Date>(new Date());

  // Only show content after client hydration
  useEffect(() => {
    setMounted(true);
    setTs(new Date());
  }, []);

  const refresh = () => {
    setTs(new Date());
    router.refresh();
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  const date = ts.toLocaleDateString(AR_GREG_LOCALE);
  const time = ts.toLocaleTimeString(AR_GREG_LOCALE, { hour12: false });

  return (
    <div className={`flex items-center justify-between ${className ?? ''}`} dir="rtl">
      <div className="text-xs text-slate-500 font-semibold">
        آخر تحديث: <span className="text-slate-700">{date} {time}</span>
      </div>
      <Button onClick={refresh} size="sm" variant="secondary">تحديث</Button>
    </div>
  );
}
