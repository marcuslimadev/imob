import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Mail, MessageSquare, Phone } from 'lucide-react';
import { fetchRecentActivities } from '@/lib/directus/realEstate';

const activityIcons = {
        call: Phone,
        email: Mail,
        meeting: Calendar,
        message: MessageSquare,
};

type ActivityType = keyof typeof activityIcons;

export async function RecentActivities({ companySlug }: { companySlug: string }) {
        const activities = await fetchRecentActivities(companySlug);

        return (
                <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                                {activities.map((activity: any) => {
                                        const Icon = activityIcons[activity.activity_type as ActivityType] || MessageSquare;
                                        const timeAgo = formatDistanceToNow(new Date(activity.date_created), {
                                                addSuffix: true,
                                                locale: ptBR,
                                        });

                                        return (
                                                <div key={activity.id} className="px-6 py-4">
                                                        <div className="flex items-start space-x-3">
                                                                <div className="flex-shrink-0">
                                                                        <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                                                                                <Icon className="size-5 text-blue-600" />
                                                                        </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                        <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                                                                        {activity.description && (
                                                                                <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                                                                        )}
                                                                        <p className="mt-1 text-xs text-gray-500">{timeAgo}</p>
                                                                </div>
                                                        </div>
                                                </div>
                                        );
                                })}
                                {activities.length === 0 && (
                                        <div className="px-6 py-8 text-center text-gray-500">Nenhuma atividade recente</div>
                                )}
                        </div>
                </div>
        );
}
