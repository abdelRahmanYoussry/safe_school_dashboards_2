import { PageTransition } from "@/components/layout/AppLayout";
import { useTickets, useUpdateTicket } from "@/hooks/use-system";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Tickets() {
  const { data: tickets, isLoading } = useTickets();
  const updateMutation = useUpdateTicket();

  const handleStatusChange = (id: number, status: string) => {
    updateMutation.mutate({ id, status });
  };

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground mt-1">Help desk for school administrators.</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/10">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-64 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto bg-white/5 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : tickets?.map((ticket) => (
              <TableRow key={ticket.id} className="border-b border-white/5">
                <TableCell className="font-medium">{ticket.title}</TableCell>
                <TableCell className="text-muted-foreground truncate max-w-[300px]">{ticket.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    ticket.status === 'open' ? 'border-primary/30 text-primary' : 
                    ticket.status === 'in_progress' ? 'border-yellow-500/30 text-yellow-500' : 'border-white/10 text-muted-foreground'
                  }>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(ticket.createdAt!).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  {ticket.status !== 'closed' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-white/5 border-white/10 hover:bg-white/10"
                      onClick={() => handleStatusChange(ticket.id, ticket.status === 'open' ? 'in_progress' : 'closed')}
                    >
                      {ticket.status === 'open' ? 'Start Work' : 'Close Ticket'}
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
