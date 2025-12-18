# 🚀 Jenkins CI/CD para iMOBI

Configuração completa do pipeline Jenkins para deploy automatizado no AWS ECS.

## 📋 Pré-requisitos

- Jenkins instalado (versão 2.300+)
- Docker instalado no servidor Jenkins
- Acesso AWS com permissões para ECR e ECS
- Git configurado

## 🛠️ Instalação

### 1. Instalar Jenkins via Docker (Recomendado)

```bash
# Usar o docker-compose.yml incluído
docker-compose -f jenkins/docker-compose.yml up -d

# Acessar: http://localhost:8080
# Senha inicial: docker logs jenkins | grep -A 2 "Administrator password"
```

### 2. Plugins Necessários

No Jenkins, instalar os seguintes plugins:

1. **Pipeline** (já vem instalado)
2. **Docker Pipeline**
3. **AWS Steps Plugin**
4. **Git Plugin**
5. **GitHub Plugin** (opcional, para webhooks)
6. **Slack Notification** (opcional)

**Instalação via Jenkins UI:**
```
Manage Jenkins → Manage Plugins → Available → Buscar e instalar
```

**Instalação via CLI:**
```bash
jenkins-cli install-plugin docker-workflow pipeline-aws git github slack
```

### 3. Configurar Credenciais AWS

**No Jenkins UI:**

1. `Manage Jenkins` → `Manage Credentials` → `(global)` → `Add Credentials`

2. **Tipo:** AWS Credentials

3. **ID:** `aws-credentials`

4. **Access Key ID:** Sua AWS Access Key

5. **Secret Access Key:** Sua AWS Secret Key

6. **Description:** AWS Credentials for ECS Deployment

**Alternativa - Usar AWS CLI Profile:**

No servidor Jenkins:
```bash
aws configure --profile jenkins
# Insira suas credenciais
```

## 🔧 Configuração do Pipeline

### 1. Criar Job no Jenkins

1. **New Item** → Digite o nome: `imobi-frontend-deploy`

2. Selecione **Pipeline** → OK

3. Em **Pipeline**, escolha:
   - **Definition:** Pipeline script from SCM
   - **SCM:** Git
   - **Repository URL:** `https://github.com/seu-usuario/imob.git`
   - **Branch:** `*/main`
   - **Script Path:** `Jenkinsfile`

4. **Save**

### 2. Configurar Build Triggers

**Opção A - Build Manual:**
- Apenas clicar em "Build Now"

**Opção B - Webhook GitHub (Recomendado):**

1. No Jenkins Job, marcar:
   - ☑️ **GitHub hook trigger for GITScm polling**

2. No GitHub Repository:
   - Settings → Webhooks → Add webhook
   - **Payload URL:** `http://seu-jenkins:8080/github-webhook/`
   - **Content type:** application/json
   - **Events:** Just the push event
   - Save

**Opção C - Poll SCM (Menos eficiente):**
```
H/15 * * * *  # Verifica a cada 15 minutos
```

### 3. Variáveis de Ambiente

O pipeline usa as seguintes variáveis (já configuradas no Jenkinsfile):

```groovy
AWS_REGION = 'sa-east-1'
ECR_REGISTRY = '575098225472.dkr.ecr.sa-east-1.amazonaws.com'
ECR_REPOSITORY = 'imobi-frontend'
ECS_CLUSTER = 'production-imobi-cluster'
ECS_SERVICE = 'production-imobi-frontend'
```

**Para sobrescrever** (ex: ambiente staging):

1. No Job → Configure → Build Environment
2. Marcar "Environment variables"
3. Adicionar variáveis personalizadas

## 🚀 Uso

### Deploy Manual

1. Acesse o Job no Jenkins
2. Clique em **Build Now**
3. Acompanhe o progresso no **Console Output**

### Deploy Automático (com webhook)

Simplesmente faça push para o branch configurado:

```bash
git add .
git commit -m "Seu commit"
git push origin main
```

Jenkins detectará automaticamente e iniciará o build.

### Ver Status do Build

- ✅ **Verde:** Build bem-sucedido
- 🔴 **Vermelho:** Build falhou (rollback automático executado)
- ⏸️ **Cinza:** Build em andamento

## 📊 Stages do Pipeline

O pipeline executa as seguintes etapas:

1. **Checkout** - Clona o repositório Git
2. **Build Docker Image** - Cria imagem Docker otimizada
3. **Push to ECR** - Envia imagem para Amazon ECR
4. **Deploy to ECS** - Atualiza serviço ECS
5. **Health Check** - Verifica se aplicação está respondendo

### Tempo Estimado

- ⏱️ Build completo: 5-8 minutos
- 🐳 Build Docker: 2-3 minutos
- 📤 Push ECR: 1-2 minutos
- 🚀 Deploy ECS: 2-3 minutos

## 🔄 Rollback

### Automático

O pipeline faz rollback automaticamente se:
- Health check falhar após deploy
- Qualquer stage falhar

