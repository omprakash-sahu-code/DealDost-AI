import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contract from '@/models/Contract';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const contract = await Contract.findById(params.id).lean();

    if (!contract) {
      return NextResponse.json({ message: 'Contract not found' }, { status: 404 });
    }

    if (!contract.isShared) {
      return NextResponse.json({ message: 'This contract is not publicly available' }, { status: 403 });
    }

    // Return only safe, non-sensitive fields
    return NextResponse.json({
      contract: {
        _id: contract._id,
        title: contract.title,
        type: contract.type,
        status: contract.status,
        content: contract.content,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Shared View API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch shared contract' }, { status: 500 });
  }
}
