# 📤 SCRIPT DE UPLOAD DE LOGO (SEM REBUILD!)

## Passo 1: Upload Manual via Interface Web (MAIS FÁCIL)

**Acesse:** https://lojadaesquina.store/admin

1. Login: admin@imobi.com
2. Content > Files & Assets > Upload File
3. Selecione `d:\Saas\imob\logo.png`
4. Copie o **File ID** (ex: `abc-123-def`)

## Passo 2: Configurar no Sistema

### Opção A: Via Interface (Recomendado)
```
Settings > Global Settings > Logo
Selecione o arquivo que você acabou de fazer upload
Save
```

### Opção B: Via API
```powershell
# Substitua FILE_ID pelo ID copiado
$fileId = "COLE_O_ID_AQUI"

curl.exe -X PATCH "https://lojadaesquina.store/items/globals/1" `
  -H "Authorization: Bearer admin-static-token-imobi-2025" `
  -H "Content-Type: application/json" `
  -d "{\"logo\": \"$fileId\"}"
```

## ✅ Pronto!

Acesse https://lojadaesquina.store/home

**Logo atualizado instantaneamente - ZERO rebuild necessário!**

---

## 🔧 ALTERNATIVA: Logo via Ambiente (Para testes rápidos)

Se quiser apenas testar localmente sem deploy:

```powershell
cd d:\Saas\imob\nextjs

# Copie logo para pasta public
Copy-Item "d:\Saas\imob\logo.png" "public/images/logo-custom.png"

# Rode local
pnpm dev

# Acesse http://localhost:3000
```

Depois edite o componente para usar o novo logo temporário.

---

## ❓ Por que não usar build Docker?

**Problema:**
- Docker build = 2-3 minutos
- Toda mudança visual = rebuild completo
- Deploy lento = frustração

**Solução (assets dinâmicos):**
- Upload via Directus = 10 segundos
- Mudança instantânea = 0 rebuild
- CDN-ready = performance

---

## 📋 CHECKLIST FINAL

- [ ] Logo está em `d:\Saas\imob\logo.png` ✅
- [ ] Acesse https://lojadaesquina.store/admin
- [ ] Upload via Files & Assets
- [ ] Configure em Settings > Global > Logo
- [ ] Teste: https://lojadaesquina.store/home
- [ ] ✅ Logo atualizado sem rebuild!
