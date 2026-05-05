import { Lead, GeneratedMessage } from '@/types';

// Custom message templates based on business type and website status
const messageTemplates = {
  NO_WEBSITE: {
    whatsapp: (lead: Lead) => `
Hey ${lead.business_name}! 👋

I noticed you don't have a website yet. In 2026, that's leaving money on the table! 💰

We help ${lead.business_category} businesses like you build websites that actually bring in customers. 

Most businesses see 40% more inquiries within 3 months. 

Free 15-min call? Let's talk what's possible for you 🚀
    `.trim(),
    
    email_subject: (lead: Lead) => `${lead.business_name} - You're Missing Out Without a Website`,
    
    email_body: (lead: Lead) => `
Hello ${lead.business_name.split(' ')[0]},

I was looking for ${lead.business_category} services in ${lead.city} and noticed your business doesn't have an online presence yet.

Here's the problem: Your competitors ARE online, and they're getting customers you should be getting.

Here's what we do:
✅ Build professional websites (7-14 days)
✅ Mobile-friendly & fast loading
✅ SEO optimized to show up in Google
✅ Simple contact forms that convert

No long contracts. No setup fees. Just results.

Would you be open to a quick chat about what's possible for your business?

Best,
Digital Growth Team
    `.trim(),
    
    instagram_dm: (lead: Lead) => `
Hi! 👋 Helping ${lead.business_category} in ${lead.city} go online. Your business deserves a website! DM us 🚀
    `.trim(),
    
    sms: (lead: Lead) => `
Hi ${lead.business_name}! Get online & attract more customers. Free website consultation? Call us 📱
    `.trim(),
  },
  
  BAD_WEBSITE: {
    whatsapp: (lead: Lead) => `
Hi ${lead.business_name}! 👋

Your website needs some love 😅

We checked it out and found some issues:
${lead.issues_found.slice(0, 2).map(i => `• ${i}`).join('\n')}

Good news? We can fix this in 5-7 days.

Website improvements = More customers = More money 💰

Free audit? 👇
    `.trim(),
    
    email_subject: (lead: Lead) => `Your ${lead.business_category} Website Needs an Upgrade`,
    
    email_body: (lead: Lead) => `
Hey ${lead.business_name.split(' ')[0]},

I was browsing your website and found some opportunities to improve it:

Issues spotted:
${lead.issues_found.slice(0, 3).map(i => `• ${i}`).join('\n')}

Small fixes = BIG impact on customer conversions.

We specialize in fixing websites that aren't pulling their weight. Our clients typically see:
📈 30-50% more website traffic
📞 2-3x more customer inquiries
💵 Better ROI on marketing spend

Let's do a quick website audit together? (No cost, no obligation)

Talk soon,
Web Optimization Team
    `.trim(),
    
    instagram_dm: (lead: Lead) => `
Your website has potential! Small improvements = Huge ROI. Let's talk? 📊
    `.trim(),
    
    sms: (lead: Lead) => `
Hey! We found issues on your website costing you customers. Let's fix it? Quick call? 📞
    `.trim(),
  },
  
  GOOD_WEBSITE: {
    whatsapp: (lead: Lead) => `
Hey ${lead.business_name}! 👋

Your website looks solid! 👍

But here's the thing - even good websites can get MORE customers with a few tweaks.

We help ${lead.business_category} businesses like yours:
✓ Get more Google visibility
✓ Convert more visitors to customers
✓ Run profitable ad campaigns

Interested in growing faster? Let's chat! 📈
    `.trim(),
    
    email_subject: (lead: Lead) => `Scale Your ${lead.business_category} Business`,
    
    email_body: (lead: Lead) => `
Hi ${lead.business_name.split(' ')[0]},

Your website is already doing well - congrats! 🎉

Here's what we're seeing:
✓ Good design & user experience
✓ Mobile friendly
✓ Fast loading

But there's always room to grow. Most businesses we work with see:
📈 2-4x increase in qualified leads
💰 Better conversion rates
🎯 More predictable revenue

What if we could help you double your customer inquiries in 90 days?

Let's discuss - free strategy call?

Cheers,
Growth Team
    `.trim(),
    
    instagram_dm: (lead: Lead) => `
Love your website! Let's make it generate even more customers 🎯
    `.trim(),
    
    sms: (lead: Lead) => `
Your website is great! Let's make it generate 2x more leads? Strategy call? 📊
    `.trim(),
  },
};

export async function generateCustomMessages(lead: Lead): Promise<GeneratedMessage> {
  const status = lead.lead_status as keyof typeof messageTemplates;
  const templates = messageTemplates[status] || messageTemplates.GOOD_WEBSITE;
  
  return {
    whatsapp: templates.whatsapp(lead),
    email_subject: templates.email_subject(lead),
    email_body: templates.email_body(lead),
    instagram_dm: templates.instagram_dm(lead),
    sms: templates.sms(lead),
  };
}

export function personalizeMessage(template: string, lead: Lead): string {
  let message = template;
  
  // Replace placeholders
  message = message.replace(/\{businessName\}/g, lead.business_name);
  message = message.replace(/\{category\}/g, lead.business_category);
  message = message.replace(/\{city\}/g, lead.city);
  message = message.replace(/\{firstName\}/g, lead.business_name.split(' ')[0]);
  
  return message;
}

export function generateVariation(message: string, index: number = 0): string {
  const variations = [
    (m: string) => m, // Original
    (m: string) => m.replace('Hi', 'Hello').replace('👋', '🙌'),
    (m: string) => m.replace('We', 'Our team'),
    (m: string) => m.replace(/!$/gm, '?'),
  ];
  
  const variationFunc = variations[index % variations.length];
  return variationFunc(message);
}
