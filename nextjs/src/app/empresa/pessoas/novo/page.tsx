import { PersonForm } from "@/components/forms/PersonForm";
import { getAuthenticatedCompanyId } from "@/lib/auth/server";

export default async function NovaPessoaPage() {
  const companyId = await getAuthenticatedCompanyId();

  return (
    <div className="relative min-h-screen px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="bauhaus-grid absolute inset-6 rounded-[32px] border-[3px] border-[var(--foreground-color)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-[var(--accent-color)]/10 mix-blend-multiply" />
      </div>

      <PersonForm mode="create" companyId={companyId} />
    </div>
  );
}
