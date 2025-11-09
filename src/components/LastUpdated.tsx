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

  const date = mounted ? ts.toLocaleDateString(AR_GREG_LOCALE) : '';
  const time = mounted ? ts.toLocaleTimeString(AR_GREG_LOCALE, { hour12: false }) : '';

  return (
    <div className={`flex items-center justify-between ${className ?? ''}`} dir="rtl" suppressHydrationWarning>
      <div className="text-xs text-slate-500 font-semibold" suppressHydrationWarning>
        {mounted && (
          <>آخر تحديث: <span className="text-slate-700">{date} {time}</span></>
        )}
        {!mounted && <span>&nbsp;</span>}
      </div>
      <Button onClick={refresh} size="sm" variant="secondary">تحديث</Button>
    </div>
  );
}
