import { readItems } from '@directus/sdk';
import { useDirectus } from './directus';
import { Company, Property, PropertyMedia } from '@/types/directus-schema';
import type { LeadActivity, LeadStageCount } from '@/types/crm';

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
] as const;

// Helper to get cover image ID
export const getCoverImageId = (property: any): string | null => {
	if (!property.media || !Array.isArray(property.media)) return null;
	
	const coverMedia = property.media.find((m: any) => m.is_cover === true);
	if (coverMedia?.directus_file) {
		return typeof coverMedia.directus_file === 'string' 
			? coverMedia.directus_file 
			: coverMedia.directus_file.id;
	}
	
	const firstMedia = property.media[0];
	if (firstMedia?.directus_file) {
		return typeof firstMedia.directus_file === 'string'
			? firstMedia.directus_file
			: firstMedia.directus_file.id;
	}
	
	return null;
};

interface FetchPropertiesOptions {
        companySlug?: string;
        featuredOnly?: boolean;
        limit?: number;
        searchTerm?: string;
        propertyType?: string;
        transactionType?: string;
        city?: string;
        state?: string;
        publishedOnly?: boolean;
}

const buildCompanyFilter = (companySlug?: string) =>
	companySlug ? { company_id: { slug: { _eq: companySlug } } } : undefined;

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

export async function fetchProperties({
        companySlug,
        featuredOnly,
        limit,
        searchTerm,
        propertyType,
        transactionType,
        city,
        state,
        publishedOnly = true,
}: FetchPropertiesOptions = {}): Promise<Property[]> {
        const { directus } = useDirectus();

        const filters: any = {};

        const andFilters: any[] = [];

        const companyFilter = buildCompanyFilter(companySlug);
        if (companyFilter) {
                andFilters.push(companyFilter);
        }

        if (publishedOnly) {
                andFilters.push({ status: { _eq: 'published' } });
        }

        if (featuredOnly) {
                andFilters.push({ featured: { _eq: true } });
        }

        if (propertyType) {
                andFilters.push({ property_type: { _eq: propertyType } });
        }

        if (transactionType) {
                andFilters.push({ transaction_type: { _eq: transactionType } });
        }

        if (city) {
                andFilters.push({ city: { _ilike: city } });
        }

        if (state) {
                andFilters.push({ state: { _eq: state } });
        }

        if (searchTerm) {
                andFilters.push({
                        _or: [
                                { title: { _ilike: `%${searchTerm}%` } },
                                { description: { _ilike: `%${searchTerm}%` } },
                                { neighborhood: { _ilike: `%${searchTerm}%` } },
                                { city: { _ilike: `%${searchTerm}%` } },
                        ],
                });
        }

        if (andFilters.length > 0) {
                filters._and = andFilters;
        }

        return directus.request(
                readItems('properties', {
                        fields: propertyFields as any,
			filter: filters,
			sort: ['-featured', '-id'],
			limit,
		}),
	) as unknown as Promise<Property[]>;
}

export async function fetchPropertyById(
	id: string,
	{ companySlug }: { companySlug?: string } = {},
): Promise<Property | null> {
	const { directus } = useDirectus();

	const baseFilter: any = { id: { _eq: id } };
	const companyFilter = buildCompanyFilter(companySlug);
	const filter = companyFilter ? { _and: [baseFilter, companyFilter] } : baseFilter;

	const result = (await directus.request(
		readItems('properties', {
			fields: [...propertyFields, 'address', 'amenities', 'price_condo', 'price_iptu'] as any,
			filter,
			limit: 1,
		}),
	)) as unknown as Property[];

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

// Dashboard functions
export async function fetchDashboardStats(companySlug: string) {
	const { directus } = useDirectus();

	const [properties, leads, views] = await Promise.all([
		directus.request(
			readItems('properties', {
				filter: buildCompanyFilter(companySlug),
				aggregate: { count: '*' },
			}),
		),
		directus.request(
			// @ts-expect-error - Collection not in generated schema yet
			readItems('leads', {
				filter: {
					company_id: { slug: { _eq: companySlug } },
					stage: { _eq: 'new' },
				} as any,
				aggregate: { count: '*' },
			}),
		),
		directus.request(
			// @ts-expect-error - Collection not in generated schema yet
			readItems('property_views', {
				filter: {
					date_created: {
						_gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
					},
				} as any,
				aggregate: { count: '*' },
			}),
		),
	]);

	return {
		totalProperties: (properties as any)[0]?.count || 0,
		newLeads: (leads as any)[0]?.count || 0,
		monthlyViews: (views as any)[0]?.count || 0,
		activeProposals: 0, // TODO: implementar quando tiver collection de propostas
	};
}

export async function fetchLeadsByStage(companySlug: string): Promise<LeadStageCount[]> {
	const { directus } = useDirectus();

	const leads = await directus.request(
		// @ts-expect-error - Collection not in generated schema yet
		readItems('leads', {
			filter: { company_id: { slug: { _eq: companySlug } } } as any,
			fields: ['stage'],
		}),
	);

	const stageCount: Record<string, number> = {};
	leads.forEach((lead: any) => {
		const stage = lead.stage || 'Sem estágio';
		stageCount[stage] = (stageCount[stage] || 0) + 1;
	});

	return Object.entries(stageCount).map(([stage, count]) => ({
		stage,
		count,
	}));
}

export async function fetchRecentActivities(companySlug: string, limit: number = 10): Promise<LeadActivity[]> {
	const { directus } = useDirectus();

	const activities = await directus.request(
		// @ts-expect-error - Collection not in generated schema yet
		readItems('lead_activities', {
			fields: ['id', 'activity_type', 'subject', 'description', 'date_created', { lead_id: ['company_id'] }],
			filter: {
				lead_id: {
					company_id: { slug: { _eq: companySlug } },
				},
			} as any,
			sort: ['-date_created'],
			limit,
		}),
	);

	return activities as unknown as LeadActivity[];
}
