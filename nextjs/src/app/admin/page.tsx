import { directusServer } from '@/lib/directus/client';
import { readItems, aggregate } from '@directus/sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStats {
  totalCompanies: number;
  activeSubscriptions: number;
  totalProperties: number;
  totalLeads: number;
  monthlyRevenue: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Count companies
    const companiesCount = await directusServer.request(
      aggregate('companies', {
        aggregate: { count: '*' }
      })
    );

    // Count active subscriptions
    const activeSubscriptions = await directusServer.request(
      aggregate('companies', {
        aggregate: { count: '*' },
        query: {
          filter: {
            subscription_status: { _eq: 'active' }
          }
        }
      })
    );

    // Count properties
    const propertiesCount = await directusServer.request(
      aggregate('properties', {
        aggregate: { count: '*' }
      })
    );

    // Count leads
    const leadsCount = await directusServer.request(
      aggregate('leads', {
        aggregate: { count: '*' }
      })
    );

    // Calculate monthly revenue (R$ 759 per active subscription)
    const activeCount = activeSubscriptions[0]?.count || 0;
    const monthlyRevenue = Number(activeCount) * 759;

    return {
      totalCompanies: Number(companiesCount[0]?.count || 0),
      activeSubscriptions: Number(activeCount),
      totalProperties: Number(propertiesCount[0]?.count || 0),
      totalLeads: Number(leadsCount[0]?.count || 0),
      monthlyRevenue
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalCompanies: 0,
      activeSubscriptions: 0,
      totalProperties: 0,
      totalLeads: 0,
      monthlyRevenue: 0
    };
  }
}

async function getRecentCompanies() {
  try {
    return await directusServer.request(
      readItems('companies', {
        limit: 5,
        sort: ['-created_at'],
        fields: ['id', 'name', 'email', 'subscription_status', 'created_at']
      })
    );
  } catch (error) {
    console.error('Error fetching recent companies:', error);
    return [];
  }
}

export default async function SuperAdminPage() {
  const stats = await getDashboardStats();
  const recentCompanies = await getRecentCompanies();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Painel SuperAdmin</h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma IMOBI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Empresas
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
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal
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
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              R$ 759/empresa/mês
            </p>
          </CardContent>
        </Card>

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
              Cadastrados na plataforma
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
              Captados por todas empresas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Companies */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma empresa cadastrada ainda
              </p>
            ) : (
              recentCompanies.map((company: any) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {company.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        company.subscription_status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : company.subscription_status === 'trial'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {company.subscription_status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(company.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
