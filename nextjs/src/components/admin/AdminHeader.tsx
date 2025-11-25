'use client';

import { Bell, Search, UserCircle2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface AdminHeaderProps {
  companySlug?: string | null;
}

export default function AdminHeader({ companySlug }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Buscar imóveis, leads ou contratos" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {companySlug && <Badge variant="outline">{companySlug}</Badge>}
        <ThemeToggle />
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="size-5" />
          <span className="absolute right-1 top-1 inline-flex size-2 rounded-full bg-amber-500" />
        </Button>
        <div className="flex items-center gap-2 rounded-full border px-3 py-1">
          <UserCircle2 className="size-6 text-primary" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Administrador</p>
            <p className="text-xs text-muted-foreground">Operação SaaS</p>
          </div>
        </div>
      </div>
    </header>
  );
}
