import { NextRequest, NextResponse } from 'next/server';
import { searchBusinesses, enrichBusinessWithData } from '@/lib/services/businessSearch';

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

    // Search for businesses using custom database
    const businesses = await searchBusinesses(niche, location);

    // Enrich with website data
    const enrichedBusinesses = await Promise.all(
      businesses.slice(0, limit).map((business) => enrichBusinessWithData(business))
    );

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
