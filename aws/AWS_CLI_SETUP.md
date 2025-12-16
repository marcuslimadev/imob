# Como obter e configurar credenciais AWS

## Passo 1: Obter credenciais no Console AWS

1. Acesse: https://console.aws.amazon.com/iam
2. No menu lateral: **Users** → selecione seu usuário
3. Aba **Security credentials**
4. Clique em **Create access key**
5. Escolha **Command Line Interface (CLI)**
6. Copie:
   - Access Key ID
   - Secret Access Key

## Passo 2: Configurar AWS CLI

Execute no PowerShell:

```powershell
aws configure
```

Digite quando solicitado:
- AWS Access Key ID: [cole aqui]
- AWS Secret Access Key: [cole aqui]
- Default region name: sa-east-1
- Default output format: json

## Passo 3: Testar

```powershell
aws sts get-caller-identity
```

Se aparecer seu Account ID, está configurado corretamente!

## Depois execute o deploy:

```powershell
cd d:\Saas\imob\aws
.\manual-deploy-frontend.ps1
```
