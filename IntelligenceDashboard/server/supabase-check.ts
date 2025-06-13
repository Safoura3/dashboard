import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { veille } from "../shared/schema";
import { sql } from "drizzle-orm";

export async function checkSupabaseData() {
  try {
    // Utiliser l'URL Supabase corrigée
    let supabaseUrl = process.env.SUPABASE_DATABASE_URL;
    if (supabaseUrl && supabaseUrl.includes('api.pooler.supabase.com')) {
      supabaseUrl = supabaseUrl.replace('api.pooler.supabase.com', 'aws-0-eu-west-3.pooler.supabase.com');
    }
    
    if (!supabaseUrl) {
      return { error: "SUPABASE_DATABASE_URL not configured" };
    }
    
    const supabaseSql = neon(supabaseUrl);
    const supabaseDb = drizzle(supabaseSql);
    
    // Compter les articles
    const countResult = await supabaseDb.select({ count: sql<number>`count(*)` }).from(veille);
    const count = countResult[0]?.count || 0;
    
    // Obtenir quelques exemples
    const articles = await supabaseDb.select().from(veille).limit(3);
    
    return {
      count,
      articles,
      status: "success"
    };
    
  } catch (error: any) {
    return {
      error: error.message,
      status: "failed"
    };
  }
}