import { users, posts, type User, type InsertUser, type Post, type InsertPost } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  createPost(post: InsertPost & { userId: number }): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  getPostsByUsername(username: string): Promise<Post[]>;
  updatePost(id: number, updates: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  getAllPosts(): Promise<Post[]>;
  getSession(sessionId: string): Promise<{ userId: number } | undefined>;
  getUserById(id: number): Promise<User | undefined>;

}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private currentUserId: number;
  private currentPostId: number;
  private sessions: Map<string, { userId: number }>;


  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.sessions = new Map();

    
    // Create a default user for testing
    this.createUser({ username: "sarah", password: "password" }).then(() => {
      // Add some sample journal entries
      this.createPost({
        title: "Finding Peace in Morning Routines",
        body: "<p>Today I woke up feeling more centered than usual. There's something magical about those first few moments when the world is still quiet and my mind hasn't yet filled with the day's worries.</p><p>I've been trying to establish a morning routine that feeds my soul rather than rushing into productivity. Simple things like making tea mindfully, looking out the window at the garden, and writing in this journal have become sacred moments.</p><p>I'm learning that how I start my day sets the tone for everything that follows. When I rush, everything feels chaotic. When I move slowly and intentionally, there's space for peace to emerge.</p>",
        userId: 1,
      });

      this.createPost({
        title: "Gratitude for Small Moments",
        body: "<p>Had coffee with a friend today and realized how much I've missed meaningful conversations. We talked about everything and nothing - the kind of conversation that leaves you feeling understood and less alone in the world.</p><p>Sometimes I forget that connection doesn't always have to be profound or life-changing. Today reminded me that showing up authentically for someone else is one of the most beautiful gifts we can offer.</p><p>Feeling grateful for friendship, for laughter, and for the reminder that I don't have to carry everything alone.</p>",
        userId: 1,
      });

      this.createPost({
        title: "Embracing the Messy Middle",
        body: "<p>I'm in one of those phases where everything feels uncertain. Work decisions, relationship questions, future plans - it all feels like I'm walking through fog without a clear destination.</p><p>But maybe that's okay. Maybe the messy middle is where growth happens. Maybe uncertainty is not something to solve but something to dance with.</p><p>Today I'm choosing to trust the process, even when I can't see the outcome. Sometimes the most courageous thing we can do is keep going without knowing where we're headed.</p>",
        userId: 1,
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPost(post: InsertPost & { userId: number }): Promise<Post> {
    const id = this.currentPostId++;
    const now = new Date();
    const newPost: Post = {
      ...post,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPostsByUsername(username: string): Promise<Post[]> {
    const user = await this.getUserByUsername(username);
    if (!user) return [];
    return this.getPostsByUserId(user.id);
  }

  async updatePost(id: number, updates: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost: Post = {
      ...post,
      ...updates,
      updatedAt: new Date(),
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSession(sessionId: string): Promise<{ userId: number } | undefined> {
  return this.sessions.get(sessionId);
}

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

}

export const storage = new MemStorage();
