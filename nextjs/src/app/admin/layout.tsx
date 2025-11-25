import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
        return (
                <div className="min-h-screen bg-muted/40">
                        <div className="flex min-h-screen">
                                <AdminSidebar />
                                <div className="flex flex-1 flex-col">
                                        <AdminHeader />
                                        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
                                </div>
                        </div>
                </div>
        );
}
