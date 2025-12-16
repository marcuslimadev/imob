import { PersonForm } from "@/components/forms/PersonForm";
import { getAuthenticatedCompanyId } from "@/lib/auth/server";
import { directusServer } from "@/lib/directus/client";
import { readItem } from "@directus/sdk";

async function getPerson(companyId: string, id: string) {
  // @ts-ignore - custom schema
  const person = await directusServer.request(
    readItem("leads", id, {
      fields: [
        "*",
      ],
    })
  );

  if (person.company_id !== companyId) {
    throw new Error("Acesso negado");
  }

  return person;
}

export default async function EditarPessoaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = await getAuthenticatedCompanyId();
  const person = await getPerson(companyId, id);

  return (
    <div className="relative min-h-screen px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="bauhaus-grid absolute inset-6 rounded-[32px] border-[3px] border-[var(--foreground-color)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-[var(--accent-color)]/10 mix-blend-multiply" />
      </div>

      <PersonForm mode="edit" companyId={companyId} initialData={person} />
    </div>
  );
}
