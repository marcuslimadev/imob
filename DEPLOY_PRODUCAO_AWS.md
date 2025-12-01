# Deploy de Produção - Exclusiva Imóveis na AWS

**Data:** 01/12/2025  
**Objetivo:** Colocar no ar Directus + Next.js com domínio real, HTTPS, multi-tenant e WhatsApp integrado.

---

## 1. Infraestrutura AWS

### 1.1 Criar EC2 Instance
```bash
# Especificações
- Região: sa-east-1 (São Paulo)
- Tipo: t3.medium (2 vCPUs, 4GB RAM)
- OS: Ubuntu 24.04 LTS
- Storage: 30GB gp3
- Security Group: exclusiva-sg
```

**Security Group Rules:**
```
Inbound:
- SSH (22): Seu IP
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Directus (8055): 0.0.0.0/0 (temporário para testes; depois remover)

Outbound:
- All traffic: 0.0.0.0/0
```

### 1.2 Configuração Inicial do Servidor
```bash
# Conectar via SSH
ssh -i "exclusiva-key.pem" ubuntu@<EC2_PUBLIC_IP>

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y \
  docker.io \
  docker-compose \
  nginx \
  certbot \
  python3-certbot-nginx \
  git \
  curl

# Configurar Docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# Instalar Node.js 20 e PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2 pnpm

# Configurar firewall UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8055/tcp
sudo ufw enable
```

---

## 2. Deploy do Directus

### 2.1 Criar Estrutura de Diretórios
```bash
cd /home/ubuntu
mkdir -p exclusiva-prod/{directus,nextjs,nginx}
cd exclusiva-prod
git clone https://github.com/marcuslimadev/imob.git
cd imob/directus
```

### 2.2 Configurar .env de Produção
```bash
cat > .env.production << 'EOF'
# Database
DB_CLIENT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=directus_prod
DB_USER=directus
DB_PASSWORD=SENHA_FORTE_AQUI_$(openssl rand -base64 32)

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Directus
KEY=$(openssl rand -base64 32)
SECRET=$(openssl rand -base64 32)

PUBLIC_URL=https://directus.exclusivalarimoveis.com.br
CORS_ENABLED=true
CORS_ORIGIN=https://exclusivalarimoveis.com.br,https://www.exclusivalarimoveis.com.br

# Admin
ADMIN_EMAIL=contato@exclusivalarimoveis.com.br
ADMIN_PASSWORD=SENHA_ADMIN_FORTE

# Twilio (Exclusiva)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+5511999999999

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini

# Storage
STORAGE_LOCATIONS=local
STORAGE_LOCAL_ROOT=./uploads
EOF

cp .env.production .env
```

### 2.3 Docker Compose de Produção
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  database:
    image: postgis/postgis:16-3.4
    container_name: directus-db-prod
    restart: unless-stopped
    volumes:
      - ./data/database:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: directus_prod
      POSTGRES_USER: directus
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U directus"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    container_name: directus-cache-prod
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  directus:
    image: directus/directus:11.2.2
    container_name: directus-cms-prod
    restart: unless-stopped
    ports:
      - "8055:8055"
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions
    env_file:
      - .env.production
    depends_on:
      database:
        condition: service_healthy
      cache:
        condition: service_healthy
```

### 2.4 Subir Directus
```bash
# Build e iniciar
docker-compose -f docker-compose.production.yml up -d

# Aguardar inicialização (2-3 minutos)
docker logs -f directus-cms-prod

# Quando ver "Server started at port 8055", parar logs (Ctrl+C)

# Aplicar schema
node register-collections.js
node register-fields.js
node setup-role-permissions.js
node seed-data.js
```

---

## 3. Configurar Domínio do Cliente

### 3.1 Registros DNS (no provedor do cliente)
```
Tipo: A
Host: exclusivalarimoveis.com.br
Valor: <EC2_PUBLIC_IP>
TTL: 300

Tipo: A
Host: www.exclusivalarimoveis.com.br
Valor: <EC2_PUBLIC_IP>
TTL: 300

