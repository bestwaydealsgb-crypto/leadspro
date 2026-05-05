import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check if tables exist
    const tables = ['scan_jobs', 'leads', 'generated_messages'];
    let allTablesExist = true;

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count(*)')
        .limit(1);

      if (error && error.code === 'PGRST100') {
        // Table doesn't exist
        allTablesExist = false;
        break;
      }
    }

    return NextResponse.json({
      tables_exist: allTablesExist,
      tables_checked: tables,
    });
  } catch (error) {
    console.error('Tables check error:', error);
    return NextResponse.json({
      tables_exist: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
