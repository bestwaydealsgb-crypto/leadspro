import axios from 'axios';
import { ScrapedBusiness } from '@/types';

export async function searchBusinessesGoogle(niche: string, location: string): Promise<ScrapedBusiness[]> {
  const businesses: ScrapedBusiness[] = [];

  try {
    // Use our custom search API instead of SerpAPI
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await axios.post(`${appUrl}/api/search`, {
      niche,
      location,
      limit: 30,
    });

    const results = response.data.results || [];

    // Convert results to ScrapedBusiness format
    for (const result of results) {
      businesses.push({
        name: result.business_name,
        category: result.category,
        description: null,
        phone_numbers: result.phones || [],
        email_addresses: result.emails || [],
        address: null,
        city: location,
        website_url: result.website,
        google_maps_url: null,
        facebook_url: null,
        instagram_url: null,
        linkedin_url: null,
        whatsapp_number: null,
        owner_name: null,
        source: 'custom_search',
      });
    }
  } catch (error) {
    console.error('Custom search error:', error);
  }

  return businesses;
}

async function searchWithSerpAPI(niche: string, location: string): Promise<ScrapedBusiness[]> {
  // Fallback to custom search
  return searchBusinessesGoogle(niche, location);
}
