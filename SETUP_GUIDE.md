# LeadHunter Pro - Setup Guide

## 🚀 Quick Start

The application is fully built and ready to run! Follow these steps to get it working:

### Step 1: Check Configuration
Visit `http://localhost:3000/setup` to run automated configuration checks.

### Step 2: Set Up Environment Variables

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your credentials in `.env.local`:**

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration (REQUIRED for AI message generation)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Optional: External APIs
SERPAPI_KEY=your_serpapi_key_here (for enhanced Google search)
SCRAPERAPI_KEY=your_scraperapi_key_here (for advanced scraping)
```

### Step 3: Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click "New Project"
3. Fill in the project details
4. Wait for the project to be created
5. Go to **Project Settings → API**
6. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Paste this SQL and run it:

```sql
-- Create scan_jobs table
CREATE TABLE IF NOT EXISTS public.scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  total_found INTEGER DEFAULT 0,
  total_analyzed INTEGER DEFAULT 0,
  total_added INTEGER DEFAULT 0,
  total_skipped INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  category TEXT,
  city TEXT,
  website_url TEXT,
  website_score INTEGER,
  website_analysis JSONB,
  lead_status TEXT DEFAULT 'NO_WEBSITE',
  lead_priority TEXT DEFAULT 'MEDIUM',
  outreach_status TEXT DEFAULT 'NOT_CONTACTED',
  phones TEXT[],
  emails TEXT[],
  whatsapp TEXT,
  facebook TEXT,
  instagram TEXT,
  linkedin TEXT,
  twitter TEXT,
  owner_name TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create generated_messages table
CREATE TABLE IF NOT EXISTS public.generated_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  whatsapp_message TEXT,
  email_subject TEXT,
  email_body TEXT,
  instagram_message TEXT,
  sms_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (optional for production)
ALTER TABLE public.scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_messages ENABLE ROW LEVEL SECURITY;
```

### Step 5: Get OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key to `NEXT_PUBLIC_OPENAI_API_KEY` in `.env.local`

### Step 6: Restart Development Server

```bash
# Kill the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🔍 Troubleshooting

### "Start Scanning" Button Not Working

**Symptoms:** Clicking the button does nothing or shows an error.

**Fix:**
1. Check `http://localhost:3000/setup` - all checks should be ✓
2. Verify `.env.local` has all required values
3. Check browser console (F12 → Console tab) for error messages
4. Restart the dev server after updating `.env.local`

### Text Not Visible

**Fixed in the latest build:**
- Updated CSS for better text contrast
- Added explicit text colors to all components
- Fixed font rendering

If you still see faint text:
1. Hard refresh: `Ctrl+Shift+R` (Cmd+Shift+R on Mac)
2. Clear browser cache
3. Restart dev server

### Database Connection Failed

**Steps to debug:**
1. Verify Supabase URL in `.env.local` is correct (should start with `https://`)
2. Check that Supabase project is active and not paused
3. Verify database tables were created successfully in Supabase SQL Editor
4. Try connecting from different browser/network to rule out local issues

## 📖 Feature Overview

### Dashboard (`/dashboard`)
- Real-time statistics
- Recent leads list
- New scan form
- Scan progress tracker

### New Scan (`/scan`)
- Enter business niche and location
- Monitor scan progress in real-time
- See live counters (Found, Analyzing, Added, Skipped)

### All Leads (`/leads`)
- Filter by status, priority, city, category
- Search by business name
- Pagination (25 leads per page)
- View detailed lead information
- Delete leads individually or in bulk
- Export to Excel

### Lead Details (`/leads/[id]`)
- Website analysis score (0-100)
- Website issues detected
- Contact information (phones, emails, social links)
- AI-generated outreach messages (5 types)
- Copy-to-clipboard functionality

### Messages (`/messages`)
- View all generated messages
- Filter by lead
- Copy messages for outreach

### Export (`/export`)
- Download Excel file with:
  - All leads sheet
  - No website sheet
  - Bad website sheet
  - Average website sheet
  - Contact info only sheet
  - Summary statistics sheet
- Color-coded status indicators
- Auto-formatted columns

### Settings (`/settings`)
- API configuration documentation
- Environment variables guide

## 🎯 How It Works

1. **Scan:** Enter a business niche and location
2. **Search:** System searches for businesses via Google and Maps
3. **Analyze:** For each business, checks website and analyzes quality (0-100 score)
4. **Extract:** Pulls contact information (phones, emails, social media)
5. **Prioritize:** Automatically assigns priority based on website quality
6. **Generate:** Creates personalized AI outreach messages via OpenAI
7. **Export:** Downloads all data to Excel for further use

## 🔑 Key Concepts

### Lead Status
- **NO_WEBSITE:** Business has no website
- **BAD_WEBSITE:** Website score < 40 (poor design, slow, not mobile-friendly)
- **AVERAGE_WEBSITE:** Website score 40-74 (decent but could improve)
- **GOOD_WEBSITE:** Website score ≥ 75 (modern, fast, professional)

### Lead Priority
- **HIGH:** No website (best opportunity to provide web services)
- **MEDIUM:** Bad/Average website (good prospect for improvement)
- **LOW:** Good website (already invested in digital presence)

### Website Score Breakdown
- **Mobile Responsiveness (25%):** Viewport meta tag, responsive design
- **Page Speed (25%):** Load time under 2 seconds = full points
- **SEO (25%):** Title, meta description, H1 tags, alt text, SSL
- **Design Quality (25%):** Professional appearance, layout, usability

## 📱 WhatsApp Integration

The system extracts WhatsApp numbers and can generate WhatsApp-formatted messages. To send actual messages:
1. Copy the WhatsApp message from the app
2. Go to `https://wa.me/NUMBER?text=MESSAGE`
3. Or use WhatsApp Business API for automated sending

## 💡 Tips

- **Batch Processing:** Scans work in the background. Start multiple scans for different niches/cities.
- **Excel Templates:** Download the exported Excel and use as templates for campaigns.
- **Message Customization:** Edit AI-generated messages to add personal touches before sending.
- **Regular Updates:** Re-scan the same niches monthly to catch new businesses and updated websites.

## 🆘 Support

For issues:
1. Check this guide first
2. Visit `/setup` page for configuration diagnosis
3. Check browser console (F12) for error messages
4. Verify all environment variables are set correctly

---

**Happy Lead Hunting! 🎯**
