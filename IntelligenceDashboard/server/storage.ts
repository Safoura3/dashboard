import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, sql } from "drizzle-orm";
import { users, veille, type User, type InsertUser, type Veille, type InsertVeille } from "@shared/schema";
import { SupabaseSync, isSupabaseConnected } from "./supabase-client";

// Initialize database connection only if DATABASE_URL is properly formatted
let db: any = null;
let useDatabase = false;

// Initialize local database connection first
let localDb: any = null;
let supabaseDb: any = null;
let useLocalDatabase = false;
let useSupabaseDatabase = false;

// Connect to local database (primary)
if (process.env.DATABASE_URL) {
  try {
    const localSql = neon(process.env.DATABASE_URL);
    localDb = drizzle(localSql);
    db = localDb; // Primary database
    useDatabase = true;
    useLocalDatabase = true;
    console.log("Connected to local PostgreSQL database");
  } catch (error: any) {
    console.log("Local database connection failed:", error.message);
  }
} else {
  console.log("No DATABASE_URL found");
}

// Initialize Supabase connection (async function to handle top-level await)
async function initializeSupabase() {
  let supabaseUrl = process.env.SUPABASE_DATABASE_URL;
  if (supabaseUrl && 
      !supabaseUrl.includes('[YOUR-PASSWORD]') &&
      supabaseUrl.includes('pooler.supabase.com')) {
    try {
      const supabaseSql = neon(supabaseUrl);
      supabaseDb = drizzle(supabaseSql);
      
      // Test the connection
      await supabaseSql`SELECT 1 as test`;
      useSupabaseDatabase = true;
      console.log("Connected to Supabase database for synchronization");
    } catch (error: any) {
      console.log("Supabase connection failed:", error.message);
      useSupabaseDatabase = false;
    }
  }
}

// Initialize Supabase connection
initializeSupabase().catch(err => {
  console.log("Failed to initialize Supabase:", err.message);
});

if (!useLocalDatabase && !useSupabaseDatabase) {
  console.log("No valid database connections available, using in-memory storage");
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllVeille(): Promise<Veille[]>;
  getVeille(id: number): Promise<Veille | undefined>;
  createVeille(item: InsertVeille): Promise<Veille>;
  updateVeille(id: number, item: Partial<InsertVeille>): Promise<Veille | undefined>;
  deleteVeille(id: number): Promise<boolean>;
}

// In-memory storage for fallback
class MemoryStorage implements IStorage {
  private veilleItems: Veille[] = [
    {
      id: 1,
      link: "https://example.com/crypto-regulation",
      content: "Nouvelle réglementation européenne sur les cryptomonnaies adoptée par le Parlement",
      priority_score: 85,
      keyword: "cryptomonnaie",
      status: "publié",
      sentiment: "neutre"
    },
    {
      id: 2,
      link: "https://example.com/ai-breakthrough",
      content: "Percée majeure dans l'intelligence artificielle pour la reconnaissance vocale",
      priority_score: 92,
      keyword: "intelligence artificielle",
      status: "en cours",
      sentiment: "positif"
    },
    {
      id: 3,
      link: "https://example.com/data-privacy",
      content: "Violation de données personnelles chez un géant de la tech",
      priority_score: 78,
      keyword: "sécurité",
      status: "archivé",
      sentiment: "négatif"
    }
  ];
  private users: User[] = [];
  private nextVeilleId = 4;
  private nextUserId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      ...insertUser
    };
    this.users.push(user);
    return user;
  }

  async getAllVeille(): Promise<Veille[]> {
    return [...this.veilleItems].sort((a, b) => b.id - a.id);
  }

  async getVeille(id: number): Promise<Veille | undefined> {
    return this.veilleItems.find(item => item.id === id);
  }

  async createVeille(insertVeille: InsertVeille): Promise<Veille> {
    const veilleItem: Veille = {
      id: this.nextVeilleId++,
      ...insertVeille
    };
    this.veilleItems.push(veilleItem);
    return veilleItem;
  }

  async updateVeille(id: number, updateData: Partial<InsertVeille>): Promise<Veille | undefined> {
    const index = this.veilleItems.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    
    this.veilleItems[index] = { ...this.veilleItems[index], ...updateData };
    return this.veilleItems[index];
  }

  async deleteVeille(id: number): Promise<boolean> {
    const index = this.veilleItems.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.veilleItems.splice(index, 1);
    return true;
  }
}

