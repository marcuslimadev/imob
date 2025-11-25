import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DirectusImage from '@/components/shared/DirectusImage';
import { getDirectusAssetURL } from '@/lib/directus/directus-utils';
import { getCoverImageId } from '@/lib/directus/realEstate';
import { Property } from '@/types/directus-schema';
import { MapPin } from 'lucide-react';

interface FeaturedPropertiesProps {
        properties: Property[];
        companySlug: string;
}

const formatPrice = (value?: number | null) => {
        if (!value) return 'Sob consulta';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function FeaturedProperties({ properties, companySlug }: FeaturedPropertiesProps) {
        return (
                <Card>
                        <CardHeader className="flex items-center justify-between gap-2 sm:flex-row sm:items-start">
                                <div>
                                        <CardTitle>Imóveis em destaque</CardTitle>
                                        <CardDescription>Principais oportunidades para sua carteira</CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                        {properties.length} em destaque
                                </Badge>
                        </CardHeader>
                        <CardContent>
                                {properties.length === 0 && (
                                        <p className="text-sm text-muted-foreground">Nenhum imóvel marcado como destaque.</p>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {properties.map((property) => {
                                                const coverId = getCoverImageId(property);
                                                const coverUrl = coverId ? getDirectusAssetURL(coverId) : null;
                                                const price = property.price_sale || property.price_rent;

                                                return (
                                                        <Link
                                                                key={property.id}
                                                                href={`/properties/${property.id}?company=${companySlug}`}
                                                                className="group overflow-hidden rounded-lg border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                                        >
                                                                {coverUrl ? (
                                                                        <div className="relative aspect-video w-full overflow-hidden">
                                                                                <DirectusImage
                                                                                        uuid={coverId as string}
                                                                                        alt={property.title || 'Imóvel'}
                                                                                        fill
                                                                                        className="object-cover transition duration-300 group-hover:scale-105"
                                                                                />
                                                                                <Badge className="absolute left-3 top-3 bg-primary">Destaque</Badge>
                                                                        </div>
                                                                ) : (
                                                                        <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
                                                                                Sem foto
                                                                        </div>
                                                                )}

                                                                <div className="space-y-2 p-4">
                                                                        <div className="space-y-1">
                                                                                <div className="flex items-start justify-between gap-2">
                                                                                        <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
                                                                                                {property.title}
                                                                                        </h3>
                                                                                        <Badge variant="secondary" className="capitalize">
                                                                                                {property.property_type}
                                                                                        </Badge>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                                        <MapPin className="h-4 w-4" />
                                                                                        <span>
                                                                                                {property.neighborhood} • {property.city}/{property.state}
                                                                                        </span>
                                                                                </div>
                                                                        </div>

                                                                        <p className="text-xl font-bold text-primary">{formatPrice(price)}</p>

                                                                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                                                                <span>{property.bedrooms} dorm</span>
                                                                                <span>{property.bathrooms} banh</span>
                                                                                <span>{property.area_total} m²</span>
                                                                        </div>
                                                                </div>
                                                        </Link>
                                                );
                                        })}
                                </div>
                        </CardContent>
                </Card>
        );
}
