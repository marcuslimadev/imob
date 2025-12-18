# 🚀 Configuração do Jenkins - iMOBI (SOCIMOB)

## ✅ Jenkins Rodando

**URL:** http://localhost:8080  
**Container:** Jenkis (98324a3f531a)  
**Status:** ✅ Online e configurado

---

## 📝 PASSO A PASSO - Criar Job de Deploy

### 1️⃣ **Acessar Jenkins**
- Abra: http://localhost:8080
- Faça login com seu usuário

### 2️⃣ **Criar Novo Job**
1. Clique em **"New Item"** (ou "Novo Item")
2. Nome: `imobi-frontend-deploy`
3. Tipo: **Pipeline**
4. Clique em **OK**

### 3️⃣ **Configurar Pipeline**

#### **General:**
- ☑️ Marque: "Discard old builds"
  - Days to keep: `7`
  - Max # of builds: `10`

#### **Build Triggers:**
Escolha uma opção:

**Opção A - Build Manual:**
- Não marque nada (você clica "Build Now" quando quiser)

**Opção B - Webhook GitHub (Recomendado):**
- ☑️ Marque: "GitHub hook trigger for GITScm polling"
- Depois configure webhook no GitHub (veja seção "Configurar Webhook GitHub" abaixo)

**Opção C - Poll SCM (Verifica mudanças):**
- ☑️ Marque: "Poll SCM"
- Schedule: `H/15 * * * *` (verifica a cada 15 minutos)

#### **Pipeline:**
- **Definition:** `Pipeline script from SCM`
- **SCM:** `Git`
- **Repository URL:** (seu repositório Git, ex: `https://github.com/seu-usuario/imob.git`)
- **Credentials:** (adicione se necessário)
- **Branch:** `*/main`
- **Script Path:** `Jenkinsfile`

### 4️⃣ **Salvar**
Clique em **Save**

---

## 🔧 Configurar Credenciais AWS

### 1️⃣ **Instalar Plugin AWS Steps**
1. Vá em: **Manage Jenkins** → **Manage Plugins**
2. Aba **Available**
3. Busque: `Pipeline: AWS Steps`
4. Marque e clique **Install without restart**

### 2️⃣ **Adicionar Credenciais AWS**
1. Vá em: **Manage Jenkins** → **Manage Credentials**
2. Clique em **(global)**
3. Clique em **Add Credentials**
4. Preencha:
   - **Kind:** `AWS Credentials`
   - **ID:** `aws-credentials`
   - **Access Key ID:** (sua AWS access key)
   - **Secret Access Key:** (sua AWS secret key)
   - **Description:** `AWS Credentials for ECS Deploy`
5. Clique em **Create**

---

## 🚀 Executar Primeiro Deploy

### 1️⃣ **Trigger Manual**
1. Acesse o job: http://localhost:8080/job/imobi-frontend-deploy/
2. Clique em **"Build Now"**
3. Acompanhe em **"Console Output"**

### 2️⃣ **Acompanhar Progresso**
O pipeline tem 5 stages:
1. ✅ Checkout (10s)
2. 🐳 Build Docker Image (2-3 min)
3. 📤 Push to ECR (1-2 min)
4. 🚀 Deploy to ECS (2-3 min)
5. 🏥 Health Check (30s)

**Tempo total:** ~6-8 minutos

### 3️⃣ **Resultado**
- ✅ **Verde:** Deploy bem-sucedido
- 🔴 **Vermelho:** Deploy falhou (rollback automático)

---

## 📊 Monitoramento

### **Ver Build Anterior**
- Clique no número do build na sidebar
- Clique em **"Console Output"**

### **Ver Histórico**
- Na página do job, veja lista de builds
- Verde = sucesso, Vermelho = falha

### **Logs do ECS**
```powershell
aws logs tail /aws/ecs/production-imobi-frontend --follow
```

---

## 🐛 Troubleshooting

### ❌ "Cannot connect to Docker daemon"
**Solução:**
```bash
docker exec -u root Jenkis usermod -aG docker jenkins
docker restart Jenkis
```

### ❌ "AWS credentials not found"
**Solução:**
- Verifique se criou credenciais com ID: `aws-credentials`
- Vá em Manage Credentials e confirme

### ❌ Build fica em fila mas não executa
**Solução:**
- Verifique se há executors disponíveis
- Manage Jenkins → Nodes → Built-In Node → Configure
- Defina "# of executors" para 2 ou mais

---

## 🎯 Configuração Completa Checklist

- [ ] Jenkins acessível em http://localhost:8080
- [ ] Plugin "Pipeline: AWS Steps" instalado
- [ ] Plugin "Docker Pipeline" instalado (geralmente já vem)
- [ ] Credenciais AWS configuradas (ID: `aws-credentials`)
- [ ] Job `imobi-frontend-deploy` criado
- [ ] Pipeline configurado (SCM → Git → Jenkinsfile)
- [ ] Primeiro build executado com sucesso

---

## 🌐 Configurar Webhook GitHub (Deploy Automático)

### **⚠️ IMPORTANTE: Jenkins Precisa Estar Acessível Externamente**

Para que o GitHub consiga enviar notificações para o Jenkins, ele precisa estar acessível pela internet.

### **Opção 1: Usar ngrok (Desenvolvimento/Teste) - MAIS FÁCIL**

#### 1️⃣ **Instalar ngrok**
```powershell
# Download de: https://ngrok.com/download
# Ou via chocolatey:
choco install ngrok
```

