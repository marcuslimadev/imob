import { QueryFilter, readItems } from '@directus/sdk';
import { useDirectus } from './directus';
import { Company, Property, PropertyMedia } from '@/types/directus-schema';

const propertyFields = [
        'id',
        'title',
        'description',
        'property_type',
        'transaction_type',
        'neighborhood',
        'city',
        'state',
        'bedrooms',
        'bathrooms',
        'suites',
        'parking_spaces',
        'area_total',
        'price_sale',
        'price_rent',
        'featured',
        {
                company_id: ['id', 'name', 'slug', 'custom_domain', 'primary_color', 'secondary_color', 'logo'],
        },
        {
                media: ['id', 'is_cover', { directus_file: ['id'] }],
        },
];

interface FetchPropertiesOptions {
        companySlug?: string;
        featuredOnly?: boolean;
}

const buildCompanyFilter = (companySlug?: string) =>
        companySlug
                ? ({ company_id: { slug: { _eq: companySlug } } } satisfies QueryFilter<Property>)
                : undefined;

export async function fetchCompanyBySlug(slug: string): Promise<Company | null> {
        const { directus } = useDirectus();

        const companies = await directus.request(
                readItems('companies', {
                        filter: { slug: { _eq: slug } },
                        limit: 1,
                        fields: ['id', 'name', 'slug', 'custom_domain', 'logo', 'primary_color', 'secondary_color'],
                }),
        );

        return companies?.[0] ?? null;
}

export async function fetchProperties({ companySlug, featuredOnly }: FetchPropertiesOptions = {}): Promise<Property[]> {
        const { directus } = useDirectus();

        const filters: QueryFilter<Property> = {
                ...(buildCompanyFilter(companySlug) || {}),
        };

        if (featuredOnly) {
                filters.featured = { _eq: true } as QueryFilter<Property>['featured'];
        }

        return directus.request(
                readItems('properties', {
                        fields: propertyFields as any,
                        filter: filters,
                        sort: ['-featured', '-id'],
                }),
        );
}

export async function fetchPropertyById(
        id: string,
        { companySlug }: { companySlug?: string } = {},
): Promise<Property | null> {
        const { directus } = useDirectus();

        const baseFilter: QueryFilter<Property> = { id: { _eq: id } };
        const companyFilter = buildCompanyFilter(companySlug);
        const filter = companyFilter ? { _and: [baseFilter, companyFilter] } : baseFilter;

        const result = await directus.request(
                readItems('properties', {
                        fields: [...propertyFields, 'address', 'amenities', 'price_condo', 'price_iptu'] as any,
                        filter,
                        limit: 1,
                }),
        );

        return result?.[0] ?? null;
}

export const findCoverMedia = (property: Property): PropertyMedia | null => {
        const mediaItems = property.media || [];

        const cover = mediaItems.find(
                (item): item is PropertyMedia => typeof item !== 'string' && item?.is_cover === true,
        );

        if (cover) return cover;

        const firstItem = mediaItems.find((item): item is PropertyMedia => typeof item !== 'string');

        return firstItem || null;
};
