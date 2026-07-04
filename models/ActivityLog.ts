import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'contract_generated' | 'contract_updated' | 'contract_exported' | 'chat_started' | 'login' | 'settings_updated';
  resourceType: 'contract' | 'conversation' | 'user';
  resourceId?: mongoose.Types.ObjectId;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { 
      type: String, 
      enum: ['contract_generated', 'contract_updated', 'contract_exported', 'chat_started', 'login', 'settings_updated'], 
      required: true 
    },
    resourceType: { 
      type: String, 
      enum: ['contract', 'conversation', 'user'], 
      required: true 
    },
    resourceId: { type: Schema.Types.ObjectId, required: false },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound index for timeline queries
activityLogSchema.index({ userId: 1, createdAt: -1 });

// TTL index to automatically delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

export default ActivityLog;
