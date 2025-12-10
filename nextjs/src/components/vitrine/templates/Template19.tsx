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

interface Company { nome_fantasia: string; }
interface Template19Props { properties: Property[]; company: Company; }

export default function Template19({ properties, company }: Template19Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-white">{company.nome_fantasia}</h1>
          <p className="text-purple-300">Experiência Tridimensional</p>
        </div>
      </header>

      {/* Grid 3D */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {properties.map((property, idx) => (
            <Link href={`/imovel/${property.id}`} key={property.id}>
              <div 
                className="group relative"
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div 
                  className="relative bg-gradient-to-br from-gray-800 to-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-purple-500/50"
                  style={{
                    transform: 'rotateX(5deg) rotateY(-5deg)',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotateX(5deg) rotateY(-5deg) scale(1)';
                  }}
                >
                  {/* Camada de Profundidade */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transform: 'translateZ(-50px)' }}></div>

                  {/* Imagem */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={getImageUrl(property)}
                      alt={property.titulo}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6 relative" style={{ transform: 'translateZ(20px)' }}>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {property.titulo}
                    </h3>
                    
                    <p className="text-purple-300 text-sm mb-4 flex items-center gap-2">
                      <MapPin size={14} />
                      {property.cidade}, {property.estado}
                    </p>

                    {/* Especificações com Glow */}
                    <div className="flex gap-4 text-gray-300 text-sm mb-6">
                      {property.quartos > 0 && (
                        <div className="flex items-center gap-1.5 bg-purple-900/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                          <Bed size={16} className="text-purple-400" />
                          {property.quartos}
                        </div>
                      )}
                      {property.banheiros > 0 && (
                        <div className="flex items-center gap-1.5 bg-pink-900/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                          <Bath size={16} className="text-pink-400" />
                          {property.banheiros}
                        </div>
                      )}
                      {property.area_total > 0 && (
                        <div className="flex items-center gap-1.5 bg-blue-900/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                          <Maximize size={16} className="text-blue-400" />
                          {property.area_total}m²
                        </div>
                      )}
                    </div>

                    {/* Preço com Efeito 3D */}
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
                      <div className="relative bg-black/50 backdrop-blur-sm px-4 py-3 rounded-lg">
                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {formatPrice(property.preco)}
                        </p>
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
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 py-8 text-center text-purple-300">
        <p>© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}