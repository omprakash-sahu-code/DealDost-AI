'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LoginInput, RegisterInput } from '@/lib/validators';

export interface User {
  id: string;
  name: string;
  email: string;
  preferences?: {
    defaultContractType: 'nda' | 'msa' | 'freelance' | 'rental';
    aiTone: 'strict' | 'balanced' | 'flexible';
    language: 'en' | 'hi' | 'hinglish';
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        // Backend returns user with Mongoose _id, let's map it to id if needed
        const mappedUser = {
          ...data.user,
          id: data.user._id || data.user.id
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data: LoginInput) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      const error: any = new Error(result.message || 'Login failed');
      if (result.errors) error.errors = result.errors;
      throw error;
    }

    const mappedUser = {
      ...result.user,
      id: result.user._id || result.user.id
    };
    setUser(mappedUser);
    router.push('/dashboard/chat');
  };

  const register = async (data: RegisterInput) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      const error: any = new Error(result.message || 'Registration failed');
      if (result.errors) error.errors = result.errors;
      throw error;
    }

    const mappedUser = {
      ...result.user,
      id: result.user._id || result.user.id
    };
    setUser(mappedUser);
    router.push('/dashboard/chat');
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
