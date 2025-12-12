'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalProperties: number;
  totalLeads: number;
  activeConversations: number;
  scheduledVisits: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalLeads: 0,
    activeConversations: 0,
    scheduledVisits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // TODO: Carregar estatísticas reais do Directus
      setStats({
        totalProperties: 0,
        totalLeads: 0,
        activeConversations: 0,
        scheduledVisits: 0,
      });
      setLoading(false);
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard - {user.first_name || 'Usuário'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Imóveis
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalProperties}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Leads
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalLeads}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Conversas Ativas
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.activeConversations}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Visitas Agendadas
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.scheduledVisits}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/empresa/imoveis/novo')}
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-lg">📍</span>
              <p className="mt-2 font-medium">Novo Imóvel</p>
            </button>

            <button
              onClick={() => router.push('/empresa/leads/novo')}
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-lg">👤</span>
              <p className="mt-2 font-medium">Novo Lead</p>
            </button>

            <button
              onClick={() => router.push('/empresa/conversas')}
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-lg">💬</span>
              <p className="mt-2 font-medium">Ver Conversas</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
