'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, ChevronRight } from 'lucide-react';

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
interface Template14Props { properties: Property[]; company: Company; }

export default function Template14({ properties, company }: Template14Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  const hero = properties[0];
  const carousel = properties.slice(1);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <h1 className="text-3xl font-bold text-slate-900">{company.nome_fantasia}</h1>
        </div>
      </header>

      {/* Hero Property */}
      {hero && (
        <section className="bg-white">
          <div className="container mx-auto">
            <Link href={`/imovel/${hero.id}`}>
              <div className="group relative h-[600px] overflow-hidden">
                <Image
                  src={getImageUrl(hero)}
                  alt={hero.titulo}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Overlay com Informações */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                    <div className="container mx-auto max-w-4xl">
                      <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold mb-4">
                        Propriedade em Destaque
                      </div>
                      <h2 className="text-5xl font-bold mb-4">{hero.titulo}</h2>
                      <p className="text-xl mb-6 flex items-center gap-2">
                        <MapPin size={20} />
                        {hero.cidade}, {hero.estado}
                      </p>
                      <p className="text-lg mb-6 line-clamp-2 max-w-2xl">{hero.descricao}</p>
                      
                      <div className="flex gap-8 mb-6 text-lg">
                        {hero.quartos > 0 && <div className="flex items-center gap-2"><Bed size={20} />{hero.quartos} quartos</div>}
                        {hero.banheiros > 0 && <div className="flex items-center gap-2"><Bath size={20} />{hero.banheiros} banheiros</div>}
                        {hero.area_total > 0 && <div className="flex items-center gap-2"><Maximize size={20} />{hero.area_total}m²</div>}
                      </div>

                      <p className="text-4xl font-bold">{formatPrice(hero.preco)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Horizontal Scroll Carousel */}
      <section className="py-12 bg-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-900">Mais Imóveis</h2>
            <div className="text-slate-500 flex items-center gap-2">
              Role para ver mais <ChevronRight size={20} />
            </div>
          </div>
          
          <div className="overflow-x-auto pb-4 -mx-6 px-6">
            <div className="flex gap-6" style={{ width: 'max-content' }}>
              {carousel.map((property) => (
                <Link href={`/imovel/${property.id}`} key={property.id}>
                  <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow w-80">
                    <div className="relative h-56 overflow-hidden rounded-t-xl">
                      <Image
                        src={getImageUrl(property)}
                        alt={property.titulo}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                        {property.titulo}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 flex items-center gap-1">
                        <MapPin size={14} />
                        {property.cidade}, {property.estado}
                      </p>
                      <div className="flex gap-4 text-slate-500 text-xs mb-4">
                        {property.quartos > 0 && <div className="flex items-center gap-1"><Bed size={14} />{property.quartos}</div>}
                        {property.banheiros > 0 && <div className="flex items-center gap-1"><Bath size={14} />{property.banheiros}</div>}
                        {property.area_total > 0 && <div className="flex items-center gap-1"><Maximize size={14} />{property.area_total}m²</div>}
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{formatPrice(property.preco)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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