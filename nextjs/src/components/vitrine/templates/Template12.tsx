'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';

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
interface Template12Props { properties: Property[]; company: Company; }

export default function Template12({ properties, company }: Template12Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-rose-50">
      {/* Header Arejado */}
      <header className="py-12 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-light text-gray-800 mb-2 tracking-wide">
            {company.nome_fantasia}
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto"></div>
        </div>
      </header>

      {/* Grid Espaçoso */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {properties.map((property) => (
            <Link href={`/imovel/${property.id}`} key={property.id}>
              <div className="group">
                {/* Imagem com Bordas Suaves */}
                <div className="relative h-80 mb-6 overflow-hidden rounded-lg">
                  <Image
                    src={getImageUrl(property)}
                    alt={property.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Conteúdo Minimalista */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-light text-gray-800">
                    {property.titulo}
                  </h3>
                  
                  <p className="text-gray-500 flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-rose-400" />
                    {property.cidade}, {property.estado}
                  </p>

                  {/* Especificações com Espaçamento */}
                  <div className="flex gap-6 text-gray-600 text-sm">
                    {property.quartos > 0 && (
                      <div className="flex items-center gap-2">
                        <Bed size={18} className="text-blue-400" />
                        <span className="font-light">{property.quartos} quartos</span>
                      </div>
                    )}
                    {property.banheiros > 0 && (
                      <div className="flex items-center gap-2">
                        <Bath size={18} className="text-rose-400" />
                        <span className="font-light">{property.banheiros} banheiros</span>
                      </div>
                    )}
                  </div>

                  {property.area_total > 0 && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Maximize size={18} className="text-indigo-400" />
                      <span className="font-light">{property.area_total}m²</span>
                    </div>
                  )}

                  {/* Preço Elegante */}
                  <p className="text-3xl font-light text-gray-800 pt-4">
                    {formatPrice(property.preco)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer Sutil */}
      <footer className="py-12 text-center text-gray-400 font-light">
        <p>© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}