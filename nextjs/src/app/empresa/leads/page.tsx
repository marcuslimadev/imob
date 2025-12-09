import { directusServer } from '@/lib/directus/client';
import { readItems, aggregate } from '@directus/sdk';
import { getAuthenticatedCompanyId } from '@/lib/auth/server';
import Link from 'next/link';

async function getCompanyLeads(companyId: string) {
  try {
    // @ts-ignore - Custom schema
    
    return await directusServer.request(
      readItems('leads', {
        filter: {
          company_id: { _eq: companyId }
        },
        // @ts-ignore
        sort: ['-created_at'],
        fields: ['*']
      })
    );
  } catch (error) {
    console.error('Error fetching leads:', error);
    
    return [];
  }
}

async function getLeadsStats(companyId: string) {
  try {
    // @ts-ignore - Custom schema
    const total = await directusServer.request(
      aggregate('leads', {
        aggregate: { count: '*' },
        query: {
          filter: { company_id: { _eq: companyId } }
        }
      })
    );

    // @ts-ignore
    const newLeads = await directusServer.request(
      aggregate('leads', {
        aggregate: { count: '*' },
        query: {
          filter: {
            company_id: { _eq: companyId },
            stage: { _eq: 'new' }
          }
        }
      })
    );

    // @ts-ignore
    const contacted = await directusServer.request(
      aggregate('leads', {
        aggregate: { count: '*' },
        query: {
          filter: {
            company_id: { _eq: companyId },
            stage: { _eq: 'contacted' }
          }
        }
      })
    );

    // @ts-ignore
    const won = await directusServer.request(
      aggregate('leads', {
        aggregate: { count: '*' },
        query: {
          filter: {
            company_id: { _eq: companyId },
            stage: { _eq: 'won' }
          }
        }
      })
    );

    
    return {
      total: Number(total[0]?.count || 0),
      new: Number(newLeads[0]?.count || 0),
      contacted: Number(contacted[0]?.count || 0),
      won: Number(won[0]?.count || 0)
    };
  } catch (error) {
    console.error('Error fetching leads stats:', error);
    
    return { total: 0, new: 0, contacted: 0, won: 0 };
  }
}

function getStageLabel(stage: string): string {
  const stages: Record<string, string> = {
    new: 'Novo',
    contacted: 'Contatado',
    qualified: 'Qualificado',
    visit_scheduled: 'Visita Agendada',
    negotiating: 'Negociando',
    won: 'Fechado',
    lost: 'Perdido'
  };

  return stages[stage] || stage;
}

function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-purple-100 text-purple-800',
    qualified: 'bg-yellow-100 text-yellow-800',
    visit_scheduled: 'bg-orange-100 text-orange-800',
    negotiating: 'bg-indigo-100 text-indigo-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-gray-100 text-gray-800'
  };

  return colors[stage] || 'bg-gray-100 text-gray-800';
}

function getInterestTypeLabel(type: string): string {
  const types: Record<string, string> = {
    buy: 'Compra',
    rent: 'Aluguel'
  };

  return types[type] || type;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatPhone(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }


  return phone;
}

export default async function LeadsPage() {
  const companyId = await getAuthenticatedCompanyId();
  
  const leads = await getCompanyLeads(companyId);
  const stats = await getLeadsStats(companyId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gerenciar Leads</h1>
              <p className="text-gray-600">
                Acompanhe e gerencie seus potenciais clientes
              </p>
            </div>
            <Link
              href="/empresa/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-semibold transition-colors"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Novos</p>
                <p className="text-3xl font-bold text-blue-900">{stats.new}</p>
              </div>
              <div className="bg-blue-50 rounded-full p-3">
                <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Contato</p>
                <p className="text-3xl font-bold text-purple-900">{stats.contacted}</p>
              </div>
              <div className="bg-purple-50 rounded-full p-3">
                <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fechados</p>
                <p className="text-3xl font-bold text-green-900">{stats.won}</p>
              </div>
              <div className="bg-green-50 rounded-full p-3">
                <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Todos os Leads</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interesse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orçamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium">Nenhum lead ainda</p>
                        <p className="text-sm">Quando alguém entrar em contato, aparecerá aqui</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.email}</div>
                        <div className="text-sm text-gray-500">{formatPhone(lead.phone)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getInterestTypeLabel(lead.interest_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.budget_min && lead.budget_max ? (
                          <div className="text-sm text-gray-900">
                            R$ {lead.budget_min?.toLocaleString('pt-BR')} - {lead.budget_max?.toLocaleString('pt-BR')}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(lead.stage)}`}>
                          {getStageLabel(lead.stage)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/empresa/leads/${lead.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Ver Detalhes
                        </Link>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900"
                        >
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
