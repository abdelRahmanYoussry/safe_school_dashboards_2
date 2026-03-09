import { useState } from "react";
import { PageTransition } from "@/components/layout/AppLayout";
import { useAuditLogs } from "@/hooks/use-system";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data: logs, isLoading } = useAuditLogs(page, limit);

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
        {logs?.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No audit logs found.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing page {page}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="border-white/10"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={!logs || logs.length < limit || isLoading}
            className="border-white/10"
          >
            Next
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
