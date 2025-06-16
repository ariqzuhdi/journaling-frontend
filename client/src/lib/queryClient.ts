import { QueryClient, QueryFunction } from "@tanstack/react-query";

export class ApiError extends Error {
  response: Response;
  constructor(message: string, response: Response) {
    super(message);
    this.name = "ApiError";
    this.response = response;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Backend URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export async function apiRequest(
  method: string,
  url: string,
  body?: any
): Promise<Response> {
  const token = localStorage.getItem("token");

  const response = await fetch(API_BASE_URL + `${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError("API Error", response);
  }

  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  url: string;
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ url, on401 }) =>
    async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}${url}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (on401 === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
