import { cookies } from 'next/headers';
import { directusServer } from '@/lib/directus/client';
import { readMe } from '@directus/sdk';
import { redirect } from 'next/navigation';

/**
 * Helper para Server Components obterem company_id do usuário autenticado
 * Lê o token de autenticação dos cookies e busca os dados do usuário
 */
export async function getAuthenticatedCompanyId(): Promise<string> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('directus_token')?.value;

  if (!authToken) {
    redirect('/login');
  }

  try {
    // Usa DIRECTUS_URL para server-side (Docker network) ou fallback para localhost
    const directusUrl = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
    
    // Faz requisição direta à API do Directus com o token
    const response = await fetch(`${directusUrl}/users/me?fields=id,email,first_name,last_name,company_id`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      cache: 'no-store' // Evita cache em Server Components
    });

    if (!response.ok) {
      console.error('Failed to fetch user, status:', response.status);
      redirect('/login?error=auth_failed');
    }

    const result = await response.json();
    const user = result.data;

    if (!user?.company_id) {
      console.error('User has no company_id:', user);
      redirect('/login?error=no_company');
    }

    return user.company_id;
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    redirect('/login?error=auth_failed');
  }
}

/**
 * Helper para obter dados completos do usuário autenticado
 */
export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('directus_token')?.value;

  if (!authToken) {
    redirect('/login');
  }

  try {
    const directusUrl = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
    
    const response = await fetch(`${directusUrl}/users/me?fields=*`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      redirect('/login?error=auth_failed');
    }

    const result = await response.json();
    const user = result.data;

    if (!user) {
      redirect('/login');
    }

    return user;
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    redirect('/login?error=auth_failed');
  }
}
