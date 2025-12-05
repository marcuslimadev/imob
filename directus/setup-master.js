/**
 * Setup Master Script - iMOBI SaaS Platform
 * 
 * Executa todos os scripts de configuração em ordem:
 * 1. Registra collections de Subscription
 * 2. Registra collections de Vistoria
 * 3. Registra collections de Assinatura
 * 4. Configura Roles e Permissions
 * 
 * Execute: node setup-master.js
 */

const { execSync } = require('child_process');
const path = require('path');

const scripts = [
  { name: 'register-subscription-collections.js', description: 'Collections de Subscription' },
  { name: 'register-vistoria-collections.js', description: 'Collections de Vistoria' },
  { name: 'register-assinatura-collections.js', description: 'Collections de Assinatura' },
  { name: 'setup-complete-roles.js', description: 'Roles e Permissions' },
];

async function runScript(scriptName, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Executando: ${description}`);
  console.log(`📄 Script: ${scriptName}`);
  console.log('='.repeat(60));
  
  try {
    const scriptPath = path.join(__dirname, scriptName);
    execSync(`node "${scriptPath}"`, { 
      stdio: 'inherit',
      env: process.env
    });
    console.log(`✅ ${description} - Concluído!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Falhou!`);
    return false;
  }
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              iMOBI SaaS Platform - Setup Master            ║
║                                                            ║
║  Este script configura todas as collections, roles e       ║
║  permissions necessários para o funcionamento do sistema.  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

  const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
  console.log(`📡 Conectando ao Directus: ${DIRECTUS_URL}`);
  console.log(`⏳ Aguarde enquanto os scripts são executados...\n`);

  const results = [];
  
  for (const script of scripts) {
    const success = await runScript(script.name, script.description);
    results.push({ ...script, success });
  }

  // Resumo
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 RESUMO DA EXECUÇÃO');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  successful.forEach(r => {
    console.log(`  ✅ ${r.description}`);
  });
  
  failed.forEach(r => {
    console.log(`  ❌ ${r.description}`);
  });
  
  console.log(`\n📈 Total: ${successful.length}/${results.length} scripts executados com sucesso`);
  
  if (failed.length > 0) {
    console.log('\n⚠️  Alguns scripts falharam. Verifique se:');
    console.log('   - O Directus está rodando em http://localhost:8055');
    console.log('   - As credenciais de admin estão corretas');
    console.log('   - O banco de dados está acessível');
    process.exit(1);
  }
  
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║                   ✅ Setup Concluído!                      ║
║                                                            ║
║  O sistema está pronto para uso. Próximos passos:          ║
║                                                            ║
║  1. Inicie o Next.js: cd ../nextjs && pnpm dev             ║
║  2. Acesse: http://localhost:4000                          ║
║  3. Faça login com as credenciais de admin                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
}

main().catch(console.error);
