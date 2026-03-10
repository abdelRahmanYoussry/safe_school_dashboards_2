import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useSchools(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [api.schools.list.path, page, limit],
    queryFn: async () => {
      const url = new URL(api.schools.list.path, window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch schools");
      // The current schema expects an array, but standard pagination returns { data, meta }. 
      // We parse what the backend actually returns according to the schema (currently z.array).
      return api.schools.list.responses[200].parse(await res.json());
    },
  });
}

export function useSchool(id: string | number) {
  return useQuery({
    queryKey: [api.schools.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.schools.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch school");
      return api.schools.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData | z.infer<typeof api.schools.create.input>) => {
      const isFormData = data instanceof FormData;
      const res = await fetch(api.schools.create.path, {
        method: api.schools.create.method,
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        body: isFormData ? data : JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to create school" }));
        throw new Error(err.message || "Failed to create school");
      }
      const json = await res.json();
      return json; // Backend returns { message, data: school }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.schools.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.dashboard.path] });
    },
  });
}

export function useAssignSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.subscriptions.assign.input>) => {
      const res = await fetch(api.subscriptions.assign.path, {
        method: api.subscriptions.assign.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to assign subscription" }));
        throw new Error(err.message || "Failed to assign subscription");
      }
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.schools.get.path, variables.schoolId] });
      queryClient.invalidateQueries({ queryKey: [api.schools.list.path] });
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string | number } & z.infer<typeof api.schools.update.input>) => {
      const url = buildUrl(api.schools.update.path, { id });
      const res = await fetch(url, {
        method: api.schools.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update school");
      return api.schools.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.schools.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.schools.get.path, variables.id] });
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const url = buildUrl(api.schools.delete.path, { id });
      const res = await fetch(url, {
        method: api.schools.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete school");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.schools.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.dashboard.path] });
    },
  });
}

export function useSchoolIncidents(id: string | number) {
  return useQuery({
    queryKey: [api.schools.incidents.list.path, id],
    queryFn: async () => {
      const url = buildUrl(api.schools.incidents.list.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch school incidents");
      return api.schools.incidents.list.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ schoolId, ...data }: { schoolId: string | number } & z.infer<typeof api.schools.incidents.create.input>) => {
      const url = buildUrl(api.schools.incidents.create.path, { id: schoolId });
      const res = await fetch(url, {
        method: api.schools.incidents.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to report incident");
      return api.schools.incidents.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.schools.incidents.list.path, variables.schoolId] });
      queryClient.invalidateQueries({ queryKey: [api.stats.safetyAnalytics.path] });
    },
  });
}
