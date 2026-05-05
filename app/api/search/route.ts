import { NextRequest, NextResponse } from 'next/server';
import { searchLocalBusinesses, bulkEnrichBusinesses } from '@/lib/services/customBusinessSearch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { niche, location, limit = 30 } = body;

    if (!niche || !location) {
      return NextResponse.json(
        { error: 'Missing niche or location' },
        { status: 400 }
      );
    }

    // Search for businesses using custom service (no external API)
    const businesses = await searchLocalBusinesses(niche, location, limit);

    // Enrich with analysis
    const enrichedBusinesses = await bulkEnrichBusinesses(businesses);

    return NextResponse.json({
      results: enrichedBusinesses,
      total: enrichedBusinesses.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
