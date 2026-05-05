import { NextRequest, NextResponse } from 'next/server';
import { getLeads, bulkDeleteLeads } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      city: searchParams.get('city') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '25'),
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    };

    const { leads, total } = await getLeads(filters);

    return NextResponse.json({
      leads,
      total,
      pages: Math.ceil(total / filters.limit),
    });
  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json({ error: 'Failed to get leads' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Missing or empty ids' }, { status: 400 });
    }

    await bulkDeleteLeads(ids);

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error('Delete leads error:', error);
    return NextResponse.json({ error: 'Failed to delete leads' }, { status: 500 });
  }
}
