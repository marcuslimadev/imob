import Link from 'next/link';
import Container from '@/components/ui/container';
import { findCoverMedia, fetchCompanyBySlug, fetchProperties } from '@/lib/directus/realEstate';
import DirectusImage from '@/components/shared/DirectusImage';

export default async function PropertiesPage({
        searchParams,
}: {
        searchParams: Promise<{ company?: string }>;
}) {
        const { company = 'exclusiva' } = await searchParams;

        const [companyData, properties] = await Promise.all([
                fetchCompanyBySlug(company),
                fetchProperties({ companySlug: company }),
        ]);

        return (
                <Container className="py-12 space-y-10">
                        <div className="space-y-2 text-center">
                                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Vitrine de Imóveis</p>
                                <h1 className="text-4xl font-bold">{companyData?.name || 'Imobiliária Exclusiva'}</h1>
                                <p className="text-muted-foreground">
                                        Explore a lista completa de imóveis usando os dados já configurados no Directus.
                                </p>
                        </div>

                        {!properties.length && (
                                <div className="text-center text-muted-foreground">Nenhum imóvel encontrado para esta empresa.</div>
                        )}

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {properties.map((property) => {
                                        const cover = findCoverMedia(property);
                                        const coverId =
                                                typeof cover?.directus_file === 'object'
                                                        ? cover.directus_file?.id
                                                        : cover?.directus_file || null;

                                        return (
                                                <Link
                                                        key={property.id}
                                                        href={`/properties/${property.id}?company=${company}`}
                                                        className="group rounded-xl border bg-card/40 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                                >
                                                        <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
                                                                {coverId ? (
                                                                        <DirectusImage
                                                                                uuid={coverId}
                                                                                alt={property.title}
                                                                                width={800}
                                                                                height={600}
                                                                                className="size-full object-cover transition duration-300 group-hover:scale-105"
                                                                        />
                                                                ) : (
                                                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                                                                Foto não disponível
                                                                        </div>
                                                                )}
                                                        </div>
                                                        <div className="space-y-3 px-5 py-4">
                                                                <div className="space-y-1">
                                                                        <p className="text-xs uppercase tracking-wide text-primary">
                                                                                {property.transaction_type || 'Venda'} · {property.property_type || 'Imóvel'}
                                                                        </p>
                                                                        <h2 className="text-lg font-semibold leading-snug">{property.title}</h2>
                                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                                                {property.description || 'Imóvel cadastrado via repositório de referência.'}
                                                                        </p>
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                        {[property.neighborhood, property.city, property.state]
                                                                                .filter(Boolean)
                                                                                .join(' · ') || 'Localização não informada'}
                                                                </div>
                                                                <div className="flex items-center justify-between text-sm font-semibold">
                                                                        <span>
                                                                                {property.price_sale
                                                                                        ? `Venda • R$ ${property.price_sale.toLocaleString('pt-BR')}`
                                                                                        : 'Consulte valores'}
                                                                        </span>
                                                                        {property.bedrooms ? (
                                                                                <span className="text-muted-foreground">{property.bedrooms} quartos</span>
                                                                        ) : (
                                                                                <span className="text-muted-foreground">Detalhes</span>
                                                                        )}
                                                                </div>
                                                        </div>
                                                </Link>
                                        );
                                })}
                        </div>
                </Container>
        );
}
