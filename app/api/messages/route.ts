import { NextRequest, NextResponse } from 'next/server';
import { getLeadById, saveGeneratedMessages, getLeadMessages } from '@/lib/db/queries';
import { generateMessages } from '@/lib/ai/messageGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
    }

    const lead = await getLeadById(leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Generate messages
    const messages = await generateMessages(lead);
    if (!messages) {
      return NextResponse.json({ error: 'Failed to generate messages' }, { status: 500 });
    }

    // Save messages
    await saveGeneratedMessages(leadId, messages);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Generate messages error:', error);
    return NextResponse.json({ error: 'Failed to generate messages' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 });
    }

    const messages = await getLeadMessages(leadId);

    if (!messages) {
      return NextResponse.json({ error: 'Messages not found' }, { status: 404 });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}
