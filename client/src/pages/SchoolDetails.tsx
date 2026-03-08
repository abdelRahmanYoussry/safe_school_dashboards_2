import { useParams } from "wouter";
import { PageTransition } from "@/components/layout/AppLayout";
import { useSchool } from "@/hooks/use-schools";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCircle, Car, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SchoolDetails() {
  const { id } = useParams();
  const { data: school, isLoading } = useSchool(parseInt(id || "0"));

  if (isLoading) {
    return <PageTransition><Skeleton className="w-full h-64 bg-white/5 rounded-2xl" /></PageTransition>;
  }

  if (!school) {
    return <PageTransition><div className="p-8 text-center">School not found.</div></PageTransition>;
  }

  return (
    <PageTransition className="space-y-6">
      <div className="glass p-8 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-xl">
                {school.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{school.name}</h1>
                <p className="text-muted-foreground">{school.address}, {school.city}</p>
              </div>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm px-4 py-1">
            {school.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={school.totalUsers} icon={Users} />
        <StatCard title="Students" value={school.totalStudents} icon={UserCircle} />
        <StatCard title="Active Pickups" value={school.activePickups} icon={Car} />
        <StatCard title="Geofence Radius" value={`${school.geofenceRadius}m`} icon={ShieldAlert} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10 h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Pickup Analytics Chart Placeholder</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10 h-80 flex items-center justify-center">
          <p className="text-muted-foreground">User Roles Distribution Placeholder</p>
        </div>
      </div>
    </PageTransition>
  );
}
