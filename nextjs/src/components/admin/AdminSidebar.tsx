'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
        Building2,
        DollarSign,
        FileText,
        Home,
        LayoutDashboard,
        MessageSquare,
        Settings,
        Users,
} from 'lucide-react';

const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { label: 'Imóveis', icon: Home, href: '/admin/properties' },
        { label: 'Leads', icon: Users, href: '/admin/leads' },
        { label: 'Mensagens', icon: MessageSquare, href: '/admin/messages' },
        { label: 'Contratos', icon: FileText, href: '/admin/contracts' },
        { label: 'Financeiro', icon: DollarSign, href: '/admin/financial' },
        { label: 'Configurações', icon: Settings, href: '/admin/settings' },
];

export function AdminSidebar() {
        const pathname = usePathname();

        return (
                <aside className="w-64 border-r border-gray-200 bg-white">
                        <div className="flex h-16 items-center border-b border-gray-200 px-6">
                                <Building2 className="size-8 text-blue-600" />
                                <span className="ml-2 text-xl font-bold text-gray-900">IMOBI</span>
                        </div>

                        <nav className="space-y-1 p-4">
                                {menuItems.map((item) => {
                                        const isActive = pathname.startsWith(item.href);
                                        const Icon = item.icon;

                                        return (
                                                <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                                                                isActive
                                                                        ? 'bg-blue-50 text-blue-700'
                                                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                >
                                                        <Icon className="size-5" />
                                                        <span>{item.label}</span>
                                                </Link>
                                        );
                                })}
                        </nav>
                </aside>
        );
}
