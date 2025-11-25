export default defineEndpoint({
	id: 'homepage',
	handler: (router) => {
		router.get('/', (req, res) => {
			const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iMOBI - Sistema de Gestão Imobiliária</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    </style>
</head>
<body class="antialiased">
    <!-- Header -->
    <header class="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50 shadow-sm">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="bg-blue-600 text-white font-bold text-2xl px-3 py-2 rounded-lg">iMOBI</div>
                    <span class="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">MVP 90%</span>
                </div>
                <a href="/admin" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                    Acessar Sistema
                </a>
            </div>
        </div>
    </header>

    <!-- Hero -->
    <section class="gradient-bg text-white py-20">
        <div class="container mx-auto px-4 text-center">
            <h1 class="text-5xl md:text-6xl font-bold mb-6">
                Sua Imobiliária <br/>
                <span class="text-yellow-300">100% Digital</span>
            </h1>
            <p class="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Sistema completo de gestão imobiliária com CRM de leads, gerenciamento de imóveis e muito mais. 
                Tudo por apenas R$ 759/mês.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/admin" class="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg">
                    Começar Agora - 7 Dias Grátis
                </a>
                <a href="#tutorial" class="bg-blue-800 hover:bg-blue-900 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors">
                    Ver Tutorial
                </a>
            </div>
            <p class="text-sm mt-4 opacity-75">✅ Sem cartão • ✅ Cancele quando quiser • ✅ Suporte incluído</p>
        </div>
    </section>

    <!-- Status -->
    <section id="status" class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <span class="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">🚀 MVP em Desenvolvimento</span>
                <h2 class="text-4xl font-bold text-gray-900 mt-6 mb-4">Status do Desenvolvimento</h2>
                <p class="text-gray-600">Última atualização: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="max-w-4xl mx-auto grid gap-6">
                <div class="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6">
                    <div class="flex justify-between mb-4">
                        <h3 class="text-xl font-bold">✅ Gestão de Imóveis</h3>
                        <span class="bg-green-600 text-white px-4 py-1 rounded-full font-semibold text-sm">100%</span>
                    </div>
                    <ul class="space-y-2 text-gray-700">
                        <li>✓ CRUD completo de imóveis</li>
                        <li>✓ Upload de até 20 fotos</li>
                        <li>✓ Vitrine pública</li>
                    </ul>
                </div>

                <div class="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6">
                    <div class="flex justify-between mb-4">
                        <h3 class="text-xl font-bold">🔵 CRM de Leads</h3>
                        <span class="bg-blue-600 text-white px-4 py-1 rounded-full font-semibold text-sm">90%</span>
                    </div>
                    <ul class="space-y-2 text-gray-700">
                        <li>✓ Gestão completa de leads</li>
                        <li>✓ Histórico de atividades</li>
                        <li>✓ Integração WhatsApp</li>
                    </ul>
                </div>

                <div class="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-6">
                    <div class="flex justify-between mb-4">
                        <h3 class="text-xl font-bold">🟡 Multi-Tenancy</h3>
                        <span class="bg-yellow-600 text-white px-4 py-1 rounded-full font-semibold text-sm">60%</span>
                    </div>
                    <ul class="space-y-2 text-gray-700">
                        <li>✓ Roles criadas</li>
                        <li>✓ Isolamento de dados</li>
                        <li>⏳ Permissões finais</li>
                    </ul>
                </div>
            </div>

            <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto">
                <h4 class="font-bold text-gray-900 mb-4 text-center">📊 Estatísticas do Projeto</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div><p class="text-3xl font-bold text-blue-600">2.500+</p><p class="text-sm text-gray-600">Linhas</p></div>
                    <div><p class="text-3xl font-bold text-blue-600">10+</p><p class="text-sm text-gray-600">Páginas</p></div>
                    <div><p class="text-3xl font-bold text-blue-600">90%</p><p class="text-sm text-gray-600">MVP</p></div>
                    <div><p class="text-3xl font-bold text-blue-600">8</p><p class="text-sm text-gray-600">Commits</p></div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-12">Funcionalidades</h2>
            <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div class="text-center p-6">
                    <div class="text-5xl mb-4">🏠</div>
                    <h3 class="font-bold text-xl mb-2">Gestão de Imóveis</h3>
                    <p class="text-gray-600">CRUD completo com fotos</p>
                </div>
                <div class="text-center p-6">
                    <div class="text-5xl mb-4">📊</div>
                    <h3 class="font-bold text-xl mb-2">CRM de Leads</h3>
                    <p class="text-gray-600">Gerencie leads e atividades</p>
                </div>
                <div class="text-center p-6">
                    <div class="text-5xl mb-4">💬</div>
                    <h3 class="font-bold text-xl mb-2">WhatsApp</h3>
                    <p class="text-gray-600">Integração direta</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing -->
    <section class="py-16 bg-gray-900 text-white">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-4xl font-bold mb-4">Preço Simples</h2>
            <div class="max-w-md mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 mt-8">
                <h3 class="text-2xl font-bold mb-2">Plano Completo</h3>
                <div class="text-5xl font-bold my-4">R$ 759<span class="text-xl">/mês</span></div>
                <p class="mb-6 opacity-90">7 dias grátis</p>
                <ul class="text-left space-y-3 mb-6">
                    <li>✓ Imóveis ilimitados</li>
                    <li>✓ CRM completo</li>
                    <li>✓ Upload ilimitado</li>
                    <li>✓ Suporte WhatsApp</li>
                </ul>
                <a href="/admin" class="block w-full bg-white text-blue-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors">
                    Começar Teste Gratuito
                </a>
            </div>
        </div>
    </section>

    <!-- Tutorial -->
    <section id="tutorial" class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-12">Tutorial Rápido</h2>
            <div class="max-w-3xl mx-auto space-y-6">
                <div class="bg-white rounded-xl p-6 shadow">
                    <div class="flex gap-4">
                        <div class="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                        <div>
                            <h3 class="font-bold text-xl mb-2">Acesse o Sistema</h3>
                            <p class="text-gray-600 mb-2">Clique em "Acessar Sistema" e faça login:</p>
                            <div class="bg-gray-100 p-3 rounded font-mono text-sm">
                                Email: admin@exclusivalar.com<br/>
                                Senha: Teste@123
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl p-6 shadow">
                    <div class="flex gap-4">
                        <div class="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                        <div>
                            <h3 class="font-bold text-xl mb-2">Cadastre Imóveis</h3>
                            <p class="text-gray-600">Use o menu "Properties" para adicionar seus imóveis com fotos</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl p-6 shadow">
                    <div class="flex gap-4">
                        <div class="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                        <div>
                            <h3 class="font-bold text-xl mb-2">Gerencie Leads</h3>
                            <p class="text-gray-600">Acesse "Leads" para ver contatos e gerenciar atividades</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Final -->
    <section class="gradient-bg text-white py-16 text-center">
        <h2 class="text-4xl font-bold mb-4">Pronto para começar?</h2>
        <a href="/admin" class="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors mt-4">
            Acessar Sistema Agora
        </a>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-8 text-center">
        <p class="mb-2"><strong class="text-white">iMOBI</strong> - Sistema de Gestão Imobiliária</p>
        <p class="text-sm">Tudo integrado no Directus • MVP 90% completo</p>
        <p class="text-sm mt-2">
            <a href="https://github.com/marcuslimadev/imob" class="text-blue-400 hover:text-blue-300">GitHub</a>
        </p>
    </footer>
</body>
</html>
			`;
			
			res.setHeader('Content-Type', 'text/html');
			res.send(html);
		});
	},
});
