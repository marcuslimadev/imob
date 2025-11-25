import { aggregate, readItems } from '@directus/sdk';
import { CalendarClock, Home, MapPin, MessageSquare, TrendingUp, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { directusServer } from '@/lib/directus/client';
import { getCompanyContext } from '@/lib/hooks/useCompany';

type StageItem = {
  stage: string | null;
  count: number;
};

type LeadItem = {
  id: string;
  name?: string | null;
  stage?: string | null;
  lead_source?: string | null;
  budget_max?: number | null;
  date_created?: string | null;
};

type PropertyViewItem = {
  property_id: {
    id: string;
    title?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    price_sale?: number | null;
    price_rent?: number | null;
  };
  count: number;
};

type ActivityItem = {
  id: string;
  activity_type?: string | null;
  subject?: string | null;
  date_created?: string | null;
  lead_id?: {
    name?: string | null;
  } | null;
};

type DashboardData = {
  metrics: {
    leadsTotal: number;
    propertiesTotal: number;
    propertyViews: number;
  };
  leadsByStage: StageItem[];
  recentLeads: LeadItem[];
  topViewedProperties: PropertyViewItem[];
  recentActivities: ActivityItem[];
};

function formatCurrency(value?: number | null) {
  if (!value) return '—';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

async function getDashboardData(companyId: string): Promise<DashboardData> {
  const now = new Date();
  const lastMonth = new Date(now);
  lastMonth.setDate(now.getDate() - 30);

  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);

  const [
    leadsTotal,
    propertiesTotal,
    propertyViewsTotal,
    leadsByStage,
    recentLeads,
    topViewedProperties,
    recentActivities,
  ] = await Promise.all([
    directusServer.request(
      aggregate('leads', {
        aggregate: { count: '*' },
        query: {
          filter: { company_id: { _eq: companyId } },
        },
      }) as Promise<{ count: number }[]>,
    ),
    directusServer.request(
      aggregate('properties', {
        aggregate: { count: '*' },
        query: {
          filter: { company_id: { _eq: companyId } },
        },
      }) as Promise<{ count: number }[]>,
    ),
    directusServer.request(
      aggregate('property_views', {
        aggregate: { count: '*' },
        query: {
          filter: {
            property_id: { company_id: { _eq: companyId } },
            date_created: { _gte: lastMonth.toISOString() },
          },
        },
      }) as Promise<{ count: number }[]>,
    ),
    directusServer.request(
      readItems('leads', {
        filter: { company_id: { _eq: companyId } },
        groupBy: ['stage'],
        aggregate: { count: '*' },
      }),
    ) as Promise<StageItem[]>,
    directusServer.request(
      readItems('leads', {
        filter: { company_id: { _eq: companyId } },
        sort: ['-date_created'],
        limit: 6,
        fields: ['id', 'name', 'stage', 'lead_source', 'budget_max', 'date_created'],
      }),
    ) as Promise<LeadItem[]>,
    directusServer.request(
      readItems('property_views', {
        fields: [
          'property_id',
          {
            property_id: ['id', 'title', 'neighborhood', 'city', 'price_sale', 'price_rent'],
          },
        ],
        filter: {
          property_id: { company_id: { _eq: companyId } },
          date_created: { _gte: lastWeek.toISOString() },
        },
        groupBy: ['property_id'],
        aggregate: { count: '*' },
        sort: ['-count'],
        limit: 5,
      }),
    ) as Promise<PropertyViewItem[]>,
    directusServer.request(
      readItems('lead_activities', {
        fields: ['id', 'activity_type', 'subject', 'date_created', { lead_id: ['name', 'company_id'] }],
        filter: { lead_id: { company_id: { _eq: companyId } } },
        sort: ['-date_created'],
        limit: 6,
      }),
    ) as Promise<ActivityItem[]>,
  ]);

  return {
    metrics: {
      leadsTotal: leadsTotal?.[0]?.count || 0,
      propertiesTotal: propertiesTotal?.[0]?.count || 0,
      propertyViews: propertyViewsTotal?.[0]?.count || 0,
    },
    leadsByStage: leadsByStage || [],
    recentLeads: recentLeads || [],
    topViewedProperties: topViewedProperties || [],
    recentActivities: recentActivities || [],
  };
}

export default async function DashboardPage() {
  const { companyId } = await getCompanyContext();

  if (!companyId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Empresa não encontrada</h1>
          <p className="text-muted-foreground mt-2">Acesse via subdomínio: suaempresa.imobi.com.br</p>
          <p className="text-sm text-muted-foreground mt-1">(Em localhost: ?company=exclusiva)</p>
        </div>
      </div>
    );
  }

  const dashboardData = await getDashboardData(companyId);
  const totalLeadsOnStages = dashboardData.leadsByStage.reduce((total, item) => total + (item.count || 0), 0);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Visão geral do desempenho</p>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Badge variant="secondary" className="gap-2">
          <CalendarClock className="size-4" />
          Últimos 30 dias
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Ativos</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.metrics.leadsTotal}</div>
            <p className="text-xs text-muted-foreground">Contatos vinculados à sua empresa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imóveis Cadastrados</CardTitle>
            <Home className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.metrics.propertiesTotal}</div>
            <p className="text-xs text-muted-foreground">Disponíveis na vitrine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.metrics.propertyViews}</div>
            <p className="text-xs text-muted-foreground">Total no último mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Em análise</div>
            <p className="text-xs text-muted-foreground">Integração com propostas em breve</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
            <CardDescription>Distribuição dos leads por estágio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.leadsByStage.map((item) => {
              const percentage = totalLeadsOnStages
                ? Math.round((item.count / totalLeadsOnStages) * 100)
                : 0;

              return (
                <div key={item.stage ?? 'sem-estagio'} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{item.stage || 'Sem estágio'}</span>
                    <span className="text-muted-foreground">
                      {item.count} {item.count === 1 ? 'lead' : 'leads'} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {dashboardData.leadsByStage.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">Nenhum lead cadastrado ainda</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Imóveis mais vistos</CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.topViewedProperties.map((item) => (
              <div key={item.property_id.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold leading-none">{item.property_id.title}</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3" />
                      {item.property_id.neighborhood}
                      {item.property_id.city && ` • ${item.property_id.city}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.property_id.price_sale
                        ? `Venda: ${formatCurrency(item.property_id.price_sale)}`
                        : `Aluguel: ${formatCurrency(item.property_id.price_rent)}`}
                    </p>
                  </div>
                  <Badge variant="outline">{item.count} views</Badge>
                </div>
              </div>
            ))}

            {dashboardData.topViewedProperties.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">Sem visualizações registradas</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Leads recentes</CardTitle>
            <CardDescription>Novas oportunidades cadastradas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-semibold leading-none">{lead.name || 'Lead sem nome'}</p>
                  <p className="text-sm text-muted-foreground">Fonte: {lead.lead_source || 'Não informada'}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(lead.date_created)}</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="secondary" className="capitalize">
                    {lead.stage || 'Sem estágio'}
                  </Badge>
                  <p className="text-sm font-semibold">{formatCurrency(lead.budget_max)}</p>
                </div>
              </div>
            ))}

            {dashboardData.recentLeads.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">Nenhum lead recente</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Atividades recentes</CardTitle>
            <CardDescription>Últimas interações registradas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recentActivities.map((activity) => (
              <div key={activity.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold leading-none capitalize">
                      {activity.activity_type || 'atividade'}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.subject || 'Sem descrição'}</p>
                    <p className="text-sm text-muted-foreground">Lead: {activity.lead_id?.name || 'Sem nome'}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(activity.date_created)}</span>
                </div>
              </div>
            ))}

            {dashboardData.recentActivities.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">Nenhuma atividade registrada</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
