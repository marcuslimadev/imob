'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BauhausPageHeader } from '@/components/layout/BauhausPageHeader';
import { BauhausCard, BauhausStatCard } from '@/components/layout/BauhausCard';
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso negado</h2>
          <p className="text-gray-600 mb-6">Você precisa estar autenticado para acessar esta página.</p>
          <Link 
            href="/login" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Fazer login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Bauhaus Header */}
      <BauhausPageHeader
        title="Dashboard"
        description={`Bem-vindo, ${user.first_name || user.email}`}
        accentColor="#6366F1"
        actions={
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-light uppercase tracking-wide text-gray-900 bg-white border-2 border-gray-900 rounded-none hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50"
            title="Atualizar dados"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-8 py-8">{
            </button>
            <Link
              href="/empresa/leads/novo"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Novo Lead
            </Link>
          </div>
        </div>
        {lastUpdate && (
          <p className="text-xs text-gray-500">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        )}
      </div>

      {error && (
        <BauhausCard className="mb-6 border-l-4 border-l-red-600">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
            <button 
              onClick={fetchStats} 
              className="ml-4 px-4 py-2 text-sm font-light uppercase tracking-wide bg-red-600 text-white hover:bg-red-700 transition-colors rounded-none"
            >
              Tentar novamente
            </button>
          </div>
        </BauhausCard>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <BauhausStatCard
          label="Total de Imóveis"
          value={loading ? '...' : stats.properties}
          color="blue"
        />
        <BauhausStatCard
          label="Total de Leads"
          value={loading ? '...' : stats.leads}
          color="green"
        />
        <BauhausStatCard
          label="Leads Este Mês"
          value={loading ? '...' : stats.leadsThisMonth}
          color="yellow"
        />
        <BauhausStatCard
          label="Conversas Ativas"
          value={loading ? '...' : stats.conversations}
          color="gray"
        />
      </div>
              {stats.properties === 0 ? 'Cadastre seus primeiros imóveis' : 'imóveis cadastrados'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Leads Ativos
            </CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? <Loader2 className="h-8 w-8 animate-spin text-green-600" /> : stats.leads}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {stats.leadsThisMonth > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600">+{stats.leadsThisMonth} este mês</span>
                </>
              ) : (
                <span className="text-xs text-gray-500">
                  {stats.leads === 0 ? 'Nenhum lead cadastrado' : 'Nenhum novo este mês'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Conversas WhatsApp
            </CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? <Loader2 className="h-8 w-8 animate-spin text-purple-600" /> : stats.conversations}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.conversations === 0 ? 'Configure o WhatsApp' : 'conversas ativas'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vistorias Pendentes
            </CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? <Loader2 className="h-8 w-8 animate-spin text-orange-600" /> : stats.vistorias}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.vistorias === 0 ? 'Nenhuma pendente' : 'aguardando conclusão'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Documentos p/ Assinatura
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileCheck className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> : stats.documentos}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.documentos === 0 ? 'Nenhum pendente' : 'aguardando assinatura'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taxa de Conversão
            </CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.leads > 0 ? `${Math.round((stats.leadsThisMonth / stats.leads) * 100)}%` : '0%'}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              novos leads / total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-blue-900">
              🎯 Próxima Meta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {stats.leads < 10 ? '10 leads' : stats.leads < 50 ? '50 leads' : '100 leads'}
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Você está {stats.leads < 10 ? `${10 - stats.leads} leads` : stats.leads < 50 ? `${50 - stats.leads} leads` : `${100 - stats.leads} leads`} de alcançar!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/empresa/imoveis/novo" className="group">
            <Card className="h-full hover:shadow-lg hover:scale-105 transition-all cursor-pointer border-2 border-transparent hover:border-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <Home className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Cadastrar Imóvel</h3>
                    <p className="text-sm text-gray-500">Adicione um novo imóvel</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/empresa/leads" className="group">
            <Card className="h-full hover:shadow-lg hover:scale-105 transition-all cursor-pointer border-2 border-transparent hover:border-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-600 transition-colors">
                    <Users className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ver Leads</h3>
                    <p className="text-sm text-gray-500">Gerencie seus leads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/empresa/vistorias" className="group">
            <Card className="h-full hover:shadow-lg hover:scale-105 transition-all cursor-pointer border-2 border-transparent hover:border-orange-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-600 transition-colors">
                    <ClipboardCheck className="h-6 w-6 text-orange-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Vistorias</h3>
                    <p className="text-sm text-gray-500">Inspeções de imóveis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/empresa/assinaturas" className="group">
            <Card className="h-full hover:shadow-lg hover:scale-105 transition-all cursor-pointer border-2 border-transparent hover:border-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-600 transition-colors">
                    <FileCheck className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
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
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h2>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">Nenhuma atividade recente</p>
            <p className="text-sm text-gray-400">Suas ações aparecerão aqui</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
