'use client';

import { useState, useCallback } from 'react';
import { ChatResponse, GeminiExtractedTerms } from '@/types/chat';

export interface Message {
  role: 'user' | 'ai';
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Expose the latest extracted terms for the UI preview panel
  const [extractedTerms, setExtractedTerms] = useState<GeminiExtractedTerms | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Optimistically add user message
    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useChat] Sending message to /api/chat:', { message: content, conversationId });
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content, 
          conversationId 
        }),
      });

      console.log('[useChat] Response status:', res.status);
      const data: ChatResponse & { message?: string } = await res.json();
      console.log('[useChat] Response data:', data);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'ai', content: data.aiResponse }]);
      
      // Update state with structured AI output
      setConversationId(data.conversationId);
      setExtractedTerms(data.extractedTerms);

    } catch (err: any) {
      console.error('[useChat] Error caught:', err);
      setError(err.message || 'Something went wrong');
      // Remove the optimistic message on failure
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const loadConversation = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to load conversation');
      
      setMessages(data.conversation.messages);
      setConversationId(id);
      setExtractedTerms(data.conversation.extractedTerms);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setExtractedTerms(null);
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    conversationId,
    extractedTerms,
    loadConversation,
    clearChat
  };
}
