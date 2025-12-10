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
  Upload,
  Save,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { directusClient } from '@/lib/directus/client';
import { createItem, readItems } from '@directus/sdk';

interface Property {
  id: string;
  title: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
}

interface Signatario {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  papel: string;
  ordem: number;
}

export default function NovaAssinaturaPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    assunto: '',
    descricao: '',
    tipo: 'locacao',
    property_id: '',
    lead_id: '',
    data_limite: '',
  });

  const [signatarios, setSignatarios] = useState<Signatario[]>([
    { nome: '', email: '', cpf: '', telefone: '', papel: 'locatario', ordem: 1 }
  ]);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!user?.company_id) return;

      try {
        setLoadingOptions(true);

        const [propertiesData, leadsData] = await Promise.all([
          directusClient.request(
            readItems('properties', {
              filter: { company_id: { _eq: user.company_id } },
              fields: ['id', 'title'],
              limit: 100,
            })
          ),
          directusClient.request(
            readItems('leads', {
              filter: { company_id: { _eq: user.company_id } },
              fields: ['id', 'name', 'email'],
              limit: 100,
            })
          ),
        ]);

        setProperties(propertiesData as Property[]);
        setLeads(leadsData as Lead[]);
      } catch (err) {
        console.error('Erro ao buscar opções:', err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [user?.company_id]);

  const addSignatario = () => {
    setSignatarios([
      ...signatarios,
      { nome: '', email: '', cpf: '', telefone: '', papel: 'testemunha', ordem: signatarios.length + 1 }
    ]);
  };

  const removeSignatario = (index: number) => {
    if (signatarios.length > 1) {
      setSignatarios(signatarios.filter((_, i) => i !== index));
    }
  };

  const updateSignatario = (index: number, field: keyof Signatario, value: string | number) => {
    const updated = [...signatarios];
    updated[index] = { ...updated[index], [field]: value };
    setSignatarios(updated);
  };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user?.company_id) {
        setError('Erro de autenticação');

        return;
      }

      if (!formData.assunto) {
        setError('Informe o assunto do documento');

        return;
      }

      const validSignatarios = signatarios.filter(s => s.nome && s.email);
      if (validSignatarios.length === 0) {
        setError('Adicione pelo menos um signatário');

        return;
      }

    try {
      setLoading(true);
      setError(null);

      // Gera código do documento
      const codigo = `DOC-${Date.now().toString(36).toUpperCase()}`;

      // Cria o documento
      const documento = await directusClient.request(
        createItem('documentos_assinatura', {
          ...formData,
          company_id: user.company_id,
          codigo,
          status: 'draft',
          property_id: formData.property_id || null,
          lead_id: formData.lead_id || null,
          data_limite: formData.data_limite || null,
        })
      );

      // Cria os signatários
      for (const signatario of validSignatarios) {
        await directusClient.request(
          createItem('documentos_signatarios', {
            company_id: user.company_id,
            documento_id: (documento as { id: string }).id,
            ...signatario,
            status: 'waiting',
          })
        );
      }

      router.push('/empresa/assinaturas');
    } catch (err) {
      console.error('Erro ao criar documento:', err);
      setError('Erro ao criar documento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            <Link href="/empresa/assinaturas" className="text-gray-500 hover:text-gray-700">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Novo Documento</h1>
              <p className="text-sm text-gray-500 mt-1">
                Envie um documento para assinatura eletrônica
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 max-w-3xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Documento */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Assunto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assunto *
                </label>
                <input
                  type="text"
                  value={formData.assunto}
                  onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Contrato de Locação - Apartamento 101"
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="locacao">Contrato de Locação</option>
                  <option value="venda">Contrato de Venda</option>
                  <option value="aditivo">Aditivo</option>
                  <option value="distrato">Distrato</option>
                  <option value="procuracao">Procuração</option>
                  <option value="ficha_cadastral">Ficha Cadastral</option>
                  <option value="vistoria">Vistoria</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detalhes adicionais sobre o documento..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Imóvel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="inline h-4 w-4 mr-1" />
                    Imóvel
                  </label>
                  <select
                    value={formData.property_id}
                    onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione (opcional)</option>
                    {properties.map((prop) => (
                      <option key={prop.id} value={prop.id}>
                        {prop.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Cliente
                  </label>
                  <select
                    value={formData.lead_id}
                    onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione (opcional)</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Limite */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data Limite para Assinatura
                </label>
                <input
                  type="date"
                  value={formData.data_limite}
                  onChange={(e) => setFormData({ ...formData, data_limite: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Upload de Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="inline h-4 w-4 mr-1" />
                  Arquivo PDF
                </label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Arraste um arquivo PDF ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Máximo 10MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="mt-4 inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm"
                  >
                    Selecionar Arquivo
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signatários */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Signatários</CardTitle>
              <button
                type="button"
                onClick={addSignatario}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {signatarios.map((signatario, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Signatário {index + 1}
                    </span>
                    {signatarios.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSignatario(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Nome *</label>
                      <input
                        type="text"
                        value={signatario.nome}
                        onChange={(e) => updateSignatario(index, 'nome', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Email *</label>
                      <input
                        type="email"
                        value={signatario.email}
                        onChange={(e) => updateSignatario(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">CPF</label>
                      <input
                        type="text"
                        value={signatario.cpf}
                        onChange={(e) => updateSignatario(index, 'cpf', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Telefone</label>
                      <input
                        type="text"
                        value={signatario.telefone}
                        onChange={(e) => updateSignatario(index, 'telefone', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Papel</label>
                      <select
                        value={signatario.papel}
                        onChange={(e) => updateSignatario(index, 'papel', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="locador">Locador</option>
                        <option value="locatario">Locatário</option>
                        <option value="comprador">Comprador</option>
                        <option value="vendedor">Vendedor</option>
                        <option value="fiador">Fiador</option>
                        <option value="testemunha">Testemunha</option>
                        <option value="representante">Representante</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Ordem</label>
                      <input
                        type="number"
                        value={signatario.ordem}
                        onChange={(e) => updateSignatario(index, 'ordem', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Link
              href="/empresa/assinaturas"
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || loadingOptions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Criar Documento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
