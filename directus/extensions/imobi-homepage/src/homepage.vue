<template>
  <div class="homepage">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo">iMOBI</div>
            <span class="badge">MVP 90% Completo</span>
          </div>
          <nav class="nav">
            <a href="#features">Funcionalidades</a>
            <a href="#pricing">Preços</a>
            <a href="#tutorial">Tutorial</a>
            <a href="#status">Status</a>
            <a href="/admin" class="btn-primary">Entrar</a>
          </nav>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">
          Sua Imobiliária
          <span class="gradient-text">100% Digital</span>
        </h1>
        <p class="hero-subtitle">
          Sistema completo de gestão imobiliária com website próprio, CRM de leads,
          gerenciamento de imóveis e muito mais. Tudo por apenas R$ 759/mês.
        </p>
        <div class="hero-actions">
          <a href="/admin" class="btn-hero">Começar Agora - 7 Dias Grátis</a>
          <a href="#tutorial" class="btn-secondary">Ver Tutorial</a>
        </div>
        <p class="hero-note">
          ✅ Sem cartão de crédito • ✅ Cancele quando quiser • ✅ Suporte incluído
        </p>
      </div>
    </section>

    <!-- Status -->
    <section id="status" class="status-section">
      <div class="container">
        <div class="section-header">
          <span class="badge-large">🚀 MVP em Desenvolvimento Ativo</span>
          <h2>Status do Desenvolvimento</h2>
          <p>Última atualização: 25 de novembro de 2025</p>
        </div>

        <div class="status-grid">
          <!-- Módulo Completo -->
          <div class="status-card complete">
            <div class="status-header">
              <h3>✅ Gestão de Imóveis</h3>
              <span class="status-badge">100% Completo</span>
            </div>
            <ul>
              <li>✓ Cadastro completo com 15+ campos</li>
              <li>✓ Upload de até 20 fotos por imóvel</li>
              <li>✓ Edição e gerenciamento de fotos</li>
              <li>✓ Vitrine pública com filtros</li>
            </ul>
          </div>

          <!-- CRM -->
          <div class="status-card progress-90">
            <div class="status-header">
              <h3>🔵 CRM de Leads</h3>
              <span class="status-badge">90% Completo</span>
            </div>
            <ul>
              <li>✓ Formulário público de contato</li>
              <li>✓ Gestão de leads por estágios</li>
              <li>✓ Histórico de atividades</li>
              <li>✓ Integração com WhatsApp</li>
            </ul>
          </div>

          <!-- Multi-tenant -->
          <div class="status-card progress-60">
            <div class="status-header">
              <h3>🟡 Multi-Tenancy</h3>
              <span class="status-badge">60% Completo</span>
            </div>
            <ul>
              <li>✓ Roles criadas (Admin, Corretor, Public)</li>
              <li>✓ Isolamento de dados por empresa</li>
              <li>⏳ Permissões finais (em configuração)</li>
              <li>⏳ Testes de isolamento</li>
            </ul>
          </div>

          <!-- Templates -->
          <div class="status-card pending">
            <div class="status-header">
              <h3>⚪ Templates de Sites</h3>
              <span class="status-badge">0% - Próximo</span>
            </div>
            <ul>
              <li>⏳ 20 templates profissionais</li>
              <li>⏳ Customização de cores</li>
              <li>⏳ Editor visual</li>
              <li>⏳ Publicação automática</li>
            </ul>
          </div>
        </div>

        <!-- Estatísticas -->
        <div class="stats-box">
          <h4>📊 Estatísticas do Projeto</h4>
          <div class="stats-grid">
            <div class="stat">
              <p class="stat-value">2.500+</p>
              <p class="stat-label">Linhas de Código</p>
            </div>
            <div class="stat">
              <p class="stat-value">9</p>
              <p class="stat-label">Páginas</p>
            </div>
            <div class="stat">
              <p class="stat-value">90%</p>
              <p class="stat-label">MVP Completo</p>
            </div>
            <div class="stat">
              <p class="stat-value">7</p>
              <p class="stat-label">Commits</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="features-section">
      <div class="container">
        <div class="section-header">
          <h2>Tudo que sua imobiliária precisa</h2>
          <p>Sistema completo e integrado para gestão imobiliária moderna</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🏠</div>
            <h3>Gestão de Imóveis</h3>
            <p>Cadastre, edite e gerencie todo seu portfólio com fotos, características e preços.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🌐</div>
            <h3>Site Próprio</h3>
            <p>Escolha entre 20 templates profissionais e tenha seu site imobiliário pronto.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>CRM de Leads</h3>
            <p>Gerencie leads, acompanhe estágios e histórico de interações em um só lugar.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📸</div>
            <h3>Upload de Fotos</h3>
            <p>Upload múltiplo, organização, reordenação e marcação de foto de capa.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>WhatsApp Integration</h3>
            <p>Integração direta com WhatsApp para contato rápido com leads.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Multi-usuários</h3>
            <p>Adicione corretores com diferentes níveis de acesso e permissões.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="pricing-section">
      <div class="container">
        <div class="section-header">
          <h2>Preço Simples e Transparente</h2>
          <p>Tudo incluído, sem surpresas</p>
        </div>

        <div class="pricing-card">
          <div class="pricing-header">
            <h3>Plano Completo</h3>
            <div class="pricing-value">
              <span class="price">R$ 759</span>
              <span class="period">/mês</span>
            </div>
            <p class="pricing-trial">7 dias grátis para testar</p>
          </div>

          <ul class="pricing-features">
            <li>✓ Imóveis ilimitados</li>
            <li>✓ Site profissional incluso</li>
            <li>✓ CRM completo de leads</li>
            <li>✓ Upload ilimitado de fotos</li>
            <li>✓ Usuários ilimitados</li>
            <li>✓ Suporte por WhatsApp</li>
            <li>✓ Atualizações gratuitas</li>
          </ul>

          <a href="/admin" class="btn-pricing">Começar Teste Gratuito</a>
        </div>
      </div>
    </section>

    <!-- Tutorial -->
    <section id="tutorial" class="tutorial-section">
      <div class="container">
        <div class="section-header">
          <h2>Como Usar - Tutorial Rápido</h2>
          <p>Em 5 minutos você já estará gerenciando seus imóveis</p>
        </div>

        <div class="tutorial-steps">
          <!-- Passo 1 -->
          <div class="tutorial-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Criar Conta</h3>
              <p>Acesse o Directus e use as credenciais de teste:</p>
              <div class="code-box">
                <strong>Email:</strong> admin@exclusivalar.com<br>
                <strong>Senha:</strong> Teste@123
              </div>
            </div>
          </div>

          <!-- Passo 2 -->
          <div class="tutorial-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Cadastrar Primeiro Imóvel</h3>
              <p>No dashboard, vá em "Properties" e cadastre:</p>
              <ul>
                <li>Título e descrição</li>
                <li>Tipo e localização</li>
                <li>Características e preços</li>
                <li>Upload de até 20 fotos</li>
              </ul>
            </div>
          </div>

          <!-- Passo 3 -->
          <div class="tutorial-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Ver na Vitrine Pública</h3>
              <p>Acesse a vitrine pública (Next.js) para ver como os clientes verão seus imóveis.</p>
            </div>
          </div>

          <!-- Passo 4 -->
          <div class="tutorial-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>Receber e Gerenciar Leads</h3>
              <p>Quando alguém preencher o formulário, o lead aparecerá na collection "Leads".</p>
              <p>Você pode adicionar atividades, atualizar estágio e entrar em contato via WhatsApp.</p>
            </div>
          </div>

          <!-- Passo 5 -->
          <div class="tutorial-step">
            <div class="step-number">5</div>
            <div class="step-content">
              <h3>Acompanhar Métricas</h3>
              <p>Visualize estatísticas no dashboard:</p>
              <ul>
                <li>Total de imóveis</li>
                <li>Total de leads</li>
                <li>Taxa de conversão</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="docs-box">
          <h4>📚 Documentação Completa</h4>
          <p>Para mais detalhes, consulte:</p>
          <div class="docs-grid">
            <code>README_IMOBI.md</code>
            <code>SETUP_MVP.md</code>
            <code>DIRECTUS_ROLES_SETUP.md</code>
            <code>MVP_PROGRESS.md</code>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <h2>Pronto para revolucionar sua imobiliária?</h2>
        <p>Comece hoje mesmo, sem cartão de crédito</p>
        <a href="/admin" class="btn-cta">Começar Teste Gratuito de 7 Dias</a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p><strong>iMOBI</strong> - Sistema de Gestão Imobiliária</p>
        <p class="footer-small">MVP em desenvolvimento • Última atualização: 25/11/2025</p>
        <p class="footer-small">
          GitHub: <a href="https://github.com/marcuslimadev/imob" target="_blank">marcuslimadev/imob</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'iMOBIHomepage',
};
</script>

