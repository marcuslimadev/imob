import { Suspense } from 'react';
import { getCompanyContext } from '@/lib/hooks/useCompany';
import { directusServer } from '@/lib/directus/client';
import { readItems, aggregate } from '@directus/sdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Home, MessageSquare, TrendingUp } from 'lucide-react';

async function getDashboardMetrics(companyId: string) {
  try {
    // Buscar totais usando aggregate
    const [leadsTotal, propertiesTotal, conversasTotal] = await Promise.all([
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
    ]);

    // Buscar leads por stage
    const leadsByStage = await directusServer.request(
      readItems('leads', {
        filter: { company_id: { _eq: companyId } },
        groupBy: ['stage'],
        aggregate: { count: '*' }
      })
    );

    return {
      leadsTotal: leadsTotal[0]?.count || 0,
      propertiesTotal: propertiesTotal[0]?.count || 0,
      conversasTotal: conversasTotal[0]?.count || 0,
      leadsByStage: leadsByStage || []
    };
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return {
      leadsTotal: 0,
      propertiesTotal: 0,
      conversasTotal: 0,
      leadsByStage: []
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
            <Home className="h-4 w-4 text-muted-foreground" />
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
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---%</div>
            <p className="text-xs text-muted-foreground">
              Em desenvolvimento
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
              {metrics.leadsByStage.map((item: any) => (
                <div key={item.stage} className="flex items-center">
                  <div className="w-32 font-medium capitalize">{item.stage}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-primary/10 rounded flex items-center px-3">
                      <span className="text-sm font-semibold">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
              
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
              <div className="text-center text-muted-foreground py-8 text-sm">
                Visualização de atividades em desenvolvimento
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
