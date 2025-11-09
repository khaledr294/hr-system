"use client";

import { Bell, Search, User2, Menu, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Topbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { data: session } = useSession();
  return (
    <div dir="rtl" className="flex items-center justify-between p-3 sm:p-4 gap-2 sm:gap-3 text-right">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-start">
        <button 
          aria-label="فتح القائمة" 
          onClick={onToggleSidebar} 
          className="lg:hidden glass shadow-soft rounded-xl sm:rounded-2xl p-2 hover:bg-white/80 transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        <div className="glass shadow-soft rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 py-2 w-full max-w-xs sm:max-w-xl">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
          <input
            className="bg-transparent outline-none px-2 sm:px-3 py-1 w-full text-slate-700 text-right text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base"
            placeholder="ابحث..."
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="hidden sm:block">
          <DarkModeToggle />
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.98 }}
          className="glass rounded-xl sm:rounded-2xl p-2 shadow-soft hover:shadow-hover hover:bg-white/80 transition-colors"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
        </motion.button>
        <motion.div 
          whileHover={{ scale: 1.03 }} 
          className="glass rounded-xl sm:rounded-2xl p-2 sm:pl-4 flex items-center gap-2 sm:gap-3 shadow-soft hover:bg-white/80 transition-colors"
        >
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl gradient-brand ring-soft" />
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-slate-800 truncate max-w-24">
              {session?.user?.name || session?.user?.email || 'المستخدم'}
            </div>
            <div className="text-xs text-slate-500">{session?.user?.role || 'مدير'}</div>
          </div>
          <User2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.98 }}
          onClick={() => signOut()}
          className="glass rounded-xl sm:rounded-2xl p-2 shadow-soft hover:shadow-hover hover:bg-red-50 transition-colors group"
          title="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 group-hover:text-red-600" />
        </motion.button>
      </div>
    </div>
  );
}
