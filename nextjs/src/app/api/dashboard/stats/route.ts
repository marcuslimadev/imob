import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('directus_token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Buscar usuário para ver se tem company_id
    const userResponse = await fetch(`${directusUrl}/users/me?fields=id,company_id`, { headers });
    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to get user' }, { status: 401 });
    }
    const userData = await userResponse.json();
    const companyId = userData.data?.company_id;

    // Função helper para buscar contagem
    async function getCount(collection: string) {
      const params: any = { fields: 'id' };
      if (companyId) {
        params['filter[company_id][_eq]'] = companyId;
      }
      
      try {
        const response = await fetch(`${directusUrl}/items/${collection}?${new URLSearchParams(params)}`, { headers });
        if (!response.ok) return 0;
        const result = await response.json();
        return result.data?.length || 0;
      } catch {
        return 0;
      }
    }

    // Buscar todas as estatísticas
    const [properties, leads, conversations] = await Promise.all([
      getCount('properties'),
      getCount('leads'),
      getCount('conversas')
    ]);

    // Leads deste mês
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const leadsThisMonthParams: any = {
      fields: 'id',
      'filter[created_at][_gte]': firstDayOfMonth
    };
    if (companyId) {
      leadsThisMonthParams['filter[company_id][_eq]'] = companyId;
    }
    
    const leadsMonthResponse = await fetch(`${directusUrl}/items/leads?${new URLSearchParams(leadsThisMonthParams)}`, { headers });
    const leadsMonthData = await leadsMonthResponse.json();
    const leadsThisMonth = leadsMonthData.data?.length || 0;

    return NextResponse.json({
      properties,
      leads,
      leadsThisMonth,
      conversations,
      vistorias: 0, // Não implementado ainda
      documentos: 0  // Não implementado ainda
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
