import { headers } from 'next/headers';

/**
 * Hook para obter informações da company atual (multi-tenant)
 * Usa os headers injetados pelo middleware
 */
export async function getCompanyContext() {
  const headersList = await headers();
  
  const companyId = headersList.get('x-company-id');
  const companySlug = headersList.get('x-company-slug');
  
  return {
    companyId: companyId || null,
    companySlug: companySlug || null,
    hasCompany: !!companyId
  };
}

/**
 * Tipo de retorno do getCompanyContext
 */
export type CompanyContext = {
  companyId: string | null;
  companySlug: string | null;
  hasCompany: boolean;
};
