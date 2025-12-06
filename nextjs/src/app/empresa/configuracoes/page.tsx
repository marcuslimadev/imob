'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  User, 
  Bell, 
  Palette, 
  MessageSquare, 
  Key,
  Globe,
  Save,
  Loader2,
  Upload
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { directusClient } from '@/lib/directus/client';
import { readItems, updateItem } from '@directus/sdk';
import { ApiSettings } from './api-settings';

const DESIGN_THEMES = [
  {
    key: 'bauhaus',
    name: 'Bauhaus',
    description: 'Funcionalismo alemão. Geometria pura, tipografia sem serifa, cores primárias.',
    preview: { bg: '#f2f2f2', primary: '#e63946', accent: '#1d3557', text: '#111111' }
  },
  {
    key: 'ulm',
    name: 'Ulm',
    description: 'Minimalismo funcional. Grade precisa, hierarquia clara, paleta neutra.',
    preview: { bg: '#f3f4f6', primary: '#2563eb', accent: '#0f172a', text: '#111827' }
  },
  {
    key: 'cranbrook',
    name: 'Cranbrook',
    description: 'Experimentalismo narrativo. Camadas complexas, tipografia expressiva.',
    preview: { bg: '#0b0c10', primary: '#f97316', accent: '#a855f7', text: '#f9fafb' }
  },
  {
    key: 'rca',
    name: 'RCA',
    description: 'Elegância britânica. Sofisticação moderada, atenção aos detalhes.',
    preview: { bg: '#f5f5f4', primary: '#1f2933', accent: '#b68c4a', text: '#111827' }
  },
  {
    key: 'risd',
    name: 'RISD',
    description: 'Criatividade vibrante. Cores ousadas, formas orgânicas, energia artística.',
    preview: { bg: '#fefce8', primary: '#ec4899', accent: '#22c55e', text: '#1f2937' }
  },
  {
    key: 'iit',
    name: 'IIT',
    description: 'Racionalismo modular. Sistema claro, estrutura lógica, eficiência visual.',
    preview: { bg: '#f3f4f6', primary: '#0ea5e9', accent: '#14b8a6', text: '#020617' }
  },
  {
    key: 'pratt',
    name: 'Pratt',
    description: 'Visão urbana contemporânea. Contraste alto, tipografia diversa.',
    preview: { bg: '#0f172a', primary: '#facc15', accent: '#38bdf8', text: '#e5e7eb' }
  },
  {
    key: 'parsons',
    name: 'Parsons',
    description: 'Inovação fashion-forward. Formas fluidas, cores saturadas, ousadia conceitual.',
    preview: { bg: '#020617', primary: '#a855f7', accent: '#f97316', text: '#e5e7eb' }
  },
  {
    key: 'swiss',
    name: 'Swiss Style',
    description: 'Grid suíço internacional. Precisão matemática, neutralidade objetiva.',
    preview: { bg: '#ffffff', primary: '#ef4444', accent: '#111827', text: '#020617' }
  },
  {
    key: 'vkhutemas',
    name: 'VKhUTEMAS',
    description: 'Construtivismo russo. Diagonal dinâmica, geometria revolucionária.',
    preview: { bg: '#111111', primary: '#dc2626', accent: '#facc15', text: '#f4f4f5' }
  }
];

interface Company {
  id: string;
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo?: string | null;
  primary_color?: string;
  secondary_color?: string;
  custom_domain?: string | null;
  storefront_template_id?: number | null;
  theme_key?: string;
}

