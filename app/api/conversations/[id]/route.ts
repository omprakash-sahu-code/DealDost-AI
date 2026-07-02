import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Conversation from '@/models/Conversation';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    await connectDB();

    const conversation = await Conversation.findOne({ 
      _id: params.id, 
      userId: payload.userId 
    });

    if (!conversation) {
      return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation }, { status: 200 });

  } catch (error: any) {
    console.error('Fetch Conversation API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch conversation' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    await connectDB();

    const result = await Conversation.deleteOne({ 
      _id: params.id, 
      userId: payload.userId 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Delete Conversation API Error:', error);
    return NextResponse.json({ message: 'Failed to delete conversation' }, { status: 500 });
  }
}
