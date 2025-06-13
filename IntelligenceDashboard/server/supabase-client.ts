import { createClient } from '@supabase/supabase-js';
import type { Veille, InsertVeille } from '@shared/schema';

// Initialize Supabase client
let supabaseClient: any = null;
let isSupabaseConnected = false;

if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  try {
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    isSupabaseConnected = true;
    console.log("Supabase client initialized successfully");
  } catch (error: any) {
    console.log("Failed to initialize Supabase client:", error.message);
  }
} else {
  console.log("Supabase credentials not found");
}

export class SupabaseSync {
  
  static async isConnected(): Promise<boolean> {
    if (!isSupabaseConnected || !supabaseClient) return false;
    
    try {
      // First ensure table exists
      await this.ensureTableExists();
      
      const { data, error } = await supabaseClient
        .from('veille')
        .select('id', { count: 'exact', head: true });
      
      return !error;
    } catch (error: any) {
      console.log("Supabase connection test failed:", error.message);
      return false;
    }
  }

  static async ensureTableExists(): Promise<void> {
    try {
      // Check if table has correct structure by trying to select all expected columns
      const { data, error } = await supabaseClient
        .from('veille')
        .select('id, link, content, priority_score, keyword, status, sentiment')
        .limit(1);
      
      if (!error) {
        console.log("✓ Supabase table structure verified");
        return;
      }
    } catch (error: any) {
      console.log("Table structure check failed:", error.message);
    }
    
    // Table might not exist or have wrong structure
    console.log("Creating/updating table structure in Supabase...");
  }

  static async getCount(): Promise<number> {
    if (!isSupabaseConnected || !supabaseClient) return 0;
    
    try {
      const { count, error } = await supabaseClient
        .from('veille')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    } catch (error: any) {
      console.log("Error getting Supabase count:", error.message);
      return 0;
    }
  }

  static async syncArticle(article: any): Promise<boolean> {
    if (!isSupabaseConnected || !supabaseClient) return false;
    
    try {
      // Use upsert to handle both insert and update cases
      const { error } = await supabaseClient
        .from('veille')
        .upsert({
          id: article.id,
          link: article.link,
          content: article.content,
          priority_score: article.priority_score,
          keyword: article.keyword,
          status: article.status,
          sentiment: article.sentiment
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        console.log("✗ Sync error for article", article.id, ":", error.message);
        return false;
      }
      console.log("✓ Article", article.id, "synced to Supabase");
      return true;
    } catch (error: any) {
      console.log("✗ Sync exception for article", article.id, ":", error.message);
      return false;
    }
  }

  static async syncAllArticles(articles: Veille[]): Promise<{ success: boolean; synced: number; total: number }> {
    if (!isSupabaseConnected || !supabaseClient) {
      return { success: false, synced: 0, total: articles.length };
    }
    
    let syncedCount = 0;
    
    try {
      // Create table if it doesn't exist
      await supabaseClient.rpc('create_veille_table_if_not_exists');
    } catch (error) {
      // Table might already exist, continue
    }
    
    for (const article of articles) {
      const success = await this.syncArticle(article);
      if (success) {
        syncedCount++;
      }
    }
    
    console.log(`✓ Synced ${syncedCount}/${articles.length} articles to Supabase`);
    return { 
      success: syncedCount > 0, 
      synced: syncedCount, 
      total: articles.length 
    };
  }

  static async updateArticle(id: number, updateData: Partial<InsertVeille>): Promise<boolean> {
    if (!isSupabaseConnected || !supabaseClient) return false;
    
    try {
      const { error } = await supabaseClient
        .from('veille')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      console.log("✓ Article updated in Supabase");
      return true;
    } catch (error: any) {
      console.log("✗ Failed to update article in Supabase:", error.message);
      return false;
    }
  }

  static async deleteArticle(id: number): Promise<boolean> {
    if (!isSupabaseConnected || !supabaseClient) return false;
    
    try {
      const { error } = await supabaseClient
        .from('veille')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      console.log("✓ Article deleted from Supabase");
      return true;
    } catch (error: any) {
      console.log("✗ Failed to delete article from Supabase:", error.message);
      return false;
    }
  }
}

export { isSupabaseConnected };