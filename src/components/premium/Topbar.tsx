"use client";

import { Bell, Search, User2, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Topbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { data: session } = useSession();
  return (
    <div dir="rtl" className="flex items-center justify-between p-4 gap-3 text-right">
      <div className="flex items-center gap-3 flex-1 justify-start">
        <button aria-label="فتح القائمة" onClick={onToggleSidebar} className="lg:hidden glass shadow-soft rounded-2xl p-2">
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        <div className="glass shadow-soft rounded-2xl flex items-center px-4 py-2 w-full max-w-xl">
          <Search className="w-5 h-5 text-slate-500" />
          <input
            className="bg-transparent outline-none px-3 py-1 w-full text-slate-700 text-right"
            placeholder="ابحث في النظام..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
          className="glass rounded-2xl p-2 shadow-soft hover:shadow-hover">
          <Bell className="w-5 h-5 text-slate-700" />
        </motion.button>
        <motion.div whileHover={{ scale: 1.03 }} className="glass rounded-2xl p-2 pl-4 flex items-center gap-3 shadow-soft">
          <div className="w-9 h-9 rounded-xl gradient-brand ring-soft" />
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-800">{session?.user?.name || session?.user?.email || 'المستخدم'}</div>
            <div className="text-xs text-slate-500">{session?.user?.role || 'مدير'}</div>
          </div>
          <User2 className="w-5 h-5 text-slate-600" />
        </motion.div>
      </div>
    </div>
  );
}
