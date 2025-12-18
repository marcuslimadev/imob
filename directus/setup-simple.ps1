$ErrorActionPreference = "Stop"

$DIRECTUS_URL = "http://localhost:8055"
$EMAIL = "admin@example.com"
$PASSWORD = "d1r3ctu5"
$USER_ID = "9523b558-454c-4e6b-aac5-f207ad36beef"

Write-Host "Setup admin company..." -ForegroundColor Cyan

# Login
$loginBody = '{"email":"'+$EMAIL+'","password":"'+$PASSWORD+'"}'
$loginResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.access_token
Write-Host "Token obtido" -ForegroundColor Green

$headers = @{ "Authorization" = "Bearer $token" }

# Criar company
$companyBody = '{"name":"Imobiliaria Local","domain":"localhost","subdomain":"localhost","status":"active","theme_key":"bauhaus"}'
$companyResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/items/companies" -Method Post -Body $companyBody -ContentType "application/json" -Headers $headers
$companyId = $companyResponse.data.id
Write-Host "Company criada: $companyId" -ForegroundColor Green

# Atualizar usuario
$userBody = '{"company_id":"'+$companyId+'"}'
Invoke-RestMethod -Uri "$DIRECTUS_URL/users/$USER_ID" -Method Patch -Body $userBody -ContentType "application/json" -Headers $headers | Out-Null
Write-Host "Usuario atualizado com company_id" -ForegroundColor Green

Write-Host "Setup completo!" -ForegroundColor Green
Write-Host "Faca logout e login novamente no frontend"
