import { PageTransition } from "@/components/layout/AppLayout";
import { useSafetyReports } from "@/hooks/use-system";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from "lucide-react";

export default function SafetyReports() {
  const { data: reports, isLoading } = useSafetyReports();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Medium</Badge>;
      default: return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Low</Badge>;
    }
  };

  const isFeatureMissing = true; // Placeholder until backend `/schools/:id/incidents` is ready.

  if (isFeatureMissing) {
    return (
      <PageTransition className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Feature Coming Soon</h2>
        <p className="text-muted-foreground max-w-md">
          Safety Reports integration is currently under development. Check back later for real-time safety incidents.
        </p>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-destructive/10 rounded-xl">
          <ShieldAlert className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Safety Monitoring</h1>
          <p className="text-muted-foreground mt-1">Real-time reports from all schools.</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/10">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 bg-white/5" /></TableCell>
                </TableRow>
              ))
            ) : reports?.map((report) => (
              <TableRow key={report.id} className="border-b border-white/5">
                <TableCell className="text-muted-foreground">{new Date(report.createdAt!).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{report.reportType}</TableCell>
                <TableCell>{report.reportedBy}</TableCell>
                <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={report.status === 'open' ? 'text-primary border-primary/20' : 'text-muted-foreground'}>
                    {report.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {reports?.length === 0 && <div className="p-8 text-center text-muted-foreground">No safety reports found.</div>}
      </div>
    </PageTransition>
  );
}
