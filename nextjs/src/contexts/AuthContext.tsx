'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { directusClient } from '@/lib/directus/client';
import { readMe, login as directusLogin, logout as directusLogout } from '@directus/sdk';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  company_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // @ts-ignore - Custom schema field company_id
      const currentUser = await directusClient.request(readMe({
        fields: ['*']
      }));
      
      setUser(currentUser as User);
    } catch (error) {
      // Silently handle unauthenticated state - this is expected behavior
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      // Login com autenticação via cookie
      await directusClient.request(
        directusLogin(email, password)
      );

      await checkAuth();
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Credenciais inválidas');
    }
  }

  async function logout() {
    try {
      await directusClient.request(directusLogout());
      setUser(null);
    } catch (error) {
      // Silently handle logout errors
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
