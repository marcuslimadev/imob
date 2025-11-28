'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { directusClient } from '@/lib/directus/client';
import { createItem, readItem, updateItem } from '@directus/sdk';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Contact {
  id?: string;
  type: 'phone' | 'email' | 'whatsapp' | 'other';
  value: string;
  description: string;
}

export default function NovoLeadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('id');
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingLead, setLoadingLead] = useState(!!leadId);
  const [activeTab, setActiveTab] = useState('principal');

  // Redirect if not authenticated
  if (!user?.company_id) {
    router.push('/login');
    return null;
  }

  const [formData, setFormData] = useState({
    // Principal
    name: '',
    email: '',
    phone: '',
    lead_source: 'website',
    stage: 'new',
    lead_score: 50,
    
    // Pessoa Física/Jurídica
    person_type: 'individual', // 'individual' ou 'company'
    cpf: '',
    rg: '',
    rg_issuer: '',
    rg_issue_date: '',
    cnh: '',
    cnpj: '',
    company_name: '',
    trade_name: '',
    
    // Endereço
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    
    // Preferências
    interest_type: 'buy',
    budget_min: 0,
    budget_max: 0,
    preferred_neighborhoods: '',
    notes: ''
  });

  const [contacts, setContacts] = useState<Contact[]>([
    { type: 'phone', value: '', description: 'Principal' }
  ]);

  useEffect(() => {
    if (leadId) {
      loadLead(leadId);
    }
  }, [leadId]);

  async function loadLead(id: string) {
    try {
      // @ts-ignore
      const lead = await directusClient.request(
        readItem('leads', id, {
          fields: ['*']
        })
      );

      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        lead_source: lead.lead_source || 'website',
        stage: lead.stage || 'new',
        lead_score: lead.lead_score || 50,
        person_type: lead.person_type || 'individual',
        cpf: lead.cpf || '',
        rg: lead.rg || '',
        rg_issuer: lead.rg_issuer || '',
        rg_issue_date: lead.rg_issue_date || '',
        cnh: lead.cnh || '',
        cnpj: lead.cnpj || '',
        company_name: lead.company_name || '',
        trade_name: lead.trade_name || '',
        zip_code: lead.zip_code || '',
        street: lead.street || '',
        number: lead.number || '',
        complement: lead.complement || '',
        neighborhood: lead.neighborhood || '',
        city: lead.city || '',
        state: lead.state || '',
        interest_type: lead.interest_type || 'buy',
        budget_min: lead.budget_min || 0,
        budget_max: lead.budget_max || 0,
        preferred_neighborhoods: lead.preferred_neighborhoods || '',
        notes: lead.notes || ''
      });
    } catch (err: any) {
      setError('Erro ao carregar lead: ' + err.message);
    } finally {
      setLoadingLead(false);
    }
  }

  function handleChange(field: string, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleCepBlur() {
    const cep = formData.zip_code.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    }
  }

  function addContact() {
    setContacts([...contacts, { type: 'phone', value: '', description: '' }]);
  }

  function removeContact(index: number) {
    setContacts(contacts.filter((_, i) => i !== index));
  }

  function updateContact(index: number, field: keyof Contact, value: string) {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const leadData = {
        ...formData,
        company_id: user.company_id
      };

      if (leadId) {
        // @ts-ignore
        await directusClient.request(
          updateItem('leads', leadId, leadData)
        );
      } else {
        // @ts-ignore
        await directusClient.request(
          createItem('leads', leadData)
        );
      }

      router.push('/empresa/leads');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar lead');
    } finally {
      setLoading(false);
    }
  }

  if (loadingLead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">
            {leadId ? 'Editar' : 'Novo'} Lead
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="principal">Principal</TabsTrigger>
              <TabsTrigger value="tipo">Pessoa Física/Jurídica</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="contatos">Contatos</TabsTrigger>
            </TabsList>

            {/* Tab Principal */}
            <TabsContent value="principal">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Principais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone Principal</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lead_source">Origem do Lead</Label>
                      <Select
                        value={formData.lead_source}
                        onValueChange={(value) => handleChange('lead_source', value)}
                      >
                        <SelectTrigger id="lead_source">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="referral">Indicação</SelectItem>
                          <SelectItem value="social_media">Redes Sociais</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="stage">Estágio</Label>
                      <Select
                        value={formData.stage}
                        onValueChange={(value) => handleChange('stage', value)}
                      >
                        <SelectTrigger id="stage">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Novo</SelectItem>
                          <SelectItem value="contacted">Contatado</SelectItem>
                          <SelectItem value="qualified">Qualificado</SelectItem>
                          <SelectItem value="visit_scheduled">Visita Agendada</SelectItem>
                          <SelectItem value="negotiating">Negociando</SelectItem>
                          <SelectItem value="won">Fechado</SelectItem>
                          <SelectItem value="lost">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="interest_type">Interesse</Label>
                      <Select
                        value={formData.interest_type}
                        onValueChange={(value) => handleChange('interest_type', value)}
                      >
                        <SelectTrigger id="interest_type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Comprar</SelectItem>
                          <SelectItem value="rent">Alugar</SelectItem>
                          <SelectItem value="sell">Vender</SelectItem>
                          <SelectItem value="both">Comprar e Vender</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget_min">Orçamento Mínimo</Label>
                      <Input
                        id="budget_min"
                        type="number"
                        value={formData.budget_min}
                        onChange={(e) => handleChange('budget_min', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="budget_max">Orçamento Máximo</Label>
                      <Input
                        id="budget_max"
                        type="number"
                        value={formData.budget_max}
                        onChange={(e) => handleChange('budget_max', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="preferred_neighborhoods">Bairros de Interesse</Label>
                    <Input
                      id="preferred_neighborhoods"
                      placeholder="Ex: Jardins, Vila Madalena, Pinheiros"
                      value={formData.preferred_neighborhoods}
                      onChange={(e) => handleChange('preferred_neighborhoods', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <textarea
                      id="notes"
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Pessoa Física/Jurídica */}
            <TabsContent value="tipo">
              <Card>
                <CardHeader>
                  <CardTitle>Tipo de Pessoa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={formData.person_type}
                      onValueChange={(value) => handleChange('person_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Pessoa Física</SelectItem>
                        <SelectItem value="company">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.person_type === 'individual' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={(e) => handleChange('cpf', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="rg">RG</Label>
                          <Input
                            id="rg"
                            value={formData.rg}
                            onChange={(e) => handleChange('rg', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="rg_issuer">Órgão Expedidor</Label>
                          <Input
                            id="rg_issuer"
                            placeholder="SSP-SP"
                            value={formData.rg_issuer}
                            onChange={(e) => handleChange('rg_issuer', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="rg_issue_date">Data de Expedição</Label>
                          <Input
                            id="rg_issue_date"
                            type="date"
                            value={formData.rg_issue_date}
                            onChange={(e) => handleChange('rg_issue_date', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="cnh">CNH</Label>
                          <Input
                            id="cnh"
                            value={formData.cnh}
                            onChange={(e) => handleChange('cnh', e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <Input
                            id="cnpj"
                            placeholder="00.000.000/0000-00"
                            value={formData.cnpj}
                            onChange={(e) => handleChange('cnpj', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="company_name">Razão Social</Label>
                          <Input
                            id="company_name"
                            value={formData.company_name}
                            onChange={(e) => handleChange('company_name', e.target.value)}
                          />
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor="trade_name">Nome Fantasia</Label>
                          <Input
                            id="trade_name"
                            value={formData.trade_name}
                            onChange={(e) => handleChange('trade_name', e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Endereço */}
            <TabsContent value="endereco">
              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="zip_code">CEP</Label>
                      <Input
                        id="zip_code"
                        placeholder="00000-000"
                        value={formData.zip_code}
                        onChange={(e) => handleChange('zip_code', e.target.value)}
                        onBlur={handleCepBlur}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="street">Logradouro</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => handleChange('street', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) => handleChange('number', e.target.value)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={formData.complement}
                        onChange={(e) => handleChange('complement', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => handleChange('neighborhood', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => handleChange('state', value)}
                      >
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="AL">AL</SelectItem>
                          <SelectItem value="AP">AP</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="DF">DF</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MA">MA</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="MS">MS</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PB">PB</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                          <SelectItem value="PI">PI</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="RN">RN</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="RO">RO</SelectItem>
                          <SelectItem value="RR">RR</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="SE">SE</SelectItem>
                          <SelectItem value="TO">TO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Contatos */}
            <TabsContent value="contatos">
              <Card>
                <CardHeader>
                  <CardTitle>Contatos Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contacts.map((contact, index) => (
                    <div key={index} className="flex gap-4 items-end border-b pb-4">
                      <div className="flex-1">
                        <Label>Tipo</Label>
                        <Select
                          value={contact.type}
                          onValueChange={(value: any) => updateContact(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phone">Telefone</SelectItem>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <Label>Contato</Label>
                        <Input
                          value={contact.value}
                          onChange={(e) => updateContact(index, 'value', e.target.value)}
                          placeholder="Digite o contato"
                        />
                      </div>

                      <div className="flex-1">
                        <Label>Descrição</Label>
                        <Input
                          value={contact.description}
                          onChange={(e) => updateContact(index, 'description', e.target.value)}
                          placeholder="Ex: Celular pessoal"
                        />
                      </div>

                      {contacts.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeContact(index)}
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addContact}
                  >
                    + Adicionar Contato
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Salvando...' : leadId ? 'Atualizar Lead' : 'Criar Lead'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/empresa/leads')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
