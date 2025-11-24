import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { fetchProperties } from '@/lib/directus/realEstate';
import DirectusImage from '@/components/shared/DirectusImage';

export default async function PropertiesPage({
	searchParams,
}: {
	searchParams: Promise<{ company?: string; search?: string }>;
}) {
	const params = await searchParams;
	const companySlug = params.company || 'exclusiva';
	const searchQuery = params.search || '';

	const properties = await fetchProperties({ companySlug });

	// Filter properties by search query
	const filteredProperties = searchQuery
		? properties.filter(
				(p: any) =>
					p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					p.neighborhood?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					p.city?.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: properties;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Imóveis</h1>
					<p className="mt-1 text-sm text-gray-600">Gerencie todos os imóveis da imobiliária</p>
				</div>
				<Link
					href={`/admin/properties/new?company=${companySlug}`}
					className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>
					<Plus className="size-5" />
					Novo Imóvel
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
								placeholder="Buscar por título, bairro ou cidade..."
								defaultValue={searchQuery}
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

			{/* Properties Grid */}
			<div className="rounded-lg bg-white shadow">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b border-gray-200 bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
									Imóvel
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
									Tipo
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
									Localização
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
									Preço
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
									Status
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
									Ações
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 bg-white">
							{filteredProperties.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-6 py-12 text-center">
										<p className="text-gray-500">Nenhum imóvel encontrado</p>
									</td>
								</tr>
							) : (
								filteredProperties.map((property: any) => {
									const price =
										property.transaction_type === 'rent' ? property.price_rent : property.price_sale;
									const priceFormatted = price
										? new Intl.NumberFormat('pt-BR', {
												style: 'currency',
												currency: 'BRL',
											}).format(price)
										: 'Sob consulta';

									return (
										<tr key={property.id} className="hover:bg-gray-50">
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className="size-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
														{/* TODO: Add cover image */}
													</div>
													<div>
														<div className="font-medium text-gray-900">{property.title}</div>
														<div className="text-sm text-gray-500">
															{property.bedrooms} quartos • {property.area_total}m²
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
													{property.property_type}
												</span>
											</td>
											<td className="px-6 py-4 text-sm text-gray-900">
												{property.neighborhood}, {property.city}
											</td>
											<td className="px-6 py-4 text-sm font-medium text-gray-900">{priceFormatted}</td>
											<td className="px-6 py-4">
												{property.featured ? (
													<span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
														Destaque
													</span>
												) : (
													<span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
														Normal
													</span>
												)}
											</td>
											<td className="px-6 py-4 text-right text-sm font-medium">
												<Link
													href={`/admin/properties/${property.id}?company=${companySlug}`}
													className="text-blue-600 hover:text-blue-900"
												>
													Ver detalhes
												</Link>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
