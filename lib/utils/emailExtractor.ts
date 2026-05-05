export function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  return Array.from(new Set(matches));
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function extractContactInfo(html: string): {
  emails: string[];
  phones: string[];
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
} {
  const emails = extractEmails(html);

  // Extract phone numbers
  const phoneRegex = /(?:\+\d{1,3}[-.\s]?)?\(?[\d]{3}\)?[-.\s]?[\d]{3}[-.\s]?[\d]{4}\b/g;
  const phones = html.match(phoneRegex) || [];

  // Extract social media links
  const whatsappMatch = html.match(/(?:https?:\/\/)?(?:www\.)?whatsapp\.com|wa\.me\/(\d+)/i);
  const facebookMatch = html.match(/(?:https?:\/\/)?(?:www\.)?facebook\.com\/[\w.-]+/i);
  const instagramMatch = html.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/[\w.-]+/i);
  const linkedinMatch = html.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[\w.-]+/i);
  const twitterMatch = html.match(/(?:https?:\/\/)?(?:www\.)?twitter\.com\/[\w]+/i);

  return {
    emails: Array.from(new Set(emails)),
    phones: Array.from(new Set(phones)),
    whatsapp: whatsappMatch ? whatsappMatch[0] : null,
    facebook: facebookMatch ? facebookMatch[0] : null,
    instagram: instagramMatch ? instagramMatch[0] : null,
    linkedin: linkedinMatch ? linkedinMatch[0] : null,
    twitter: twitterMatch ? twitterMatch[0] : null,
  };
}
