# GitHub Actions - CI/CD para Exclusiva

## Workflow: Deploy Automático para AWS EC2

### O que faz?
Toda vez que você faz `git push` para `main` ou `master`, o GitHub Actions executa automaticamente:

1. **Conecta na EC2** via SSH
2. **Atualiza código** (`git pull`)
3. **Reconstrói Directus** (Docker Compose)
4. **Reconstrói Next.js** (pnpm build)
5. **Reinicia PM2** (zero downtime)
6. **Executa health checks** (Directus + Next.js)

### Configuração de Secrets

No GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

| Secret | Valor | Descrição |
|--------|-------|-----------|
| `EC2_SSH_KEY` | Conteúdo da chave privada `.pem` | Chave SSH para conectar na EC2 |
| `EC2_HOST` | `18.206.14.123` ou IP da EC2 | IP público da instância |
| `EC2_USER` | `ubuntu` | Usuário SSH (padrão: ubuntu) |

#### Como obter EC2_SSH_KEY:
```bash
# No seu computador local, onde está a chave .pem:
cat exclusiva-key.pem

# Copie TODO o conteúdo (incluindo -----BEGIN RSA PRIVATE KEY-----)
# Cole no GitHub Secret EC2_SSH_KEY
```

### Como Usar

#### Fluxo de Deploy Simples:
```bash
# 1. Fazer alterações no código
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push

# 2. Aguardar GitHub Actions executar (2-3 minutos)
# 3. Verificar em: https://github.com/marcuslimadev/imob/actions
```

#### Verificar Status do Deploy:
1. Acessar: https://github.com/marcuslimadev/imob/actions
2. Clicar no último workflow executado
3. Ver logs em tempo real de cada step

### O que acontece em cada push?

```
📥 Checkout code (GitHub baixa o código)
  ↓
🔑 Setup SSH key (Configura chave para EC2)
  ↓
🔐 Add EC2 to known_hosts (Evita prompt de confirmação)
  ↓
🚀 Deploy to EC2:
  ├─ git pull (atualiza código na EC2)
  ├─ docker-compose up -d --build (reconstrói Directus)
  ├─ pnpm install + pnpm build (reconstrói Next.js)
  ├─ pm2 reload (reinicia app sem downtime)
  └─ docker ps + pm2 list (mostra status)
  ↓
🧪 Health Check:
  ├─ curl Directus API (https://directus.exclusivalarimoveis.com.br/server/health)
  └─ curl Next.js (https://exclusivalarimoveis.com.br)
  ↓
✅ Deploy concluído!
```

### Rollback em Caso de Erro

Se um deploy der errado:

```bash
# Conectar na EC2
ssh -i exclusiva-key.pem ubuntu@18.206.14.123

# Ver commits recentes
cd ~/exclusiva-prod/imob
git log --oneline -5

# Voltar para commit anterior
git reset --hard <commit_hash>

# Redeployar manualmente
cd directus
docker-compose -f docker-compose.production.yml restart

cd ../nextjs
pnpm build
pm2 reload ecosystem.config.js
```

### Logs e Monitoramento

#### Ver logs do workflow:
- GitHub: https://github.com/marcuslimadev/imob/actions

#### Ver logs na EC2:
```bash
# Directus
docker logs -f directus-cms-prod

# Next.js
pm2 logs exclusiva-nextjs

# Nginx
sudo tail -f /var/log/nginx/error.log
```

### Customizações Futuras

#### Deploy apenas do Next.js (sem Directus):
```yaml
# Remover o bloco "Atualizando Directus (Docker)" do deploy.yml
```

#### Deploy com testes antes:
```yaml
- name: Run Tests
  run: |
    cd nextjs
    pnpm test
```

#### Notificação no Slack/Discord:
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Segurança

- ✅ Chave SSH armazenada como secret (criptografada)
- ✅ SSH key com permissões 600 (restrita)
- ✅ Known hosts validado (previne MITM)
- ✅ Health checks garantem que deploy não quebrou nada
- ✅ Logs completos para auditoria

### Troubleshooting

#### Erro: "Permission denied (publickey)"
- Verificar se `EC2_SSH_KEY` foi copiado corretamente (incluindo header/footer)
- Verificar se IP em `EC2_HOST` está correto

#### Erro: "docker: command not found"
- Certifique-se de que usuário `ubuntu` foi adicionado ao grupo docker:
  ```bash
  sudo usermod -aG docker ubuntu
  # Fazer logout/login
  ```

#### Erro: "pnpm: command not found"
- Instalar pnpm globalmente na EC2:
  ```bash
  sudo npm install -g pnpm
  ```

#### Health check falha
- Aguardar 1-2 minutos e tentar novamente (serviços podem demorar para iniciar)
- Verificar logs: `docker logs directus-cms-prod` ou `pm2 logs`

---

## Próximos Passos

1. ✅ Configurar secrets no GitHub
2. ✅ Fazer primeiro push de teste
3. ✅ Verificar execução em Actions
4. 🔄 Configurar notificações (Slack/Discord) - opcional
5. 🔄 Adicionar testes automatizados - opcional
