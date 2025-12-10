import { Suspense } from 'react';
import { DashboardStats } from '@/components/admin/dashboard/DashboardStats';
import { LeadsByStage } from '@/components/admin/dashboard/LeadsByStage';
import { RecentActivities } from '@/components/admin/dashboard/RecentActivities';
import { FeaturedProperties } from '@/components/admin/dashboard/FeaturedProperties';

export const metadata = {
	title: 'Dashboard - IMOBI',
	description: 'Painel administrativo',
};

export default async function DashboardPage({
	searchParams,
}: {
	searchParams: Promise<{ company?: string }>;
}) {
	const params = await searchParams;
	const companySlug = params.company || 'exclusiva';

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
				<p className="mt-2 text-gray-600">
					Visão geral do seu negócio imobiliário
				</p>
			</div>

			<Suspense fallback={<StatsLoadingSkeleton />}>
				<DashboardStats companySlug={companySlug} />
			</Suspense>

			<div className="grid gap-6 lg:grid-cols-2">
				<Suspense fallback={<ChartLoadingSkeleton />}>
					<LeadsByStage companySlug={companySlug} />
				</Suspense>

				<Suspense fallback={<ListLoadingSkeleton />}>
					<RecentActivities companySlug={companySlug} />
				</Suspense>
			</div>

			<Suspense fallback={<GridLoadingSkeleton />}>
				<FeaturedProperties companySlug={companySlug} />
			</Suspense>
		</div>
	);
}

function StatsLoadingSkeleton() {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{[...Array(4)].map((_, i) => (
				<div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
			))}
		</div>
	);
}

function ChartLoadingSkeleton() {
	return <div className="h-80 animate-pulse rounded-lg bg-white p-6" />;
}

function ListLoadingSkeleton() {
	return <div className="h-80 animate-pulse rounded-lg bg-white p-6" />;
}

function GridLoadingSkeleton() {
	return <div className="h-64 animate-pulse rounded-lg bg-white p-6" />;
}
