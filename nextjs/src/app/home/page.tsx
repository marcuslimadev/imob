import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  FileText, 
  DollarSign, 
  PenTool, 
  Home,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  Database,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const progressPercentage = 70;

const modules = [
  {
    icon: Users,
    title: 'CRM & Vendas',
    status: 'Em Desenvolvimento',
    progress: 60,
    features: [
      'Central de Comunicação Multicanal (E-mail, SMS, WhatsApp)',
      'Gestão de Leads com Funil Customizável',
      'Lead Scoring Automático',
      'Histórico Completo de Interações',
      'Templates de Mensagens'
    ]
  },
  {
    icon: Home,
    title: 'Locação',
    status: 'Planejado',
    progress: 0,
    features: [
      'Gestão de Contratos de Aluguel',
      'Controle de Inquilinos e Proprietários',
      'Cálculo Automático de Repasses',
      'Índices de Reajuste (IGP-M, IPCA)',
      'Gestão de Inadimplência'
    ]
  },
  {
    icon: FileText,
    title: 'Vistoria Digital',
    status: 'Planejado',
    progress: 0,
    features: [
      'Checklists Customizáveis',
      'Captura de Fotos com Geolocalização',
      'Assinatura Digital nos Laudos',
      'Comparação Entrada vs Saída',
      'Geração Automática de PDFs'
    ]
  },
  {
    icon: DollarSign,
    title: 'Financeiro',
    status: 'Planejado',
    progress: 0,
    features: [
      'Fluxo de Caixa Completo',
      'Contas a Pagar e Receber',
      'Conciliação Bancária',
      'Emissão de NFS-e Automática',
      'Relatórios DRE e Balancetes'
    ]
  },
  {
    icon: PenTool,
    title: 'Assinaturas Digitais',
    status: 'Planejado',
    progress: 0,
    features: [
      'Upload e Gestão de Documentos',
      'Templates de Contratos',
      'Assinatura Eletrônica Certificada',
      'Rastreamento de Status',
      'Armazenamento Seguro'
    ]
  }
];

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-4" variant="outline">
            SaaS Multi-Tenant
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            IMOBI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Plataforma SaaS Completa para Gestão Imobiliária
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Sistema multi-tenant com CRM, Locação, Vistoria, Financeiro e Assinaturas Digitais
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard?company=exclusiva">
              <Button size="lg" className="gap-2">
                <Building2 className="size-5" />
                Acessar Dashboard
              </Button>
            </Link>
            <Link href="http://localhost:8055" target="_blank">
              <Button size="lg" variant="outline" className="gap-2">
                <Database className="size-5" />
                Acessar Directus
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Section */}
        <Card className="max-w-4xl mx-auto mb-16">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="size-6" />
              Progresso do Desenvolvimento
            </CardTitle>
            <CardDescription>
              Status atual do MVP - Atualizado em {new Date().toLocaleDateString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-2xl font-bold">{progressPercentage}% Completo</span>
                  <Badge variant={progressPercentage >= 70 ? "default" : "secondary"}>
                    {progressPercentage >= 70 ? "Em Progresso Avançado" : "Em Desenvolvimento"}
                  </Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-8">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="size-5" />
                    Concluído
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                    <li>• Infraestrutura Docker (100%)</li>
                    <li>• Directus 11.12.0 + PostgreSQL + Redis (100%)</li>
                    <li>• Next.js 15 com TypeScript (100%)</li>
                    <li>• 6 Collections Multi-tenant (100%)</li>
                    <li>• Dashboard com Métricas (80%)</li>
                    <li>• Integração Directus SDK (100%)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2 text-amber-600">
                    <Clock className="size-5" />
                    Em Desenvolvimento
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                    <li>• CRUD Completo de Imóveis</li>
                    <li>• Gestão de Leads (Kanban)</li>
                    <li>• Sistema de Autenticação Multi-tenant</li>
                    <li>• Upload Múltiplo de Fotos</li>
                    <li>• Central de Mensagens Multicanal</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">5 Módulos Principais</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema modular completo para atender todas as necessidades de uma imobiliária moderna
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="size-8 text-primary" />
                      <Badge variant={module.status === 'Em Desenvolvimento' ? 'default' : 'secondary'}>
                        {module.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <CardDescription>
                      {module.progress}% Implementado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-secondary rounded-full h-2 mb-4">
                      <div 
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {module.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="size-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tutorial Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Tutorial Completo de Uso</h2>
          <p className="text-center text-muted-foreground mb-8">
            Guia passo a passo para utilizar o sistema IMOBI
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1: Acesso ao Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5 text-primary" />
                  1. Acesso ao Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Directus (Backend)</h4>
                  <code className="bg-muted px-2 py-1 rounded text-xs block mb-1">
                    http://localhost:8055/admin
                  </code>
                  <p className="text-muted-foreground text-xs">
                    Email: marcus@admin.com | Senha: Teste@123
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dashboard (Frontend)</h4>
                  <code className="bg-muted px-2 py-1 rounded text-xs block mb-1">
                    http://localhost:3000/dashboard?company=exclusiva
                  </code>
                  <p className="text-muted-foreground text-xs">
                    Acesso ao painel administrativo da imobiliária
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Configuração Multi-tenant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="size-5 text-primary" />
                  2. Configuração Multi-tenant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Criar Nova Imobiliária</h4>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>1. Acesse Directus → Collection "companies"</li>
                    <li>2. Clique em "Create Item"</li>
                    <li>3. Preencha: nome, slug, CNPJ, contatos</li>
                    <li>4. Configure cores e logo personalizado</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Isolamento de Dados</h4>
                  <p className="text-muted-foreground text-xs">
                    Todos os dados são automaticamente filtrados por company_id, 
                    garantindo total isolamento entre imobiliárias.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Gestão de Imóveis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="size-5 text-primary" />
                  3. Gestão de Imóveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Cadastrar Imóvel</h4>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Acesse Collection "properties" no Directus</li>
                    <li>• Preencha informações (tipo, endereço, valores)</li>
                    <li>• Adicione características (quartos, vagas, área)</li>
                    <li>• Faça upload de fotos na collection "property_media"</li>
                    <li>• Marque imóvel como "featured" para destaque</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: CRM e Leads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  4. CRM e Gestão de Leads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Gerenciar Leads</h4>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Collection "leads" - cadastro de clientes potenciais</li>
                    <li>• Defina estágio do lead no funil de vendas</li>
                    <li>• Atribua lead para corretor responsável</li>
                    <li>• Registre atividades em "lead_activities"</li>
                    <li>• Acompanhe histórico completo de interações</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Card 5: Dashboard e Métricas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  5. Dashboard e Métricas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Visualizar Estatísticas</h4>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Total de leads cadastrados</li>
                    <li>• Quantidade de imóveis disponíveis</li>
                    <li>• Conversas ativas no WhatsApp</li>
                    <li>• Distribuição de leads por estágio</li>
                    <li>• Atividades recentes do sistema</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Card 6: Comunicação Multicanal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-primary" />
                  6. Comunicação Multicanal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Central de Mensagens (Em Desenvolvimento)</h4>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• E-mail com rastreamento de abertura</li>
                    <li>• SMS para lembretes e notificações</li>
                    <li>• WhatsApp Business API integrado</li>
                    <li>• Templates de mensagens personalizados</li>
                    <li>• Histórico completo de comunicações</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tech Stack Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5" />
              Stack Tecnológica
            </CardTitle>
            <CardDescription>
              Tecnologias modernas para performance e escalabilidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Backend</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Directus 11.12.0</li>
                  <li>• PostgreSQL 16 + PostGIS</li>
                  <li>• Redis (Cache)</li>
                  <li>• Node.js 18+</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Frontend</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Next.js 15 (App Router)</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Shadcn UI</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Integrações</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• WhatsApp Business API</li>
                  <li>• SendGrid / Amazon SES</li>
                  <li>• Twilio (SMS)</li>
                  <li>• ClickSign (Assinaturas)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p className="text-sm">
            Desenvolvido com ❤️ para revolucionar o mercado imobiliário brasileiro
          </p>
          <p className="text-xs mt-2">
            Versão v0.7.0 - MVP 70% Completo - Atualizado em {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
