import { directusServer } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';
import Link from 'next/link';
import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  transaction_type: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  area_total: number;
  price_sale: number;
  price_rent: number;
  featured: boolean;
}

async function getFeaturedProperties(): Promise<Property[]> {
  try {
    // @ts-ignore - Using custom schema
    const properties = await directusServer.request(
      readItems('properties', {
        limit: 12,
        fields: ['*']
      })
    );
    return properties as any as Property[];
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0
  }).format(price);
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

export default async function VitrineHomePage() {
  const properties = await getFeaturedProperties();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">
              Encontre o Imóvel dos Seus Sonhos
            </h1>
            <p className="text-xl mb-8">
              As melhores opções de imóveis para venda e locação
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <form className="flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar por cidade, bairro ou código..."
                  className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition-colors"
                >
                  Buscar
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md whitespace-nowrap">
              Todos
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 whitespace-nowrap">
              Apartamentos
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 whitespace-nowrap">
              Casas
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 whitespace-nowrap">
              Comercial
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 whitespace-nowrap">
              Terrenos
            </button>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Imóveis em Destaque</h2>
          <p className="text-gray-600">
            Confira nossa seleção especial de propriedades
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhum imóvel disponível no momento
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/imoveis/${property.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Property Image Placeholder */}
                <div className="relative h-48 bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                    </svg>
                  </div>
                  {property.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      Destaque
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase">
                      {getPropertyTypeLabel(property.property_type)}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {property.city}, {property.state}
                  </p>

                  {/* Price */}
                  <div className="mb-3">
                    {property.transaction_type === 'sale' && property.price_sale > 0 && (
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(property.price_sale)}
                      </p>
                    )}
                    {property.transaction_type === 'rent' && property.price_rent > 0 && (
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(property.price_rent)}
                        <span className="text-sm font-normal text-gray-500">/mês</span>
                      </p>
                    )}
                    {property.transaction_type === 'both' && (
                      <div>
                        {property.price_sale > 0 && (
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(property.price_sale)}
                          </p>
                        )}
                        {property.price_rent > 0 && (
                          <p className="text-sm text-gray-600">
                            ou {formatPrice(property.price_rent)}/mês
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {property.bedrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
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
                        {property.bedrooms} quartos
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                          />
                        </svg>
                        {property.bathrooms} banheiros
                      </div>
                    )}
                    {property.area_total > 0 && (
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                          />
                        </svg>
                        {property.area_total}m²
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
