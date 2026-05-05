import { NextRequest, NextResponse } from 'next/server';
import { createScanJob, updateScanProgress, completeScanJob, getScanJob } from '@/lib/db/queries';
import { searchBusinessesGoogle } from '@/lib/scrapers/googleSearch';
import { scrapeGoogleMaps } from '@/lib/scrapers/googleMaps';
import { websiteExists, extractWebsiteData } from '@/lib/scrapers/websiteData';
import { analyzeWebsite } from '@/lib/analyzers/websiteAnalyzer';
import { saveLead } from '@/lib/db/queries';
import { Lead, LeadStatus } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { niche, location } = body;

    if (!niche || !location) {
      return NextResponse.json({ error: 'Missing niche or location' }, { status: 400 });
    }

    // Create scan job
    const scanJob = await createScanJob(niche, location);

    // Start async scanning in the background
    scanInBackground(scanJob.id, niche, location);

    return NextResponse.json({ scanId: scanJob.id });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get('id');

    if (!scanId) {
      return NextResponse.json({ error: 'Missing scan ID' }, { status: 400 });
    }

    const scanJob = await getScanJob(scanId);

    if (!scanJob) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    return NextResponse.json(scanJob);
  } catch (error) {
    console.error('Get scan error:', error);
    return NextResponse.json({ error: 'Failed to get scan' }, { status: 500 });
  }
}

async function scanInBackground(scanId: string, niche: string, location: string) {
  try {
    // Step 1: Search for businesses
    await updateScanProgress(scanId, 10, 'Searching for businesses...', {});

    const googleResults = await searchBusinessesGoogle(niche, location);
    const mapsResults = await scrapeGoogleMaps(niche, location);

    // Merge results
    const allBusinesses = [...googleResults, ...mapsResults];

    // Remove duplicates
    const uniqueBusinesses = Array.from(
      new Map(allBusinesses.map((b) => [b.name.toLowerCase(), b])).values()
    );

    await updateScanProgress(scanId, 15, `Found ${uniqueBusinesses.length} businesses`, {
      total_found: uniqueBusinesses.length,
    });

    // Step 2: Analyze each business
    let analyzed = 0;
    let addedLeads = 0;
    let skipped = 0;

    for (const business of uniqueBusinesses) {
      analyzed++;
      const progress = 15 + Math.round(60 * (analyzed / uniqueBusinesses.length));

      // Check if website exists
      let hasWebsite = false;
      let websiteScore = null;
      let websiteIssues: string[] = [];
      let mobileScreenshot: string | null = null;
      let desktopScreenshot: string | null = null;

      if (business.website_url) {
        hasWebsite = await websiteExists(business.website_url);

        if (hasWebsite) {
          // Analyze website
          const analysis = await analyzeWebsite(business.website_url);
          if (analysis) {
            websiteScore = analysis.overall_score;
            websiteIssues = analysis.issues;
            mobileScreenshot = analysis.mobile_screenshot;
            desktopScreenshot = analysis.desktop_screenshot;

            if (analysis.overall_score >= 75) {
              skipped++;
              await updateScanProgress(scanId, progress, `Analyzed ${analyzed}/${uniqueBusinesses.length}`, {
                total_analyzed: analyzed,
                total_skipped: skipped,
              });
              continue;
            }
          }
        }
      }

      // Determine lead status and priority
      let leadStatus: LeadStatus;
      let leadPriority: 'HIGH' | 'MEDIUM' | 'LOW';

      if (!hasWebsite && !business.website_url) {
        leadStatus = 'NO_WEBSITE';
        leadPriority = 'HIGH';
      } else if (websiteScore && websiteScore < 40) {
        leadStatus = 'BAD_WEBSITE';
        leadPriority = 'HIGH';
      } else if (websiteScore && websiteScore < 75) {
        leadStatus = 'AVERAGE_WEBSITE';
        leadPriority = 'MEDIUM';
      } else {
        leadStatus = 'GOOD_WEBSITE';
        leadPriority = 'LOW';
      }

      // Extract additional data from website if it exists
      let websiteData: any = {};
      if (business.website_url && hasWebsite) {
        websiteData = await extractWebsiteData(business.website_url);
      }

      // Create lead
      const lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'> = {
        business_name: business.name,
        business_category: business.category,
        business_description: business.description,
        phone_numbers: [...business.phone_numbers, ...(websiteData.phones || [])],
        whatsapp_number: business.whatsapp_number || websiteData.whatsapp || null,
        email_addresses: [...business.email_addresses, ...(websiteData.emails || [])],
        owner_name: business.owner_name || websiteData.owner_name || null,
        address: business.address || websiteData.address || null,
        city: business.city,
        country: 'Pakistan',
        google_maps_url: business.google_maps_url,
        website_url: business.website_url,
        facebook_url: business.facebook_url || websiteData.facebook || null,
        instagram_url: business.instagram_url || websiteData.instagram || null,
        linkedin_url: business.linkedin_url || websiteData.linkedin || null,
        website_score: websiteScore,
        mobile_score: null,
        desktop_score: null,
        seo_score: null,
        design_score: null,
        mobile_screenshot_url: mobileScreenshot,
        desktop_screenshot_url: desktopScreenshot,
        issues_found: websiteIssues,
        lead_status: leadStatus,
        lead_priority: leadPriority,
        lead_score: calculateLeadScore(leadStatus, websiteScore),
        outreach_status: 'PENDING',
        generated_whatsapp_message: null,
        generated_email_message: null,
        source: 'scan',
        scan_id: scanId,
      };

      await saveLead(lead);
      addedLeads++;

      await updateScanProgress(scanId, progress, `Analyzing: ${business.name}`, {
        total_analyzed: analyzed,
        total_leads: addedLeads,
        total_skipped: skipped,
      });
    }

    // Complete scan
    await completeScanJob(scanId);
    await updateScanProgress(scanId, 100, 'Scan completed', {
      total_found: uniqueBusinesses.length,
      total_analyzed: analyzed,
      total_leads: addedLeads,
      total_skipped: skipped,
    });
  } catch (error) {
    console.error('Background scan error:', error);
    // Update with error status
  }
}

function calculateLeadScore(status: LeadStatus, websiteScore: number | null): number {
  if (status === 'NO_WEBSITE') return 100;
  if (status === 'BAD_WEBSITE') return 80;
  if (status === 'AVERAGE_WEBSITE') return 60;
  return 40;
}
