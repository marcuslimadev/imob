$DIRECTUS_URL = "http://localhost:8055"
$ADMIN_TOKEN = "admin-static-token-imobi-2025"
$USER_ID = "9523b558-454c-4e6b-aac5-f207ad36beef"

Write-Host "Configurando admin com acesso total e criando Imobiliaria Exclusiva..." -ForegroundColor Cyan

$headers = @{ "Authorization" = "Bearer $ADMIN_TOKEN" }

# 1. Remover company_id do admin para dar acesso total
Write-Host "`n1. Removendo company_id do admin (acesso total)..." -ForegroundColor Yellow
$userBody = '{"company_id":null}'
Invoke-RestMethod -Uri "$DIRECTUS_URL/users/$USER_ID" -Method Patch -Body $userBody -ContentType "application/json" -Headers $headers | Out-Null
Write-Host "Admin configurado com acesso total" -ForegroundColor Green

# 2. Criar Imobiliaria Exclusiva
Write-Host "`n2. Criando Imobiliaria Exclusiva..." -ForegroundColor Yellow
$companyBody = @{
    name = "Imobiliaria Exclusiva"
    domain = "exclusiva.local"
    subdomain = "exclusiva"
    status = "active"
    theme_key = "bauhaus"
} | ConvertTo-Json -Compress

$companyResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/items/companies" -Method Post -Body $companyBody -ContentType "application/json" -Headers $headers
$companyId = $companyResponse.data.id
Write-Host "Imobiliaria Exclusiva criada: $companyId" -ForegroundColor Green

# 3. Criar 10 leads com conversas
Write-Host "`n3. Criando 10 leads com conversas e mensagens..." -ForegroundColor Yellow

$nomes = @(
    "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Ferreira",
    "Juliana Lima", "Roberto Alves", "Fernanda Souza", "Lucas Martins", "Camila Rocha"
)

$mensagensTipo = @(
    @("Olá, tenho interesse em apartamentos", "Olá! Temos ótimas opções. Qual região prefere?", "Prefiro zona sul", "Temos 5 opções na zona sul. Quer agendar visita?"),
    @("Bom dia, vocês trabalham com casas?", "Bom dia! Sim, temos casas e apartamentos. O que procura?", "Casa com 3 quartos e garagem", "Perfeito! Tenho 3 opções. Posso enviar fotos?"),
    @("Qual o valor médio dos imóveis?", "Depende da região e tipo. De quanto a quanto você pode investir?", "Entre 300 e 500 mil", "Tenho várias opções nessa faixa!"),
    @("Vocês fazem financiamento?", "Trabalhamos com os principais bancos. Você já tem pré-aprovação?", "Ainda não", "Posso indicar um corretor parceiro para te ajudar"),
    @("Quero um apto próximo ao metrô", "Excelente! Qual linha de metrô?", "Linha vermelha ou azul", "Tenho 4 opções perfeitas para você"),
    @("Tenho um imóvel para vender", "Ótimo! Onde fica e quantos metros?", "Na Vila Mariana, 80m2", "Vou agendar uma avaliação. Amanhã às 14h ok?"),
    @("Procuro investimento para alugar", "Entendo! Qual bairro te interessa?", "Centro ou próximo", "Tenho studios com boa rentabilidade"),
    @("É possível visitar hoje?", "Claro! Qual período prefere?", "Tarde, após 15h", "Combinado! Te envio o endereço"),
    @("Aceita permuta?", "Dependendo do imóvel, sim. Qual você tem?", "Apto de 60m2 no Tatuapé", "Interessante! Vou verificar as opções"),
    @("Qual a documentação necessária?", "Para compra ou locação?", "Compra", "Envio a lista completa por email agora")
)

