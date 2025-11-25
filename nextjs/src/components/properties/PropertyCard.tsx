import Image from 'next/image';
import { ArrowUpRight, Bath, BedDouble, Car, MapPin, Ruler } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PropertyPreview } from '@/data/properties';

export function PropertyCard({ property }: { property: PropertyPreview }) {
        const {
                title,
                neighborhood,
                city,
                state,
                price,
                propertyType,
                transactionType,
                bedrooms,
                bathrooms,
                parking,
                area,
                image,
                amenities,
                highlight,
        } = property;

        const formattedPrice = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: transactionType === 'Venda' ? 'BRL' : 'BRL',
                maximumFractionDigits: 0,
        }).format(price);

        const priceSuffix = transactionType === 'Aluguel' ? '/mês' : '';

        return (
                <article
                        className={cn(
                                'group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl',
                                highlight ? 'ring-2 ring-accent/60' : '',
                        )}
                >
                        <div className="relative h-56 w-full overflow-hidden">
                                <Image
                                        src={image}
                                        alt={title}
                                        fill
                                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                                        priority={highlight}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                <div className="absolute left-4 top-4 flex gap-2">
                                        <Badge variant="secondary" className="bg-background/80 text-foreground backdrop-blur">
                                                {propertyType}
                                        </Badge>
                                        <Badge variant="secondary" className="bg-accent text-accent-foreground">
                                                {transactionType}
                                        </Badge>
                                </div>
                        </div>

                        <div className="space-y-4 p-5 md:p-6">
                                <header className="space-y-2">
                                        <div className="flex items-start gap-2">
                                                <MapPin className="mt-1 size-4 text-muted-foreground" />
                                                <div>
                                                        <p className="text-sm uppercase tracking-wide text-muted-foreground">
                                                                {neighborhood} • {city}/{state}
                                                        </p>
                                                        <h3 className="font-heading text-xl leading-7 text-foreground md:text-2xl">{title}</h3>
                                                </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-baseline gap-1 text-2xl font-semibold text-foreground">
                                                        <span>{formattedPrice}</span>
                                                        <span className="text-sm font-normal text-muted-foreground">{priceSuffix}</span>
                                                </div>
                                                {highlight && <Badge className="bg-accent text-accent-foreground">Destaque</Badge>}
                                        </div>
                                </header>

                                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground md:grid-cols-4">
                                        <Stat icon={BedDouble} label="Quartos" value={`${bedrooms}`} />
                                        <Stat icon={Bath} label="Banheiros" value={`${bathrooms}`} />
                                        <Stat icon={Car} label="Vagas" value={`${parking}`} />
                                        <Stat icon={Ruler} label="Área" value={`${area} m²`} />
                                </div>

                                <ul className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                        {amenities.slice(0, 3).map((amenity) => (
                                                <li
                                                        key={amenity}
                                                        className="rounded-full border border-border px-3 py-1 text-xs font-medium"
                                                >
                                                        {amenity}
                                                </li>
                                        ))}
                                </ul>

                                <div className="flex items-center justify-between pt-1">
                                        <div className="text-xs uppercase tracking-wider text-muted-foreground">{property.company}</div>
                                        <Button variant="ghost" className="group text-sm">
                                                Ver detalhes <ArrowUpRight className="ml-2 size-4 transition group-hover:translate-x-0.5" />
                                        </Button>
                                </div>
                        </div>
                </article>
        );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
        return (
                <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
                        <Icon className="size-4 text-muted-foreground" />
                        <div>
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                                <p className="font-medium text-foreground">{value}</p>
                        </div>
                </div>
        );
}
