import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  School, 
  BarChart3, 
  ShieldAlert, 
  Ticket, 
  CreditCard, 
  ClipboardList, 
  Map as MapIcon,
  Bell,
  Search,
  Settings,
  ChevronRight,
  UserCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Schools", href: "/schools", icon: School },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Safety Reports", href: "/safety-reports", icon: ShieldAlert },
  { label: "Tickets", href: "/tickets", icon: Ticket },
  { label: "Plans", href: "/plans", icon: CreditCard },
  { label: "Audit Logs", href: "/audit-logs", icon: ClipboardList },
  { label: "Map View", href: "/map", icon: MapIcon },
];

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

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 flex-shrink-0 flex flex-col glass-panel border-r z-20"
      >
        <div className="h-16 flex items-center px-6 border-b border-white/[0.05]">
          <div className="flex items-center gap-3 text-foreground font-semibold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            Safe School
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Platform Admin
          </div>
          
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                  ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}
                `}>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <Avatar className="w-9 h-9 border border-white/10">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Super Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@safeschool.app</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 flex-shrink-0 glass flex items-center justify-between px-8 border-b z-10">
          <div className="flex items-center flex-1">
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search schools, users, tickets..." 
                className="pl-9 bg-white/5 border-white/10 focus-visible:ring-primary/50 h-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-background"></span>
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/5">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
