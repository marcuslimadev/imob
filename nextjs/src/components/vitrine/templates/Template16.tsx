'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, Calendar, TrendingUp } from 'lucide-react';

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
  property_media?: Array<{ directus_files_id: { id: string } }>;
}

interface Company { nome_fantasia: string; }
interface Template16Props { properties: Property[]; company: Company; }

export default function Template16({ properties, company }: Template16Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-5">
          <h1 className="text-3xl font-bold text-gray-900">{company.nome_fantasia}</h1>
          <p className="text-gray-600">Lista Completa de Imóveis</p>
        </div>
      </header>

      {/* List View */}
      <section className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {properties.map((property) => (
            <Link href={`/imovel/${property.id}`} key={property.id}>
              <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Imagem */}
                  <div className="relative h-64 md:h-auto md:col-span-1">
                    <Image
                      src={getImageUrl(property)}
                      alt={property.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {property.destaque && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">
                        DESTAQUE
                      </div>
                    )}
                  </div>

                  {/* Informações Principais */}
                  <div className="md:col-span-2 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                        {property.titulo}
                      </h3>
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {property.tipo}
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {property.finalidade}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600" />
                      {property.bairro && `${property.bairro}, `}{property.cidade} - {property.estado}
                    </p>

                    <p className="text-gray-700 mb-6 line-clamp-3">
                      {property.descricao}
                    </p>

                    {/* Grid de Especificações */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {property.quartos > 0 && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Bed size={18} className="text-gray-500" />
                          <div>
                            <div className="text-sm font-semibold">{property.quartos}</div>
                            <div className="text-xs text-gray-500">Quartos</div>
                          </div>
                        </div>
                      )}
                      {property.banheiros > 0 && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Bath size={18} className="text-gray-500" />
                          <div>
                            <div className="text-sm font-semibold">{property.banheiros}</div>
                            <div className="text-xs text-gray-500">Banheiros</div>
                          </div>
                        </div>
                      )}
                      {property.area_total > 0 && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Maximize size={18} className="text-gray-500" />
                          <div>
                            <div className="text-sm font-semibold">{property.area_total}m²</div>
                            <div className="text-xs text-gray-500">Área Total</div>
                          </div>
                        </div>
                      )}
                      {property.area_util > 0 && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <TrendingUp size={18} className="text-gray-500" />
                          <div>
                            <div className="text-sm font-semibold">{property.area_util}m²</div>
                            <div className="text-xs text-gray-500">Área Ütil</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preço e Ação */}
                  <div className="md:col-span-1 p-6 bg-gray-50 flex flex-col justify-center items-center text-center border-l">
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-1">Valor</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatPrice(property.preco)}
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full">
                      Ver Detalhes
                    </button>
                    <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} />
                      Publicado recentemente
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 text-center text-gray-600 border-t mt-12">
        <p>© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}