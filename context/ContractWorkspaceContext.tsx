'use client';

import React, { createContext, useContext, useState } from 'react';

interface ContractWorkspaceContextType {
  selectedType: string;
  setSelectedType: (type: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  viewMode: 'form' | 'preview';
  setViewMode: (mode: 'form' | 'preview') => void;
  activeContract: any | null;
  setActiveContract: (contract: any | null) => void;
}

export const ContractWorkspaceContext = createContext<ContractWorkspaceContextType | undefined>(undefined);

export function ContractWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [selectedType, setSelectedType] = useState('nda');
  const [description, setDescription] = useState('');
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');
  const [activeContract, setActiveContract] = useState<any | null>(null);

  return (
    <ContractWorkspaceContext.Provider
      value={{
        selectedType,
        setSelectedType,
        description,
        setDescription,
        viewMode,
        setViewMode,
        activeContract,
        setActiveContract
      }}
    >
      {children}
    </ContractWorkspaceContext.Provider>
  );
}

export function useContractWorkspace() {
  const context = useContext(ContractWorkspaceContext);
  if (!context) {
    throw new Error('useContractWorkspace must be used within a ContractWorkspaceProvider');
  }
  return context;
}
