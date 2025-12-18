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
    const companyId = searchParams.get('company_id');

    // Construir query params - buscar campos básicos primeiro
    const params: any = {
      fields: '*',
      sort: '-created_at',
      limit: '50'
    };

    if (companyId && companyId !== 'null') {
      params['filter[company_id][_eq]'] = companyId;
    }

    const url = `${directusUrl}/items/conversas?${new URLSearchParams(params)}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch conversas' }, { status: response.status });
    }

    const result = await response.json();
    const conversas = result.data || [];
    
    // Buscar leads associados separadamente
    if (conversas.length > 0) {
      const leadIds = conversas.map((c: any) => c.lead_id).filter(Boolean);
      
      if (leadIds.length > 0) {
        const leadsParams = new URLSearchParams({
          fields: 'id,name,phone,email',
          'filter[id][_in]': leadIds.join(',')
        });
        
        const leadsResponse = await fetch(`${directusUrl}/items/leads?${leadsParams}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (leadsResponse.ok) {
          const leadsResult = await leadsResponse.json();
          const leadsMap = new Map((leadsResult.data || []).map((l: any) => [l.id, l]));
          
          // Adicionar dados do lead em cada conversa
          conversas.forEach((c: any) => {
            if (c.lead_id) {
              c.lead = leadsMap.get(c.lead_id);
            }
          });
        }
      }
    }
    
    return NextResponse.json(conversas);
  } catch (error: any) {
    console.error('Error fetching conversas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
