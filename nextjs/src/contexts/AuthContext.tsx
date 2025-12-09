'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDesignTheme } from '@/components/ui/ThemeProvider';
import { DEFAULT_DESIGN_THEME } from '@/lib/design-themes';

interface Company {
  id: string;
  name?: string;
  theme_key?: string | null;
}

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  company_id?: string;
  company?: Company;
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
  const { setThemeKey } = useDesignTheme();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        const company = data.user?.company_id && typeof data.user.company_id === 'object'
          ? (data.user.company_id as Company)
          : undefined;

        const normalizedUser: User = {
          ...data.user,
          company_id: company?.id || data.user?.company_id,
          company,
        };

        setUser(normalizedUser);

        if (company?.theme_key) {
          setThemeKey(company.theme_key);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      await checkAuth();
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error('Credenciais inválidas');
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setThemeKey(DEFAULT_DESIGN_THEME);
    } catch (error) {
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
