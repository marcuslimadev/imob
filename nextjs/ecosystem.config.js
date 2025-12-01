// PM2 Process Manager Configuration
// https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: 'exclusiva-nextjs',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/home/ubuntu/exclusiva-prod/imob/nextjs',
      instances: 2, // Cluster mode: 2 processos
      exec_mode: 'cluster',
      
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Logs
      error_file: '/home/ubuntu/exclusiva-prod/logs/nextjs-error.log',
      out_file: '/home/ubuntu/exclusiva-prod/logs/nextjs-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      
      // Auto-restart
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      
      // Monitoring
      watch: false, // Não usar watch em produção
      ignore_watch: ['node_modules', '.next', 'logs'],
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Health check
      wait_ready: true,
      
      // Advanced
      vizion: false, // Desabilitar tracking de Git (performance)
      post_update: ['pnpm install', 'pnpm build'],
    },
  ],
  
  // Deploy configuration (opcional - para usar com pm2 deploy)
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'EC2_IP_HERE',
      ref: 'origin/main',
      repo: 'https://github.com/marcuslimadev/imob.git',
      path: '/home/ubuntu/exclusiva-prod/imob',
      'post-deploy': 'cd nextjs && pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'sudo apt install -y git nodejs npm && sudo npm install -g pnpm pm2',
    },
  },
};
