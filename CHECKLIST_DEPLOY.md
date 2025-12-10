# ✅ Checklist de Deploy - Exclusiva Imóveis

## PRÉ-DEPLOY

### Infraestrutura AWS
- [ ] Criar conta AWS (ou usar existente)
- [ ] Criar EC2 instance (t3.medium, Ubuntu 24.04, sa-east-1)
- [ ] Configurar Security Group (portas 22, 80, 443, 8055)
- [ ] Alocar Elastic IP (opcional, para IP fixo)
- [ ] Baixar chave SSH (.pem)
- [ ] Testar conexão SSH

### Domínio
- [ ] Acessar painel do registrador de domínio
- [ ] Criar registro A: `exclusivalarimoveis.com.br` → IP da EC2
- [ ] Criar registro A: `www.exclusivalarimoveis.com.br` → IP da EC2
- [ ] Criar registro A: `directus.exclusivalarimoveis.com.br` → IP da EC2
- [ ] Aguardar propagação DNS (15-60 minutos)
- [ ] Verificar: `nslookup exclusivalarimoveis.com.br`

### Credenciais
- [ ] Obter Twilio Account SID (console Twilio)
- [ ] Obter Twilio Auth Token (console Twilio)
- [ ] Obter número WhatsApp do Twilio (formato: whatsapp:+5511999999999)
- [ ] Obter OpenAI API Key (platform.openai.com)
- [ ] Gerar senhas fortes para Directus (usar `openssl rand -base64 32`)
- [ ] Documentar todas as credenciais em cofre seguro (1Password, Bitwarden, etc.)

---

## DEPLOY INICIAL

### 1. Conectar na EC2
```bash
ssh -i "exclusiva-key.pem" ubuntu@<EC2_IP>
```

- [ ] Conexão SSH estabelecida
- [ ] Atualizar sistema: `sudo apt update && sudo apt upgrade -y`

### 2. Instalar Dependências
```bash
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2 pnpm
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
```

- [ ] Docker instalado e rodando
- [ ] Node.js 20 instalado
- [ ] PM2 e pnpm instalados
- [ ] Nginx instalado

### 3. Configurar Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8055/tcp
sudo ufw enable
```

- [ ] UFW configurado
- [ ] Portas liberadas

### 4. Clonar Repositório
```bash
cd /home/ubuntu
mkdir -p exclusiva-prod/logs
cd exclusiva-prod
git clone https://github.com/marcuslimadev/imob.git
cd imob
```

- [ ] Repositório clonado
- [ ] Estrutura de diretórios criada

---

## CONFIGURAÇÃO DIRECTUS

### 5. Criar .env de Produção
```bash
cd /home/ubuntu/exclusiva-prod/imob/directus
cp .env.production.template .env.production
nano .env.production
```

- [ ] Copiar template
- [ ] Gerar `DB_PASSWORD`: `openssl rand -base64 32`
- [ ] Gerar `DIRECTUS_KEY`: `openssl rand -base64 32`
- [ ] Gerar `DIRECTUS_SECRET`: `openssl rand -base64 32`
- [ ] Adicionar Twilio credentials
- [ ] Adicionar OpenAI API key
- [ ] Definir senha admin forte
- [ ] Salvar arquivo (Ctrl+O, Enter, Ctrl+X)

### 6. Subir Directus
```bash
cp .env.production .env
docker-compose -f docker-compose.production.yml up -d
docker logs -f directus-cms-prod
```

- [ ] Containers iniciados (database, cache, directus)
- [ ] Aguardar "Server started at port 8055" (2-3 min)
- [ ] Testar: `curl http://localhost:8055/server/health`

### 7. Aplicar Schema
```bash
npm install --production
node register-collections.js
node register-fields.js
node setup-role-permissions.js
```

- [ ] Collections criadas (16 total)
- [ ] Fields registrados
- [ ] Permissions aplicadas

### 8. Registrar Empresa Exclusiva
```bash
# Script já incluído em deploy-production.sh
# Ou executar manualmente:
node -e "$(cat scripts/register-exclusiva-company.js)"
```

- [ ] Empresa Exclusiva criada
- [ ] Company_id salvo para referência
- [ ] Credenciais Twilio/OpenAI vinculadas

---

## CONFIGURAÇÃO NEXT.JS

### 9. Criar .env de Produção
```bash
cd /home/ubuntu/exclusiva-prod/imob/nextjs
cp .env.production.template .env.production
nano .env.production
```

- [ ] Copiar template
- [ ] Gerar `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] Ajustar `WHATSAPP_NUMBER` para número da Exclusiva
- [ ] **PENDENTE**: Obter `DIRECTUS_STATIC_TOKEN` (fazer após Nginx+SSL)
- [ ] Salvar arquivo

### 10. Build e Iniciar
```bash
pnpm install --frozen-lockfile
pnpm build
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

