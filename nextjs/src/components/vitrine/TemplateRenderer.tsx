'use client';

import { Suspense } from 'react';
import Template1 from './templates/Template1';
import Template2 from './templates/Template2';
import Template3 from './templates/Template3';
import Template4 from './templates/Template4';
import Template5 from './templates/Template5';
import Template6 from './templates/Template6';
import Template7 from './templates/Template7';
import Template8 from './templates/Template8';
import Template9 from './templates/Template9';
import Template10 from './templates/Template10';
import Template11 from './templates/Template11';
import Template12 from './templates/Template12';
import Template13 from './templates/Template13';
import Template14 from './templates/Template14';
import Template15 from './templates/Template15';
import Template16 from './templates/Template16';
import Template17 from './templates/Template17';
import Template18 from './templates/Template18';
import Template19 from './templates/Template19';
import Template20 from './templates/Template20';

export interface Property {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  finalidade: string;
  cidade: string;
  estado: string;
  quartos: number;
  banheiros: number;
  area_total: number;
  preco: number;
  destaque: boolean;
  property_media?: Array<{
    directus_files_id: {
      id: string;
      filename_disk: string;
    };
  }>;
}

export interface Company {
  id: string;
  nome_fantasia: string;
  logo_url?: string;
  telefone?: string;
  email?: string;
  custom_domain?: string;
  storefront_template_id?: number;
}

interface TemplateRendererProps {
  templateId: number;
  properties: Property[];
  company: Company;
  filters?: {
    search?: string;
    tipo?: string;
    finalidade?: string;
    cidade?: string;
  };
}

const templates = {
  1: Template1,
  2: Template2,
  3: Template3,
  4: Template4,
  5: Template5,
  6: Template6,
  7: Template7,
  8: Template8,
  9: Template9,
  10: Template10,
  11: Template11,
  12: Template12,
  13: Template13,
  14: Template14,
  15: Template15,
  16: Template16,
  17: Template17,
  18: Template18,
  19: Template19,
  20: Template20,
};

export default function TemplateRenderer({
  templateId,
  properties,
  company,
  filters
}: TemplateRendererProps) {
  const TemplateComponent = templates[templateId as keyof typeof templates] || templates[1];

  return (
    <Suspense fallback={<TemplateLoading />}>
      <TemplateComponent
        properties={properties}
        company={company}
        filters={filters}
      />
    </Suspense>
  );
}

function TemplateLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando imóveis...</p>
      </div>
    </div>
  );
}
