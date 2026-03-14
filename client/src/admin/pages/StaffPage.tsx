import { PageTransition } from "../components/AdminLayout";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStaff, useAdminDrivers } from "../hooks/use-admin-api";
import { DataTable } from "../components/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Phone } from "lucide-react";

export default function StaffPage() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#002626]">{t("Staff Management")}</h1>
          <p className="text-muted-foreground mt-2">{t("Manage teachers, security guards, and other school staff")}</p>
        </div>

        <Tabs defaultValue="teachers" className="w-full">
          <TabsList className="bg-black/[0.03] border-black/5 p-1 rounded-xl h-11">
            <TabsTrigger value="teachers" className="rounded-lg px-6">{t("Teachers")}</TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg px-6">{t("Security")}</TabsTrigger>
            <TabsTrigger value="drivers" className="rounded-lg px-6">{t("Drivers")}</TabsTrigger>
            <TabsTrigger value="others" className="rounded-lg px-6">{t("Other Staff")}</TabsTrigger>
          </TabsList>

          <TabsContent value="teachers" className="mt-6">
            <StaffListTab role="TEACHER" title="Teachers" />
          </TabsContent>
          <TabsContent value="security" className="mt-6">
            <StaffListTab role="GUARD" title="Security Guards" />
          </TabsContent>
          <TabsContent value="drivers" className="mt-6">
            <DriverListTab />
          </TabsContent>
          <TabsContent value="others" className="mt-6">
            <StaffListTab title="General Staff" />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

function StaffListTab({ role, title }: { role?: string, title: string }) {
  const { data, isLoading } = useAdminStaff(1, 50, role);
  const { t } = useTranslation();

  const columns = [
    { 
      header: "Name", 
      accessor: (s: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border border-black/5 shadow-sm">
            <AvatarImage src={s.avatar} />
            <AvatarFallback className="bg-[#002626]/5 text-[#002626] font-bold text-[10px]">
              {s.name?.substring(0, 2).toUpperCase() || 'ST'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-[#002626]">{s.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{s.role}</span>
          </div>
        </div>
      )
    },
    { 
      header: "Contact", 
      accessor: (s: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3 h-3" /> {s.email}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" /> {s.phone}
          </div>
        </div>
      )
    },
    { 
      header: "Status", 
      accessor: (s: any) => (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 px-2 py-0.5">
          {t("Active")}
        </Badge>
      ) 
    },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#002626]" /></div>;

  return <DataTable columns={columns} data={data?.data || []} />;
}

function DriverListTab() {
  const { data, isLoading } = useAdminDrivers();
  const { t } = useTranslation();

  const columns = [
    { 
      header: "Driver", 
      accessor: (d: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border border-black/5 shadow-sm">
            <AvatarImage src={d.photoUrl} />
            <AvatarFallback className="bg-purple-50 text-purple-700 font-bold text-[10px]">
              {d.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-[#002626]">{d.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{d.phone}</span>
          </div>
        </div>
      )
    },
    { header: "License Number", accessor: (d: any) => <span className="font-mono text-xs">{d.licenseNumber || '-'}</span> },
    { 
        header: "Status", 
        accessor: (d: any) => <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50 shadow-none capitalize">{(d.bus ? 'Assigned' : 'Available').toLowerCase()}</Badge> 
    },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#002626]" /></div>;

  return <DataTable columns={columns} data={data?.data || []} />;
}
