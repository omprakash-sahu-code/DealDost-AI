import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import { extractDealTerms } from '@/lib/gemini';
import { IMessage } from '@/models/Conversation';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { ChatRequest, ChatResponse } from '@/types/chat';
import { rateLimit } from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting (15 requests per minute limit)
    const rateLimitRes = await rateLimit(req, { limit: 15, windowMs: 60 * 1000 });
    const headers = {
      'X-RateLimit-Limit': rateLimitRes.limit.toString(),
      'X-RateLimit-Remaining': rateLimitRes.remaining.toString(),
      'X-RateLimit-Reset': rateLimitRes.resetTime.toString(),
    };

    if (!rateLimitRes.success) {
      return NextResponse.json(
        {
          error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests. Please wait a minute and try again.',
          },
        },
        { status: 429, headers }
      );
    }

    // 1. Authenticate user
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    // 2. Parse request
    const body: ChatRequest = await req.json();
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    await connectDB();

    // 3. Fetch user and conversation
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    let conversation;
    let history: IMessage[] = [];

    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId: user._id });
      if (!conversation) {
        return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
      }
      history = conversation.messages;
    } else {
      conversation = new Conversation({
        userId: user._id,
        title: message.substring(0, 40) + '...', // Simple title generation for now
        messages: [],
      });
      // Log activity on new chat
      await ActivityLog.create({
        userId: user._id,
        action: 'chat_started',
        resourceType: 'conversation',
        resourceId: conversation._id,
        description: 'Started a new contract conversation',
      });
    }

    // 4. Call Gemini AI
    const geminiResponse = await extractDealTerms(message, history, {
      name: user.name,
      aiTone: user.preferences.aiTone,
    });

    // 5. Update Conversation in DB
    const userMessageDoc: IMessage = { role: 'user', content: message, timestamp: new Date() };
    const aiMessageDoc: IMessage = { 
      role: 'ai', 
      content: geminiResponse.aiMessage,
      extractedTerms: geminiResponse.extractedTerms as any,
      timestamp: new Date() 
    };

    conversation.messages.push(userMessageDoc, aiMessageDoc);
    conversation.extractedTerms = geminiResponse.extractedTerms as any; // Update latest terms state
    
    await conversation.save();

    // 6. Return response to client
    const responseData: ChatResponse = {
      aiResponse: geminiResponse.aiMessage,
      extractedTerms: geminiResponse.extractedTerms,
      conversationId: conversation._id.toString(),
      contractReady: geminiResponse.contractReady,
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to process chat message',
        error: {
          code: 'CHAT_PROCESSING_ERROR',
          message: error.message || 'Failed to process chat message',
        },
      },
      { status: 500 }
    );
  }
}