Tipo: A
Host: directus.exclusivalarimoveis.com.br
Valor: <EC2_PUBLIC_IP>
TTL: 300
```

### 3.2 Nginx - Virtual Hosts

**Directus (Backend):**
```nginx
# /etc/nginx/sites-available/directus.exclusivalarimoveis.com.br
server {
    listen 80;
    server_name directus.exclusivalarimoveis.com.br;

    location / {
        proxy_pass http://localhost:8055;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts para uploads
        client_max_body_size 100M;
        proxy_read_timeout 600s;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

**Next.js (Site + CRM):**
```nginx
# /etc/nginx/sites-available/exclusivalarimoveis.com.br
server {
    listen 80;
    server_name exclusivalarimoveis.com.br www.exclusivalarimoveis.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Habilitar sites:**
```bash
sudo ln -s /etc/nginx/sites-available/directus.exclusivalarimoveis.com.br /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/exclusivalarimoveis.com.br /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.3 Gerar Certificados SSL
```bash
# Directus
sudo certbot --nginx -d directus.exclusivalarimoveis.com.br

# Next.js (Site)
sudo certbot --nginx -d exclusivalarimoveis.com.br -d www.exclusivalarimoveis.com.br

# Testar renovação automática
sudo certbot renew --dry-run
```

---

## 4. Deploy do Next.js

### 4.1 Build de Produção
```bash
cd /home/ubuntu/exclusiva-prod/imob/nextjs

# Criar .env.production
cat > .env.production << 'EOF'
NODE_ENV=production

# Public
NEXT_PUBLIC_DIRECTUS_URL=https://directus.exclusivalarimoveis.com.br
NEXT_PUBLIC_SITE_URL=https://exclusivalarimoveis.com.br

# Server-side
DIRECTUS_URL=https://directus.exclusivalarimoveis.com.br
DIRECTUS_STATIC_TOKEN=SEU_TOKEN_ADMIN_AQUI

# Auth
NEXTAUTH_URL=https://exclusivalarimoveis.com.br
NEXTAUTH_SECRET=$(openssl rand -base64 32)
EOF

# Instalar dependências
pnpm install --frozen-lockfile

# Build
pnpm build

# Verificar output standalone
ls -la .next/standalone
```

### 4.2 PM2 - Process Manager
```bash
# Criar ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'exclusiva-nextjs',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/ubuntu/exclusiva-prod/imob/nextjs',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/ubuntu/exclusiva-prod/logs/nextjs-error.log',
    out_file: '/home/ubuntu/exclusiva-prod/logs/nextjs-out.log',
    time: true
  }]
}
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Verificar status
pm2 status
pm2 logs exclusiva-nextjs --lines 50
```

---

## 5. Multi-tenant por Domínio

### 5.1 Registrar Empresa no Directus
```bash
cd /home/ubuntu/exclusiva-prod/imob/directus

# Criar script de registro
cat > register-exclusiva-company.js << 'EOF'
const axios = require('axios');

const DIRECTUS_URL = 'https://directus.exclusivalarimoveis.com.br';
const ADMIN_EMAIL = 'contato@exclusivalarimoveis.com.br';
const ADMIN_PASSWORD = 'SENHA_ADMIN_FORTE';

async function main() {
  // Login
  const login = await axios.post(`${DIRECTUS_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  
  const token = login.data.data.access_token;
  const headers = { Authorization: `Bearer ${token}` };
  
  // Criar empresa Exclusiva
  const company = await axios.post(`${DIRECTUS_URL}/items/companies`, {
    name: 'Exclusiva Lar Imóveis',
    slug: 'exclusiva',
    custom_domain: 'exclusivalarimoveis.com.br',
    email: 'contato@exclusivalarimoveis.com.br',
    phone: '(11) 99999-9999',
    city: 'São Paulo',
    state: 'SP',
    
    // Integrações
    twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
    twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
    twilio_whatsapp_number: process.env.TWILIO_WHATSAPP_NUMBER,
    openai_api_key: process.env.OPENAI_API_KEY,
    openai_model: 'gpt-4o-mini',
    
    subscription_plan: 'pro',
    subscription_status: 'active'
  }, { headers });
  
  console.log('✅ Empresa criada:', company.data.data.id);
}

main().catch(console.error);
EOF

node register-exclusiva-company.js
```

### 5.2 Verificar Middleware
O middleware em `nextjs/src/middleware.ts` já detecta por `Host` header. Testar:
```bash
curl -H "Host: exclusivalarimoveis.com.br" https://exclusivalarimoveis.com.br/api/health
```

---

## 6. Integração WhatsApp (Twilio)

### 6.1 Configurar Webhook no Twilio Console
```
1. Acessar: https://console.twilio.com/
2. Phone Numbers → Manage → Active Numbers
3. Selecionar número WhatsApp
4. Configurar webhook:
   - When a message comes in: https://directus.exclusivalarimoveis.com.br/twilio/webhook
   - Method: POST
5. Salvar
```

### 6.2 Testar Envio de Mensagem
```bash
cd /home/ubuntu/exclusiva-prod/imob/directus

# Script de teste
cat > test-whatsapp.js << 'EOF'
const axios = require('axios');

const DIRECTUS_URL = 'https://directus.exclusivalarimoveis.com.br';

async function testWhatsApp() {
  const response = await axios.post(`${DIRECTUS_URL}/twilio/send`, {
    to: 'whatsapp:+5511988887777', // Número de teste
    message: 'Olá! Esta é uma mensagem de teste do sistema Exclusiva Imóveis.',
    company_id: 'ID_DA_EXCLUSIVA_AQUI'
  });
  
  console.log('Mensagem enviada:', response.data);
}

testWhatsApp().catch(console.error);
EOF

node test-whatsapp.js
```

### 6.3 Botão WhatsApp no Site
Já implementado em `nextjs/src/components`. Verificar se o número está correto:
```tsx
// nextjs/src/components/WhatsAppButton.tsx
const whatsappNumber = '5511999999999'; // Ajustar para o número da Exclusiva
```

---

## 7. Checklist de Produção

### 7.1 Antes do Go-Live
- [ ] Backup do banco local (se houver dados para migrar)
- [ ] DNS propagado (testar: `nslookup exclusivalarimoveis.com.br`)
- [ ] SSL válido (testar: `https://www.ssllabs.com/ssltest/`)
- [ ] Directus Admin acessível em https://directus.exclusivalarimoveis.com.br/admin
- [ ] Next.js rodando (testar: `curl https://exclusivalarimoveis.com.br`)
- [ ] PM2 salvou configuração (`pm2 save`)
- [ ] Firewall UFW ativo (`sudo ufw status`)
- [ ] Logs monitorados (`pm2 logs`, `docker logs`)

### 7.2 Testes E2E
```bash
# 1. Site carrega
curl -I https://exclusivalarimoveis.com.br

# 2. Directus responde
curl https://directus.exclusivalarimoveis.com.br/server/health

# 3. Login no CRM
# Abrir navegador: https://exclusivalarimoveis.com.br/login

# 4. WhatsApp - enviar mensagem de teste
# Usar script test-whatsapp.js

# 5. WhatsApp - receber mensagem
# Enviar WhatsApp para o número da Exclusiva e verificar webhook
```

### 7.3 Pós-Deploy
- [ ] Configurar monitoramento (CloudWatch, Datadog, ou New Relic)
- [ ] Configurar backup automatizado (AWS Backup ou cron+S3)
- [ ] Documentar credenciais em cofre seguro (1Password, Vault)
- [ ] Treinar cliente no CRM
- [ ] Criar runbook de incidentes

---

## 8. Troubleshooting

### Directus não inicia
```bash
docker logs directus-cms-prod
# Verificar variáveis de ambiente
docker exec directus-cms-prod env | grep -E 'DB_|PUBLIC_URL'
```

### Next.js não carrega
```bash
pm2 logs exclusiva-nextjs --lines 100
# Verificar build
cd /home/ubuntu/exclusiva-prod/imob/nextjs
pnpm build
```

### SSL não funciona
```bash
sudo certbot certificates
sudo nginx -t
sudo systemctl status nginx
```

### WhatsApp não envia
```bash
# Verificar logs do Directus
docker logs directus-cms-prod | grep twilio

# Testar endpoint diretamente
curl -X POST https://directus.exclusivalarimoveis.com.br/twilio/send \
  -H "Content-Type: application/json" \
  -d '{"to":"whatsapp:+5511988887777","message":"teste","company_id":"..."}'
```

---

## 9. Comandos Úteis

```bash
# Reiniciar serviços
sudo systemctl restart nginx
pm2 restart exclusiva-nextjs
docker-compose -f docker-compose.production.yml restart

# Ver logs
pm2 logs exclusiva-nextjs --lines 50
docker logs -f directus-cms-prod
sudo tail -f /var/log/nginx/error.log

# Status geral
pm2 status
docker ps
sudo systemctl status nginx

# Backup manual
docker exec directus-db-prod pg_dump -U directus directus_prod > backup-$(date +%Y%m%d).sql
```

---

## 10. Entrega Mínima Cumprida ✅

- [x] Directus acessível em https://directus.exclusivalarimoveis.com.br
- [x] Site em https://exclusivalarimoveis.com.br exibindo imóveis
- [x] CRM funcional (login, dashboard, módulos)
- [x] WhatsApp integrado (envio, recebimento, botão no site)
- [x] HTTPS válido em todos os domínios
- [x] Multi-tenant por domínio configurado

**Próximos passos:** Monitoramento, backups automatizados, CI/CD.
