import { PageTransition } from "../components/AdminLayout";
import { useTranslation } from "react-i18next";
import { useAdminBuses } from "../hooks/use-admin-api";
import { DataTable } from "../components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bus, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransportationPage() {
  const { t } = useTranslation();
  const { data: buses, isLoading } = useAdminBuses();

  const columns = [
    { 
      header: "Bus Name / Number", 
      accessor: (b: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 shadow-sm">
            <Bus className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#002626]">{b.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium">{b.plateNumber || t("No Plate")}</span>
          </div>
        </div>
      )
    },
    { 
      header: "Capacity", 
      accessor: (b: any) => (
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium">{b.capacity || '-'}</span>
        </div>
      ) 
    },
    { 
      header: "Assigned Drivers", 
      accessor: (b: any) => (
        <div className="flex -space-x-2">
            {b.users?.map((u: any, i: number) => (
                <div key={i} className="w-6 h-6 rounded-full border border-white bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-700 shadow-sm">
                    {u.name?.substring(0, 1).toUpperCase()}
                </div>
            )) || <span className="text-muted-foreground text-xs italic">{t("Unassigned")}</span>}
        </div>
      ) 
    },
    { 
      header: "Status", 
      accessor: (b: any) => (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 px-2 py-0.5">
          {t("Active")}
        </Badge>
      ) 
    },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#002626]" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#002626]">{t("Transportation & Fleet")}</h1>
          <p className="text-muted-foreground mt-2">{t("Manage school buses and fleet operations")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="glass-card border-black/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("Total Fleet")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{buses?.data?.length || 0}</div>
                </CardContent>
            </Card>
            <Card className="glass-card border-black/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("Active Routes")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{buses?.data?.length || 0}</div>
                </CardContent>
            </Card>
            <Card className="glass-card border-black/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("In Transit")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                </CardContent>
            </Card>
        </div>

        <DataTable columns={columns} data={buses?.data || []} />
      </div>
    </PageTransition>
  );
}
