import { supabase } from './supabase';
import { Lead, ScanJob, GeneratedMessage } from '@/types';

// Helper function to ensure supabase is initialized
function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not initialized. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
  return supabase;
}

// Scan Jobs
export async function createScanJob(niche: string, location: string): Promise<ScanJob> {
  const sb = ensureSupabase();
  const { data, error } = await sb
    .from('scan_jobs')
    .insert({
      niche,
      location,
      status: 'PENDING',
      total_found: 0,
      total_analyzed: 0,
      total_leads: 0,
      total_skipped: 0,
      progress: 0,
      current_action: 'Initializing...',
      error: null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as ScanJob;
}

export async function updateScanProgress(
  scanId: string,
  progress: number,
  currentAction: string,
  counts: {
    total_found?: number;
    total_analyzed?: number;
    total_leads?: number;
    total_skipped?: number;
  }
): Promise<void> {
  const sb = ensureSupabase();
  const updateData: any = {
    progress,
    current_action: currentAction,
  };

  if (counts.total_found !== undefined) updateData.total_found = counts.total_found;
  if (counts.total_analyzed !== undefined) updateData.total_analyzed = counts.total_analyzed;
  if (counts.total_leads !== undefined) updateData.total_leads = counts.total_leads;
  if (counts.total_skipped !== undefined) updateData.total_skipped = counts.total_skipped;

  const { error } = await sb
    .from('scan_jobs')
    .update(updateData)
    .eq('id', scanId);

  if (error) throw error;
}

export async function completeScanJob(scanId: string): Promise<void> {
  const sb = ensureSupabase();
  const { error } = await sb
    .from('scan_jobs')
    .update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
    })
    .eq('id', scanId);

  if (error) throw error;
}

export async function getScanJob(scanId: string): Promise<ScanJob | null> {
  const sb = ensureSupabase();
  const { data, error } = await sb
    .from('scan_jobs')
    .select()
    .eq('id', scanId)
    .single();

  if (error) return null;
  return data as ScanJob;
}

// Leads
export async function saveLead(leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
  const sb = ensureSupabase();
  const { data, error } = await sb
    .from('leads')
    .insert({
      ...leadData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function getLeads(
  filters?: {
    status?: string;
    priority?: string;
    city?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<{ leads: Lead[]; total: number }> {
  const sb = ensureSupabase();
  let query = sb.from('leads').select('*', { count: 'exact' });

  if (filters?.status) {
    query = query.eq('lead_status', filters.status);
  }
  if (filters?.priority) {
    query = query.eq('lead_priority', filters.priority);
  }
  if (filters?.city) {
    query = query.eq('city', filters.city);
  }
  if (filters?.category) {
    query = query.ilike('business_category', `%${filters.category}%`);
  }
  if (filters?.search) {
    query = query.or(
      `business_name.ilike.%${filters.search}%,address.ilike.%${filters.search}%,city.ilike.%${filters.search}%`
    );
  }

  const sortField = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';
  query = query.order(sortField, { ascending: sortOrder === 'asc' });

  const page = filters?.page || 1;
  const limit = filters?.limit || 25;
  const start = (page - 1) * limit;

  query = query.range(start, start + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return { leads: (data || []) as Lead[], total: count || 0 };
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const sb = ensureSupabase();
  const { data, error } = await sb
    .from('leads')
    .select()
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Lead;
}

export async function updateLeadOutreachStatus(id: string, status: string): Promise<void> {
  const sb = ensureSupabase();
  const { error } = await sb
    .from('leads')
    .update({ outreach_status: status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteLead(id: string): Promise<void> {
  const sb = ensureSupabase();
  const { error } = await sb.from('leads').delete().eq('id', id);
  if (error) throw error;
}

export async function bulkDeleteLeads(ids: string[]): Promise<void> {
  const sb = ensureSupabase();
  const { error } = await sb.from('leads').delete().in('id', ids);
  if (error) throw error;
}

// Generated Messages
export async function saveGeneratedMessages(
  leadId: string,
  messages: GeneratedMessage
): Promise<void> {
  const sb = ensureSupabase();
  const { error } = await sb.from('generated_messages').insert({
    lead_id: leadId,
    ...messages,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function getLeadMessages(leadId: string): Promise<GeneratedMessage | null> {
  const sb = ensureSupabase();
  const { data, error } = await sb
    .from('generated_messages')
    .select()
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as GeneratedMessage;
}

// Stats
export async function getStats(): Promise<{
  total: number;
  no_website: number;
  bad_website: number;
  average_website: number;
  good_website: number;
}> {
  const sb = ensureSupabase();
  const { data, error } = await sb.from('leads').select('lead_status');

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    no_website: data?.filter((l: any) => l.lead_status === 'NO_WEBSITE').length || 0,
    bad_website: data?.filter((l: any) => l.lead_status === 'BAD_WEBSITE').length || 0,
    average_website: data?.filter((l: any) => l.lead_status === 'AVERAGE_WEBSITE').length || 0,
    good_website: data?.filter((l: any) => l.lead_status === 'GOOD_WEBSITE').length || 0,
  };

  return stats;
}
