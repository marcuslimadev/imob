'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { directusClient } from '@/lib/directus/client';
import { readItem, updateItem, createItem, readItems } from '@directus/sdk';
import Link from 'next/link';

interface LeadDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LeadDetailsPage({ params }: LeadDetailsProps) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('');
  const [notes, setNotes] = useState('');
  const [activityType, setActivityType] = useState('call');
  const [activityNotes, setActivityNotes] = useState('');
  const [savingStage, setSavingStage] = useState(false);
  const [addingActivity, setAddingActivity] = useState(false);

  useEffect(() => {
    loadLead();
    loadActivities();
  }, [id]);

  async function loadLead() {
    try {
      // @ts-ignore
      const data = await directusClient.request(
        readItem('leads', id, {
          fields: ['*']
        })
      );
      setLead(data);
      setStage((data as any).stage || 'new');
      setNotes((data as any).notes || '');
    } catch (error) {
      console.error('Error loading lead:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadActivities() {
    try {
      // @ts-ignore
      const data = await directusClient.request(
        readItems('lead_activities', {
          filter: { lead_id: { _eq: id } },
          // @ts-ignore
          sort: ['-created_at'],
          fields: ['*']
        })
      );
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  }

  async function handleUpdateStage() {
    setSavingStage(true);
    try {
      // @ts-ignore
      await directusClient.request(
        updateItem('leads', id, {
          stage,
          notes
        })
      );
      await loadLead();
      alert('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Erro ao atualizar status');
    } finally {
      setSavingStage(false);
    }
  }

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    setAddingActivity(true);

    try {
      // @ts-ignore
      await directusClient.request(
        createItem('lead_activities' as any, {
          lead_id: id,
          activity_type: activityType,
          notes: activityNotes,
          created_at: new Date().toISOString()
        } as any)
      );

      setActivityNotes('');
      await loadActivities();
      alert('Atividade adicionada!');
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Erro ao adicionar atividade');
    } finally {
      setAddingActivity(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lead não encontrado</h2>
          <Link href="/empresa/leads" className="text-blue-600 hover:text-blue-800">
            ← Voltar para leads
          </Link>
        </div>
      </div>
    );
  }

  const getStageLabel = (s: string) => {
    const stages: Record<string, string> = {
      new: 'Novo',
      contacted: 'Contatado',
      qualified: 'Qualificado',
      visit_scheduled: 'Visita Agendada',
      negotiating: 'Negociando',
      won: 'Fechado',
      lost: 'Perdido'
    };
    return stages[s] || s;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      call: '📞',
      email: '📧',
      whatsapp: '💬',
      visit: '🏠',
      meeting: '🤝',
      note: '📝'
    };
    return icons[type] || '📝';
  };

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      call: 'Ligação',
      email: 'E-mail',
      whatsapp: 'WhatsApp',
      visit: 'Visita',
      meeting: 'Reunião',
      note: 'Nota'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/empresa/leads"
                className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                ← Voltar para leads
              </Link>
              <h1 className="text-3xl font-bold">{lead.name}</h1>
              <p className="text-gray-600 mt-1">
                Interesse em {lead.interest_type === 'buy' ? 'Compra' : 'Aluguel'}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={`tel:${lead.phone}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition-colors"
              >
                📞 Ligar
              </a>
              <a
                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold transition-colors"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Lead */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Informações de Contato</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {lead.email}
                  </a>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {lead.phone}
                  </a>
                </div>
                {lead.budget_min && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orçamento Mínimo
                      </label>
                      <p className="text-gray-900">
                        R$ {lead.budget_min.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orçamento Máximo
                      </label>
                      <p className="text-gray-900">
                        R$ {lead.budget_max.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {lead.message && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                    {lead.message}
                  </p>
                </div>
              )}
            </div>

            {/* Adicionar Atividade */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Adicionar Atividade</h2>
              <form onSubmit={handleAddActivity}>
                <div className="grid gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Atividade
                    </label>
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="call">📞 Ligação</option>
                      <option value="email">📧 E-mail</option>
                      <option value="whatsapp">💬 WhatsApp</option>
                      <option value="visit">🏠 Visita</option>
                      <option value="meeting">🤝 Reunião</option>
                      <option value="note">📝 Nota</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas
                    </label>
                    <textarea
                      value={activityNotes}
                      onChange={(e) => setActivityNotes(e.target.value)}
                      rows={3}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descreva o que aconteceu nesta atividade..."
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={addingActivity}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition-colors disabled:bg-gray-400"
                >
                  {addingActivity ? 'Salvando...' : 'Adicionar Atividade'}
                </button>
              </form>
            </div>

            {/* Histórico de Atividades */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Histórico de Atividades</h2>
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma atividade registrada ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {getActivityIcon(activity.activity_type)}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getActivityLabel(activity.activity_type)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(activity.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                      {activity.notes && (
                        <p className="mt-2 text-gray-700">{activity.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status e Notas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Status do Lead</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estágio
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="new">Novo</option>
                    <option value="contacted">Contatado</option>
                    <option value="qualified">Qualificado</option>
                    <option value="visit_scheduled">Visita Agendada</option>
                    <option value="negotiating">Negociando</option>
                    <option value="won">Fechado</option>
                    <option value="lost">Perdido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Internas
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Adicione observações sobre este lead..."
                  />
                </div>

                <button
                  onClick={handleUpdateStage}
                  disabled={savingStage}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold transition-colors disabled:bg-gray-400"
                >
                  {savingStage ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3">Informações</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Criado em:</span>
                  <span className="font-medium">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última atualização:</span>
                  <span className="font-medium">
                    {new Date(lead.date_updated || lead.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {lead.property_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Imóvel:</span>
                    <Link
                      href={`/empresa/imoveis/${lead.property_id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Ver imóvel
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
