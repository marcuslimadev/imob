'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, Navigation } from 'lucide-react';

interface Property {
  id: string;
  titulo: string;
  cidade: string;
  estado: string;
  bairro: string;
  quartos: number;
  banheiros: number;
  area_total: number;
  preco: number;
  property_media?: Array<{ directus_files_id: { id: string } }>;
}

interface Company { nome_fantasia: string; }
interface Template17Props { properties: Property[]; company: Company; }

export default function Template17({ properties, company }: Template17Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  return (
    <div className="h-screen flex flex-col">
      {/* Header Fixo */}
      <header className="bg-white shadow-md z-30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{company.nome_fantasia}</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Navigation size={20} />
            <span className="text-sm">Localização no Mapa</span>
          </div>
        </div>
      </header>

      {/* Layout Split: Mapa + Lista */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mapa (Placeholder - integrar Google Maps API) */}
        <div className="w-1/2 bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
            <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
              <MapPin size={48} className="mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visualização de Mapa</h3>
              <p className="text-gray-600 mb-4">Integração com Google Maps</p>
              <div className="text-sm text-gray-500">
                {properties.length} imóveis mapeados
              </div>
            </div>
          </div>
          {/* TODO: Integrar <GoogleMap> com marcadores por propriedade */}
        </div>

        {/* Lista Lateral com Scroll */}
        <div className="w-1/2 overflow-y-auto bg-white">
          <div className="p-6 space-y-4">
            {properties.map((property) => (
              <Link href={`/imovel/${property.id}`} key={property.id}>
                <div className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-32 h-32 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={getImageUrl(property)}
                        alt={property.titulo}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                        {property.titulo}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
                        <MapPin size={14} className="text-blue-600" />
                        {property.bairro && `${property.bairro}, `}{property.cidade} - {property.estado}
                      </p>

                      <div className="flex gap-4 text-gray-600 text-sm mb-3">
                        {property.quartos > 0 && (
                          <div className="flex items-center gap-1">
                            <Bed size={14} />
                            {property.quartos}
                          </div>
                        )}
                        {property.banheiros > 0 && (
                          <div className="flex items-center gap-1">
                            <Bath size={14} />
                            {property.banheiros}
                          </div>
                        )}
                        {property.area_total > 0 && (
                          <div className="flex items-center gap-1">
                            <Maximize size={14} />
                            {property.area_total}m²
                          </div>
                        )}
                      </div>

                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(property.preco)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}