export class DatabaseStorage implements IStorage {
  // Sync data to Supabase using the new client
  private async syncToSupabase(operation: string, data: any): Promise<boolean> {
    if (!isSupabaseConnected) {
      console.log(`Supabase sync skipped for ${operation} - not connected`);
      return false;
    }
    
    try {
      switch (operation) {
        case 'create_veille':
          return await SupabaseSync.syncArticle(data);
        case 'update_veille':
          return await SupabaseSync.updateArticle(data.id, data.updateData);
        case 'delete_veille':
          return await SupabaseSync.deleteArticle(data.id);
        case 'bulk_sync':
          const localArticles = await db.select().from(veille);
          const result = await SupabaseSync.syncAllArticles(localArticles);
          return result.success;
      }
      return false;
    } catch (error: any) {
      console.log(`✗ Sync to Supabase failed for ${operation}:`, error.message);
      return false;
    }
  }

  async syncAllToSupabase(): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const localArticles = await db.select().from(veille);
      const result = await SupabaseSync.syncAllArticles(localArticles);
      
      return { 
        success: result.success, 
        message: `Synchronisé ${result.synced}/${result.total} articles avec Supabase`,
        count: result.synced
      };
    } catch (error: any) {
      return { success: false, message: `Erreur de synchronisation: ${error.message}` };
    }
  }

  async getSupabaseStatus(): Promise<{ connected: boolean; count: number }> {
    const connected = await SupabaseSync.isConnected();
    const count = connected ? await SupabaseSync.getCount() : 0;
    return { connected, count };
  }

  async getUser(id: number): Promise<User | undefined> {
    if (!useDatabase) throw new Error("Database not available");
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!useDatabase) throw new Error("Database not available");
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!useDatabase) throw new Error("Database not available");
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllVeille(): Promise<Veille[]> {
    if (!useDatabase) throw new Error("Database not available");
    return await db.select().from(veille).orderBy(desc(veille.id));
  }

  async getVeille(id: number): Promise<Veille | undefined> {
    if (!useDatabase) throw new Error("Database not available");
    const result = await db.select().from(veille).where(eq(veille.id, id)).limit(1);
    return result[0];
  }

  async createVeille(insertVeille: InsertVeille): Promise<Veille> {
    if (!useDatabase) throw new Error("Database not available");
    const result = await db.insert(veille).values(insertVeille).returning();
    const newVeille = result[0];
    
    // Sync to Supabase
    await this.syncToSupabase('create_veille', insertVeille);
    
    return newVeille;
  }

  async updateVeille(id: number, updateData: Partial<InsertVeille>): Promise<Veille | undefined> {
    if (!useDatabase) throw new Error("Database not available");
    const result = await db.update(veille).set(updateData).where(eq(veille.id, id)).returning();
    const updatedVeille = result[0];
    
    // Sync to Supabase
    if (updatedVeille) {
      await this.syncToSupabase('update_veille', { id, updateData });
    }
    
    return updatedVeille;
  }

  async deleteVeille(id: number): Promise<boolean> {
    if (!useDatabase) throw new Error("Database not available");
    const result = await db.delete(veille).where(eq(veille.id, id));
    const deleted = result.rowCount > 0;
    
    // Sync to Supabase
    if (deleted) {
      await this.syncToSupabase('delete_veille', { id });
    }
    
    return deleted;
  }
}

export const storage = useDatabase ? new DatabaseStorage() : new MemoryStorage();
