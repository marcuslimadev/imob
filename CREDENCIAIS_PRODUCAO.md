# 🔐 Credenciais de Acesso - iMOBI Produção

## ✅ **CREDENCIAIS VÁLIDAS**

```
URL:      https://lojadaesquina.store/login
Email:    admin@imobi.com.br
Senha:    Teste@123
```

## 🎯 **Como Acessar:**

1. **Abra o navegador** e acesse: https://lojadaesquina.store/
   - Você será redirecionado automaticamente para `/home`

2. **Clique em "Login"** ou acesse diretamente: https://lojadaesquina.store/login

3. **Digite as credenciais:**
   - Email: `admin@imobi.com.br`
   - Senha: `Teste@123`

4. **Após login**, você será redirecionado para: `/empresa/dashboard`

---

## 🧪 **Teste Rápido (curl):**

```powershell
# Testar login via API
curl.exe -X POST https://lojadaesquina.store/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@imobi.com.br\",\"password\":\"Teste@123\"}'

# Deve retornar: {"success":true,"user":{"email":"admin@imobi.com.br"}}
```

---

## 📊 **Status do Sistema:**

| Componente | Status | URL |
|------------|--------|-----|
| Frontend | ✅ Online | https://lojadaesquina.store/ |
| Backend (Directus) | ✅ Online | http://production-imobi-alb-1837293727.sa-east-1.elb.amazonaws.com |
| Login API | ✅ Funcionando | https://lojadaesquina.store/api/auth/login |
| Root Redirect | ✅ 307 → /home | https://lojadaesquina.store/ |

---

## 🔧 **Credenciais para Desenvolvimento Local:**

Se estiver rodando localmente (http://localhost:3000):

```
Email:    admin@example.com
Senha:    d1r3ctu5
```

**Nota:** Estas credenciais só funcionam no ambiente local com Directus rodando em localhost:8055

---

## 🚨 **Problemas Comuns:**

### ❌ "Credenciais inválidas"
- **Causa:** Você está usando credenciais antigas
- **Solução:** Use `admin@imobi.com.br` / `Teste@123`

### ❌ "error=auth_failed" na URL
- **Causa:** O sistema tentou autenticar automaticamente e falhou
- **Solução:** Faça login manualmente com as credenciais corretas

### ❌ Volta para tela de login após tentar acessar
- **Causa:** Cookie de autenticação expirou ou inválido
- **Solução:** Limpe os cookies do navegador e faça login novamente

---

## 📝 **Logs de Deploy:**

Último deploy bem-sucedido: **17/12/2025 16:08**

**Mudanças:**
- ✅ Corrigido erro 500 na raiz (/) - agora redireciona para /home
- ✅ Atualizado credenciais padrão na página de login
- ✅ Backend autenticando corretamente
- ✅ Cookies sendo definidos corretamente

---

## 🎉 **Sistema 100% Funcional!**

Tudo testado e validado. Você pode começar a usar o sistema agora! 🚀
