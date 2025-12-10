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

interface Company { nome_fantasia: string; telefone?: string; email?: string; }
interface Template6Props { properties: Property[]; company: Company; }

export default function Template6({ properties, company }: Template6Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';
  
  const heights = ['h-80', 'h-96', 'h-72', 'h-88', 'h-64'];

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-900 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">{company.nome_fantasia}</h1>
          <p className="text-stone-400">Portfólio Arquitetônico</p>
        </div>
      </header>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-stone-900 mb-12 text-center">Coleção Masonry</h2>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {properties.map((property, idx) => (
              <Link href={`/imovel/${property.id}`} key={property.id}>
                <div className="break-inside-avoid bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 mb-6">
                  <div className={`relative ${heights[idx % heights.length]} overflow-hidden`}>
                    <Image src={getImageUrl(property)} alt={property.titulo} fill className="object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-stone-900 mb-3">{property.titulo}</h3>
                    <p className="text-stone-600 text-sm mb-4 flex items-center gap-2"><MapPin size={14} />{property.cidade}, {property.estado}</p>
                    <div className="flex gap-4 text-stone-500 text-sm mb-4">
                      {property.quartos > 0 && <div className="flex items-center gap-1"><Bed size={16} />{property.quartos}</div>}
                      {property.banheiros > 0 && <div className="flex items-center gap-1"><Bath size={16} />{property.banheiros}</div>}
                      {property.area_total > 0 && <div className="flex items-center gap-1"><Maximize size={16} />{property.area_total}m²</div>}
                    </div>
                    <p className="text-2xl font-bold text-stone-900">{formatPrice(property.preco)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-stone-900 text-stone-400 py-6 text-center">
        <p>© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}