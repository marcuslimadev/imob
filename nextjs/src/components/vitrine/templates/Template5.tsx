'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Crown, Bed, Bath, Maximize, MapPin } from 'lucide-react';

interface Property {
  id: string;
  titulo: string;
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
interface Template5Props { properties: Property[]; company: Company; }

export default function Template5({ properties, company }: Template5Props) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(price);

  const getImageUrl = (property: Property) =>
    property.property_media?.[0]
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${property.property_media[0].directus_files_id.id}`
      : '/placeholder-property.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="bg-gradient-to-r from-amber-900 to-amber-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 justify-center">
            <Crown className="w-12 h-12 text-amber-300" />
            <h1 className="text-4xl font-serif">{company.nome_fantasia}</h1>
          </div>
          <p className="text-center text-amber-100 mt-2 font-light">Imóveis de Alto Padrão</p>
        </div>
      </header>

      <section className="py-16 text-center">
        <h2 className="text-5xl font-serif text-amber-900 mb-4">Coleção Exclusiva</h2>
        <p className="text-amber-700 text-lg">Propriedades selecionadas para clientes exigentes</p>
      </section>

      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-12">
            {properties.map((property) => (
              <Link href={`/imovel/${property.id}`} key={property.id}>
                <div className="group bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-96">
                      <Image src={getImageUrl(property)} alt={property.titulo} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      {property.destaque && (
                        <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                          <Crown size={18} /> DESTAQUE
                        </div>
                      )}
                    </div>
                    <div className="p-10 flex flex-col justify-center">
                      <h3 className="text-3xl font-serif text-amber-900 mb-4">{property.titulo}</h3>
                      <p className="text-amber-700 mb-6 flex items-center gap-2">
                        <MapPin size={20} />
                        {property.cidade}, {property.estado}
                      </p>
                      <div className="flex gap-6 text-amber-600 mb-6">
                        {property.quartos > 0 && <div className="flex items-center gap-2"><Bed size={20} /><span className="font-medium">{property.quartos} quartos</span></div>}
                        {property.banheiros > 0 && <div className="flex items-center gap-2"><Bath size={20} /><span className="font-medium">{property.banheiros} banheiros</span></div>}
                        {property.area_total > 0 && <div className="flex items-center gap-2"><Maximize size={20} /><span className="font-medium">{property.area_total}m²</span></div>}
                      </div>
                      <p className="text-4xl font-serif text-amber-900">{formatPrice(property.preco)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-amber-900 to-amber-700 text-amber-100 py-10 text-center">
        <p className="font-serif text-lg">© 2025 {company.nome_fantasia}</p>
        <p className="text-amber-200 text-sm mt-2">Excelência em Imóveis de Luxo</p>
      </footer>
    </div>
  );
}