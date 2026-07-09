import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find({ userId: payload.userId, action: { $nin: ['login', 'settings_updated'] } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ActivityLog.countDocuments({ userId: payload.userId });

    return NextResponse.json({ logs, total, page, limit }, { status: 200 });
  } catch (error: any) {
    console.error('History GET API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch history logs' }, { status: 500 });
  }
}
