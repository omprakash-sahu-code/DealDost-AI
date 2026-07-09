'use client';

import { useContext } from 'react';
import { ChatContext } from '@/context/ChatContext';

export interface Message {
  role: 'user' | 'ai';
  content: string;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
