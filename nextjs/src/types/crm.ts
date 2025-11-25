// Types for collections not yet in the generated schema

export interface LeadActivity {
	id: string;
	lead_id: string;
	activity_type: string;
	subject: string;
	description?: string | null;
	scheduled_at?: string | null;
	completed_at?: string | null;
	status?: string | null;
	date_created?: string;
	user_created?: string;
}

export interface Lead {
	id: string;
	company_id: string;
	name: string;
	email?: string | null;
	phone?: string | null;
	cpf?: string | null;
	interest_type?: string | null;
	budget_min?: number | null;
	budget_max?: number | null;
	preferred_neighborhoods?: string | null;
	bedrooms_min?: number | null;
	property_types?: string | null;
	lead_source?: string | null;
	lead_score?: number | null;
	stage: string;
	assigned_to?: string | null;
	tags?: string | null;
	notes?: string | null;
	status?: string | null;
	date_created?: string;
	date_updated?: string;
}

export interface LeadStageCount {
	stage: string;
	count: number;
}
