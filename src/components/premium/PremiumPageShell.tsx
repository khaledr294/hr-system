"use client";

import { useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function PremiumPageShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto p-3 md:p-6">
        <div dir="ltr" className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div dir="rtl" className="glass rounded-3xl shadow-soft overflow-hidden order-1 text-right">
            <Topbar onToggleSidebar={() => setMobileOpen(true)} />
            <div className="px-4 pb-6">
              {title && (
                <div className="mb-4">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gradient">{title}</h1>
                </div>
              )}
              <div className="card-premium rounded-2xl shadow-soft p-4">
                {children}
              </div>
            </div>
          </div>

          <div dir="rtl" className="order-2 hidden lg:block text-right">
            <Sidebar />
          </div>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-900/50" onClick={() => setMobileOpen(false)} />}
        {mobileOpen && (
          <SheetContent side="right" className="z-50">
            <SheetHeader>
              <SheetTitle>القائمة</SheetTitle>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}

