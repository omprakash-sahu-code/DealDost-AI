import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contract from '@/models/Contract';
import ActivityLog from '@/models/ActivityLog';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    await connectDB();
    const contract = await Contract.findOne({ _id: params.id, userId: payload.userId });

    if (!contract) {
      return NextResponse.json({ message: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ contract });
  } catch (error: any) {
    console.error('Contract GET API Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch contract' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    const body = await req.json();
    const { sections, title, status } = body;

    await connectDB();
    
    // Fetch the current contract
    const contract = await Contract.findOne({ _id: params.id, userId: payload.userId });

    if (!contract) {
      return NextResponse.json({ message: 'Contract not found' }, { status: 404 });
    }

    let hasChanges = false;

    // Check if sections are updated
    if (sections) {
      const currentSectionsStr = JSON.stringify(contract.content.sections);
      const newSectionsStr = JSON.stringify(sections);
      if (currentSectionsStr !== newSectionsStr) {
        contract.content.sections = sections;
        hasChanges = true;
      }
    }

    // Check if title is updated
    if (title && contract.title !== title) {
      contract.title = title;
      hasChanges = true;
    }

    // Check if status is updated
    if (status && contract.status !== status) {
      contract.status = status;
      hasChanges = true;
    }

    // If no changes, return the document as-is
    if (!hasChanges) {
      return NextResponse.json({ contract });
    }

    // Apply updates
    contract.metadata.version = (contract.metadata.version || 1) + 1;
    await contract.save();

    await ActivityLog.create({
      userId: payload.userId,
      action: 'contract_updated',
      resourceType: 'contract',
      resourceId: contract._id,
      description: `Updated contract: ${contract.title}`,
    });

    return NextResponse.json({ contract });
  } catch (error: any) {
    console.error('Contract PATCH API Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update contract' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);

    await connectDB();
    const contract = await Contract.findOneAndDelete({ _id: params.id, userId: payload.userId });

    if (!contract) {
      return NextResponse.json({ message: 'Contract not found' }, { status: 404 });
    }

    await ActivityLog.create({
      userId: payload.userId,
      action: 'contract_updated', // Usually we'd have a 'contract_deleted' but the schema limits actions
      resourceType: 'contract',
      description: `Deleted contract: ${contract.title}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contract DELETE API Error:', error);
    return NextResponse.json({ message: error.message || 'Failed to delete contract' }, { status: 500 });
  }
}
