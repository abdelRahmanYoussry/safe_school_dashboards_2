import { PageTransition } from "@/components/layout/AppLayout";
import { useTickets, useUpdateTicket } from "@/hooks/use-system";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function Tickets() {
  const { data: tickets, isLoading } = useTickets();
  const updateMutation = useUpdateTicket();
  const { t } = useTranslation();

  const handleStatusChange = (id: number, status: string) => {
    updateMutation.mutate({ id, status });
  };

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("Support Tickets")}</h1>
        <p className="text-muted-foreground mt-1">{t("Help desk for school administrators.")}</p>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.07] shadow-sm">
        <Table>
          <TableHeader className="bg-black/[0.03]">
            <TableRow>
              <TableHead className="pl-6 pr-2">{t("Ticket")}</TableHead>
              <TableHead className="px-2">{t("Description")}</TableHead>
              <TableHead className="px-2">{t("Status")}</TableHead>
              <TableHead className="px-2">{t("Date")}</TableHead>
              <TableHead className="text-right pl-2 pr-6">{t("Action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6 pr-2"><Skeleton className="h-5 w-32 bg-black/[0.04]" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-5 w-64 bg-black/[0.04]" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-5 w-16 bg-black/[0.04]" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-5 w-24 bg-black/[0.04]" /></TableCell>
                  <TableCell className="pl-2 pr-6 text-right"><Skeleton className="h-8 w-20 ml-auto bg-white/5 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : tickets?.map((ticket) => (
              <TableRow key={ticket.id} className="border-b border-black/[0.05]">
                <TableCell className="pl-6 pr-2 font-medium">{ticket.title}</TableCell>
                <TableCell className="px-2 text-muted-foreground truncate max-w-[300px]">{ticket.description}</TableCell>
                <TableCell className="px-2">
                  <Badge variant="outline" className={
                    ticket.status === 'open' ? 'border-primary/30 text-primary' :
                      ticket.status === 'in_progress' ? 'border-yellow-500/30 text-yellow-500' : 'border-black/10 text-muted-foreground'
                  }>
                    {t(ticket.status)}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 text-sm text-muted-foreground">{new Date(ticket.createdAt!).toLocaleDateString()}</TableCell>
                <TableCell className="pl-2 pr-6 text-right">
                  {ticket.status !== 'closed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/[0.03] border-black/10 hover:bg-black/[0.07]"
                      onClick={() => handleStatusChange(ticket.id, ticket.status === 'open' ? 'in_progress' : 'closed')}
                    >
                      {ticket.status === 'open' ? t('Start Work') : t('Close Ticket')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageTransition>
  );
}
