import { apiRequest } from "./queryClient";
import type { Post, InsertPost } from "@shared/schema";
import { fetchWithAuth } from "./fetch";
import {
  encrypt,
  decrypt,
  deriveKeyFromString,
  importKeyFromBase64,
  exportKeyToBase64,
} from "@/lib/crypto";

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
  const base64 = sessionStorage.getItem("derivedKey");
  if (!base64) throw new Error("Missing encryption key");
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
      title: "[Error decrypting]",
      body: "[Error decrypting]",
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

      const response = await apiRequest("POST", "/api/posts", encryptedPost);
      const result: GoApiResponse<Post> = await response.json();
      return result.data || (result as Post);
    },

    getById: async (id: number): Promise<Post> => {
      const response = await apiRequest("GET", `/api/posts/${id}`);
      const result: GoApiResponse<Post> = await response.json();
      const post = result.data || (result as Post);
      return await decryptPost(post);
    },

    getByUsername: async (username: string): Promise<Post[]> => {
      const response = await apiRequest("GET", `/api/posts/user/${username}`);
      const result: GoApiResponse<Post[]> = await response.json();
      const posts = result.data || (result as Post[]);
      return await Promise.all(posts.map(decryptPost));
    },

    update: async (
      id: number,
      updates: Partial<InsertPost>,
      options?: { skipEncryption?: boolean }
    ): Promise<Post> => {
      let payload: Partial<InsertPost>;

      if (options?.skipEncryption) {
        payload = updates;
      } else {
        const key = await getKeyFromSession();
        payload = {};
        if (typeof updates.title === "string" && updates.title.length > 0) {
          payload.title = await encrypt(updates.title, key);
        }
        if (typeof updates.body === "string" && updates.body.length > 0) {
          payload.body = await encrypt(updates.body, key);
        }

        if (!payload.title && !payload.body) {
          throw new Error("No valid fields to update");
        }
      }

      const response = await apiRequest("PUT", `/api/posts/${id}`, payload);
      const result: GoApiResponse<Post> = await response.json();
      const encryptedPost = result.data || (result as Post);

      return await decryptPost(encryptedPost);
    },

    delete: async (id: number): Promise<void> => {
      await apiRequest("DELETE", `/api/posts/${id}`);
    },

    getAll: async (): Promise<Post[]> => {
      const response = await apiRequest("GET", "/api/posts");
      const result: GoApiResponse<Post[]> = await response.json();
      const posts = result.data || (result as Post[]);
      return await Promise.all(posts.map(decryptPost));
    },
  },

  auth: {
    login: async ({
      identifier,
      password,
    }: {
      identifier: string;
      password: string;
    }) => {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to login");
      }

      return await res.json();
    },

    currentUser: async () => {
      return await fetchWithAuth(`${API_BASE_URL}/api/user`);
    },

    register: async (userData: {
      username: string;
      email: string;
      password: string;
    }) => {
      const response = await apiRequest("POST", "/api/register", userData);
      return await response.json();
    },

    logout: async () => {
      await apiRequest("POST", "/api/logout");
    },

    getCurrentUser: async () => {
      const response = await apiRequest("GET", "/api/user");
      const result: GoApiResponse<any> = await response.json();
      return result.data || result;
    },

    resetPasswordWithRecoveryKey: async ({
      recoveryKey,
      newPassword,
    }: {
      recoveryKey: string;
      newPassword: string;
    }) => {
      const oldKey = await getKeyFromSession(); // Ambil derivedKey lama
      console.log("[🔑 OLD DERIVED KEY]", oldKey);
      console.log("[🔐 OLD BASE64]", sessionStorage.getItem("derivedKey"));

      // Step 1: Kirim request ke backend untuk update password
      const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryKey, newPassword }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to reset password");
      }

      // Step 2: Derive key baru dari newPassword
      const newKey = await deriveKeyFromString(newPassword);
      const newKeyBase64 = await exportKeyToBase64(newKey);
      console.log("[🆕 DERIVED KEY]", newKey);
      console.log("[🆕 BASE64]", newKeyBase64);

      // Step 3: Ambil semua post user
      const currentUser = await api.auth.getCurrentUser();
      const posts = await api.posts.getByUsername(currentUser.username);

      // Step 4: Re-encrypt semua post dengan error handling
      const MIN_GCM_LENGTH = 12 + 16;

      await Promise.all(
        posts.map(async (post) => {
          try {
            console.log("➡️ Post ID:", post.id);

            const encryptedTitle = await encrypt(post.title, newKey);
            const encryptedBody = await encrypt(post.body, newKey);
            console.log("🔐 Encrypted title:", encryptedTitle);
            console.log("🔐 Encrypted body:", encryptedBody);

            await api.posts.update(
              post.id,
              {
                title: encryptedTitle,
                body: encryptedBody,
              },
              { skipEncryption: true }
            );
          } catch (e) {
            console.warn(`⚠️ Failed to re-encrypt post ID ${post.id}:`, e);
          }
        })
      );

      // Step 5: Simpan derived key baru ke sessionStorage
      sessionStorage.setItem("derivedKey", newKeyBase64);

      return await res.json();
    },

    changeEmail: async ({ email }: { email: string }) => {
      const token = localStorage.getItem("token");
      console.log(token)
      const res = await fetch(`${API_BASE_URL}/api/account/change-email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to change email");
      }

      return res.json();
    },

    changeUsername: async ({ username }: { username: string }) => {
      const token = localStorage.getItem("token");
      console.log(token)
      const res = await fetch(`${API_BASE_URL}/api/account/change-username`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to change username");
      }

      return res.json();
    },
  },
};
