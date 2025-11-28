'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { directusClient } from '@/lib/directus/client';
import { createItem } from '@directus/sdk';

export default function NovaPessoaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'principal' | 'pf' | 'pj' | 'endereco' | 'contatos'>('principal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<any>({
    nome: '',
    email: '',
    telefone: '',
    person_type: 'individual',
    stage: 'novo',
    // PF
    cpf: '', rg: '', rg_issuer: '', rg_issue_date: '', cnh: '',
    // PJ
    cnpj: '', company_name: '', trade_name: '',
    // Endereço
    zip_code: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: ''
  });

  if (!user?.company_id) {
    router.push('/login');
    return null;
  }

  function setField(name: string, value: any) {
    setForm((prev: any) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, company_id: user.company_id };
      // @ts-ignore - custom schema
      await directusClient.request(createItem('leads', payload));
      router.push('/empresa/pessoas');
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Nova Pessoa</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white border rounded-md p-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {['principal','pf','pj','endereco','contatos'].map((t) => (
              <button
                key={t}
                className={`px-3 py-2 border rounded ${activeTab===t ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                onClick={() => setActiveTab(t as any)}
                title={`Aba ${t}`}
              >
                {t === 'principal' ? 'Principal' : t.toUpperCase()}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'principal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Nome</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Nome" placeholder="Nome completo" value={form.nome} onChange={(e)=>setField('nome', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Email" placeholder="email@exemplo.com" value={form.email} onChange={(e)=>setField('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Telefone</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Telefone" placeholder="(11) 99999-0000" value={form.telefone} onChange={(e)=>setField('telefone', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tipo</label>
                  <select className="mt-1 w-full border rounded px-3 py-2" title="Tipo de pessoa" value={form.person_type} onChange={(e)=>setField('person_type', e.target.value)}>
                    <option value="individual">Pessoa Física</option>
                    <option value="company">Pessoa Jurídica</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'pf' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">CPF</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={(e)=>setField('cpf', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">RG</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="RG" placeholder="00.000.000-0" value={form.rg} onChange={(e)=>setField('rg', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Órgão Expedidor</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Órgão Expedidor" placeholder="SSP-SP" value={form.rg_issuer} onChange={(e)=>setField('rg_issuer', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Data de Expedição</label>
                  <input type="date" className="mt-1 w-full border rounded px-3 py-2" title="Data de Expedição" value={form.rg_issue_date} onChange={(e)=>setField('rg_issue_date', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">CNH</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="CNH" placeholder="00000000000" value={form.cnh} onChange={(e)=>setField('cnh', e.target.value)} />
                </div>
              </div>
            )}

            {activeTab === 'pj' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">CNPJ</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="CNPJ" placeholder="00.000.000/0001-00" value={form.cnpj} onChange={(e)=>setField('cnpj', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Razão Social</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Razão Social" placeholder="Empresa LTDA" value={form.company_name} onChange={(e)=>setField('company_name', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Nome Fantasia</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Nome Fantasia" placeholder="Marca" value={form.trade_name} onChange={(e)=>setField('trade_name', e.target.value)} />
                </div>
              </div>
            )}

            {activeTab === 'endereco' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">CEP</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="CEP" placeholder="00000-000" value={form.zip_code} onChange={(e)=>setField('zip_code', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Logradouro</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Logradouro" placeholder="Rua Exemplo" value={form.street} onChange={(e)=>setField('street', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Número</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Número" placeholder="123" value={form.number} onChange={(e)=>setField('number', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Complemento</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Complemento" placeholder="Apto 12" value={form.complement} onChange={(e)=>setField('complement', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Bairro</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Bairro" placeholder="Centro" value={form.neighborhood} onChange={(e)=>setField('neighborhood', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Cidade</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Cidade" placeholder="São Paulo" value={form.city} onChange={(e)=>setField('city', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Estado (UF)</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" title="Estado" placeholder="SP" value={form.state} onChange={(e)=>setField('state', e.target.value)} />
                </div>
              </div>
            )}

            {activeTab === 'contatos' && (
              <div className="text-gray-600">Em breve: múltiplos contatos com tipo e descrição.</div>
            )}

            {error && <div className="text-red-600">{error}</div>}

            <div className="flex gap-2">
              <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded" title="Salvar">
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="px-4 py-2 border rounded" title="Cancelar" onClick={()=>router.push('/empresa/pessoas')}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
