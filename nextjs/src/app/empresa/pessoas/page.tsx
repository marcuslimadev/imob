import { directusServer } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';
import { getAuthenticatedCompanyId } from '@/lib/auth/server';
import Link from 'next/link';

async function getPeople(companyId: string, q?: string) {
  // @ts-ignore - Custom schema
  return await directusServer.request(
    readItems('leads', {
      filter: {
        company_id: { _eq: companyId },
        ...(q
          ? {
              _or: [
                { nome: { _contains: q } },
                { email: { _contains: q } },
                { telefone: { _contains: q } },
                { cpf: { _contains: q } },
                { cnpj: { _contains: q } }
              ]
            }
          : {})
      },
      sort: ['-last_message_at', '-created_at'],
      fields: [
        'id',
        'nome',
        'email',
        'telefone',
        'person_type',
        'cpf',
        'cnpj',
        'city',
        'state',
        'stage'
      ],
      limit: 50
    })
  );
}

export default async function PessoasPage({ searchParams }: { searchParams?: { q?: string } }) {
  const companyId = await getAuthenticatedCompanyId();
  const q = searchParams?.q || '';
  const people = await getPeople(companyId, q);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pessoas</h1>
            <p className="text-gray-600">Locadores, Locatários e Fiadores</p>
          </div>
          <Link
            href="/empresa/pessoas/novo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold"
          >
            + Nova Pessoa
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white border rounded-md p-4 mb-4">
          <form className="flex gap-2" method="get">
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome, email, telefone, CPF/CNPJ"
              title="Buscar pessoas"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button className="px-4 py-2 border rounded bg-gray-100">Filtrar</button>
          </form>
        </div>

        <div className="bg-white border rounded-md">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">Nome</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Documento</th>
                <th className="p-3">Contato</th>
                <th className="p-3">Cidade/UF</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p: any) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{p.nome}</td>
                  <td className="p-3">{p.person_type === 'company' ? 'PJ' : 'PF'}</td>
                  <td className="p-3">{p.person_type === 'company' ? p.cnpj : p.cpf}</td>
                  <td className="p-3">
                    <div className="text-sm text-gray-700">{p.email}</div>
                    <div className="text-sm text-gray-500">{p.telefone}</div>
                  </td>
                  <td className="p-3">{p.city}/{p.state}</td>
                  <td className="p-3">{p.stage}</td>
                  <td className="p-3">
                    <Link href={`/empresa/pessoas/${p.id}`} className="text-blue-600 hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {people.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={7}>
                    Nenhuma pessoa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
