import { getCompanyContext } from '@/lib/hooks/useCompany';
import { directusServer } from '@/lib/directus/client';
import { readItems, aggregate } from '@directus/sdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Home, MessageSquare, Sparkles, TrendingUp, Users } from 'lucide-react';

async function getDashboardMetrics(companyId: string) {
  try {
    // Buscar totais usando aggregate
    const [leadsTotal, propertiesTotal, conversasTotal, leadsByStage] = await Promise.all([
      directusServer.request(
        aggregate('leads', {
          aggregate: { count: '*' },
          query: {
            filter: { company_id: { _eq: companyId } }
          }
        })
      ),
      directusServer.request(
        aggregate('properties', {
          aggregate: { count: '*' },
          query: {
            filter: { company_id: { _eq: companyId } }
          }
        })
      ),
      directusServer.request(
        aggregate('conversas', {
          aggregate: { count: '*' },
          query: {
            filter: { company_id: { _eq: companyId }, archived: { _neq: true } }
          }
        })
      ),
      directusServer.request(
        readItems('leads', {
          filter: { company_id: { _eq: companyId } },
          groupBy: ['stage'],
          aggregate: { count: '*' }
        })
      )
    ]);

    const totalLeads = Number(leadsTotal[0]?.count || 0);
    const leadsByStageNormalized = (leadsByStage || []).map((item: any) => ({
      stage: item.stage,
      count: Number(item.count || 0)
    }));

    const totalLeadsFromStages = leadsByStageNormalized.reduce((sum: number, item: any) => sum + item.count, 0);
    const closedLeads = leadsByStageNormalized.find((item: any) => item.stage === 'fechado')?.count || 0;
    const conversionRate = (totalLeadsFromStages || totalLeads) > 0
      ? Math.round((closedLeads / (totalLeadsFromStages || totalLeads)) * 100)
      : 0;

    return {
      leadsTotal: totalLeads,
      propertiesTotal: Number(propertiesTotal[0]?.count || 0),
      conversasTotal: Number(conversasTotal[0]?.count || 0),
      leadsByStage: leadsByStageNormalized,
      conversionRate
    };
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);

    return {
      leadsTotal: 0,
      propertiesTotal: 0,
      conversasTotal: 0,
      leadsByStage: [],
      conversionRate: 0
    };
  }
}

async function getRecentActivities(companyId: string) {
  try {
    return await directusServer.request(
      readItems('atividades', {
        fields: ['id', 'tipo', 'descricao', 'date_created', 'lead_id', 'property_id'],
        filter: { company_id: { _eq: companyId } },
        sort: ['-date_created'],
        limit: 5
      })
    );
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);

    return [];
  }
}

const activityLabels: Record<string, string> = {
  lead_created: 'Novo lead',
  message_sent: 'Mensagem enviada',
  property_sent: 'Imóvel enviado',
  stage_changed: 'Atualização de estágio',
  ai_diagnostic: 'Diagnóstico de IA'
};

const activityIcons: Record<string, typeof Activity> = {
  lead_created: Users,
  message_sent: MessageSquare,
  property_sent: Home,
  stage_changed: TrendingUp,
  ai_diagnostic: Sparkles
};

export default async function DashboardPage() {
  const { companyId } = await getCompanyContext();

  if (!companyId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Empresa não encontrada</h1>
          <p className="text-muted-foreground mt-2">
            Acesse via subdomínio: suaempresa.imobi.com.br
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            (Em localhost: ?company=exclusiva)
          </p>
        </div>
      </div>
    );
  }

  const metrics = await getDashboardMetrics(companyId);
  const activities = await getRecentActivities(companyId);
  const totalLeadsByStage = metrics.leadsByStage.reduce((sum: number, item: any) => sum + item.count, 0);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.leadsTotal}</div>
            <p className="text-xs text-muted-foreground">
              Leads cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imóveis</CardTitle>
            <Home className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.propertiesTotal}</div>
            <p className="text-xs text-muted-foreground">
              Imóveis disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversasTotal}</div>
            <p className="text-xs text-muted-foreground">
              Conversas no WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Leads fechados em relação ao total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
            <CardDescription>
              Distribuição de leads por estágio
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              {metrics.leadsByStage.map((item: any) => {
                const percentage = totalLeadsByStage > 0
                  ? Math.round((item.count / totalLeadsByStage) * 100)
                  : 0;

                return (
                  <div key={item.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium capitalize">{item.stage}</div>
                      <div className="text-sm text-muted-foreground">{percentage}%</div>
                    </div>
                    <div className="h-3 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${percentage}%` }}
                        aria-label={`${item.stage} - ${percentage}%`}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">{item.count} lead(s)</div>
                  </div>
                );
              })}

              {metrics.leadsByStage.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum lead cadastrado ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              {activities.map((activity: any) => {
                const Icon = activityIcons[activity.tipo] || Activity;
                const label = activityLabels[activity.tipo] || 'Atividade';

                return (
                  <div key={activity.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold">{label}</div>
                      {activity.descricao && (
                        <p className="text-muted-foreground leading-relaxed">{activity.descricao}</p>
                      )}
                      <div className="text-xs text-muted-foreground space-x-2">
                        {activity.lead_id && <span>Lead: {activity.lead_id}</span>}
                        {activity.property_id && <span>Imóvel: {activity.property_id}</span>}
                        <span>
                          {new Date(activity.date_created).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {activities.length === 0 && (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Nenhuma atividade registrada ainda
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
