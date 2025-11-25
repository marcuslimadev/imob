import { Bell, Search, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminHeader() {
        return (
                <header className="flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex items-center gap-3">
                                <div className="relative w-72 max-w-full">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                                type="search"
                                                placeholder="Buscar por imóveis, leads ou atividades"
                                                className="pl-10 pr-4"
                                        />
                                </div>
                                <Badge variant="outline" className="hidden text-xs font-semibold md:inline-flex">
                                        Multi-tenant ativo
                                </Badge>
                        </div>

                        <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5 text-muted-foreground" />
                                        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-500" />
                                </Button>
                                <div className="flex items-center gap-3 rounded-full border bg-muted/60 px-3 py-2">
                                        <div className="hidden text-right md:block">
                                                <p className="text-sm font-semibold leading-tight">Marcus Admin</p>
                                                <p className="text-xs text-muted-foreground">SuperAdmin</p>
                                        </div>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <UserRound className="h-5 w-5" />
                                        </div>
                                </div>
                        </div>
                </header>
        );
}
