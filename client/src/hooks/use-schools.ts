import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useSchools() {
  return useQuery({
    queryKey: [api.schools.list.path],
    queryFn: async () => {
      const res = await fetch(api.schools.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch schools");
      return api.schools.list.responses[200].parse(await res.json());
    },
  });
}

export function useSchool(id: number) {
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
    mutationFn: async (data: z.infer<typeof api.schools.create.input>) => {
      const res = await fetch(api.schools.create.path, {
        method: api.schools.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create school");
      return api.schools.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.schools.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.dashboard.path] });
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & z.infer<typeof api.schools.update.input>) => {
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
    mutationFn: async (id: number) => {
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
