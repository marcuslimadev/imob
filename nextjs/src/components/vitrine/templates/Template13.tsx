'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, ArrowUpRight } from 'lucide-react';

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
interface Template13Props { properties: Property[]; company: Company; }

export default function Template13({ properties, company }: Template13Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-yellow-400">
      {/* Header Impactante */}
      <header className="bg-black text-yellow-400 py-8">
        <div className="container mx-auto px-6">
          <h1 className="text-7xl font-black uppercase tracking-tighter">
            {company.nome_fantasia}
          </h1>
        </div>
      </header>

      {/* Grid com Contraste */}
      <section className="container mx-auto px-6 py-12">
        <div className="space-y-8">
          {properties.map((property, idx) => (
            <Link href={`/imovel/${property.id}`} key={property.id}>
              <div className="group bg-black text-white hover:bg-yellow-400 hover:text-black transition-colors duration-300">
                <div className={`grid md:grid-cols-2 ${idx % 2 === 0 ? '' : 'md:grid-flow-dense'}`}>
                  {/* Imagem */}
                  <div className={`relative h-96 ${idx % 2 === 0 ? 'md:col-start-1' : 'md:col-start-2'}`}>
                    <Image
                      src={getImageUrl(property)}
                      alt={property.titulo}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>

                  {/* Conteúdo */}
                  <div className={`flex items-center p-12 ${idx % 2 === 0 ? 'md:col-start-2' : 'md:col-start-1'}`}>
                    <div className="w-full">
                      <div className="text-xs font-black uppercase tracking-widest mb-4 opacity-60">
                        Imóvel #{idx + 1}
                      </div>
                      
                      <h2 className="text-5xl md:text-6xl font-black uppercase mb-6 leading-none">
                        {property.titulo}
                      </h2>

                      <p className="text-lg font-bold uppercase mb-8">
                        {property.cidade}, {property.estado}
                      </p>

                      {/* Especificações */}
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {property.quartos > 0 && (
                          <div>
                            <Bed size={24} className="mb-2" />
                            <div className="text-3xl font-black">{property.quartos}</div>
                            <div className="text-xs uppercase font-bold opacity-60">Quartos</div>
                          </div>
                        )}
                        {property.banheiros > 0 && (
                          <div>
                            <Bath size={24} className="mb-2" />
                            <div className="text-3xl font-black">{property.banheiros}</div>
                            <div className="text-xs uppercase font-bold opacity-60">Banheiros</div>
                          </div>
                        )}
                        {property.area_total > 0 && (
                          <div>
                            <Maximize size={24} className="mb-2" />
                            <div className="text-3xl font-black">{property.area_total}</div>
                            <div className="text-xs uppercase font-bold opacity-60">m²</div>
                          </div>
                        )}
                      </div>

                      {/* Preço e Ação */}
                      <div className="flex items-center justify-between">
                        <div className="text-4xl font-black">
                          {formatPrice(property.preco)}
                        </div>
                        <ArrowUpRight size={40} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-yellow-400 py-6 text-center font-black uppercase text-sm tracking-widest">
        <p>© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}