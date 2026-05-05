import { extractWebsiteData } from '@/lib/scrapers/websiteData';

// Local business database - you can expand this with your own data
const BUSINESS_DATABASE: { [key: string]: string[] } = {
  // Restaurants
  restaurants: [
    'mcdonalds.com',
    'kfc.com',
    'subway.com',
    'dominospizza.com',
    'pizzahut.com',
    'burgerking.com',
    'wendys.com',
    'tacobell.com',
    'chick-fil-a.com',
    'popeyes.com',
    'arbys.com',
    'five-guys.com',
    'chipotle.com',
    'qdoba.com',
    'panera.com',
    'jimmyjohns.com',
    'jerseymikes.com',
    'firehouse-subs.com',
  ],
  // Dentists
  dentists: [
    'dentalhealth.org',
    'smilesdentistry.com',
    'brightsmilesdental.com',
    'familydentalcare.com',
    'cosmetic-dental.net',
    'dentalcare.org',
    'smiledental.net',
    'dental-implants.net',
    'orthodontics.org',
    'pediatricdental.com',
  ],
  // Fitness
  fitness: [
    'planet-fitness.com',
    'gold-gym.com',
    'anytimefitness.com',
    ' 24hourfitness.com',
    'equinox.com',
    'crunch-fitness.com',
    'lifechanging-fitness.com',
    'orangetheory.com',
    'peloton.com',
    'blink-fitness.com',
  ],
  // Plumbing
  plumbing: [
    'roto-rooter.com',
    'servicetitan.com',
    'plumbing-help.com',
    'emergency-plumber.net',
    'plumber-today.com',
    'masterplumber.com',
    'localplumber.net',
    'plumbing-services.net',
    'drain-cleaning.net',
    'pipe-repairs.com',
  ],
  // HVAC
  hvac: [
    'hvac-service.net',
    'air-conditioning.net',
    'heating-systems.com',
    'climate-control.net',
    'comfort-systems.com',
    'temperature-control.net',
    'hvac-repair.net',
    'cooling-service.com',
    'furnace-repair.net',
    'thermostat-service.com',
  ],
  // Electricians
  electricians: [
    'licensed-electrician.net',
    'electric-services.com',
    'electrical-repair.net',
    'power-solutions.net',
    'electrician-pro.com',
    'wiring-service.net',
    'electrical-installation.net',
    'circuit-repair.com',
    'electrical-maintenance.net',
    'emergency-electrical.com',
  ],
  // Hair Salons
  salons: [
    'great-clips.com',
    'supercuts.com',
    'sports-clips.com',
    'mastercuts.com',
    'cost-cutters.com',
    'smartstyle.com',
    'beautysalons.net',
    'hair-care.net',
    'salon-services.com',
    'styling-studio.com',
  ],
};

interface SearchResult {
  business_name: string;
  website: string;
  category: string;
}

export async function searchBusinesses(niche: string, location: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const nicheLower = niche.toLowerCase().trim();
  const locationLower = location.toLowerCase().trim();

  // Get base websites for the niche
  const baseWebsites = BUSINESS_DATABASE[nicheLower] || [];

  // Generate variations with location
  const searchWebsites = [
    ...baseWebsites,
    // Local variations
    ...baseWebsites.map(w => w.replace('.com', `-${locationLower}.com`)),
    ...baseWebsites.map(w => w.replace('.com', `.${locationLower}.com`)),
    // Additional local searches
    ...generateLocalSearches(niche, location),
  ];

  // Remove duplicates
  const uniqueWebsites = [...new Set(searchWebsites)];

  // Create results from websites
  for (let i = 0; i < Math.min(uniqueWebsites.length, 30); i++) {
    const website = uniqueWebsites[i];
    if (website && website.length > 0) {
      results.push({
        business_name: generateBusinessName(niche, i),
        website: website.startsWith('http') ? website : `https://${website}`,
        category: niche,
      });
    }
  }

  return results;
}

function generateBusinessName(niche: string, index: number): string {
  const adjectives = ['Best', 'Top', 'Premier', 'Professional', 'Reliable', 'Expert', 'Quality', 'Elite'];
  const adj = adjectives[index % adjectives.length];
  const suffix = ['Services', 'Pro', 'Hub', 'Studio', 'Center', 'Solutions', 'Group', 'Company'];
  const suf = suffix[index % suffix.length];

  return `${adj} ${niche} ${suf}`;
}

function generateLocalSearches(niche: string, location: string): string[] {
  const results: string[] = [];
  const nicheLower = niche.toLowerCase();
  const locationLower = location.toLowerCase().replace(/\s+/g, '-');

  // Generate common local business patterns
  const patterns = [
    `${locationLower}-${nicheLower}.com`,
    `${nicheLower}-in-${locationLower}.com`,
    `${nicheLower}-near-me.com`,
    `local-${nicheLower}.com`,
    `${nicheLower}-specialists.com`,
    `${locationLower}-${nicheLower}-experts.com`,
  ];

  return patterns.slice(0, 10);
}

export async function enrichBusinessWithData(business: SearchResult) {
  try {
    const data = await extractWebsiteData(business.website);
    return {
      ...business,
      ...data,
      website_exists: !!data,
    };
  } catch (error) {
    console.error(`Error enriching business ${business.business_name}:`, error);
    return {
      ...business,
      website_exists: false,
    };
  }
}
