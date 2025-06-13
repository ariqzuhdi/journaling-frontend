import { QueryClient, QueryFunction } from "@tanstack/react-query";

export class ApiError extends Error {
  response: Response;
  constructor(message: string, response: Response) {
    super(message);
    this.name = 'ApiError';
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function apiRequest(
  method: string,
  url: string,
  body?: any
): Promise<Response> {

  const token = localStorage.getItem('token');

  const response = await fetch(API_BASE_URL+`${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && {Authorization: `Bearer ${token}`})
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  if (!response.ok) {
    throw new ApiError('API Error', response);
  }

  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    const token = localStorage.getItem("token");

    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
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
