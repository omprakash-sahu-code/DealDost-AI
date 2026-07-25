import OpenAI from 'openai';
import { IMessage, IExtractedTerms } from '@/models/Conversation';
import { GeminiResponse } from '@/types/chat';
import { LanguageCode, getLanguageOption } from '@/lib/languages';

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

const CONTRACT_GENERATION_PROMPT = `
Generate a professional {{CONTRACT_TYPE}} contract with the following terms:
{{EXTRACTED_TERMS}}

REQUIREMENTS:
- Use formal legal language appropriate for Indian contract law.
- Tone: {{AI_TONE}}
- Include standard clauses: Scope, Payment, Timeline, Confidentiality, Governing Law, Termination, Dispute Resolution, Entire Agreement.
- Structure into numbered sections with clear headings.
- Date: {{CURRENT_DATE}}

OUTPUT:
Always respond with valid JSON matching this exact schema and NOTHING else (no markdown fences, no extra text):
{
  "title": "Contract Title",
  "sections": [
    { "id": "1", "title": "1. SCOPE OF SERVICES", "content": "...", "editable": true }
  ],
  "fullMarkdown": "The complete contract as a single markdown string"
}
`;

export async function generateContractFromTerms(
  terms: Partial<IExtractedTerms>,
  contractType: string,
  userContext: { aiTone: string }
) {
  const systemInstruction = CONTRACT_GENERATION_PROMPT
    .replace('{{CONTRACT_TYPE}}', contractType)
    .replace('{{EXTRACTED_TERMS}}', JSON.stringify(terms, null, 2))
    .replace('{{AI_TONE}}', userContext.aiTone)
    .replace('{{CURRENT_DATE}}', new Date().toLocaleDateString('en-IN'));

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: 'You are a legal contract generator.' },
    { role: 'user', content: systemInstruction },
  ];

  const completion = await openrouter.chat.completions.create({
    model: process.env.AI_MODEL!,
    messages,
    temperature: 0.2, // Very low temperature for structured legal text
  });

  const responseText = completion.choices[0]?.message?.content || '';

  try {
    const cleaned = responseText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned) as {
      title: string;
      sections: { id: string; title: string; content: string; editable: boolean }[];
      fullMarkdown: string;
    };
  } catch (error) {
    console.error('Failed to parse AI contract response:', responseText);
    throw new Error('Invalid JSON contract response from AI');
  }
}
const TRANSLATION_PROMPT = `
You are a certified legal translator specializing in Indian contract law and regional Indian languages.

Translate the following contract sections into {{TARGET_LANGUAGE}}.

STRICT REQUIREMENTS:
- Preserve section numbering and headings exactly as structured in the input (e.g., "1. SCOPE OF SERVICES" becomes the equivalent numbered heading in the target language, keeping the same number).
- Preserve paragraph structure within each section's content.
- Do NOT translate proper nouns that are clearly party names, unless they have an established localized form.
- Do NOT translate anything inside square brackets, e.g. [Date], [Signature] — leave these as-is.
- Keep monetary figures, dates, and section IDs unchanged.
- Do not add commentary, notes, or explanations outside the JSON.

INPUT SECTIONS (JSON):
{{SECTIONS_JSON}}

OUTPUT:
Respond with valid JSON matching this exact schema and NOTHING else (no markdown fences, no extra text):
{
  "title": "Translated contract title",
  "sections": [
    { "id": "1", "title": "Translated heading", "content": "Translated content", "editable": true }
  ]
}
`;

export interface TranslatedContract {
  title: string;
  sections: { id: string; title: string; content: string; editable: boolean }[];
  fullMarkdown: string;
}

export interface TranslateContractResult {
  success: boolean;
  data: TranslatedContract | null;
  errorMessage: string | null;
}

/**
 * Translates an already-generated contract's title + sections into the target
 * regional language, then reconstructs fullMarkdown from the translated
 * sections (never translates fullMarkdown independently) so both
 * representations stay in sync.
 */
export async function translateContractSections(
  title: string,
  sections: { id: string; title: string; content: string; editable: boolean }[],
  targetLanguage: LanguageCode
): Promise<TranslateContractResult> {
  const languageOption = getLanguageOption(targetLanguage);

  if (!languageOption.requiresTranslation) {
    return {
      success: true,
      data: {
        title,
        sections,
        fullMarkdown: sectionsToMarkdown(title, sections),
      },
      errorMessage: null,
    };
  }

  const systemInstruction = TRANSLATION_PROMPT
    .replace('{{TARGET_LANGUAGE}}', languageOption.label)
    .replace('{{SECTIONS_JSON}}', JSON.stringify({ title, sections }, null, 2));

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: 'You are a legal contract translator.' },
    { role: 'user', content: systemInstruction },
  ];

  try {
    const completion = await openrouter.chat.completions.create({
      model: process.env.AI_MODEL!,
      messages,
      temperature: 0.2,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const cleaned = responseText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned) as {
      title: string;
      sections: { id: string; title: string; content: string; editable: boolean }[];
    };

    if (!parsed.sections || parsed.sections.length === 0) {
      return {
        success: false,
        data: null,
        errorMessage: 'Translation returned no sections.',
      };
    }

    return {
      success: true,
      data: {
        title: parsed.title,
        sections: parsed.sections,
        fullMarkdown: sectionsToMarkdown(parsed.title, parsed.sections),
      },
      errorMessage: null,
    };
  } catch (error) {
    console.error('Failed to translate/parse contract sections:', error);
    return {
      success: false,
      data: null,
      errorMessage: 'Translation service failed or returned invalid data.',
    };
  }
}

/** Deterministically rebuilds a markdown document from sections, so
 * fullMarkdown always matches sections exactly — no independent generation. */
function sectionsToMarkdown(
  title: string,
  sections: { id: string; title: string; content: string }[]
): string {
  const body = sections.map((s) => `## ${s.title}\n\n${s.content}`).join('\n\n');
  return `# ${title}\n\n${body}`;
}
