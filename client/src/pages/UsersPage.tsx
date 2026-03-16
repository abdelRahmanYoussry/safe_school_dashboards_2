import { useState } from "react";
import { PageTransition } from "@/components/layout/AppLayout";
import { useSuperAdminUsers } from "@/hooks/use-super-admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const ROLE_COLORS: Record<string, string> = {
  SCHOOL_ADMIN: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  TEACHER: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  PARENT: "bg-green-500/10 text-green-600 border-green-500/20",
  DELEGATE: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  GUARD: "bg-red-500/10 text-red-600 border-red-500/20",
  SUPERVISOR: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  SPECIALIST: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  EMPLOYEE: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
};

const ROLES = ["", "SCHOOL_ADMIN", "TEACHER", "PARENT", "DELEGATE", "GUARD", "SUPERVISOR", "SPECIALIST", "EMPLOYEE"];

export default function UsersPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const limit = 20;

  const { data, isLoading } = useSuperAdminUsers(page, limit, {
    search: search || undefined,
    role: roleFilter || undefined,
  });

  const users: any[] = (data?.data || []) as any[];
  const total: number = data?.meta?.total || 0;
  const totalPages: number = data?.meta?.totalPages || Math.max(1, Math.ceil(total / limit));
  console.log('[UsersPage] data:', { total, page, limit, totalPages, usersLength: users.length });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            {t("All Users")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("All registered users across every school on the platform.")}</p>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          {total} {t("total")}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            className="pl-9 bg-black/[0.03] border-black/10 rounded-xl h-10"
            placeholder={t("Search name, phone or email…")}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} className="h-10 px-5 rounded-xl font-bold">{t("Search")}</Button>
        <select
          className="h-10 rounded-xl border border-black/10 bg-black/[0.03] px-3 text-sm appearance-none min-w-[140px]"
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="">{t("All Roles")}</option>
          {ROLES.filter(Boolean).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl overflow-hidden border border-black/[0.07] shadow-sm">
        <Table>
          <TableHeader className="bg-black/[0.03] border-b border-black/[0.07]">
            <TableRow className="hover:bg-transparent h-12 text-muted-foreground/60 uppercase text-[10px] font-black tracking-widest">
              <TableHead className="pl-6 pr-2 w-12">#</TableHead>
              <TableHead className="px-2">{t("Name")}</TableHead>
              <TableHead className="px-2">{t("Phone")}</TableHead>
              <TableHead className="px-2">{t("Email")}</TableHead>
              <TableHead className="px-2">{t("Role")}</TableHead>
              <TableHead className="px-2">{t("School")}</TableHead>
              <TableHead className="px-2">{t("Status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(8).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6 pr-2 py-4 w-12"><Skeleton className="h-5 w-5 bg-black/[0.04] rounded" /></TableCell>
                  <TableCell className="px-2 py-4"><Skeleton className="h-9 w-44 bg-black/[0.04] rounded-xl" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-5 w-28 bg-black/[0.04] rounded" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-5 w-36 bg-black/[0.04] rounded" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-6 w-20 bg-black/[0.04] rounded-lg" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-5 w-32 bg-black/[0.04] rounded" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-6 w-16 bg-black/[0.04] rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">{t("No users found.")}</TableCell>
              </TableRow>
            ) : users.map((user, index) => (
              <TableRow key={user.id} className="border-b border-black/[0.05] hover:bg-black/[0.01] transition-colors">
                <TableCell className="pl-6 pr-2 py-4 font-bold text-muted-foreground/40 text-xs w-12">
                  {(page - 1) * limit + index + 1}
                </TableCell>
                <TableCell className="px-2 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#002626] to-[#045655] flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                      {(user.name || "?").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground leading-tight">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground/50 uppercase tracking-tight">ID: {user.id.substring(0, 8)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-2 text-muted-foreground font-medium text-sm">{user.phone}</TableCell>
                <TableCell className="px-2 text-sm">
                  {user.email ? (
                    <span className="text-xs text-primary/70 font-bold bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">{user.email}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40 italic">—</span>
                  )}
                </TableCell>
                <TableCell className="px-2">
                  <Badge variant="outline" className={`font-bold px-2 py-0.5 rounded-lg text-xs ${ROLE_COLORS[user.role] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 text-sm text-muted-foreground font-medium">
                  {user.school?.name || <span className="text-muted-foreground/40 italic text-xs">—</span>}
                </TableCell>
                <TableCell className="px-2">
                  <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold" : "font-bold"}>
                    {user.isActive ? t("Active") : t("Inactive")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t("Page")} {page} {t("of")} {totalPages} &nbsp;·&nbsp; {total} {t("total")}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading} className="border-black/10 rounded-xl">
            {t("Previous")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages || isLoading} className="border-black/10 rounded-xl">
            {t("Next")}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
