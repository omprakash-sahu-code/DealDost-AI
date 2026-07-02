'use client';

import { useState, useCallback } from 'react';

export interface ContractPayload {
  conversationId?: string;
  type?: string;
  description?: string;
  terms?: any;
}

export function useContracts() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeContract, setActiveContract] = useState<any | null>(null);

  const generateContract = useCallback(async (payload: ContractPayload) => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate contract');
      }

      setActiveContract(data.contract);
      return data.contract;
    } catch (err: any) {
      console.error('[useContracts] Error:', err);
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateContract,
    isGenerating,
    error,
    activeContract,
    setActiveContract,
  };
}
