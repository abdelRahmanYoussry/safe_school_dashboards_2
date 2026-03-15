import { useState } from "react";
import { Link } from "wouter";
import { PageTransition } from "@/components/layout/AppLayout";
import { useSchools, useCreateSchool, useUpdateSchool, useDeleteSchool, useAssignSubscription } from "@/hooks/use-schools";
import { usePlans } from "@/hooks/use-plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MoreHorizontal, Eye, Edit2, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function Schools() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: schools, isLoading } = useSchools(page, limit);
  const { data: plans } = usePlans();
  const { t } = useTranslation();
  const { toast } = useToast();
  const createMutation = useCreateSchool();
  const updateMutation = useUpdateSchool();
  const assignMutation = useAssignSubscription();
  const deleteMutation = useDeleteSchool();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    lat: 0,
    lng: 0,
    geofenceRadius: 100,
    planId: "",
    logo: null as File | null,
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    // Required fields first (matching backend expectation)
    fd.append("name", formData.name);
    
    // Logo is optional - only send if provided
    if (formData.logo) {
      fd.append("logo", formData.logo);
    }

    // Nested admin object (using bracket notation for NestJS)
    fd.append("admin[name]", formData.adminName);
    fd.append("admin[email]", formData.adminEmail);
    fd.append("admin[password]", formData.adminPassword);
    fd.append("admin[phone]", formData.adminPhone);

    // Optional geo and address fields
    if (formData.address) fd.append("address", formData.address);
    if (formData.lat) fd.append("lat", formData.lat.toString());
    if (formData.lng) fd.append("lng", formData.lng.toString());
    if (formData.geofenceRadius) fd.append("geofenceRadius", formData.geofenceRadius.toString());

    createMutation.mutate(fd, {
      onSuccess: (response: any) => {
        const schoolId = response.data.id;
        toast({ title: t("Success"), description: t("School created successfully.") });
        
        if (formData.planId) {
          assignMutation.mutate({
            schoolId,
            planId: formData.planId,
            startDate: new Date().toISOString()
          }, {
            onSuccess: () => {
              setIsAddOpen(false);
              setFormData({
                name: "", address: "", lat: 0, lng: 0, geofenceRadius: 100, planId: "", logo: null,
                adminName: "", adminEmail: "", adminPassword: "", adminPhone: ""
              });
              toast({ title: t("Success"), description: t("Plan assigned successfully.") });
            },
            onError: (error: Error) => {
              toast({ 
                title: t("Plan Assignment Failed"), 
                description: error.message, 
                variant: "destructive" 
              });
            }
          });
        } else {
          setIsAddOpen(false);
          setFormData({
            name: "", address: "", lat: 0, lng: 0, geofenceRadius: 100, planId: "", logo: null,
            adminName: "", adminEmail: "", adminPassword: "", adminPhone: ""
          });
        }
      },
      onError: (error: Error) => {
        toast({ 
          title: t("Creation Failed"), 
          description: error.message, 
          variant: "destructive" 
        });
      }
    });
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    lat: 0,
    lng: 0,
    geofenceRadius: 100,
    isActive: true,
    planId: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchoolId) return;

    updateMutation.mutate({
      id: editingSchoolId,
      name: editFormData.name,
      address: editFormData.address,
      lat: editFormData.lat,
      lng: editFormData.lng,
      geofenceRadius: editFormData.geofenceRadius,
      isActive: editFormData.isActive,
      planId: editFormData.planId || undefined,
      adminName: editFormData.adminName || undefined,
      adminEmail: editFormData.adminEmail || undefined,
      adminPhone: editFormData.adminPhone || undefined,
      adminPassword: editFormData.adminPassword || undefined,
    }, {
      onSuccess: () => {
        toast({ title: t("Success"), description: t("School updated successfully.") });
        setIsEditOpen(false);
        setEditingSchoolId(null);
      },
      onError: (error: Error) => {
        toast({ 
          title: t("Update Failed"), 
          description: error.message, 
          variant: "destructive" 
        });
      }
    });
  };

  const openEditModal = (school: any) => {
    setEditingSchoolId(school.id);
    setEditFormData({
      name: school.name || "",
      address: school.address || "",
      lat: school.lat || 0,
      lng: school.lng || 0,
      geofenceRadius: school.geofenceRadius || 100,
      isActive: school.isActive ?? true,
      planId: school.planId || "",
      adminName: school.adminName || "",
      adminEmail: school.adminEmail || "",
      adminPhone: school.adminPhone || "",
      adminPassword: "",
    });
    setIsEditOpen(true);
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("Schools")}</h1>
          <p className="text-muted-foreground mt-1">{t("Manage all tenant schools on the platform.")}</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl hover:-translate-y-0.5 transition-transform h-11 px-6 font-bold">
              <Plus className="w-4 h-4 mr-2" /> {t("Add School")}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-black/[0.06] sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">{t("Onboard New School")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("School Name")}</label>
                  <Input required className="bg-black/[0.03] border-black/10 rounded-xl h-11" placeholder="e.g. Greenwood International" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("School Logo")} ({t("Optional")})</label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="bg-black/[0.03] border-black/10 rounded-xl h-11 pt-2"
                    onChange={e => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                  />
                  <p className="text-xs text-muted-foreground">{t("If not provided, a default logo will be used")}</p>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("Address")}</label>
                  <Input required className="bg-black/[0.03] border-black/10 rounded-xl h-11" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("Latitude")}</label>
                  <Input type="number" step="any" required className="bg-black/[0.03] border-black/10 rounded-xl h-11" value={formData.lat} onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("Longitude")}</label>
                  <Input type="number" step="any" required className="bg-black/[0.03] border-black/10 rounded-xl h-11" value={formData.lng} onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("Geofence Radius (m)")}</label>
                  <Input type="number" required className="bg-black/[0.03] border-black/10 rounded-xl h-11" value={formData.geofenceRadius} onChange={e => setFormData({ ...formData, geofenceRadius: parseInt(e.target.value) })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("Subscription Plan")}</label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    value={formData.planId}
                    onChange={e => setFormData({ ...formData, planId: e.target.value })}
                  >
                    {plans?.map(p => (
                      <option key={p.id} value={p.id} className="bg-white">{p.name} - ${p.price / 100}/mo</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4 col-span-2 pt-4 border-t border-black/5">
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary">{t("School Administrator")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Admin Name")}</label>
                      <Input required className="bg-black/[0.03] border-black/10 rounded-xl h-10" value={formData.adminName} onChange={e => setFormData({ ...formData, adminName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Admin Email")}</label>
                      <Input required type="email" className="bg-black/[0.03] border-black/10 rounded-xl h-10" value={formData.adminEmail} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Password")}</label>
                      <Input required type="password" placeholder="••••••••" className="bg-black/[0.03] border-black/10 rounded-xl h-10" value={formData.adminPassword} onChange={e => setFormData({ ...formData, adminPassword: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Phone Number")}</label>
                      <Input required className="bg-black/[0.03] border-black/10 rounded-xl h-10" value={formData.adminPhone} onChange={e => setFormData({ ...formData, adminPhone: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createMutation.isPending || assignMutation.isPending} className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                  {createMutation.isPending || assignMutation.isPending ? t("Saving...") : t("Onboard School")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="glass-panel border-black/[0.06] sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">{t("Edit School")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("School Name")}</label>
                  <Input required className="bg-black/[0.03] border-black/10 rounded-xl h-11" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("Address")}</label>
                  <Input required className="bg-black/[0.03] border-black/10 rounded-xl h-11" value={editFormData.address} onChange={e => setEditFormData({ ...editFormData, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("Latitude")}</label>
                  <Input type="number" step="any" required className="bg-black/[0.03] border-black/10 rounded-xl h-11" value={editFormData.lat} onChange={e => setEditFormData({ ...editFormData, lat: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("Longitude")}</label>
                  <Input type="number" step="any" required className="bg-black/[0.03] border-black/10 rounded-xl h-11" value={editFormData.lng} onChange={e => setEditFormData({ ...editFormData, lng: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("Subscription Plan")}</label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    value={editFormData.planId}
                    onChange={e => setEditFormData({ ...editFormData, planId: e.target.value })}
                  >
                    <option value="">{t("Select Plan")}</option>
                    {plans?.map(p => (
                      <option key={p.id} value={p.id} className="bg-white">{p.name} - ${p.price / 100}/mo</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4 col-span-2 pt-4 border-t border-black/5">
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary">{t("School Administrator")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Admin Name")}</label>
                      <Input className="bg-black/[0.03] border-black/10 rounded-xl h-10" value={editFormData.adminName} onChange={e => setEditFormData({ ...editFormData, adminName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Admin Email")}</label>
                      <Input type="email" className="bg-black/[0.03] border-black/10 rounded-xl h-10" value={editFormData.adminEmail} onChange={e => setEditFormData({ ...editFormData, adminEmail: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Password")}</label>
                      <Input type="password" placeholder={t("Leave blank to keep")} className="bg-black/[0.03] border-black/10 rounded-xl h-10" value={editFormData.adminPassword} onChange={e => setEditFormData({ ...editFormData, adminPassword: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("Phone Number")}</label>
                      <Input className="bg-black/[0.03] border-black/10 rounded-xl h-10" value={editFormData.adminPhone} onChange={e => setEditFormData({ ...editFormData, adminPhone: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 col-span-2 flex items-center justify-between mt-2 p-3 bg-black/[0.02] rounded-xl border border-black/[0.05]">
                  <label className="text-sm font-bold text-foreground uppercase tracking-wider">{t("Active Status")}</label>
                  <Switch
                    checked={editFormData.isActive}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, isActive: checked })}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={updateMutation.isPending} className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                  {updateMutation.isPending ? t("Saving...") : t("Save Changes")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-black/[0.07] shadow-sm">
        <Table>
          <TableHeader className="bg-black/[0.03] border-b border-black/[0.07]">
            <TableRow className="hover:bg-transparent h-12 text-muted-foreground/60 uppercase text-[10px] font-black tracking-widest">
              <TableHead className="px-6 w-12">#</TableHead>
              <TableHead className="px-6">{t("School")}</TableHead>
              <TableHead>{t("Location")}</TableHead>
              <TableHead>{t("Plan")}</TableHead>
              <TableHead>{t("Status")}</TableHead>
              <TableHead className="text-right px-6">{t("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4 w-12"><Skeleton className="h-6 w-6 bg-black/[0.04] rounded-lg" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-10 w-48 bg-black/[0.04] rounded-xl" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 bg-black/[0.04] rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-black/[0.04] rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 bg-black/[0.04] rounded-lg" /></TableCell>
                  <TableCell className="px-6 text-right"><Skeleton className="h-8 w-8 ml-auto bg-black/[0.04] rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : schools?.map((school, index) => (
              <TableRow key={school.id} className="border-b border-black/[0.05] hover:bg-black/[0.01] transition-colors group">
                <TableCell className="px-6 py-4 font-bold text-muted-foreground/40 text-xs w-12">
                  {(page - 1) * limit + index + 1}
                </TableCell>
                <TableCell className="px-6 py-4 font-bold">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/[0.03] border border-black/[0.08] flex items-center justify-center text-xs font-black text-white shadow-sm ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                      {school.logoUrl ? (
                        <img src={school.logoUrl} className="w-full h-full object-cover" alt={school.name} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#002626] to-[#045655] flex items-center justify-center">
                          {school.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground">{school.name}</span>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground/60 font-medium tracking-tight uppercase">ID: {school.id}</span>
                        {school.adminEmail && (
                          <span className="text-[10px] text-primary/60 font-medium tracking-tight lowercase truncate max-w-[150px]">{school.adminEmail}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-medium">{school.address}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-0.5 rounded-lg whitespace-nowrap">
                    {school.plan || school.planName || plans?.find(p => p.id === school.planId)?.name || 'Basic'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={school.isActive ? 'default' : 'secondary'} className={school.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 font-bold' : 'font-bold'}>
                      {school.isActive ? t('active') : t('inactive')}
                    </Badge>
                    <Switch
                      checked={school.isActive}
                      onCheckedChange={(checked) => {
                        updateMutation.mutate({ id: school.id, isActive: checked }, {
                          onSuccess: () => {
                            toast({ title: t("Success"), description: t(checked ? "School activated successfully." : "School deactivated successfully.") });
                          },
                          onError: (error) => {
                            toast({ title: t("Update Failed"), description: error.message, variant: "destructive" });
                          }
                        });
                      }}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-black/[0.07]">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-panel border-black/[0.06]">
                      <Link href={`/schools/${school.id}`}>
                        <DropdownMenuItem className="cursor-pointer hover:bg-black/[0.05] focus:bg-black/[0.05]">
                          <Eye className="w-4 h-4 mr-2" /> {t("View Details")}
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem 
                        className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                        onClick={() => openEditModal(school)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" /> {t("Edit School")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => {
                          if (confirm(t('Are you sure?'))) deleteMutation.mutate(school.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> {t("Delete")}
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
            {t("No schools found. Add one to get started.")}
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
            disabled={!schools || schools.length < limit || isLoading}
            className="border-white/10"
          >
            {t("Next")}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
