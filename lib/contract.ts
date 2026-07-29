// models/Contract.ts
import mongoose, { Document, Model, Schema } from 'mongoose';
import { IExtractedTerms } from './Conversation';
import { LanguageCode, LANGUAGE_CODES } from '@/lib/languages';

export interface IContractSection {
  id: string;
  title: string;
  content: string;
  editable: boolean;
}

export type TranslationStatus = 'not_applicable' | 'pending' | 'success' | 'failed';

export interface IContract extends Document {
  userId: mongoose.Types.ObjectId;
  conversationId?: mongoose.Types.ObjectId;
  title: string;
  type: 'nda' | 'msa' | 'freelance' | 'rental' | 'custom';
  status: 'draft' | 'final' | 'signed' | 'expired';
  isShared: boolean;
  terms: IExtractedTerms;
  content: {
    markdown: string;
    sections: IContractSection[];
  };
  language: LanguageCode;
  translatedContent?: {
    markdown: string;
    sections: IContractSection[];
  } | null;
  translationStatus: TranslationStatus;
  translationError?: string | null;
  metadata: {
    generatedBy: 'ai-chat' | 'template' | 'manual';
    aiModel: string;
    tone: 'strict' | 'balanced' | 'flexible';
    version: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const contractSectionSchema = new Schema<IContractSection>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  editable: { type: Boolean, default: true },
}, { _id: false });

const contractSchema = new Schema<IContract>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: false },
    title: { type: String, required: true },
    type: { type: String, enum: ['nda', 'msa', 'freelance', 'rental', 'custom'], required: true },
    status: { type: String, enum: ['draft', 'final', 'signed', 'expired'], default: 'draft' },
    isShared: { type: Boolean, default: false },
    terms: { type: Schema.Types.Mixed, required: true },
    content: {
      markdown: { type: String, default: '' },
      sections: { type: [contractSectionSchema], default: [] },
    },
    language: {
      type: String,
      enum: LANGUAGE_CODES,
      default: 'en',
    },
    translatedContent: {
      type: {
        markdown: { type: String },
        sections: { type: [contractSectionSchema] },
      },
      default: null,
      required: false,
    },
    translationStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'success', 'failed'],
      default: 'not_applicable',
    },
    translationError: {
      type: String,
      default: null,
    },
    metadata: {
      generatedBy: { type: String, enum: ['ai-chat', 'template', 'manual'], required: true },
      aiModel: { type: String, default: 'gemini-2.0-flash' },
      tone: { type: String, enum: ['strict', 'balanced', 'flexible'], default: 'balanced' },
      version: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

contractSchema.index({ userId: 1, status: 1, updatedAt: -1 });

const Contract: Model<IContract> = mongoose.models.Contract || mongoose.model<IContract>('Contract', contractSchema);

export default Contract;