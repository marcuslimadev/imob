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
}

interface AppSettings {
  id: string;
  chave: string;
  valor?: string;
  company_id: string;
}

export default function ConfiguracoesPage() {
  const { user, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('empresa');

  const fetchData = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      const [companyData, settingsData] = await Promise.all([
        directusClient.request(
          readItems('companies', {
            filter: { id: { _eq: user.company_id } },
            limit: 1,
          })
        ),
        directusClient.request(
          readItems('app_settings', {
            filter: { company_id: { _eq: user.company_id } },
            limit: 1,
          })
        ),
      ]);

      if (companyData.length > 0) setCompany(companyData[0] as unknown as Company);
      if (settingsData.length > 0) setSettings(settingsData[0] as unknown as AppSettings);
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

  const handleSaveIntegrations = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await directusClient.request(
        updateItem('app_settings', settings.id, {
          whatsapp_number: settings.whatsapp_number,
          twilio_account_sid: settings.twilio_account_sid,
          twilio_auth_token: settings.twilio_auth_token,
          openai_api_key: settings.openai_api_key,
          openai_model: settings.openai_model,
          clicksign_access_token: settings.clicksign_access_token,
        })
      );
      alert('Integrações salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar integrações');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie as configurações da sua imobiliária</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="gap-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="dominio" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Domínio</span>
          </TabsTrigger>
        </TabsList>

        {/* Empresa */}
        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>Informações básicas da sua imobiliária</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Empresa</Label>
                  <Input
                    id="name"
                    value={company?.name || ''}
                    onChange={(e) => setCompany(prev => prev ? {...prev, name: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={company?.email || ''}
                    onChange={(e) => setCompany(prev => prev ? {...prev, email: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={company?.phone || ''}
                    onChange={(e) => setCompany(prev => prev ? {...prev, phone: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input
                    id="zip_code"
                    value={company?.zip_code || ''}
                    onChange={(e) => setCompany(prev => prev ? {...prev, zip_code: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={company?.address || ''}
                    onChange={(e) => setCompany(prev => prev ? {...prev, address: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={company?.city || ''}
                    onChange={(e) => setCompany(prev => prev ? {...prev, city: e.target.value} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={company?.state || ''}
                    onChange={(e) => setCompany(prev => prev ? {...prev, state: e.target.value} : null)}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveCompany} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aparência */}
        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize as cores e logo da sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Logo da Empresa</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {company?.logo ? (
                      <img src={company.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar Logo
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={company?.primary_color || '#3B82F6'}
                      onChange={(e) => setCompany(prev => prev ? {...prev, primary_color: e.target.value} : null)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={company?.primary_color || '#3B82F6'}
                      onChange={(e) => setCompany(prev => prev ? {...prev, primary_color: e.target.value} : null)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={company?.secondary_color || '#1E40AF'}
                      onChange={(e) => setCompany(prev => prev ? {...prev, secondary_color: e.target.value} : null)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={company?.secondary_color || '#1E40AF'}
                      onChange={(e) => setCompany(prev => prev ? {...prev, secondary_color: e.target.value} : null)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveCompany} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrações */}
        <TabsContent value="integracoes">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  WhatsApp (Twilio)
                </CardTitle>
                <CardDescription>Configure a integração com WhatsApp via Twilio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_number">Número WhatsApp</Label>
                    <Input
                      id="whatsapp_number"
                      placeholder="+5511999999999"
                      value={settings?.whatsapp_number || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, whatsapp_number: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilio_account_sid">Account SID</Label>
                    <Input
                      id="twilio_account_sid"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={settings?.twilio_account_sid || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, twilio_account_sid: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="twilio_auth_token">Auth Token</Label>
                    <Input
                      id="twilio_auth_token"
                      type="password"
                      placeholder="••••••••••••••••••••••••••••••••"
                      value={settings?.twilio_auth_token || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, twilio_auth_token: e.target.value} : null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-600" />
                  OpenAI
                </CardTitle>
                <CardDescription>Configure a IA para análise de mensagens e automação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="openai_api_key">API Key</Label>
                    <Input
                      id="openai_api_key"
                      type="password"
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={settings?.openai_api_key || ''}
                      onChange={(e) => setSettings(prev => prev ? {...prev, openai_api_key: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openai_model">Modelo</Label>
                    <Input
                      id="openai_model"
                      placeholder="gpt-4o-mini"
                      value={settings?.openai_model || 'gpt-4o-mini'}
                      onChange={(e) => setSettings(prev => prev ? {...prev, openai_model: e.target.value} : null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  ClickSign
                </CardTitle>
                <CardDescription>Configure a assinatura eletrônica de documentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clicksign_access_token">Access Token</Label>
                  <Input
                    id="clicksign_access_token"
                    type="password"
                    placeholder="Token de acesso ClickSign"
                    value={settings?.clicksign_access_token || ''}
                    onChange={(e) => setSettings(prev => prev ? {...prev, clicksign_access_token: e.target.value} : null)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveIntegrations} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Integrações
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Domínio */}
        <TabsContent value="dominio">
          <Card>
            <CardHeader>
              <CardTitle>Domínio Personalizado</CardTitle>
              <CardDescription>Configure um domínio próprio para sua vitrine de imóveis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="custom_domain">Domínio</Label>
                <Input
                  id="custom_domain"
                  placeholder="www.suaimobiliaria.com.br"
                  value={company?.custom_domain || ''}
                  onChange={(e) => setCompany(prev => prev ? {...prev, custom_domain: e.target.value} : null)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Como configurar:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Acesse o painel de controle do seu domínio (Registro.br, GoDaddy, etc)</li>
                  <li>Crie um registro CNAME apontando para: <code className="bg-blue-100 px-1 rounded">{company?.slug || 'sua-empresa'}.imobi.com.br</code></li>
                  <li>Aguarde a propagação do DNS (pode levar até 24h)</li>
                  <li>Salve o domínio acima e teste o acesso</li>
                </ol>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveCompany} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
