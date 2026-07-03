import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contract from '@/models/Contract';
import ActivityLog from '@/models/ActivityLog';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    await connectDB();
    const contract = await Contract.findOne({ _id: params.id, userId: payload.userId });

    if (!contract) {
      return NextResponse.json({ message: 'Contract not found' }, { status: 404 });
    }

    // Toggle isShared
    contract.isShared = !contract.isShared;
    await contract.save();

    // Log activity
    await ActivityLog.create({
      userId: payload.userId,
      action: 'contract_updated',
      resourceType: 'contract',
      resourceId: contract._id,
      description: contract.isShared
        ? `Enabled sharing for: ${contract.title}`
        : `Disabled sharing for: ${contract.title}`,
    });

    return NextResponse.json({ isShared: contract.isShared, contractId: contract._id });
  } catch (error: any) {
    console.error('Share Toggle API Error:', error);
    return NextResponse.json({ message: 'Failed to toggle sharing' }, { status: 500 });
  }
}
