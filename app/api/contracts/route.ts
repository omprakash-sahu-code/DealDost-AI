// app/api/contracts/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contract from '@/models/Contract';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import { generateContractFromTerms, translateContractSections } from '@/lib/gemini';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { isValidLanguageCode } from '@/lib/languages';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    // 2. Parse request
    const body = await req.json();
    const { conversationId, type, description } = body;

    let termsToUse: any = body.terms;
    let contractType = type || 'custom';

    // Language is a top-level output preference, independent of extracted terms.
    const language = isValidLanguageCode(body.language) ? body.language : 'en';

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // 3. Resolve terms (unchanged from existing logic)
    if (conversationId) {
      const conversation = await Conversation.findOne({ _id: conversationId, userId: user._id });
      if (!conversation) {
        return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
      }

      if (body.terms) {
        termsToUse = body.terms;
        conversation.extractedTerms = body.terms;
        await conversation.save();
      } else {
        if (!conversation.extractedTerms) {
          return NextResponse.json({ message: 'No extracted terms found in conversation' }, { status: 400 });
        }
        termsToUse = { ...JSON.parse(JSON.stringify(conversation.extractedTerms)) };
      }

      if (description) {
        termsToUse.userNotes = description;
      }
      contractType = 'custom';
    } else if (description && !termsToUse) {
      termsToUse = { scope: description };
    }

    if (!termsToUse) {
      return NextResponse.json({ message: 'Terms, description, or conversationId is required' }, { status: 400 });
    }

    // 4. Generate base contract via AI (unchanged)
    const generatedData = await generateContractFromTerms(termsToUse, contractType, {
      aiTone: user.preferences.aiTone,
    });

    // 4b. Translate if a regional language was requested — isolated, non-fatal on failure.
    let translatedContent: { markdown: string; sections: typeof generatedData.sections } | null = null;
    let translationStatus: 'not_applicable' | 'pending' | 'success' | 'failed' = 'not_applicable';
    let translationError: string | null = null;

    const languageRequiresTranslation = language !== 'en' && language !== 'hinglish';
    if (languageRequiresTranslation) {
      translationStatus = 'pending';
      const translationResult = await translateContractSections(
        generatedData.title,
        generatedData.sections,
        language
      );

      if (translationResult.success && translationResult.data) {
        translatedContent = {
          markdown: translationResult.data.fullMarkdown,
          sections: translationResult.data.sections,
        };
        translationStatus = 'success';
      } else {
        translationStatus = 'failed';
        translationError = translationResult.errorMessage;
        // Deliberately do not fail the request — base contract is still valid.
      }
    }

    // 5. Save to Database
    const contract = new Contract({
      userId: user._id,
      conversationId: conversationId || undefined,
      title: generatedData.title || `${contractType.toUpperCase()} Agreement`,
      type: contractType,
      status: 'draft',
      terms: termsToUse,
      content: {
        markdown: generatedData.fullMarkdown,
        sections: generatedData.sections,
      },
      language,
      translatedContent,
      translationStatus,
      translationError,
      metadata: {
        generatedBy: conversationId ? 'ai-chat' : 'template',
        aiModel: process.env.AI_MODEL || 'openrouter-gemma',
        tone: user.preferences.aiTone,
        version: 1,
      }
    });

    await contract.save();

    // Log activity (unchanged)
    const activityDescription = generatedData.title || (description && description.length > 80 ? description.substring(0, 80) + '...' : description) || `${contractType.toUpperCase()} Agreement`;
    await ActivityLog.create({
      userId: user._id,
      action: 'contract_generated',
      resourceType: 'contract',
      resourceId: contract._id,
      description: activityDescription,
    });

    if (conversationId) {
      await Conversation.updateOne({ _id: conversationId }, { contractId: contract._id });
    }

    // 6. Return response
    return NextResponse.json({ contract }, { status: 201 });

  } catch (error: any) {
    console.error('Contract Generation API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to generate contract' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    await connectDB();

    const query: any = { userId: payload.userId };
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;

    const skip = (page - 1) * limit;

    const contracts = await Contract.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contract.countDocuments(query);

    return NextResponse.json({
      contracts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error: any) {
    console.error('Contracts GET API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}