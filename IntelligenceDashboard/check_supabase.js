// Script temporaire pour vérifier le contenu de Supabase
import { neon } from "@neondatabase/serverless";

async function checkSupabase() {
  try {
    // URL Supabase corrigée
    const supabaseUrl = process.env.SUPABASE_DATABASE_URL?.replace('api.pooler.supabase.com', 'aws-0-eu-west-3.pooler.supabase.com');
    
    if (!supabaseUrl) {
      console.log("SUPABASE_DATABASE_URL not found");
      return;
    }
    
    const sql = neon(supabaseUrl);
    
    // Compter les articles dans Supabase
    const countResult = await sql`SELECT COUNT(*) as total FROM veille`;
    console.log("Nombre d'articles dans Supabase:", countResult[0].total);
    
    // Lister les articles
    const articles = await sql`SELECT id, keyword, status, priority_score FROM veille ORDER BY id`;
    console.log("Articles dans Supabase:");
    articles.forEach(article => {
      console.log(`- ID ${article.id}: ${article.keyword} (${article.status}) - Score: ${article.priority_score}`);
    });
    
  } catch (error) {
    console.error("Erreur lors de la vérification Supabase:", error.message);
  }
}

checkSupabase();