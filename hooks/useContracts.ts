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
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeContract, setActiveContract] = useState<any | null>(null);
  const [contractsList, setContractsList] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

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

      if (!res.ok) throw new Error(data.message || 'Failed to generate contract');

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

  const fetchContracts = useCallback(async (filters: { page?: number, limit?: number, type?: string, status?: string } = {}) => {
    setIsLoadingList(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (filters.page) query.append('page', String(filters.page));
      if (filters.limit) query.append('limit', String(filters.limit));
      if (filters.type) query.append('type', filters.type);
      if (filters.status) query.append('status', filters.status);

      const res = await fetch(`/api/contracts?${query.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch contracts');

      setContractsList(data.contracts);
      setPagination({ page: data.page, total: data.total, totalPages: data.totalPages });
      return data;
    } catch (err: any) {
      console.error('[fetchContracts] Error:', err);
      setError(err.message || 'Failed to fetch contracts');
      throw err;
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  const fetchContract = useCallback(async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch contract');
      
      setActiveContract(data.contract);
      return data.contract;
    } catch (err: any) {
      console.error('[fetchContract] Error:', err);
      setError(err.message || 'Failed to fetch contract');
      throw err;
    }
  }, []);

  const updateContract = useCallback(async (id: string, updates: { sections?: any[], title?: string, status?: string }) => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update contract');
      
      setActiveContract(data.contract);
      return data.contract;
    } catch (err: any) {
      console.error('[updateContract] Error:', err);
      setError(err.message || 'Failed to update contract');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteContract = useCallback(async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete contract');
      
      return data;
    } catch (err: any) {
      console.error('[deleteContract] Error:', err);
      setError(err.message || 'Failed to delete contract');
      throw err;
    }
  }, []);

  return {
    generateContract,
    fetchContracts,
    fetchContract,
    updateContract,
    deleteContract,
    isGenerating,
    isLoadingList,
    isSaving,
    error,
    activeContract,
    setActiveContract,
    contractsList,
    pagination,
  };
}
