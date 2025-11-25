import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeadsByStageProps {
        stages: { stage: string; count: number }[];
}

const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];

export default function LeadsByStage({ stages }: LeadsByStageProps) {
        const total = stages.reduce((acc, stage) => acc + stage.count, 0);

        return (
                <Card className="col-span-1 lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div>
                                        <CardTitle>Leads por estágio</CardTitle>
                                        <CardDescription>Distribuição atual do funil de vendas</CardDescription>
                                </div>
                                <Badge variant="outline">{total} leads</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                                {stages.map((stage, index) => {
                                        const percentage = total > 0 ? Math.round((stage.count / total) * 100) : 0;
                                        const color = colors[index % colors.length];

                                        return (
                                                <div key={stage.stage} className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm font-medium">
                                                                <span className="capitalize">{stage.stage}</span>
                                                                <span className="text-muted-foreground">{percentage}%</span>
                                                        </div>
                                                        <div className="h-3 overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                        className={`h-full ${color}`}
                                                                        style={{ width: `${percentage}%` }}
                                                                />
                                                        </div>
                                                </div>
                                        );
                                })}

                                {stages.length === 0 && (
                                        <p className="text-sm text-muted-foreground">Nenhum lead cadastrado ainda.</p>
                                )}
                        </CardContent>
                </Card>
        );
}
