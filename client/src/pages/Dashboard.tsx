import { PageTransition } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import { useDashboardStats, useAnalytics } from "@/hooks/use-dashboard";
import {
  School, Users, Activity, ShieldAlert, HeartPulse,
  UserCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { t } = useTranslation();

  return (
    <PageTransition className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("Platform Overview")}</h1>
        <p className="text-muted-foreground mt-1">{t("Real-time pulse of the Safe School network.")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl bg-black/[0.04]" />)
        ) : stats ? (
          <>
            <StatCard delay={0.1} title={t("Total Schools")} value={stats.totalSchools} icon={School} />
            <StatCard delay={0.15} title={t("Total Users")} value={stats.totalUsers.toLocaleString()} icon={Users} />
            <StatCard delay={0.2} title={t("Active Pickups")} value={stats.activePickups} icon={Activity} />
            <StatCard delay={0.25} title={t("System Health")} value={`${stats.systemHealth}%`} icon={HeartPulse} />
            <StatCard delay={0.3} title={t("Total Students")} value={stats.totalStudents.toLocaleString()} icon={UserCircle} />
            <StatCard delay={0.35} title={t("Total Parents")} value={stats.totalParents.toLocaleString()} icon={Users} />
            <StatCard delay={0.4} title={t("Safety Incidents")} value={stats.safetyIncidents} icon={ShieldAlert} />
          </>
        ) : null}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/[0.07] shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">{t("Pickup Requests (Today)")}</h3>
            <p className="text-sm text-muted-foreground">{t("Volume of requests across all timezones")}</p>
          </div>
          <div className="h-[300px] w-full">
            {analyticsLoading ? (
              <Skeleton className="w-full h-full bg-black/[0.04]" />
            ) : analytics ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.pickupRequests}>
                  <defs>
                    <linearGradient id="colorPickups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#002626" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#002626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(0,0,0,0.35)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(0,0,0,0.35)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: '#002626' }}
                    itemStyle={{ color: '#002626' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#002626" strokeWidth={2} fillOpacity={1} fill="url(#colorPickups)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/[0.07] shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">{t("School Growth")}</h3>
            <p className="text-sm text-muted-foreground">{t("New onboarded schools past 6 months")}</p>
          </div>
          <div className="h-[300px] w-full">
            {analyticsLoading ? (
              <Skeleton className="w-full h-full bg-black/[0.04]" />
            ) : analytics ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.schoolGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(0,0,0,0.35)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(0,0,0,0.35)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,38,38,0.05)' }}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: '#002626' }}
                  />
                  <Bar dataKey="value" fill="#002626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
