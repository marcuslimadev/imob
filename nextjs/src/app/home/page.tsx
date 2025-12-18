import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Brain,
  Home as HomeIcon,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  LayoutTemplate,
  PhoneCall,
} from 'lucide-react';

const featureBlocks = [
  {
    title: 'WhatsApp + IA',
    description: 'Atendimento automatizado, extração de preferências e matching imediato.',
    icon: MessageSquare,
    tone: 'bg-[var(--accent-color)] text-[var(--background-color)]',
  },
  {
    title: 'Pipeline estrutural',
    description: '17 estágios com progressão visual e foco absoluto na conversão.',
    icon: BarChart3,
    tone: 'bg-[var(--accent-color-soft)] text-[var(--foreground-color)]',
  },
  {
    title: 'Sync de imóveis',
    description: 'Integração em 2 fases, cron diário e catálogo sempre atualizado.',
    icon: HomeIcon,
    tone: 'bg-[var(--accent-color-light)] text-[var(--foreground-color)]',
  },
];

const modules = [
  {
    title: 'Automação inteligente',
    description: 'Fluxos de sync, status e curadoria funcionando como uma máquina.',
    icon: Zap,
  },
  {
    title: 'Segurança pronta',
    description: 'Criptografia, autenticação multi-tenant e bordas bem definidas.',
    icon: Shield,
  },
  {
    title: 'Operação focada',
    description: 'Interface geométrica, tempo real e métricas fáceis de ler.',
    icon: Brain,
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bauhaus-grid opacity-30" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--accent-color-soft)] opacity-80 blur-3xl" />
        <div className="absolute right-10 -top-20 h-96 w-96 bg-[var(--accent-color-light)] rotate-12 opacity-60 mix-blend-multiply" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] border-[14px] border-[var(--foreground-color)]/5 rotate-6" />
      </div>

      <header className="relative z-10 border-b-4 border-[var(--foreground-color)] bg-[var(--background-color)]/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[var(--foreground-color)] text-[var(--background-color)] font-black uppercase flex items-center justify-center tracking-tight">
              iM
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">bauhaus release</p>
              <p className="text-xl font-extrabold">SOCIMOB CRM</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 text-sm uppercase tracking-[0.12em] font-semibold">
            <Link href="/login" className="border-2 border-[var(--foreground-color)] px-4 py-2 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#0c0c0c] transition">Entrar</Link>
            <Link href="/dashboard" className="border-2 border-[var(--foreground-color)] bg-[var(--foreground-color)] text-[var(--background-color)] px-4 py-2 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#d90429] transition">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-14 lg:py-20 space-y-16">
        <section className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="space-y-6">
            <Badge className="bg-[var(--foreground-color)] text-[var(--background-color)] px-4 py-2 text-xs uppercase tracking-[0.24em] rounded-none">
              Visual construtivo • Geometria pura
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
              CRM geométrico para imobiliárias
              <span className="block text-[var(--accent-color)]">com IA em tempo real.</span>
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl">
              Estruturamos tudo em blocos primários: automação de WhatsApp com IA, pipeline de 17 estágios e vitrine sempre sincronizada. Menos ruído, mais precisão.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login">
                <Button className="h-12 rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--accent-color)] text-[var(--background-color)] px-8 text-sm uppercase tracking-[0.18em] font-extrabold hover:-translate-y-1 hover:shadow-[10px_10px_0_#0c0c0c]">
                  Começar agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/conversas">
                <Button variant="outline" className="h-12 rounded-none border-[3px] border-[var(--foreground-color)] bg-[var(--background-color)] px-8 text-sm uppercase tracking-[0.18em] font-extrabold hover:-translate-y-1 hover:shadow-[10px_10px_0_#d90429]">
                  Ver WhatsApp
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-xl">
              {[['13/13', 'Tarefas concluídas'], ['8.3k+', 'Linhas de código'], ['60+', 'Testes automáticos']].map(([stat, label]) => (
                <div key={stat} className="border-[3px] border-[var(--foreground-color)] p-4 bg-white/80 shadow-[8px_8px_0_#0c0c0c]">
                  <p className="text-3xl font-black">{stat}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{label}</p>
                </div>
              ))}
            </div>
          </div>

            <div className="relative grid gap-4">
              {featureBlocks.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                  className={`grid grid-cols-[auto_1fr] items-center gap-4 bauhaus-card p-6 ${feature.tone}`}
                  style={{ transform: index === 1 ? 'rotate(-1deg)' : 'none' }}
                >
                  <div className="h-14 w-14 bg-[var(--foreground-color)]/10 border-2 border-[var(--foreground-color)] flex items-center justify-center">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em]">{feature.title}</p>
                    <p className="text-base font-semibold leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Interface modular</p>
            <h2 className="text-4xl font-extrabold leading-tight">Blocos primários para cada rotina.</h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-xl">
              A estrutura do CRM segue disciplina construtiva: formas simples, cores fortes e foco no uso. Nada supérfluo.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {modules.map(module => {
              const Icon = module.icon;

              return (
                <div key={module.title} className="h-full bauhaus-card p-5 flex flex-col gap-3">
                  <div className="h-12 w-12 bg-[var(--accent-color)] text-[var(--background-color)] flex items-center justify-center font-black text-lg uppercase">{module.title.slice(0, 2)}</div>
                  <Icon className="h-6 w-6 text-[var(--foreground-color)]" />
                  <p className="text-lg font-semibold">{module.title}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{module.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-[4px] border-[var(--foreground-color)] bg-[var(--accent-color)] text-[var(--background-color)] p-10 shadow-[18px_18px_0_#0c0c0c] relative overflow-hidden">
          <div className="absolute -right-10 -top-12 h-40 w-40 border-[12px] border-[var(--background-color)] rotate-6" />
          <div className="absolute -left-16 bottom-0 h-32 w-32 bg-[var(--accent-color-light)] rotate-12" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-xl">
              <p className="text-xs uppercase tracking-[0.24em]">Suporte imediato</p>
              <h3 className="text-3xl font-extrabold">Equipe pronta para colocar o CRM no ar em dias, não semanas.</h3>
              <p className="text-base text-[var(--background-color)]/80">
                Configuração guiada, onboarding com storytelling visual e documentação já alinhada ao novo design.
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="h-12 rounded-none bg-[var(--background-color)] text-[var(--foreground-color)] font-extrabold uppercase tracking-[0.18em] border-[3px] border-[var(--foreground-color)] hover:-translate-y-1 hover:shadow-[10px_10px_0_#0c0c0c]">
                Falar com time
                <PhoneCall className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-12 rounded-none bg-transparent text-[var(--background-color)] font-extrabold uppercase tracking-[0.18em] border-[3px] border-[var(--background-color)] hover:-translate-y-1 hover:shadow-[10px_10px_0_#0c0c0c]">
                Ver vitrine
                <LayoutTemplate className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
