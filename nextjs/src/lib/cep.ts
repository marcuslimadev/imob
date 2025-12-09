export interface CepLookupResult {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  ibge?: string;
}

export async function lookupCep(cep: string): Promise<CepLookupResult> {
  const sanitized = (cep || '').replace(/\D/g, '');

  if (sanitized.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos.');
  }

  const response = await fetch(`/api/cep?cep=${sanitized}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Não foi possível buscar o CEP.');
  }

  return response.json();
}
