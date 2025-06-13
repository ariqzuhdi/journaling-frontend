import { apiRequest } from './queryClient';
import type { Post, InsertPost } from '@shared/schema';

// Go backend response format
export interface GoApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

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

    getByUsername: async (username: string): Promise<Post[]> => {
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
    login: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/login', credentials);
      return await response.json();
    },

    register: async (userData: { username: string; password: string }) => {
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
