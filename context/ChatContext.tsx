'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChatResponse, GeminiExtractedTerms } from '@/types/chat';

export interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ChatContextType {
  // Chat States
  messages: Message[];
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;
  extractedTerms: GeminiExtractedTerms | null;
  
  // Persisted UI states
  activeContract: any | null;
  localTerms: any | null;
  viewMode: 'checklist' | 'document';
  rightPanelSize: 'split' | 'full';
  inputText: string;
  userNotes: string;
  approvalChecked: boolean;

  // Setters
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setConversationId: (id: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setExtractedTerms: (terms: GeminiExtractedTerms | null) => void;
  
  setActiveContract: (contract: any | null) => void;
  setLocalTerms: React.Dispatch<React.SetStateAction<any | null>>;
  setViewMode: (mode: 'checklist' | 'document') => void;
  setRightPanelSize: (size: 'split' | 'full') => void;
  setInputText: (text: string) => void;
  setUserNotes: (text: string) => void;
  setApprovalChecked: (checked: boolean) => void;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  clearChat: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedTerms, setExtractedTerms] = useState<GeminiExtractedTerms | null>(null);

  const [activeContract, setActiveContract] = useState<any | null>(null);
  const [localTerms, setLocalTerms] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'checklist' | 'document'>('checklist');
  const [rightPanelSize, setRightPanelSize] = useState<'split' | 'full'>('split');
  const [inputText, setInputText] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [approvalChecked, setApprovalChecked] = useState(false);

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
      setLocalTerms(data.extractedTerms); // Update local terms when new ones are extracted

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
      setLocalTerms(data.conversation.extractedTerms);

      // Load contract if available
      if (data.conversation.contractId) {
        const contractRes = await fetch(`/api/contracts/${data.conversation.contractId}`);
        if (contractRes.ok) {
          const contractData = await contractRes.json();
          setActiveContract(contractData.contract);
          setViewMode('document');
          setRightPanelSize('full');
        } else {
          setActiveContract(null);
          setViewMode('checklist');
          setRightPanelSize('split');
        }
      } else {
        setActiveContract(null);
        setViewMode('checklist');
        setRightPanelSize('split');
      }
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
    setActiveContract(null);
    setLocalTerms(null);
    setViewMode('checklist');
    setRightPanelSize('split');
    setInputText('');
    setUserNotes('');
    setApprovalChecked(false);
    setError(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        conversationId,
        isLoading,
        error,
        extractedTerms,
        activeContract,
        localTerms,
        viewMode,
        rightPanelSize,
        inputText,
        userNotes,
        approvalChecked,
        setMessages,
        setConversationId,
        setIsLoading,
        setError,
        setExtractedTerms,
        setActiveContract,
        setLocalTerms,
        setViewMode,
        setRightPanelSize,
        setInputText,
        setUserNotes,
        setApprovalChecked,
        sendMessage,
        loadConversation,
        clearChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
