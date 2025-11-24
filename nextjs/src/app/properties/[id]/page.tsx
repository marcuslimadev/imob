import Container from '@/components/ui/container';
import DirectusImage from '@/components/shared/DirectusImage';
import { findCoverMedia, fetchPropertyById } from '@/lib/directus/realEstate';
import { getDirectusAssetURL } from '@/lib/directus/directus-utils';

export default async function PropertyDetailPage({
        params,
        searchParams,
}: {
        params: Promise<{ id: string }>;
        searchParams: Promise<{ company?: string }>;
}) {
        const { id } = await params;
        const { company = 'exclusiva' } = await searchParams;

        const property = await fetchPropertyById(id, { companySlug: company });

        if (!property) {
                return (
                        <Container className="py-12 text-center text-muted-foreground">
                                Imóvel não encontrado ou não pertence à empresa selecionada.
                        </Container>
                );
        }

        const cover = findCoverMedia(property);
        const coverId =
                typeof cover?.directus_file === 'object' ? cover.directus_file?.id : cover?.directus_file || null;
        const coverUrl = coverId ? getDirectusAssetURL(coverId) : null;
        const companyData = typeof property.company_id === 'object' ? property.company_id : null;

        return (
                <Container className="py-12 space-y-8">
                        <div className="space-y-2">
                                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                                        {companyData?.name || 'Imobiliária Exclusiva'}
                                </p>
                                <h1 className="text-3xl font-semibold leading-tight">{property.title}</h1>
                                <p className="text-muted-foreground max-w-3xl">{property.description}</p>
                        </div>

                        {coverId && coverUrl && (
                                <div className="overflow-hidden rounded-2xl border bg-muted">
                                        <DirectusImage
                                                uuid={coverId}
                                                alt={property.title}
                                                width={1200}
                                                height={720}
                                                className="size-full object-cover"
                                        />
                                </div>
                        )}

                        <div className="grid gap-6 lg:grid-cols-3">
                                <div className="space-y-4 lg:col-span-2">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                                <InfoItem label="Tipo" value={property.property_type} />
                                                <InfoItem label="Transação" value={property.transaction_type} />
                                                <InfoItem label="Quartos" value={property.bedrooms?.toString()} />
                                                <InfoItem label="Banheiros" value={property.bathrooms?.toString()} />
                                                <InfoItem label="Vagas" value={property.parking_spaces?.toString()} />
                                                <InfoItem label="Área total" value={property.area_total ? `${property.area_total} m²` : null} />
                                        </div>

                                        <div className="space-y-2 rounded-xl border p-4">
                                                <h2 className="text-lg font-semibold">Localização</h2>
                                                <p className="text-muted-foreground">
                                                        {[property.address, property.neighborhood, property.city, property.state]
                                                                .filter(Boolean)
                                                                .join(' · ') || 'Endereço não informado'}
                                                </p>
                                        </div>

                                        {property.amenities && (
                                                <div className="space-y-2 rounded-xl border p-4">
                                                        <h2 className="text-lg font-semibold">Diferenciais</h2>
                                                        <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                                                                {JSON.stringify(property.amenities, null, 2)}
                                                        </pre>
                                                </div>
                                        )}
                                </div>

                                <div className="space-y-4 rounded-xl border p-5 bg-card/40">
                                        <h2 className="text-lg font-semibold">Valores</h2>
                                        <div className="space-y-2 text-sm">
                                                <PriceItem label="Venda" value={property.price_sale} />
                                                <PriceItem label="Aluguel" value={property.price_rent} />
                                                <PriceItem label="Condomínio" value={property.price_condo} />
                                                <PriceItem label="IPTU" value={property.price_iptu} />
                                        </div>
                                </div>
                        </div>
                </Container>
        );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
        return (
                <div className="rounded-lg border p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">{value || '—'}</p>
                </div>
        );
}

function PriceItem({ label, value }: { label: string; value?: number | null }) {
        const formatted = value ? `R$ ${value.toLocaleString('pt-BR')}` : 'Sob consulta';

        return (
                <div className="flex items-center justify-between rounded-lg border p-3">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold">{formatted}</span>
                </div>
        );
}
