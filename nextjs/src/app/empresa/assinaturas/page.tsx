'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  FileCheck, 
  ChevronLeft,
  Loader2,
  Building2,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Send,
  Eye,
  Download,
  MoreVertical
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { directusClient } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';

interface Signatario {
  id: string;
  nome: string;
  email: string;
  papel: string;
  status: 'waiting' | 'notified' | 'viewed' | 'signed' | 'refused';
  data_assinatura: string | null;
}

interface Documento {
  id: string;
  codigo: string;
  assunto: string;
  descricao: string | null;
  status: 'draft' | 'sent' | 'pending' | 'partial' | 'signed' | 'cancelled' | 'expired';
  tipo: string;
  data_envio: string | null;
  data_limite: string | null;
  data_conclusao: string | null;
  date_created: string;
  property_id?: {
    id: string;
    title: string;
  };
  lead_id?: {
    id: string;
    name: string;
  };
  signatarios?: Signatario[];
}

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ElementType }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Rascunho', icon: FileCheck },
  sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Enviado', icon: Send },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente', icon: Clock },
  partial: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Parcial', icon: Eye },
  signed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Assinado', icon: CheckCircle2 },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado', icon: XCircle },
  expired: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Expirado', icon: AlertCircle },
};

const tipoLabels: Record<string, string> = {
  locacao: 'Contrato de Locação',
  venda: 'Contrato de Venda',
  aditivo: 'Aditivo',
  distrato: 'Distrato',
  procuracao: 'Procuração',
  ficha_cadastral: 'Ficha Cadastral',
  vistoria: 'Vistoria',
  outro: 'Outro',
};

export default function AssinaturasPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchDocumentos = useCallback(async () => {
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
        readItems('documentos_assinatura', {
          filter,
          fields: [
            '*',
            { property_id: ['id', 'title'] },
            { lead_id: ['id', 'name'] },
          ],
          sort: ['-date_created'],
          limit: 100,
        })
      );

      setDocumentos(data as Documento[]);
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
      setError('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  }, [user?.company_id, statusFilter]);

  useEffect(() => {
    if (user?.company_id) {
      fetchDocumentos();
    }
  }, [user?.company_id, statusFilter, fetchDocumentos]);

  const filteredDocumentos = documentos.filter(d => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      d.codigo?.toLowerCase().includes(search) ||
      d.assunto?.toLowerCase().includes(search) ||
      d.property_id?.title?.toLowerCase().includes(search) ||
      d.lead_id?.name?.toLowerCase().includes(search)
    );
  });

  // Estatísticas
  const stats = {
    total: documentos.length,
    pendentes: documentos.filter(d => ['pending', 'partial', 'sent'].includes(d.status)).length,
    assinados: documentos.filter(d => d.status === 'signed').length,
    expirados: documentos.filter(d => d.status === 'expired').length,
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                <h1 className="text-2xl font-bold text-gray-900">Assinaturas Eletrônicas</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gerencie documentos e assinaturas digitais
                </p>
              </div>
            </div>
            <Link
              href="/empresa/assinaturas/nova"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Novo Documento
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileCheck className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Assinados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.assinados}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expirados</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.expirados}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="sent">Enviado</option>
              <option value="pending">Pendente</option>
              <option value="partial">Parcialmente Assinado</option>
              <option value="signed">Assinado</option>
              <option value="cancelled">Cancelado</option>
              <option value="expired">Expirado</option>
            </select>
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
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredDocumentos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum documento encontrado</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece enviando seu primeiro documento para assinatura'}
              </p>
              <Link
                href="/empresa/assinaturas/nova"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="h-4 w-4" />
                Novo Documento
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Código</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Assunto</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tipo</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Imóvel/Cliente</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Data Limite</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDocumentos.map((documento) => {
                    const StatusIcon = statusConfig[documento.status]?.icon || FileCheck;
                    return (
                      <tr key={documento.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link href={`/empresa/assinaturas/${documento.id}`} className="text-blue-600 hover:underline font-medium">
                            {documento.codigo || documento.id.slice(0, 8)}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{documento.assunto}</p>
                          {documento.descricao && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{documento.descricao}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {tipoLabels[documento.tipo] || documento.tipo}
                        </td>
                        <td className="px-6 py-4">
                          {documento.property_id && (
                            <div className="flex items-center gap-1 text-sm">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="truncate max-w-[150px]">{documento.property_id.title}</span>
                            </div>
                          )}
                          {documento.lead_id && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <User className="h-4 w-4 text-gray-400" />
                              <span>{documento.lead_id.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig[documento.status]?.bg} ${statusConfig[documento.status]?.text}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[documento.status]?.label || documento.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {documento.data_limite 
                            ? new Date(documento.data_limite).toLocaleDateString('pt-BR')
                            : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/empresa/assinaturas/${documento.id}`}
                              className="p-1 text-gray-500 hover:text-blue-600"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {documento.status === 'signed' && (
                              <button 
                                className="p-1 text-gray-500 hover:text-green-600"
                                title="Baixar documento"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                            {['pending', 'partial'].includes(documento.status) && (
                              <button 
                                className="p-1 text-gray-500 hover:text-blue-600"
                                title="Reenviar notificação"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