- [ ] Dependências instaladas
- [ ] Build concluído (.next/standalone criado)
- [ ] PM2 iniciado (2 processos em cluster)
- [ ] PM2 configurado para auto-start no boot
- [ ] Testar: `curl http://localhost:3000`

---

## CONFIGURAÇÃO NGINX

### 11. Configurar Virtual Hosts
```bash
sudo cp /home/ubuntu/exclusiva-prod/imob/nginx/directus.conf /etc/nginx/sites-available/directus.exclusivalarimoveis.com.br
sudo cp /home/ubuntu/exclusiva-prod/imob/nginx/nextjs.conf /etc/nginx/sites-available/exclusivalarimoveis.com.br

sudo ln -sf /etc/nginx/sites-available/directus.exclusivalarimoveis.com.br /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/exclusivalarimoveis.com.br /etc/nginx/sites-enabled/

sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

- [ ] Configurações copiadas
- [ ] Symlinks criados
- [ ] Teste de sintaxe OK
- [ ] Nginx recarregado

### 12. Gerar Certificados SSL
```bash
sudo certbot --nginx -d directus.exclusivalarimoveis.com.br
sudo certbot --nginx -d exclusivalarimoveis.com.br -d www.exclusivalarimoveis.com.br
sudo certbot renew --dry-run
```

- [ ] SSL para Directus obtido
- [ ] SSL para site obtido
- [ ] Auto-renovação configurada
- [ ] Testar HTTPS: `https://directus.exclusivalarimoveis.com.br`
- [ ] Testar HTTPS: `https://exclusivalarimoveis.com.br`

---

## OBTER TOKEN ESTÁTICO

### 13. Criar Token no Directus Admin
```
1. Acessar: https://directus.exclusivalarimoveis.com.br/admin
2. Login com ADMIN_EMAIL e ADMIN_PASSWORD
3. Settings → Access Tokens
4. Create New Token:
   - Name: "Next.js Server"
   - Role: Administrator
   - Copiar o token gerado
5. Voltar na EC2:
   cd /home/ubuntu/exclusiva-prod/imob/nextjs
   nano .env.production
6. Adicionar: DIRECTUS_STATIC_TOKEN=token_copiado_aqui
7. Salvar e reiniciar PM2:
   pm2 reload ecosystem.config.js --env production
```

- [ ] Token criado no Directus
- [ ] `.env.production` atualizado
- [ ] PM2 reiniciado
- [ ] Testar login no site: `https://exclusivalarimoveis.com.br/login`

---

## INTEGRAÇÃO WHATSAPP

### 14. Configurar Webhook no Twilio
```
1. Acessar: https://console.twilio.com/
2. Phone Numbers → Manage → Active Numbers
3. Selecionar número WhatsApp da Exclusiva
4. Messaging Configuration:
   - A message comes in: Webhook
   - URL: https://directus.exclusivalarimoveis.com.br/twilio/webhook
   - HTTP Method: POST
5. Salvar
```

- [ ] Webhook configurado
- [ ] URL HTTPS válida
- [ ] Testar enviando WhatsApp para o número

### 15. Testar Envio/Recebimento
```bash
cd /home/ubuntu/exclusiva-prod/imob/directus

# Enviar mensagem de teste
curl -X POST https://directus.exclusivalarimoveis.com.br/twilio/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+5511988887777",
    "message": "Teste do sistema Exclusiva",
    "company_id": "ID_DA_EMPRESA_AQUI"
  }'

# Verificar logs
docker logs directus-cms-prod | grep twilio
```

- [ ] Envio de mensagem funciona
- [ ] Webhook recebe mensagens (verificar no CRM)
- [ ] Botão WhatsApp no site abre conversa

---

## TESTES E2E

### 16. Executar Testes Automatizados
```bash
cd /home/ubuntu/exclusiva-prod/imob
chmod +x scripts/test-production.sh
./scripts/test-production.sh
```

- [ ] Todos os testes automatizados passaram
- [ ] SSL válido em ambos os domínios
- [ ] Docker containers rodando
- [ ] PM2 process online

### 17. Testes Manuais
- [ ] Acessar Directus Admin: https://directus.exclusivalarimoveis.com.br/admin
- [ ] Verificar collections criadas
- [ ] Verificar empresa Exclusiva registrada
- [ ] Acessar site: https://exclusivalarimoveis.com.br
- [ ] Fazer login no CRM
- [ ] Navegar pelos módulos (Dashboard, Imóveis, Leads, Conversas)
- [ ] Cadastrar imóvel de teste
- [ ] Enviar WhatsApp pelo CRM
- [ ] Receber WhatsApp (enviar do celular)
- [ ] Verificar se mensagem aparece no CRM
- [ ] Testar botão WhatsApp flutuante no site

