'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

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

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Decorativo Bauhaus */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0c0c0c] relative overflow-hidden">
        {/* Formas geométricas Bauhaus */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#d90429] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/4 right-0 w-48 h-48 bg-[#fcbf49]" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#00a8e8] rounded-full translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 border-8 border-white rotate-45 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#fcbf49] rounded-full" />
        
        {/* Logo centralizada */}
        <div className="relative z-10 flex items-center justify-center w-full">
          <Image 
            src="/images/logo-imobi.png" 
            alt="iMOBI" 
            width={320} 
            height={120}
            className="drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image 
              src="/images/logo-imobi.png" 
              alt="iMOBI" 
              width={200} 
              height={75}
            />
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-black text-[#0c0c0c] tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 text-gray-600">
              Entre com suas credenciais para acessar o painel
            </p>
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-[#d90429] text-white px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#0c0c0c] mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#0c0c0c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a8e8] focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#0c0c0c] mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#0c0c0c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a8e8] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0c0c0c] text-white font-bold py-4 rounded-lg hover:bg-[#d90429] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="flex justify-between text-sm">
            <a href="#" className="text-gray-600 hover:text-[#d90429] transition-colors">
              Esqueceu a senha?
            </a>
            <a href="#" className="text-[#00a8e8] font-semibold hover:text-[#d90429] transition-colors">
              Criar conta
            </a>
          </div>

          {/* Decoração bottom */}
          <div className="flex justify-center gap-3 pt-8">
            <div className="w-4 h-4 bg-[#d90429] rounded-full" />
            <div className="w-4 h-4 bg-[#fcbf49]" />
            <div className="w-4 h-4 bg-[#00a8e8] rounded-full" />
            <div className="w-4 h-4 bg-[#0c0c0c]" />
          </div>
        </div>
      </div>
    </div>
  );
}
