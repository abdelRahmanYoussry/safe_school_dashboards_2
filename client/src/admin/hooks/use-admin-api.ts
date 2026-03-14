import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { scopedFetch } from "@/lib/queryClient";

export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await scopedFetch(api.admin.stats.path);
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
  });
}

export function useAdminStudents(page = 1, limit = 20, search?: string) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  const url = `${api.admin.students.path}?${queryParams.toString()}`;

  return useQuery({
    queryKey: [api.admin.students.path, page, limit, search],
    queryFn: async () => {
      const res = await scopedFetch(url);
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });
}

export function useAdminParents(page = 1, limit = 20, search?: string) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  const url = `${api.admin.parents.path}?${queryParams.toString()}`;

  return useQuery({
    queryKey: [api.admin.parents.path, page, limit, search],
    queryFn: async () => {
      const res = await scopedFetch(url);
      if (!res.ok) throw new Error("Failed to fetch parents");
      return res.json();
    },
  });
}

export function useAdminDelegates(page = 1, limit = 20, search?: string) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  const url = `${api.admin.delegates.path}?${queryParams.toString()}`;

  return useQuery({
    queryKey: [api.admin.delegates.path, page, limit, search],
    queryFn: async () => {
      const res = await scopedFetch(url);
      if (!res.ok) throw new Error("Failed to fetch delegates");
      return res.json();
    },
  });
}

export function useAdminDelegateRequests(page = 1, limit = 20) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  const url = `${api.admin.delegateRequests.path}?${queryParams.toString()}`;

  return useQuery({
    queryKey: [api.admin.delegateRequests.path, page, limit],
    queryFn: async () => {
      const res = await scopedFetch(url);
      if (!res.ok) throw new Error("Failed to fetch delegate requests");
      return res.json();
    },
  });
}

export function useAdminPickupActive() {
  return useQuery({
    queryKey: [api.admin.pickupActive.path],
    queryFn: async () => {
      const res = await scopedFetch(api.admin.pickupActive.path);
      if (!res.ok) throw new Error("Failed to fetch active pickups");
      return res.json();
    },
    refetchInterval: 5000,
  });
}

export function useAdminStaff(page = 1, limit = 20, role?: string) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(role && { role }),
  });
  const url = `${api.admin.staff.path}?${queryParams.toString()}`;

  return useQuery({
    queryKey: [api.admin.staff.path, page, limit, role],
    queryFn: async () => {
      const res = await scopedFetch(url);
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    },
  });
}

export function useAdminDrivers(page = 1, limit = 20) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  const url = `${api.admin.drivers.path}?${queryParams.toString()}`;

  return useQuery({
    queryKey: [api.admin.drivers.path, page, limit],
    queryFn: async () => {
      const res = await scopedFetch(url);
      if (!res.ok) throw new Error("Failed to fetch drivers");
      return res.json();
    },
  });
}

export function useAdminBuses() {
  return useQuery({
    queryKey: [api.admin.buses.path],
    queryFn: async () => {
      const res = await scopedFetch(api.admin.buses.path);
      if (!res.ok) throw new Error("Failed to fetch buses");
      return res.json();
    },
  });
}

export function useAdminInvitationCodes() {
  return useQuery({
    queryKey: [api.admin.invitationCodes.path],
    queryFn: async () => {
      const res = await scopedFetch(api.admin.invitationCodes.path);
      if (!res.ok) throw new Error("Failed to fetch invitation codes");
      return res.json();
    },
  });
}
