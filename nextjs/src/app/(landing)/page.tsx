'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrar com backend para salvar lead
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-white font-bold text-xl">SociMob</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-gray-300 hover:text-white transition">Recursos</a>
              <a href="#como-funciona" className="text-gray-300 hover:text-white transition">Como Funciona</a>
              <a href="#precos" className="text-gray-300 hover:text-white transition">Preços</a>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                Entrar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm mb-6">
                <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
                Atendimento 24/7 no WhatsApp
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Sua imobiliária com{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  atendente virtual
                </span>{' '}
                no WhatsApp
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Capture leads automaticamente, responda clientes 24h por dia e nunca mais perca uma oportunidade de negócio. 
                Inteligência artificial que entende o mercado imobiliário.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#demonstracao" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition transform hover:scale-105 text-center">
                  Ver Demonstração
                </a>
                <a href="#contato" className="border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg transition text-center">
                  Falar com Consultor
                </a>
              </div>
              <div className="flex items-center gap-8 mt-10">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-gray-400 text-sm">Imobiliárias</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">50k+</div>
                  <div className="text-gray-400 text-sm">Leads captados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-gray-400 text-sm">Atendimento</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-slate-800/50 backdrop-blur border border-white/10 rounded-3xl p-6">
                {/* Mockup WhatsApp */}
                <div className="bg-[#0b141a] rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-[#1f2c33] px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">T</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Teresa - Assistente Virtual</div>
                      <div className="text-green-400 text-xs">online</div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 min-h-[300px]">
                    <div className="bg-[#005c4b] text-white p-3 rounded-lg rounded-tr-none max-w-[80%] ml-auto">
                      <p>Olá! Estou procurando um apartamento de 3 quartos na Savassi</p>
                      <span className="text-[10px] text-gray-300 float-right mt-1">14:32 ✓✓</span>
                    </div>
                    <div className="bg-[#1f2c33] text-white p-3 rounded-lg rounded-tl-none max-w-[80%]">
                      <p>Olá! 👋 Que legal seu interesse! Tenho ótimas opções na Savassi.</p>
                      <p className="mt-2">Qual seria seu orçamento aproximado? 💰</p>
                      <span className="text-[10px] text-gray-400 float-right mt-1">14:32</span>
                    </div>
                    <div className="bg-[#005c4b] text-white p-3 rounded-lg rounded-tr-none max-w-[80%] ml-auto">
                      <p>Entre 800 mil e 1 milhão</p>
                      <span className="text-[10px] text-gray-300 float-right mt-1">14:33 ✓✓</span>
                    </div>
                    <div className="bg-[#1f2c33] text-white p-3 rounded-lg rounded-tl-none max-w-[80%]">
                      <p>Perfeito! Encontrei 3 opções incríveis pra você! 🏠✨</p>
                      <p className="mt-2">Posso te enviar os detalhes por aqui mesmo?</p>
                      <span className="text-[10px] text-gray-400 float-right mt-1">14:33</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Section */}
      <section id="recursos" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tudo que sua imobiliária precisa
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Uma plataforma completa para gestão de leads, atendimento automatizado e acompanhamento de negócios.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Atendente WhatsApp IA</h3>
              <p className="text-gray-400">
                Atendimento automático 24/7 com inteligência artificial que entende o mercado imobiliário e qualifica leads.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">CRM de Leads</h3>
              <p className="text-gray-400">
                Gestão completa de leads com funil de vendas, histórico de conversas e acompanhamento de cada oportunidade.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Transcrição de Áudio</h3>
              <p className="text-gray-400">
                Áudios do WhatsApp são transcritos automaticamente e processados pela IA para extrair informações do cliente.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-400 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Dashboard em Tempo Real</h3>
              <p className="text-gray-400">
                Acompanhe métricas de atendimento, conversões e performance da equipe em tempo real.
              </p>
            </div>
            {/* Feature 5 */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-400 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Matching Inteligente</h3>
              <p className="text-gray-400">
                IA que cruza preferências do cliente com seu catálogo de imóveis e sugere as melhores opções automaticamente.
              </p>
            </div>
            {/* Feature 6 */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multi-Tenant Seguro</h3>
              <p className="text-gray-400">
                Cada imobiliária tem seu ambiente isolado. Seus dados e configurações são 100% privados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Como funciona
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Em poucos passos sua imobiliária está pronta para atender 24 horas por dia.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Cadastre sua imobiliária</h3>
              <p className="text-gray-400">Crie sua conta em minutos e configure seu perfil.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Conecte seu WhatsApp</h3>
              <p className="text-gray-400">Integração simples com Twilio ou Evolution API.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">Importe seus imóveis</h3>
              <p className="text-gray-400">Via XML, planilha ou integração com portais.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">4</div>
              <h3 className="text-lg font-semibold text-white mb-2">Pronto!</h3>
              <p className="text-gray-400">A IA começa a atender e gerar leads automaticamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Comece grátis e escale conforme sua operação crescer.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Starter */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
              <p className="text-gray-400 mb-6">Para começar a automatizar</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">R$ 197</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  500 mensagens/mês
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  1 usuário
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  100 imóveis
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Atendente IA básico
                </li>
              </ul>
              <button className="w-full border border-blue-500 text-blue-400 hover:bg-blue-500/10 py-3 rounded-xl font-semibold transition">
                Começar Grátis
              </button>
            </div>
            {/* Plano Pro - Destaque */}
            <div className="bg-gradient-to-b from-blue-600/20 to-slate-800/50 backdrop-blur border-2 border-blue-500 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Mais Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Profissional</h3>
              <p className="text-gray-400 mb-6">Para imobiliárias em crescimento</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">R$ 497</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  2.000 mensagens/mês
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  5 usuários
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  500 imóveis
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Atendente IA avançado
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Transcrição de áudio
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Relatórios avançados
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-3 rounded-xl font-semibold transition">
                Começar Agora
              </button>
            </div>
            {/* Plano Enterprise */}
            <div className="bg-slate-800/50 backdrop-blur border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
              <p className="text-gray-400 mb-6">Para grandes operações</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Sob consulta</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mensagens ilimitadas
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Usuários ilimitados
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Imóveis ilimitados
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  API dedicada
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Suporte prioritário
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  SLA garantido
                </li>
              </ul>
              <button className="w-full border border-white/30 text-white hover:bg-white/10 py-3 rounded-xl font-semibold transition">
                Falar com Vendas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="contato" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para revolucionar seu atendimento?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Junte-se a centenas de imobiliárias que já estão usando IA para vender mais.
          </p>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                className="flex-1 px-6 py-4 rounded-xl bg-slate-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
              />
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold transition">
                Quero Testar
              </button>
            </form>
          ) : (
            <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-6 py-4 rounded-xl max-w-lg mx-auto">
              ✅ Obrigado! Em breve entraremos em contato.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-white font-bold text-xl">SociMob</span>
              </div>
              <p className="text-gray-400">
                Plataforma SaaS para imobiliárias com atendimento automático via WhatsApp.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#recursos" className="hover:text-white transition">Recursos</a></li>
                <li><a href="#precos" className="hover:text-white transition">Preços</a></li>
                <li><a href="#" className="hover:text-white transition">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Carreiras</a></li>
                <li><a href="#contato" className="hover:text-white transition">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-500">
            © 2025 SociMob. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
