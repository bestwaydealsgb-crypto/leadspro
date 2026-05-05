import axios from 'axios';
import { WebsiteAnalysis } from '@/types';

export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis | null> {
  try {
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    const loadTime = Date.now() - startTime;
    const html = response.data;

    // Calculate scores
    const mobileScore = checkMobileResponsiveness(html);
    const speedScore = calculateSpeedScore(loadTime);
    const seoScore = checkSEO(html);
    const designScore = 50; // Placeholder - would need AI vision in production

    const isSSL = url.startsWith('https');
    const issues = findIssues(html, mobileScore, speedScore, seoScore, isSSL);

    const overall_score = Math.round(
      (mobileScore * 0.25 + speedScore * 0.25 + seoScore * 0.25 + designScore * 0.25) / 25
    );

    return {
      url,
      exists: true,
      overall_score,
      mobile_score: Math.round(mobileScore / 25),
      desktop_score: Math.round(speedScore / 25),
      seo_score: Math.round(seoScore / 25),
      design_score: Math.round(designScore / 25),
      speed_score: Math.round(speedScore / 25),
      issues,
      mobile_screenshot: null, // Would be set by screenshot tool
      desktop_screenshot: null,
      is_ssl: isSSL,
      load_time: loadTime,
      is_mobile_responsive: mobileScore >= 15,
    };
  } catch (error) {
    console.error(`Error analyzing website ${url}:`, error);
    return {
      url,
      exists: false,
      overall_score: 0,
      mobile_score: 0,
      desktop_score: 0,
      seo_score: 0,
      design_score: 0,
      speed_score: 0,
      issues: ['Website not accessible or does not exist'],
      mobile_screenshot: null,
      desktop_screenshot: null,
      is_ssl: false,
      load_time: 0,
      is_mobile_responsive: false,
    };
  }
}

function checkMobileResponsiveness(html: string): number {
  let score = 0;

  // Check for viewport meta tag
  if (html.includes('name="viewport"')) {
    score += 5;
  }

  // Check for CSS media queries
  if (html.includes('@media') || html.includes('@media screen')) {
    score += 10;
  }

  // Check for mobile-friendly indicators
  if (html.includes('mobile') || html.includes('responsive')) {
    score += 5;
  }

  // Check for touch-friendly indicators
  if (html.includes('touch') || html.includes('mobile-optimized')) {
    score += 5;
  }

  return Math.min(score, 25);
}

function calculateSpeedScore(loadTime: number): number {
  if (loadTime < 2000) return 25;
  if (loadTime < 4000) return 15;
  if (loadTime < 7000) return 8;
  return 0;
}

function checkSEO(html: string): number {
  let score = 0;

  // Check for title tag
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (html.includes('<title>') && titleMatch && titleMatch[1]?.length > 5) {
    score += 5;
  }

  // Check for meta description
  if (html.includes('name="description"')) {
    score += 5;
  }

  // Check for H1 tags
  if (html.includes('<h1>')) {
    score += 5;
  }

  // Check for alt text on images
  const imgMatches = html.match(/<img[^>]*>/g) || [];
  const imgWithAlt = html.match(/<img[^>]*alt=[^>]*>/g) || [];
  if (imgMatches.length > 0 && imgWithAlt.length / imgMatches.length > 0.5) {
    score += 5;
  }

  // Check for structured data
  if (html.includes('schema.org') || html.includes('ld+json')) {
    score += 5;
  }

  return Math.min(score, 25);
}

function findIssues(html: string, mobileScore: number, speedScore: number, seoScore: number, isSSL: boolean): string[] {
  const issues: string[] = [];

  if (!isSSL) {
    issues.push('No SSL certificate (not HTTPS)');
  }

  if (mobileScore < 15) {
    issues.push('Not mobile responsive');
  }

  if (speedScore < 15) {
    issues.push('Slow page load time (> 4 seconds)');
  }

  if (seoScore < 15) {
    issues.push('Poor SEO optimization');
  }

  if (!html.includes('name="viewport"')) {
    issues.push('Missing viewport meta tag');
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (!titleMatch || !titleMatch[1] || titleMatch[1].length < 10) {
    issues.push('Missing or short page title');
  }

  if (!html.includes('name="description"')) {
    issues.push('Missing meta description');
  }

  if (!html.includes('<h1>')) {
    issues.push('Missing H1 heading');
  }

  const imgMatches = html.match(/<img[^>]*>/g) || [];
  const imgWithAlt = html.match(/<img[^>]*alt=[^>]*>/g) || [];
  if (imgMatches.length > imgWithAlt.length) {
    issues.push(`${imgMatches.length - imgWithAlt.length} images missing alt text`);
  }

  return issues;
}