for ($i = 0; $i -lt 10; $i++) {
    $leadBody = @{
        company_id = $companyId
        name = $nomes[$i]
        phone = "+5511$(Get-Random -Minimum 90000 -Maximum 99999)$(Get-Random -Minimum 1000 -Maximum 9999)"
        email = ($nomes[$i] -replace ' ', '.').ToLower() + "@email.com"
        source = "whatsapp"
        status = @("novo", "em_atendimento", "qualificado")[(Get-Random -Minimum 0 -Maximum 3)]
    } | ConvertTo-Json -Compress

    $leadResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/items/leads" -Method Post -Body $leadBody -ContentType "application/json" -Headers $headers
    $leadId = $leadResponse.data.id
    
    # Criar conversa
    $conversaBody = @{
        company_id = $companyId
        lead_id = $leadId
        whatsapp_number = "+5511$(Get-Random -Minimum 90000 -Maximum 99999)$(Get-Random -Minimum 1000 -Maximum 9999)"
        status = "ativo"
        last_message = $mensagensTipo[$i][0]
        last_message_at = (Get-Date).AddHours(-$i).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    } | ConvertTo-Json -Compress

    $conversaResponse = Invoke-RestMethod -Uri "$DIRECTUS_URL/items/conversas" -Method Post -Body $conversaBody -ContentType "application/json" -Headers $headers
    $conversaId = $conversaResponse.data.id
    
    # Criar mensagens
    foreach ($msgIndex in 0..($mensagensTipo[$i].Length - 1)) {
        $msgBody = @{
            conversa_id = $conversaId
            content = $mensagensTipo[$i][$msgIndex]
            direction = if ($msgIndex % 2 -eq 0) { "inbound" } else { "outbound" }
            status = "sent"
            date_created = (Get-Date).AddHours(-$i).AddMinutes($msgIndex * 5).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        } | ConvertTo-Json -Compress

        Invoke-RestMethod -Uri "$DIRECTUS_URL/items/mensagens" -Method Post -Body $msgBody -ContentType "application/json" -Headers $headers | Out-Null
    }
    
    Write-Host "  Lead $($i+1)/10: $($nomes[$i]) - Conversa e mensagens criadas" -ForegroundColor Gray
}

# 4. Criar 15 propriedades
Write-Host "`n4. Criando 15 propriedades..." -ForegroundColor Yellow

$tiposImovel = @("apartamento", "casa", "sobrado", "cobertura", "studio")
$bairros = @("Vila Mariana", "Pinheiros", "Moema", "Itaim Bibi", "Perdizes", "Tatuapé", "Santana", "Brooklin", "Campo Belo", "Vila Madalena")
$statusImovel = @("disponivel", "reservado", "vendido")

for ($i = 1; $i -le 15; $i++) {
    $tipo = $tiposImovel[(Get-Random -Minimum 0 -Maximum $tiposImovel.Length)]
    $quartos = Get-Random -Minimum 1 -Maximum 5
    $metragem = Get-Random -Minimum 45 -Maximum 250
    $valor = (Get-Random -Minimum 300000 -Maximum 1500000)
    
    $propertyBody = @{
        company_id = $companyId
        title = "$tipo $quartos quartos - $($bairros[(Get-Random -Minimum 0 -Maximum $bairros.Length)])"
        description = "Lindo $tipo com $quartos quartos, $metragem m², em excelente localização. Próximo a comércio, transporte e escolas."
        type = $tipo
        status = $statusImovel[(Get-Random -Minimum 0 -Maximum 2)]
        price = $valor
        bedrooms = $quartos
        bathrooms = [Math]::Min($quartos, Get-Random -Minimum 1 -Maximum 4)
        area = $metragem
        address = "Rua Exemplo, $i - $($bairros[(Get-Random -Minimum 0 -Maximum $bairros.Length)])"
        city = "São Paulo"
        state = "SP"
        zipcode = "$(Get-Random -Minimum 10000 -Maximum 99999)-000"
    } | ConvertTo-Json -Compress

    Invoke-RestMethod -Uri "$DIRECTUS_URL/items/properties" -Method Post -Body $propertyBody -ContentType "application/json" -Headers $headers | Out-Null
    Write-Host "  Propriedade $i/15 criada: $tipo $quartos quartos" -ForegroundColor Gray
}

Write-Host "`n✅ Setup completo!" -ForegroundColor Green
Write-Host "`nResumo:" -ForegroundColor Cyan
Write-Host "  - Admin: Acesso a TODAS as empresas" -ForegroundColor White
Write-Host "  - Imobiliaria Exclusiva criada (ID: $companyId)" -ForegroundColor White
Write-Host "  - 10 leads com conversas e mensagens" -ForegroundColor White
Write-Host "  - 15 propriedades cadastradas" -ForegroundColor White
Write-Host "`nFaca logout e login novamente no frontend"
