'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Bed, Bath, Maximize, MapPin, Phone, Mail } from 'lucide-react';

interface Property {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  finalidade: string;
  cidade: string;
  estado: string;
  quartos: number;
  banheiros: number;
  area_total: number;
  preco: number;
  destaque: boolean;
  property_media?: Array<{
    directus_files_id: {
      id: string;
      filename_disk: string;
    };
  }>;
}

interface Company {
  id: string;
  nome_fantasia: string;
  logo_url?: string;
  telefone?: string;
  email?: string;
}

interface Template2Props {
  properties: Property[];
  company: Company;
  filters?: {
    search?: string;
    tipo?: string;
    finalidade?: string;
    cidade?: string;
  };
}

export default function Template2({ properties, company, filters }: Template2Props) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [selectedType, setSelectedType] = useState(filters?.tipo || 'todos');
  const [selectedTransaction, setSelectedTransaction] = useState(filters?.finalidade || 'todos');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getImageUrl = (property: Property) => {
    if (!property.property_media || property.property_media.length === 0) {
      return '/placeholder-property.jpg';
    }
    return `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${property.property_media[0].directus_files_id.id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Moderno com Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {company.logo_url && (
                <Image src={company.logo_url} alt={company.nome_fantasia} width={50} height={50} className="rounded-lg" />
              )}
              <h1 className="text-2xl font-bold text-white">{company.nome_fantasia}</h1>
            </div>
            <div className="flex items-center gap-6 text-white/80">
              {company.telefone && (
                <a href={`tel:${company.telefone}`} className="flex items-center gap-2 hover:text-white transition">
                  <Phone size={18} />
                  <span className="hidden md:inline">{company.telefone}</span>
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white transition">
                  <Mail size={18} />
                  <span className="hidden md:inline">{company.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero com Search Integrado */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold text-white mb-4">
            Encontre o Imóvel dos Seus Sonhos
          </h2>
          <p className="text-xl text-white/70 mb-8">
            {properties.length} imóveis disponíveis em destaque
          </p>

          {/* Search Bar Moderno */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por localização, código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/20 text-white placeholder-white/50 rounded-xl border border-white/30 focus:border-white/60 focus:outline-none"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 bg-white/20 text-white rounded-xl border border-white/30 focus:border-white/60 focus:outline-none"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>
              <select
                value={selectedTransaction}
                onChange={(e) => setSelectedTransaction(e.target.value)}
                className="px-4 py-3 bg-white/20 text-white rounded-xl border border-white/30 focus:border-white/60 focus:outline-none"
              >
                <option value="todos">Comprar/Alugar</option>
                <option value="venda">Comprar</option>
                <option value="aluguel">Alugar</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Imóveis com Cards Modernos */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link href={`/imovel/${property.id}`} key={property.id}>
                <div className="group bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20">
                  {/* Imagem com Overlay Gradiente */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={getImageUrl(property)}
                      alt={property.titulo}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Badge de Destaque */}
                    {property.destaque && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                        DESTAQUE
                      </div>
                    )}

                    {/* Preço Flutuante */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl">
                      <p className="text-2xl font-bold text-slate-900">{formatPrice(property.preco)}</p>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                      {property.titulo}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                      <MapPin size={16} />
                      <span>{property.cidade}, {property.estado}</span>
                    </div>

                    {/* Especificações em Linha */}
                    <div className="flex items-center gap-4 text-white/80">
                      {property.quartos > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed size={18} />
                          <span className="text-sm">{property.quartos}</span>
                        </div>
                      )}
                      {property.banheiros > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath size={18} />
                          <span className="text-sm">{property.banheiros}</span>
                        </div>
                      )}
                      {property.area_total > 0 && (
                        <div className="flex items-center gap-1">
                          <Maximize size={18} />
                          <span className="text-sm">{property.area_total}m²</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/60 text-xl">Nenhum imóvel encontrado com os filtros selecionados.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-white/60">
          <p>© 2025 {company.nome_fantasia}. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">Powered by iMOBI Platform</p>
        </div>
      </footer>
    </div>
  );
}
