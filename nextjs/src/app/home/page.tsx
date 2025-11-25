import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white font-bold text-2xl px-3 py-2 rounded-lg">
                iMOBI
              </div>
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                MVP 90% Completo
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">
                Funcionalidades
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium">
                Preços
              </a>
              <a href="#tutorial" className="text-gray-700 hover:text-blue-600 font-medium">
                Como Usar
              </a>
              <a href="#status" className="text-gray-700 hover:text-blue-600 font-medium">
                Status
              </a>
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Entrar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sua Imobiliária
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}100% Digital
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sistema completo de gestão imobiliária com website próprio, CRM de leads,
            gerenciamento de imóveis e muito mais. Tudo por apenas R$ 759/mês.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Começar Agora - 7 Dias Grátis
            </Link>
            <a
              href="#tutorial"
              className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors border-2 border-gray-300"
            >
              Ver Tutorial
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ✅ Sem cartão de crédito • ✅ Cancele quando quiser • ✅ Suporte incluído
          </p>
        </div>
      </section>

      {/* Status do Desenvolvimento */}
      <section id="status" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-sm">
                🚀 MVP em Desenvolvimento Ativo
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mt-6 mb-4">
                Status do Desenvolvimento
              </h2>
              <p className="text-gray-600">
                Última atualização: 25 de novembro de 2025
              </p>
            </div>

            <div className="grid gap-6">
              {/* Módulo Completo */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">✅ Gestão de Imóveis</h3>
                  <span className="bg-green-600 text-white px-4 py-1 rounded-full font-semibold text-sm">
                    100% Completo
                  </span>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Cadastro completo com 15+ campos</li>
                  <li>✓ Upload de até 20 fotos por imóvel</li>
                  <li>✓ Edição e gerenciamento de fotos</li>
                  <li>✓ Vitrine pública com filtros</li>
                </ul>
              </div>

              {/* Módulo Quase Completo */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">🔵 CRM de Leads</h3>
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full font-semibold text-sm">
                    90% Completo
                  </span>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Formulário público de contato</li>
                  <li>✓ Gestão de leads por estágios</li>
                  <li>✓ Histórico de atividades</li>
                  <li>✓ Integração com WhatsApp</li>
                </ul>
              </div>

              {/* Módulo em Progresso */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">🟡 Multi-Tenancy</h3>
                  <span className="bg-yellow-600 text-white px-4 py-1 rounded-full font-semibold text-sm">
                    60% Completo
                  </span>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Roles criadas (Admin, Corretor, Public)</li>
                  <li>✓ Isolamento de dados por empresa</li>
                  <li>⏳ Permissões finais (em configuração)</li>
                  <li>⏳ Testes de isolamento</li>
                </ul>
              </div>

              {/* Módulo Pendente */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">⚪ Templates de Sites</h3>
                  <span className="bg-gray-600 text-white px-4 py-1 rounded-full font-semibold text-sm">
                    0% - Próximo
                  </span>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>⏳ 20 templates profissionais</li>
                  <li>⏳ Customização de cores</li>
                  <li>⏳ Editor visual</li>
                  <li>⏳ Publicação automática</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-bold text-gray-900 mb-2">📊 Estatísticas do Projeto</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-blue-600">2.500+</p>
                  <p className="text-sm text-gray-600">Linhas de Código</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">9</p>
                  <p className="text-sm text-gray-600">Páginas</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">90%</p>
                  <p className="text-sm text-gray-600">MVP Completo</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">7</p>
                  <p className="text-sm text-gray-600">Commits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que sua imobiliária precisa
            </h2>
            <p className="text-xl text-gray-600">
              Sistema completo e integrado para gestão imobiliária moderna
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Gestão de Imóveis</h3>
              <p className="text-gray-600">
                Cadastre, edite e gerencie todo seu portfólio com fotos, características e preços.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Site Próprio</h3>
              <p className="text-gray-600">
                Escolha entre 20 templates profissionais e tenha seu site imobiliário pronto.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-2">CRM de Leads</h3>
              <p className="text-gray-600">
                Gerencie leads, acompanhe estágios e histórico de interações em um só lugar.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Upload de Fotos</h3>
              <p className="text-gray-600">
                Upload múltiplo, organização, reordenação e marcação de foto de capa.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-bold mb-2">WhatsApp Integration</h3>
              <p className="text-gray-600">
                Integração direta com WhatsApp para contato rápido com leads.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Multi-usuários</h3>
              <p className="text-gray-600">
                Adicione corretores com diferentes níveis de acesso e permissões.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Preço Simples e Transparente
            </h2>
            <p className="text-xl text-gray-300">
              Tudo incluído, sem surpresas
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Plano Completo</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">R$ 759</span>
                  <span className="text-xl text-blue-100">/mês</span>
                </div>
                <p className="text-blue-100 mt-2">7 dias grátis para testar</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Imóveis ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Site profissional incluso</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>CRM completo de leads</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Upload ilimitado de fotos</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Usuários ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Suporte por WhatsApp</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Atualizações gratuitas</span>
                </li>
              </ul>

              <Link
                href="/login"
                className="block w-full bg-white text-blue-600 text-center font-bold py-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Começar Teste Gratuito
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial */}
      <section id="tutorial" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como Usar - Tutorial Rápido
            </h2>
            <p className="text-xl text-gray-600">
              Em 5 minutos você já estará gerenciando seus imóveis
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Passo 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Criar Conta</h3>
                  <p className="text-gray-600 mb-3">
                    Acesse <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code> e 
                    clique em "Começar Agora". Use as credenciais de teste:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="font-mono text-sm">
                      <strong>Email:</strong> admin@exclusivalar.com<br />
                      <strong>Senha:</strong> Teste@123
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Cadastrar Primeiro Imóvel</h3>
                  <p className="text-gray-600 mb-3">
                    No dashboard, clique em "+ Novo Imóvel" e preencha:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Título e descrição</li>
                    <li>• Tipo (apartamento, casa, comercial)</li>
                    <li>• Endereço completo</li>
                    <li>• Características (quartos, banheiros, área)</li>
                    <li>• Preços de venda/aluguel</li>
                    <li>• Upload de até 20 fotos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Ver na Vitrine Pública</h3>
                  <p className="text-gray-600 mb-3">
                    Acesse <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000/vitrine</code> para 
                    ver seus imóveis como os clientes verão.
                  </p>
                  <p className="text-gray-600">
                    Clique em um imóvel para ver os detalhes e o formulário de contato integrado.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Receber e Gerenciar Leads</h3>
                  <p className="text-gray-600 mb-3">
                    Quando alguém preencher o formulário de contato, o lead aparecerá em:
                  </p>
                  <p className="font-mono text-sm bg-gray-50 p-3 rounded border">
                    /empresa/leads
                  </p>
                  <p className="text-gray-600 mt-3">
                    Lá você pode ver detalhes, adicionar atividades, atualizar estágio e 
                    entrar em contato direto via WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 5 */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Acompanhar Métricas</h3>
                  <p className="text-gray-600 mb-3">
                    No <code className="bg-gray-100 px-2 py-1 rounded">/empresa/dashboard</code> você vê:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Total de imóveis (ativos/inativos)</li>
                    <li>• Total de leads e novos esta semana</li>
                    <li>• Taxa de conversão de visitantes</li>
                    <li>• Últimos leads recebidos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="font-bold text-gray-900 mb-2">📚 Documentação Completa</h4>
              <p className="text-gray-600 mb-4">
                Para mais detalhes técnicos e avançados, consulte os arquivos:
              </p>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <code className="bg-white p-2 rounded border">README_IMOBI.md</code>
                <code className="bg-white p-2 rounded border">SETUP_MVP.md</code>
                <code className="bg-white p-2 rounded border">DIRECTUS_ROLES_SETUP.md</code>
                <code className="bg-white p-2 rounded border">MVP_PROGRESS.md</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para revolucionar sua imobiliária?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Comece hoje mesmo, sem cartão de crédito
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
          >
            Começar Teste Gratuito de 7 Dias
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            <strong className="text-white">iMOBI</strong> - Sistema de Gestão Imobiliária
          </p>
          <p className="text-sm">
            MVP em desenvolvimento • Última atualização: 25/11/2025
          </p>
          <p className="text-sm mt-2">
            GitHub: <a href="https://github.com/marcuslimadev/imob" className="text-blue-400 hover:text-blue-300">
              marcuslimadev/imob
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
