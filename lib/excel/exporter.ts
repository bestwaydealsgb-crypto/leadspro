import ExcelJS from 'exceljs';
import { Lead } from '@/types';
import { format } from 'date-fns';

export async function exportLeadsToExcel(leads: Lead[], niche: string, location: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Add sheets
  await addAllLeadsSheet(workbook, leads);
  await addNoWebsiteSheet(workbook, leads);
  await addBadWebsiteSheet(workbook, leads);
  await addAverageWebsiteSheet(workbook, leads);
  await addContactInfoSheet(workbook, leads);
  await addSummarySheet(workbook, leads, niche, location);

  return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
}

async function addAllLeadsSheet(workbook: ExcelJS.Workbook, leads: Lead[]): Promise<void> {
  const sheet = workbook.addWorksheet('All Leads');

  const headers = [
    'Business Name',
    'Category',
    'City',
    'Phone',
    'Email',
    'Website',
    'Score',
    'Status',
    'Priority',
    'Issues',
    'Facebook',
    'Instagram',
    'WhatsApp Message',
    'Email Message',
    'Date Added',
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };

  leads.forEach((lead) => {
    const statusColor =
      lead.lead_status === 'NO_WEBSITE'
        ? 'FFFF0000' // Red
        : lead.lead_status === 'BAD_WEBSITE'
          ? 'FFFFA500' // Orange
          : lead.lead_status === 'AVERAGE_WEBSITE'
            ? 'FFFFFF00' // Yellow
            : 'FF00B050'; // Green

    const row = sheet.addRow([
      lead.business_name,
      lead.business_category,
      lead.city,
      lead.phone_numbers.join(', '),
      lead.email_addresses.join(', '),
      lead.website_url || 'N/A',
      lead.website_score || 'N/A',
      lead.lead_status,
      lead.lead_priority,
      lead.issues_found.slice(0, 3).join('; '),
      lead.facebook_url || '',
      lead.instagram_url || '',
      lead.generated_whatsapp_message || '',
      lead.generated_email_message || '',
      format(new Date(lead.created_at), 'MMM dd, yyyy'),
    ]);

    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColor } };
  });

  sheet.columns.forEach((col) => {
    col.width = 20;
  });
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

async function addNoWebsiteSheet(workbook: ExcelJS.Workbook, leads: Lead[]): Promise<void> {
  const noWebsiteLeads = leads.filter((l) => l.lead_status === 'NO_WEBSITE');
  const sheet = workbook.addWorksheet('No Website');

  const headers = [
    'Business Name',
    'Category',
    'City',
    'Phone',
    'Email',
    'WhatsApp',
    'Priority',
    'Status',
    'Date Found',
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };

  noWebsiteLeads.forEach((lead) => {
    sheet.addRow([
      lead.business_name,
      lead.business_category,
      lead.city,
      lead.phone_numbers.join(', '),
      lead.email_addresses.join(', '),
      lead.whatsapp_number || '',
      lead.lead_priority,
      lead.outreach_status,
      format(new Date(lead.created_at), 'MMM dd, yyyy'),
    ]);
  });

  sheet.columns.forEach((col) => {
    col.width = 20;
  });
}

async function addBadWebsiteSheet(workbook: ExcelJS.Workbook, leads: Lead[]): Promise<void> {
  const badWebsiteLeads = leads
    .filter((l) => l.lead_status === 'BAD_WEBSITE')
    .sort((a, b) => (a.website_score || 0) - (b.website_score || 0));

  const sheet = workbook.addWorksheet('Bad Website');

  const headers = [
    'Business Name',
    'Website',
    'Score',
    'Top Issues',
    'City',
    'Phone',
    'Email',
    'Status',
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };

  badWebsiteLeads.forEach((lead) => {
    sheet.addRow([
      lead.business_name,
      lead.website_url || '',
      lead.website_score || 0,
      lead.issues_found.slice(0, 2).join('; '),
      lead.city,
      lead.phone_numbers[0] || '',
      lead.email_addresses[0] || '',
      lead.outreach_status,
    ]);
  });

  sheet.columns.forEach((col) => {
    col.width = 20;
  });
}

