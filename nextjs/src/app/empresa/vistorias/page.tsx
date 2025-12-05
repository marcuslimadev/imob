'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  ClipboardCheck, 
  Calendar, 
  List, 
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { directusClient } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';

interface Vistoria {
  id: string;
  codigo: string;
  status: 'solicitada' | 'designada' | 'em_andamento' | 'concluida' | 'cancelada';
  tipo: 'entrada' | 'saida' | 'periodica';
  data_agendada: string | null;
  data_realizada: string | null;
  observacoes: string | null;
  date_created: string;
  property_id?: {
    id: string;
    title: string;
    address_street: string;
  };
  lead_id?: {
    id: string;
    name: string;
    email: string;
  };
  vistoriador_id?: {
    first_name: string;
    last_name: string;
  };
}

type ViewMode = 'list' | 'kanban' | 'calendar';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  solicitada: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Solicitada' },
  designada: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Designada' },
  em_andamento: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Em Andamento' },
  concluida: { bg: 'bg-green-100', text: 'text-green-800', label: 'Concluída' },
  cancelada: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
};

const tipoLabels: Record<string, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  periodica: 'Periódica',
};

export default function VistoriasPage() {
  const { user, loading: authLoading } = useAuth();
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const fetchVistorias = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      setError(null);

      const filter: Record<string, unknown> = { 
        company_id: { _eq: user.company_id } 
      };

      if (statusFilter !== 'all') {
        filter.status = { _eq: statusFilter };
      }

      const data = await directusClient.request(
        readItems('vistorias', {
          filter,
          fields: [
            '*',
            { property_id: ['id', 'title', 'address_street'] },
            { lead_id: ['id', 'name', 'email'] },
            { vistoriador_id: ['first_name', 'last_name'] },
          ],
          sort: ['-date_created'],
          limit: 100,
        })
      );

      setVistorias(data as Vistoria[]);
    } catch (err) {
      console.error('Erro ao buscar vistorias:', err);
      setError('Erro ao carregar vistorias');
    } finally {
      setLoading(false);
    }
  }, [user?.company_id, statusFilter]);

  useEffect(() => {
    if (user?.company_id) {
      fetchVistorias();
    }
  }, [user?.company_id, statusFilter, fetchVistorias]);

  const filteredVistorias = vistorias.filter(v => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      v.codigo?.toLowerCase().includes(search) ||
      v.property_id?.title?.toLowerCase().includes(search) ||
      v.lead_id?.name?.toLowerCase().includes(search)
    );
  });

  // Agrupa por status para o Kanban
  const kanbanColumns = {
    solicitada: filteredVistorias.filter(v => v.status === 'solicitada'),
    designada: filteredVistorias.filter(v => v.status === 'designada'),
    em_andamento: filteredVistorias.filter(v => v.status === 'em_andamento'),
    concluida: filteredVistorias.filter(v => v.status === 'concluida'),
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso negado</h2>
          <Link href="/" className="text-indigo-600 hover:underline">
            Fazer login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/empresa/dashboard" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vistorias</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gerenciamento de inspeções de imóveis
                </p>
              </div>
            </div>
            <Link
              href="/empresa/vistorias/nova"
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova Vistoria
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Filters and View Mode */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar vistoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos os status</option>
              <option value="solicitada">Solicitada</option>
              <option value="designada">Designada</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              title="Lista"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              title="Kanban"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              title="Calendário"
            >
              <Calendar className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : filteredVistorias.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma vistoria encontrada</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira vistoria'}
              </p>
              <Link
                href="/empresa/vistorias/nova"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="h-4 w-4" />
                Nova Vistoria
              </Link>
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          /* List View */
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Código</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Imóvel</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Cliente</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tipo</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Data Agendada</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Vistoriador</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredVistorias.map((vistoria) => (
                    <tr key={vistoria.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/empresa/vistorias/${vistoria.id}`} className="text-orange-600 hover:underline font-medium">
                          {vistoria.codigo || vistoria.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{vistoria.property_id?.title || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{vistoria.lead_id?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {tipoLabels[vistoria.tipo] || vistoria.tipo}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[vistoria.status]?.bg} ${statusColors[vistoria.status]?.text}`}>
                          {statusColors[vistoria.status]?.label || vistoria.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {vistoria.data_agendada 
                          ? new Date(vistoria.data_agendada).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {vistoria.vistoriador_id 
                          ? `${vistoria.vistoriador_id.first_name} ${vistoria.vistoriador_id.last_name || ''}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : viewMode === 'kanban' ? (
          /* Kanban View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
            {Object.entries(kanbanColumns).map(([status, items]) => (
              <div key={status} className="bg-gray-100 rounded-lg p-4 min-w-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${statusColors[status]?.text}`}>
                    {statusColors[status]?.label}
                  </h3>
                  <span className="bg-white px-2 py-1 rounded text-sm font-medium">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((vistoria) => (
                    <Link key={vistoria.id} href={`/empresa/vistorias/${vistoria.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-orange-600">
                              {vistoria.codigo || vistoria.id.slice(0, 8)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {tipoLabels[vistoria.tipo]}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {vistoria.property_id?.title || 'Imóvel não informado'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {vistoria.lead_id?.name || 'Cliente não informado'}
                          </p>
                          {vistoria.data_agendada && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {new Date(vistoria.data_agendada).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  {items.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma vistoria
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Calendar View Placeholder */
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visualização de Calendário</h3>
              <p className="text-gray-500">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
