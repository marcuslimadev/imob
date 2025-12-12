# Como Configurar GitHub Actions para Deploy Automático

## 📋 Pré-requisitos

Você precisa configurar **3 secrets** no GitHub para o workflow funcionar:

1. `EC2_SSH_KEY` - Chave SSH privada (arquivo .pem)
2. `EC2_HOST` - IP público da EC2
3. `EC2_USER` - Usuário SSH (geralmente "ubuntu")

---

## 🔧 Passo a Passo

### 1. Acessar Configurações de Secrets

1. Vá para: https://github.com/marcuslimadev/imob/settings/secrets/actions
2. Clique em **"New repository secret"**

### 2. Adicionar EC2_SSH_KEY

**Nome do secret:** `EC2_SSH_KEY`

**Valor:** Conteúdo COMPLETO do arquivo `d:\IMob\exclusiva-prod-key.pem`

**Como copiar:**
```powershell
# No PowerShell, execute:
Get-Content d:\IMob\exclusiva-prod-key.pem | clip
```

Depois cole no GitHub (Ctrl+V). O conteúdo deve começar com:
```
-----BEGIN RSA PRIVATE KEY-----
```

E terminar com:
```
-----END RSA PRIVATE KEY-----
```

### 3. Adicionar EC2_HOST

**Nome do secret:** `EC2_HOST`

**Valor:** `18.206.14.123` (ou o IP atual da sua EC2)

**Como obter o IP atual:**
```powershell
# Acessar AWS Console → EC2 → Instances
# Copiar "Public IPv4 address"
```

### 4. Adicionar EC2_USER

**Nome do secret:** `EC2_USER`

**Valor:** `ubuntu`

(Este é o usuário padrão para instâncias Ubuntu na AWS)

---

## ✅ Verificar Configuração

Após adicionar os 3 secrets:

1. Faça qualquer commit e push:
   ```powershell
   cd d:\IMob
   git commit --allow-empty -m "test: Testar deploy automático"
   git push origin master
   ```

2. Acompanhe em: https://github.com/marcuslimadev/imob/actions

3. O workflow deve:
   - ✅ Conectar na EC2 via SSH
   - ✅ Fazer git pull
   - ✅ Rebuild do Docker
   - ✅ Rebuild do Next.js
   - ✅ Restart do PM2

---

## 🚀 Deploy Manual (Alternativa)

Se preferir fazer deploy manual sem configurar os secrets, use:

```powershell
cd d:\IMob
.\scripts\deploy-manual-aws.ps1
```

Este script faz o mesmo deploy via SSH diretamente do seu computador.

---

## 🔍 Troubleshooting

### ❌ "Permission denied (publickey)"
- Verifique se o secret `EC2_SSH_KEY` contém o conteúdo COMPLETO do .pem
- Verifique se copiou incluindo as linhas `-----BEGIN/END-----`

### ❌ "Connection timed out"
- Verifique se o IP em `EC2_HOST` está correto
- Verifique Security Group da EC2 permite SSH (porta 22) do IP do GitHub Actions

### ❌ "git pull failed"
- Verifique se o repositório está clonado em `~/exclusiva-prod/imob` na EC2
- SSH na EC2 e execute: `cd ~/exclusiva-prod/imob && git status`

---

## 📊 Status Atual

**Commits no GitHub:** ✅ 2 commits enviados
- `dd2672a` - feat: Implementa importação automática de imóveis via Docker
- `8828272` - fix: Corrige branch do git pull no workflow

**GitHub Actions:** ⚠️ Falhando por falta de secrets

**Próximo passo:** Configurar os 3 secrets acima OU usar deploy manual.
