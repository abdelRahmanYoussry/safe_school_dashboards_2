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
    name: "",
    description: "",
    price: 99.99,
    maxStudents: 500,
    maxStaff: 50,
    durationDays: 365,
    features: { hasBusTracking: false, maxSms: 500, hasAnalytics: false },
    isActive: true,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const payload = {
      ...formData,
      ...(formData.description.trim() === "" ? {} : { description: formData.description.trim() }),
    };
    if (payload.description === "") delete (payload as any).description;
    createMutation.mutate(payload, {
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
          <DialogContent className="glass-panel border-black/[0.06]">
            <DialogHeader>
              <DialogTitle>New Pricing Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Name</label>
                <Input required className="bg-background border-border focus:border-primary focus-visible:ring-primary/20 transition-colors" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input className="bg-background border-border focus:border-primary focus-visible:ring-primary/20 transition-colors" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price ($)</label>
                  <Input type="number" step="0.01" required className="bg-background border-border focus:border-primary focus-visible:ring-primary/20 transition-colors" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (days)</label>
                  <Input type="number" required className="bg-background border-border focus:border-primary focus-visible:ring-primary/20 transition-colors" value={formData.durationDays} onChange={e => setFormData({ ...formData, durationDays: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Students</label>
                  <Input type="number" required className="bg-background border-border focus:border-primary focus-visible:ring-primary/20 transition-colors" value={formData.maxStudents} onChange={e => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Staff</label>
                  <Input type="number" required className="bg-background border-border focus:border-primary focus-visible:ring-primary/20 transition-colors" value={formData.maxStaff} onChange={e => setFormData({ ...formData, maxStaff: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max SMS</label>
                <Input type="number" className="bg-background border-border focus:border-primary focus-visible:ring-primary/20 transition-colors" value={formData.features.maxSms} onChange={e => setFormData({ ...formData, features: { ...formData.features, maxSms: parseInt(e.target.value) } })} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.features.hasBusTracking} onChange={e => setFormData({ ...formData, features: { ...formData.features, hasBusTracking: e.target.checked } })} />
                  Bus Tracking
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.features.hasAnalytics} onChange={e => setFormData({ ...formData, features: { ...formData.features, hasAnalytics: e.target.checked } })} />
                  Analytics
                </label>
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
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl bg-black/[0.04]" />)
        ) : plans?.map((plan) => {
          const features = plan.features as { hasBusTracking?: boolean; maxSms?: number; hasAnalytics?: boolean };
          return (
          <div key={plan.id} className="bg-white p-8 rounded-3xl border border-black/[0.07] shadow-sm flex flex-col relative group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#002626] to-[#045655] rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => { if (confirm('Delete plan?')) deleteMutation.mutate(plan.id); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-extrabold">${plan.price.toFixed(2)}</span>
              <span className="text-muted-foreground">/{plan.durationDays === 365 ? 'yr' : plan.durationDays === 30 ? 'mo' : `${plan.durationDays}d`}</span>
            </div>
            {plan.description && <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>}

            <div className="space-y-3 flex-1">
              <p className="text-sm text-muted-foreground pb-2 border-b border-black/[0.07]">Includes:</p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Up to {plan.maxStudents} students
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Up to {plan.maxStaff} staff members
              </div>
              {features?.hasBusTracking && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Bus Tracking
                </div>
              )}
              {features?.hasAnalytics && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Analytics
                </div>
              )}
              {features?.maxSms != null && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> {features.maxSms} SMS / month
                </div>
              )}
            </div>

            <Button className="w-full mt-8 bg-black/[0.05] hover:bg-black/[0.09] text-foreground border border-black/[0.07] rounded-xl">
              Edit Plan
            </Button>
          </div>
          );
        })}
      </div>
    </PageTransition>
  );
}
