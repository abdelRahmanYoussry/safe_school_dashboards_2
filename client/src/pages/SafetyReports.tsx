import { useState } from "react";
import { PageTransition } from "@/components/layout/AppLayout";
import { useSchools, useSchoolIncidents, useCreateIncident } from "@/hooks/use-schools";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Plus, School as SchoolIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function SafetyReports() {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const { data: schools } = useSchools();
  const { data: incidents, isLoading } = useSchoolIncidents(parseInt(selectedSchoolId));
  const createIncident = useCreateIncident();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getSeverityBadge = (severity: string) => {
    const s = severity.toUpperCase();
    switch (s) {
      case 'CRITICAL': return <Badge className="bg-red-500 text-white border-none">Critical</Badge>;
      case 'HIGH': return <Badge className="bg-orange-500 text-white border-none">High</Badge>;
      case 'MEDIUM': return <Badge className="bg-yellow-500 text-black border-none">Medium</Badge>;
      default: return <Badge className="bg-blue-500 text-white border-none">Low</Badge>;
    }
  };

  const handleReportIncident = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSchoolId) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      schoolId: parseInt(selectedSchoolId),
      title: formData.get("title") as string,
      body: formData.get("body") as string,
      severity: formData.get("severity") as string,
    };

    try {
      await createIncident.mutateAsync(data);
      toast({ title: "Incident Reported", description: "The incident has been recorded successfully." });
      setIsDialogOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to report incident. Please try again.", variant: "destructive" });
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-destructive/10 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Safety Monitoring</h1>
            <p className="text-muted-foreground mt-1">Real-time incident reports scoped by school.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
            <SelectTrigger className="w-[240px] bg-white border-black/[0.1] rounded-xl h-11">
              <SelectValue placeholder="Select a school" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-black/[0.1]">
              {schools?.map((school) => (
                <SelectItem key={school.id} value={school.id.toString()}>
                  <div className="flex items-center gap-2">
                    <SchoolIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{school.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedSchoolId} className="h-11 rounded-xl gap-2 font-medium">
                <Plus className="w-4 h-4" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-black/[0.1]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Report Safety Incident</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleReportIncident} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Incident Title</Label>
                  <Input id="title" name="title" placeholder="e.g. Unauthorized access attempt" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Level</Label>
                  <Select name="severity" defaultValue="LOW">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Details</Label>
                  <Textarea id="body" name="body" placeholder="Describe what happened..." required className="rounded-xl min-h-[100px]" />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full rounded-xl" disabled={createIncident.isPending}>
                    {createIncident.isPending ? "Submitting..." : "Submit Report"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedSchoolId ? (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh] bg-white rounded-3xl border border-black/[0.05] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <SchoolIcon className="w-8 h-8 text-primary/40" />
          </div>
          <h2 className="text-xl font-bold mb-2">Select a School</h2>
          <p className="text-muted-foreground max-w-sm">
            Please select a school from the dropdown above to view its safety incidents and reports.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.07] shadow-sm">
          <Table>
            <TableHeader className="bg-black/[0.03]">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Incident</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24 bg-black/[0.04]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48 bg-black/[0.04]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 bg-black/[0.04]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 bg-black/[0.04]" /></TableCell>
                  </TableRow>
                ))
              ) : incidents?.map((incident) => (
                <TableRow key={incident.id} className="border-b border-black/[0.05] hover:bg-black/[0.01] transition-colors">
                  <TableCell className="text-muted-foreground font-medium">
                    {new Date(incident.createdAt!).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{incident.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{incident.body}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={incident.status === 'open' ? 'text-primary border-primary/20 bg-primary/5' : 'text-muted-foreground'}>
                      {incident.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {incidents?.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No safety incidents logged for this school.
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
}
