import { NextRequest, NextResponse } from 'next/server';
import { getLeads } from '@/lib/db/queries';
import { exportLeadsToExcel } from '@/lib/excel/exporter';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      city: searchParams.get('city') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      limit: 10000, // Get all results
    };

    const niche = searchParams.get('niche') || 'All';
    const location = searchParams.get('location') || 'All';

    const { leads } = await getLeads(filters);

    // Generate Excel file
    const buffer = await exportLeadsToExcel(leads, niche, location);

    const filename = `LeadHunterPro_${format(new Date(), 'yyyyMMdd_HHmm')}_${niche}_${location}.xlsx`;

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
