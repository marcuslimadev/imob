import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeadsByStageProps {
  data: { stage: string; count: number }[];
}

const stageColors: Record<string, string> = {
  novo: 'from-blue-500 to-blue-600',
  contato: 'from-emerald-500 to-emerald-600',
  proposta: 'from-amber-500 to-amber-600',
  fechamento: 'from-purple-500 to-purple-600'
};

export default function LeadsByStage({ data }: LeadsByStageProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Leads por Estágio</CardTitle>
        <p className="text-sm text-muted-foreground">Distribuição do funil de vendas</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => {
          const percentage = total ? Math.round((item.count / total) * 100) : 0;
          const barColor = stageColors[item.stage?.toLowerCase()] || 'from-primary to-primary/80';

          return (
            <div key={item.stage} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">{item.stage || 'Sem estágio'}</span>
                  <span className="text-xs text-muted-foreground">{percentage}%</span>
                </div>
                <span className="text-sm font-semibold">{item.count} leads</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">Nenhum lead cadastrado ainda.</div>
        )}
      </CardContent>
    </Card>
  );
}
