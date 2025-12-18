'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  ClipboardCheck,
  FileSignature,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { directusClient } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';

const navigation = [
  { name: 'Dashboard', href: '/empresa/dashboard', icon: LayoutDashboard },
  { name: 'Imóveis', href: '/empresa/imoveis', icon: Building2 },
  { name: 'Leads', href: '/empresa/leads', icon: Users },
  { name: 'Conversas', href: '/empresa/conversas', icon: MessageSquare },
  { name: 'Vistorias', href: '/empresa/vistorias', icon: ClipboardCheck },
  { name: 'Assinaturas', href: '/empresa/assinaturas', icon: FileSignature },
  { name: 'Configurações', href: '/empresa/configuracoes', icon: Settings },
];

export default function EmpresaLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply theme from company settings
  useEffect(() => {
    const fetchAndApplyTheme = async () => {
      if (!user?.company_id) return;

      try {
        const companies = await directusClient.request(
          readItems('companies', {
            filter: { id: { _eq: user.company_id } },
            fields: ['theme_key'],
            limit: 1,
          })
        );

        const theme = (companies[0] as any)?.theme_key || 'bauhaus';
        document.documentElement.setAttribute('data-theme', theme as string);
      } catch (error) {
        console.error('Error fetching company theme:', error);
        // Fallback to bauhaus
        document.documentElement.setAttribute('data-theme', 'bauhaus');
      }
    };

    fetchAndApplyTheme();
  }, [user?.company_id]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // Redirect if not authenticated
  if (!loading && !user) {
    window.location.href = '/login';
    return null;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r-[3px] border-[var(--color-border)] transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ borderRadius: 0 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b-[3px] border-[var(--color-border)]">
          <Link href="/empresa/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[var(--color-primary)] flex items-center justify-center" style={{ borderRadius: 0 }}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--color-text)]">SOCIMOB</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors border-2',
                  isActive
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-border)]'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-primary-soft)] border-transparent hover:border-[var(--color-border)]'
                )}
                style={{ borderRadius: 0 }}
              >
                <item.icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-[var(--color-text-muted)]')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t-[3px] border-[var(--color-border)]">
          <div className="flex items-center gap-3 px-3 py-2 border-2 border-[var(--color-border)]" style={{ borderRadius: 0 }}>
            <div className="w-10 h-10 bg-[var(--color-accent)] flex items-center justify-center" style={{ borderRadius: 0 }}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--color-text)] truncate">
                {user?.first_name || 'Usuário'}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b-[3px] border-[var(--color-border)] lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-[var(--color-text)] hover:bg-[var(--color-bg)] lg:hidden border-2 border-transparent hover:border-[var(--color-border)]"
            aria-label="Abrir menu"
            style={{ borderRadius: 0 }}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button 
              className="p-2 text-[var(--color-text)] hover:bg-[var(--color-primary-soft)] relative border-2 border-transparent hover:border-[var(--color-border)]" 
              aria-label="Notificações"
              style={{ borderRadius: 0 }}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-[var(--color-primary)]" style={{ borderRadius: 0 }} />
            </button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 border-2 border-[var(--color-border)] hover:bg-[var(--color-primary-soft)]"
                  style={{ borderRadius: 0 }}
                >
                  <div className="w-8 h-8 bg-[var(--color-primary)] flex items-center justify-center" style={{ borderRadius: 0 }}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-bold">
                    {user?.first_name || 'Usuário'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[var(--color-text)]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-2 border-[var(--color-border)]" style={{ borderRadius: 0 }}>
                <DropdownMenuLabel>
                  <div>
                    <p className="font-bold">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[var(--color-border)] h-[2px]" />
                <DropdownMenuItem asChild>
                  <Link href="/empresa/configuracoes" className="font-medium">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--color-border)] h-[2px]" />
                <DropdownMenuItem onClick={handleLogout} className="text-[var(--color-danger)] font-bold">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 bg-[var(--color-bg)]">{children}</main>
        
        {/* Version badge */}
      </div>
    </div>
  );
}
