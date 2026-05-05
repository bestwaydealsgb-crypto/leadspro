import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    // Simple test query to check if database is accessible
    const { data, error } = await supabase
      .from('scan_jobs')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return NextResponse.json({ connected: false, error: error.message });
    }

    return NextResponse.json({ connected: true });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
