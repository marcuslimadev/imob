import Link from 'next/link';
import { headers } from 'next/headers';
import { directusServer } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';
import TemplateRenderer from '@/components/vitrine/TemplateRenderer';
import { redirect } from 'next/navigation';

interface Property {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  finalidade: string;
  cidade: string;
  estado: string;
  bairro: string;
  quartos: number;
  banheiros: number;
  vagas_garagem: number;
  area_total: number;
  area_util: number;
  preco: number;
  destaque: boolean;
  property_media?: Array<{
    directus_files_id: {
      id: string;
      filename_disk: string;
    };
  }>;
}

interface Company {
  id: string;
  nome_fantasia: string;
  logo_url?: string;
  telefone?: string;
  email?: string;
  custom_domain?: string;
  storefront_template_id?: number;
}

export default async function VitrinePage() {
  const headersList = await headers();
  const companyId = headersList.get('x-company-id');
  const templateIdHeader = headersList.get('x-storefront-template-id');
  
  if (!companyId) {
    redirect('/login');
  }

  // Buscar dados da empresa
  const companies = await directusServer.request(
    readItems('companies', {
      filter: { id: { _eq: companyId } },
      fields: ['id', 'nome_fantasia', 'logo_url', 'telefone', 'email', 'custom_domain', 'storefront_template_id'],
      limit: 1
    })
  );

  if (companies.length === 0) {
    redirect('/login');
  }

  const company = companies[0] as Company;

  // Determinar qual template usar (prioridade: header > company.storefront_template_id > default 1)
  const templateId = templateIdHeader 
    ? parseInt(templateIdHeader) 
    : company.storefront_template_id || 1;

  // Buscar imóveis publicados da empresa
  const properties = await directusServer.request(
    readItems('properties', {
      filter: {
        company_id: { _eq: companyId },
        status: { _eq: 'published' }
      },
      fields: [
        'id',
        'titulo',
        'descricao',
        'tipo',
        'finalidade',
        'cidade',
        'estado',
        'bairro',
        'quartos',
        'banheiros',
        'vagas_garagem',
        'area_total',
        'area_util',
        'preco',
        'destaque',
        {
          property_media: [
            {
              directus_files_id: ['id', 'filename_disk']
            }
          ]
        }
      ],
      sort: ['-destaque', '-date_created'],
      limit: 100
    })
  );

  return (
    <TemplateRenderer
      templateId={templateId}
      properties={properties as Property[]}
      company={company}
    />
  );
}
