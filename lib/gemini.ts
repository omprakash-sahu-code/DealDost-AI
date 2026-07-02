import OpenAI from 'openai';
import { IMessage } from '@/models/Conversation';
import { GeminiResponse } from '@/types/chat';

const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const SYSTEM_PROMPT = `
You are DealDost AI, a friendly and professional legal assistant specializing in 
Indian contract law. You help users formalize informal business deals into 
structured legal agreements.

ROLE:
- Extract deal terms from casual conversation (English, Hindi, or Hinglish)
- Ask clarifying questions for missing information
- Never provide actual legal advice — you draft contracts, not legal opinions

EXTRACTION RULES:
- parties.sideA: Always "{{USER_NAME}}" (the logged-in user)
- parties.sideB: The counterparty mentioned in the conversation
- payment.amount: Numeric value. Convert "5k" to 5000, "lakh" to 100000
- payment.currency: Default "INR" unless explicitly stated otherwise
- payment.terms: "One-time", "Milestone-based", "Monthly", or custom
- deadline: Normalize to a specific date or relative duration
- scope: Clear description of the work/service being agreed upon
- location: Jurisdiction, default "India" if unspecified

RESPONSE FORMAT:
Always respond with valid JSON matching this exact schema and NOTHING else (no markdown fences, no explanation):
{
  "aiMessage": "Your conversational response to the user",
  "extractedTerms": {
    "parties": { "sideA": "", "sideB": "" },
    "payment": { "amount": null, "currency": "INR", "terms": "" },
    "deadline": "",
    "scope": "",
    "location": "India",
    "confidence": 0.0,
    "missingFields": []
  },
  "contractReady": false,
  "suggestedFollowUp": ""
}

RULES:
- confidence: 0.0-1.0 based on how complete the extracted info is
- missingFields: Array of field names still needed (e.g., ["payment", "deadline"])
- contractReady: true ONLY when ALL required fields have confidence >= 0.8
- suggestedFollowUp: A natural question to fill the most critical missing field
- Keep responses warm, professional, and concise. Tone should be: {{AI_TONE}}
- Support Hinglish naturally ("Rahul ke saath 5k ka logo design Monday tak")
- IMPORTANT: Return ONLY the raw JSON object. No markdown code fences, no backticks, no extra text.
`;

export async function extractDealTerms(
  userMessage: string,
  conversationHistory: IMessage[],
  userContext: { name: string; aiTone: string }
): Promise<GeminiResponse> {
  const systemInstruction = SYSTEM_PROMPT
    .replace('{{USER_NAME}}', userContext.name)
    .replace('{{AI_TONE}}', userContext.aiTone);

  // Build message history for OpenAI-compatible format
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemInstruction },
    ...conversationHistory.map(msg => ({
      role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const completion = await openrouter.chat.completions.create({
    model: process.env.AI_MODEL!,
    messages,
    temperature: 0.3,
  });

  const responseText = completion.choices[0]?.message?.content || '';

  try {
    // Strip markdown code fences if the model wraps its response
    const cleaned = responseText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned) as GeminiResponse;
  } catch (error) {
    console.error('Failed to parse AI response:', responseText);
    throw new Error('Invalid JSON response from AI');
  }
}
