import { AdminLayout, PageTransition } from "../components/AdminLayout";
import { useAdminStats, useAdminPickupActive } from "../hooks/use-admin-api";
import { useTranslation } from "react-i18next";
import { Loader2, Users, UserCheck, Kanban, Bus, ShieldCheck, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: activePickups, isLoading: pickupsLoading } = useAdminPickupActive();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#002626]" />
      </div>
    );
  }

  const statCards = [
    { title: "Total Students", value: stats?.studentCount || 0, icon: Users, color: "text-blue-600", href: "/admin/students" },
    { title: "Total Teachers", value: stats?.teacherCount || 0, icon: UserCheck, color: "text-green-600", href: "/admin/staff" },
    { title: "Security Staff", value: stats?.guardCount || 0, icon: ShieldCheck, color: "text-orange-600", href: "/admin/staff" },
    { title: "Total Buses", value: stats?.busCount || 0, icon: Bus, color: "text-purple-600", href: "/admin/transportation" },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#002626]">{t("School Overview")}</h1>
            <p className="text-muted-foreground mt-2">{t("Real-time operational dashboard")}</p>
          </div>
          <Badge variant="outline" className="bg-[#002626]/5 text-[#002626] border-[#002626]/10 px-4 py-1 font-bold">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="glass-card border-black/5 overflow-hidden group cursor-pointer hover:border-[#002626]/20 transition-all active:scale-[0.98]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t(card.title)}</CardTitle>
                  <div className={`p-2 rounded-lg bg-black/[0.03] group-hover:bg-white transition-colors shadow-sm`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{card.value}</div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {t("View Details")} <ChevronRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2 glass-card border-black/5 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-black/[0.03] bg-black/[0.01]">
              <div>
                <CardTitle>{t("Live Pickup Pipeline")}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{t("Overview of currently active sessions")}</p>
              </div>
              <Link href="/admin/pickup">
                <Badge variant="secondary" className="cursor-pointer hover:bg-black/10 transition-colors">
                  {t("Full Board")}
                </Badge>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
               <div className="grid grid-cols-4 divide-x divide-black/[0.03]">
                  <PipelineSlot label="Requested" count={(activePickups || []).filter((p: any) => p.status === 'CREATED').length} color="bg-blue-500" />
                  <PipelineSlot label="Arrived" count={(activePickups || []).filter((p: any) => p.status === 'ARRIVED').length} color="bg-amber-500" />
                  <PipelineSlot label="Preparing" count={(activePickups || []).filter((p: any) => p.status === 'CHILD_PREPARING').length} color="bg-purple-500" />
                  <PipelineSlot label="Verified" count={(activePickups || []).filter((p: any) => p.status === 'SECURITY_VERIFICATION').length} color="bg-green-500" />
               </div>
               <div className="p-8 flex items-center justify-center bg-black/[0.01]">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#002626]/5 flex items-center justify-center animate-pulse">
                        <Kanban className="w-8 h-8 text-[#002626]/40" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#002626]">{stats?.activePickups || 0} {t("Active Sessions")}</p>
                        <p className="text-xs text-muted-foreground max-w-[200px] mt-1">{t("Check the pipeline for real-time tracking of students being picked up.")}</p>
                    </div>
                    <Link href="/admin/pickup">
                        <button className="text-xs font-bold text-[#002626] hover:underline uppercase tracking-widest">{t("Go To Pipeline")}</button>
                    </Link>
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-black/5 overflow-hidden">
            <CardHeader>
              <CardTitle>{t("Quick Actions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <QuickAction label="Add New Student" icon={Users} color="bg-blue-50" text="text-blue-600" />
               <QuickAction label="Generate Invite Code" icon={ShieldCheck} color="bg-orange-50" text="text-orange-600" />
               <QuickAction label="New Announcement" icon={Loader2} color="bg-green-50" text="text-green-600" />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

function PipelineSlot({ label, count, color }: { label: string, count: number, color: string }) {
    const { t } = useTranslation();
    return (
        <div className="p-4 flex flex-col items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t(label)}</span>
            <span className="text-xl font-bold">{count}</span>
        </div>
    );
}

function QuickAction({ label, icon: Icon, color, text }: { label: string, icon: any, color: string, text: string }) {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-between p-3 rounded-xl border border-black/5 hover:border-black/10 hover:bg-black/[0.01] cursor-pointer transition-all group">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${text}`} />
                </div>
                <span className="text-sm font-semibold text-[#002626]">{t(label)}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
