import Link from 'next/link';
import DirectusImage from '@/components/shared/DirectusImage';
import { fetchProperties, getCoverImageId } from '@/lib/directus/realEstate';

export async function FeaturedProperties({ companySlug }: { companySlug: string }) {
        const properties = await fetchProperties({ companySlug, featuredOnly: true, limit: 6 });

        return (
                <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900">Imóveis em Destaque</h3>
                                <Link href="/admin/properties" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                        Ver todos
                                </Link>
                        </div>
                        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                                {properties.map((property: any) => {
                                        const price = property.transaction_type === 'rent' ? property.price_rent : property.price_sale;
                                        const coverImageId = getCoverImageId(property);

                                        return (
                                                <Link
                                                        key={property.id}
                                                        href={`/admin/properties/${property.id}`}
                                                        className="group overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
                                                >
                                                        <div className="relative aspect-video overflow-hidden bg-gray-200">
                                                                {coverImageId && (
                                                                        <DirectusImage
                                                                                uuid={coverImageId}
                                                                                alt={property.title}
                                                                                width={400}
                                                                                height={300}
                                                                                className="size-full object-cover transition-transform group-hover:scale-105"
                                                                        />
                                                                )}
                                                        </div>
                                                        <div className="p-4">
                                                                <h4 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900">{property.title}</h4>
                                                                <p className="mb-2 text-xs text-gray-600">
                                                                        {property.neighborhood}, {property.city}
                                                                </p>
                                                                <p className="text-lg font-bold text-blue-600">
                                                                        {price
                                                                                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
                                                                                : 'Sob consulta'}
                                                                </p>
                                                        </div>
                                                </Link>
                                        );
                                })}
                                {properties.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-gray-500">Nenhum imóvel em destaque</div>
                                )}
                        </div>
                </div>
        );
}
