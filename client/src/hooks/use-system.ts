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

export function useAuditLogs() {
  return useQuery({
    queryKey: [api.auditLogs.list.path],
    queryFn: async () => {
      const res = await fetch(api.auditLogs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return api.auditLogs.list.responses[200].parse(await res.json());
    },
  });
}
