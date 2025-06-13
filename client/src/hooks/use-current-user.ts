// src/hooks/use-current-user.ts
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useCurrentUser() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return useQuery({
    queryKey: ['/api/user'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!token,
    staleTime: Infinity,
    retry: false,
  });
}
