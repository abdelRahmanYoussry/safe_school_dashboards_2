import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { scopedFetch } from "@/lib/queryClient";
import { ANALYTICS_DATA } from "@/lib/analyticsData";


export function useDashboardStats() {
  return useQuery({
    queryKey: [api.stats.dashboard.path],
    queryFn: async () => {
      const res = await scopedFetch(api.stats.dashboard.path);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      return api.stats.dashboard.responses[200].parse(data);
    },
  });
}

// (This chunk is just to remove the misplaced import if it exists)
// It was added after line 16 in previous step


export function useAnalytics() {
  return useQuery({
    queryKey: [api.stats.analytics.path],
    queryFn: async () => {
      // Mocked data as per user request to use the specific model
      return ANALYTICS_DATA;
    },
  });
}

export function useSafetyAnalytics(schoolId?: string) {
  const path = api.stats.safetyAnalytics.path;
  const url = schoolId ? `${path}?schoolId=${schoolId}` : path;

  return useQuery({
    queryKey: [path, schoolId],
    queryFn: async () => {
      const res = await scopedFetch(url);
      if (!res.ok) throw new Error("Failed to fetch safety analytics");
      const data = await res.json();
      return api.stats.safetyAnalytics.responses[200].parse(data);
    },
  });
}
