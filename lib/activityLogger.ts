import connectDB from './db';
import ActivityLog from '@/models/ActivityLog';
import mongoose from 'mongoose';

export async function logActivity(
  userId: string | mongoose.Types.ObjectId,
  action: 'contract_generated' | 'contract_updated' | 'contract_exported' | 'chat_started' | 'login' | 'settings_updated',
  resourceType: 'contract' | 'conversation' | 'user',
  description: string,
  resourceId?: string | mongoose.Types.ObjectId,
  metadata?: Record<string, any>
) {
  try {
    await connectDB();
    const log = new ActivityLog({
      userId,
      action,
      resourceType,
      resourceId: resourceId || undefined,
      description,
      metadata,
    });
    await log.save();
    return log;
  } catch (error) {
    console.error('[logActivity] Failed to write log:', error);
  }
}
