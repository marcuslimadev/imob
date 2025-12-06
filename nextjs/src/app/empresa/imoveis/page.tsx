import { directusServer } from '@/lib/directus/client';
import { readItems, createItem } from '@directus/sdk';
import { redirect } from 'next/navigation';
import { getAuthenticatedCompanyId } from '@/lib/auth/server';
import Link from 'next/link';
import { ImportPropertiesButton } from '@/components/properties/ImportPropertiesButton';
import { BauhausPageHeader } from '@/components/layout/BauhausPageHeader';
import { BauhausCard, BauhausStatCard } from '@/components/layout/BauhausCard';
import { Plus } from 'lucide-react';

async function getCompanyProperties(companyId: string) {
  try {
    // @ts-ignore - Custom schema
    return await directusServer.request(
      readItems('properties', {
        filter: {
          company_id: { _eq: companyId }
        },
        // @ts-ignore
        sort: ['-created_at'],
        fields: ['*']
      })
    );
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

function getPropertyTypeLabel(type: string): string {
  const types: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Casa',
    commercial: 'Comercial',
    land: 'Terreno',
    farm: 'Fazenda',
    penthouse: 'Cobertura'
  };
  return types[type] || type;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0
  }).format(price);
}

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    active: 'bg-green-600 text-white font-bold',
    sold: 'bg-red-600 text-white font-bold',
    rented: 'bg-blue-600 text-white font-bold',
    inactive: 'bg-gray-600 text-white font-bold'
  };
  return classes[status] || classes.inactive;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Ativo',
    sold: 'Vendido',
    rented: 'Alugado',
    inactive: 'Inativo'
  };
  return labels[status] || status;
}

export default async function CompanyPropertiesPage() {
  const companyId = await getAuthenticatedCompanyId();
  
  const properties = await getCompanyProperties(companyId);

  return (
    <div className="min-h-screen bg-white">
      {/* Bauhaus Header */}
      <BauhausPageHeader
        title="Imóveis"
        description="Gerencie todos os imóveis da sua imobiliária"
        actions={
          <div className="flex gap-3">
            <ImportPropertiesButton />
            <Link
              href="/empresa/imoveis/novo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-none font-light uppercase tracking-wide text-sm transition-colors flex items-center gap-2 border-2 border-blue-600"
            >
              <Plus className="h-4 w-4" />
              Novo Imóvel
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <BauhausStatCard 
            label="Total de Imóveis" 
            value={properties.length}
            color="gray"
          />
          <BauhausStatCard 
            label="Ativos" 
            value={properties.filter((p: any) => p.status === 'active').length}
            color="green"
          />
          <BauhausStatCard 
            label="Vendidos" 
            value={properties.filter((p: any) => p.status === 'sold').length}
            color="red"
          />
          <BauhausStatCard 
            label="Alugados" 
            value={properties.filter((p: any) => p.status === 'rented').length}
            color="blue"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Buscar por título, cidade..."
              className="flex-1 min-w-[200px] px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 font-medium"
            />
            <select className="px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 bg-white font-semibold">
              <option value="">Todos os tipos</option>
              <option value="apartment">Apartamento</option>
              <option value="house">Casa</option>
              <option value="commercial">Comercial</option>
              <option value="land">Terreno</option>
              <option value="farm">Fazenda</option>
              <option value="penthouse">Cobertura</option>
            </select>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium">
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="sold">Vendido</option>
              <option value="rented">Alugado</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
          {properties.length === 0 ? (
            <div className="text-center py-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 mx-auto text-gray-400 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Nenhum imóvel cadastrado
              </h3>
              <p className="text-gray-700 mb-6 text-lg font-medium">
                Comece cadastrando seu primeiro imóvel
              </p>
              <Link
                href="/empresa/imoveis/novo"
                className="inline-block bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
              >
                Cadastrar Imóvel
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 border-b-2 border-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Imóvel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Visualizações
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-300">
                  {properties.map((property: any) => (
                    <tr key={property.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          {property.featured && (
                            <span className="mr-2 text-xl" title="Destaque">⭐</span>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 text-base">
                              {property.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {property.bedrooms} qtos • {property.bathrooms} banheiros
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-800">
                          {getPropertyTypeLabel(property.property_type)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-800">
                          {property.city}, {property.state}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm">
                          {property.transaction_type === 'sale' && property.price_sale > 0 && (
                            <p className="font-bold text-gray-900 text-base">
                              {formatPrice(property.price_sale)}
                            </p>
                          )}
                          {property.transaction_type === 'rent' && property.price_rent > 0 && (
                            <p className="font-bold text-gray-900 text-base">
                              {formatPrice(property.price_rent)}/mês
                            </p>
                          )}
                          {property.transaction_type === 'both' && (
                            <>
                              {property.price_sale > 0 && (
                                <p className="font-bold text-gray-900 text-base">
                                  {formatPrice(property.price_sale)}
                                </p>
                              )}
                              {property.price_rent > 0 && (
                                <p className="text-xs text-gray-600 font-medium">
                                  {formatPrice(property.price_rent)}/mês
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-full ${getStatusBadgeClass(
                            property.status
                          )}`}
                        >
                          {getStatusLabel(property.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-700">
                        {property.views_count || 0}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/empresa/imoveis/${property.id}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                          >
                            Editar
                          </Link>
                          <button className="text-red-600 hover:text-red-800 font-semibold hover:underline">
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
