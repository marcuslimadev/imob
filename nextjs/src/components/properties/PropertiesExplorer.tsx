'use client';

import { useMemo, useState } from 'react';
import { Filter, MapPin } from 'lucide-react';

import { PropertyCard } from './PropertyCard';
import type { PropertyPreview } from '@/data/properties';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

function filterProperties(
        items: PropertyPreview[],
        filters: {
                query: string;
                transaction: string;
                propertyType: string;
                bedrooms: string;
                maxPrice: string;
        },
) {
        return items.filter((property) => {
                const matchesQuery =
                        filters.query.trim().length === 0 ||
                        `${property.title} ${property.neighborhood} ${property.city}`
                                .toLowerCase()
                                .includes(filters.query.toLowerCase());

                const matchesTransaction =
                        filters.transaction === 'todas' || property.transactionType === filters.transaction;

                const matchesType = filters.propertyType === 'todas' || property.propertyType === filters.propertyType;

                const matchesBedrooms =
                        filters.bedrooms === 'todas' || property.bedrooms >= Number.parseInt(filters.bedrooms);

                const matchesPrice =
                        filters.maxPrice === '0' || property.price <= Number.parseInt(filters.maxPrice, 10);

                return matchesQuery && matchesTransaction && matchesType && matchesBedrooms && matchesPrice;
        });
}

export function PropertiesExplorer({ properties }: { properties: PropertyPreview[] }) {
        const [filters, setFilters] = useState({
                query: '',
                transaction: 'todas',
                propertyType: 'todas',
                bedrooms: 'todas',
                maxPrice: '0',
        });

        const propertyTypes = useMemo(() => Array.from(new Set(properties.map((property) => property.propertyType))), [
                properties,
        ]);

        const filtered = useMemo(() => filterProperties(properties, filters), [properties, filters]);

        const totalHighlights = filtered.filter((property) => property.highlight).length;

        return (
                <section className="bg-muted/40 py-10 md:py-16">
                        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:px-6">
                                <header className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-accent">
                                                <MapPin className="size-4" /> Vitrine pública
                                        </div>
                                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                                <div className="space-y-2">
                                                        <h1 className="font-heading text-3xl leading-tight text-foreground md:text-4xl">
                                                                Imóveis em destaque de Belo Horizonte e região
                                                        </h1>
                                                        <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
                                                                Explore rapidamente os imóveis cadastrados na plataforma. Use os filtros para
                                                                encontrar unidades por cidade, tipo, quantidade de quartos ou faixa de preço.
                                                        </p>
                                                </div>
                                                <div className="flex gap-2 rounded-2xl bg-background/60 px-4 py-3 text-sm font-medium text-foreground">
                                                        <div>{filtered.length} {filtered.length === 1 ? 'imóvel' : 'imóveis'}</div>
                                                        <Separator orientation="vertical" className="h-5" />
                                                        <div>{totalHighlights} em destaque</div>
                                                </div>
                                        </div>
                                </header>

                                <div className="grid gap-4 rounded-2xl border border-border bg-background/60 p-4 shadow-sm md:p-5">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                                <div className="md:col-span-2">
                                                        <label className="text-sm font-medium text-foreground">Buscar</label>
                                                        <Input
                                                                placeholder="Bairros, cidades ou palavras-chave"
                                                                value={filters.query}
                                                                onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                                                        />
                                                </div>
                                                <div>
                                                        <label className="text-sm font-medium text-foreground">Transação</label>
                                                        <Select
                                                                value={filters.transaction}
                                                                onValueChange={(value) => setFilters((current) => ({ ...current, transaction: value }))}
                                                        >
                                                                <SelectTrigger>
                                                                        <SelectValue placeholder="Todas" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                        <SelectItem value="todas">Todas</SelectItem>
                                                                        <SelectItem value="Venda">Compra/Venda</SelectItem>
                                                                        <SelectItem value="Aluguel">Aluguel</SelectItem>
                                                                </SelectContent>
                                                        </Select>
                                                </div>
                                                <div>
                                                        <label className="text-sm font-medium text-foreground">Tipo de imóvel</label>
                                                        <Select
                                                                value={filters.propertyType}
                                                                onValueChange={(value) => setFilters((current) => ({ ...current, propertyType: value }))}
                                                        >
                                                                <SelectTrigger>
                                                                        <SelectValue placeholder="Todos" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                        <SelectItem value="todas">Todos</SelectItem>
                                                                        {propertyTypes.map((type) => (
                                                                                <SelectItem key={type} value={type}>
                                                                                        {type}
                                                                                </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                        </Select>
                                                </div>
                                                <div>
                                                        <label className="text-sm font-medium text-foreground">Quartos mínimos</label>
                                                        <Select
                                                                value={filters.bedrooms}
                                                                onValueChange={(value) => setFilters((current) => ({ ...current, bedrooms: value }))}
                                                        >
                                                                <SelectTrigger>
                                                                        <SelectValue placeholder="Qualquer" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                        <SelectItem value="todas">Qualquer</SelectItem>
                                                                        <SelectItem value="1">1+</SelectItem>
                                                                        <SelectItem value="2">2+</SelectItem>
                                                                        <SelectItem value="3">3+</SelectItem>
                                                                        <SelectItem value="4">4+</SelectItem>
                                                                        <SelectItem value="5">5+</SelectItem>
                                                                </SelectContent>
                                                        </Select>
                                                </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                                                <div className="md:col-span-2">
                                                        <label className="text-sm font-medium text-foreground">Teto de investimento</label>
                                                        <div className="flex gap-2">
                                                                <Input
                                                                        type="number"
                                                                        min={0}
                                                                        step={1000}
                                                                        placeholder="Sem limite"
                                                                        value={filters.maxPrice === '0' ? '' : filters.maxPrice}
                                                                        onChange={(event) =>
                                                                                setFilters((current) => ({
                                                                                        ...current,
                                                                                        maxPrice: event.target.value ? event.target.value : '0',
                                                                                }))
                                                                        }
                                                                />
                                                                <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() => setFilters((current) => ({ ...current, maxPrice: '0' }))}
                                                                >
                                                                        Limpar
                                                                </Button>
                                                        </div>
                                                </div>
                                                <div className="md:col-span-4 flex flex-wrap items-center gap-2">
                                                        {propertyTypes.map((type) => (
                                                                <Badge
                                                                        key={type}
                                                                        variant={filters.propertyType === type ? 'default' : 'outline'}
                                                                        className="cursor-pointer"
                                                                        onClick={() =>
                                                                                setFilters((current) => ({
                                                                                        ...current,
                                                                                        propertyType: current.propertyType === type ? 'todas' : type,
                                                                                }))
                                                                        }
                                                                >
                                                                        {type}
                                                                </Badge>
                                                        ))}
                                                        <Badge
                                                                variant="outline"
                                                                className="cursor-pointer"
                                                                onClick={() => setFilters((current) => ({ ...current, transaction: 'todas' }))}
                                                        >
                                                                <Filter className="mr-1 size-3" /> Limpar filtros
                                                        </Badge>
                                                </div>
                                        </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        {filtered.map((property) => (
                                                <PropertyCard property={property} key={property.id} />
                                        ))}
                                        {filtered.length === 0 && (
                                                <div className="rounded-2xl border border-dashed border-border bg-background/70 p-8 text-center text-muted-foreground">
                                                        Nenhum imóvel encontrado com os filtros selecionados. Ajuste a busca para ver mais opções.
                                                </div>
                                        )}
                                </div>
                        </div>
                </section>
        );
}
