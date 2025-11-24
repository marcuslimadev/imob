import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import type { LeadStageCount } from '@/types/crm';

export default async function LeadsPage({
	searchParams,
}: {
	searchParams: Promise<{ company?: string }>;
}) {
	const params = await searchParams;
	const companySlug = params.company || 'exclusiva';

	// TODO: Implement fetchLeadsByStage in realEstate.ts and fetch real data
	const leadsByStage: LeadStageCount[] = [
		{ stage: 'Novo', count: 5 },
		{ stage: 'Contatado', count: 3 },
		{ stage: 'Qualificado', count: 2 },
		{ stage: 'Visitando', count: 1 },
		{ stage: 'Negociando', count: 1 },
		{ stage: 'Ganho', count: 0 },
		{ stage: 'Perdido', count: 0 },
	];

	// Organize leads by stage for Kanban view
	const stages = ['Novo', 'Contatado', 'Qualificado', 'Visitando', 'Negociando', 'Ganho', 'Perdido'];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Leads</h1>
					<p className="mt-1 text-sm text-gray-600">Gerencie seus leads e clientes potenciais</p>
				</div>
				<Link
					href={`/admin/leads/new?company=${companySlug}`}
					className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>
					<Plus className="size-5" />
					Novo Lead
				</Link>
			</div>

			{/* Search and Filters */}
			<div className="rounded-lg bg-white p-4 shadow">
				<div className="flex gap-4">
					<div className="flex-1">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								placeholder="Buscar leads por nome, email ou telefone..."
								className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
						</div>
					</div>
					<button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
						<Filter className="size-5" />
						Filtros
					</button>
				</div>
			</div>

			{/* Kanban Board */}
			<div className="overflow-x-auto pb-4">
				<div className="inline-flex min-w-full gap-4">
					{stages.map((stage) => {
						const stageData = leadsByStage.find((s: LeadStageCount) => s.stage === stage);
						const count = stageData?.count || 0;

						return (
							<div key={stage} className="w-80 flex-shrink-0">
								<div className="rounded-lg bg-white shadow">
									{/* Stage Header */}
									<div className="border-b border-gray-200 px-4 py-3">
										<div className="flex items-center justify-between">
											<h3 className="font-semibold text-gray-900">{stage}</h3>
											<span className="inline-flex size-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
												{count}
											</span>
										</div>
									</div>

									{/* Cards Container */}
									<div className="max-h-[calc(100vh-20rem)] space-y-3 overflow-y-auto p-4">
										{/* TODO: Add actual lead cards here */}
										{count === 0 ? (
											<p className="py-8 text-center text-sm text-gray-500">Nenhum lead neste estágio</p>
										) : (
											<p className="py-4 text-center text-sm text-gray-500">
												{count} lead{count !== 1 ? 's' : ''}
											</p>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Info Message */}
			<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
				<p className="text-sm text-blue-800">
					💡 <strong>Dica:</strong> Arraste e solte os cards para mudar o estágio do lead. A funcionalidade de
					drag & drop será implementada em breve.
				</p>
			</div>
		</div>
	);
}
