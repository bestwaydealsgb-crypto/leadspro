import { OpenAI } from 'openai';
import { Lead, GeneratedMessage } from '@/types';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

export async function generateMessages(lead: Lead): Promise<GeneratedMessage | null> {
  try {
    const client = getClient();
    const prompt = buildPrompt(lead);

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert sales copywriter who helps web design agencies get clients. Generate personalized, genuine outreach messages.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content || '';

    try {
      const parsed = JSON.parse(content);
      return {
        whatsapp: parsed.whatsapp || '',
        email_subject: parsed.email_subject || '',
        email_body: parsed.email_body || '',
        instagram_dm: parsed.instagram_dm || '',
        sms: parsed.sms || '',
      };
    } catch {
      // If JSON parsing fails, return default messages
      return createDefaultMessages(lead);
    }
  } catch (error) {
    console.error('Error generating messages:', error);
    return createDefaultMessages(lead);
  }
}

function buildPrompt(lead: Lead): string {
  const statusExplanation =
    lead.lead_status === 'NO_WEBSITE'
      ? `They currently have no website, which is a huge opportunity for them.`
      : lead.lead_status === 'BAD_WEBSITE'
        ? `Their website scores only ${lead.website_score}/100 and has these issues: ${lead.issues_found.slice(0, 3).join(', ')}`
        : `Their website needs improvement (score: ${lead.website_score}/100).`;

  return `
You are an expert sales copywriter who helps web design agencies get clients. Generate personalized outreach messages for this business:

BUSINESS INFO:
- Name: ${lead.business_name}
- Type: ${lead.business_category}  
- City: ${lead.city}
- Website Status: ${lead.lead_status}
- ${statusExplanation}
- Problems Found: ${lead.issues_found.slice(0, 5).join(', ') || 'General design improvements needed'}
- Has Phone: ${lead.phone_numbers.length > 0 ? 'Yes' : 'No'}
- Has Email: ${lead.email_addresses.length > 0 ? 'Yes' : 'No'}

YOUR SERVICE: Professional web design and digital marketing

RULES FOR MESSAGE GENERATION:
1. Be genuine and friendly, NOT salesy or spammy
2. Mention their SPECIFIC problem (show you checked their business)
3. Write like a human, not a robot
4. For WhatsApp: max 120 words, casual tone, Urdu/English mix is fine
5. For Email: max 200 words, professional tone
6. Include soft call to action (just ask if they're interested)
7. If no website: emphasize what they're losing without a website
8. If bad website: mention specific issues you noticed

Generate ALL of these in valid JSON format:
{
  "whatsapp": "Message for WhatsApp (120 words max)",
  "email_subject": "Email subject line (max 60 chars)",
  "email_body": "Professional email (200 words max)",
  "instagram_dm": "Instagram DM (80 words max)",
  "sms": "SMS message (60 words max)"
}

IMPORTANT: Return ONLY valid JSON, no other text.
`;
}

function createDefaultMessages(lead: Lead): GeneratedMessage {
  const hasWebsite = lead.website_url && lead.website_url.length > 0;

  return {
    whatsapp: `Hi ${lead.business_name}! 👋 We help businesses like yours get more online visibility. ${
      hasWebsite
        ? `Your website could use some improvements we'd like to discuss.`
        : `You're missing out on potential customers without a web presence!`
    } Interested in a quick call? 😊`,

    email_subject: `Growth opportunity for ${lead.business_name}`,

    email_body: `Hello,\n\nI noticed ${lead.business_name} in ${lead.city} and think we could help strengthen your online presence.\n\n${
      hasWebsite
        ? `Your website has great potential but we've identified areas that could significantly improve customer conversions.`
        : `In today's market, having a strong website is essential. We'd love to help you build one that brings in more business.`
    }\n\nWould you be open to a brief conversation about this?\n\nBest regards`,

    instagram_dm: `Hi! 👋 We help businesses in ${lead.city} improve their online presence. Could ${lead.business_name} benefit from better web design? Let's talk! 🚀`,

    sms: `Hi ${lead.business_name}! We help local businesses get more customers online. Interested in learning how? Reply YES 👍`,
  };
}

export async function bulkGenerateMessages(leads: Lead[]): Promise<Map<string, GeneratedMessage>> {
  const messages = new Map<string, GeneratedMessage>();

  for (const lead of leads) {
    const msg = await generateMessages(lead);
    if (msg) {
      messages.set(lead.id, msg);
    }
  }

  return messages;
}
