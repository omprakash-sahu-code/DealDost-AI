import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Conversation from '@/models/Conversation';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({ userId: payload.userId })
      .select('title status updatedAt') // Don't fetch full message history for the list
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Conversation.countDocuments({ userId: payload.userId });

    return NextResponse.json({ conversations, total, page, limit }, { status: 200 });

  } catch (error: any) {
    console.error('Conversations List API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch conversations' }, { status: 500 });
  }
}
