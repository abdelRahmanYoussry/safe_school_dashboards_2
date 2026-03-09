import { useState } from "react";
import { PageTransition } from "@/components/layout/AppLayout";
import { usePlans, useCreatePlan, useDeletePlan } from "@/hooks/use-plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Plans() {
  const { data: plans, isLoading } = usePlans();
  const createMutation = useCreatePlan();
  const deleteMutation = useDeletePlan();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "", maxStudents: 500, maxStaff: 50, monthlyPrice: 9900, features: ["Standard Support", "Basic Analytics"]
  });
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    createMutation.mutate(formData, {
      onSuccess: () => setIsAddOpen(false),
      onError: (err: Error) => setErrorMsg(err.message)
    });
  };

  return (
    <PageTransition className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground mt-1">Manage pricing tiers and features for schools.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-white/10">
            <DialogHeader>
              <DialogTitle>New Pricing Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Name</label>
                <Input required className="bg-white/5 border-white/10" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Students</label>
                  <Input type="number" required className="bg-white/5 border-white/10" value={formData.maxStudents} onChange={e => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Price (cents)</label>
                  <Input type="number" required className="bg-white/5 border-white/10" value={formData.monthlyPrice} onChange={e => setFormData({ ...formData, monthlyPrice: parseInt(e.target.value) })} />
                </div>
              </div>
              {errorMsg && (
                <div className="text-red-500 text-sm mt-2">
                  {errorMsg}
                </div>
              )}
              <Button type="submit" disabled={createMutation.isPending} className="w-full bg-primary rounded-xl mt-4">
                {createMutation.isPending ? "Saving..." : "Create Plan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl bg-white/5" />)
        ) : plans?.map((plan) => (
          <div key={plan.id} className="glass p-8 rounded-3xl border border-white/10 flex flex-col relative group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => { if (confirm('Delete plan?')) deleteMutation.mutate(plan.id); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-extrabold">${(plan.monthlyPrice / 100).toFixed(2)}</span>
              <span className="text-muted-foreground">/mo</span>
            </div>

            <div className="space-y-3 flex-1">
              <p className="text-sm text-muted-foreground pb-2 border-b border-white/10">Includes:</p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Up to {plan.maxStudents} students
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Up to {plan.maxStaff} staff members
              </div>
              {(plan.features as string[]).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> {f}
                </div>
              ))}
            </div>

            <Button className="w-full mt-8 bg-white/10 hover:bg-white/20 text-foreground border border-white/5 rounded-xl">
              Edit Plan
            </Button>
          </div>
        ))}
      </div>
    </PageTransition>
  );
}
