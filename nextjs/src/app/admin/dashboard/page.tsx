import DashboardStats from '@/components/admin/dashboard/DashboardStats';
import FeaturedProperties from '@/components/admin/dashboard/FeaturedProperties';
import LeadsByStage from '@/components/admin/dashboard/LeadsByStage';
import RecentActivities from '@/components/admin/dashboard/RecentActivities';
import { Badge } from '@/components/ui/badge';
import { fetchDashboardStats, fetchLeadsByStage, fetchProperties, fetchRecentActivities } from '@/lib/directus/realEstate';
import { getCompanyContext } from '@/lib/hooks/useCompany';

export default async function AdminDashboardPage() {
        const { companySlug } = await getCompanyContext();

        if (!companySlug) {
                return (
                        <div className="flex min-h-[70vh] items-center justify-center">
                                <div className="text-center">
                                        <p className="text-lg font-semibold">Nenhuma empresa encontrada</p>
                                        <p className="text-sm text-muted-foreground">
                                                Acesse com ?company=exclusiva em desenvolvimento ou configure um domínio personalizado.
                                        </p>
                                </div>
                        </div>
                );
        }

        const [stats, stages, activities, featuredProperties] = await Promise.all([
                fetchDashboardStats(companySlug),
                fetchLeadsByStage(companySlug),
                fetchRecentActivities(companySlug, 10),
                fetchProperties({ companySlug, featuredOnly: true, limit: 6 }),
        ]);

        return (
                <div className="space-y-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                        <p className="text-sm text-muted-foreground">Visão geral</p>
                                        <h1 className="text-3xl font-bold">Dashboard administrativo</h1>
                                </div>
                                <Badge variant="secondary">Company: {companySlug}</Badge>
                        </div>

                        <DashboardStats stats={stats} />

                        <div className="grid gap-4 lg:grid-cols-3">
                                <LeadsByStage stages={stages} />
                                <RecentActivities activities={activities} />
                        </div>

                        <FeaturedProperties properties={featuredProperties} companySlug={companySlug} />
                </div>
        );
}
