'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@imobi.com.br');
  const [password, setPassword] = useState('Teste@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = '/empresa/dashboard';
    } catch (err: any) {
      setError(err.message || 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Bauhaus geometric background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[var(--color-primary)] opacity-10" style={{ borderRadius: 0 }} />
        <div className="absolute bottom-32 right-32 w-80 h-80 border-[3px] border-black/5" style={{ borderRadius: 0 }} />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-black/5" style={{ borderRadius: 0, transform: 'rotate(45deg)' }} />
      </div>
      
      {/* Login Card - Bauhaus style */}
      <div className="w-full max-w-md p-10 bg-white border-[3px] border-black relative z-10 mx-4" style={{ borderRadius: 0 }}>
        
        {/* Logo Area - Geometric */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-32 h-32 flex items-center justify-center mb-4 border-[3px] border-black bg-white" style={{ borderRadius: 0 }}>
            <Image 
              src="/logo.png" 
              alt="iMOBI Logo" 
              width={120} 
              height={120}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-5xl font-black text-black tracking-tight uppercase">
            SOCIMOB
          </h1>
          <p className="text-gray-600 text-sm mt-2 font-bold tracking-wider uppercase">Gestão Imobiliária</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-[2px] border-red-500 text-red-700 px-4 py-3 text-sm mb-6 font-bold" style={{ borderRadius: 0 }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-black">Email Corporativo</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border-[2px] border-black focus:outline-none focus:border-[var(--color-primary)] text-black placeholder-gray-400 transition-colors font-medium"
              style={{ borderRadius: 0 }}
              placeholder="seu@imobiliaria.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-black">Senha de Acesso</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border-[2px] border-black focus:outline-none focus:border-[var(--color-primary)] text-black placeholder-gray-400 transition-colors font-medium"
              style={{ borderRadius: 0 }}
              placeholder="••••••••"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] hover:bg-black text-white font-black py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-[3px] border-black uppercase tracking-wider"
              style={{ borderRadius: 0 }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Acessar Painel</span>
                  <ArrowRight className="h-5 w-5" strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center border-t-[2px] border-black pt-6">
          <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">
            &copy; 2025 iMOBI Systems
          </p>
        </div>
      </div>
    </div>
  );
}
