import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Home as HomeIcon, ArrowUpRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDirectusAssetURL } from '@/lib/directus/directus-utils';
import { getCoverImageId } from '@/lib/directus/realEstate';
import { Property } from '@/types/directus-schema';

function formatCurrency(value?: number | null) {
  if (!value) return 'Sob consulta';

  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export default function FeaturedProperties({ properties }: { properties: Property[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Imóveis em Destaque</CardTitle>
          <p className="text-sm text-muted-foreground">Últimos imóveis destacados pela equipe</p>
        </div>
        <Badge variant="secondary">{properties.length} imóveis</Badge>
      </CardHeader>
      <CardContent>
        {properties.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Nenhum imóvel cadastrado ainda. Adicione imóveis em destaque no Directus.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => {
            const coverImageId = getCoverImageId(property);
            const price = property.transaction_type === 'rent' ? property.price_rent : property.price_sale;

            return (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="group overflow-hidden rounded-xl border"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  {coverImageId ? (
                    <Image
                      src={getDirectusAssetURL(coverImageId)}
                      alt={property.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                      Sem imagem
                    </div>
                  )}
                  <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">{property.property_type}</Badge>
                </div>

                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold leading-tight">{property.title}</h3>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    <span>
                      {property.neighborhood} • {property.city}/{property.state}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{property.transaction_type === 'rent' ? 'Aluguel' : 'Venda'}</p>
                      <p className="text-xl font-bold">{formatCurrency(price)}</p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <HomeIcon className="size-4" />
                      {property.area_total} m²
                    </Badge>
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
