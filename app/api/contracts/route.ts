import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contract from '@/models/Contract';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import { generateContractFromTerms, extractDealTerms } from '@/lib/gemini';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

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

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // 3. Resolve terms
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
      
      // Append user notes if provided alongside the chat-based flow
      if (description) {
        termsToUse.userNotes = description;
      }
      contractType = 'custom';
    } else if (description && !termsToUse) {
      // Template flow: We can try to extract terms from description first for better structure, 
      // or just pass description directly as scope. Let's pass it as scope.
      termsToUse = { scope: description };
    }

    if (!termsToUse) {
      return NextResponse.json({ message: 'Terms, description, or conversationId is required' }, { status: 400 });
    }

    // 4. Generate Contract via AI
    const generatedData = await generateContractFromTerms(termsToUse, contractType, {
      aiTone: user.preferences.aiTone,
    });

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
      metadata: {
        generatedBy: conversationId ? 'ai-chat' : 'template',
        aiModel: process.env.AI_MODEL || 'openrouter-gemma',
        tone: user.preferences.aiTone,
        version: 1,
      }
    });

    await contract.save();

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      action: 'contract_generated',
      resourceType: 'contract',
      resourceId: contract._id,
      description: `Generated a new ${contractType.toUpperCase()} contract`,
    });

    // If conversation exists, link it
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
