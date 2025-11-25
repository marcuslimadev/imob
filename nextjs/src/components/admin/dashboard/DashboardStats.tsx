import type { ElementType } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Eye, Home, Users } from 'lucide-react';

type Stats = {
  totalProperties: number;
  newLeads: number;
  monthlyViews: number;
  activeProposals: number;
};

interface DashboardStatsProps {
  stats: Stats;
}

const statsConfig = (
  stats: Stats
): { label: string; value: number; icon: ElementType; color: string; description: string }[] => [
  {
    label: 'Total de Imóveis',
    value: stats.totalProperties,
    icon: Home,
    color: 'text-blue-600',
    description: 'Imóveis ativos para venda ou locação'
  },
  {
    label: 'Leads Novos',
    value: stats.newLeads,
    icon: Users,
    color: 'text-emerald-600',
    description: 'Leads cadastrados nos últimos 7 dias'
  },
  {
    label: 'Visitas (30d)',
    value: stats.monthlyViews,
    icon: Eye,
    color: 'text-violet-600',
    description: 'Visualizações dos últimos 30 dias'
  },
  {
    label: 'Propostas Ativas',
    value: stats.activeProposals,
    icon: DollarSign,
    color: 'text-amber-600',
    description: 'Em breve conectado ao módulo de propostas'
  }
];

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statsConfig(stats).map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <Icon className={`size-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
