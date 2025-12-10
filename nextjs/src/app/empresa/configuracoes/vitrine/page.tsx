'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Check, 
  ExternalLink, 
  Loader2,
  Info,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { directusClient } from '@/lib/directus/client';
import { readItems, updateItem } from '@directus/sdk';
import { cn } from '@/lib/utils';

interface Template {
  id: number;
  name: string;
  description: string;
  preview: string;
  features: string[];
}

const TEMPLATES: Template[] = [
  {
    id: 1,
    name: 'Padrão',
    description: 'Design clássico blue/white com grid de cards',
    preview: '/templates/template-1.jpg',
    features: ['Grid de Cards', 'Filtros', 'Responsivo']
  },
  {
    id: 2,
    name: 'Moderno Dark',
    description: 'Glassmorphism com gradiente escuro',
    preview: '/templates/template-2.jpg',
    features: ['Glassmorphism', 'Dark Mode', 'Gradientes']
  },
  {
    id: 3,
    name: 'Minimalista',
    description: 'Gray/white com tipografia leve',
    preview: '/templates/template-3.jpg',
    features: ['Clean', 'Espaçamento', 'Tipografia']
  },
  {
    id: 4,
    name: 'Corporativo',
    description: 'Profissional blue-900 com estrutura formal',
    preview: '/templates/template-4.jpg',
    features: ['Profissional', 'Estruturado', 'Confiável']
  },
  {
    id: 5,
    name: 'Luxo',
    description: 'Amber/gold com serif elegante',
    preview: '/templates/template-5.jpg',
    features: ['Elegante', 'Dourado', 'Premium']
  },
  {
    id: 6,
    name: 'Grid Masonry',
    description: 'Pinterest-style com alturas variadas',
    preview: '/templates/template-6.jpg',
    features: ['Masonry', 'Dinâmico', 'Visual']
  },
  {
    id: 7,
    name: 'Magazine Layout',
    description: 'Editorial com hero destacado',
    preview: '/templates/template-7.jpg',
    features: ['Editorial', 'Hero', 'Magazine']
  },
  {
    id: 8,
    name: 'Split Screen',
    description: 'Imagem e conteúdo alternados',
    preview: '/templates/template-8.jpg',
    features: ['Split', 'Imersivo', 'Alternado']
  },
  {
    id: 9,
    name: 'Image Gallery',
    description: 'Grid compacto com overlay hover',
    preview: '/templates/template-9.jpg',
    features: ['Galeria', 'Overlay', 'Compacto']
  },
  {
    id: 10,
    name: 'Card-based',
    description: 'App-style com gradient pills',
    preview: '/templates/template-10.jpg',
    features: ['App UI', 'Gradientes', 'Moderno']
  },
  {
    id: 11,
    name: 'Dark Mode Avançado',
    description: 'Neon gradients com glow effects',
    preview: '/templates/template-11.jpg',
    features: ['Neon', 'Glow', 'Premium']
  },
  {
    id: 12,
    name: 'Light & Airy',
    description: 'Tons pastéis com espaçamento generoso',
    preview: '/templates/template-12.jpg',
    features: ['Pastel', 'Leve', 'Elegante']
  },
  {
    id: 13,
    name: 'Bold Typography',
    description: 'Black/yellow alto contraste',
    preview: '/templates/template-13.jpg',
    features: ['Contraste', 'Impacto', 'Editorial']
  },
  {
    id: 14,
    name: 'Carousel Hero',
    description: 'Hero fullscreen + scroll horizontal',
    preview: '/templates/template-14.jpg',
    features: ['Carousel', 'Fullscreen', 'Scroll']
  },
  {
    id: 15,
    name: 'Filterable Grid',
    description: 'Filtros interativos com estado',
    preview: '/templates/template-15.jpg',
    features: ['Filtros', 'Interativo', 'Funcional']
  },
  {
    id: 16,
    name: 'List View Detalhada',
    description: 'Cards horizontais com info completa',
    preview: '/templates/template-16.jpg',
    features: ['Lista', 'Detalhado', 'Completo']
  },
  {
    id: 17,
    name: 'Map Integration',
    description: 'Layout split com mapa integrado',
    preview: '/templates/template-17.jpg',
    features: ['Mapa', 'Geolocalização', 'Split']
  },
  {
    id: 18,
    name: 'Timeline Layout',
    description: 'Scroll vertical cronológico',
    preview: '/templates/template-18.jpg',
    features: ['Timeline', 'Cronológico', 'Story']
  },
  {
    id: 19,
    name: '3D Cards',
    description: 'Perspectiva com efeitos de profundidade',
    preview: '/templates/template-19.jpg',
    features: ['3D', 'Perspectiva', 'Interativo']
  },
  {
    id: 20,
    name: 'Video Background',
    description: 'Hero com vídeo e gradiente animado',
    preview: '/templates/template-20.jpg',
    features: ['Vídeo', 'Hero', 'Cinemático']
  }
];

