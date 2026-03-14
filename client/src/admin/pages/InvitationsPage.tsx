import { PageTransition } from "../components/AdminLayout";
import { useTranslation } from "react-i18next";
import { useAdminInvitationCodes } from "../hooks/use-admin-api";
import { DataTable } from "../components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Loader2, Key, Calendar, Hash } from "lucide-react";
import { format } from "date-fns";

export default function InvitationsPage() {
  const { t } = useTranslation();
  const { data: codes, isLoading } = useAdminInvitationCodes();

  const columns = [
    { 
      header: "Code", 
      accessor: (c: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm">
            <Key className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-mono font-bold text-[#002626] tracking-wider">{c.code}</span>
        </div>
      )
    },
    { 
      header: "Type", 
      accessor: (c: any) => (
        <Badge variant="outline" className="bg-black/[0.03] border-black/5 capitalize">
          {c.type.toLowerCase()}
        </Badge>
      ) 
    },
    { 
      header: "Usage", 
      accessor: (c: any) => (
        <div className="flex items-center gap-2 text-sm">
          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium">{c.usedCount} / {c.maxUsage}</span>
        </div>
      ) 
    },
    { 
      header: "Expires", 
      accessor: (c: any) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {c.expiresAt ? format(new Date(c.expiresAt), "MMM d, yyyy") : t("Never")}
        </div>
      ) 
    },
    { 
      header: "Status", 
      accessor: (c: any) => (
        <Badge 
          className={
            c.isActive && (!c.expiresAt || new Date(c.expiresAt) > new Date()) 
            ? 'bg-green-100 text-green-700 hover:bg-green-100' 
            : 'bg-red-100 text-red-700 hover:bg-red-100'
          }
        >
          {c.isActive ? t("Active") : t("Inactive")}
        </Badge>
      ) 
    },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#002626]" /></div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#002626]">{t("Invitation Codes")}</h1>
          <p className="text-muted-foreground mt-2">{t("Manage system access codes for teachers and staff")}</p>
        </div>

        <DataTable columns={columns} data={codes?.data || []} />
      </div>
    </PageTransition>
  );
}
