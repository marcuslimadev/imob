import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Home, Rocket, Users } from 'lucide-react';

interface DashboardStatsProps {
        stats: {
                totalProperties: number;
                newLeads: number;
                monthlyViews: number;
                activeProposals: number;
        };
}

const cards = [
        {
                title: 'Total de Imóveis',
                icon: Home,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                key: 'totalProperties' as const,
                helper: 'Disponíveis na carteira',
        },
        {
                title: 'Leads Novos',
                icon: Users,
                color: 'text-green-600',
                bg: 'bg-green-50',
                key: 'newLeads' as const,
                helper: 'Últimos 7 dias',
        },
        {
                title: 'Visitas (30d)',
                icon: Eye,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                key: 'monthlyViews' as const,
                helper: 'Sessões registradas',
        },
        {
                title: 'Propostas Ativas',
                icon: Rocket,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                key: 'activeProposals' as const,
                helper: 'Em negociação',
        },
];

export default function DashboardStats({ stats }: DashboardStatsProps) {
        return (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {cards.map((card) => {
                                const Icon = card.icon;
                                const value = stats[card.key];

                                return (
                                        <Card key={card.key} className="overflow-hidden border border-border/70 shadow-sm">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                        <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                                                        <span className={`rounded-full ${card.bg} ${card.color} p-2`}>
                                                                <Icon className="h-4 w-4" />
                                                        </span>
                                                </CardHeader>
                                                <CardContent className="space-y-2">
                                                        <div className="flex items-end justify-between">
                                                                <p className="text-3xl font-bold leading-tight">{value}</p>
                                                                {card.key === 'activeProposals' && (
                                                                        <Badge variant="secondary" className="text-amber-700">
                                                                                Em breve
                                                                        </Badge>
                                                                )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{card.helper}</p>
                                                </CardContent>
                                        </Card>
                                );
                        })}
                </div>
        );
}
