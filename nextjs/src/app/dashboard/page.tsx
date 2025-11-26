import { Suspense } from 'react';
import { getCompanyContext } from '@/lib/hooks/useCompany';
import { directusServer } from '@/lib/directus/client';
import { readItems, aggregate } from '@directus/sdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Home, MessageSquare, TrendingUp } from 'lucide-react';

async function getDashboardMetrics(companyId: string) {
  try {
    // Buscar totais usando aggregate
    const [leadsTotal, propertiesTotal, conversasTotal, mensagensTotal] = await Promise.all([
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
        aggregate('mensagens', {
          aggregate: { count: '*' },
          query: {
            filter: { 
              conversa_id: { 
                conversas: { company_id: { _eq: companyId } }
              }
            }
          }
        })
      ),
    ]);

    // Buscar conversas com informações de stage
    const conversas = await directusServer.request(
      readItems('conversas', {
        filter: { company_id: { _eq: companyId } },
        fields: ['id', 'stage', 'created_at', 'updated_at', 'lead_id.nome'],
        limit: 100
      })
    );

    // Agrupar leads por stage manualmente
    const stageGroups: Record<string, number> = {};
    conversas.forEach((conv: any) => {
      const stage = conv.stage || 'sem_stage';
      stageGroups[stage] = (stageGroups[stage] || 0) + 1;
    });

    const leadsByStage = Object.entries(stageGroups).map(([stage, count]) => ({
      stage,
      count
    }));

    // Buscar atividades recentes (últimas 10 conversas atualizadas)
    const recentActivity = conversas
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10)
      .map((conv: any) => ({
        id: conv.id,
        leadName: conv.lead_id?.nome || 'Lead sem nome',
        stage: conv.stage,
        updatedAt: conv.updated_at
      }));

    return {
      leadsTotal: leadsTotal[0]?.count || 0,
      propertiesTotal: propertiesTotal[0]?.count || 0,
      conversasTotal: conversasTotal[0]?.count || 0,
      mensagensTotal: mensagensTotal[0]?.count || 0,
      leadsByStage: leadsByStage || [],
      recentActivity: recentActivity || []
    };
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    
    return {
      leadsTotal: 0,
      propertiesTotal: 0,
      conversasTotal: 0,
      mensagensTotal: 0,
      leadsByStage: [],
      recentActivity: []
    };
  }
}

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

  // Mapeamento de cores e labels dos stages
  const stageConfig: Record<string, { label: string; color: string; emoji: string }> = {
    boas_vindas: { label: 'Boas-vindas', color: '#3B82F6', emoji: '👋' },
    coleta_dados: { label: 'Coleta de Dados', color: '#8B5CF6', emoji: '📝' },
    aguardando_info: { label: 'Aguardando Info', color: '#F59E0B', emoji: '⏳' },
    matching: { label: 'Matching', color: '#10B981', emoji: '🔍' },
    apresentacao: { label: 'Apresentação', color: '#06B6D4', emoji: '🏠' },
    interesse: { label: 'Interesse', color: '#14B8A6', emoji: '✨' },
    refinamento: { label: 'Refinamento', color: '#A855F7', emoji: '🔧' },
    sem_match: { label: 'Sem Match', color: '#EF4444', emoji: '❌' },
    agendamento: { label: 'Agendamento', color: '#F97316', emoji: '📅' },
    visita_agendada: { label: 'Visita Agendada', color: '#84CC16', emoji: '✅' },
    pos_visita: { label: 'Pós-visita', color: '#22C55E', emoji: '🔍' },
    negociacao: { label: 'Negociação', color: '#F59E0B', emoji: '💰' },
    proposta: { label: 'Proposta', color: '#3B82F6', emoji: '📄' },
    analise_credito: { label: 'Análise Crédito', color: '#6366F1', emoji: '💳' },
    documentacao: { label: 'Documentação', color: '#8B5CF6', emoji: '📋' },
    finalizacao: { label: 'Finalização', color: '#10B981', emoji: '🎉' },
    atendimento_humano: { label: 'Atend. Humano', color: '#EC4899', emoji: '👤' },
  };

  // Calcular conversão (leads em stages avançados / total)
  const advancedStages = ['negociacao', 'proposta', 'analise_credito', 'documentacao', 'finalizacao'];
  const leadsInAdvancedStages = metrics.leadsByStage
    .filter(s => advancedStages.includes(s.stage))
    .reduce((sum, s) => sum + s.count, 0);
  const conversionRate = metrics.leadsTotal > 0 
    ? ((leadsInAdvancedStages / metrics.leadsTotal) * 100).toFixed(1)
    : '0.0';

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
              {metrics.mensagensTotal} mensagens trocadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Leads em negociação/proposta
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
            <div className="space-y-3">
              {metrics.leadsByStage
                .sort((a, b) => b.count - a.count)
                .map((item: any) => {
                const config = stageConfig[item.stage] || { 
                  label: item.stage, 
                  color: '#6B7280', 
                  emoji: '📌' 
                };
                const percentage = metrics.leadsTotal > 0 
                  ? (item.count / metrics.leadsTotal) * 100 
                  : 0;

                return (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{config.emoji}</span>
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: config.color
                        }}
                      />
                    </div>
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
            <div className="space-y-4">
              {metrics.recentActivity.map((activity: any) => {
                const config = stageConfig[activity.stage] || { 
                  label: activity.stage, 
                  color: '#6B7280', 
                  emoji: '📌' 
                };
                const timeAgo = new Date(activity.updatedAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={activity.id} className="flex gap-3 items-start">
                    <span className="text-2xl">{config.emoji}</span>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.leadName}</p>
                      <p className="text-xs text-muted-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo}</p>
                    </div>
                  </div>
                );
              })}
              
              {metrics.recentActivity.length === 0 && (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Nenhuma atividade recente
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
