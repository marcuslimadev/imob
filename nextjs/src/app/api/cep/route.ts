import { NextRequest, NextResponse } from 'next/server';

interface ViaCepResponse {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  cep?: string;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const cep = (url.searchParams.get('cep') || '').replace(/\D/g, '');

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ error: 'CEP inválido' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 });
    }

    const data = (await response.json()) as ViaCepResponse;

    if (data.erro) {
      return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      cep: data.cep || cep,
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      ibge: data.ibge || '',
    });
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);

    return NextResponse.json({ error: 'Erro ao consultar CEP' }, { status: 500 });
  }
}