#### 2️⃣ **Criar conta no ngrok**
- Acesse: https://dashboard.ngrok.com/signup
- Copie seu authtoken

#### 3️⃣ **Configurar authtoken**
```powershell
ngrok config add-authtoken SEU_TOKEN_AQUI
```

#### 4️⃣ **Expor Jenkins**
```powershell
ngrok http 8080
```

Você verá algo como:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8080
```

**✅ Copie a URL https (abc123.ngrok.io)** - você usará no GitHub!

---

### **Opção 2: Configurar Servidor na Nuvem (Produção)**

Se o Jenkins estiver em um servidor AWS/Azure/etc:

1. **Liberar porta 8080** no Security Group/Firewall
2. **Obter IP público** do servidor
3. **URL será:** `http://SEU-IP-PUBLICO:8080/github-webhook/`

**⚠️ Recomendado:** Configure HTTPS com certificado SSL para segurança

---

### **📝 Configurar Webhook no GitHub**

#### 1️⃣ **Acessar Repositório GitHub**
- Vá para: https://github.com/marcuslimadev/imob
- Clique em **Settings** (configurações)

#### 2️⃣ **Adicionar Webhook**
1. No menu lateral, clique em **Webhooks**
2. Clique em **Add webhook**

#### 3️⃣ **Preencher Dados do Webhook**

| Campo | Valor |
|-------|-------|
| **Payload URL** | `https://abc123.ngrok.io/github-webhook/` |
| **Content type** | `application/json` |
| **Secret** | (deixe vazio por enquanto) |
| **Which events?** | ☑️ **Just the push event** |
| **Active** | ☑️ Marcado |

**⚠️ IMPORTANTE:** 
- Se usar ngrok: `https://SEU-NGROK.ngrok.io/github-webhook/`
- Se servidor público: `http://SEU-IP:8080/github-webhook/`
- **NÃO ESQUEÇA** o `/github-webhook/` no final!

#### 4️⃣ **Salvar**
Clique em **Add webhook**

#### 5️⃣ **Testar Webhook**
1. Após salvar, GitHub enviará um ping
2. Vá para a aba **Recent Deliveries**
3. Você verá o ping com ✅ ou ❌
4. Se ✅ verde = Funcionando!
5. Se ❌ vermelho = Clique para ver erro

---

### **🧪 Testar Webhook**

#### 1️⃣ **Fazer um commit e push**
```bash
git add .
git commit -m "test: trigger jenkins"
git push origin main
```

#### 2️⃣ **Ver no Jenkins**
- Acesse: http://localhost:8080/job/imobi-frontend-deploy/
- Você verá um novo build iniciando automaticamente!

#### 3️⃣ **Ver no GitHub**
- Settings → Webhooks → Seu webhook
- Aba **Recent Deliveries**
- Clique no último delivery para ver detalhes

---

### **🐛 Troubleshooting Webhook**

#### ❌ GitHub mostra erro "Connection refused"
**Causa:** Jenkins não está acessível externamente

**Solução:**
- Verifique se ngrok está rodando
- Confirme URL no webhook está correta
- Teste manualmente: `curl https://seu-ngrok.ngrok.io/github-webhook/`

#### ❌ Webhook entrega OK mas Jenkins não inicia build
**Causa:** Trigger não configurado no job

**Solução:**
1. Edite o job no Jenkins
2. Vá em **Build Triggers**
3. ☑️ Marque: "GitHub hook trigger for GITScm polling"
4. Salve

#### ❌ ngrok URL mudou
**Problema:** Toda vez que reinicia ngrok, a URL muda

**Solução Temporária:**
- Atualize URL no webhook do GitHub sempre que reiniciar

**Solução Permanente:**
- Crie conta paga no ngrok (URL fixa)
- Ou use servidor com IP público

---

### **💡 Dicas Extras**

#### **1. Ver logs do ngrok**
```powershell
# Acessar interface web do ngrok
http://localhost:4040
```
Aqui você vê todas as requisições HTTP que o ngrok recebeu!

#### **2. Manter ngrok rodando em background**
```powershell
Start-Process -NoNewWindow -FilePath "ngrok" -ArgumentList "http 8080"
```

#### **3. Webhook apenas para branch específica**
No Jenkinsfile, adicione:
```groovy
when {
    branch 'main'
}
```

#### **4. Notificar GitHub do status do build**
Instale plugin: "GitHub Integration Plugin"
- Jenkins notifica GitHub se build passou/falhou
- Aparece ✅/❌ no commit do GitHub

---

## 🚀 Próximos Passos Após Webhook Configurado

Agora cada `git push` dispara deploy automaticamente! 🎉

**Fluxo completo:**
```
git push → GitHub → Webhook → Jenkins → Build → Push ECR → Deploy ECS
```

**Tempo total:** 6-8 minutos do commit até produção!

### **Notificações Slack (Opcional)**
```groovy
// Adicione no Jenkinsfile após "post:"
post {
    success {
        slackSend color: 'good', message: "Deploy OK: ${env.BUILD_URL}"
    }
    failure {
        slackSend color: 'danger', message: "Deploy FALHOU: ${env.BUILD_URL}"
    }
}
```

---

## 📝 Comandos Úteis

### **Ver logs do Jenkins**
```powershell
docker logs Jenkis -f
```

### **Reiniciar Jenkins**
```powershell
docker restart Jenkis
```

### **Backup do Jenkins**
```powershell
docker cp Jenkis:/var/jenkins_home ./jenkins-backup
```

---

**✅ Pronto! Jenkins configurado e pronto para automatizar seus deploys!**
