import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
        return (
                <div className="flex h-screen bg-gray-50">
                        <AdminSidebar />
                        <div className="flex flex-1 flex-col overflow-hidden">
                                <AdminHeader />
                                <main className="flex-1 overflow-y-auto p-6">{children}</main>
                        </div>
                </div>
        );
}
