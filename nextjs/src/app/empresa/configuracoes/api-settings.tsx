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
    api_url: '',
    api_token: '',
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
            api_url: data.external_api_url || '',
            api_token: data.external_api_token || '',
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
          external_api_url: settings.api_url,
          external_api_token: settings.api_token,
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-blue-600" />
          <CardTitle>Integração com API Externa</CardTitle>
        </div>
        <CardDescription>
          Configure as credenciais para importar imóveis da sua API externa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="api_url">URL Base da API</Label>
          <Input
            id="api_url"
            type="url"
            placeholder="https://www.exclusivalarimoveis.com.br"
            value={settings.api_url}
            onChange={(e) => setSettings({ ...settings, api_url: e.target.value })}
          />
          <p className="text-xs text-gray-500">
            Exemplo: https://www.exclusivalarimoveis.com.br
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api_token">Token de Autenticação</Label>
          <Input
            id="api_token"
            type="password"
            placeholder="$2y$10$Lcn1ct..."
            value={settings.api_token}
            onChange={(e) => setSettings({ ...settings, api_token: e.target.value })}
          />
          <p className="text-xs text-gray-500">
            Token fornecido pelo sistema de origem
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Endpoints utilizados:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <code className="bg-blue-100 px-1 rounded">/api/v1/app/imovel/lista</code> - Listar imóveis</li>
            <li>• <code className="bg-blue-100 px-1 rounded">/api/v1/app/imovel/dados/:id</code> - Detalhes do imóvel</li>
          </ul>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Configurações salvas com sucesso!</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={saving || !settings.api_url || !settings.api_token}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
