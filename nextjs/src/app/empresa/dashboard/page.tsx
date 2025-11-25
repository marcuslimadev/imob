import { directusServer } from '@/lib/directus/client';
import { readItems, aggregate } from '@directus/sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalLeads: number;
  newLeadsThisWeek: number;
  totalViews: number;
}

async function getDashboardStats(companyId: string): Promise<DashboardStats> {
  try {
    // @ts-ignore - Custom schema
    const propertiesCount = await directusServer.request(
      aggregate('properties', {
        aggregate: { count: '*' },
        query: {
          filter: { company_id: { _eq: companyId } }
        }
      })
    );

    // @ts-ignore - Custom schema
    const activeCount = await directusServer.request(
      aggregate('properties', {
        aggregate: { count: '*' },
        query: {
          filter: {
            company_id: { _eq: companyId },
            status: { _eq: 'active' }
          }
        }
      })
    );

    // @ts-ignore - Custom schema
    const leadsCount = await directusServer.request(
      aggregate('leads', {
        aggregate: { count: '*' },
        query: {
          filter: { company_id: { _eq: companyId } }
        }
      })
    );

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // @ts-ignore - Custom schema
    const newLeadsCount = await directusServer.request(
      aggregate('leads', {
        aggregate: { count: '*' },
        query: {
          filter: {
            company_id: { _eq: companyId },
            created_at: { _gte: oneWeekAgo.toISOString() }
          }
        }
      })
    );

    return {
      totalProperties: Number(propertiesCount[0]?.count || 0),
      activeProperties: Number(activeCount[0]?.count || 0),
      totalLeads: Number(leadsCount[0]?.count || 0),
      newLeadsThisWeek: Number(newLeadsCount[0]?.count || 0),
      totalViews: 0 // TODO: Implement view tracking
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalProperties: 0,
      activeProperties: 0,
      totalLeads: 0,
      newLeadsThisWeek: 0,
      totalViews: 0
    };
  }
}

async function getRecentLeads(companyId: string) {
  try {
    // @ts-ignore - Custom schema
    return await directusServer.request(
      readItems('leads', {
        filter: { company_id: { _eq: companyId } },
        limit: 5,
        fields: ['*']
      })
    );
  } catch (error) {
    console.error('Error fetching recent leads:', error);
    return [];
  }
}

export default async function EmpresaDashboardPage() {
  // TODO: Get company_id from authenticated user session
  const companyId = '1'; // This should come from auth context
  
  const stats = await getDashboardStats(companyId);
  const recentLeads = await getRecentLeads(companyId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-600">
                Visão geral do seu negócio imobiliário
              </p>
            </div>
            <Link
              href="/empresa/imoveis/novo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition-colors"
            >
              + Novo Imóvel
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Imóveis
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProperties} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Leads
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newLeadsThisWeek} esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Visualizações
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Nos últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Conversão
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalViews > 0 
                  ? ((stats.totalLeads / stats.totalViews) * 100).toFixed(1)
                  : '0.0'}%
              </div>
              <p className="text-xs text-muted-foreground">
                Visitantes que viraram leads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Link
            href="/empresa/imoveis"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Gerenciar Imóveis</h3>
                <p className="text-sm text-gray-600">Ver todos os anúncios</p>
              </div>
            </div>
          </Link>

          <Link
            href="/empresa/leads"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Gerenciar Leads</h3>
                <p className="text-sm text-gray-600">Acompanhar interessados</p>
              </div>
            </div>
          </Link>

          <Link
            href="/empresa/configuracoes"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Configurações</h3>
                <p className="text-sm text-gray-600">Personalizar empresa</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Leads Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum lead ainda
                </p>
              ) : (
                recentLeads.map((lead: any) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.email} • {lead.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          lead.stage === 'won'
                            ? 'bg-green-50 text-green-700'
                            : lead.stage === 'new'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {lead.stage}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {lead.interest_type === 'buy' ? 'Compra' : 'Aluguel'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
