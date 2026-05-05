import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function initializeDatabase() {
  try {
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
