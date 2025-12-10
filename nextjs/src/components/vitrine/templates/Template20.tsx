'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, Play } from 'lucide-react';

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
interface Template20Props { properties: Property[]; company: Company; }

export default function Template20({ properties, company }: Template20Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero com Video Background (Simulado) */}
      <section className="relative h-screen overflow-hidden">
        {/* Simulação de Vídeo - substituir por <video> tag com src em produção */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 animate-gradient"></div>
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Ícone de Play para indicar vídeo */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
          <Play size={120} className="text-white" fill="white" />
        </div>

        {/* Conteúdo Hero */}
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {company.nome_fantasia}
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-8 font-light">
              Encontre o Imóvel dos Seus Sonhos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#imoveis" className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition">
                Ver Imóveis
              </a>
              {company.telefone && (
                <a href={`tel:${company.telefone}`} className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition">
                  {company.telefone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full p-1">
            <div className="w-1.5 h-3 bg-white/50 rounded-full mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Grid de Imóveis */}
      <section id="imoveis" className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Imóveis Disponíveis</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <Link href={`/imovel/${property.id}`} key={property.id}>
                <div className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={getImageUrl(property)}
                      alt={property.titulo}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">
                      {property.titulo}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4 flex items-center gap-2">
                      <MapPin size={14} className="text-purple-400" />
                      {property.cidade}, {property.estado}
                    </p>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {property.descricao}
                    </p>

                    <div className="flex gap-4 text-gray-400 text-sm mb-6">
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

                    <div className="pt-4 border-t border-gray-800">
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {formatPrice(property.preco)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 text-center text-gray-400 border-t border-gray-800">
        <p>© 2025 {company.nome_fantasia}</p>
        {company.email && <p className="text-sm mt-2">{company.email}</p>}
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </div>
  );
}