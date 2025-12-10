'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, Filter } from 'lucide-react';

interface Property {
  id: string;
  titulo: string;
  tipo: string;
  finalidade: string;
  cidade: string;
  estado: string;
  quartos: number;
  banheiros: number;
  area_total: number;
  preco: number;
  property_media?: Array<{ directus_files_id: { id: string } }>;
}

interface Company { nome_fantasia: string; }
interface Template15Props { properties: Property[]; company: Company; }

export default function Template15({ properties, company }: Template15Props) {
  const [selectedTipo, setSelectedTipo] = useState<string>('Todos');
  const [selectedFinalidade, setSelectedFinalidade] = useState<string>('Todas');

  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(p);
  const getImageUrl = (p: Property) => p.property_media?.[0] ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${p.property_media[0].directus_files_id.id}` : '/placeholder-property.jpg';

  const tipos = ['Todos', ...Array.from(new Set(properties.map(p => p.tipo)))];
  const finalidades = ['Todas', ...Array.from(new Set(properties.map(p => p.finalidade)))];

  const filtered = properties.filter(p => {
    const matchTipo = selectedTipo === 'Todos' || p.tipo === selectedTipo;
    const matchFinalidade = selectedFinalidade === 'Todas' || p.finalidade === selectedFinalidade;
    return matchTipo && matchFinalidade;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">{company.nome_fantasia}</h1>
        </div>
      </header>

      {/* Filtros Interativos */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-2 mb-4 text-gray-700">
            <Filter size={20} />
            <span className="font-semibold">Filtrar por:</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* Filtro Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <div className="flex flex-wrap gap-2">
                {tipos.map(tipo => (
                  <button
                    key={tipo}
                    onClick={() => setSelectedTipo(tipo)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedTipo === tipo
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro Finalidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Finalidade</label>
              <div className="flex flex-wrap gap-2">
                {finalidades.map(finalidade => (
                  <button
                    key={finalidade}
                    onClick={() => setSelectedFinalidade(finalidade)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedFinalidade === finalidade
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {finalidade}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filtered.length} de {properties.length} imóveis
          </div>
        </div>
      </section>

      {/* Grid de Resultados */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((property) => (
            <Link href={`/imovel/${property.id}`} key={property.id}>
              <div className="group bg-white rounded-lg shadow hover:shadow-xl transition-shadow">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image
                    src={getImageUrl(property)}
                    alt={property.titulo}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">
                    {property.titulo}
                  </h3>
                  <p className="text-gray-600 text-xs mb-3 flex items-center gap-1">
                    <MapPin size={12} />
                    {property.cidade}, {property.estado}
                  </p>
                  <div className="flex gap-3 text-gray-500 text-xs mb-3">
                    {property.quartos > 0 && <div className="flex items-center gap-1"><Bed size={12} />{property.quartos}</div>}
                    {property.banheiros > 0 && <div className="flex items-center gap-1"><Bath size={12} />{property.banheiros}</div>}
                    {property.area_total > 0 && <div className="flex items-center gap-1"><Maximize size={12} />{property.area_total}m²</div>}
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(property.preco)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum imóvel encontrado com os filtros selecionados.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 text-center text-gray-600 border-t">
        <p>© 2025 {company.nome_fantasia}</p>
      </footer>
    </div>
  );
}