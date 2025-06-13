import { apiRequest } from './queryClient';
import type { Post, InsertPost } from '@shared/schema';

export interface ApiResponse<T> {
  [key: string]: T;
}

export const api = {
  posts: {
    create: async (post: InsertPost): Promise<Post> => {
      const response = await apiRequest('POST', '/api/posts', post);
      const data: ApiResponse<Post> = await response.json();
      return data.post;
    },

    getById: async (id: number): Promise<Post> => {
      const response = await apiRequest('GET', `/api/posts/${id}`);
      const data: ApiResponse<Post> = await response.json();
      return data.post;
    },

    getByUsername: async (username: string): Promise<Post[]> => {
      const response = await apiRequest('GET', `/api/posts/user/${username}`);
      const data: ApiResponse<Post[]> = await response.json();
      return data.posts;
    },

    update: async (id: number, updates: Partial<InsertPost>): Promise<Post> => {
      const response = await apiRequest('PUT', `/api/posts/${id}`, updates);
      const data: ApiResponse<Post> = await response.json();
      return data.post;
    },

    delete: async (id: number): Promise<void> => {
      await apiRequest('DELETE', `/api/posts/${id}`);
    },

    getAll: async (): Promise<Post[]> => {
      const response = await apiRequest('GET', '/api/posts');
      const data: ApiResponse<Post[]> = await response.json();
      return data.posts;
    }
  }
};
