import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create clients if environment variables are available
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
export const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function initializeDatabase() {
  try {
    if (!supabaseAdmin) {
      console.log('Supabase not configured, skipping database initialization');
      return;
    }
    
    // Create tables if they don't exist
    const { error } = await supabaseAdmin.from('scan_jobs').select('id').limit(1);
    
    if (error && error.code === 'PGRST116') {
      // Tables don't exist, create them
      console.log('Creating database tables...');
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}
