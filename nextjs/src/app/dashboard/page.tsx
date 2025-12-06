import { getCompanyContext } from '@/lib/hooks/useCompany';
import { directusServer } from '@/lib/directus/client';
import { readItems, aggregate } from '@directus/sdk';
import { Users, Home, MessageSquare, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

async function getDashboardMetrics(companyId: string) {
  try {
    // Buscar totais usando aggregate
    const [leadsTotal, propertiesTotal, conversasTotal, mensagensTotal] = await Promise.all([
      directusServer.request(
        aggregate('leads', {
          aggregate: { count: '*' },
          query: {
            filter: { company_id: { _eq: companyId } }
          }
        })
      ),
      directusServer.request(
        aggregate('properties', {
          aggregate: { count: '*' },
          query: {
            filter: { company_id: { _eq: companyId } }
          }
        })
      ),
      directusServer.request(
        aggregate('conversas', {
          aggregate: { count: '*' },
          query: {
            filter: { company_id: { _eq: companyId }, archived: { _neq: true } }
          }
        })
      ),
      directusServer.request(
        aggregate('mensagens', {
          aggregate: { count: '*' },
          query: {
            filter: { 
              conversa_id: { 
                conversas: { company_id: { _eq: companyId } }
              }
            }
          }
        })
      ),
    ]);

    // Buscar conversas com informações de stage
    const conversas = await directusServer.request(
      readItems('conversas', {
        filter: { company_id: { _eq: companyId } },
        fields: ['id', 'stage', 'created_at', 'updated_at', 'lead_id.nome'],
        limit: 100
      })
    );

    // Agrupar leads por stage manualmente
    const stageGroups: Record<string, number> = {};
    conversas.forEach((conv: any) => {
      const stage = conv.stage || 'sem_stage';
      stageGroups[stage] = (stageGroups[stage] || 0) + 1;
    });

    const leadsByStage = Object.entries(stageGroups).map(([stage, count]) => ({
      stage,
      count
    }));

    // Buscar atividades recentes (últimas 10 conversas atualizadas)
    const recentActivity = conversas
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10)
      .map((conv: any) => ({
        id: conv.id,
        leadName: conv.lead_id?.nome || 'Lead sem nome',
        stage: conv.stage,
        updatedAt: conv.updated_at
      }));

    return {
      leadsTotal: leadsTotal[0]?.count || 0,
      propertiesTotal: propertiesTotal[0]?.count || 0,
      conversasTotal: conversasTotal[0]?.count || 0,
      mensagensTotal: mensagensTotal[0]?.count || 0,
      leadsByStage: leadsByStage || [],
      recentActivity: recentActivity || []
    };
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    
    return {
      leadsTotal: 0,
      propertiesTotal: 0,
      conversasTotal: 0,
      mensagensTotal: 0,
      leadsByStage: [],
      recentActivity: []
    };
  }
}

