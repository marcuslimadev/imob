'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, Heart } from 'lucide-react';

interface Property {
  id: string;
  titulo: string;
  cidade: string;
  estado: string;
  quartos: number;
  banheiros: number;
  area_total: number;
  preco: number;
  property_media?: Array<{ directus_files_id: { id: string } }>;
}

interface Company { nome_fantasia: string; }
interface Template10Props { properties: Property[]; company: Company; }

export default function Template10({ properties, company }: Template10Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* App-like Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              {company.nome_fantasia}
            </h1>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {properties.length} disponíveis
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cards Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link href={`/imovel/${property.id}`} key={property.id}>
              <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Imagem com Badge */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={getImageUrl(property)}
                    alt={property.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition">
                      <Heart size={18} className="text-pink-500" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {property.titulo}
                  </h3>
                  
                  <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                    <MapPin size={14} className="text-indigo-500" />
                    {property.cidade}, {property.estado}
                  </p>

                  {/* Especificações em Pills */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {property.quartos > 0 && (
                      <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Bed size={12} />
                        {property.quartos} quartos
                      </div>
                    )}
                    {property.banheiros > 0 && (
                      <div className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Bath size={12} />
                        {property.banheiros} banheiros
                      </div>
                    )}
                    {property.area_total > 0 && (
                      <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Maximize size={12} />
                        {property.area_total}m²
                      </div>
                    )}
                  </div>

                  {/* Preço com Gradiente */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                      {formatPrice(property.preco)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer App-style */}
      <footer className="bg-white/80 backdrop-blur-xl py-6 mt-12 text-center border-t border-gray-200">
        <p className="text-gray-600">© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}