import { directusServer } from '@/lib/directus/client';
import { readItem, updateItem } from '@directus/sdk';
import { getAuthenticatedCompanyId } from '@/lib/auth/server';
import Link from 'next/link';

async function getPerson(companyId: string, id: string) {
  // @ts-ignore - Custom schema
  const person = await directusServer.request(
    readItem('leads', id, {
      fields: ['*'],
    })
  );
  if (person.company_id !== companyId) {
    throw new Error('Acesso negado');
  }
  return person;
}

export default async function EditarPessoaPage({ params }: { params: { id: string } }) {
  const companyId = await getAuthenticatedCompanyId();
  const person = await getPerson(companyId, params.id);

  // Minimal editable view; full edit would use client component
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editar Pessoa</h1>
          <Link href="/empresa/pessoas" className="text-blue-600">Voltar</Link>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white border rounded-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Nome</label>
              <input defaultValue={person.nome} className="mt-1 w-full border rounded px-3 py-2" title="Nome" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input defaultValue={person.email} className="mt-1 w-full border rounded px-3 py-2" title="Email" />
            </div>
            <div>
              <label className="block text-sm font-medium">Telefone</label>
              <input defaultValue={person.telefone} className="mt-1 w-full border rounded px-3 py-2" title="Telefone" />
            </div>
            <div>
              <label className="block text-sm font-medium">Tipo</label>
              <input defaultValue={person.person_type} className="mt-1 w-full border rounded px-3 py-2" title="Tipo" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-sm">Edição completa com tabs será adicionada depois.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