export default async function DashboardPage() {
  const { companyId } = await getCompanyContext();

  if (!companyId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Empresa não encontrada</h1>
          <p className="text-muted-foreground mt-2">
            Acesse via subdomínio: suaempresa.imobi.com.br
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            (Em localhost: ?company=exclusiva)
          </p>
        </div>
      </div>
    );
  }

  const metrics = await getDashboardMetrics(companyId);

  // Mapeamento de cores e labels dos stages
  const stageConfig: Record<string, { label: string; color: string; emoji: string }> = {
    boas_vindas: { label: 'Boas-vindas', color: '#3B82F6', emoji: '👋' },
    coleta_dados: { label: 'Coleta de Dados', color: '#8B5CF6', emoji: '📝' },
    aguardando_info: { label: 'Aguardando Info', color: '#F59E0B', emoji: '⏳' },
    matching: { label: 'Matching', color: '#10B981', emoji: '🔍' },
    apresentacao: { label: 'Apresentação', color: '#06B6D4', emoji: '🏠' },
    interesse: { label: 'Interesse', color: '#14B8A6', emoji: '✨' },
    refinamento: { label: 'Refinamento', color: '#A855F7', emoji: '🔧' },
    sem_match: { label: 'Sem Match', color: '#EF4444', emoji: '❌' },
    agendamento: { label: 'Agendamento', color: '#F97316', emoji: '📅' },
    visita_agendada: { label: 'Visita Agendada', color: '#84CC16', emoji: '✅' },
    pos_visita: { label: 'Pós-visita', color: '#22C55E', emoji: '🔍' },
    negociacao: { label: 'Negociação', color: '#F59E0B', emoji: '💰' },
    proposta: { label: 'Proposta', color: '#3B82F6', emoji: '📄' },
    analise_credito: { label: 'Análise Crédito', color: '#6366F1', emoji: '💳' },
    documentacao: { label: 'Documentação', color: '#8B5CF6', emoji: '📋' },
    finalizacao: { label: 'Finalização', color: '#10B981', emoji: '🎉' },
    atendimento_humano: { label: 'Atend. Humano', color: '#EC4899', emoji: '👤' },
  };

  // Calcular conversão (leads em stages avançados / total)
  const advancedStages = ['negociacao', 'proposta', 'analise_credito', 'documentacao', 'finalizacao'];
  const leadsInAdvancedStages = metrics.leadsByStage
    .filter(s => advancedStages.includes(s.stage))
    .reduce((sum, s) => sum + s.count, 0);
  const conversionRate = metrics.leadsTotal > 0
    ? ((leadsInAdvancedStages / metrics.leadsTotal) * 100).toFixed(1)
    : '0.0';

  const heroPillars = [
    {
      label: 'WhatsApp + IA',
      description: 'Atendimento automático com leitura de intenção e roteamento imediato.',
      tone: 'bg-[var(--accent-color)] text-[var(--background-color)]'
    },
    {
      label: 'Pipeline Bauhaus',
      description: '17 estágios visuais para cadência, experimentação e foco absoluto em conversão.',
      tone: 'bg-[var(--accent-color-soft)] text-[var(--foreground-color)]'
    },
    {
      label: 'Catálogo sincronizado',
      description: 'Sync diário de imóveis, limpeza de dados e vitrine pronta para compartilhar.',
      tone: 'bg-[var(--accent-color-light)] text-[var(--foreground-color)]'
    }
  ];

  const highlightStats = [
    {
      label: 'Leads ativos',
      value: metrics.leadsTotal,
      tone: 'bg-[var(--foreground-color)] text-[var(--background-color)]'
    },
    {
      label: 'Conversas vivas',
      value: metrics.conversasTotal,
      tone: 'bg-[var(--accent-color)] text-[var(--background-color)]'
    },
    {
      label: 'Imóveis publicados',
      value: metrics.propertiesTotal,
      tone: 'bg-[var(--background-color)] text-[var(--foreground-color)]'
    },
    {
      label: 'Taxa de conversão',
      value: `${conversionRate}%`,
      tone: 'bg-[var(--accent-color-light)] text-[var(--foreground-color)]'
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bauhaus-grid opacity-30" />
        <div className="absolute -left-24 top-6 h-72 w-72 rounded-full bg-[var(--accent-color-soft)] opacity-70 blur-3xl" />
        <div className="absolute right-0 -top-16 h-80 w-80 bg-[var(--accent-color-light)] rotate-12 opacity-70 mix-blend-multiply" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[820px] w-[820px] border-[14px] border-[var(--foreground-color)]/5 rotate-6" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 space-y-12">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold">
            <Badge className="rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--background-color)] px-4 py-2">Painel Bauhaus</Badge>
            <span className="bauhaus-chip bg-[var(--foreground-color)] text-[var(--background-color)]">modo geométrico</span>
            <span className="bauhaus-chip bg-[var(--accent-color-soft)] text-[var(--foreground-color)]">17 estágios</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                Operação geométrica, métricas instantâneas.
                <span className="block text-[var(--accent-color)]">CRM com ritmo Bauhaus.</span>
              </h1>
              <p className="text-lg text-[var(--muted-foreground)]">
                Painel redesenhado para cadenciar leads, acompanhar conversas e enxergar conversão sem ruído.
                Formas fortes, tipografia grotesca e blocos focados na ação.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/conversas">
                  <Button className="rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--accent-color)] text-[var(--background-color)] px-6 uppercase tracking-[0.18em] font-extrabold hover:-translate-y-1 hover:shadow-[10px_10px_0_#0c0c0c]">
                    Abrir conversas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/imoveis">
                  <Button variant="outline" className="rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--background-color)] px-6 uppercase tracking-[0.18em] font-extrabold hover:-translate-y-1 hover:shadow-[10px_10px_0_#d90429]">
                    Vitrine sincronizada
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bauhaus-card bauhaus-stripe w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Status visual</p>
                  <p className="text-lg font-extrabold">Ciclos sincronizados</p>
                </div>
                <Sparkles className="h-6 w-6 text-[var(--accent-color)]" />
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Leads, conversas e imóveis em blocos primários. Taxa de conversão em destaque para orientar o time.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {highlightStats.map((stat) => (
                  <div key={stat.label} className={`p-3 border-[3px] border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c] ${stat.tone}`}>
                    <p className="text-2xl font-black leading-tight">{stat.value}</p>
                    <p className="text-[11px] uppercase tracking-[0.16em]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <div className="space-y-6">
            <div className="bauhaus-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Manifesto de produto</p>
                <span className="bauhaus-chip bg-[var(--accent-color-light)] text-[var(--foreground-color)]">operar melhor</span>
              </div>

              <div className="grid gap-3">
                {heroPillars.map((pillar) => (
                  <div key={pillar.label} className={`p-4 border-[3px] border-[var(--foreground-color)] shadow-[8px_8px_0_#0c0c0c] ${pillar.tone}`}>
                    <p className="text-xs uppercase tracking-[0.18em]">{pillar.label}</p>
                    <p className="text-base font-semibold leading-relaxed">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bauhaus-surface p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Funil de vendas</p>
                  <p className="text-xl font-extrabold">Distribuição por estágio</p>
                </div>
                <span className="bauhaus-chip bg-[var(--foreground-color)] text-[var(--background-color)]">{conversionRate}% conversão</span>
              </div>

              <div className="space-y-3">
                {metrics.leadsByStage
                  .sort((a, b) => b.count - a.count)
                  .map((item: any) => {
                  const config = stageConfig[item.stage] || {
                    label: item.stage,
                    color: '#6B7280',
                    emoji: '📌'
                  };
                  const percentage = metrics.leadsTotal > 0
                    ? (item.count / metrics.leadsTotal) * 100
                    : 0;

                  return (
                    <div key={item.stage} className="border-[3px] border-[var(--foreground-color)] p-3 bg-white/80 shadow-[6px_6px_0_#0c0c0c]">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{config.emoji}</span>
                          <span className="font-semibold uppercase tracking-[0.08em]">{config.label}</span>
                        </div>
                        <span className="text-[var(--muted-foreground)]">{item.count}</span>
                      </div>
                      <div className="mt-2 h-3 bg-[var(--background-color-muted)] relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0"
                          style={{ width: `${percentage}%`, backgroundColor: config.color }}
                        />
                      </div>
                    </div>
                  );
                })}

                {metrics.leadsByStage.length === 0 && (
                  <div className="text-center text-[var(--muted-foreground)] py-6 text-sm">
                    Nenhum lead cadastrado ainda
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bauhaus-card p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Leads</p>
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-3xl font-black">{metrics.leadsTotal}</p>
                <p className="text-sm text-[var(--muted-foreground)]">Base ativa dentro do funil completo.</p>
              </div>

              <div className="bauhaus-card p-5 flex flex-col gap-2 bg-[var(--accent-color)] text-[var(--background-color)]">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em]">Conversas</p>
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="text-3xl font-black">{metrics.conversasTotal}</p>
                <p className="text-sm text-[var(--background-color)]/80">{metrics.mensagensTotal} mensagens trocadas.</p>
              </div>

              <div className="bauhaus-card p-5 flex flex-col gap-2 bg-[var(--accent-color-light)] text-[var(--foreground-color)]">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em]">Imóveis</p>
                  <Home className="h-5 w-5" />
                </div>
                <p className="text-3xl font-black">{metrics.propertiesTotal}</p>
                <p className="text-sm text-[var(--foreground-color)]/80">Catálogo sincronizado diariamente.</p>
              </div>

              <div className="bauhaus-card p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Conversão</p>
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-3xl font-black">{conversionRate}%</p>
                <p className="text-sm text-[var(--muted-foreground)]">Leads em negociação, proposta ou fechamento.</p>
              </div>
            </div>

            <div className="bauhaus-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Atividades recentes</p>
                  <p className="text-xl font-extrabold">Radar em tempo real</p>
                </div>
                <span className="bauhaus-chip bg-[var(--accent-color)] text-[var(--background-color)]">últimas 10</span>
              </div>

              <div className="space-y-4">
                {metrics.recentActivity.map((activity: any) => {
                  const config = stageConfig[activity.stage] || {
                    label: activity.stage,
                    color: '#6B7280',
                    emoji: '📌'
                  };
                  const timeAgo = new Date(activity.updatedAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={activity.id} className="flex gap-3 items-start border-[3px] border-[var(--foreground-color)] p-3 bg-white/80 shadow-[6px_6px_0_#0c0c0c]">
                      <span className="text-2xl" role="img" aria-label={config.label}>{config.emoji}</span>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold">{activity.leadName}</p>
                        <p className="text-xs uppercase tracking-[0.12em]" style={{ color: config.color }}>{config.label}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{timeAgo}</p>
                      </div>
                    </div>
                  );
                })}

                {metrics.recentActivity.length === 0 && (
                  <div className="text-center text-[var(--muted-foreground)] py-6 text-sm">
                    Nenhuma atividade recente
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
