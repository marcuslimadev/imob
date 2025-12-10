export default (router) => {
	router.get('/', (req, res) => {
		const lastUpdate = new Date().toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
		});

		const heroStats = [
			{ label: 'Módulos migrados', value: '3 / 11', detail: 'Infra + Imóveis + Uploads' },
			{ label: 'Dados importados', value: '6.412', detail: 'imóveis aguardando ingestão' },
			{ label: 'Automação WhatsApp', value: '0%', detail: 'a migrar do Lumen' },
			{ label: 'Templates públicos', value: '0 / 20', detail: 'biblioteca em produção' },
		];

		const progressModules = [
			{
				title: 'Infraestrutura Directus + PostgreSQL',
				percent: 35,
				badge: 'Em curso',
				color: 'from-emerald-50 to-emerald-100 border-emerald-200',
				highlights: [
					'Containers Docker revisados',
					'Schema do Lumen catalogado (imo_properties, leads, matches)',
					'Collections base registradas no Directus',
				],
			},
			{
				title: 'Importador de Imóveis + Assets',
				percent: 20,
				badge: 'Leitura API Exclusiva',
				color: 'from-blue-50 to-blue-100 border-blue-200',
				highlights: [
					'Planejamento do worker 2 fases (lista + detalhes)',
					'Map de campos (características, imagens, pricing)',
					'Download e upload para Directus Files aprovado',
				],
			},
			{
				title: 'Portal Público + Templates',
				percent: 15,
				badge: 'Design System',
				color: 'from-amber-50 to-amber-100 border-amber-200',
				highlights: [
					'Componentes herdados do Exclusiva (hero, mapa, cards)',
					'Dados conectados via Directus SDK',
					'Pranchetas com 20 layouts previstas',
				],
			},
			{
				title: 'CRM + WhatsApp Automations',
				percent: 10,
				badge: 'Planejamento',
				color: 'from-purple-50 to-purple-100 border-purple-200',
				highlights: [
					'Kanban Leads (Next.js) espelhado do Lumen/Vue',
					'Serviço WhatsAppService mapeado para Directus Flows',
					'Integração Twilio/OpenAI validada com credenciais reais',
				],
			},
			{
				title: 'IA + Diagnósticos + Matching',
				percent: 5,
				badge: 'Descobrimento',
				color: 'from-slate-50 to-slate-100 border-slate-200',
				highlights: [
					'Portar prompts do OpenAIService para flows serverless',
					'LeadPropertyMatch e recomendações replicadas',
					'Logs e telemetria definidos',
				],
			},
			{
				title: 'Billing + Multi-Tenancy completo',
				percent: 0,
				badge: 'A iniciar',
				color: 'from-gray-50 to-gray-100 border-gray-200',
				highlights: [
					'Mercado Pago / Assinaturas',
					'Permissões por tenant (Company Admin, Corretor, Público)',
					'Health-check e monitoramento de jobs',
				],
			},
		];

		const roadmapPhases = [
			{
				label: 'Fase 1 · Migração Técnica',
				percent: 40,
				items: [
					'Portar schema Lumen para Directus (imo_properties, leads, conversas)',
					'Reescrever endpoints públicos em Node/Directus',
					'Preparar importadores e armazenamento de fotos',
				],
			},
			{
				label: 'Fase 2 · Experiência do Cliente',
				percent: 25,
				items: [
					'Biblioteca de 20 templates + seleção por empresa',
					'Dashboard Next.js 15 com métricas do Directus',
					'Módulo de leads refeito com drag & drop e histórico completo',
				],
			},
			{
				label: 'Fase 3 · Automação + Monetização',
				percent: 10,
				items: [
					'Fluxos WhatsApp + IA (diagnósticos, perguntas guiadas)',
					'Sync OLX / Viva Real e workers programados',
					'Checkout recorrente (R$ 759/mês) com bloqueio de acesso',
				],
			},
		];

		const deliverables = [
			{
				title: 'Worker de importação 2 fases',
				eta: 'Rodando até 28/11',
				detail: 'Sincroniza /lista e /dados da API Exclusiva direto no Directus',
			},
			{
				title: 'Upload de imagens para Directus Files',
				eta: 'Em andamento',
				detail: 'Mirror automático das fotos hospedadas no CDN original',
			},
			{
				title: 'Painel de Progresso Público (esta página)',
				eta: 'Hoje',
				detail: 'Usado para acompanhar as entregas do plano',
			},
		];

		const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>iMOBI · Migração Exclusiva</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg { background: linear-gradient(135deg, #1f355d 0%, #764ba2 100%); }
    </style>
</head>
<body class="antialiased bg-slate-50 text-slate-900">
    <header class="bg-white/80 backdrop-blur border-b sticky top-0 z-50 shadow-sm">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="bg-blue-600 text-white font-bold text-xl px-3 py-2 rounded-lg">iMOBI</div>
                <span class="text-xs uppercase tracking-wider text-slate-500">Portal de Acompanhamento</span>
            </div>
            <a href="/admin" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors">
                Abrir Directus
            </a>
        </div>
    </header>

    <main>
        <section class="gradient-bg text-white py-16">
            <div class="max-w-6xl mx-auto px-4 grid gap-10 md:grid-cols-[1.2fr_0.8fr] items-center">
                <div>
                    <p class="text-sm uppercase tracking-[0.3em] text-white/70">Migração Exclusiva ➜ Directus</p>
                    <h1 class="text-4xl md:text-5xl font-bold mt-4 mb-6">
                        Replicando backend + frontend <span class="text-amber-200">Exclusiva Lar</span> dentro do iMOBI
                    </h1>
                    <p class="text-lg text-white/90 max-w-2xl">
                        Todo o histórico (imóveis, leads, conversas, automações e templates) será migrado do projeto Lumen/Vue
                        <strong>para Directus + Next.js</strong>. Esta página mostra o plano detalhado, percentuais e próximos passos.
                    </p>
                    <div class="mt-8 flex flex-wrap gap-3">
                        <a href="/admin" class="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-slate-100 transition">
                            Entrar no painel
                        </a>
                        <a href="/files/plans/Plano.md" class="inline-flex items-center gap-2 border border-white/40 px-6 py-3 rounded-lg font-semibold text-white hover:bg-white/10 transition">
                            Plano completo
                        </a>
                    </div>
                    <p class="text-sm mt-6 text-white/70">Última atualização: ${lastUpdate}</p>
                </div>
                <div class="bg-white/10 rounded-2xl border border-white/20 p-6">
                    <h3 class="text-sm uppercase tracking-[0.3em] text-white/70 mb-4">Métricas do Momento</h3>
                    <div class="grid grid-cols-2 gap-4">
                        ${heroStats.map((stat) => `
                            <div class="bg-white/15 rounded-xl p-4">
                                <p class="text-sm text-white/70">${stat.label}</p>
                                <p class="text-2xl font-bold">${stat.value}</p>
                                <p class="text-xs text-white/70">${stat.detail}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </section>

        <section class="py-16" id="progresso">
            <div class="max-w-6xl mx-auto px-4">
                <div class="text-center mb-12">
                    <span class="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-semibold">📈 Progresso por Macro-área</span>
                    <h2 class="text-4xl font-bold mt-4">Status do desenvolvimento</h2>
                    <p class="text-slate-600 max-w-3xl mx-auto mt-4">
                        Cada cartão representa um bloco funcional do antigo sistema (backend Lumen + frontend Vue) sendo recriado no novo stack.
                        Atualize os percentuais sempre que concluir um lote de tarefas.
                    </p>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    ${progressModules.map((module) => `
                        <article class="bg-white border ${module.color} rounded-2xl p-6 shadow-sm">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <p class="text-sm text-slate-500">${module.badge}</p>
                                    <h3 class="text-2xl font-bold text-slate-900">${module.title}</h3>
                                </div>
                                <span class="text-xl font-bold text-blue-600">${module.percent}%</span>
                            </div>
                            <div class="w-full h-2 bg-slate-100 rounded-full mb-4">
                                <div class="h-2 bg-blue-600 rounded-full" style="width:${module.percent}%"></div>
                            </div>
                            <ul class="space-y-2 text-sm text-slate-600">
                                ${module.highlights.map((item) => `<li>• ${item}</li>`).join('')}
                            </ul>
                        </article>
                    `).join('')}
                </div>
            </div>
        </section>

        <section class="py-16 bg-white" id="roadmap">
            <div class="max-w-6xl mx-auto px-4">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                    <div>
                        <p class="text-sm uppercase tracking-[0.3em] text-blue-500">Plano de desenvolvimento</p>
                        <h2 class="text-3xl font-bold mt-2">Roadmap alinhado ao projeto original</h2>
                    </div>
                    <div class="text-sm text-slate-500">
                        Consulte também <a class="text-blue-600 underline" href="/files/plans/Plano.md">Plano.md</a> e <a class="text-blue-600 underline" href="/files/plans/MVP_PROGRESS.md">MVP_PROGRESS.md</a> para detalhes linha a linha.
                    </div>
                </div>

                <div class="grid md:grid-cols-3 gap-6">
                    ${roadmapPhases.map((phase) => `
                        <article class="bg-slate-900 text-white rounded-2xl p-6">
                            <p class="text-emerald-200 text-sm mb-2">${phase.label}</p>
                            <div class="flex items-end justify-between mb-4">
                                <h3 class="text-3xl font-bold">${phase.percent}%</h3>
                                <span class="text-white/70 text-sm">Progresso</span>
                            </div>
                            <div class="w-full h-2 bg-white/20 rounded-full mb-4">
                                <div class="h-2 bg-emerald-300 rounded-full" style="width:${phase.percent}%"></div>
                            </div>
                            <ul class="space-y-2 text-white/80 text-sm">
                                ${phase.items.map((item) => `<li>• ${item}</li>`).join('')}
                            </ul>
                        </article>
                    `).join('')}
                </div>
            </div>
        </section>

        <section class="py-16 bg-slate-900 text-white" id="entregaveis">
            <div class="max-w-6xl mx-auto px-4">
                <div class="flex flex-col gap-4 mb-10">
                    <h2 class="text-3xl font-bold">Próximos entregáveis</h2>
                    <p class="text-white/70 max-w-3xl">
                        Atualize a lista abaixo a cada ciclo. Os itens refletem diretamente o que estava em produção no projeto Exclusiva (sync_worker,
                        WhatsAppService, templates Vue) e que agora ganharão versões em Directus/Next.
                    </p>
                </div>

                <div class="grid md:grid-cols-3 gap-6">
                    ${deliverables.map((item) => `
                        <article class="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <p class="text-emerald-300 text-sm">${item.eta}</p>
                            <h3 class="text-xl font-bold mt-2 mb-3">${item.title}</h3>
                            <p class="text-white/70 text-sm">${item.detail}</p>
                        </article>
                    `).join('')}
                </div>
            </div>
        </section>

        <section class="py-16 bg-white" id="tutorial">
            <div class="max-w-5xl mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-10">Checklist para seguir acompanhando</h2>
                <div class="grid gap-6 md:grid-cols-3">
                    ${[
				{ step: 1, title: 'Rodar importadores', detail: 'Executar scripts no diretório directus/sync para validar ingestão de dados reais.' },
				{ step: 2, title: 'Validar no Next.js', detail: 'Acessar http://localhost:3000 para garantir que o front consome o novo Directus.' },
				{ step: 3, title: 'Atualizar percentuais', detail: 'Editar este endpoint sempre que concluir um bloco (vide progressModules).' },
			].map((item) => `
                        <article class="bg-slate-100 rounded-2xl p-6 shadow-sm">
                            <div class="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4">${item.step}</div>
                            <h3 class="text-xl font-semibold mb-2">${item.title}</h3>
                            <p class="text-slate-600 text-sm">${item.detail}</p>
                        </article>
                    `).join('')}
                </div>
            </div>
        </section>
    </main>

    <footer class="bg-slate-950 text-slate-400 text-center py-8">
        <p class="text-sm">Construindo o sucessor do <a class="text-blue-400 underline" href="https://github.com/marcuslimadev/exclusiva" target="_blank" rel="noreferrer">marcuslimadev/exclusiva</a> diretamente no Directus.</p>
        <p class="text-xs mt-2">Documentos de referência: Plano.md · MVP_PROGRESS.md · PROGRESSO_DESENVOLVIMENTO.md</p>
    </footer>
</body>
</html>
		`;

		res.setHeader('Content-Type', 'text/html');
		res.send(html);
	});
};
