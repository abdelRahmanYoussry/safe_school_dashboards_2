import { PageTransition } from "../components/AdminLayout";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStudents, useAdminParents, useAdminDelegates, useAdminDelegateRequests } from "../hooks/use-admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { DataTable } from "../components/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import { useState } from "react";

export default function StudentsPage() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#002626]">{t("Students & Guardians")}</h1>
            <p className="text-muted-foreground mt-2">{t("Manage the children and their authorized pickup persons")}</p>
          </div>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="bg-black/[0.03] border-black/5 p-1 rounded-xl h-11">
            <TabsTrigger value="students" className="rounded-lg px-6">{t("Students")}</TabsTrigger>
            <TabsTrigger value="parents" className="rounded-lg px-6">{t("Parents")}</TabsTrigger>
            <TabsTrigger value="delegates" className="rounded-lg px-6">{t("Delegates")}</TabsTrigger>
            <TabsTrigger value="invitations" className="rounded-lg px-6">{t("Invitations")}</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6">
            <StudentListTab />
          </TabsContent>
          <TabsContent value="parents" className="mt-6">
            <ParentListTab />
          </TabsContent>
          <TabsContent value="delegates" className="mt-6">
            <DelegateListTab />
          </TabsContent>
          <TabsContent value="invitations" className="mt-6">
            <InvitationListTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

function StudentListTab() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useAdminStudents(page, limit);
  const { t } = useTranslation();

  const columns = [
    {
      header: "#",
      accessor: (_: any, index: number) => (
        <span className="text-muted-foreground font-mono text-xs">
          {(page - 1) * limit + index + 1}
        </span>
      )
    },
    { 
      header: "Student", 
      accessor: (s: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border border-black/5 shadow-sm">
            <AvatarImage src={s.photoUrl} />
            <AvatarFallback className="bg-[#002626]/5 text-[#002626] font-bold text-[10px]">
              {s.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-[#002626]">{s.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{s.code}</span>
          </div>
        </div>
      )
    },
    { header: "Grade", accessor: (s: any) => <span className="font-medium">{s.grade?.name}</span> },
    { 
      header: "Pickup Method", 
      accessor: (s: any) => (
        <Badge variant="outline" className="bg-black/[0.03] border-black/5 px-3 py-1 capitalize font-semibold tracking-tight">
          {s.pickupMethod.toLowerCase()}
        </Badge>
      ) 
    },
    { header: "Parent Contact", accessor: (s: any) => s.parentPhone || '-' },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#002626]" /></div>;

  const hasMore = (data?.data?.length || 0) === limit;

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data?.data || []} />
      
      <div className="flex items-center justify-between px-2 py-4">
        <p className="text-sm text-muted-foreground">
          {t("Page")} {page}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-black/5 bg-white shadow-sm disabled:opacity-50 transition-all hover:bg-black/5"
          >
            {t("Previous")}
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-black/5 bg-[#002626] text-white shadow-sm disabled:opacity-50 transition-all hover:bg-[#002626]/90"
          >
            {t("Next")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ParentListTab() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useAdminParents(page, limit);
  const { t } = useTranslation();

  const columns = [
    {
      header: "#",
      accessor: (_: any, index: number) => (
        <span className="text-muted-foreground font-mono text-xs">
          {(page - 1) * limit + index + 1}
        </span>
      )
    },
    { 
      header: "Parent", 
      accessor: (p: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border border-black/5 shadow-sm">
            <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-[10px]">
              {p.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-bold text-[#002626]">{p.email}</span>
        </div>
      )
    },
    { header: "Children", accessor: (p: any) => p.studentAuths?.length || 0 },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#002626]" /></div>;

  const hasMore = (data?.data?.length || 0) === limit;

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data?.data || []} />
      
      <div className="flex items-center justify-between px-2 py-4">
        <p className="text-sm text-muted-foreground">
          {t("Page")} {page}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-black/5 bg-white shadow-sm disabled:opacity-50 transition-all hover:bg-black/5"
          >
            {t("Previous")}
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-black/5 bg-[#002626] text-white shadow-sm disabled:opacity-50 transition-all hover:bg-[#002626]/90"
          >
            {t("Next")}
          </button>
        </div>
      </div>
    </div>
  );
}

function DelegateListTab() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useAdminDelegates(page, limit);
  const { t } = useTranslation();

  const columns = [
    {
      header: "#",
      accessor: (_: any, index: number) => (
        <span className="text-muted-foreground font-mono text-xs">
          {(page - 1) * limit + index + 1}
        </span>
      )
    },
    { 
      header: "Delegate", 
      accessor: (d: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border border-black/5 shadow-sm">
            <AvatarFallback className="bg-orange-50 text-orange-700 font-bold text-[10px]">
              {d.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-bold text-[#002626]">{d.email}</span>
        </div>
      )
    },
    { header: "Authorized For", accessor: (d: any) => d.studentAuths?.length || 0 },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#002626]" /></div>;

  const hasMore = (data?.data?.length || 0) === limit;

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data?.data || []} />
      
      <div className="flex items-center justify-between px-2 py-4">
        <p className="text-sm text-muted-foreground">
          {t("Page")} {page}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-black/5 bg-white shadow-sm disabled:opacity-50 transition-all hover:bg-black/5"
          >
            {t("Previous")}
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-black/5 bg-[#002626] text-white shadow-sm disabled:opacity-50 transition-all hover:bg-[#002626]/90"
          >
            {t("Next")}
          </button>
        </div>
      </div>
    </div>
  );
}

function InvitationListTab() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useAdminDelegateRequests(page, limit);
  const { t } = useTranslation();

  const columns = [
    {
      header: "#",
      accessor: (_: any, index: number) => (
        <span className="text-muted-foreground font-mono text-xs">
          {(page - 1) * limit + index + 1}
        </span>
      )
    },
    { 
      header: "Student", 
      accessor: (r: any) => (
        <span className="font-bold text-[#002626]">{r.student?.name}</span>
      )
    },
    { header: "From (Parent)", accessor: (r: any) => r.parent?.name || r.parent?.email },
    { header: "To (Delegate Phone)", accessor: (r: any) => r.delegatePhone },
    { 
      header: "Status", 
      accessor: (r: any) => (
        <Badge 
          className={
            r.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : 
            r.status === 'PENDING' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none' : 
            'bg-red-100 text-red-700 hover:bg-red-100 shadow-none'
          }
        >
          {r.status}
        </Badge>
      )
    },
    { header: "Requested At", accessor: (r: any) => format(new Date(r.createdAt), "MMM d, HH:mm") },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#002626]" /></div>;

  const hasMore = (data?.data?.length || 0) === limit;

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data?.data || []} />
      
      <div className="flex items-center justify-between px-2 py-4">
        <p className="text-sm text-muted-foreground">
          {t("Page")} {page}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-black/5 bg-white shadow-sm disabled:opacity-50 transition-all hover:bg-black/5"
          >
            {t("Previous")}
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-black/5 bg-[#002626] text-white shadow-sm disabled:opacity-50 transition-all hover:bg-[#002626]/90"
          >
            {t("Next")}
          </button>
        </div>
      </div>
    </div>
  );
}
