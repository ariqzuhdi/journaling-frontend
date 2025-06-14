import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { User } from "@/types/user";

export function useCurrentUser() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    setToken(stored);
  }, []); // hanya ambil sekali saat mount

  return useQuery<User | null>({
    queryKey: ['current-user'],
    queryFn: getQueryFn({ url: '/api/user', on401: "returnNull" }),
    enabled: !!token,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  });
}
