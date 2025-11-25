import type { ElementType } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Mail, MessageCircle, Phone } from 'lucide-react';

type Activity = {
  id: string;
  activity_type?: string | null;
  subject?: string | null;
  description?: string | null;
  date_created?: string | null;
};

interface RecentActivitiesProps {
  activities: Activity[];
}

const activityIcons: Record<string, ElementType> = {
  call: Phone,
  email: Mail,
  meeting: CalendarClock,
  message: MessageCircle
};

const activityLabels: Record<string, string> = {
  call: 'Ligação',
  email: 'E-mail',
  meeting: 'Reunião',
  message: 'Mensagem'
};

function formatRelativeDate(dateString?: string | null) {
  if (!dateString) return 'há pouco';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');

  return rtf.format(diffDays, 'day');
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <p className="text-sm text-muted-foreground">Interações registradas pelo time comercial</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const type = activity.activity_type?.toLowerCase() || 'message';
          const Icon = activityIcons[type] || MessageCircle;
          const label = activityLabels[type] || 'Mensagem';

          return (
            <div key={activity.id} className="flex items-start gap-3 rounded-lg border p-3">
              <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                <Icon className="size-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{label}</Badge>
                  <span className="text-xs text-muted-foreground">{formatRelativeDate(activity.date_created)}</span>
                </div>
                <p className="text-sm font-semibold">{activity.subject || 'Atividade registrada'}</p>
                {activity.description && <p className="text-sm text-muted-foreground">{activity.description}</p>}
              </div>
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Nenhuma atividade registrada ainda. Conecte seus leads e comece a registrar interações.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
