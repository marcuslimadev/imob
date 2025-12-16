'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BauhausPageHeader } from '@/components/layout/BauhausPageHeader';
import { BauhausCard, BauhausStatCard } from '@/components/layout/BauhausCard';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  Home, 
  FileCheck, 
  ClipboardCheck,
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

  const fetchStats = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      setError(null);

      const companyFilter = { company_id: { _eq: user.company_id } };

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
              } as any
            },
            aggregate: { count: '*' },
          })
        ),
        directusClient.request(
          aggregate('conversas', {
            query: { filter: companyFilter },
            aggregate: { count: '*' },
          })
        ),
        directusClient.request(
          aggregate('vistorias' as any, {
            query: { filter: companyFilter },
            aggregate: { count: '*' },
          })
        ),
        directusClient.request(
          aggregate('documentos_assinatura' as any, {
            query: { filter: companyFilter },
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
      <BauhausPageHeader
        title="Dashboard"
        description={`Bem-vindo, ${user.first_name || user.email}`}
        accentColor="#6366F1"
        actions={
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-light uppercase tracking-wide text-gray-900 bg-white border-2 border-gray-900 rounded-none hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-8 py-8">
        {lastUpdate && (
          <p className="text-xs text-gray-500 mb-4">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        )}

        {error && (
          <BauhausCard className="mb-6 border-l-4 border-l-red-600">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
              <button 
                onClick={fetchStats} 
                className="ml-4 px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700"
              >
                Tentar novamente
              </button>
            </div>
          </BauhausCard>
        )}

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

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/empresa/imoveis/novo" className="group">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-500">
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
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-green-500">
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
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-orange-500">
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
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-500">
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
    </div>
  );
}
