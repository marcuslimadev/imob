import { ReactNode } from 'react';

import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getCompanyContext } from '@/lib/hooks/useCompany';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { companySlug } = await getCompanyContext();

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="flex min-h-screen">
        <AdminSidebar companySlug={companySlug} />
        <div className="flex flex-1 flex-col">
          <AdminHeader companySlug={companySlug} />
          <main className="flex-1 overflow-y-auto bg-background px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
