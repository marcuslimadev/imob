"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { directusClient } from "@/lib/directus/client";
import { createItem, updateItem } from "@directus/sdk";
import { lookupCep } from "@/lib/cep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2, MapPin, RefreshCw, Save, ShieldCheck } from "lucide-react";

type PersonType = "individual" | "company";

const STAGES = [
  { value: "lead_novo", label: "Lead novo" },
  { value: "primeiro_contato", label: "Primeiro contato" },
  { value: "qualificacao", label: "Qualificação" },
  { value: "negociacao", label: "Negociação" },
  { value: "fechamento", label: "Fechamento" },
];

export type PersonFormValues = {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  person_type: PersonType;
  stage: string;
  cpf?: string;
  rg?: string;
  rg_issuer?: string;
  rg_issue_date?: string;
  cnh?: string;
  cnpj?: string;
  company_name?: string;
  trade_name?: string;
  zip_code?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  notes?: string;
};

export interface PersonFormProps {
  mode: "create" | "edit";
  companyId: string;
  initialData?: Partial<PersonFormValues>;
}

export function PersonForm({ mode, companyId, initialData }: PersonFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "principal" | "pf" | "pj" | "endereco" | "contatos"
  >("principal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  const [form, setForm] = useState<PersonFormValues>({
    nome: "",
    email: "",
    telefone: "",
    person_type: "individual",
    stage: "lead_novo",
    ...initialData,
  });

  const stageLabel = useMemo(
    () => STAGES.find((stage) => stage.value === form.stage)?.label,
    [form.stage]
  );

  function setField(name: keyof PersonFormValues, value: any) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.nome || !form.telefone) {
      setError("Nome e telefone são obrigatórios.");
      setLoading(false);

      return;
    }

    try {
      const payload = {
        ...form,
        company_id: companyId,
      } as Record<string, any>;

      if (mode === "create") {
        // @ts-ignore - custom schema
        await directusClient.request(createItem("leads", payload));
      } else if (form.id) {
        // @ts-ignore - custom schema
        await directusClient.request(updateItem("leads", form.id, payload));
      }

      router.push("/empresa/pessoas");
    } catch (err: any) {
      setError(err?.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  async function handleCepLookup() {
    if (!form.zip_code) {
      setError("Informe um CEP para buscar endereço.");

      return;
    }

    try {
      setCepLoading(true);
      setError("");

      const data = await lookupCep(form.zip_code);

      setForm((prev) => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        zip_code: data.cep || prev.zip_code,
      }));
    } catch (err: any) {
      setError(err?.message || "Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bauhaus-card rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {mode === "create" ? "Onboarding" : "Ficha"} de pessoa
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black">
                {mode === "create" ? "Cadastrar pessoa" : "Editar pessoa"}
              </h1>
              <Badge className="bg-[var(--accent-color)] text-black">
                {form.person_type === "company" ? "Pessoa Jurídica" : "Pessoa Física"}
              </Badge>
            </div>
            <p className="max-w-2xl text-muted-foreground">
              Campos essenciais, dados complementares e endereço com busca de CEP. Tudo já alinhado ao tema atual da plataforma.
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="bauhaus-pill bg-[var(--accent-color-soft)] text-black">Stage: {stageLabel}</span>
              <span className="bauhaus-pill bg-[var(--foreground-color)] text-white">
                {form.telefone ? "Contato pronto" : "Aguardando telefone"}
              </span>
              <span className="bauhaus-pill border border-dashed">CEP assistido</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-right text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Dados vinculados ao tenant
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              CEP com ViaCEP
            </span>
          </div>
        </div>
      </div>

      <div className="bauhaus-card rounded-3xl p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
          <TabsList className="grid w-full grid-cols-5 gap-2 bg-transparent">
            <TabsTrigger value="principal">Principal</TabsTrigger>
            <TabsTrigger value="pf">Pessoa Física</TabsTrigger>
            <TabsTrigger value="pj">Pessoa Jurídica</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
            <TabsTrigger value="contatos">Notas</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {error && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-destructive">
                {error}
              </div>
            )}

            <TabsContent value="principal" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Nome</label>
                  <Input
                    required
                    value={form.nome}
                    onChange={(e) => setField("nome", e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Telefone</label>
                  <Input
                    required
                    value={form.telefone}
                    onChange={(e) => setField("telefone", e.target.value)}
                    placeholder="(11) 99999-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Stage do funil</label>
                  <select
                    className="w-full rounded-xl border px-3 py-2"
                    value={form.stage}
                    onChange={(e) => setField("stage", e.target.value)}
                  >
                    {STAGES.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Tipo de pessoa</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setField("person_type", "individual")}
                      className={`rounded-xl border px-3 py-2 text-left ${
                        form.person_type === "individual"
                          ? "border-[var(--foreground-color)] bg-[var(--accent-color-soft)]"
                          : "border-dashed"
                      }`}
                    >
                      <div className="font-semibold">Pessoa Física</div>
                      <p className="text-xs text-muted-foreground">CPF, RG, CNH</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setField("person_type", "company")}
                      className={`rounded-xl border px-3 py-2 text-left ${
                        form.person_type === "company"
                          ? "border-[var(--foreground-color)] bg-[var(--accent-color-soft)]"
                          : "border-dashed"
                      }`}
                    >
                      <div className="font-semibold">Pessoa Jurídica</div>
                      <p className="text-xs text-muted-foreground">CNPJ e razão social</p>
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pf">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">CPF</label>
                  <Input
                    value={form.cpf || ""}
                    onChange={(e) => setField("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">RG</label>
                  <Input
                    value={form.rg || ""}
                    onChange={(e) => setField("rg", e.target.value)}
                    placeholder="Registro geral"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Órgão Expedidor</label>
                  <Input
                    value={form.rg_issuer || ""}
                    onChange={(e) => setField("rg_issuer", e.target.value)}
                    placeholder="SSP-SP"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Data de expedição</label>
                  <Input
                    type="date"
                    value={form.rg_issue_date || ""}
                    onChange={(e) => setField("rg_issue_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">CNH</label>
                  <Input
                    value={form.cnh || ""}
                    onChange={(e) => setField("cnh", e.target.value)}
                    placeholder="Número da CNH"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pj">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">CNPJ</label>
                  <Input
                    value={form.cnpj || ""}
                    onChange={(e) => setField("cnpj", e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Razão Social</label>
                  <Input
                    value={form.company_name || ""}
                    onChange={(e) => setField("company_name", e.target.value)}
                    placeholder="Razão social"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Nome Fantasia</label>
                  <Input
                    value={form.trade_name || ""}
                    onChange={(e) => setField("trade_name", e.target.value)}
                    placeholder="Nome fantasia"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="endereco">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">CEP</label>
                  <div className="flex gap-2">
                    <Input
                      value={form.zip_code || ""}
                      onChange={(e) => setField("zip_code", e.target.value)}
                      placeholder="00000-000"
                    />
                    <Button
                      type="button"
                      onClick={handleCepLookup}
                      disabled={cepLoading}
                      variant="outline"
                    >
                      {cepLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold">Logradouro</label>
                  <Input
                    value={form.street || ""}
                    onChange={(e) => setField("street", e.target.value)}
                    placeholder="Rua, avenida, praça"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Número</label>
                  <Input
                    value={form.number || ""}
                    onChange={(e) => setField("number", e.target.value)}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Complemento</label>
                  <Input
                    value={form.complement || ""}
                    onChange={(e) => setField("complement", e.target.value)}
                    placeholder="Apto, bloco"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Bairro</label>
                  <Input
                    value={form.neighborhood || ""}
                    onChange={(e) => setField("neighborhood", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Cidade</label>
                  <Input
                    value={form.city || ""}
                    onChange={(e) => setField("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Estado</label>
                  <Input
                    value={form.state || ""}
                    onChange={(e) => setField("state", e.target.value)}
                    placeholder="UF"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contatos">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Notas e observações</label>
                <Textarea
                  value={form.notes || ""}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder="Preferências, restrições, detalhes de visitas ou contatos adicionais."
                  className="min-h-[140px]"
                />
              </div>
            </TabsContent>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-3">
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="bauhaus-pill">Campos obrigatórios: Nome, Telefone</span>
                <span className="bauhaus-pill">Stage e tipo ficam salvos</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {mode === "create" ? "Salvar pessoa" : "Salvar alterações"}
                </Button>
              </div>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}

export default PersonForm;
