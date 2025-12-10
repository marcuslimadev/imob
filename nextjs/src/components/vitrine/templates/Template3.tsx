'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, Phone, Mail, Home } from 'lucide-react';

interface Property {
  id: string;
  titulo: string;
  tipo: string;
  cidade: string;
  estado: string;
  quartos: number;
  banheiros: number;
  area_total: number;
  preco: number;
  property_media?: Array<{ directus_files_id: { id: string } }>;
}

interface Company {
  nome_fantasia: string;
  logo_url?: string;
  telefone?: string;
  email?: string;
}

interface Template3Props {
  properties: Property[];
  company: Company;
}

export default function Template3({ properties, company }: Template3Props) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(price);

  const getImageUrl = (property: Property) =>
    property.property_media?.[0]
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${property.property_media[0].directus_files_id.id}`
      : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimalista */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-gray-900" />
            <h1 className="text-2xl font-light text-gray-900">{company.nome_fantasia}</h1>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            {company.telefone && <a href={`tel:${company.telefone}`}>{company.telefone}</a>}
            {company.email && <a href={`mailto:${company.email}`}>{company.email}</a>}
          </div>
        </div>
      </header>

      {/* Hero Minimalista */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-light text-gray-900 mb-4">Imóveis Selecionados</h2>
          <p className="text-gray-600">{properties.length} propriedades em destaque</p>
        </div>
      </section>

      {/* Grid Minimalista */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {properties.map((property) => (
              <Link href={`/imovel/${property.id}`} key={property.id}>
                <div className="group">
                  <div className="relative h-80 mb-4 overflow-hidden">
                    <Image
                      src={getImageUrl(property)}
                      alt={property.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-xl font-light text-gray-900 mb-2">{property.titulo}</h3>
                  <p className="text-gray-600 text-sm mb-3 flex items-center gap-2">
                    <MapPin size={14} />
                    {property.cidade}, {property.estado}
                  </p>
                  <div className="flex items-center gap-6 text-gray-500 text-sm mb-3">
                    {property.quartos > 0 && (
                      <div className="flex items-center gap-1">
                        <Bed size={16} />
                        {property.quartos}
                      </div>
                    )}
                    {property.banheiros > 0 && (
                      <div className="flex items-center gap-1">
                        <Bath size={16} />
                        {property.banheiros}
                      </div>
                    )}
                    {property.area_total > 0 && (
                      <div className="flex items-center gap-1">
                        <Maximize size={16} />
                        {property.area_total}m²
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-light text-gray-900">{formatPrice(property.preco)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 {company.nome_fantasia}
        </div>
      </footer>
    </div>
  );
}
