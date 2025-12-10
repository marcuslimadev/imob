'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';

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
  telefone?: string;
  email?: string;
}

interface Template1Props {
  properties: Property[];
  company: Company;
}

export default function Template1({ properties, company }: Template1Props) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(price);

  const getImageUrl = (property: Property) =>
    property.property_media?.[0]
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${property.property_media[0].directus_files_id.id}`
      : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simples */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{company.nome_fantasia}</h1>
          <div className="flex gap-4 text-sm text-gray-600">
            {company.telefone && <a href={`tel:${company.telefone}`} className="hover:text-gray-900">{company.telefone}</a>}
            {company.email && <a href={`mailto:${company.email}`} className="hover:text-gray-900">{company.email}</a>}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Encontre seu Imóvel Ideal</h2>
          <p className="text-xl text-blue-100">{properties.length} imóveis disponíveis</p>
        </div>
      </section>

      {/* Grid de Imóveis */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link href={`/imovel/${property.id}`} key={property.id}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={getImageUrl(property)}
                      alt={property.titulo}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.titulo}</h3>
                    <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
                      <MapPin size={14} />
                      {property.cidade}, {property.estado}
                    </p>
                    <div className="flex items-center gap-4 text-gray-500 text-sm mb-3">
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
                    <p className="text-xl font-bold text-blue-600">{formatPrice(property.preco)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum imóvel encontrado.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 {company.nome_fantasia}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
