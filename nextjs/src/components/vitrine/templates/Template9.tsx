'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye } from 'lucide-react';

interface Property {
  id: string;
  titulo: string;
  cidade: string;
  estado: string;
  preco: number;
  property_media?: Array<{ directus_files_id: { id: string } }>;
}

interface Company { nome_fantasia: string; }
interface Template9Props { properties: Property[]; company: Company; }

export default function Template9({ properties, company }: Template9Props) {
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="bg-neutral-900 py-6 sticky top-0 z-40 backdrop-blur-lg bg-opacity-90">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white text-center">{company.nome_fantasia}</h1>
          <p className="text-neutral-400 text-center mt-1">Galeria Visual</p>
        </div>
      </header>

      <section className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {properties.map((property) => (
            <Link href={`/imovel/${property.id}`} key={property.id}>
              <div className="group relative aspect-square overflow-hidden">
                <Image
                  src={getImageUrl(property)}
                  alt={property.titulo}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay com Informações */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-sm mb-1 line-clamp-1">{property.titulo}</h3>
                    <p className="text-xs text-neutral-300 mb-2">{property.cidade}, {property.estado}</p>
                    <p className="text-lg font-bold">{formatPrice(property.preco)}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <Eye className="text-white" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="bg-neutral-900 py-6 text-center text-neutral-500 mt-8">
        <p>© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}