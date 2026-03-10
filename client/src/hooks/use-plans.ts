import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function usePlans() {
  return useQuery({
    queryKey: [api.plans.list.path],
    queryFn: async () => {
      const res = await fetch(api.plans.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch plans");
      return api.plans.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.plans.create.input>) => {
      const res = await fetch(api.plans.create.path, {
        method: api.plans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as any;
        const msg = Array.isArray(err?.message) ? err.message.join(", ") : (err?.message || "Failed to create plan");
        throw new Error(msg);
      }
      return api.plans.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.plans.list.path] }),
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & z.infer<typeof api.plans.update.input>) => {
      const url = buildUrl(api.plans.update.path, { id });
      const res = await fetch(url, {
        method: api.plans.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update plan");
      return api.plans.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.plans.list.path] }),
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.plans.delete.path, { id });
      const res = await fetch(url, {
        method: api.plans.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete plan");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.plans.list.path] }),
  });
}
