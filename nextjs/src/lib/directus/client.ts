import { createDirectus, rest, authentication, staticToken } from '@directus/sdk';
import type { Schema } from './types';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

/**
 * Cliente Directus para uso no servidor (com token estático)
 * Usar em Server Components, API Routes, Server Actions
 */
export const directusServer = createDirectus<Schema>(directusUrl)
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN || ''))
  .with(rest());

/**
 * Cliente Directus para uso no cliente (com autenticação de usuário)
 * Usar em Client Components
 */
export const directusClient = createDirectus<Schema>(directusUrl)
  .with(authentication('json'))
  .with(rest());

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
