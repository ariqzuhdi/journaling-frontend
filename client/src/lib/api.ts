import { apiRequest } from './queryClient';
import type { Post, InsertPost } from '@shared/schema';
import { fetchWithAuth } from './fetch';
import { encrypt, decrypt, importKeyFromBase64 } from '@/lib/crypto';

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

const getKeyFromSession = async () => {
  const base64 = sessionStorage.getItem('derivedKey');
  if (!base64) throw new Error('Missing encryption key');
  return await importKeyFromBase64(base64);
};

const decryptPost = async (post: Post): Promise<Post> => {
  try {
    const key = await getKeyFromSession();
    const title = await decrypt(post.title, key);
    const body = await decrypt(post.body, key);

    return {
      ...post,
      title,
      body,
    };
  } catch (err) {
    return {
      ...post,
      title: '[Error decrypting]',
      body: '[Error decrypting]',
    };
  }
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  posts: {
    create: async (post: InsertPost): Promise<Post> => {
      const key = await getKeyFromSession();

      const encryptedPost = {
        ...post,
        title: await encrypt(post.title, key),
        body: await encrypt(post.body, key),
      };

      const response = await apiRequest('POST', '/api/posts', encryptedPost);
      const result: GoApiResponse<Post> = await response.json();
      return result.data || result as Post;
    },

    getById: async (id: number): Promise<Post> => {
      const response = await apiRequest('GET', `/api/posts/${id}`);
      const result: GoApiResponse<Post> = await response.json();
      const post = result.data || result as Post;
      return await decryptPost(post);
    },

    getByUsername: async (username: string): Promise<Post[]> => {
      const response = await apiRequest('GET', `/api/posts/user/${username}`);
      const result: GoApiResponse<Post[]> = await response.json();
      const posts = result.data || result as Post[];
      return await Promise.all(posts.map(decryptPost));
    },

    update: async (id: number, updates: Partial<InsertPost>): Promise<Post> => {
      const key = await getKeyFromSession();

      const encryptedUpdates: Partial<InsertPost> = {};
      if (typeof updates.title === 'string' && updates.title.length > 0) {
        encryptedUpdates.title = await encrypt(updates.title, key);
      }
      if (typeof updates.body === 'string' && updates.body.length > 0) {
        encryptedUpdates.body = await encrypt(updates.body, key);
      }

      // 💡 Cek apakah ada field yang diupdate
      if (!encryptedUpdates.title && !encryptedUpdates.body) {
        throw new Error("No valid fields to update");
      }

      const response = await apiRequest('PUT', `/api/posts/${id}`, encryptedUpdates);
      const result: GoApiResponse<Post> = await response.json();
      const encryptedPost = result.data || result as Post;

      return await decryptPost(encryptedPost);
    },

    delete: async (id: number): Promise<void> => {
      await apiRequest('DELETE', `/api/posts/${id}`);
    },

    getAll: async (): Promise<Post[]> => {
      const response = await apiRequest('GET', '/api/posts');
      const result: GoApiResponse<Post[]> = await response.json();
      const posts = result.data || result as Post[];
      return await Promise.all(posts.map(decryptPost));
    },
  },

  auth: {
    login: async ({ identifier, password }: { identifier: string; password: string }) => {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
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
    },

    resetWithRecoveryKey: async ({
      email,
      recoveryKey,
      newPassword,
    }: {
      email: string;
      recoveryKey: string;
      newPassword: string;
    }) => {
      const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, recoveryKey, newPassword }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Failed to reset password');
      }

      return await res.json();
    },
  }
};
