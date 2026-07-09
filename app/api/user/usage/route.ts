import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    await connectDB();

    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const role = user.role || 'free';
    const limit = role === 'premium' ? null : 10;

    // Calculate start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Count this month's contract generation actions
    const used = await ActivityLog.countDocuments({
      userId: payload.userId,
      action: 'contract_generated',
      createdAt: { $gte: startOfMonth },
    });

    const remaining = limit === null ? null : Math.max(0, limit - used);

    // Compute last 7 days daily usage
    const dailyUsage = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date();
      dayEnd.setDate(dayEnd.getDate() - i);
      dayEnd.setHours(23, 59, 59, 999);
      
      const count = await ActivityLog.countDocuments({
        userId: payload.userId,
        action: 'contract_generated',
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });
      
      dailyUsage.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        count,
      });
    }

    // Retrieve last 5 recent contract generated logs
    const recentLogs = await ActivityLog.find({
      userId: payload.userId,
      action: 'contract_generated',
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentGenerations = recentLogs.map((log) => ({
      id: log._id.toString(),
      title: log.description,
      createdAt: log.createdAt,
    }));

    return NextResponse.json({
      role,
      used,
      limit,
      remaining,
      dailyUsage,
      recentGenerations,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Usage GET API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch usage analytics' }, { status: 500 });
  }
}
