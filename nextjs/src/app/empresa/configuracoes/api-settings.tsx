'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Loader2, CheckCircle, XCircle, Key } from 'lucide-react';

interface ApiSettingsProps {
  companyId: string;
}

export function ApiSettings({ companyId }: ApiSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    // ImobiBrasil (principal)
    imobibrasil_url: '',
    imobibrasil_token: '',
    // API Externa genérica
    api_url: '',
    api_token: '',
    // Chaves na Mão
    chavesnamao_token: '',
    xml_url: '',
    // Twilio (WhatsApp)
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_whatsapp_number: '',
    // OpenAI
    openai_api_key: '',
    openai_model: 'gpt-4o-mini',
    // ClickSign
    clicksign_access_token: '',
  });

  // Carregar configurações existentes
  useEffect(() => {
    async function loadSettings() {
      if (!companyId) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings({
            imobibrasil_url: data.imobibrasil_url || data.external_api_url || '',
            imobibrasil_token: data.imobibrasil_token || data.external_api_token || '',
            api_url: data.external_api_url || '',
            api_token: data.external_api_token || '',
            chavesnamao_token: data.chavesnamao_token || '',
            xml_url: data.xml_url || `https://${window.location.hostname}/api/xml/imoveis`,
            twilio_account_sid: data.twilio_account_sid || '',
            twilio_auth_token: data.twilio_auth_token || '',
            twilio_whatsapp_number: data.twilio_whatsapp_number || '',
            openai_api_key: data.openai_api_key || '',
            openai_model: data.openai_model || 'gpt-4o-mini',
            clicksign_access_token: data.clicksign_access_token || '',
          });
        } else {
          console.error('Erro ao carregar settings:', response.status);
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [companyId]);

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imobibrasil_url: settings.imobibrasil_url,
          imobibrasil_token: settings.imobibrasil_token,
          external_api_url: settings.api_url || settings.imobibrasil_url,
          external_api_token: settings.api_token || settings.imobibrasil_token,
          chavesnamao_token: settings.chavesnamao_token,
          xml_url: settings.xml_url,
          twilio_account_sid: settings.twilio_account_sid,
          twilio_auth_token: settings.twilio_auth_token,
          twilio_whatsapp_number: settings.twilio_whatsapp_number,
          openai_api_key: settings.openai_api_key,
          openai_model: settings.openai_model,
          clicksign_access_token: settings.clicksign_access_token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar configurações');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* ImobiBrasil - PRINCIPAL */}
      <Card className="border-2 border-blue-500">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            <CardTitle>ImobiBrasil - Importação de Imóveis</CardTitle>
          </div>
          <CardDescription>
            <strong>Sistema principal:</strong> Configure a API da ImobiBrasil para importar imóveis automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="imobibrasil_url">URL Base da API ImobiBrasil</Label>
            <Input
              id="imobibrasil_url"
              type="url"
              placeholder="https://www.exclusivaimobiliaria.com.br"
              value={settings.imobibrasil_url}
              onChange={(e) => setSettings({ ...settings, imobibrasil_url: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Exemplo: https://www.exclusivaimobiliaria.com.br (sem /api no final)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imobibrasil_token">Token de Autenticação</Label>
            <Input
              id="imobibrasil_token"
              type="password"
              placeholder="$2y$10$Lcn1ct..."
              value={settings.imobibrasil_token}
              onChange={(e) => setSettings({ ...settings, imobibrasil_token: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Token fornecido pelo sistema ImobiBrasil
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              📡 Endpoints utilizados:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <code className="bg-blue-100 px-1 rounded">/api/v1/app/imovel/lista</code> - Listar todos os imóveis</li>
              <li>• <code className="bg-blue-100 px-1 rounded">/api/v1/app/imovel/dados/:id</code> - Detalhes completos (incluindo fotos)</li>
            </ul>
            <p className="text-xs text-blue-600 mt-3 font-medium">
              💡 Os imóveis serão importados automaticamente 1x por dia
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chaves na Mão */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            <CardTitle>Chaves na Mão - Integração XML</CardTitle>
          </div>
          <CardDescription>
            Configure a exportação de imóveis para o portal Chaves na Mão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="xml_url">URL do XML Público</Label>
            <Input
              id="xml_url"
              type="url"
              value={settings.xml_url}
              onChange={(e) => setSettings({ ...settings, xml_url: e.target.value })}
              readOnly
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              Esta URL é gerada automaticamente. Informe-a ao suporte do Chaves na Mão.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chavesnamao_token">Token de Integração</Label>
            <Input
              id="chavesnamao_token"
              type="password"
              placeholder="Obtenha em: Chaves na Mão → Meus Dados → Token de Integração"
              value={settings.chavesnamao_token}
              onChange={(e) => setSettings({ ...settings, chavesnamao_token: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Login no portal → Meus Dados → Token de Integração (parte inferior)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Como cadastrar no Chaves na Mão:
            </h4>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Acesse www.chavesnamao.com.br e faça login</li>
              <li>Vá em Meu Perfil → Meus Dados e copie o Token de Integração</li>
              <li>Cole o token acima e salve</li>
              <li>Envie email para <strong>atendimento@chavesnamao.com.br</strong></li>
              <li>Informe a URL do XML e o token no email</li>
              <li>Aguarde 24-48h para ativação</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Twilio WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle>Twilio - WhatsApp API</CardTitle>
          <CardDescription>
            Credenciais para envio e recebimento de mensagens via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twilio_account_sid">Account SID</Label>
            <Input
              id="twilio_account_sid"
              type="text"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={settings.twilio_account_sid}
              onChange={(e) => setSettings({ ...settings, twilio_account_sid: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twilio_auth_token">Auth Token</Label>
            <Input
              id="twilio_auth_token"
              type="password"
              placeholder="••••••••••••••••••••••••••••••••"
              value={settings.twilio_auth_token}
              onChange={(e) => setSettings({ ...settings, twilio_auth_token: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twilio_whatsapp_number">Número WhatsApp</Label>
            <Input
              id="twilio_whatsapp_number"
              type="text"
              placeholder="whatsapp:+5511999999999"
              value={settings.twilio_whatsapp_number}
              onChange={(e) => setSettings({ ...settings, twilio_whatsapp_number: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Formato: whatsapp:+5511999999999 (com prefixo whatsapp:)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* OpenAI */}
      <Card>
        <CardHeader>
          <CardTitle>OpenAI - Inteligência Artificial</CardTitle>
          <CardDescription>
            Configure a API da OpenAI para análise de conversas e automações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai_api_key">API Key</Label>
            <Input
              id="openai_api_key"
              type="password"
              placeholder="sk-proj-..."
              value={settings.openai_api_key}
              onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Obtenha em: platform.openai.com → API keys
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openai_model">Modelo</Label>
            <select
              id="openai_model"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={settings.openai_model}
              onChange={(e) => setSettings({ ...settings, openai_model: e.target.value })}
            >
              <option value="gpt-4o-mini">GPT-4o Mini (recomendado)</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ClickSign */}
      <Card>
        <CardHeader>
          <CardTitle>ClickSign - Assinatura Eletrônica</CardTitle>
          <CardDescription>
            Configure a integração para assinatura digital de contratos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clicksign_access_token">Access Token</Label>
            <Input
              id="clicksign_access_token"
              type="password"
              placeholder="••••••••••••••••••••••••••••••••"
              value={settings.clicksign_access_token}
              onChange={(e) => setSettings({ ...settings, clicksign_access_token: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Obtenha em: app.clicksign.com → Configurações → API
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mensagens de feedback */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Configurações salvas com sucesso!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Todas as Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
