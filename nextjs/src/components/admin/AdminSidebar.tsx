'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
        BarChart3,
        Building2,
        FileText,
        LayoutDashboard,
        MessageCircle,
        Settings,
        Users,
        Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Imóveis', href: '/admin/properties', icon: Building2 },
        { name: 'Leads', href: '/admin/leads', icon: Users },
        { name: 'Mensagens', href: '/admin/messages', icon: MessageCircle },
        { name: 'Contratos', href: '/admin/contracts', icon: FileText },
        { name: 'Financeiro', href: '/admin/finance', icon: Wallet },
        { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
        const pathname = usePathname();
        const searchParams = useSearchParams();
        const company = searchParams.get('company');

        const buildHref = (href: string) => (company ? `${href}?company=${company}` : href);

        return (
                <aside className="hidden w-72 shrink-0 border-r bg-background/90 backdrop-blur lg:block">
                        <div className="flex h-16 items-center gap-2 border-b px-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                        <p className="text-sm text-muted-foreground">Painel Administrativo</p>
                                        <p className="text-lg font-semibold leading-tight">IMOBI</p>
                                </div>
                        </div>

                        <nav className="space-y-1 px-3 py-6">
                                {navigation.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname.startsWith(item.href);

                                        return (
                                                <Link
                                                        key={item.name}
                                                        href={buildHref(item.href)}
                                                        className={cn(
                                                                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                                                                isActive
                                                                        ? 'bg-primary/10 text-primary'
                                                                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                                                        )}
                                                >
                                                        <Icon className="h-5 w-5" />
                                                        <span>{item.name}</span>
                                                </Link>
                                        );
                                })}
                        </nav>
                </aside>
        );
}
