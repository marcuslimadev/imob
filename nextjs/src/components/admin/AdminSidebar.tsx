'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  Users,
  MessageSquare,
  FileText,
  DollarSign,
  Settings
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Imóveis', icon: Home, href: '/admin/properties' },
  { label: 'Leads', icon: Users, href: '/admin/leads' },
  { label: 'Mensagens', icon: MessageSquare, href: '/admin/messages' },
  { label: 'Contratos', icon: FileText, href: '/admin/contracts' },
  { label: 'Financeiro', icon: DollarSign, href: '/admin/finance' },
  { label: 'Configurações', icon: Settings, href: '/admin/settings' }
];

interface AdminSidebarProps {
  companySlug?: string | null;
}

export default function AdminSidebar({ companySlug }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 border-r bg-background/80 px-4 py-6 shadow-sm lg:flex lg:flex-col">
      <div className="mb-8 space-y-1">
        <div className="text-xs uppercase text-muted-foreground">Painel</div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">IMOBI Admin</p>
            <p className="text-xs text-muted-foreground">Operação Multi-Tenant</p>
          </div>
          {companySlug && <Badge variant="secondary">{companySlug}</Badge>}
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-primary/5 hover:text-primary',
                isActive && 'bg-primary/10 font-semibold text-primary'
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border bg-muted/40 p-4 text-sm">
        <p className="font-semibold">Atalho Rápido</p>
        <p className="mt-1 text-muted-foreground">Acesse o Directus para gerenciar coleções.</p>
        <Link
          href="http://localhost:8055/admin"
          target="_blank"
          className="mt-3 inline-flex items-center text-xs font-semibold text-primary underline"
        >
          Abrir Directus
        </Link>
      </div>
    </aside>
  );
}
