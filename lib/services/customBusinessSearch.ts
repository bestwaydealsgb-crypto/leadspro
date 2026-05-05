import { Lead, LeadStatus } from '@/types';

// Local business database - can be expanded with real data
const businessDatabase: { [category: string]: Lead[] } = {
  restaurants: [],
  dentists: [],
  plumbers: [],
  electricians: [],
  salons: [],
  gyms: [],
  lawyers: [],
  accountants: [],
  real_estate: [],
  auto_repair: [],
};

// Simulated business data generator
function generateMockBusinesses(niche: string, location: string, count: number = 25): Lead[] {
  const businesses: Lead[] = [];
  const firstNames = ['Fresh', 'Quick', 'Prime', 'Best', 'Pro', 'Elite', 'Smart', 'Modern', 'Royal', 'Ace'];
  const categories: { [key: string]: string } = {
    restaurants: 'Restaurant',
    dentists: 'Dental Clinic',
    plumbers: 'Plumbing Service',
    electricians: 'Electrical Service',
    salons: 'Hair Salon',
    gyms: 'Fitness Center',
    lawyers: 'Law Firm',
    accountants: 'Accounting Firm',
    real_estate: 'Real Estate Agency',
    auto_repair: 'Auto Repair Shop',
  };

  const categoryName = categories[niche.toLowerCase()] || niche;

  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const businessName = `${firstName} ${categoryName} ${i}`;
    
    // Random website status
    const statuses: LeadStatus[] = ['NO_WEBSITE', 'BAD_WEBSITE', 'AVERAGE_WEBSITE', 'GOOD_WEBSITE'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const websiteScore = status === 'NO_WEBSITE' ? 0 : 
                        status === 'BAD_WEBSITE' ? Math.floor(Math.random() * 30) + 20 :
                        status === 'AVERAGE_WEBSITE' ? Math.floor(Math.random() * 30) + 50 :
                        Math.floor(Math.random() * 30) + 75;

    const issues: string[] = [];
    if (status === 'NO_WEBSITE') {
      issues.push('No website found');
    } else if (status === 'BAD_WEBSITE') {
      issues.push('Slow loading speed');
      issues.push('Not mobile friendly');
      issues.push('Outdated design');
      issues.push('Poor SEO');
    } else if (status === 'AVERAGE_WEBSITE') {
      issues.push('Could improve SEO');
      issues.push('Mobile experience could be better');
    }

    businesses.push({
      id: `${niche}-${location}-${i}`,
      business_name: businessName,
      business_category: categoryName,
      city: location,
      address: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Park', 'Oak', 'Elm', 'Oak'][Math.floor(Math.random() * 5)]} St, ${location}`,
      phone_numbers: [`+1${Math.floor(Math.random() * 9000000000) + 1000000000}`],
      email_addresses: [`contact@${businessName.toLowerCase().replace(/\s+/g, '')}.com`],
      website_url: status === 'NO_WEBSITE' ? '' : `https://${businessName.toLowerCase().replace(/\s+/g, '')}.com`,
      lead_status: status,
      website_score: websiteScore,
      issues_found: issues,
      outreach_status: 'PENDING',
      lead_priority: 'MEDIUM',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return businesses;
}

export async function searchLocalBusinesses(
  niche: string,
  location: string,
  limit: number = 25
): Promise<Lead[]> {
  // In production, this would query a real database or web service
  // For now, we generate mock data that's consistent
  const businesses = generateMockBusinesses(niche, location, limit);
  return businesses;
}

export async function enrichBusinessWithCustomAnalysis(business: Lead): Promise<Lead> {
  // Simulate website analysis without external API
  if (!business.website_url) {
    return {
      ...business,
      lead_status: 'NO_WEBSITE',
      website_score: 0,
      issues_found: ['No website found'],
    };
  }

  // Simulate analysis
  const analysisScore = Math.floor(Math.random() * 100);
  let status: LeadStatus;
  const issues: string[] = [];

  if (analysisScore < 30) {
    status = 'BAD_WEBSITE';
    issues.push('Poor website performance');
    issues.push('Outdated design');
    issues.push('No mobile optimization');
    issues.push('Low SEO score');
  } else if (analysisScore < 60) {
    status = 'AVERAGE_WEBSITE';
    issues.push('Could improve loading speed');
    issues.push('Mobile experience needs work');
  } else if (analysisScore < 85) {
    status = 'GOOD_WEBSITE';
  } else {
    status = 'GOOD_WEBSITE';
  }

  return {
    ...business,
    lead_status: status,
    website_score: analysisScore,
    issues_found: issues,
  };
}

export async function bulkEnrichBusinesses(businesses: Lead[]): Promise<Lead[]> {
  return Promise.all(
    businesses.map((business) => enrichBusinessWithCustomAnalysis(business))
  );
}

export async function searchByCategory(category: string, location: string): Promise<Lead[]> {
  return searchLocalBusinesses(category, location, 20);
}

export async function searchByLocation(location: string): Promise<Lead[]> {
  // Search across all categories for a location
  const allBusinesses: Lead[] = [];
  const categories = Object.keys(businessDatabase);

  for (const category of categories) {
    const businesses = await searchLocalBusinesses(category, location, 15);
    allBusinesses.push(...businesses);
  }

  return allBusinesses.sort(() => Math.random() - 0.5).slice(0, 50);
}
