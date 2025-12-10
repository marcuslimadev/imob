'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, ArrowRight } from 'lucide-react';

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
  destaque: boolean;
  property_media?: Array<{ directus_files_id: { id: string } }>;
}

interface Company { nome_fantasia: string; }
interface Template7Props { properties: Property[]; company: Company; }

export default function Template7({ properties, company }: Template7Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';
  
  const featured = properties.find(p => p.destaque) || properties[0];
  const others = properties.filter(p => p.id !== featured?.id);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-4 border-black py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-black uppercase tracking-tight">{company.nome_fantasia}</h1>
          <p className="text-sm uppercase tracking-widest mt-1">Magazine Imobiliário</p>
        </div>
      </header>

      {/* Featured Hero */}
      {featured && (
        <section className="container mx-auto px-4 py-12">
          <Link href={`/imovel/${featured.id}`}>
            <div className="grid md:grid-cols-2 gap-0 border-4 border-black hover:bg-yellow-50 transition">
              <div className="relative h-96 md:h-auto">
                <Image src={getImageUrl(featured)} alt={featured.titulo} fill className="object-cover" />
              </div>
              <div className="p-12 flex flex-col justify-center">
                <div className="text-xs uppercase tracking-widest font-bold mb-4">Destaque da Semana</div>
                <h2 className="text-4xl font-black mb-4 leading-tight">{featured.titulo}</h2>
                <p className="text-gray-600 mb-6 line-clamp-3">{featured.descricao}</p>
                <div className="flex gap-6 text-sm mb-6">
                  <div><Bed className="inline mr-1" size={16} />{featured.quartos} quartos</div>
                  <div><Bath className="inline mr-1" size={16} />{featured.banheiros} banheiros</div>
                  <div><Maximize className="inline mr-1" size={16} />{featured.area_total}m²</div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-black">{formatPrice(featured.preco)}</p>
                  <ArrowRight size={32} className="text-black" />
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Grid de Outros */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {others.map((property) => (
            <Link href={`/imovel/${property.id}`} key={property.id}>
              <div className="border-4 border-black hover:bg-yellow-50 transition">
                <div className="relative h-64">
                  <Image src={getImageUrl(property)} alt={property.titulo} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black mb-2">{property.titulo}</h3>
                  <p className="text-sm text-gray-600 mb-4">{property.cidade}, {property.estado}</p>
                  <p className="text-2xl font-black">{formatPrice(property.preco)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t-4 border-black py-8 text-center">
        <p className="font-black uppercase">© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}