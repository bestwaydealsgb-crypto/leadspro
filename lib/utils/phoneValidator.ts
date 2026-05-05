export function extractPhoneNumbers(text: string): string[] {
  const phones: Set<string> = new Set();

  // Pakistan phone patterns
  const pkPatterns = [
    /\b(?:\+92|0092|92)\s?-?\s?3[0-9]{2}\s?-?\s?\d{3}\s?-?\s?\d{4}\b/g,
    /\b(?:\+92|0092|92)\s?-?\s?(?:21|22|23)\s?-?\s?\d{4}\s?-?\s?\d{4}\b/g,
    /\b03[0-9]{2}\s?-?\s?\d{3}\s?-?\s?\d{4}\b/g,
    /\b021\s?-?\s?\d{4}\s?-?\s?\d{4}\b/g,
  ];

  // International patterns
  const intlPatterns = [
    /\b(?:\+\d{1,3}[-.\s]?)?\(?[\d]{3}\)?[-.\s]?[\d]{3}[-.\s]?[\d]{4}\b/g,
    /\b\+[1-9]\d{1,14}\b/g, // E.164 format
  ];

  const allPatterns = [...pkPatterns, ...intlPatterns];
  allPatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length >= 10) {
          phones.add(phone.trim());
        }
      });
    }
  });

  return Array.from(phones);
}

export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function normalizePhoneNumber(phone: string, countryCode: string = '+92'): string {
  let cleaned = phone.replace(/\D/g, '');

  // Remove leading 0 if present
  if (cleaned.startsWith('0') && cleaned.length > 10) {
    cleaned = cleaned.substring(1);
  }

  // Add country code if not present
  if (!cleaned.startsWith('+') && !cleaned.startsWith('00')) {
    cleaned = countryCode.replace('+', '') + cleaned;
  }

  return cleaned;
}
