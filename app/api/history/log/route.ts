import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    const body = await req.json();
    const { action, resourceType, resourceId, description, metadata } = body;

    if (!action || !resourceType || !description) {
      return NextResponse.json({ message: 'Missing required fields: action, resourceType, description' }, { status: 400 });
    }

    await connectDB();
    const log = await ActivityLog.create({
      userId: payload.userId,
      action,
      resourceType,
      resourceId: resourceId || undefined,
      description,
      metadata: metadata || undefined,
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error: any) {
    console.error('History Log API Error:', error);
    return NextResponse.json({ message: 'Failed to log activity' }, { status: 500 });
  }
}
