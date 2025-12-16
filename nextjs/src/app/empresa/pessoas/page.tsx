import { directusServer } from "@/lib/directus/client";
import { readItems } from "@directus/sdk";
import { getAuthenticatedCompanyId } from "@/lib/auth/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, MapPin, Phone, Shield } from "lucide-react";

const STAGES: Record<string, { label: string; tone: string }> = {
  lead_novo: { label: "Lead novo", tone: "bg-blue-500" },
  primeiro_contato: { label: "Primeiro contato", tone: "bg-cyan-500" },
  qualificacao: { label: "Qualificação", tone: "bg-purple-500" },
  negociacao: { label: "Negociação", tone: "bg-amber-500" },
  fechamento: { label: "Fechamento", tone: "bg-emerald-600" },
};

async function getPeople(companyId: string, q?: string) {
  // @ts-ignore - Custom schema
  return await directusServer.request(
    readItems("leads", {
      filter: {
        company_id: { _eq: companyId },
        ...(q
          ? {
              _or: [
                { nome: { _contains: q } },
                { email: { _contains: q } },
                { telefone: { _contains: q } },
                { cpf: { _contains: q } },
                { cnpj: { _contains: q } },
              ],
            }
          : {}),
      },
      sort: ["-updated_at", "-created_at"] as any,
      fields: [
        "id",
        "nome",
        "email",
        "telefone",
        "person_type",
        "cpf",
        "cnpj",
        "city",
        "state",
        "stage",
        "zip_code",
      ] as any,
      limit: 80,
    })
  );
}

export default async function PessoasPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const companyId = await getAuthenticatedCompanyId();
  const params = await searchParams;
  const q = params?.q || "";
  const people = await getPeople(companyId, q);

  return (
    <div className="relative min-h-screen px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="bauhaus-grid absolute inset-6 rounded-[32px] border-[3px] border-[var(--foreground-color)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-[var(--accent-color)]/10 mix-blend-multiply" />
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border-[3px] border-[var(--foreground-color)] bg-[var(--background-color)]/80 p-6 shadow-[var(--shadow-soft)]">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pessoas e relacionamentos</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black">Base unificada de leads e clientes</h1>
            <Badge className="bg-[var(--accent-color)] text-black">Tenant {companyId.slice(0, 4)}...</Badge>
          </div>
          <p className="max-w-2xl text-muted-foreground">
            Consulte, filtre e edite fichas completas com documentos, estágios e endereço já integrados ao seletor de temas por escola de design.
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="bauhaus-pill bg-[var(--accent-color-soft)] text-black">Busca por CPF/CNPJ</span>
            <span className="bauhaus-pill border border-dashed">Stage visual</span>
            <span className="bauhaus-pill bg-[var(--foreground-color)] text-white">Edição rápida</span>
          </div>
        </div>
        <Link
          href="/empresa/pessoas/novo"
          className="bauhaus-card flex items-center gap-2 rounded-2xl bg-[var(--foreground-color)] px-5 py-3 text-lg font-semibold text-white shadow-[var(--shadow-strong)] transition hover:-translate-y-1 hover:shadow-lg"
        >
          Nova pessoa
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="mb-4 rounded-[24px] border-[3px] border-[var(--foreground-color)] bg-[var(--background-color)]/80 p-4 shadow-[var(--shadow-soft)]">
        <form className="flex flex-col gap-3 md:flex-row" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome, email, telefone, CPF/CNPJ"
            title="Buscar pessoas"
            className="flex-1 rounded-2xl border border-[var(--foreground-color)] px-4 py-3 shadow-sm"
          />
          <button className="rounded-2xl border-2 border-[var(--foreground-color)] px-5 py-3 font-semibold transition hover:-translate-y-0.5">
            Filtrar
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-[28px] border-[3px] border-[var(--foreground-color)] bg-[var(--surface-color,#fff)] shadow-[var(--shadow-strong)]">
        <div className="flex items-center justify-between border-b-4 border-[var(--foreground-color)] bg-[var(--background-color-muted,#f7f7f7)] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            {people.length} registros filtrados
          </div>
          <div className="flex gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span>PF/PJ</span>
            <span>•</span>
            <span>Stage</span>
            <span>•</span>
            <span>Contato</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--foreground-color)] bg-[var(--accent-color-soft)]/60 text-sm uppercase tracking-[0.12em]">
                <th className="p-3">Nome</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Documento</th>
                <th className="p-3">Contato</th>
                <th className="p-3">Cidade/UF</th>
                <th className="p-3">Stage</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p: any) => {
                const stage = STAGES[p.stage] || STAGES.lead_novo;

                return (
                  <tr key={p.id} className="border-b border-[var(--foreground-color)]/20 transition hover:bg-[var(--accent-color-soft)]/25">
                    <td className="p-3 font-semibold">{p.nome}</td>
                    <td className="p-3">
                      <Badge className="bg-[var(--foreground-color)] text-white">
                        {p.person_type === "company" ? "PJ" : "PF"}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-sm text-muted-foreground">
                      {p.person_type === "company" ? p.cnpj || "—" : p.cpf || "—"}
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {p.email || "Sem e-mail"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {p.telefone || "Sem telefone"}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {p.city ? `${p.city}/${p.state || ""}` : "-"}
                      </div>
                      <div className="text-xs">{p.zip_code || "CEP indefinido"}</div>
                    </td>
                    <td className="p-3">
                      <Badge className={`${stage.tone} text-white`}>{stage.label}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/empresa/pessoas/${p.id}`}
                        className="bauhaus-pill inline-flex items-center gap-2 border border-[var(--foreground-color)] px-3 py-2 font-semibold"
                      >
                        Editar
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {people.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-muted-foreground" colSpan={7}>
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
