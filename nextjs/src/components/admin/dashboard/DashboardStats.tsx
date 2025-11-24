import { Home, Users, Eye, FileText } from 'lucide-react';
import { fetchDashboardStats } from '@/lib/directus/realEstate';

export async function DashboardStats({ companySlug }: { companySlug: string }) {
	const stats = await fetchDashboardStats(companySlug);

	const cards = [
		{ label: 'Total de Imóveis', value: stats.totalProperties, icon: Home, color: 'bg-blue-500' },
		{ label: 'Leads Novos', value: stats.newLeads, icon: Users, color: 'bg-green-500' },
		{ label: 'Visitas (30 dias)', value: stats.monthlyViews.toLocaleString(), icon: Eye, color: 'bg-purple-500' },
		{ label: 'Propostas Ativas', value: stats.activeProposals, icon: FileText, color: 'bg-orange-500' },
	];

	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<div key={card.label} className="overflow-hidden rounded-lg bg-white shadow">
						<div className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">{card.label}</p>
									<p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
								</div>
								<div className={`rounded-lg p-3 ${card.color}`}>
									<Icon className="h-6 w-6 text-white" />
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
