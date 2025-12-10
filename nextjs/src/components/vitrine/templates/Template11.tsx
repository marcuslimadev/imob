'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, TrendingUp } from 'lucide-react';

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

interface Company { nome_fantasia: string; telefone?: string; email?: string; }
interface Template11Props { properties: Property[]; company: Company; }

export default function Template11({ properties, company }: Template11Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Gradient Overlay Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20 pointer-events-none"></div>
      
      {/* Header com Glow */}
      <header className="relative z-10 border-b border-purple-500/30 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            {company.nome_fantasia}
          </h1>
          <p className="text-purple-300 mt-2">Experiência Premium</p>
        </div>
      </header>

      {/* Grid de Propriedades */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <Link href={`/imovel/${property.id}`} key={property.id}>
              <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50">
                {/* Badge Destaque com Glow */}
                {property.destaque && (
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg shadow-purple-500/50">
                      <TrendingUp className="inline mr-1" size={12} />
                      DESTAQUE
                    </div>
                  </div>
                )}

                {/* Imagem com Overlay Gradient */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={getImageUrl(property)}
                    alt={property.titulo}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition">
                    {property.titulo}
                  </h3>
                  
                  <p className="text-purple-300 text-sm mb-4 flex items-center gap-2">
                    <MapPin size={14} className="text-cyan-400" />
                    {property.cidade}, {property.estado}
                  </p>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{property.descricao}</p>

                  {/* Especificações com Neon */}
                  <div className="flex gap-4 text-gray-300 text-sm mb-6">
                    {property.quartos > 0 && (
                      <div className="flex items-center gap-1.5 bg-purple-900/30 px-3 py-1.5 rounded-lg border border-purple-500/20">
                        <Bed size={16} className="text-purple-400" />
                        {property.quartos}
                      </div>
                    )}
                    {property.banheiros > 0 && (
                      <div className="flex items-center gap-1.5 bg-pink-900/30 px-3 py-1.5 rounded-lg border border-pink-500/20">
                        <Bath size={16} className="text-pink-400" />
                        {property.banheiros}
                      </div>
                    )}
                    {property.area_total > 0 && (
                      <div className="flex items-center gap-1.5 bg-cyan-900/30 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                        <Maximize size={16} className="text-cyan-400" />
                        {property.area_total}m²
                      </div>
                    )}
                  </div>

                  {/* Preço com Glow */}
                  <div className="pt-4 border-t border-purple-500/20">
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      {formatPrice(property.preco)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/30 bg-black/50 backdrop-blur-xl py-8 text-center text-purple-300">
        <p>© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}