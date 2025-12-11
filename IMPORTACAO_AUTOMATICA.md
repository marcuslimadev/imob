# iMOBI - Importação Automática de Imóveis

## 📋 Resumo

Sistema de importação automática de imóveis da API externa (Exclusiva Lar) para o Directus.

### ✅ Implementado

1. **API Endpoint** - `/api/import-properties` (Next.js)
   - Busca lista de imóveis
   - Para cada imóvel, busca detalhes completos
   - Importa imagens (URLs externas)
   - Cria/atualiza registros no Directus

2. **Botão no Frontend** - Página `/empresa/imoveis`
   - Componente: `ImportPropertiesButton`
   - Dispara importação manualmente
   - Mostra progresso e resultado

3. **Cron Job Automático** - `directus/cron/`
   - `import-properties-job.js` - Script de importação standalone
   - `scheduler.js` - Scheduler que roda de 4 em 4 horas
   - Executa automaticamente sem intervenção

## 🚀 Como Usar

### 1. Importação Manual (Frontend)

Acesse a página de imóveis e clique no botão **"Importar da API"**:

```
http://localhost:4000/empresa/imoveis
```

O sistema irá:
- Buscar 20 imóveis da API externa
- Importar detalhes completos de cada um
- Salvar URLs das imagens
- Recarregar a página automaticamente ao concluir

### 2. Importação Manual (CLI)

Execute o script diretamente:

```powershell
cd d:\IMob\directus
node cron/import-properties-job.js
```

Resultado esperado:
```
[INFO] 🚀 Iniciando importação automática de imóveis...
[INFO] ✅ Login realizado com sucesso
[INFO] API Externa: https://www.exclusivalarimoveis.com.br/api/v1/app
[INFO] ✅ Encontrados 20 imóveis
[INFO] ✅ Importação concluída! {
  duration: '21.29s',
  imported: 19,
  updated: 0,
  imagesImported: 503,
  errors: 1
}
```

### 3. Importação Automática (Cron Scheduler)

#### Iniciar Scheduler

```powershell
# Windows
.\start-cron.ps1

# Ou diretamente
cd d:\IMob\directus
node cron/scheduler.js
```

#### Configurar no Sistema (Produção)

**Linux/Mac (crontab):**
```bash
# Editar crontab
crontab -e

# Adicionar linha (roda a cada 4 horas)
0 */4 * * * cd /path/to/IMob/directus && node cron/import-properties-job.js >> /var/log/imobi-import.log 2>&1
```

**Windows (Task Scheduler):**
1. Abrir "Agendador de Tarefas"
2. Criar nova tarefa básica
3. Nome: "iMOBI - Importação Automática"
4. Gatilho: Diariamente, repetir a cada 4 horas
5. Ação: Iniciar programa
   - Programa: `node`
   - Argumentos: `cron/import-properties-job.js`
   - Iniciar em: `d:\IMob\directus`

**Docker (docker-compose.yml):**
```yaml
services:
  cron-import:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./directus:/app
    command: node cron/scheduler.js
    environment:
      - DIRECTUS_URL=http://directus:8055
      - ADMIN_EMAIL=marcus@admin.com
      - ADMIN_PASSWORD=Teste@123
      - COMPANY_ID=a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
    restart: unless-stopped
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Directus
DIRECTUS_URL=http://localhost:8055
ADMIN_EMAIL=marcus@admin.com
ADMIN_PASSWORD=Teste@123

# Empresa (Multi-tenant)
COMPANY_ID=a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
```

### Token da API Externa

O token é armazenado no banco de dados por empresa:

```sql
SELECT external_api_token FROM app_settings 
WHERE company_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
```

Para atualizar:
```powershell
@'
UPDATE app_settings 
SET external_api_token = '$2y$10$Lcn1ct.wEfBonZldcjuVQ.pD5p8gBRNrPlHjVwruaG5HAui2XCG9O' 
WHERE company_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
'@ | docker exec -i directus-cms-template-database-1 psql -U directus -d directus
```

## 📊 Monitoramento

### Ver Logs em Tempo Real

```powershell
# Windows
Get-Content d:\IMob\logs\import.log -Wait -Tail 50

# Linux/Mac
tail -f /var/log/imobi-import.log
```

### Verificar Última Importação

```sql
-- Total de imóveis por empresa
SELECT COUNT(*) FROM properties WHERE company_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

-- Total de imagens
SELECT COUNT(*) FROM property_media pm
INNER JOIN properties p ON pm.property_id = p.id
WHERE p.company_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

-- Últimas atualizações
SELECT codigo, titulo, tipo, date_updated 
FROM properties 
WHERE company_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
ORDER BY date_updated DESC 
LIMIT 10;
```

## 🔍 Troubleshooting

### Erro: "Não autenticado"
- Verifique credenciais em `ADMIN_EMAIL` e `ADMIN_PASSWORD`
- Confirme que usuário tem permissões de admin

### Erro: "Configurações da API externa não encontradas"
- Execute: `SELECT * FROM app_settings WHERE company_id = 'SEU_COMPANY_ID';`
- Verifique campos `external_api_url` e `external_api_token`

### Erro: "API externa retornou erro: 401"
- Token inválido ou expirado
- Atualize token no banco de dados (ver seção "Token da API Externa")

### Importação demora muito
- Normal! São ~20 imóveis × 2 requisições cada + imagens
- Tempo médio: 20-30 segundos
- Para acelerar: ajustar `concurrency` no código (cuidado com rate limit)

## 📈 Estatísticas

**Última execução bem-sucedida:**
- ✅ 19 imóveis importados
- ✅ 503 imagens
- ⚠️ 1 erro (não crítico)
- ⏱️ 21 segundos

**Totais no banco:**
- 39 imóveis cadastrados
- 503 imagens vinculadas
- Tipos: Apartamento, Casa, Casa em Condomínio, Casa Geminada, Cobertura

## 🎯 Próximos Passos

- [ ] Adicionar retry automático em caso de falha
- [ ] Implementar logs estruturados (Winston/Pino)
- [ ] Dashboard de monitoramento (status, última execução, erros)
- [ ] Download e upload de imagens no Directus Files (storage local)
- [ ] Importar características (`details.caracteristicas`)
- [ ] Notificações via email/Slack em caso de erro
- [ ] Health check endpoint para monitoramento externo
