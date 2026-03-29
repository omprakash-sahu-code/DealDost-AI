import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    console.log('--- [CHAT DEBUG] START ---');
    console.log('Target URL:', n8nWebhookUrl ? `${n8nWebhookUrl.substring(0, 30)}...` : 'MISSING!');
    console.log('Payload:', JSON.stringify({ chatInput: message, sessionId: sessionId || "test-123" }));

    if (!n8nWebhookUrl) {
      return NextResponse.json({ 
        error: 'N8N_WEBHOOK_URL Missing',
        details: 'Restart the server and check .env.local' 
      }, { status: 500 });
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chatInput: message,
        sessionId: sessionId || "test-123"
      }),
      signal: AbortSignal.timeout(60000) 
    });

    const responseText = await response.text();
    console.log('Raw n8n Response:', responseText || '(EMPTY BODY)');
    console.log('--- [CHAT DEBUG] END ---');

    if (!response.ok) {
      return NextResponse.json({ 
        error: `n8n HTTP ${response.status}`,
        details: responseText 
      }, { status: response.status });
    }

    if (!responseText || responseText.trim() === '' || responseText === 'Workflow started') {
      return NextResponse.json({ 
        error: 'n8n Sent No Data',
        details: 'Workflow ran but returned nothing. Check "Respond to Webhook" node in n8n.'
      }, { status: 200 });
    }

    try {
      const rawData = JSON.parse(responseText);
      const data = Array.isArray(rawData) ? rawData[0] : rawData;
      const target = data.json || data;
      
      const aiResponse = target.output || target.message || target.response || target.text || target.content || target.data;

      return NextResponse.json({ 
        response: aiResponse || (typeof target === 'string' ? target : JSON.stringify(target)) 
      });
    } catch (e) {
      // If not JSON, it's likely direct AI text
      return NextResponse.json({ response: responseText });
    }
  } catch (error: any) {
    console.error('[CHAT ERROR]:', error);
    return NextResponse.json({ 
      error: 'Proxy Failed',
      details: error.message 
    }, { status: 500 });
  }
}
