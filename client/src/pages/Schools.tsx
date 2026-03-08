import { useState } from "react";
import { Link } from "wouter";
import { PageTransition } from "@/components/layout/AppLayout";
import { useSchools, useCreateSchool, useDeleteSchool } from "@/hooks/use-schools";
import { usePlans } from "@/hooks/use-plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MoreHorizontal, Eye, Edit2, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function Schools() {
  const { data: schools, isLoading } = useSchools();
  const { data: plans } = usePlans();
  const createMutation = useCreateSchool();
  const deleteMutation = useDeleteSchool();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "", address: "", city: "", latitude: 0, longitude: 0, geofenceRadius: 100, planId: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsAddOpen(false);
      }
    });
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Schools</h1>
          <p className="text-muted-foreground mt-1">Manage all tenant schools on the platform.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl hover:-translate-y-0.5 transition-transform">
              <Plus className="w-4 h-4 mr-2" /> Add School
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-white/10 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Onboard New School</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">School Name</label>
                  <Input required className="bg-white/5 border-white/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input required className="bg-white/5 border-white/10" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">City</label>
                  <Input required className="bg-white/5 border-white/10" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Latitude</label>
                  <Input type="number" step="any" required className="bg-white/5 border-white/10" value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Longitude</label>
                  <Input type="number" step="any" required className="bg-white/5 border-white/10" value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Subscription Plan</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.planId} 
                    onChange={e => setFormData({...formData, planId: parseInt(e.target.value)})}
                  >
                    {plans?.map(p => (
                      <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createMutation.isPending} className="bg-primary text-primary-foreground rounded-xl">
                  {createMutation.isPending ? "Creating..." : "Create School"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/10">
        <Table>
          <TableHeader className="bg-white/5 border-b border-white/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px]">School</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-48 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto bg-white/5 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : schools?.map((school) => (
              <TableRow key={school.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-md">
                      {school.name.substring(0, 2).toUpperCase()}
                    </div>
                    {school.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{school.city}</TableCell>
                <TableCell>{school.totalUsers}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {plans?.find(p => p.id === school.planId)?.name || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={school.status === 'active' ? 'default' : 'secondary'} className={school.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : ''}>
                    {school.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-white/10">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-panel border-white/10">
                      <Link href={`/schools/${school.id}`}>
                        <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                        <Edit2 className="w-4 h-4 mr-2" /> Edit School
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => {
                          if(confirm('Are you sure?')) deleteMutation.mutate(school.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {schools?.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No schools found. Add one to get started.
          </div>
        )}
      </div>
    </PageTransition>
  );
}
