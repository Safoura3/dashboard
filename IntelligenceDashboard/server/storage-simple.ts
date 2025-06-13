import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import { users, veille, type User, type InsertUser, type Veille, type InsertVeille } from "@shared/schema";

let db: any = null;
let useDatabase = false;

// Sample data for fallback
const sampleVeilleData: Veille[] = [
  {
    id: 1,
    link: "https://www.zdnet.fr/actualites/intelligence-artificielle-openai-devoile-gpt-4-turbo-39963313.htm",
    content: "OpenAI dévoile GPT-4 Turbo, une version améliorée de son modèle de langage avec une fenêtre de contexte étendue et des coûts réduits.",
    priority_score: 95,
    keyword: "GPT-4",
    status: "active",
    sentiment: "positive"
  },
  {
    id: 2,
    link: "https://www.lemonde.fr/pixels/article/2024/01/15/cybersecurite-les-attaques-par-ransomware-en-hausse-de-41-en-2023_6212345_4408996.html",
    content: "Les attaques par ransomware ont augmenté de 41% en 2023, touchant particulièrement les secteurs de la santé et de l'éducation.",
    priority_score: 88,
    keyword: "cybersécurité",
    status: "active",
    sentiment: "negative"
  },
  {
    id: 3,
    link: "https://example.com/data-privacy",
    content: "Nouvelles réglementations européennes sur la protection des données personnelles",
    priority_score: 70,
    keyword: "RGPD",
    status: "archived",
    sentiment: "neutral"
  },
  {
    id: 4,
    link: "https://techcrunch.com/blockchain-adoption",
    content: "L'adoption de la blockchain accélère dans le secteur financier français",
    priority_score: 82,
    keyword: "blockchain",
    status: "active",
    sentiment: "positive"
  },
  {
    id: 5,
    link: "https://www.usine-digitale.fr/article/5g-deploiement-france-2024.html",
    content: "Le déploiement de la 5G en France atteint 75% de couverture territoriale en 2024",
    priority_score: 77,
    keyword: "5G",
    status: "monitoring",
    sentiment: "neutral"
  }
];

async function initializeDatabase() {
  const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
  
  if (supabaseUrl && 
      !supabaseUrl.includes('[YOUR-PASSWORD]') &&
      supabaseUrl.includes('pooler.supabase.com')) {
    try {
      const sql = neon(supabaseUrl);
      db = drizzle(sql);
      
      // Test connection
      await sql`SELECT 1 as test`;
      useDatabase = true;
      console.log("✓ Connected directly to Supabase database");
      
      // Ensure table exists and has data
      await ensureTableWithData();
      
    } catch (error: any) {
      console.log("✗ Supabase database connection failed:", error.message);
      useDatabase = false;
    }
  } else {
    console.log("✗ No valid Supabase DATABASE_URL found");
    useDatabase = false;
  }
}

async function ensureTableWithData() {
  if (!db) return;
  
  try {
    // Check if table exists
    const existingData = await db.select().from(veille).limit(1);
    console.log("Table exists with data");
  } catch (error: any) {
    console.log("Creating table and inserting sample data...");
    try {
      const sql = neon(process.env.SUPABASE_DATABASE_URL!);
      
      // Create table
      await sql`
        CREATE TABLE IF NOT EXISTS veille (
          id SERIAL PRIMARY KEY,
          link TEXT NOT NULL,
          content TEXT NOT NULL,
          priority_score INTEGER NOT NULL,
          keyword TEXT NOT NULL,
          status TEXT NOT NULL,
          sentiment TEXT NOT NULL
        );
      `;
      
      // Insert sample data
      for (const item of sampleVeilleData) {
        await sql`
          INSERT INTO veille (link, content, priority_score, keyword, status, sentiment) 
          VALUES (${item.link}, ${item.content}, ${item.priority_score}, ${item.keyword}, ${item.status}, ${item.sentiment})
          ON CONFLICT (link) DO NOTHING;
        `;
      }
      
      console.log("Table created with sample data");
    } catch (createError: any) {
      console.log("Failed to create table:", createError.message);
    }
  }
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

class MemoryStorage implements IStorage {
  private veilleItems: Veille[] = [...sampleVeilleData];
  private users: User[] = [];
  private nextVeilleId = 6;
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
      username: insertUser.username,
      password: insertUser.password
    };
    this.users.push(user);
    return user;
  }

  async getAllVeille(): Promise<Veille[]> {
    return this.veilleItems;
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

class SupabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    if (!useDatabase || !db) return undefined;
    
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error: any) {
      console.log("Error getting user:", error.message);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!useDatabase || !db) return undefined;
    
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error: any) {
      console.log("Error getting user by username:", error.message);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!useDatabase || !db) throw new Error("Database not available");
    
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error: any) {
      console.log("Error creating user:", error.message);
      throw error;
    }
  }

  async getAllVeille(): Promise<Veille[]> {
    if (!useDatabase || !db) return [];
    
    try {
      const result = await db.select().from(veille).orderBy(desc(veille.id));
      return result;
    } catch (error: any) {
      console.log("Error getting all veille:", error.message);
      return [];
    }
  }

  async getVeille(id: number): Promise<Veille | undefined> {
    if (!useDatabase || !db) return undefined;
    
    try {
      const result = await db.select().from(veille).where(eq(veille.id, id)).limit(1);
      return result[0];
    } catch (error: any) {
      console.log("Error getting veille:", error.message);
      return undefined;
    }
  }

  async createVeille(insertVeille: InsertVeille): Promise<Veille> {
    if (!useDatabase || !db) throw new Error("Database not available");
    
    try {
      const result = await db.insert(veille).values(insertVeille).returning();
      return result[0];
    } catch (error: any) {
      console.log("Error creating veille:", error.message);
      throw error;
    }
  }

  async updateVeille(id: number, updateData: Partial<InsertVeille>): Promise<Veille | undefined> {
    if (!useDatabase || !db) return undefined;
    
    try {
      const result = await db.update(veille).set(updateData).where(eq(veille.id, id)).returning();
      return result[0];
    } catch (error: any) {
      console.log("Error updating veille:", error.message);
      return undefined;
    }
  }

  async deleteVeille(id: number): Promise<boolean> {
    if (!useDatabase || !db) return false;
    
    try {
      await db.delete(veille).where(eq(veille.id, id));
      return true;
    } catch (error: any) {
      console.log("Error deleting veille:", error.message);
      return false;
    }
  }
}

// Initialize database on startup
initializeDatabase();

export const storage = useDatabase ? new SupabaseStorage() : new MemoryStorage();
console.log(useDatabase ? "✓ Using Supabase database storage" : "⚠ Using in-memory storage fallback");