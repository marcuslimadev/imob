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

interface Company { nome_fantasia: string; telefone?: string; email?: string; }
interface Template8Props { properties: Property[]; company: Company; }

export default function Template8({ properties, company }: Template8Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{company.nome_fantasia}</h1>
          <div className="text-zinc-400 text-sm">{properties.length} imóveis</div>
        </div>
      </header>

      <div className="pt-16">
        {properties.map((property, idx) => (
          <Link href={`/imovel/${property.id}`} key={property.id}>
            <div className="group">
              <div className={`grid md:grid-cols-2 min-h-screen ${idx % 2 === 0 ? '' : 'md:grid-flow-dense'}`}>
                {/* Imagem */}
                <div className={`relative ${idx % 2 === 0 ? 'md:col-start-1' : 'md:col-start-2'}`}>
                  <Image src={getImageUrl(property)} alt={property.titulo} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/50 to-transparent"></div>
                </div>

                {/* Conteúdo */}
                <div className={`flex items-center justify-center p-12 md:p-20 bg-zinc-950 ${idx % 2 === 0 ? 'md:col-start-2' : 'md:col-start-1'}`}>
                  <div className="max-w-lg">
                    <div className="text-zinc-500 uppercase tracking-widest text-xs mb-4">Imóvel #{idx + 1}</div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{property.titulo}</h2>
                    <p className="text-zinc-400 mb-6 flex items-center gap-2">
                      <MapPin size={18} />
                      {property.cidade}, {property.estado}
                    </p>
                    <p className="text-zinc-300 mb-8 line-clamp-4">{property.descricao}</p>
                    
                    <div className="flex gap-8 text-zinc-400 mb-8">
                      {property.quartos > 0 && <div className="flex items-center gap-2"><Bed size={20} /><span>{property.quartos}</span></div>}
                      {property.banheiros > 0 && <div className="flex items-center gap-2"><Bath size={20} /><span>{property.banheiros}</span></div>}
                      {property.area_total > 0 && <div className="flex items-center gap-2"><Maximize size={20} /><span>{property.area_total}m²</span></div>}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-4xl font-bold">{formatPrice(property.preco)}</p>
                      <ChevronRight size={32} className="text-zinc-600 group-hover:text-white group-hover:translate-x-2 transition" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <footer className="bg-zinc-900 py-8 text-center text-zinc-500">
        <p>© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}