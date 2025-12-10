'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';

interface Property {
  id: string;
  titulo: string;
  descricao: string;
  cidade: string;
  estado: string;
  quartos: number;
  banheiros: number;
  area_total: number;
  preco: number;
  property_media?: Array<{ directus_files_id: { id: string } }>;
}

interface Company { nome_fantasia: string; }
interface Template18Props { properties: Property[]; company: Company; }

export default function Template18({ properties, company }: Template18Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="container mx-auto px-6 py-5">
          <h1 className="text-3xl font-bold text-slate-900">{company.nome_fantasia}</h1>
          <p className="text-slate-600">Linha do Tempo de Imóveis</p>
        </div>
      </header>

      {/* Timeline Vertical */}
      <section className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="relative">
          {/* Linha Vertical Central */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 transform -translate-x-1/2"></div>

          {/* Itens da Timeline */}
          <div className="space-y-12">
            {properties.map((property, idx) => (
              <div key={property.id} className={`relative flex items-center ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Marcador Central */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-6 h-6 bg-white border-4 border-blue-600 rounded-full shadow-lg"></div>
                </div>

                {/* Card do Imóvel */}
                <Link href={`/imovel/${property.id}`} className={`w-[calc(50%-3rem)] ${idx % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}>
                  <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="relative h-56 overflow-hidden rounded-t-xl">
                      <Image
                        src={getImageUrl(property)}
                        alt={property.titulo}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-slate-900">
                        #{idx + 1}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition">
                        {property.titulo}
                      </h3>
                      
                      <p className="text-slate-600 text-sm mb-4 flex items-center gap-2">
                        <MapPin size={14} className="text-blue-600" />
                        {property.cidade}, {property.estado}
                      </p>

                      <p className="text-slate-700 text-sm mb-4 line-clamp-2">
                        {property.descricao}
                      </p>

                      <div className="flex gap-4 text-slate-600 text-sm mb-4">
                        {property.quartos > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Bed size={16} />
                            {property.quartos}
                          </div>
                        )}
                        {property.banheiros > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Bath size={16} />
                            {property.banheiros}
                          </div>
                        )}
                        {property.area_total > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Maximize size={16} />
                            {property.area_total}m²
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-2xl font-bold text-slate-900">
                          {formatPrice(property.preco)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 text-center text-slate-600 border-t">
        <p>© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}