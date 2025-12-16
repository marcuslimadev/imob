'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  ChevronLeft,
  Loader2,
  Building2,
  User,
  Calendar,
  Clock,
  Save,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { directusClient } from '@/lib/directus/client';
import { createItem, readItems } from '@directus/sdk';

interface Property {
  id: string;
  title: string;
  address_street: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
}

export default function NovaVistoriaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    property_id: '',
    lead_id: '',
    data_agendada: '',
    tempo_estimado: 60,
    observacoes: '',
  });

  useEffect(() => {
    const fetchOptions = async () => {
      if (!user?.company_id) return;

      try {
        setLoadingOptions(true);

        const [propertiesData, leadsData] = await Promise.all([
          directusClient.request(
            readItems('properties', {
              filter: { company_id: { _eq: user.company_id } },
              fields: ['id', 'title', 'address_street'] as any,
              limit: 100,
            })
          ),
          directusClient.request(
            readItems('leads', {
              filter: { company_id: { _eq: user.company_id } },
              fields: ['id', 'name', 'email'] as any,
              limit: 100,
            })
          ),
        ]);

        setProperties(propertiesData as unknown as Property[]);
        setLeads(leadsData as unknown as Lead[]);
      } catch (err) {
        console.error('Erro ao buscar opções:', err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [user?.company_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.company_id) {
      setError('Erro de autenticação');

      return;
    }

    if (!formData.property_id) {
      setError('Selecione um imóvel');

      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Gera código da vistoria
      const codigo = `VIS-${Date.now().toString(36).toUpperCase()}`;

      await directusClient.request(
        createItem('vistorias' as any, {
          ...formData,
          company_id: user.company_id,
          codigo,
          status: 'solicitada',
          lead_id: formData.lead_id || null,
          data_agendada: formData.data_agendada || null,
        } as any)
      );

      router.push('/empresa/vistorias');
    } catch (err) {
      console.error('Erro ao criar vistoria:', err);
      setError('Erro ao criar vistoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/empresa/vistorias" className="text-gray-500 hover:text-gray-700">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nova Vistoria</h1>
              <p className="text-sm text-gray-500 mt-1">
                Agende uma nova inspeção de imóvel
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dados da Vistoria</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Vistoria *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="entrada">Vistoria de Entrada</option>
                  <option value="saida">Vistoria de Saída</option>
                  <option value="periodica">Vistoria Periódica</option>
                </select>
              </div>

              {/* Imóvel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="inline h-4 w-4 mr-1" />
                  Imóvel *
                </label>
                {loadingOptions ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando imóveis...
                  </div>
                ) : (
                  <select
                    value={formData.property_id}
                    onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Selecione um imóvel</option>
                    {properties.map((prop) => (
                      <option key={prop.id} value={prop.id}>
                        {prop.title} - {prop.address_street}
                      </option>
                    ))}
                  </select>
                )}
                {properties.length === 0 && !loadingOptions && (
                  <p className="text-sm text-gray-500 mt-1">
                    Nenhum imóvel cadastrado. <Link href="/empresa/imoveis/novo" className="text-orange-600 hover:underline">Cadastre um imóvel</Link>
                  </p>
                )}
              </div>

              {/* Cliente/Locatário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Cliente/Locatário
                </label>
                {loadingOptions ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando clientes...
                  </div>
                ) : (
                  <select
                    value={formData.lead_id}
                    onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecione um cliente (opcional)</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} - {lead.email}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Data Agendada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data e Hora Agendada
                </label>
                <input
                  type="datetime-local"
                  value={formData.data_agendada}
                  onChange={(e) => setFormData({ ...formData, data_agendada: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Tempo Estimado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Tempo Estimado (minutos)
                </label>
                <input
                  type="number"
                  value={formData.tempo_estimado}
                  onChange={(e) => setFormData({ ...formData, tempo_estimado: parseInt(e.target.value) || 60 })}
                  min="15"
                  max="480"
                  step="15"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Informações adicionais sobre a vistoria..."
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Link
                  href="/empresa/vistorias"
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading || loadingOptions}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Criar Vistoria
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
