import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Kanban,
  Bus,
  QrCode,
  Settings,
  ShieldCheck,
  LogOut,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Staff", href: "/admin/staff", icon: UserCheck },
  { label: "Pickup Pipeline", href: "/admin/pickup", icon: Kanban },
  { label: "Transportation", href: "/admin/transportation", icon: Bus },
  { label: "Invitation Codes", href: "/admin/invitations", icon: QrCode },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { t } = useTranslation();

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 flex-shrink-0 flex flex-col glass-item border-r border-black/[0.06] z-20"
    >
      <div className="h-16 flex items-center px-6 border-b border-black/[0.06]">
        <div className="flex items-center gap-3 text-foreground font-semibold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#002626] to-[#045655] flex items-center justify-center shadow-lg shadow-[#002626]/20">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          School Hub
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          {t('School Management')}
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="block">
              <div className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                ${isActive ? 'bg-[#002626]/10 text-[#002626] font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}
              `}>
                {isActive && (
                  <motion.div
                    layoutId="activeNavAdmin"
                    className="absolute left-0 w-1 h-6 bg-[#002626] rounded-r-full"
                  />
                )}
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#002626]' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className="text-sm">{t(item.label)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-black/[0.06] space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/[0.04] cursor-pointer transition-colors group">
          <Avatar className="w-9 h-9 border border-black/10 group-hover:border-[#002626]/50 transition-colors">
            <AvatarFallback className="bg-[#002626]/10 text-[#002626] text-xs font-bold">
            {user?.email?.substring(0, 2).toUpperCase() || 'SA'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {user?.role?.toLowerCase() === 'school_admin' ? t('School Admin') : t('Staff')}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-10 px-3"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">{t('Sign Out')}</span>
        </Button>
      </div>
    </motion.aside>
  );
}
