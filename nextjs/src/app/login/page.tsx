'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

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
      // Wait a bit to ensure cookie is set before redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      // Force a full page reload to ensure authentication state is updated
      window.location.href = '/empresa/dashboard';
    } catch (err: any) {
      setError(err.message || 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bauhaus-grid opacity-40" />
        <div className="absolute -left-24 top-10 h-52 w-52 rounded-full bg-[var(--accent-color-soft)] opacity-80 blur-3xl" />
        <div className="absolute right-4 -top-10 h-80 w-80 bg-[var(--accent-color-light)] rotate-12 opacity-70 mix-blend-multiply" />
        <div className="absolute -right-16 bottom-0 h-60 w-60 rounded-full bg-[var(--accent-color)] opacity-60 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[620px] w-[620px] border-8 border-[var(--foreground-color)]/5 rotate-12" />
      </div>

      <div className="relative w-full max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] rounded-[32px] border-[5px] border-[var(--foreground-color)] bg-[var(--background-color)] shadow-[18px_18px_0_#0c0c0c] overflow-hidden">
        <div className="relative hidden lg:flex flex-col gap-10 p-12 bg-gradient-to-br from-[var(--accent-color-soft)] via-[var(--background-color)] to-[var(--accent-color-light)]">
          <div className="flex items-center justify-between text-sm uppercase tracking-[0.24em] font-semibold text-[var(--foreground-color)]">
            <div className="flex items-center gap-3">
              <span className="h-2 w-10 bg-[var(--foreground-color)]" />
              manifesto bauhaus
            </div>
            <Link href="/home" className="bauhaus-pill">
              Vitrine
            </Link>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 bg-[var(--foreground-color)] text-[var(--background-color)] px-4 py-2 uppercase tracking-[0.18em] text-xs">CRM geométrico</div>
            <h1 className="text-5xl font-extrabold leading-tight text-[var(--foreground-color)]">
              IMOBI, reimaginado
              <span className="block text-[var(--accent-color)]">no ritmo geométrico.</span>
            </h1>
            <p className="text-lg text-[var(--foreground-color)]/80 max-w-xl">
              Formas primárias, contrastes ousados e tipografia geométrica criam uma experiência de login totalmente nova.
              Minimalismo funcional com personalidade.
            </p>
            <div className="grid grid-cols-3 gap-3 text-sm font-semibold text-[var(--foreground-color)]">
              <div className="flex flex-col gap-2 p-4 bg-white/70 backdrop-blur rounded-2xl border-2 border-[var(--foreground-color)]">
                <span className="text-3xl">01</span>
                <span>Contraste puro</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-[var(--accent-color)] text-[var(--background-color)] rounded-2xl border-2 border-[var(--foreground-color)]">
                <span className="text-3xl">02</span>
                <span>Geometria</span>
              </div>
              <div className="flex flex-col gap-2 p-4 bg-[var(--accent-color-light)] text-[var(--foreground-color)] rounded-2xl border-2 border-[var(--foreground-color)]">
                <span className="text-3xl">03</span>
                <span>Ritmo visual</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground-color)] uppercase tracking-[0.18em]">
            <span className="bauhaus-pill bg-[var(--foreground-color)] text-[var(--background-color)]">Ateliê</span>
            <span className="bauhaus-pill bg-[var(--accent-color)] text-[var(--background-color)]">1925</span>
            <span className="bauhaus-pill bg-[var(--accent-color-light)] text-[var(--foreground-color)]">Geometria</span>
          </div>
        </div>

        <div className="relative p-8 md:p-12 bg-white/95 backdrop-blur shadow-inner">
          <div className="absolute -top-12 -right-16 h-28 w-28 bg-[var(--accent-color)] rotate-12 shadow-[12px_12px_0_#0c0c0c]" />
          <div className="absolute -bottom-14 -left-16 h-32 w-32 border-[10px] border-[var(--foreground-color)] rotate-6" />
          <div className="relative max-w-lg ml-auto space-y-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[var(--foreground-color)] flex items-center justify-center text-white font-black tracking-tight">
                    iM
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">plataforma</p>
                    <p className="text-xl font-extrabold">IMOBI CRM</p>
                  </div>
                </div>
                <div className="bauhaus-pill">versão 2.0</div>
              </div>
              <div className="bauhaus-card p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-[var(--accent-color)] text-[var(--background-color)] flex items-center justify-center font-black">IA</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Entrada segura</p>
                  <p className="text-lg font-extrabold">Entre no painel geométrico</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-[var(--accent-color)] text-[var(--background-color)] px-4 py-3 rounded-xl border-2 border-[var(--foreground-color)] text-sm font-semibold shadow-[6px_6px_0_#0c0c0c]">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold uppercase tracking-[0.14em]">E-mail</label>
                <div className="flex items-center gap-3 border-2 border-[var(--foreground-color)] bg-[var(--input-color)] px-4 py-3 rounded-xl shadow-[6px_6px_0_#0c0c0c]">
                  <div className="h-4 w-4 rounded-full bg-[var(--accent-color)]" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-base"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold uppercase tracking-[0.14em]">Senha</label>
                <div className="flex items-center gap-3 border-2 border-[var(--foreground-color)] bg-[var(--input-color)] px-4 py-3 rounded-xl shadow-[6px_6px_0_#0c0c0c]">
                  <div className="h-4 w-4 rounded-full bg-[var(--accent-color-light)]" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-base"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--foreground-color)] text-[var(--background-color)] font-extrabold uppercase tracking-[0.18em] py-4 rounded-xl border-2 border-[var(--foreground-color)] hover:-translate-y-0.5 transition transform hover:shadow-[10px_10px_0_#d90429] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Entrar agora
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 grid grid-cols-2 gap-4 text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted-foreground)]">
              <a href="#" className="flex items-center gap-2 group">
                <span className="h-2 w-8 bg-[var(--accent-color)] group-hover:w-10 transition-all" />
                Esqueceu sua senha?
              </a>
              <a href="#" className="flex items-center gap-2 group justify-end">
                <span className="h-2 w-8 bg-[var(--accent-color-light)] group-hover:w-10 transition-all" />
                Cadastre-se agora
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
