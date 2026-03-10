import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useSafetyReports() {
  return useQuery({
    queryKey: [api.safetyReports.list.path],
    queryFn: async () => {
      const res = await fetch(api.safetyReports.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch safety reports");
      return api.safetyReports.list.responses[200].parse(await res.json());
    },
  });
}

export function useTickets() {
  return useQuery({
    queryKey: [api.tickets.list.path],
    queryFn: async () => {
      const res = await fetch(api.tickets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return api.tickets.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & z.infer<typeof api.tickets.update.input>) => {
      const url = buildUrl(api.tickets.update.path, { id });
      const res = await fetch(url, {
        method: api.tickets.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update ticket");
      return api.tickets.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tickets.list.path] }),
  });
}

export function useAuditLogs(params?: { page?: number, limit?: number, userId?: number, action?: string }) {
  const page = params?.page || 1;
  const limit = params?.limit || 20;

  return useQuery({
    queryKey: [api.auditLogs.list.path, page, limit, params?.userId, params?.action],
    queryFn: async () => {
      const url = new URL(api.auditLogs.list.path, window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      if (params?.userId) url.searchParams.append("userId", params.userId.toString());
      if (params?.action) url.searchParams.append("action", params.action);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return api.auditLogs.list.responses[200].parse(await res.json());
    },
  });
}