export default function ConfiguracoesPage() {
  const { user, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('empresa');

  const fetchData = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      const companyData = await directusClient.request(
        readItems('companies', {
          filter: { id: { _eq: user.company_id } },
          limit: 1,
        })
      );

      if (companyData.length > 0) {
        setCompany(companyData[0] as unknown as Company);
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.company_id]);

  useEffect(() => {
    if (user?.company_id) {
      fetchData();
    }
  }, [user?.company_id, fetchData]);

  const handleSaveCompany = async () => {
    if (!company) return;

    try {
      setSaving(true);
      await directusClient.request(
        updateItem('companies', company.id, {
          name: company.name,
          email: company.email,
          phone: company.phone,
          address: company.address,
          city: company.city,
          state: company.state,
          zip_code: company.zip_code,
          primary_color: company.primary_color,
          secondary_color: company.secondary_color,
          custom_domain: company.custom_domain,
          theme_key: company.theme_key,
        })
      );
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!user?.company_id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Erro: Empresa não encontrada</p>
          <p className="text-gray-600">Faça login novamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Bauhaus-inspired header with geometric accent */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-start gap-6">
            <div className="w-2 h-24 bg-blue-600 rounded-sm" />
            <div>
              <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-3">
                Configurações
              </h1>
              <p className="text-lg font-light text-gray-500">
                Gerencie as configurações da sua imobiliária
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Minimalist tabs with bottom border */}
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0 gap-8">
            <TabsTrigger 
              value="empresa" 
              className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-0 pb-4 font-light"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger 
              value="integracoes" 
              className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-0 pb-4 font-light"
            >
              <Key className="mr-2 h-4 w-4" />
              Integrações
            </TabsTrigger>
            <TabsTrigger 
              value="aparencia" 
              className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-0 pb-4 font-light"
            >
              <Palette className="mr-2 h-4 w-4" />
              Aparência
            </TabsTrigger>
          </TabsList>

          {/* Empresa Tab */}
          <TabsContent value="empresa" className="space-y-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-light text-gray-900 mb-6">Informações da Empresa</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="font-light text-gray-700">Nome da Empresa</Label>
                  <Input
                    id="name"
                    className="mt-2 rounded-none border-gray-300"
                    value={company?.name || ''}
                    onChange={(e) => setCompany(prev => prev ? {...prev, name: e.target.value} : null)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="font-light text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-2 rounded-none border-gray-300"
                      value={company?.email || ''}
                      onChange={(e) => setCompany(prev => prev ? {...prev, email: e.target.value} : null)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="font-light text-gray-700">Telefone</Label>
                    <Input
                      id="phone"
                      className="mt-2 rounded-none border-gray-300"
                      value={company?.phone || ''}
                      onChange={(e) => setCompany(prev => prev ? {...prev, phone: e.target.value} : null)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="font-light text-gray-700">Endereço</Label>
                  <Input
                    id="address"
                    className="mt-2 rounded-none border-gray-300"
                    value={company?.address || ''}
                    onChange={(e) => setCompany(prev => prev ? {...prev, address: e.target.value} : null)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city" className="font-light text-gray-700">Cidade</Label>
                    <Input
                      id="city"
                      className="mt-2 rounded-none border-gray-300"
                      value={company?.city || ''}
                      onChange={(e) => setCompany(prev => prev ? {...prev, city: e.target.value} : null)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="font-light text-gray-700">Estado</Label>
                    <Input
                      id="state"
                      className="mt-2 rounded-none border-gray-300"
                      value={company?.state || ''}
                      onChange={(e) => setCompany(prev => prev ? {...prev, state: e.target.value} : null)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="zip_code" className="font-light text-gray-700">CEP</Label>
                    <Input
                      id="zip_code"
                      className="mt-2 rounded-none border-gray-300"
                      value={company?.zip_code || ''}
                      onChange={(e) => setCompany(prev => prev ? {...prev, zip_code: e.target.value} : null)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveCompany} 
                  disabled={saving}
                  className="rounded-none bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Integrações Tab */}
          <TabsContent value="integracoes" className="space-y-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-light text-gray-900 mb-6">Configurações de API</h2>
              <ApiSettings />
            </div>
          </TabsContent>

          {/* Aparência Tab */}
          <TabsContent value="aparencia" className="space-y-8">
            <div className="max-w-4xl">
              <div className="mb-8">
                <h2 className="text-2xl font-light text-gray-900 mb-2">Tema Visual</h2>
                <p className="text-sm font-light text-gray-500">
                  Escolha a estética de design que representa sua marca
                </p>
              </div>
              
              {/* Theme Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {DESIGN_THEMES.map((theme) => (
                  <button
                    key={theme.key}
                    onClick={() => {
                      setCompany(prev => prev ? {...prev, theme_key: theme.key} : null);
                      // Apply theme immediately for preview
                      document.documentElement.setAttribute('data-theme', theme.key);
                    }}
                    className={`
                      relative p-6 border-2 rounded-none text-left transition-all
                      ${company?.theme_key === theme.key 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                      }
                    `}
                  >
                    {/* Theme Preview Bar */}
                    <div className="flex gap-2 mb-4">
                      <div className="h-12 w-full rounded-none" style={{ backgroundColor: theme.preview.bg }} />
                      <div className="h-12 w-full rounded-none" style={{ backgroundColor: theme.preview.primary }} />
                      <div className="h-12 w-full rounded-none" style={{ backgroundColor: theme.preview.accent }} />
                      <div className="h-12 w-full rounded-none" style={{ backgroundColor: theme.preview.text }} />
                    </div>

                    {/* Theme Info */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      {theme.name}
                      {company?.theme_key === theme.key && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-none">ATIVO</span>
                      )}
                    </h3>
                    <p className="text-sm font-light text-gray-600 leading-relaxed">
                      {theme.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Cores Personalizadas (mantidas para customização adicional) */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-xl font-light text-gray-900 mb-6">Cores Personalizadas</h3>
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <Label htmlFor="primary_color" className="font-light text-gray-700">Cor Primária</Label>
                    <Input
                      id="primary_color"
                      type="color"
                      className="mt-2 h-12 rounded-none border-gray-300"
                      value={company?.primary_color || '#3B82F6'}
                      onChange={(e) => setCompany(prev => prev ? {...prev, primary_color: e.target.value} : null)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondary_color" className="font-light text-gray-700">Cor Secundária</Label>
                    <Input
                      id="secondary_color"
                      type="color"
                      className="mt-2 h-12 rounded-none border-gray-300"
                      value={company?.secondary_color || '#10B981'}
                      onChange={(e) => setCompany(prev => prev ? {...prev, secondary_color: e.target.value} : null)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom_domain" className="font-light text-gray-700">Domínio Personalizado</Label>
                    <Input
                      id="custom_domain"
                      placeholder="exemplo.com.br"
                      className="mt-2 rounded-none border-gray-300"
                      value={company?.custom_domain || ''}
                      onChange={(e) => setCompany(prev => prev ? {...prev, custom_domain: e.target.value} : null)}
                    />
                    <p className="text-sm font-light text-gray-500 mt-2">
                      Configure o CNAME no seu provedor de domínio
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSaveCompany} 
                disabled={saving}
                className="mt-8 rounded-none bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
