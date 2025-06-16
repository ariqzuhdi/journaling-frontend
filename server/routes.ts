import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema } from "@shared/schema";
import { any, z } from "zod";
import { requireAuth } from "./middleware/requireAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a new post
  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const body = insertPostSchema.parse(req.body);
      
      const user = (req as any).user;
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const post = await storage.createPost({
        ...body,
        userId: user.id,
      });

      res.json({ post });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Get post by ID
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.json({ post });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // Get all posts for a user by username
  app.get("/api/posts/user/:username", async (req, res) => {
    try {
      const posts = await storage.getPostsByUsername(req.params.username);
      res.json({ posts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Update post
  app.put("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      const body = insertPostSchema.partial().parse(req.body);
      const post = await storage.updatePost(id, body);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.json({ post });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  // Delete post
  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      const deleted = await storage.deletePost(id);
      if (!deleted) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Get all posts (for testing)
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json({ posts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
