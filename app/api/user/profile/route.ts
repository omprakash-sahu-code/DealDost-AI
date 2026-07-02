import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    user.name = name;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      action: 'settings_updated',
      resourceType: 'user',
      resourceId: user._id,
      description: 'Updated profile information',
    });

    return NextResponse.json({ 
      user: { id: user._id, name: user.name, email: user.email, preferences: user.preferences } 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Profile PATCH API Error:', error);
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}
