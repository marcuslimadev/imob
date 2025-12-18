$DIRECTUS_URL = "http://localhost:8055"
$ADMIN_TOKEN = "admin-static-token-imobi-2025"
$USER_ID = "9523b558-454c-4e6b-aac5-f207ad36beef"

Write-Host "Setup com token estático..." -ForegroundColor Cyan

$headers = @{ "Authorization" = "Bearer $ADMIN_TOKEN" }

# Criar company
Write-Host "Criando company..." -ForegroundColor Yellow
$companyBody = '{"name":"Imobiliaria Local","domain":"localhost","subdomain":"localhost","status":"active","theme_key":"bauhaus"}'
try {
    $companyResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/items/companies" -Method Post -Body $companyBody -ContentType "application/json" -Headers $headers
    $companyId = $companyResponse.data.id
    Write-Host "Company criada: $companyId" -ForegroundColor Green
} catch {
    Write-Host "Erro ao criar company, tentando buscar existente..." -ForegroundColor Yellow
    $companiesResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/items/companies" -Method Get -Headers $headers
    if ($companiesResponse.data -and $companiesResponse.data.Count -gt 0) {
        $companyId = $companiesResponse.data[0].id
        Write-Host "Company existente encontrada: $companyId" -ForegroundColor Green
    } else {
        Write-Host "ERRO: Não foi possível criar ou encontrar company" -ForegroundColor Red
        exit 1
    }
}

# Atualizar usuario
Write-Host "Atualizando usuario..." -ForegroundColor Yellow
$userBody = "{`"company_id`":`"$companyId`"}"
try {
    Invoke-RestMethod -Uri "$DIRECTUS_URL/users/$USER_ID" -Method Patch -Body $userBody -ContentType "application/json" -Headers $headers | Out-Null
    Write-Host "Usuario atualizado com company_id: $companyId" -ForegroundColor Green
} catch {
    Write-Host "ERRO ao atualizar usuario: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nSetup completo!" -ForegroundColor Green
Write-Host "Faca logout e login novamente no frontend"
