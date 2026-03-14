import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminSidebar } from "./AdminSidebar";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export const PageTransition = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`h-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export function AdminLayout({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex-shrink-0 glass flex items-center justify-between px-8 border-b border-black/[0.07] z-10">
          <div className="flex items-center flex-1">
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("Search students, staff, pickups...")}
                className="pl-9 bg-black/[0.03] border-black/10 focus-visible:ring-[#002626]/50 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-black/[0.04]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-background"></span>
            </button>
            <Link href="/admin/settings">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-black/[0.04] rtl:ml-2">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 relative">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
