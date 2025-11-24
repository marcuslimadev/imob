import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { fetchPropertyById } from '@/lib/directus/realEstate';

export default async function PropertyDetailPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ company?: string }>;
}) {
	const { id } = await params;
	const { company } = await searchParams;
	const companySlug = company || 'exclusiva';

	const property = await fetchPropertyById(id, { companySlug });

	if (!property) {
		notFound();
	}

	const price = property.transaction_type === 'rent' ? property.price_rent : property.price_sale;
	const priceFormatted = price
		? new Intl.NumberFormat('pt-BR', {
				style: 'currency',
				currency: 'BRL',
			}).format(price)
		: 'Sob consulta';

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link
						href={`/admin/properties?company=${companySlug}`}
						className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
					>
						<ArrowLeft className="size-5" />
					</Link>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
						<p className="mt-1 text-sm text-gray-600">
							{property.neighborhood}, {property.city} - {property.state}
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Link
						href={`/admin/properties/${id}/edit?company=${companySlug}`}
						className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
					>
						<Edit className="size-4" />
						Editar
					</Link>
					<button className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
						<Trash2 className="size-4" />
						Excluir
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left Column - Images and Details */}
				<div className="space-y-6 lg:col-span-2">
					{/* Images */}
					<div className="overflow-hidden rounded-lg bg-white shadow">
						<div className="aspect-video bg-gray-200">
							{/* TODO: Add image gallery */}
							<div className="flex size-full items-center justify-center text-gray-400">
								Galeria de Imagens
							</div>
						</div>
					</div>

					{/* Description */}
					<div className="rounded-lg bg-white p-6 shadow">
						<h2 className="mb-4 text-lg font-semibold text-gray-900">Descrição</h2>
						<p className="whitespace-pre-wrap text-gray-700">{property.description || 'Sem descrição'}</p>
					</div>

					{/* Characteristics */}
					<div className="rounded-lg bg-white p-6 shadow">
						<h2 className="mb-4 text-lg font-semibold text-gray-900">Características</h2>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<div>
								<p className="text-sm text-gray-600">Tipo</p>
								<p className="mt-1 font-medium text-gray-900">{property.property_type || '-'}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Transação</p>
								<p className="mt-1 font-medium text-gray-900">
									{property.transaction_type === 'rent' ? 'Aluguel' : 'Venda'}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Quartos</p>
								<p className="mt-1 font-medium text-gray-900">{property.bedrooms || '-'}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Banheiros</p>
								<p className="mt-1 font-medium text-gray-900">{property.bathrooms || '-'}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Suítes</p>
								<p className="mt-1 font-medium text-gray-900">{property.suites || '-'}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Vagas</p>
								<p className="mt-1 font-medium text-gray-900">{property.parking_spaces || '-'}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Área Total</p>
								<p className="mt-1 font-medium text-gray-900">{property.area_total || '-'} m²</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Área Construída</p>
								<p className="mt-1 font-medium text-gray-900">{property.area_built || '-'} m²</p>
							</div>
						</div>
					</div>

					{/* Amenities */}
					{property.amenities && (
						<div className="rounded-lg bg-white p-6 shadow">
							<h2 className="mb-4 text-lg font-semibold text-gray-900">Comodidades</h2>
							<div className="flex flex-wrap gap-2">
								{typeof property.amenities === 'string'
									? (property.amenities as string).split(',').map((amenity: string, idx: number) => (
											<span
												key={idx}
												className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
											>
												{amenity.trim()}
											</span>
										))
									: Array.isArray(property.amenities)
										? (property.amenities as string[]).map((amenity: string, idx: number) => (
												<span
													key={idx}
													className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
												>
													{amenity}
												</span>
											))
										: null}
							</div>
						</div>
					)}
				</div>

				{/* Right Column - Summary */}
				<div className="space-y-6">
					{/* Price */}
					<div className="rounded-lg bg-white p-6 shadow">
						<h2 className="mb-4 text-lg font-semibold text-gray-900">Valores</h2>
						<div className="space-y-3">
							<div>
								<p className="text-sm text-gray-600">
									{property.transaction_type === 'rent' ? 'Aluguel' : 'Venda'}
								</p>
								<p className="mt-1 text-2xl font-bold text-gray-900">{priceFormatted}</p>
							</div>
							{property.price_condo && (
								<div>
									<p className="text-sm text-gray-600">Condomínio</p>
									<p className="mt-1 text-lg font-medium text-gray-900">
										{new Intl.NumberFormat('pt-BR', {
											style: 'currency',
											currency: 'BRL',
										}).format(property.price_condo)}
									</p>
								</div>
							)}
							{property.price_iptu && (
								<div>
									<p className="text-sm text-gray-600">IPTU</p>
									<p className="mt-1 text-lg font-medium text-gray-900">
										{new Intl.NumberFormat('pt-BR', {
											style: 'currency',
											currency: 'BRL',
										}).format(property.price_iptu)}
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Location */}
					<div className="rounded-lg bg-white p-6 shadow">
						<h2 className="mb-4 text-lg font-semibold text-gray-900">Localização</h2>
						<div className="space-y-2 text-sm text-gray-700">
							<p>{property.address}</p>
							<p>
								{property.neighborhood}, {property.city}
							</p>
							<p>{property.state}</p>
						</div>
					</div>

					{/* Stats */}
					<div className="rounded-lg bg-white p-6 shadow">
						<h2 className="mb-4 text-lg font-semibold text-gray-900">Estatísticas</h2>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<p className="text-sm text-gray-600">Visualizações</p>
								<p className="font-medium text-gray-900">{property.views_count || 0}</p>
							</div>
							<div className="flex items-center justify-between">
								<p className="text-sm text-gray-600">Status</p>
								<span
									className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
										property.featured
											? 'bg-green-100 text-green-800'
											: 'bg-gray-100 text-gray-800'
									}`}
								>
									{property.featured ? 'Destaque' : 'Normal'}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
