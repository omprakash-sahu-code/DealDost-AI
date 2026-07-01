import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'free' | 'premium';
  preferences: {
    defaultContractType: 'nda' | 'msa' | 'freelance' | 'rental';
    aiTone: 'strict' | 'balanced' | 'flexible';
    language: 'en' | 'hi' | 'hinglish';
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['free', 'premium'], default: 'free' },
    preferences: {
      defaultContractType: { 
        type: String, 
        enum: ['nda', 'msa', 'freelance', 'rental'], 
        default: 'nda' 
      },
      aiTone: { 
        type: String, 
        enum: ['strict', 'balanced', 'flexible'], 
        default: 'balanced' 
      },
      language: { 
        type: String, 
        enum: ['en', 'hi', 'hinglish'], 
        default: 'hinglish' 
      },
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
