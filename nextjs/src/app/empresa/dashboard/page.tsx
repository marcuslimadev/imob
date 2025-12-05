'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Home, 
  UserPlus, 
  FileCheck, 
  ClipboardCheck,
  ArrowUpRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { directusClient } from '@/lib/directus/client';
import { aggregate } from '@directus/sdk';

interface DashboardStats {
  properties: number;
  leads: number;
  leadsThisMonth: number;
  conversations: number;
  vistorias: number;
  documentos: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    properties: 0,
    leads: 0,
    leadsThisMonth: 0,
    conversations: 0,
    vistorias: 0,
    documentos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  console.log('[DashboardPage]', { user, authLoading, loading });

  const fetchStats = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      setError(null);

      const companyFilter = { company_id: { _eq: user.company_id } };

      // Busca estatísticas em paralelo
      const results = await Promise.allSettled([
        directusClient.request(
          aggregate('properties', {
            query: { filter: companyFilter },
            aggregate: { count: '*' },
          })
        ),
        directusClient.request(
          aggregate('leads', {
            query: { filter: companyFilter },
            aggregate: { count: '*' },
          })
        ),
        directusClient.request(
          aggregate('leads', {
            query: {
              filter: {
                _and: [
                  companyFilter,
                  { date_created: { _gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString() } }
                ]
              }
            },
            aggregate: { count: '*' },
          })
        ),
        directusClient.request(
          aggregate('conversas', {
            query: { 
              filter: {
                _and: [
                  companyFilter,
                  { status: { _eq: 'active' } }
                ]
              }
            },
            aggregate: { count: '*' },
          })
        ),
        directusClient.request(
          aggregate('vistorias', {
            query: { 
              filter: {
                _and: [
                  companyFilter,
                  { status: { _in: ['solicitada', 'designada', 'em_andamento'] } }
                ]
              }
            },
            aggregate: { count: '*' },
          })
        ),
        directusClient.request(
          aggregate('documentos_assinatura', {
            query: { 
              filter: {
                _and: [
                  companyFilter,
                  { status: { _in: ['pending', 'partial', 'sent'] } }
                ]
              }
            },
            aggregate: { count: '*' },
          })
        ),
      ]);

      setStats({
        properties: results[0].status === 'fulfilled' ? Number(results[0].value[0]?.count) || 0 : 0,
        leads: results[1].status === 'fulfilled' ? Number(results[1].value[0]?.count) || 0 : 0,
        leadsThisMonth: results[2].status === 'fulfilled' ? Number(results[2].value[0]?.count) || 0 : 0,
        conversations: results[3].status === 'fulfilled' ? Number(results[3].value[0]?.count) || 0 : 0,
        vistorias: results[4].status === 'fulfilled' ? Number(results[4].value[0]?.count) || 0 : 0,
        documentos: results[5].status === 'fulfilled' ? Number(results[5].value[0]?.count) || 0 : 0,
      });

      setLastUpdate(new Date());
    } catch (err: unknown) {
      console.error('Erro ao buscar estatísticas:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [user?.company_id]);

  useEffect(() => {
    if (user?.company_id) {
      fetchStats();
    }
  }, [user?.company_id, fetchStats]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
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
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Bem-vindo, {user.first_name || user.email}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStats}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/empresa/leads/novo"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Novo Lead
              </Link>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-xs text-gray-400 mt-2">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={fetchStats} className="ml-2 underline">
              Tentar novamente
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Imóveis
              </CardTitle>
              <Building2 className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.properties}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.properties === 0 ? 'Cadastre seus primeiros imóveis' : 'imóveis cadastrados'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Leads Ativos
              </CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.leads}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {stats.leadsThisMonth > 0 ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">+{stats.leadsThisMonth} este mês</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">
                    {stats.leads === 0 ? 'Nenhum lead cadastrado' : `${stats.leadsThisMonth} novos este mês`}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Conversas WhatsApp
              </CardTitle>
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.conversations}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.conversations === 0 ? 'Configure o WhatsApp' : 'conversas ativas'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Vistorias Pendentes
              </CardTitle>
              <ClipboardCheck className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.vistorias}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.vistorias === 0 ? 'Nenhuma pendente' : 'aguardando conclusão'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Documentos p/ Assinatura
              </CardTitle>
              <FileCheck className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.documentos}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.documentos === 0 ? 'Nenhum pendente' : 'pendentes de assinatura'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Taxa de Conversão
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.leads > 0 ? `${Math.round((stats.leadsThisMonth / stats.leads) * 100)}%` : '0%'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.leads === 0 ? 'Sem dados ainda' : 'dos leads convertidos'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/empresa/imoveis/novo">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-500 h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Home className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Cadastrar Imóvel</h3>
                    <p className="text-sm text-gray-500">Adicione um novo imóvel</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/empresa/leads">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500 h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ver Leads</h3>
                    <p className="text-sm text-gray-500">Gerencie seus leads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/empresa/vistorias">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-orange-500 h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <ClipboardCheck className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Vistorias</h3>
                    <p className="text-sm text-gray-500">Inspeções de imóveis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/empresa/assinaturas">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500 h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Assinaturas</h3>
                    <p className="text-sm text-gray-500">Documentos eletrônicos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h2>
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma atividade recente</p>
              <p className="text-sm mt-1">As últimas ações aparecerão aqui</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
