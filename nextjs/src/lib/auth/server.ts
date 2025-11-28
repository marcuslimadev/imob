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
    // Cria cliente temporário com o token do usuário
    const { createDirectus, rest, authentication, readMe: readMeSDK } = await import('@directus/sdk');
    
    const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055')
      .with(rest())
      .with(authentication('json'));

    // Define o token manualmente
    await client.setToken(authToken);

    // Busca dados do usuário
    // @ts-ignore - Custom schema
    const user = await client.request(
      readMeSDK({
        // @ts-ignore
        fields: ['id', 'email', 'first_name', 'last_name', 'company_id']
      })
    );

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
    const { createDirectus, rest, authentication, readMe: readMeSDK } = await import('@directus/sdk');
    
    const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055')
      .with(rest())
      .with(authentication('json'));

    await client.setToken(authToken);

    // @ts-ignore - Custom schema
    const user = await client.request(
      readMeSDK({
        // @ts-ignore
        fields: ['*', { company_id: ['id', 'name', 'slug'] }]
      })
    );

    if (!user) {
      redirect('/login');
    }

    return user;
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    redirect('/login?error=auth_failed');
  }
}
