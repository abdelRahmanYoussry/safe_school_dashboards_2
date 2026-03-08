import { PageTransition } from "@/components/layout/AppLayout";
import { useAuditLogs } from "@/hooks/use-system";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLogs() {
  const { data: logs, isLoading } = useAuditLogs();

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">System Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Immutable record of platform activities.</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/10">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>School ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(10).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-white/5" /></TableCell>
                </TableRow>
              ))
            ) : logs?.map((log) => (
              <TableRow key={log.id} className="border-b border-white/5 font-mono text-sm">
                <TableCell className="text-muted-foreground">{new Date(log.createdAt!).toLocaleString()}</TableCell>
                <TableCell className="text-primary">{log.action}</TableCell>
                <TableCell>{log.userId || 'System'}</TableCell>
                <TableCell>{log.schoolId || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageTransition>
  );
}
