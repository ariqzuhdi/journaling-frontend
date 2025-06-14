import { apiRequest } from './queryClient';
import type { Post, InsertPost } from '@shared/schema';
import { fetchWithAuth } from './fetch';

// Go backend response format
export interface GoApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

interface AuthResponse {
  token: string;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:3000';

export const api = {
  posts: {
    create: async (post: InsertPost): Promise<Post> => {
      const response = await apiRequest('POST', '/api/posts', post);
      const result: GoApiResponse<Post> = await response.json();
      return result.data || result as Post;
    },

    getById: async (id: number): Promise<Post> => {
      const response = await apiRequest('GET', `/api/posts/${id}`);
      const result: GoApiResponse<Post> = await response.json();
      return result.data || result as Post;
    },

    getByUsername: async (username: string, pageg = 1, limit = 3): Promise<Post[]> => {
      const response = await apiRequest('GET', `/api/posts/user/${username}`);
      const result: GoApiResponse<Post[]> = await response.json();
      return result.data || result as Post[];
    },

    update: async (id: number, updates: Partial<InsertPost>): Promise<Post> => {
      const response = await apiRequest('PUT', `/api/posts/${id}`, updates);
      const result: GoApiResponse<Post> = await response.json();
      return result.data || result as Post;
    },

    delete: async (id: number): Promise<void> => {
      await apiRequest('DELETE', `/api/posts/${id}`);
    },

    getAll: async (): Promise<Post[]> => {
      const response = await apiRequest('GET', '/api/posts');
      const result: GoApiResponse<Post[]> = await response.json();
      return result.data || result as Post[];
    }
  },

auth: {
    login: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Failed to login');
      }

      return await res.json();
    },

    currentUser: async () => {
      return await fetchWithAuth(`${API_BASE_URL}/api/user`);
    },

    register: async (userData: { username: string; email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/register', userData);
      return await response.json();
    },


    logout: async () => {
      await apiRequest('POST', '/api/logout');
    },

    getCurrentUser: async () => {
      const response = await apiRequest('GET', '/api/user');
      const result: GoApiResponse<any> = await response.json();
      return result.data || result;
    }
  }
};
