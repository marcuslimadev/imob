# Setup Directus Collections na AWS via API REST
param(
    [string]$DirectusUrl = "http://15.228.201.25:8055",
    [string]$Email = "marcus@admin.com",
    [string]$Password = "Teste@123"
)

Write-Host "`n🚀 Configurando Directus na AWS..." -ForegroundColor Cyan

# 1. Autenticar
Write-Host "`n1️⃣  Autenticando..." -ForegroundColor Yellow
$authBody = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

$auth = Invoke-RestMethod -Uri "$DirectusUrl/auth/login" -Method POST -Body $authBody -ContentType "application/json"
$token = $auth.data.access_token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
Write-Host "✅ Autenticado com sucesso" -ForegroundColor Green

# 2. Criar collections principais
Write-Host "`n2️⃣  Criando collections..." -ForegroundColor Yellow

$collections = @(
    @{
        collection = "companies"
        meta = @{
            icon = "business"
            note = "Empresas (tenants) do sistema"
            display_template = "{{name}}"
            singleton = $false
            translations = @()
        }
        schema = @{
            name = "companies"
        }
    },
    @{
        collection = "properties"
        meta = @{
            icon = "home"
            note = "Imóveis cadastrados"
            display_template = "{{title}}"
            singleton = $false
        }
        schema = @{
            name = "properties"
        }
    },
    @{
        collection = "leads"
        meta = @{
            icon = "person"
            note = "Leads e clientes"
            display_template = "{{name}}"
            singleton = $false
        }
        schema = @{
            name = "leads"
        }
    },
    @{
        collection = "conversas"
        meta = @{
            icon = "chat"
            note = "Conversas do WhatsApp"
            display_template = "{{phone}}"
            singleton = $false
        }
        schema = @{
            name = "conversas"
        }
    },
    @{
        collection = "mensagens"
        meta = @{
            icon = "message"
            note = "Mensagens individuais"
            singleton = $false
        }
        schema = @{
            name = "mensagens"
        }
    },
    @{
        collection = "app_settings"
        meta = @{
            icon = "settings"
            note = "Configurações por empresa"
            singleton = $false
        }
        schema = @{
            name = "app_settings"
        }
    },
    @{
        collection = "property_media"
        meta = @{
            icon = "photo_library"
            note = "Fotos e vídeos dos imóveis"
            singleton = $false
        }
        schema = @{
            name = "property_media"
        }
    },
    @{
        collection = "contratos"
        meta = @{
            icon = "description"
            note = "Contratos de locação/venda"
            singleton = $false
        }
        schema = @{
            name = "contratos"
        }
    },
    @{
        collection = "subscription_plans"
        meta = @{
            icon = "credit_card"
            note = "Planos de assinatura SaaS"
            singleton = $false
        }
        schema = @{
            name = "subscription_plans"
        }
    },
    @{
        collection = "tenant_subscriptions"
        meta = @{
            icon = "receipt"
            note = "Assinaturas dos tenants"
            singleton = $false
        }
        schema = @{
            name = "tenant_subscriptions"
        }
    }
)

$created = 0
$errors = 0

foreach ($collection in $collections) {
    try {
        $body = $collection | ConvertTo-Json -Depth 10
        $result = Invoke-RestMethod -Uri "$DirectusUrl/collections" -Method POST -Headers $headers -Body $body
        Write-Host "  ✅ $($collection.collection)" -ForegroundColor Green
        $created++
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "  ⚠️  $($collection.collection) (já existe)" -ForegroundColor Yellow
        }
        else {
            Write-Host "  ❌ $($collection.collection): $($_.Exception.Message)" -ForegroundColor Red
            $errors++
        }
    }
}

Write-Host "`n📊 Resumo:" -ForegroundColor White
Write-Host "   Criadas: $created" -ForegroundColor Green
Write-Host "   Erros: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Gray" })

# 3. Verificar collections criadas
Write-Host "`n3️⃣  Verificando collections..." -ForegroundColor Yellow
$existingCollections = Invoke-RestMethod -Uri "$DirectusUrl/collections" -Method GET -Headers $headers
$userCollections = $existingCollections.data | Where-Object { $_.collection -notlike "directus_*" }

Write-Host "`nCollections disponíveis:" -ForegroundColor Cyan
foreach ($col in $userCollections) {
    Write-Host "  • $($col.collection)" -ForegroundColor Gray
}

Write-Host "`n✅ Setup concluído!" -ForegroundColor Green
Write-Host "`n⚠️  PRÓXIMO PASSO: Rodar register-fields.js localmente apontando para AWS" -ForegroundColor Yellow
Write-Host "    ou criar script similar para adicionar campos via API`n" -ForegroundColor Gray
