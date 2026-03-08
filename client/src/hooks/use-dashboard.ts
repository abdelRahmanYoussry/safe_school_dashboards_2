import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.stats.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.stats.dashboard.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      return api.stats.dashboard.responses[200].parse(data);
    },
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: [api.stats.analytics.path],
    queryFn: async () => {
      const res = await fetch(api.stats.analytics.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      return api.stats.analytics.responses[200].parse(data);
    },
  });
}
