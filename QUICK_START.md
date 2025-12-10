# ⚡ Quick Start - iMOBI

## 🚀 Iniciar Sistema (3 comandos)

```powershell
cd d:\IMob
docker compose up -d
Start-Sleep -Seconds 30
```

**Aguardar 30 segundos** e acessar:
- 🔧 **Directus:** http://localhost:8055/admin (marcus@admin.com / Teste@123)
- 🌐 **Next.js:** http://localhost:4000

---

## 🆘 Se algo der errado:

### Directus travou ("Under pressure")
```powershell
docker compose restart directus
Start-Sleep -Seconds 20
```

### Next.js não carrega
```powershell
docker compose restart nextjs
Start-Sleep -Seconds 30
```

### Ver o que está acontecendo
```powershell
docker compose logs -f directus
# ou
docker compose logs -f nextjs
```

### Resetar tudo
```powershell
docker compose down
docker compose up -d
```

---

## 📊 Ver Status
```powershell
docker compose ps
```

Espere todos ficarem **(healthy)**

---

**Documentação completa:** `DOCKER_SETUP.md`