async function addAverageWebsiteSheet(workbook: ExcelJS.Workbook, leads: Lead[]): Promise<void> {
  const averageLeads = leads
    .filter((l) => l.lead_status === 'AVERAGE_WEBSITE')
    .sort((a, b) => (b.website_score || 0) - (a.website_score || 0));

  const sheet = workbook.addWorksheet('Average Website');

  const headers = ['Business Name', 'Website', 'Score', 'Issues Found', 'City', 'Phone', 'Priority'];

  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };

  averageLeads.forEach((lead) => {
    sheet.addRow([
      lead.business_name,
      lead.website_url || '',
      lead.website_score || 0,
      lead.issues_found.join('; '),
      lead.city,
      lead.phone_numbers[0] || '',
      lead.lead_priority,
    ]);
  });

  sheet.columns.forEach((col) => {
    col.width = 20;
  });
}

async function addContactInfoSheet(workbook: ExcelJS.Workbook, leads: Lead[]): Promise<void> {
  const sheet = workbook.addWorksheet('Contact Info Only');

  const headers = ['Business Name', 'Phone', 'Email', 'WhatsApp', 'City', 'Status'];

  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } };

  leads.forEach((lead) => {
    sheet.addRow([
      lead.business_name,
      lead.phone_numbers[0] || '',
      lead.email_addresses[0] || '',
      lead.whatsapp_number || '',
      lead.city,
      lead.lead_status,
    ]);
  });

  sheet.columns.forEach((col) => {
    col.width = 18;
  });
}

async function addSummarySheet(workbook: ExcelJS.Workbook, leads: Lead[], niche: string, location: string): Promise<void> {
  const sheet = workbook.addWorksheet('Summary');

  const stats = {
    total: leads.length,
    no_website: leads.filter((l) => l.lead_status === 'NO_WEBSITE').length,
    bad_website: leads.filter((l) => l.lead_status === 'BAD_WEBSITE').length,
    average_website: leads.filter((l) => l.lead_status === 'AVERAGE_WEBSITE').length,
    good_website: leads.filter((l) => l.lead_status === 'GOOD_WEBSITE').length,
  };

  sheet.addRow(['LeadHunter Pro - Scan Summary']);
  sheet.addRow([]);
  sheet.addRow(['Search Query', `${niche} in ${location}`]);
  sheet.addRow(['Scan Date', format(new Date(), 'MMM dd, yyyy HH:mm')]);
  sheet.addRow([]);
  sheet.addRow(['Statistics']);
  sheet.addRow(['Total Leads Found', stats.total]);
  sheet.addRow(['No Website', stats.no_website]);
  sheet.addRow(['Bad Website (< 40)', stats.bad_website]);
  sheet.addRow(['Average Website (40-74)', stats.average_website]);
  sheet.addRow(['Good Website (75+)', stats.good_website]);

  sheet.addRow([]);
  sheet.addRow(['By City']);

  const byCity: Record<string, number> = {};
  leads.forEach((lead) => {
    byCity[lead.city] = (byCity[lead.city] || 0) + 1;
  });

  Object.entries(byCity).forEach(([city, count]) => {
    sheet.addRow([city, count]);
  });

  sheet.addRow([]);
  sheet.addRow(['By Category']);

  const byCategory: Record<string, number> = {};
  leads.forEach((lead) => {
    byCategory[lead.business_category] = (byCategory[lead.business_category] || 0) + 1;
  });

  Object.entries(byCategory).forEach(([category, count]) => {
    sheet.addRow([category, count]);
  });

  sheet.columns.forEach((col) => {
    col.width = 25;
  });
}
