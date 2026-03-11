import { useParams } from "wouter";
import { PageTransition } from "@/components/layout/AppLayout";
import { useSchool, useSchoolIncidents } from "@/hooks/use-schools";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCircle, Car, ShieldAlert, MapPin, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SchoolDetails() {
  const { id } = useParams();
  const schoolId = id || "0";
  const { data: school, isLoading: schoolLoading } = useSchool(schoolId);
  const { data: incidents, isLoading: incidentsLoading } = useSchoolIncidents(schoolId);
  const stats = school?.stats;

  const getSeverityBadge = (severity: string) => {
    const s = severity?.toUpperCase() || 'LOW';
    switch (s) {
      case 'CRITICAL': return <Badge className="bg-red-500 text-white border-none">Critical</Badge>;
      case 'HIGH': return <Badge className="bg-orange-500 text-white border-none">High</Badge>;
      case 'MEDIUM': return <Badge className="bg-yellow-500 text-black border-none">Medium</Badge>;
      default: return <Badge className="bg-blue-500 text-white border-none">Low</Badge>;
    }
  };

  if (schoolLoading) {
    return <PageTransition className="p-6 space-y-6"><Skeleton className="w-full h-80 rounded-3xl" /><div className="grid grid-cols-4 gap-6"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></PageTransition>;
  }

  if (!school) {
    return <PageTransition><div className="p-12 text-center text-xl font-bold">School not found.</div></PageTransition>;
  }

  return (
    <PageTransition className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-black/[0.05] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-black/[0.02] border border-black/[0.1] shadow-inner flex items-center justify-center">
            {school.logoUrl ? (
              <img src={school.logoUrl} alt={school.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#002626] to-[#045655] flex items-center justify-center text-3xl font-bold text-white uppercase">
                {school.name.substring(0, 2)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-foreground tracking-tighter">{school.name}</h1>
              <Badge variant={school.isActive ? 'default' : 'secondary'} className={school.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 font-bold' : 'font-bold'}>
                {school.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{school.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>Plan: {stats?.currentPlan?.name || "None"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={String((stats?.teacherCount || 0) + (stats?.guardCount || 0) + (stats?.studentCount || 0))} icon={Users} />
        <StatCard title="Students" value={String(stats?.studentCount || 0)} icon={UserCircle} />
        <StatCard title="Active Pickups" value={String(stats?.activeSessions || 0)} icon={Car} />
        <StatCard title="Geofence Radius" value={`${school.geofenceRadius}m`} icon={ShieldAlert} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-black/[0.05] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                Recent Incident History
              </h3>
              <Badge variant="outline">{incidents?.length || 0} Total</Badge>
            </div>
            <Table>
              <TableHeader className="bg-black/[0.01]">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidentsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : incidents && incidents.length > 0 ? (
                  incidents.map((incident) => (
                    <TableRow key={incident.id} className="hover:bg-black/[0.01]">
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(incident.createdAt!).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-sm">{incident.title}</div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={incident.status === 'open' ? 'text-primary border-primary/20' : ''}>
                          {incident.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No incidents reported for this school.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-black/[0.05] flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Invitation Codes
              </h3>
              <Badge variant="outline">{school?.invitationCodes?.length || 0} Total</Badge>
            </div>
            <Table>
              <TableHeader className="bg-black/[0.01]">
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {school?.invitationCodes && school.invitationCodes.length > 0 ? (
                  school.invitationCodes.map((code: any) => (
                    <TableRow key={code.id} className="hover:bg-black/[0.01]">
                      <TableCell className="font-medium text-sm">
                        {code.type}
                      </TableCell>
                      <TableCell>
                        <code className="bg-black/[0.05] px-2 py-1 rounded text-sm font-bold tracking-wider">{code.code}</code>
                      </TableCell>
                      <TableCell className="text-sm">
                        {code.usedCount} / {code.maxUsage}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={code.isActive ? 'text-emerald-500 border-emerald-500/20' : ''}>
                          {code.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No invitation codes found for this school.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-black/[0.05] shadow-sm">
            <h3 className="font-bold text-lg mb-4">Location Data</h3>
            <div className="space-y-4 text-sm font-medium">
              <div className="p-3 bg-black/[0.02] rounded-xl border border-black/[0.05]">
                <div className="text-muted-foreground text-xs mb-1">COORDINATES</div>
                <div>{school.lat}, {school.lng}</div>
              </div>
              <div className="p-3 bg-black/[0.02] rounded-xl border border-black/[0.05]">
                <div className="text-muted-foreground text-xs mb-1">GEOFENCE STATUS</div>
                <div className="text-emerald-500 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active Monitoring
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