<style scoped>
.homepage {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1f2937;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header */
.header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 1rem 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  background: #2563eb;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.badge {
  background: #d1fae5;
  color: #065f46;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav a {
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav a:hover {
  color: #2563eb;
}

.btn-primary {
  background: #2563eb !important;
  color: white !important;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

/* Hero */
.hero {
  background: linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #f3e8ff 100%);
  padding: 5rem 0;
  text-align: center;
}

.hero-title {
  font-size: 3.75rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.gradient-text {
  background: linear-gradient(to right, #2563eb, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  max-width: 700px;
  margin: 0 auto 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.btn-hero {
  background: #2563eb;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.125rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.btn-hero:hover {
  background: #1d4ed8;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background: white;
  color: #1f2937;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.125rem;
  border: 2px solid #d1d5db;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.hero-note {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Status Section */
.status-section {
  background: white;
  padding: 4rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.badge-large {
  background: #d1fae5;
  color: #065f46;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
}

.section-header h2 {
  font-size: 2.25rem;
  font-weight: bold;
  margin: 1.5rem 0 1rem;
}

.section-header p {
  color: #6b7280;
  font-size: 1.125rem;
}

.status-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.status-card {
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 2px solid;
}

.status-card.complete {
  background: linear-gradient(to right, #d1fae5, #a7f3d0);
  border-color: #6ee7b7;
}

.status-card.progress-90 {
  background: linear-gradient(to right, #dbeafe, #bfdbfe);
  border-color: #93c5fd;
}

.status-card.progress-60 {
  background: linear-gradient(to right, #fef3c7, #fde68a);
  border-color: #fcd34d;
}

.status-card.pending {
  background: linear-gradient(to right, #f3f4f6, #e5e7eb);
  border-color: #d1d5db;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-header h3 {
  font-size: 1.25rem;
  font-weight: bold;
}

.status-badge {
  padding: 0.25rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.8);
}

.status-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.status-card li {
  padding: 0.25rem 0;
  color: #374151;
}

.stats-box {
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 2rem;
}

.stats-box h4 {
  font-weight: bold;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2563eb;
  margin: 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Features */
.features-section {
  padding: 4rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.feature-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #6b7280;
}

/* Pricing */
.pricing-section {
  background: #111827;
  color: white;
  padding: 4rem 0;
}

.pricing-section .section-header h2,
.pricing-section .section-header p {
  color: white;
}

.pricing-section .section-header p {
  color: #d1d5db;
}

.pricing-card {
  max-width: 500px;
  margin: 0 auto;
  background: linear-gradient(135deg, #2563eb, #9333ea);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.pricing-header {
  text-align: center;
  margin-bottom: 2rem;
}

.pricing-header h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.pricing-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.5rem;
}

.price {
  font-size: 3rem;
  font-weight: bold;
}

.period {
  font-size: 1.25rem;
  color: #bfdbfe;
}

.pricing-trial {
  color: #bfdbfe;
  margin-top: 0.5rem;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.pricing-features li {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-pricing {
  display: block;
  width: 100%;
  background: white;
  color: #2563eb;
  text-align: center;
  padding: 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-pricing:hover {
  background: #f3f4f6;
}

/* Tutorial */
.tutorial-section {
  padding: 4rem 0;
  background: #f9fafb;
}

.tutorial-steps {
  max-width: 900px;
  margin: 0 auto 2rem;
}

.tutorial-step {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1.5rem;
}

.step-number {
  background: #2563eb;
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
}

.step-content p {
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.step-content ul {
  color: #374151;
  margin-left: 1.5rem;
}

.code-box {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.docs-box {
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.docs-box h4 {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.docs-box p {
  color: #374151;
  margin-bottom: 1rem;
}

.docs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.docs-grid code {
  background: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  display: block;
}

/* CTA */
.cta-section {
  background: linear-gradient(to right, #2563eb, #9333ea);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.cta-section h2 {
  font-size: 2.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.cta-section p {
  font-size: 1.25rem;
  color: #bfdbfe;
  margin-bottom: 2rem;
}

.btn-cta {
  display: inline-block;
  background: white;
  color: #2563eb;
  padding: 1rem 2.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.125rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.btn-cta:hover {
  background: #f3f4f6;
}

/* Footer */
.footer {
  background: #111827;
  color: #9ca3af;
  padding: 2rem 0;
  text-align: center;
}

.footer strong {
  color: white;
}

.footer-small {
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.footer a {
  color: #60a5fa;
  text-decoration: none;
}

.footer a:hover {
  color: #93c5fd;
}

/* Responsive */
@media (max-width: 768px) {
  .nav {
    display: none;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .docs-grid {
    grid-template-columns: 1fr;
  }

  .tutorial-step {
    flex-direction: column;
  }
}
</style>
