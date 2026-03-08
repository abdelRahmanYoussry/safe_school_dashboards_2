import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="glass p-6 rounded-2xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:bg-primary/10"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
          
          {trend && (
            <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trend.value >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% 
              <span className="text-muted-foreground font-normal">{trend.label}</span>
            </p>
          )}
        </div>
        
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