export default function VitrineConfigPage() {
  return (
    <AuthGuard>
      <VitrineConfigContent />
    </AuthGuard>
  );
}

function VitrineConfigContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [customDomain, setCustomDomain] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.company_id) {
      fetchCompanyConfig();
    }
  }, [user?.company_id]);

  const fetchCompanyConfig = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      const companies = await directusClient.request(
        readItems('companies', {
          filter: { id: { _eq: user.company_id } },
          fields: ['storefront_template_id', 'custom_domain', 'slug'],
          limit: 1
        })
      );

      if (companies.length > 0) {
        setSelectedTemplate(companies[0].storefront_template_id || 1);
        setCustomDomain(companies[0].custom_domain || '');
        setCompanySlug(companies[0].slug || '');
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.company_id) return;

    try {
      setSaving(true);

      await directusClient.request(
        updateItem('companies', user.company_id, {
          storefront_template_id: selectedTemplate,
          custom_domain: customDomain || null
        })
      );

      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuração da Vitrine Pública</h1>
        <p className="text-gray-500">Configure o template e domínio customizado do seu site de vendas</p>
      </div>

      {/* URL Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            URLs da Vitrine
          </CardTitle>
          <CardDescription>
            Acesse sua vitrine pública através dessas URLs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>URL Padrão (Subdomínio)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input 
                value={`https://${companySlug}.imobi.com.br`}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(`https://${companySlug}.imobi.com.br`)}
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`https://${companySlug}.imobi.com.br`, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {customDomain && (
            <div>
              <Label>Domínio Customizado</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={`https://${customDomain}`}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`https://${customDomain}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seletor de Template */}
      <Card>
        <CardHeader>
          <CardTitle>Escolha o Template</CardTitle>
          <CardDescription>
            Selecione o design da sua vitrine pública
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  'relative p-4 border-2 rounded-lg text-left transition-all hover:shadow-lg',
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                )}

                {/* Preview placeholder */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-3 flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-2xl">#{template.id}</span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {template.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Domínio Customizado */}
      <Card>
        <CardHeader>
          <CardTitle>Domínio Customizado (Opcional)</CardTitle>
          <CardDescription>
            Configure seu próprio domínio para a vitrine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom_domain">Domínio</Label>
            <Input
              id="custom_domain"
              placeholder="imoveis.minhaempresa.com.br"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Digite apenas o domínio, sem https://
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900">
                  Como configurar o domínio customizado:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Acesse o painel do seu provedor de domínio (Registro.br, GoDaddy, etc.)</li>
                  <li>Crie um registro CNAME apontando para: <code className="bg-blue-100 px-1 rounded">vitrine.imobi.com.br</code></li>
                  <li>Aguarde a propagação DNS (pode levar até 48h)</li>
                  <li>Digite o domínio acima e salve</li>
                </ol>
                <p className="text-blue-700 mt-2">
                  <strong>Exemplo de configuração DNS:</strong><br />
                  Tipo: CNAME<br />
                  Nome: imoveis (ou www)<br />
                  Valor: vitrine.imobi.com.br
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={fetchCompanyConfig}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Configurações'
          )}
        </Button>
      </div>
    </div>
  );
}
