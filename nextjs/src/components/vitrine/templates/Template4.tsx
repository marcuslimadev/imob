'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Building2, Bed, Bath, Maximize } from 'lucide-react';

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

interface Company { nome_fantasia: string; telefone?: string; email?: string; }
interface Template4Props { properties: Property[]; company: Company; }

export default function Template4({ properties, company }: Template4Props) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(price);

  const getImageUrl = (property: Property) =>
    property.property_media?.[0]
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${property.property_media[0].directus_files_id.id}`
      : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold">{company.nome_fantasia}</h1>
                <p className="text-blue-200 text-sm">Soluções Imobiliárias Corporativas</p>
              </div>
            </div>
            <div className="text-right text-sm">
              {company.telefone && <p>{company.telefone}</p>}
              {company.email && <p className="text-blue-200">{company.email}</p>}
            </div>
          </div>
        </div>
      </header>

      <section className="py-12 bg-blue-800 text-white text-center">
        <h2 className="text-4xl font-bold mb-4">Portfólio Imobiliário</h2>
        <p className="text-blue-100">{properties.length} imóveis comerciais e residenciais</p>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link href={`/imovel/${property.id}`} key={property.id}>
                <div className="bg-white shadow-lg hover:shadow-xl transition">
                  <div className="relative h-56">
                    <Image src={getImageUrl(property)} alt={property.titulo} fill className="object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{property.titulo}</h3>
                    <p className="text-gray-600 text-sm mb-3">{property.cidade}, {property.estado}</p>
                    <div className="flex gap-4 text-gray-500 text-sm mb-3">
                      {property.quartos > 0 && <div className="flex items-center gap-1"><Bed size={16} />{property.quartos}</div>}
                      {property.banheiros > 0 && <div className="flex items-center gap-1"><Bath size={16} />{property.banheiros}</div>}
                      {property.area_total > 0 && <div className="flex items-center gap-1"><Maximize size={16} />{property.area_total}m²</div>}
                    </div>
                    <p className="text-xl font-bold text-blue-900">{formatPrice(property.preco)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-blue-900 text-white py-6 text-center">
        <p>© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}