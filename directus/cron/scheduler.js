/**
 * Cron Scheduler - Importação Automática de 4 em 4 horas
 * 
 * Mantém processo rodando em background e executa importação automaticamente
 * 
 * Uso: node directus/cron/scheduler.js
 * 
 * Horários de execução: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
 */

const cron = require('node-cron');
const { runImport } = require('./import-properties-job');

function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
}

// Executar de 4 em 4 horas (às 00:00, 04:00, 08:00, 12:00, 16:00, 20:00)
const schedule = '0 */4 * * *';

log('info', '🚀 Scheduler de importação iniciado');
log('info', `📅 Agendamento: ${schedule} (a cada 4 horas)`);
log('info', '⏰ Próximas execuções: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00');
log('info', '');

// Configurar cron job
cron.schedule(schedule, () => {
  log('info', '⏰ Iniciando importação agendada...');
  
  runImport()
    .then(() => {
      log('info', '✅ Importação agendada concluída com sucesso');
    })
    .catch((error) => {
      log('error', `❌ Erro na importação agendada: ${error.message}`);
    });
}, {
  timezone: 'America/Sao_Paulo'
});

// Manter processo vivo
process.on('SIGINT', () => {
  log('info', '⛔ Scheduler encerrado manualmente');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('info', '⛔ Scheduler encerrado pelo sistema');
  process.exit(0);
});

log('info', '✅ Scheduler ativo. Use Ctrl+C para encerrar.');
log('info', '');