---

## PÓS-DEPLOY

### 18. Importar Dados (se necessário)
```bash
# Se houver backup do banco antigo
docker exec -i directus-db-prod psql -U directus directus_prod < backup.sql

# Ou executar worker de importação
cd /home/ubuntu/exclusiva-prod/imob/directus
npm run import:properties
```

- [ ] Dados importados (se aplicável)
- [ ] Imagens de imóveis transferidas

### 19. Monitoramento
```bash
# Configurar CloudWatch Agent (opcional)
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Ou usar PM2 monitoring
pm2 link <secret_key> <public_key>  # Criar conta em pm2.io
```

- [ ] Monitoramento configurado (CloudWatch, PM2, Datadog, ou New Relic)
- [ ] Alertas configurados (CPU, memória, disco)

### 20. Backup Automatizado
```bash
# Criar script de backup
cat > /home/ubuntu/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec directus-db-prod pg_dump -U directus directus_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /home/ubuntu/exclusiva-prod/imob/directus/uploads

# Manter últimos 7 dias
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

# Upload para S3 (opcional)
# aws s3 sync $BACKUP_DIR s3://exclusiva-backups/
EOF

chmod +x /home/ubuntu/backup-db.sh

# Adicionar ao cron (diariamente às 3h)
(crontab -l 2>/dev/null; echo "0 3 * * * /home/ubuntu/backup-db.sh") | crontab -
```

- [ ] Script de backup criado
- [ ] Cron job configurado
- [ ] Testar backup manual: `/home/ubuntu/backup-db.sh`
- [ ] (Opcional) Configurar S3 para backups externos

### 21. Documentação
- [ ] Documentar credenciais em cofre seguro
- [ ] Criar runbook de incidentes
- [ ] Treinar cliente no uso do CRM
- [ ] Criar manual do usuário (se necessário)

### 22. CI/CD - GitHub Actions
```
1. Acessar: https://github.com/marcuslimadev/imob/settings/secrets/actions
2. Adicionar secrets:
   - EC2_SSH_KEY: conteúdo do arquivo .pem
   - EC2_HOST: IP da EC2
   - EC2_USER: ubuntu
3. Fazer um push de teste:
   git add .
   git commit -m "test: deploy automático"
   git push
4. Verificar execução: https://github.com/marcuslimadev/imob/actions
```

- [ ] Secrets configurados no GitHub
- [ ] Primeiro deploy via Actions testado
- [ ] Health checks passaram
- [ ] Workflow funcionando corretamente

---

## ENTREGA FINAL ✅

- [ ] **Site público acessível**: https://exclusivalarimoveis.com.br
- [ ] **HTTPS válido** (cadeado verde)
- [ ] **Imóveis listados** no site
- [ ] **CRM funcional** (login, dashboard, módulos)
- [ ] **WhatsApp integrado** (envio + recebimento)
- [ ] **Directus Admin acessível**: https://directus.exclusivalarimoveis.com.br/admin
- [ ] **Multi-tenant funcionando** (detecção por domínio)
- [ ] **Todos os testes E2E passaram**
- [ ] **Backups configurados**
- [ ] **Monitoramento ativo**
- [ ] **CI/CD configurado** (GitHub Actions)
- [ ] **Cliente treinado**

---

## TROUBLESHOOTING RÁPIDO

### Directus não inicia
```bash
docker logs directus-cms-prod
docker exec directus-cms-prod env | grep DB_
docker-compose -f docker-compose.production.yml restart directus
```

### Next.js erro 502
```bash
pm2 logs exclusiva-nextjs --lines 100
pm2 restart exclusiva-nextjs
sudo systemctl status nginx
```

### SSL não funciona
```bash
sudo certbot certificates
sudo nginx -t
sudo systemctl reload nginx
```

### WhatsApp não envia
```bash
docker logs directus-cms-prod | grep twilio
curl http://localhost:8055/twilio/send -X POST -H "Content-Type: application/json" -d '{"to":"whatsapp:+5511988887777","message":"teste"}'
```

### DNS não propaga
```bash
nslookup exclusivalarimoveis.com.br
dig exclusivalarimoveis.com.br
```

---

## COMANDOS ÚTEIS

```bash
# Ver logs em tempo real
pm2 logs exclusiva-nextjs
docker logs -f directus-cms-prod
sudo tail -f /var/log/nginx/error.log

# Reiniciar serviços
pm2 restart exclusiva-nextjs
docker-compose -f docker-compose.production.yml restart
sudo systemctl restart nginx

# Status geral
pm2 status
docker ps
sudo systemctl status nginx
sudo ufw status

# Monitoramento de recursos
htop
df -h
free -h
```

---

**Tempo estimado total: 3-4 horas** (excluindo propagação DNS)
