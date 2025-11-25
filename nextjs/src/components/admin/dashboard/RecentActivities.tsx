import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageCircle, Phone, CalendarClock } from 'lucide-react';

interface Activity {
        id: string | number;
        activity_type?: string;
        subject?: string;
        description?: string;
        date_created?: string;
}

interface RecentActivitiesProps {
        activities: Activity[];
}

const activityIcons: Record<string, JSX.Element> = {
        call: <Phone className="h-4 w-4" />,
        email: <Mail className="h-4 w-4" />,
        meeting: <CalendarClock className="h-4 w-4" />,
        message: <MessageCircle className="h-4 w-4" />,
};

function getRelativeTime(dateString?: string) {
        if (!dateString) return 'Data não informada';

        const diff = Date.now() - new Date(dateString).getTime();
        const minutes = Math.max(Math.floor(diff / 60000), 0);

        if (minutes < 60) return `há ${minutes || 1} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `há ${hours}h`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `há ${days}d`;

        const months = Math.floor(days / 30);
        return `há ${months}m`;
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
        return (
                <Card className="col-span-1">
                        <CardHeader>
                                <CardTitle>Atividades recentes</CardTitle>
                                <CardDescription>Interações com leads e clientes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                                {activities.map((activity) => {
                                        const type = activity.activity_type || 'message';
                                        const icon = activityIcons[type] || <MessageCircle className="h-4 w-4" />;

                                        return (
                                                <div
                                                        key={activity.id}
                                                        className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3"
                                                >
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                                {icon}
                                                        </div>
                                                        <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                        <p className="font-semibold leading-tight">
                                                                                {activity.subject || 'Interação registrada'}
                                                                        </p>
                                                                        <Badge variant="secondary" className="capitalize">
                                                                                {type}
                                                                        </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">
                                                                        {activity.description || 'Descrição não disponível.'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{getRelativeTime(activity.date_created)}</p>
                                                        </div>
                                                </div>
                                        );
                                })}

                                {activities.length === 0 && (
                                        <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
                                )}
                        </CardContent>
                </Card>
        );
}
