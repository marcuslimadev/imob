import { createDirectus, rest, authentication, staticToken } from '@directus/sdk';
import type { Schema } from './types';

// Para Server Components, usar DIRECTUS_URL (rede interna Docker)
// Para Client Components, usar NEXT_PUBLIC_DIRECTUS_URL (localhost do navegador)
const directusUrl = typeof window === 'undefined'
  ? (process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055')
  : (process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055');

// Usa token estático padrão para evitar falhas no middleware quando a env não está setada
const adminToken =
  process.env.DIRECTUS_ADMIN_TOKEN ||
  process.env.NEXT_PUBLIC_DIRECTUS_STATIC_TOKEN ||
  'admin-static-token-2024';

/**
 * Cliente Directus para uso no servidor (com token estático)
 * Usar em Server Components, API Routes, Server Actions
 */
export const directusServer = createDirectus<Schema>(directusUrl)
  .with(staticToken(adminToken))
  .with(rest());

/**
 * Cliente Directus para uso no cliente (com autenticação de usuário)
 * Usar em Client Components
 */
export const directusClient = createDirectus<Schema>(directusUrl)
  .with(authentication('cookie', { credentials: 'include', autoRefresh: true }))
  .with(rest({ credentials: 'include' }));

/**
 * Helper para criar cliente Directus com token customizado
 */
export function createDirectusClient(token?: string) {
  if (token) {
    return createDirectus<Schema>(directusUrl)
      .with(staticToken(token))
      .with(rest());
  }
  
return directusClient;
}

export { directusUrl };
