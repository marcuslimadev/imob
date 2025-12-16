import Link from 'next/link';
import { headers } from 'next/headers';
import { fetchProperties } from '@/lib/directus/realEstate';

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  transaction_type: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  area_total: number;
  price_sale: number;
  price_rent: number;
  featured: boolean;
}

async function getFeaturedProperties({
  companySlug,
  search,
  propertyType,
  transactionType,
  city,
  state
}: {
  companySlug?: string;
  search?: string;
  propertyType?: string;
  transactionType?: string;
  city?: string;
  state?: string;
}): Promise<Property[]> {
  try {
    const properties = await fetchProperties({
      companySlug,
      featuredOnly: true,
      limit: 24,
      searchTerm: search,
      propertyType,
      transactionType,
      city,
      state
    });

    return properties as Property[];
  } catch (error) {
    console.error('Error fetching properties:', error);

    return [];
  }
}

  function formatPrice(price: number): string {

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  }

  function getPropertyTypeLabel(type: string): string {
    const types: Record<string, string> = {
      apartment: 'Apartamento',
    house: 'Casa',
    commercial: 'Comercial',
      land: 'Terreno',
      farm: 'Fazenda',
      penthouse: 'Cobertura'
    };

    return types[type] || type;
  }

export default async function VitrineHomePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const headersList = await headers();
  const resolvedParams = await searchParams;
  const companySlug = headersList.get('x-company-slug') || undefined;
  const search = typeof resolvedParams?.q === 'string' ? resolvedParams?.q : undefined;
  const propertyType = typeof resolvedParams?.tipo === 'string' ? resolvedParams?.tipo : undefined;
  const transactionType = typeof resolvedParams?.transacao === 'string' ? resolvedParams?.transacao : undefined;
  const city = typeof resolvedParams?.cidade === 'string' ? resolvedParams?.cidade : undefined;
  const state = typeof resolvedParams?.estado === 'string' ? resolvedParams?.estado : undefined;

  const properties = await getFeaturedProperties({
    companySlug,
    search,
    propertyType,
    transactionType,
    city,
    state
  });

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--foreground-color)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-90">
          <div className="h-full w-full bauhaus-grid bg-[radial-gradient(circle_at_15%_20%,rgba(255,201,0,0.28),transparent_32%),radial-gradient(circle_at_78%_15%,rgba(0,168,232,0.25),transparent_30%),radial-gradient(circle_at_35%_78%,rgba(217,4,41,0.22),transparent_34%)]" />
        </div>
        <div className="relative container mx-auto px-4 py-20 lg:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="space-y-6">
            <div className="bauhaus-pill bg-[var(--background-color)] text-[var(--foreground-color)] shadow-[8px_8px_0_#0c0c0c] inline-flex">
              mapa vivo de imóveis
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Uma vitrine geométrica com imóveis selecionados à prova de indecisão
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-[var(--muted-foreground)]">
              Combine geometria e propósito: encontre apartamentos, casas e comerciais com filtros rápidos, preços claros e um grid que respira ritmo e contraste.
            </p>

            <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-4">
              <div className="bauhaus-card p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="bauhaus-chip bg-[var(--accent-color)] text-white">rota expressa</span>
                  <div className="h-8 w-8 rounded-full bg-[var(--accent-color-light)] border-[3px] border-[var(--foreground-color)]" />
                </div>
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Pesquise por bairro, cidade ou código e deixe o grid modular entregar as melhores combinações.
                </p>
                <form className="flex flex-col gap-3" method="get">
                  <input
                    type="text"
                    placeholder="Buscar por cidade, bairro ou código..."
                    name="q"
                    defaultValue={search}
                    className="w-full rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--input-color)] px-4 py-3 text-base placeholder:text-[var(--muted-foreground)]"
                  />
                  <div className="grid grid-cols-2 gap-3 text-sm font-semibold uppercase tracking-[0.14em]">
                    <select
                      name="tipo"
                      defaultValue={propertyType || ''}
                      className="w-full rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--input-color)] px-3 py-3 text-xs"
                    >
                      <option value="">Tipologia</option>
                      <option value="apartment">Apartamento</option>
                      <option value="house">Casa</option>
                      <option value="commercial">Comercial</option>
                      <option value="land">Terreno</option>
                      <option value="farm">Fazenda</option>
                      <option value="penthouse">Cobertura</option>
                    </select>
                    <select
                      name="transacao"
                      defaultValue={transactionType || ''}
                      className="w-full rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--input-color)] px-3 py-3 text-xs"
                    >
                      <option value="">Transação</option>
                      <option value="sale">Venda</option>
                      <option value="rent">Aluguel</option>
                      <option value="both">Venda + Aluguel</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm font-semibold uppercase tracking-[0.14em]">
                    <input
                      type="text"
                      name="cidade"
                      defaultValue={city}
                      placeholder="Cidade"
                      className="w-full rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--input-color)] px-3 py-3 text-xs placeholder:text-[var(--muted-foreground)]"
                    />
                    <input
                      type="text"
                      name="estado"
                      defaultValue={state}
                      placeholder="UF"
                      maxLength={2}
                      className="w-full rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--input-color)] px-3 py-3 text-xs uppercase placeholder:text-[var(--muted-foreground)]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex justify-center items-center gap-2 bg-[var(--accent-color)] text-white font-semibold px-5 py-3 border-[3px] border-[var(--foreground-color)] shadow-[8px_8px_0_#0c0c0c] uppercase tracking-[0.14em]"
                  >
                    Buscar agora
                  </button>
                </form>
              </div>
              <div className="bauhaus-surface p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black">Ritmo da vitrine</h3>
                  <div className="flex -space-x-2">
                    <div className="h-10 w-10 rounded-full border-[3px] border-[var(--foreground-color)] bg-[var(--accent-color)]" />
                    <div className="h-10 w-10 rounded-full border-[3px] border-[var(--foreground-color)] bg-[var(--accent-color-soft)]" />
                    <div className="h-10 w-10 rounded-full border-[3px] border-[var(--foreground-color)] bg-[var(--accent-color-light)]" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm font-semibold uppercase tracking-[0.16em]">
                  <div className="p-3 bg-[var(--accent-color)] text-white border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">Venda</div>
                  <div className="p-3 bg-[var(--background-color)] border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">Aluguel</div>
                  <div className="p-3 bg-[var(--accent-color-soft)] border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">Lançamentos</div>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Curadoria com preço visível, destaque realçado e sinalização de tipologia para você navegar sem fricção.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 -top-8 h-24 w-24 rounded-full bg-[var(--accent-color-light)] border-[4px] border-[var(--foreground-color)]" />
            <div className="absolute -right-8 -bottom-10 h-28 w-28 bg-[var(--accent-color-soft)] border-[4px] border-[var(--foreground-color)] rotate-6" />
            <div className="bauhaus-card p-6 lg:p-8 space-y-5 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="uppercase tracking-[0.18em] text-xs font-semibold">manifesto</p>
                  <h2 className="text-3xl font-black mt-1">Vitrine Modular</h2>
                </div>
                <div className="h-16 w-16 rounded-full bg-[var(--accent-color)] border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]" />
              </div>
              <p className="text-base text-[var(--muted-foreground)] leading-relaxed">
                Blocos de imóveis em grid 4x4, rótulos fortes, preços em destaque e selos de tipologia que seguem a paleta primária.
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-[var(--background-color-muted)] border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">
                  <p className="text-2xl font-black">12</p>
                  <p className="uppercase tracking-[0.16em] text-xs">listagens</p>
                </div>
                <div className="p-4 bg-[var(--accent-color)] text-white border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">
                  <p className="text-2xl font-black">9</p>
                  <p className="uppercase tracking-[0.16em] text-xs">destaques</p>
                </div>
                <div className="p-4 bg-[var(--background-color)] border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">
                  <p className="text-2xl font-black">3</p>
                  <p className="uppercase tracking-[0.16em] text-xs">tipologias</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-y-[3px] border-[var(--foreground-color)] bg-[var(--background-color-muted)]/90 py-6">
        <div className="container mx-auto px-4 flex flex-wrap gap-3 items-center">
          <span className="bauhaus-pill bg-[var(--background-color)]">FILTROS RÁPIDOS</span>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {['Todos', 'Apartamentos', 'Casas', 'Comercial', 'Terrenos'].map((label) => (
              <button
                key={label}
                className="bauhaus-chip bg-[var(--background-color)] text-[var(--foreground-color)] hover:bg-[var(--accent-color-soft)]"
              >
                {label}
              </button>
            ))}
          </div>
          {(search || propertyType || transactionType || city || state) && (
            <div className="flex flex-wrap gap-2 items-center text-xs font-semibold uppercase tracking-[0.14em]">
              {search && <span className="bauhaus-chip bg-[var(--accent-color-soft)]">Busca: {search}</span>}
              {propertyType && <span className="bauhaus-chip bg-[var(--background-color)]">Tipo: {getPropertyTypeLabel(propertyType)}</span>}
              {transactionType && <span className="bauhaus-chip bg-[var(--background-color)]">Transação: {transactionType}</span>}
              {city && <span className="bauhaus-chip bg-[var(--background-color)]">Cidade: {city}</span>}
              {state && <span className="bauhaus-chip bg-[var(--background-color)]">UF: {state.toUpperCase()}</span>}
              <a
                href="/vitrine"
                className="bauhaus-chip bg-[var(--accent-color)] text-white border-[2px] border-[var(--foreground-color)]"
              >
                Limpar
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Properties Grid */}
      <section className="container mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="uppercase tracking-[0.16em] text-xs font-semibold">Curadoria viva</p>
            <h2 className="text-3xl md:text-4xl font-black">Imóveis em destaque</h2>
            <p className="text-[var(--muted-foreground)] mt-2">
              Grid modular com preços em primeira vista e selos de tipologia.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em]">
            <div className="h-10 w-10 rounded-full bg-[var(--accent-color)] border-[3px] border-[var(--foreground-color)]" />
            <div className="h-10 w-10 rounded-full bg-[var(--accent-color-soft)] border-[3px] border-[var(--foreground-color)]" />
            <div className="h-10 w-10 rounded-full bg-[var(--accent-color-light)] border-[3px] border-[var(--foreground-color)]" />
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="bauhaus-card p-10 text-center">
            <p className="text-lg font-semibold">Nenhum imóvel disponível no momento</p>
            <p className="text-[var(--muted-foreground)] mt-2">
              Voltamos já com novas opções para seu radar visual.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/imoveis/${property.id}`}
                className="bauhaus-card overflow-hidden group transition-transform hover:-translate-y-1"
              >
                {/* Property Image Placeholder */}
                <div className="relative h-48 bg-[var(--background-color-muted)] bauhaus-stripe flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[rgba(0,0,0,0.06)]" />
                  <div className="relative flex items-center justify-center h-20 w-20 rounded-full border-[3px] border-[var(--foreground-color)] bg-[var(--background-color)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-[var(--foreground-color)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                    </svg>
                  </div>
                  {property.featured && (
                    <div className="absolute top-3 right-3 bauhaus-chip bg-[var(--accent-color)] text-white">
                      destaque
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bauhaus-pill bg-[var(--accent-color-light)] text-[var(--foreground-color)]">
                      {getPropertyTypeLabel(property.property_type)}
                    </span>
                    <span className="bauhaus-pill bg-[var(--background-color-muted)] text-[var(--foreground-color)]">
                      {property.city}, {property.state}
                    </span>
                  </div>

                  <h3 className="font-black text-xl leading-tight line-clamp-2">
                    {property.title}
                  </h3>

                  {/* Price */}
                  <div className="space-y-1">
                    {property.transaction_type === 'sale' && property.price_sale > 0 && (
                      <p className="text-3xl font-black text-[var(--foreground-color)]">
                        {formatPrice(property.price_sale)}
                      </p>
                    )}
                    {property.transaction_type === 'rent' && property.price_rent > 0 && (
                      <p className="text-3xl font-black text-[var(--foreground-color)]">
                        {formatPrice(property.price_rent)}
                        <span className="text-sm font-semibold text-[var(--muted-foreground)]">/mês</span>
                      </p>
                    )}
                    {property.transaction_type === 'both' && (
                      <div className="space-y-1">
                        {property.price_sale > 0 && (
                          <p className="text-2xl font-black text-[var(--foreground-color)]">
                            {formatPrice(property.price_sale)}
                          </p>
                        )}
                        {property.price_rent > 0 && (
                          <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                            ou {formatPrice(property.price_rent)}/mês
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
                    {property.bedrooms > 0 && (
                      <div className="bauhaus-pill bg-[var(--background-color-muted)] justify-center">
                        {property.bedrooms} qt
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="bauhaus-pill bg-[var(--background-color-muted)] justify-center">
                        {property.bathrooms} bwc
                      </div>
                    )}
                    {property.area_total > 0 && (
                      <div className="bauhaus-pill bg-[var(--background-color-muted)] justify-center">
                        {property.area_total} m²
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
