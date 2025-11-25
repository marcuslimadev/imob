import { fetchLeadsByStage } from '@/lib/directus/realEstate';

export async function LeadsByStage({ companySlug }: { companySlug: string }) {
        const leadsByStage = await fetchLeadsByStage(companySlug);
        const total = leadsByStage.reduce((sum, stage) => sum + stage.count, 0);

        return (
                <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900">Leads por Estágio</h3>
                        </div>
                <div className="p-6">
                        <div className="space-y-4">
                                {leadsByStage.map((stage) => {
                                        const percentage = total > 0 ? (stage.count / total) * 100 : 0;

                                        return (
                                                <div key={stage.stage}>
                                                        <div className="mb-2 flex items-center justify-between">
                                                                <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                                                                        <span className="text-sm font-semibold text-gray-900">{stage.count}</span>
                                                                </div>
                                                                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                                                        <div
                                                                                className="h-full rounded-full bg-blue-600 transition-all"
                                                                                style={{ width: `${percentage}%` }}
                                                                        />
                                                                </div>
                                                        </div>
                                                );
                                        })}
                                </div>
                                {leadsByStage.length === 0 && (
                                        <p className="py-8 text-center text-gray-500">Nenhum lead cadastrado ainda</p>
                                )}
                        </div>
                </div>
        );
}
