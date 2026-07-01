import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IExtractedTerms {
  parties: {
    sideA: string;
    sideB: string;
  };
  payment: {
    amount: number;
    currency: string;
    terms: string;
  };
  deadline: string;
  scope: string;
  location: string;
  confidence: number;
  missingFields: string[];
}

export interface IMessage {
  role: 'user' | 'ai';
  content: string;
  extractedTerms?: Partial<IExtractedTerms>;
  timestamp: Date;
}

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  extractedTerms: IExtractedTerms | null;
  status: 'active' | 'completed' | 'archived';
  contractId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const extractedTermsSchema = new Schema<IExtractedTerms>({
  parties: {
    sideA: { type: String, default: '' },
    sideB: { type: String, default: '' },
  },
  payment: {
    amount: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
    terms: { type: String, default: '' },
  },
  deadline: { type: String, default: '' },
  scope: { type: String, default: '' },
  location: { type: String, default: 'India' },
  confidence: { type: Number, default: 0 },
  missingFields: { type: [String], default: [] },
}, { _id: false });

const messageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  extractedTerms: { type: extractedTermsSchema, required: false },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const conversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Conversation' },
    messages: { type: [messageSchema], default: [] },
    extractedTerms: { type: extractedTermsSchema, default: null },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: false },
  },
  { timestamps: true }
);

// Compound index for listing user's conversations sorted by recent
conversationSchema.index({ userId: 1, updatedAt: -1 });

const Conversation: Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation;
