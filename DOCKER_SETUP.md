# 🐳 iMOBI - Setup Docker Completo

## 🚀 Início Rápido (3 comandos)

```powershell
# 1. Iniciar tudo
.\start-docker.ps1

# 2. Aguardar ~30 segundos

# 3. Acessar
# http://localhost:8055/admin (Directus)
# http://localhost:4000 (Next.js)
```

## 📦 O que está incluído?

Este `docker-compose.yml` sobe **5 serviços**:

1. **database** - PostgreSQL 16 + PostGIS
2. **cache** - Redis 6
3. **directus** - Directus 11.12.0 (Backend/CMS)
4. **setup** - Container temporário que cria collections e popula dados
5. **nextjs** - Next.js 15 (Frontend)

## 🔧 Serviços Detalhados

### Database (PostgreSQL + PostGIS)
- **Porta:** 5432 (interna)
- **Usuário:** directus
- **Senha:** directus
- **Database:** directus
- **Volume:** `./directus/data/database`

### Cache (Redis)
- **Porta:** 6379 (interna)
- **Uso:** Cache de queries do Directus

### Directus (Backend)
- **Porta:** 8055
- **Admin:** marcus@admin.com / Teste@123
- **API:** http://localhost:8055
- **Admin UI:** http://localhost:8055/admin
- **Extensions:** `./directus/extensions`
- **Uploads:** `./directus/uploads`

### Setup (Inicialização)
- **Executa uma vez** ao subir o stack
- **Ações:**
  1. Aguarda Directus ficar pronto
  2. Instala dependências (axios, @directus/sdk)
  3. Cria 16 collections via `register-collections.js`
  4. Registra campos via `register-fields.js`
  5. Popula dados via `seed-data.js`
- **Logs:** `docker compose logs setup`

### Next.js (Frontend)
- **Porta:** 4000
- **Modo:** Development (hot reload)
- **URL:** http://localhost:4000
- **Volume:** `./nextjs` (código sincronizado em tempo real)
- **Node modules:** Persistidos em volume anônimo

## 📝 Scripts PowerShell

### `start-docker.ps1`
Inicia todo o stack com verificação de saúde e mensagens amigáveis.

```powershell
.\start-docker.ps1
```

**O que faz:**
- Para containers antigos
- Builda imagens
- Sobe todos os serviços
- Aguarda Directus ficar pronto
- Verifica se setup concluiu
- Mostra URLs de acesso
- Oferece abrir navegador

### `stop-docker.ps1`
Para todos os serviços.

```powershell
.\stop-docker.ps1
```

### `logs-docker.ps1`
Exibe logs em tempo real.

```powershell
# Todos os serviços
.\logs-docker.ps1

# Apenas um serviço
.\logs-docker.ps1 -Service directus
.\logs-docker.ps1 -Service nextjs
.\logs-docker.ps1 -Service setup
```

## 🧪 Verificação Pós-Instalação

### 1. Verificar Containers Rodando
```powershell
docker compose ps
```

**Esperado:**
```
NAME              STATUS         PORTS
imobi-database    Up (healthy)   -
imobi-redis       Up (healthy)   -
imobi-directus    Up (healthy)   0.0.0.0:8055->8055/tcp
imobi-nextjs      Up (healthy)   0.0.0.0:4000->4000/tcp
imobi-setup       Exited (0)     -
```

### 2. Verificar Collections Criadas
```powershell
docker compose logs setup | Select-String "Setup concluído"
```

Se aparecer "✅ Setup concluído!", está tudo certo.

### 3. Testar Directus API
```powershell
Invoke-RestMethod -Uri "http://localhost:8055/server/health"
```

**Resposta esperada:** `{ "status": "ok" }`

### 4. Testar Login
```powershell
$body = @{
    email = "marcus@admin.com"
    password = "Teste@123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8055/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Resposta esperada:** JSON com `access_token`

### 5. Acessar Next.js
Abrir navegador: http://localhost:4000

## 🔄 Comandos Úteis

### Reiniciar um serviço específico
```powershell
docker compose restart directus
docker compose restart nextjs
```

### Ver logs de um serviço
```powershell
docker compose logs -f directus
docker compose logs -f nextjs --tail 50
```

### Executar comando dentro de um container
```powershell
# PostgreSQL
docker compose exec database psql -U directus -d directus

# Directus (shell)
docker compose exec directus sh

# Next.js (shell)
docker compose exec nextjs sh
```

### Rebuild completo
```powershell
docker compose down
docker compose up -d --build --force-recreate
```

### Reset completo (apaga dados!)
```powershell
docker compose down -v
.\start-docker.ps1
```

## 🐛 Troubleshooting

### Setup falhou / Collections não criadas

**Ver logs detalhados:**
```powershell
docker compose logs setup
```

**Executar setup manualmente:**
```powershell
docker compose run --rm setup sh -c "
    npm install axios dotenv @directus/sdk &&
    node register-collections.js &&
    node register-fields.js &&
    node seed-data.js
"
```

### Next.js não inicia

**Ver erro:**
```powershell
docker compose logs nextjs
```

**Rebuild:**
```powershell
docker compose up -d --build nextjs
```

### Porta já em uso

Se 8055 ou 4000 já estão em uso:

**Opção 1 - Parar processo:**
```powershell
# Verificar quem usa a porta
Get-NetTCPConnection -LocalPort 8055 | Select-Object OwningProcess
Get-Process -Id [PID] | Stop-Process
```

**Opção 2 - Mudar porta no docker-compose.yml:**
```yaml
directus:
  ports:
    - "8056:8055"  # Usar 8056 externamente
```

### Permissões no Windows

Se encontrar erro de permissão em volumes:

```powershell
# Rodar PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📊 Monitoramento

### Dashboard de containers
```powershell
docker stats
```

### Uso de disco
```powershell
docker system df
```

### Limpar recursos não usados
```powershell
docker system prune -a --volumes
```

## 🎯 Próximos Passos

Após tudo rodando:

1. **Acessar Admin:** http://localhost:8055/admin
2. **Verificar Permissões:** Settings → Roles & Permissions
3. **Testar Vitrines:** http://localhost:4000/vitrine?company=exclusiva
4. **Explorar Collections:** Data Studio no Directus
5. **Ler guia de testes:** `GUIA_TESTES.md`

## 🔐 Credenciais Padrão

**Directus Admin:**
- Email: marcus@admin.com
- Senha: Teste@123

**PostgreSQL:**
- Usuário: directus
- Senha: directus
- Database: directus

**⚠️ IMPORTANTE:** Trocar senhas em produção!

## 📚 Documentação Relacionada

- `GUIA_TESTES.md` - Bateria completa de testes
- `COMO_USAR.md` - Setup manual (sem Docker)
- `DEPLOY_PRODUCAO_AWS.md` - Deploy em produção
- `PLANO_CENTRAL.md` - Status do projeto

---

**Pronto! Agora é só executar `.\start-docker.ps1` e começar a desenvolver! 🚀**
