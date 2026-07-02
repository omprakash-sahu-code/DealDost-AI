export interface GeminiExtractedTerms {
  parties: {
    sideA: string;
    sideB: string;
  };
  payment: {
    amount: number | null;
    currency: string;
    terms: string;
  };
  deadline: string;
  scope: string;
  location: string;
  confidence: number;
  missingFields: string[];
}

export interface GeminiResponse {
  aiMessage: string;
  extractedTerms: GeminiExtractedTerms;
  contractReady: boolean;
  suggestedFollowUp: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  aiResponse: string;
  extractedTerms: GeminiExtractedTerms;
  conversationId: string;
  contractReady: boolean;
}
