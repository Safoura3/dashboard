import { createClient } from '@supabase/supabase-js';
import { type User, type InsertUser, type Veille, type InsertVeille } from "@shared/schema";

let supabase: any = null;
let useSupabase = false;

// Initialize Supabase client
async function initializeSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test connection by checking if table exists
      const { data, error } = await supabase
        .from('veille')
        .select('count', { count: 'exact', head: true });
      
      if (!error) {
        useSupabase = true;
        console.log("✓ Connected directly to Supabase via API");
        
        // Ensure we have data
        await ensureDataExists();
      } else {
        console.log("✗ Supabase table access failed:", error.message);
        useSupabase = false;
      }
    } catch (error: any) {
      console.log("✗ Supabase client initialization failed:", error.message);
      useSupabase = false;
    }
  } else {
    console.log("✗ Missing Supabase URL or API key");
    useSupabase = false;
  }
}

async function ensureDataExists() {
  if (!supabase) return;
  
  try {
    const { data: existingData, count } = await supabase
      .from('veille')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (existingData && existingData.length > 0) {
      console.log(`✓ Supabase table has ${count} surveillance records`);
      return;
    }
    
    console.log("⚠ No data found in Supabase table");
  } catch (error: any) {
    console.log("Data check error:", error.message);
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

// Fallback memory storage (should not be used when Supabase is available)
class MemoryStorage implements IStorage {
  private veilleItems: Veille[] = [];
  private users: User[] = [];
  private nextVeilleId = 1;
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

// Direct Supabase storage
class SupabaseDirectStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    if (!useSupabase || !supabase) return undefined;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      return error ? undefined : data;
    } catch (error: any) {
      console.log("Error getting user:", error.message);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!useSupabase || !supabase) return undefined;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      return error ? undefined : data;
    } catch (error: any) {
      console.log("Error getting user by username:", error.message);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!useSupabase || !supabase) throw new Error("Supabase not available");
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(insertUser)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.log("Error creating user:", error.message);
      throw error;
    }
  }

  async getAllVeille(): Promise<Veille[]> {
    if (!useSupabase || !supabase) {
      console.log("⚠ Supabase not available, returning empty array");
      return [];
    }
    
    try {
      console.log("🔍 Fetching all veille records from Supabase...");
      const { data, error } = await supabase
        .from('veille')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) {
        console.log("❌ Supabase query error:", error.message);
        return [];
      }
      
      console.log(`✅ Successfully fetched ${data?.length || 0} records from Supabase`);
      return data || [];
    } catch (error: any) {
      console.log("💥 Exception getting all veille:", error.message);
      return [];
    }
  }

  async getVeille(id: number): Promise<Veille | undefined> {
    if (!useSupabase || !supabase) return undefined;
    
    try {
      const { data, error } = await supabase
        .from('veille')
        .select('*')
        .eq('id', id)
        .single();
      
      return error ? undefined : data;
    } catch (error: any) {
      console.log("Error getting veille:", error.message);
      return undefined;
    }
  }

  async createVeille(insertVeille: InsertVeille): Promise<Veille> {
    if (!useSupabase || !supabase) throw new Error("Supabase not available");
    
    try {
      const { data, error } = await supabase
        .from('veille')
        .insert(insertVeille)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.log("Error creating veille:", error.message);
      throw error;
    }
  }

  async updateVeille(id: number, updateData: Partial<InsertVeille>): Promise<Veille | undefined> {
    if (!useSupabase || !supabase) return undefined;
    
    try {
      const { data, error } = await supabase
        .from('veille')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      return error ? undefined : data;
    } catch (error: any) {
      console.log("Error updating veille:", error.message);
      return undefined;
    }
  }

  async deleteVeille(id: number): Promise<boolean> {
    if (!useSupabase || !supabase) return false;
    
    try {
      const { error } = await supabase
        .from('veille')
        .delete()
        .eq('id', id);
      
      return !error;
    } catch (error: any) {
      console.log("Error deleting veille:", error.message);
      return false;
    }
  }
}

// Always use Supabase storage - initialize will set the connection state
const supabaseStorage = new SupabaseDirectStorage();
const memoryStorage = new MemoryStorage();

// Initialize on startup
initializeSupabase();

export const storage = supabaseStorage;
console.log("📡 Attempting Supabase API connection...");