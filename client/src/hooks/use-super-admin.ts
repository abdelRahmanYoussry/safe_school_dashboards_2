import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

function superFetch(path: string, query?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
  }
  const qs = params.toString();
  return fetch(`${path}${qs ? `?${qs}` : ""}`, { credentials: "include" });
}

export function useSuperAdminUsers(
  page = 1,
  limit = 20,
  opts?: { role?: string; schoolId?: string; search?: string }
) {
  return useQuery({
    queryKey: ["super-users", page, limit, opts?.role, opts?.schoolId, opts?.search],
    queryFn: async () => {
      const res = await superFetch(api.super.users.path, {
        page,
        limit,
        role: opts?.role,
        schoolId: opts?.schoolId,
        search: opts?.search,
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      console.log('[useSuperAdminUsers] Response:', json);
      return json;
    },
  });
}

export function useSuperAdminStudents(
  page = 1,
  limit = 20,
  opts?: { schoolId?: string; search?: string }
) {
  return useQuery({
    queryKey: ["super-students", page, limit, opts?.schoolId, opts?.search],
    queryFn: async () => {
      const res = await superFetch(api.super.students.path, {
        page,
        limit,
        schoolId: opts?.schoolId,
        search: opts?.search,
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });
}

export function useSuperAdminStaff(
  page = 1,
  limit = 20,
  opts?: { role?: string; schoolId?: string; search?: string }
) {
  return useQuery({
    queryKey: ["super-staff", page, limit, opts?.role, opts?.schoolId, opts?.search],
    queryFn: async () => {
      const res = await superFetch(api.super.staff.path, {
        page,
        limit,
        role: opts?.role,
        schoolId: opts?.schoolId,
        search: opts?.search,
      });
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    },
  });
}
