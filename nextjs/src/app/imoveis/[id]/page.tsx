import { directusServer } from '@/lib/directus/client';
import { readItems, readItem } from '@directus/sdk';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import FormularioContato from '@/components/forms/FormularioContato';

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProperty(id: string) {
  try {
    // @ts-ignore - Using custom schema
    return await directusServer.request(
      readItem('properties', id, {
        fields: ['*']
      })
    );
  } catch (error) {
    return null;
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

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  // @ts-ignore - Using custom schema with properties table
  const prop: any = property;

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--foreground-color)]">
      {/* Header */}
      <div className="border-b-[3px] border-[var(--foreground-color)] bg-[var(--background-color-muted)]/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/vitrine"
            className="bauhaus-chip bg-[var(--background-color)] hover:bg-[var(--accent-color-soft)]"
          >
            ← Voltar à vitrine
          </Link>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] font-semibold">
            <span className="bauhaus-pill bg-[var(--accent-color)] text-white">Curadoria</span>
            <span className="bauhaus-pill bg-[var(--accent-color-light)]">Imóvel</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10">
          {/* Main Content */}
          <div className="space-y-8">
            <div className="relative">
              <div className="absolute -left-6 -top-6 h-16 w-16 rounded-full bg-[var(--accent-color-soft)] border-[4px] border-[var(--foreground-color)]" />
              <div className="absolute -right-8 -bottom-8 h-24 w-24 bg-[var(--accent-color-light)] border-[4px] border-[var(--foreground-color)] rotate-6" />
              <div className="bauhaus-card p-7 md:p-9 relative z-10 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bauhaus-pill bg-[var(--accent-color)] text-white">
                    {getPropertyTypeLabel(prop.property_type)}
                  </span>
                  <span className="bauhaus-pill bg-[var(--background-color-muted)] text-[var(--foreground-color)]">
                    {prop.transaction_type === 'sale'
                      ? 'Venda'
                      : prop.transaction_type === 'rent'
                        ? 'Aluguel'
                        : 'Venda + Aluguel'}
                  </span>
                  <span className="bauhaus-pill bg-[var(--accent-color-light)] text-[var(--foreground-color)]">
                    {prop.city}, {prop.state}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black leading-tight">{prop.title}</h1>
                <div className="flex items-start gap-3 text-[var(--muted-foreground)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    {prop.address && `${prop.address}, `}
                    {prop.neighborhood && `${prop.neighborhood}, `}
                    {prop.city}, {prop.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Image Gallery Placeholder */}
            <div className="bauhaus-surface overflow-hidden">
              <div className="relative h-[420px] bg-[var(--background-color-muted)] bauhaus-stripe flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[rgba(0,0,0,0.08)]" />
                <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-[5px] border-[var(--foreground-color)] bg-[var(--background-color)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-[var(--foreground-color)]"
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
                {prop.featured && (
                  <div className="absolute top-4 right-4 bauhaus-chip bg-[var(--accent-color)] text-white">
                    Destaque
                  </div>
                )}
              </div>
            </div>

            {/* Price + Highlights */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bauhaus-card p-6 space-y-4">
                <p className="uppercase tracking-[0.16em] text-xs font-semibold">Investimento</p>
                {prop.transaction_type === 'sale' && prop.price_sale > 0 && (
                  <p className="text-4xl font-black">{formatPrice(prop.price_sale)}</p>
                )}
                {prop.transaction_type === 'rent' && prop.price_rent > 0 && (
                  <div className="space-y-1">
                    <p className="text-4xl font-black">{formatPrice(prop.price_rent)}</p>
                    <p className="text-sm font-semibold text-[var(--muted-foreground)]">/mês</p>
                  </div>
                )}
                {prop.transaction_type === 'both' && (
                  <div className="space-y-2">
                    {prop.price_sale > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] font-semibold">Venda</p>
                        <p className="text-3xl font-black">{formatPrice(prop.price_sale)}</p>
                      </div>
                    )}
                    {prop.price_rent > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] font-semibold">Aluguel</p>
                        <p className="text-2xl font-black">{formatPrice(prop.price_rent)}</p>
                        <p className="text-xs font-semibold text-[var(--muted-foreground)]">/mês</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm font-semibold uppercase tracking-[0.14em]">
                  {prop.price_condo > 0 && (
                    <div className="bauhaus-pill bg-[var(--background-color-muted)] justify-center">Condomínio {formatPrice(prop.price_condo)}</div>
                  )}
                  {prop.price_iptu > 0 && (
                    <div className="bauhaus-pill bg-[var(--background-color-muted)] justify-center">IPTU {formatPrice(prop.price_iptu)}</div>
                  )}
                </div>
              </div>

              <div className="bauhaus-surface p-6 space-y-4">
                <p className="uppercase tracking-[0.16em] text-xs font-semibold">Ritmo do espaço</p>
                <div className="grid grid-cols-2 gap-3 text-center text-sm font-semibold uppercase tracking-[0.14em]">
                  {prop.bedrooms > 0 && (
                    <div className="p-3 bg-[var(--accent-color-soft)] border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">
                      <p className="text-2xl font-black">{prop.bedrooms}</p>
                      <p>Quartos</p>
                    </div>
                  )}
                  {prop.suites > 0 && (
                    <div className="p-3 bg-[var(--background-color)] border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">
                      <p className="text-2xl font-black">{prop.suites}</p>
                      <p>Suítes</p>
                    </div>
                  )}
                  {prop.bathrooms > 0 && (
                    <div className="p-3 bg-[var(--background-color)] border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">
                      <p className="text-2xl font-black">{prop.bathrooms}</p>
                      <p>Banheiros</p>
                    </div>
                  )}
                  {prop.parking_spaces > 0 && (
                    <div className="p-3 bg-[var(--accent-color-light)] border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">
                      <p className="text-2xl font-black">{prop.parking_spaces}</p>
                      <p>Vagas</p>
                    </div>
                  )}
                  {prop.area_total > 0 && (
                    <div className="p-3 bg-[var(--background-color-muted)] border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">
                      <p className="text-2xl font-black">{prop.area_total}</p>
                      <p>m² Total</p>
                    </div>
                  )}
                  {prop.area_built > 0 && (
                    <div className="p-3 bg-[var(--background-color)] border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]">
                      <p className="text-2xl font-black">{prop.area_built}</p>
                      <p>m² Construída</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {prop.description && (
              <div className="bauhaus-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black">Descrição detalhada</h2>
                  <div className="h-10 w-10 rounded-full bg-[var(--accent-color)] border-[3px] border-[var(--foreground-color)]" />
                </div>
                <p className="text-base leading-relaxed text-[var(--muted-foreground)] whitespace-pre-wrap">
                  {prop.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-6 h-fit">
            {/* Contact Form */}
            <div className="bauhaus-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black">Interessado?</h3>
                <div className="h-10 w-10 rounded-full bg-[var(--accent-color)] border-[3px] border-[var(--foreground-color)]" />
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Preencha e entraremos em contato. Ritmo claro, resposta rápida e sem ruído.
              </p>

              <form className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.16em] font-semibold">Nome completo</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--input-color)] px-3 py-2"
                    placeholder="Seu nome"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.16em] font-semibold">E-mail</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--input-color)] px-3 py-2"
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.16em] font-semibold">Telefone</label>
                  <input
                    type="tel"
                    required
                    className="w-full rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--input-color)] px-3 py-2"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.16em] font-semibold">Mensagem</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--input-color)] px-3 py-2"
                    placeholder="Quero saber mais sobre este imóvel..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[var(--accent-color)] text-white font-semibold py-3 border-[3px] border-[var(--foreground-color)] shadow-[8px_8px_0_#0c0c0c] uppercase tracking-[0.16em]"
                >
                  Enviar mensagem
                </button>
              </form>

              {/* Company Info */}
              <div className="pt-4 border-t-[3px] border-[var(--foreground-color)]">
                <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-2">Anunciado por</p>
                <p className="font-black text-lg">
                  {prop.company_id?.name || 'Imobiliária'}
                </p>
                {prop.company_id?.phone && (
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {prop.company_id.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="bauhaus-card p-5 space-y-3">
              <p className="uppercase tracking-[0.18em] text-xs font-semibold">compasso do imóvel</p>
              <div className="flex items-center gap-3">
                <div className="h-4 w-full bg-[var(--background-color-muted)] border-[3px] border-[var(--foreground-color)]" />
                <div className="h-4 w-12 bg-[var(--accent-color)] border-[3px] border-[var(--foreground-color)]" />
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Bloco lateral para reforçar o ritmo gráfico: bordas fortes, cores primárias e contraste marcante.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
