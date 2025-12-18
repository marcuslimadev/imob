# Setup Admin Company - PowerShell Script
$ErrorActionPreference = "Stop"

$DIRECTUS_URL = "http://localhost:8055"
$EMAIL = "admin@example.com"
$PASSWORD = "d1r3ctu5"
$USER_ID = "9523b558-454c-4e6b-aac5-f207ad36beef"

Write-Host "Configurando company para admin..." -ForegroundColor Cyan

# 1. Login
Write-Host "1. Fazendo login..." -ForegroundColor Yellow
$loginBody = @{
    email = $EMAIL
    password = $PASSWORD
} | ConvertTo-Json -Compress

$loginResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.access_token
Write-Host "Token obtido" -ForegroundColor Green

# 2. Criar company
Write-Host "2. Criando company..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

$companyBody = @{
    name = "Imobiliaria Local"
    domain = "localhost"
    subdomain = "localhost"
    status = "active"
    theme_key = "bauhaus"
} | ConvertTo-Json -Compress

$companyResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/items/companies" -Method Post -Body $companyBody -ContentType "application/json" -Headers $headers
$companyId = $companyResponse.data.id
Write-Host "Company criada: $companyId" -ForegroundColor Green

# 3. Atualizar usuario com company_id
Write-Host "3. Atualizando usuario com company_id..." -ForegroundColor Yellow
$userBody = @{
    company_id = $companyId
} | ConvertTo-Json -Compress

$userResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/users/$USER_ID" -Method Patch -Body $userBody -ContentType "application/json" -Headers $headers
Write-Host "Usuario atualizado" -ForegroundColor Green

# 4. Criar dados de teste
Write-Host "4. Criando dados de teste..." -ForegroundColor Yellow

for ($i = 1; $i -le 3; $i++)
    # Criar lead
    $leadBody = @{
        company_id = $companyId
        name = "Cliente Teste $i"
        phone = "+5511999$(([string]$i).PadLeft(6, '0'))"
        email = "cliente$i@teste.com"
        source = "whatsapp"
        status = "novo"
    } | ConvertTo-Json -Compress

    $leadResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/items/leads" -Method Post -Body $leadBody -ContentType "application/json" -Headers $headers
    $leadId = $leadResponse.data.id
    Write-Host "  ✓ Lead $i criado: $leadId" -ForegroundColor Gray

    # Criar conversa
    $conversaBody = @{
        company_id = $companyId
        lead_id = $leadId
        whatsapp_number = "+5511999$(([string]$i).PadLeft(6, '0'))"
        status = "ativo"
        last_message = "Olá, sou o Cliente $i. Gostaria de informações sobre imóveis."
        last_message_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    } | ConvertTo-Json -Compress

    $conversaResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/items/conversas" -Method Post -Body $conversaBody -ContentType "application/json" -Headers $headers
    $conversaId = $conversaResponse.data.id
    Write-Host "  ✓ Conversa $i criada: $conversaId" -ForegroundColor Gray

    # Criar mensagens
    $mensagens = @(
        @{ content = "Olá, sou o Cliente $i"; direction = "inbound" },
        @{ content = "Olá! Como posso ajudar?"; direction = "outbound" },
        @{ content = "Gostaria de ver apartamentos na região central"; direction = "inbound" },
        @{ content = "Claro! Temos várias opções. Qual o seu orçamento?"; direction = "outbound" }
    )

    foreach ($msg in $mensagens) {
        $msgBody = @{
            conversa_id = $conversaId
            content = $msg.content
            direction = $msg.direction
            status = "sent"
        } | ConvertTo-Json -Compress

        Invoke-RestMethod -Uri "$DIRECTUS_URL/items/mensagens" -Method Post -Body $msgBody -ContentType "application/json" -Headers $headers | Out-Null
    }
    Write-Host "  ✓ 4 mensagens criadas" -ForegroundColor Gray
}

Write-Host "Setup completo!" -ForegroundColor Green
Write-Host "Informacoes:" -ForegroundColor Cyan
Write-Host "  Company ID: $companyId"
Write-Host "  User ID: $USER_ID"
Write-Host "  Email: $EMAIL"
Write-Host "  Password: $PASSWORD"
Write-Host "Faca logout e login novamente no frontend."
