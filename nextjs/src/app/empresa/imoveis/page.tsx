import { directusServer } from '@/lib/directus/client';
import { readItems, createItem } from '@directus/sdk';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getCompanyProperties(companyId: string) {
  try {
    return await directusServer.request(
      readItems('properties', {
        filter: {
          company_id: { _eq: companyId }
        },
        sort: ['-created_at'],
        fields: [
          'id',
          'title',
          'property_type',
          'transaction_type',
          'city',
          'state',
          'bedrooms',
          'bathrooms',
          'price_sale',
          'price_rent',
          'status',
          'featured',
          'views_count',
          'created_at'
        ]
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
    active: 'bg-green-100 text-green-700',
    sold: 'bg-red-100 text-red-700',
    rented: 'bg-blue-100 text-blue-700',
    inactive: 'bg-gray-100 text-gray-700'
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
  // TODO: Get company_id from authenticated user session
  // For now, using a hardcoded company_id for demonstration
  const companyId = '1'; // This should come from auth session
  
  const properties = await getCompanyProperties(companyId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Meus Imóveis</h1>
              <p className="text-gray-600">
                Gerencie todos os imóveis da sua imobiliária
              </p>
            </div>
            <Link
              href="/empresa/imoveis/novo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Novo Imóvel
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Total de Imóveis</p>
            <p className="text-2xl font-bold">{properties.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Ativos</p>
            <p className="text-2xl font-bold text-green-600">
              {properties.filter((p: any) => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Vendidos</p>
            <p className="text-2xl font-bold text-red-600">
              {properties.filter((p: any) => p.status === 'sold').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Alugados</p>
            <p className="text-2xl font-bold text-blue-600">
              {properties.filter((p: any) => p.status === 'rented').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Buscar por título, cidade..."
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os tipos</option>
              <option value="apartment">Apartamento</option>
              <option value="house">Casa</option>
              <option value="commercial">Comercial</option>
              <option value="land">Terreno</option>
              <option value="farm">Fazenda</option>
              <option value="penthouse">Cobertura</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="sold">Vendido</option>
              <option value="rented">Alugado</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum imóvel cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece cadastrando seu primeiro imóvel
              </p>
              <Link
                href="/empresa/imoveis/novo"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition-colors"
              >
                Cadastrar Imóvel
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imóvel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visualizações
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property: any) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {property.featured && (
                            <span className="mr-2" title="Destaque">⭐</span>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {property.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {property.bedrooms} qtos • {property.bathrooms} banheiros
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {getPropertyTypeLabel(property.property_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {property.city}, {property.state}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {property.transaction_type === 'sale' && property.price_sale > 0 && (
                            <p className="font-medium text-gray-900">
                              {formatPrice(property.price_sale)}
                            </p>
                          )}
                          {property.transaction_type === 'rent' && property.price_rent > 0 && (
                            <p className="font-medium text-gray-900">
                              {formatPrice(property.price_rent)}/mês
                            </p>
                          )}
                          {property.transaction_type === 'both' && (
                            <>
                              {property.price_sale > 0 && (
                                <p className="font-medium text-gray-900">
                                  {formatPrice(property.price_sale)}
                                </p>
                              )}
                              {property.price_rent > 0 && (
                                <p className="text-xs text-gray-500">
                                  {formatPrice(property.price_rent)}/mês
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            property.status
                          )}`}
                        >
                          {getStatusLabel(property.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.views_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/empresa/imoveis/${property.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </Link>
                          <button className="text-red-600 hover:text-red-900">
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
