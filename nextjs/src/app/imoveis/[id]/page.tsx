import { directusServer } from '@/lib/directus/client';
import { readItems, readItem } from '@directus/sdk';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

async function getProperty(id: string) {
  try {
    // @ts-ignore - Using custom schema
    return await directusServer.request(
      readItem('properties', id, {
        fields: ['*']
      })
    );
  } catch (error) {
    return null;
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

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  // @ts-ignore - Using custom schema with properties table
  const prop: any = property;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/vitrine"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar para listagem
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery Placeholder */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-96 bg-gray-200 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-32 w-32 text-gray-400"
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
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <span className="text-sm font-semibold text-blue-600 uppercase">
                  {getPropertyTypeLabel(prop.property_type)}
                </span>
              </div>

              <h1 className="text-3xl font-bold mb-4">{prop.title}</h1>

              <div className="flex items-center gap-2 text-gray-600 mb-6">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>
                  {property.address && `${property.address}, `}
                  {property.neighborhood && `${property.neighborhood}, `}
                  {property.city}, {property.state}
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                {property.transaction_type === 'sale' && property.price_sale > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Valor de Venda</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {formatPrice(property.price_sale)}
                    </p>
                  </div>
                )}
                {property.transaction_type === 'rent' && property.price_rent > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Valor do Aluguel</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {formatPrice(property.price_rent)}
                      <span className="text-lg font-normal text-gray-500">/mês</span>
                    </p>
                    {property.price_condo > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        + Condomínio: {formatPrice(property.price_condo)}
                      </p>
                    )}
                    {property.price_iptu > 0 && (
                      <p className="text-sm text-gray-600">
                        + IPTU: {formatPrice(property.price_iptu)}
                      </p>
                    )}
                  </div>
                )}
                {property.transaction_type === 'both' && (
                  <div className="space-y-3">
                    {property.price_sale > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Venda</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {formatPrice(property.price_sale)}
                        </p>
                      </div>
                    )}
                    {property.price_rent > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Aluguel</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(property.price_rent)}/mês
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.bedrooms > 0 && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                    <p className="text-sm text-gray-600">Quartos</p>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                    <p className="text-sm text-gray-600">Banheiros</p>
                  </div>
                )}
                {property.suites > 0 && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{property.suites}</p>
                    <p className="text-sm text-gray-600">Suítes</p>
                  </div>
                )}
                {property.parking_spaces > 0 && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{property.parking_spaces}</p>
                    <p className="text-sm text-gray-600">Vagas</p>
                  </div>
                )}
                {property.area_total > 0 && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{property.area_total}</p>
                    <p className="text-sm text-gray-600">m² Total</p>
                  </div>
                )}
                {property.area_built > 0 && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{property.area_built}</p>
                    <p className="text-sm text-gray-600">m² Construída</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Descrição</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Interessado?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Preencha o formulário abaixo e entraremos em contato
              </p>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Gostaria de mais informações sobre este imóvel..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors"
                >
                  Enviar Mensagem
                </button>
              </form>

              {/* Company Info */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 mb-2">Anunciado por:</p>
                <p className="font-semibold text-gray-900">
                  {property.company_id?.name || 'Imobiliária'}
                </p>
                {property.company_id?.phone && (
                  <p className="text-sm text-gray-600 mt-1">
                    {property.company_id.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
