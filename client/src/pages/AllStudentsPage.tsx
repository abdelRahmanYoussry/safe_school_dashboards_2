import { useState } from "react";
import { PageTransition } from "@/components/layout/AppLayout";
import { useSuperAdminStudents } from "@/hooks/use-super-admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StudentsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 20;

  const { data, isLoading } = useSuperAdminStudents(page, limit, {
    search: search || undefined,
  });

  const students: any[] = (data?.data || []) as any[];
  const total: number = data?.total || 0;
  const totalPages: number = data?.totalPages || Math.max(1, Math.ceil(total / limit));
  console.log('[AllStudentsPage] data:', { total, page, limit, totalPages, studentsLength: students.length });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            {t("All Students")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("All enrolled students across every school on the platform.")}</p>
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
            placeholder={t("Search student name…")}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} className="h-10 px-5 rounded-xl font-bold">{t("Search")}</Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl overflow-hidden border border-black/[0.07] shadow-sm">
        <Table>
          <TableHeader className="bg-black/[0.03] border-b border-black/[0.07]">
            <TableRow className="hover:bg-transparent h-12 text-muted-foreground/60 uppercase text-[10px] font-black tracking-widest">
              <TableHead className="pl-6 pr-2 w-12">#</TableHead>
              <TableHead className="px-2">{t("Name")}</TableHead>
              <TableHead className="px-2">{t("School")}</TableHead>
              <TableHead className="px-2">{t("Grade")}</TableHead>
              <TableHead className="px-2">{t("Parent / Guardian")}</TableHead>
              <TableHead className="px-2">{t("Gender")}</TableHead>
              <TableHead className="px-2">{t("Status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(8).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6 pr-2 py-4 w-12"><Skeleton className="h-5 w-5 bg-black/[0.04] rounded" /></TableCell>
                  <TableCell className="px-2 py-4"><Skeleton className="h-9 w-44 bg-black/[0.04] rounded-xl" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-5 w-32 bg-black/[0.04] rounded" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-5 w-24 bg-black/[0.04] rounded" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-5 w-36 bg-black/[0.04] rounded" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-6 w-16 bg-black/[0.04] rounded-lg" /></TableCell>
                  <TableCell className="px-2"><Skeleton className="h-6 w-16 bg-black/[0.04] rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">{t("No students found.")}</TableCell>
              </TableRow>
            ) : students.map((student, index) => {
              const school = student.grade?.school;
              const guardian = student.authorizations?.[0]?.user;
              return (
                <TableRow key={student.id} className="border-b border-black/[0.05] hover:bg-black/[0.01] transition-colors">
                  <TableCell className="pl-6 pr-2 py-4 font-bold text-muted-foreground/40 text-xs w-12">
                    {(page - 1) * limit + index + 1}
                  </TableCell>
                  <TableCell className="px-2 py-4">
                    <div className="flex items-center gap-3">
                      {student.photo ? (
                        <img src={student.photo} alt={student.name} className="w-9 h-9 rounded-xl object-cover border border-black/[0.07]" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#002626] to-[#045655] flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                          {(student.name || "?").substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground leading-tight">{student.name}</span>
                        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-tight">ID: {student.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 text-sm font-medium text-muted-foreground">
                    {school?.name || <span className="text-muted-foreground/40 italic text-xs">—</span>}
                  </TableCell>
                  <TableCell className="px-2 text-sm">
                    {student.grade?.name ? (
                      <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/20 font-bold text-xs">
                        {student.grade.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/40 italic text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-2 text-sm text-muted-foreground font-medium">
                    {guardian ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{guardian.name}</span>
                        <span className="text-[10px] text-muted-foreground/50">{guardian.phone} · {guardian.role}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40 italic text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-2">
                    {student.gender ? (
                      <Badge variant="outline" className="font-bold text-xs px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 border-gray-200">
                        {student.gender}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/40 italic text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-2">
                    <Badge variant={student.isActive !== false ? "default" : "secondary"} className={student.isActive !== false ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold" : "font-bold"}>
                      {student.isActive !== false ? t("Active") : t("Inactive")}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
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
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={students.length < limit || isLoading} className="border-black/10 rounded-xl">
            {t("Next")}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
