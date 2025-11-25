import { Badge } from '@/components/ui/badge';
import DashboardStats from '@/components/admin/dashboard/DashboardStats';
import FeaturedProperties from '@/components/admin/dashboard/FeaturedProperties';
import LeadsByStage from '@/components/admin/dashboard/LeadsByStage';
import RecentActivities from '@/components/admin/dashboard/RecentActivities';
import { getCompanyContext } from '@/lib/hooks/useCompany';
import {
  fetchDashboardStats,
  fetchLeadsByStage,
  fetchProperties,
  fetchRecentActivities
} from '@/lib/directus/realEstate';

export default async function AdminDashboardPage() {
  const { companySlug } = await getCompanyContext();

  if (!companySlug) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Empresa não encontrada</h1>
          <p className="text-muted-foreground text-sm">
            Acesse via subdomínio (minhaempresa.imobi.com.br) ou utilize o parâmetro ?company=exclusiva em desenvolvimento.
          </p>
        </div>
      </div>
    );
  }

  const [stats, leadsByStage, activities, properties] = await Promise.all([
    fetchDashboardStats(companySlug),
    fetchLeadsByStage(companySlug),
    fetchRecentActivities(companySlug, 10),
    fetchProperties({ companySlug, featuredOnly: true, limit: 6 })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Visão geral da operação</p>
          <h1 className="text-3xl font-bold">Dashboard da Imobiliária</h1>
        </div>
        <Badge variant="secondary">{companySlug}</Badge>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-7">
        <LeadsByStage data={leadsByStage} />
        <RecentActivities activities={activities} />
      </div>

      <FeaturedProperties properties={properties} />
    </div>
  );
}
