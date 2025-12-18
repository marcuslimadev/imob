import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('directus_token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
    const searchParams = request.nextUrl.searchParams;
    const conversaId = searchParams.get('conversa_id');

    if (!conversaId) {
      return NextResponse.json({ error: 'conversa_id required' }, { status: 400 });
    }

    const params = new URLSearchParams({
      'filter[conversa_id][_eq]': conversaId,
      sort: 'created_at',
      limit: '100',
      fields: '*'
    });

    const url = `${directusUrl}/items/mensagens?${params}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch mensagens' }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result.data || []);
  } catch (error: any) {
    console.error('Error fetching mensagens:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
