import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Brain,
  Home as HomeIcon,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  LayoutTemplate,
  PhoneCall,
} from 'lucide-react';

const featureBlocks = [
  {
    title: 'WhatsApp + IA',
    description: 'Atendimento automatizado, extração de preferências e matching imediato.',
    icon: MessageSquare,
    tone: 'bg-[var(--accent-color)] text-[var(--background-color)]',
  },
  {
    title: 'Pipeline estrutural',
    description: '17 estágios com progressão visual e foco absoluto na conversão.',
    icon: BarChart3,
    tone: 'bg-[var(--accent-color-soft)] text-[var(--foreground-color)]',
  },
  {
    title: 'Sync de imóveis',
    description: 'Integração em 2 fases, cron diário e catálogo sempre atualizado.',
    icon: HomeIcon,
    tone: 'bg-[var(--accent-color-light)] text-[var(--foreground-color)]',
  },
];

const modules = [
  {
    title: 'Automação inteligente',
    description: 'Fluxos de sync, status e curadoria funcionando como uma máquina.',
    icon: Zap,
  },
  {
    title: 'Segurança pronta',
    description: 'Criptografia, autenticação multi-tenant e bordas bem definidas.',
    icon: Shield,
  },
  {
    title: 'Operação focada',
    description: 'Interface geométrica, tempo real e métricas fáceis de ler.',
    icon: Brain,
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Header simples */}
      <header className="border-b-4 border-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-black text-white font-bold flex items-center justify-center">
              iM
            </div>
            <span className="text-xl font-bold">IMOBI</span>
          </div>

          <nav className="flex items-center gap-3">
            <Button variant="outline" className="border-2 border-black rounded-none font-bold" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button className="bg-[#E63946] hover:bg-[#d62839] text-white border-2 border-black rounded-none font-bold" asChild>
              <Link href="/empresa/dashboard">Dashboard</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 space-y-16">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-2 gap-12 items-center py-8">
          <div className="space-y-6">
            <div className="inline-block bg-black text-white px-4 py-1 text-sm font-bold">
              CRM INTELIGENTE
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Gestão completa para imobiliárias
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              WhatsApp automatizado com IA, pipeline de vendas estruturado e sincronização automática de imóveis.
            </p>
            <div className="flex gap-4">
              <Button className="bg-[#E63946] hover:bg-[#d62839] text-white h-12 px-8 rounded-none border-2 border-black font-bold" asChild>
                <Link href="/login">
                  Começar Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            {featureBlocks.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 border-2 border-black p-5 bg-white"
                >
                  <div className="h-12 w-12 bg-[#457B9D] flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">{feature.title}</p>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Modules Section */}
        <section className="py-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Recursos principais</h2>
            <p className="text-lg text-gray-600">Tudo que você precisa em um só lugar</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.title} className="border-2 border-black p-6 bg-white">
                  <div className="h-12 w-12 bg-[#F1FAEE] border-2 border-black flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-black" />
                  </div>
                  <p className="font-bold text-lg mb-2">{module.title}</p>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-4 border-black bg-[#E63946] text-white p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <h3 className="text-3xl font-bold">Pronto para começar?</h3>
              <p className="text-lg opacity-90">
                Configure sua imobiliária em minutos e comece a vender mais com automação inteligente.
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-white text-black hover:bg-gray-100 h-12 px-8 rounded-none border-2 border-black font-bold" asChild>
                <Link href="/login">
                  Começar Grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer simples */}
      <footer className="border-t-4 border-black py-8 mt-16">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-600">
          <p>© 2025 iMOBI - CRM para Imobiliárias</p>
        </div>
      </footer>
    </div>
  );
}
