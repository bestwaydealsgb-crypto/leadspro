import { Lead, GeneratedMessage } from '@/types';
import { generateCustomMessages } from './customMessageGenerator';

// Use custom message generator (no external API dependency)
export async function generateMessages(lead: Lead): Promise<GeneratedMessage | null> {
  try {
    const messages = await generateCustomMessages(lead);
    return messages;
  } catch (error) {
    console.error('Error generating messages:', error);
    return null;
  }
}
    }
  }

  return messages;
}
