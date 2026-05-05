import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractPhoneNumbers } from '@/lib/utils/phoneValidator';
import { extractEmails } from '@/lib/utils/emailExtractor';

interface WebsiteContactData {
  phones: string[];
  emails: string[];
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  owner_name: string | null;
  address: string | null;
}

export async function extractWebsiteData(url: string): Promise<WebsiteContactData | null> {
  try {
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    // Fetch the main page
    const mainPageData = await fetchAndExtractData(url);

    // Try to fetch additional pages
    const aboutPageData = await fetchAndExtractData(`${url}/about`).catch(() => null);
    const contactPageData = await fetchAndExtractData(`${url}/contact`).catch(() => null);

    // Merge data from all pages
    const allPhones = [
      ...mainPageData.phones,
      ...(aboutPageData?.phones || []),
      ...(contactPageData?.phones || []),
    ];

    const allEmails = [
      ...mainPageData.emails,
      ...(aboutPageData?.emails || []),
      ...(contactPageData?.emails || []),
    ];

    return {
      phones: Array.from(new Set(allPhones)),
      emails: Array.from(new Set(allEmails)),
      whatsapp: mainPageData.whatsapp || aboutPageData?.whatsapp || contactPageData?.whatsapp || null,
      facebook: mainPageData.facebook || aboutPageData?.facebook || contactPageData?.facebook || null,
      instagram: mainPageData.instagram || aboutPageData?.instagram || contactPageData?.instagram || null,
      linkedin: mainPageData.linkedin || aboutPageData?.linkedin || contactPageData?.linkedin || null,
      twitter: mainPageData.twitter || aboutPageData?.twitter || contactPageData?.twitter || null,
      owner_name: extractOwnerName(mainPageData.html),
      address: extractAddress(mainPageData.html),
    };
  } catch (error) {
    console.error(`Error extracting data from ${url}:`, error);
    return null;
  }
}

async function fetchAndExtractData(url: string): Promise<any> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const html = response.data;
    const phones = extractPhoneNumbers(html);
    const emails = extractEmails(html);

    // Extract social links
    const whatsappMatch = html.match(/(?:https?:\/\/)?(?:www\.)?whatsapp\.com|wa\.me\/\d+/i);
    const facebookMatch = html.match(/(?:https?:\/\/)?(?:www\.)?facebook\.com\/[\w.-]+/i);
    const instagramMatch = html.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/[\w.-]+/i);
    const linkedinMatch = html.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[\w.-]+/i);
    const twitterMatch = html.match(/(?:https?:\/\/)?(?:www\.)?twitter\.com\/[\w]+/i);

    return {
      html,
      phones,
      emails,
      whatsapp: whatsappMatch ? whatsappMatch[0] : null,
      facebook: facebookMatch ? facebookMatch[0] : null,
      instagram: instagramMatch ? instagramMatch[0] : null,
      linkedin: linkedinMatch ? linkedinMatch[0] : null,
      twitter: twitterMatch ? twitterMatch[0] : null,
    };
  } catch (error) {
    throw error;
  }
}

function extractOwnerName(html: string): string | null {
  const $ = cheerio.load(html);

  // Try common selectors for owner/founder name
  const selectors = [
    'meta[name="author"]',
    '.founder-name',
    '.owner-name',
    '.ceo-name',
    '[data-owner-name]',
  ];

  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      const content = element.attr('content') || element.text();
      if (content && content.length < 100) {
        return content.trim();
      }
    }
  }

  return null;
}

function extractAddress(html: string): string | null {
  const $ = cheerio.load(html);

  // Try common selectors for address
  const selectors = [
    '.address',
    '[itemprop="streetAddress"]',
    '.contact-address',
    '[data-address]',
    'meta[name="location"]',
  ];

  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      const content = element.attr('content') || element.text();
      if (content && content.length < 200) {
        return content.trim();
      }
    }
  }

  return null;
}

export async function websiteExists(url: string): Promise<boolean> {
  try {
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    const response = await axios.head(url, {
      timeout: 5000,
      maxRedirects: 3,
    });

    return response.status >= 200 && response.status < 400;
  } catch (error) {
    try {
      // Try GET request if HEAD fails
      const response = await axios.get(url, {
        timeout: 5000,
        maxRedirects: 3,
      });
      return response.status >= 200 && response.status < 400;
    } catch {
      return false;
    }
  }
}
