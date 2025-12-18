# 🚀 Guia Rápido de Deploy - Jenkins Setup

## ⚡ Start Rápido (5 minutos)

### 1. Iniciar Jenkins

**Opção A - Docker Compose (Recomendado):**
```powershell
cd jenkins
docker-compose up -d
```

**Opção B - Script de start:**
```bash
chmod +x jenkins/start-jenkins.sh
./jenkins/start-jenkins.sh
```

**Opção C - Docker run direto:**
```powershell
docker run -d `
  --name jenkins `
  -p 8080:8080 `
  -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  --user root `
  jenkins/jenkins:lts
```

### 2. Acessar Jenkins

1. Abra: http://localhost:8080
2. Obtenha a senha inicial:

```powershell
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

3. Cole a senha e clique **Continue**
4. Selecione **Install suggested plugins**
5. Crie seu usuário admin

### 3. Instalar Plugins AWS

1. **Manage Jenkins** → **Manage Plugins** → **Available**
2. Buscar e instalar:
   - ✅ Pipeline AWS Steps
   - ✅ Docker Pipeline
   - ✅ Git
3. **Restart Jenkins**

### 4. Configurar Credenciais AWS

1. **Manage Jenkins** → **Manage Credentials** → **(global)** → **Add Credentials**
2. **Kind:** AWS Credentials
3. **ID:** `aws-credentials`
4. **Access Key ID:** `<sua-access-key>`
5. **Secret Access Key:** `<sua-secret-key>`
6. **Save**

### 5. Criar Job de Deploy

1. **New Item**
2. **Nome:** `imobi-frontend-deploy`
3. **Tipo:** Pipeline
4. **OK**

**Configurar Pipeline:**

- **Pipeline script from SCM**
- **SCM:** Git
- **Repository URL:** seu repositório Git
- **Branch:** `*/main`
- **Script Path:** `Jenkinsfile`
- **Save**

### 6. Executar Primeiro Deploy

1. Clique em **Build Now**
2. Aguarde o build completar (~5-8 min)
3. Verifique: https://lojadaesquina.store/

---

## 🔧 Deploy Manual (Sem Jenkins)

Se preferir deploy manual por enquanto:

```powershell
# 1. Build
cd d:\Saas\imob\nextjs
docker build -f Dockerfile.prod -t 575098225472.dkr.ecr.sa-east-1.amazonaws.com/imobi-frontend:latest .

# 2. Login ECR
aws ecr get-login-password --region sa-east-1 | docker login --username AWS --password-stdin 575098225472.dkr.ecr.sa-east-1.amazonaws.com

# 3. Push
docker push 575098225472.dkr.ecr.sa-east-1.amazonaws.com/imobi-frontend:latest

# 4. Deploy
aws ecs update-service --cluster production-imobi-cluster --service production-imobi-frontend --force-new-deployment --region sa-east-1

# 5. Aguardar
Start-Sleep -Seconds 120

# 6. Verificar
curl https://lojadaesquina.store/home
```

---

## 🐛 Troubleshooting

### Jenkins não inicia

```powershell
# Ver logs
docker logs jenkins

# Reiniciar
docker restart jenkins
```

### Erro "Cannot connect to Docker daemon"

```bash
# Adicionar jenkins ao grupo docker
docker exec -u root jenkins usermod -aG docker jenkins
docker restart jenkins
```

### Build falha no ECR login

```powershell
# Verificar credenciais AWS
docker exec jenkins aws sts get-caller-identity

# Reconfigurr credenciais se necessário
```

### Pipeline não encontra Jenkinsfile

- Verificar que `Jenkinsfile` está na raiz do repositório
- Verificar branch correto configurado no Job
- Fazer commit e push do Jenkinsfile

---

## 📊 Status do Sistema

**Após setup completo, você terá:**

✅ Jenkins rodando em http://localhost:8080  
✅ Pipeline automatizado configurado  
✅ Deploy automático via Git push (com webhook)  
✅ Rollback automático em caso de falha  
✅ Health checks após cada deploy  
✅ Logs centralizados  

**Tempo total de deploy:** 5-8 minutos (vs 15-20 minutos manual)

---

## 🎯 Próximos Passos

1. ✅ Configurar webhook GitHub para auto-deploy
2. ⬜ Adicionar testes automatizados
3. ⬜ Configurar ambiente de staging
4. ⬜ Setup de notificações Slack/Email
5. ⬜ Métricas e monitoramento

---

**Precisa de ajuda?** Veja [jenkins/README.md](jenkins/README.md) para documentação completa.