### Manual

Para fazer rollback manual:

```bash
# Via script
cd jenkins/scripts
./rollback.sh arn:aws:ecs:sa-east-1:575098225472:task-definition/nome:123

# Via AWS CLI direto
aws ecs update-service \
    --cluster production-imobi-cluster \
    --service production-imobi-frontend \
    --task-definition arn:aws:ecs:...:previous_version \
    --force-new-deployment
```

## 🐛 Troubleshooting

### Build falha no stage "Build Docker Image"

**Erro:** `Cannot connect to the Docker daemon`

**Solução:**
```bash
# Adicionar usuário jenkins ao grupo docker
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Push falha com "denied: Your authorization token has expired"

**Solução:**
```bash
# Reautenticar no ECR
aws ecr get-login-password --region sa-east-1 | \
    docker login --username AWS --password-stdin 575098225472.dkr.ecr.sa-east-1.amazonaws.com
```

### Deploy fica stuck em "Aguardando deployment estabilizar"

**Causa:** ECS não consegue iniciar as novas tasks

**Debug:**
```bash
# Ver logs das tasks
aws ecs describe-tasks \
    --cluster production-imobi-cluster \
    --tasks $(aws ecs list-tasks --cluster production-imobi-cluster --service-name production-imobi-frontend --query 'taskArns[0]' --output text)
```

### Health check falha

**Verificar manualmente:**
```bash
curl -v https://lojadaesquina.store/home
```

## 📚 Scripts Auxiliares

Todos os scripts estão em `jenkins/scripts/`:

- **build.sh** - Build Docker local
- **push.sh** - Push para ECR
- **deploy.sh** - Deploy no ECS
- **rollback.sh** - Rollback para versão anterior
- **health-check.sh** - Verificar health da aplicação

**Uso local (para testes):**

```bash
cd jenkins/scripts

# Dar permissão de execução
chmod +x *.sh

# Build
./build.sh v1.0.0

# Push
./push.sh v1.0.0

# Deploy
./deploy.sh

# Health check
./health-check.sh https://lojadaesquina.store/home
```

## 🔐 Segurança

### Boas Práticas

1. ✅ **Nunca commitar credenciais** - usar Jenkins credentials store
2. ✅ **Limitar acesso ao Jenkins** - configurar autenticação
3. ✅ **Usar HTTPS** - configurar SSL no Jenkins
4. ✅ **Backup regular** - `JENKINS_HOME` deve ter backup
5. ✅ **Audit logs** - ativar audit trail plugin

### Configurar HTTPS no Jenkins

```bash
# Gerar certificado
keytool -genkey -keyalg RSA -alias jenkins -keystore jenkins.jks -keysize 2048

# Iniciar Jenkins com HTTPS
java -jar jenkins.war --httpPort=-1 --httpsPort=8443 --httpsKeyStore=jenkins.jks --httpsKeyStorePassword=senha
```

## 📈 Monitoramento

### Notificações

**Adicionar notificações Slack** (no Jenkinsfile):

```groovy
post {
    success {
        slackSend(
            color: 'good',
            message: "Deploy bem-sucedido: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        )
    }
    failure {
        slackSend(
            color: 'danger',
            message: "Deploy falhou: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        )
    }
}
```

### Logs

**Ver logs do build:**
```
Jenkins UI → Job → Build #X → Console Output
```

**Ver logs ECS:**
```bash
aws logs tail /aws/ecs/production-imobi-frontend --follow
```

## 🎯 Próximos Passos

1. ✅ Pipeline básico funcionando
2. ⬜ Testes automatizados (unit + integration)
3. ⬜ Deploy staging antes de produção
4. ⬜ Blue/Green deployment
5. ⬜ Canary deployment (deploy gradual)
6. ⬜ Métricas e dashboards (Grafana)

## 📞 Suporte

**Problemas com Jenkins:**
- Documentação oficial: https://www.jenkins.io/doc/
- Logs: `/var/log/jenkins/jenkins.log`

**Problemas com AWS:**
- AWS CLI docs: https://docs.aws.amazon.com/cli/
- ECS troubleshooting: https://docs.aws.amazon.com/ecs/

## 📝 Checklist de Deploy

Antes do primeiro deploy, verificar:

- [ ] Jenkins instalado e rodando
- [ ] Plugins instalados (Docker, AWS Steps)
- [ ] Credenciais AWS configuradas (`aws-credentials`)
- [ ] Job criado e apontando para repositório Git correto
- [ ] Dockerfile.prod existe em `nextjs/`
- [ ] Variáveis de ambiente corretas no Jenkinsfile
- [ ] Acesso ao ECR verificado
- [ ] Acesso ao ECS cluster verificado
- [ ] Health check URL acessível
- [ ] Webhook GitHub configurado (opcional)

**Pronto! Execute o primeiro build e acompanhe o deploy automatizado! 🚀**
