export type LeadStatus = 'NO_WEBSITE' | 'BAD_WEBSITE' | 'AVERAGE_WEBSITE' | 'GOOD_WEBSITE';
export type LeadPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type OutreachStatus = 'PENDING' | 'CONTACTED' | 'REPLIED' | 'CONVERTED' | 'REJECTED';
export type ScanStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface Lead {
  id: string;
  // Business Info
  business_name: string;
  business_category: string;
  business_description: string | null;
  // Contact
  phone_numbers: string[];
  whatsapp_number: string | null;
  email_addresses: string[];
  owner_name: string | null;
  // Location
  address: string | null;
  city: string;
  country: string;
  google_maps_url: string | null;
  // Online Presence
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  // Scores
  website_score: number | null;
  mobile_score: number | null;
  desktop_score: number | null;
  seo_score: number | null;
  design_score: number | null;
  // Screenshots
  mobile_screenshot_url: string | null;
  desktop_screenshot_url: string | null;
  // Analysis
  issues_found: string[];
  lead_status: LeadStatus;
  lead_priority: LeadPriority;
  lead_score: number;
  // Outreach
  outreach_status: OutreachStatus;
  generated_whatsapp_message: string | null;
  generated_email_message: string | null;
  // Meta
  source: string;
  scan_id: string;
  created_at: string;
  updated_at: string;
}

export interface ScanJob {
  id: string;
  niche: string;
  location: string;
  status: ScanStatus;
  total_found: number;
  total_analyzed: number;
  total_leads: number;
  total_skipped: number;
  progress: number;
  current_action: string;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface WebsiteAnalysis {
  url: string;
  exists: boolean;
  overall_score: number;
  mobile_score: number;
  desktop_score: number;
  seo_score: number;
  design_score: number;
  speed_score: number;
  issues: string[];
  mobile_screenshot: string | null;
  desktop_screenshot: string | null;
  is_ssl: boolean;
  load_time: number;
  is_mobile_responsive: boolean;
}

export interface GeneratedMessage {
  whatsapp: string;
  email_subject: string;
  email_body: string;
  instagram_dm: string;
  sms: string;
}

export interface ScrapedBusiness {
  name: string;
  category: string;
  description: string | null;
  phone_numbers: string[];
  email_addresses: string[];
  address: string | null;
  city: string;
  website_url: string | null;
  google_maps_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  whatsapp_number: string | null;
  owner_name: string | null;
  source: string;
}
