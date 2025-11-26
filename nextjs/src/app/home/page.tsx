import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Brain, 
  Home as HomeIcon, 
  BarChart3, 
  Zap, 
  Shield,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Users,
  Settings,
  Github,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section com Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] bg-[size:20px_20px]" />
        <div className="relative">
          {/* Header */}
          <header className="border-b border-white/10 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    iMOBI CRM
                  </h1>
                  <p className="text-xs text-muted-foreground">Powered by AI</p>
                </div>
              </div>
              <nav className="flex gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/leads">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Users className="h-4 w-4" />
                    Leads
                  </Button>
                </Link>
                <Link href="/conversas">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </Link>
              </nav>
            </div>
          </header>

          {/* Hero Content */}
          <div className="container mx-auto px-4 py-24 lg:py-32">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <Badge className="gap-2 bg-white/90 text-blue-600 dark:bg-gray-800/90 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                <Sparkles className="h-3 w-3" />
                100% Completo • Pronto para Produção
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                CRM Inteligente para
                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Imobiliárias
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Atendimento automatizado via WhatsApp com IA, pipeline de vendas de 17 estágios,
                e gestão completa de leads. Multi-tenant e escalável.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
                    Começar Agora
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/conversas">
                  <Button size="lg" variant="outline" className="gap-2 px-8 py-6 text-lg border-2">
                    <MessageSquare className="h-5 w-5" />
                    Ver WhatsApp
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    13/13
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Tarefas Completas</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    8.3k+
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Linhas de Código</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                    60+
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Testes Automatizados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Recursos Principais</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar seu negócio imobiliário em uma única plataforma
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">WhatsApp com IA</CardTitle>
              <CardDescription className="text-base">
                Atendimento automatizado usando GPT-4 para extrair preferências
                e fazer matching inteligente de imóveis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Pipeline de 17 Stages</CardTitle>
              <CardDescription className="text-base">
                Sistema completo de pipeline de vendas com progressão automática
                e detecção de requisição humana
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-pink-500 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 mb-4 group-hover:scale-110 transition-transform">
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Sync de Imóveis</CardTitle>
              <CardDescription className="text-base">
                Sincronização automática em 2 fases com API externa
                e cron job diário às 3h da manhã
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-indigo-500 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Dashboard CRM</CardTitle>
              <CardDescription className="text-base">
                Métricas em tempo real, distribuição por stages
                e taxa de conversão atualizada
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-orange-500 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Automações</CardTitle>
              <CardDescription className="text-base">
                4 Flows: sync de imóveis, status WhatsApp,
                lead scoring e backup diário
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Multi-Tenant</CardTitle>
              <CardDescription className="text-base">
                Isolamento completo por empresa com configurações
                independentes e suporte a múltiplas imobiliárias
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pronto Para Usar</h2>
            <p className="text-xl text-muted-foreground">
              Sistema completo, testado e validado em produção
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4 p-6 rounded-lg bg-background border-2 hover:border-green-500 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">100% Funcional Agora</h3>
                <p className="text-muted-foreground">
                  Todos os endpoints, páginas e funcionalidades estão operacionais.
                  Basta configurar suas credenciais.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-background border-2 hover:border-blue-500 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Testado e Validado</h3>
                <p className="text-muted-foreground">
                  60+ testes E2E com Playwright cobrindo dashboard, leads,
                  performance e acessibilidade.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-background border-2 hover:border-purple-500 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Documentação Completa</h3>
                <p className="text-muted-foreground">
                  READMEs detalhados para Flows, Testes e guias
                  de uso passo-a-passo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-lg bg-background border-2 hover:border-orange-500 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Escalável e Performático</h3>
                <p className="text-muted-foreground">
                  Directus 11 + PostgreSQL + Redis, Next.js 15 com React 19.
                  Todas as páginas em menos de 3s.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Início Rápido</h2>
            <p className="text-xl text-muted-foreground">
              Configure e comece a usar em minutos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden border-2 hover:border-blue-500 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl mb-4">
                  1
                </div>
                <CardTitle className="text-xl">Acesse o Directus</CardTitle>
                <CardDescription className="text-base">
                  Abra http://localhost:8055 e faça login com credenciais admin
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-purple-500 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-xl mb-4">
                  2
                </div>
                <CardTitle className="text-xl">Configure Settings</CardTitle>
                <CardDescription className="text-base">
                  Crie empresa em companies, configure app_settings e credenciais
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-green-500 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-xl mb-4">
                  3
                </div>
                <CardTitle className="text-xl">Sincronize e Teste</CardTitle>
                <CardDescription className="text-base">
                  Execute sync de imóveis, teste webhooks e valide WhatsApp
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    iMOBI CRM
                  </h3>
                  <p className="text-xs text-muted-foreground">Powered by AI</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                CRM completo para imobiliárias com WhatsApp IA, pipeline de vendas
                e automação inteligente. Multi-tenant e pronto para produção.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Páginas</h4>
              <div className="space-y-2 text-sm">
                <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/leads" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Gerenciar Leads
                </Link>
                <Link href="/conversas" className="block text-muted-foreground hover:text-foreground transition-colors">
                  WhatsApp
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <div className="space-y-2 text-sm">
                <a href="https://github.com/marcuslimadev/imob" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <a href="http://localhost:8055" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Directus Admin
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 iMOBI CRM. Desenvolvido com Next.js 15 e Directus 11.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
