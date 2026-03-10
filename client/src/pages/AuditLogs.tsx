import { useState } from "react";
import { PageTransition } from "@/components/layout/AppLayout";
import { useAuditLogs } from "@/hooks/use-system";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [actionFilter, setActionFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");

  const { data: logs, isLoading } = useAuditLogs({
    page,
    limit,
    action: actionFilter || undefined,
    userId: userIdFilter ? parseInt(userIdFilter) : undefined
  });

  const { t } = useTranslation();

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("System Audit Logs")}</h1>
          <p className="text-muted-foreground mt-1">{t("Immutable record of platform activities.")}</p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder={t("Filter by Action")}
            className="w-48 bg-white border-black/10 rounded-xl"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          />
          <Input
            placeholder={t("User ID")}
            className="w-24 bg-white border-black/10 rounded-xl"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.07] shadow-sm">
        <Table>
          <TableHeader className="bg-black/[0.03]">
            <TableRow>
              <TableHead>{t("Timestamp")}</TableHead>
              <TableHead>{t("Action")}</TableHead>
              <TableHead>{t("User ID")}</TableHead>
              <TableHead>{t("School ID")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(10).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32 bg-black/[0.04]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48 bg-black/[0.04]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-black/[0.04]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-black/[0.04]" /></TableCell>
                </TableRow>
              ))
            ) : logs?.map((log) => (
              <TableRow key={log.id} className="border-b border-black/[0.05] font-mono text-sm">
                <TableCell className="text-muted-foreground">{new Date(log.createdAt!).toLocaleString()}</TableCell>
                <TableCell className="text-primary">{log.action}</TableCell>
                <TableCell>{log.userId || t('System')}</TableCell>
                <TableCell>{log.schoolId || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {logs?.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {t("No audit logs found.")}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t("Showing page")} {page}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="border-black/10"
          >
            {t("Previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={!logs || logs.length < limit || isLoading}
            className="border-black/10"
          >
            {t("Next")}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
