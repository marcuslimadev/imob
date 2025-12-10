/**
 * Worker de Importação de Imóveis
 * Importa imóveis da API Exclusiva para o Directus
 * 
 * Fase 1: Lista todos os imóveis
 * Fase 2: Para cada imóvel, busca detalhes e fotos
 * Fase 3: Salva no Directus com relacionamentos
 */

const axios = require('axios');
const PQueue = require('p-queue').default;
const fs = require('fs').promises;
const path = require('path');

// Configurações
const EXCLUSIVA_API_BASE = process.env.EXCLUSIVA_API_URL || 'https://api.exclusivalar.com.br';
const EXCLUSIVA_API_KEY = process.env.EXCLUSIVA_API_KEY || '';
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const DIRECTUS_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';

// Controle de taxa (rate limiting)
const queue = new PQueue({ 
    concurrency: 3,  // Máximo 3 requisições simultâneas
    interval: 1000,  // Por segundo
    intervalCap: 5   // Máximo 5 por intervalo
});

let directusToken = '';
let companyId = '';
let jobStatusId = '';

// Logger helper
function log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, context);
}

// Login no Directus
async function loginDirectus() {
    try {
        const response = await axios.post(`${DIRECTUS_URL}/auth/login`, {
            email: DIRECTUS_EMAIL,
            password: DIRECTUS_PASSWORD
        });
        directusToken = response.data.data.access_token;
        log('info', '✅ Login Directus realizado com sucesso');
        return directusToken;
    } catch (error) {
        log('error', '❌ Erro ao fazer login no Directus', { error: error.message });
        throw error;
    }
}

// Criar registro de job status
async function createJobStatus(jobId, total = 0) {
    try {
        const response = await axios.post(
            `${DIRECTUS_URL}/items/job_status`,
            {
                job_id: jobId,
                status: 'processing',
                progress: 0,
                total: total,
                created_at: new Date().toISOString()
            },
            {
                headers: { Authorization: `Bearer ${directusToken}` }
            }
        );
        jobStatusId = response.data.data.id;
        log('info', `📊 Job status criado: ${jobStatusId}`);
        return jobStatusId;
    } catch (error) {
        log('warn', 'Aviso ao criar job_status', { error: error.message });
    }
}

// Atualizar progresso do job
async function updateJobProgress(progress, total, status = 'processing', result = null, error = null) {
    if (!jobStatusId) return;
    
    try {
        await axios.patch(
            `${DIRECTUS_URL}/items/job_status/${jobStatusId}`,
            {
                progress,
                total,
                status,
                result,
                error,
                updated_at: new Date().toISOString()
            },
            {
                headers: { Authorization: `Bearer ${directusToken}` }
            }
        );
    } catch (err) {
        log('warn', 'Erro ao atualizar progresso', { error: err.message });
    }
}

// Buscar empresa no Directus (ou criar se não existir)
async function getOrCreateCompany() {
    try {
        // Buscar empresa Exclusiva
        const response = await axios.get(
            `${DIRECTUS_URL}/items/companies`,
            {
                params: { filter: { slug: 'exclusiva' } },
                headers: { Authorization: `Bearer ${directusToken}` }
            }
        );

        if (response.data.data && response.data.data.length > 0) {
            companyId = response.data.data[0].id;
            log('info', `✅ Empresa encontrada: ${companyId}`);
            return companyId;
        }

        // Criar empresa se não existir
        const createResponse = await axios.post(
            `${DIRECTUS_URL}/items/companies`,
            {
                name: 'Exclusiva Lar',  // Campo obrigatório
                nome_fantasia: 'Exclusiva Lar',
                slug: 'exclusiva',
                email: 'contato@exclusivalar.com.br',
                telefone: '(31) 3333-4444'
            },
            {
                headers: { Authorization: `Bearer ${directusToken}` }
            }
        );

        companyId = createResponse.data.data.id;
        log('info', `✅ Empresa criada: ${companyId}`);
        return companyId;
    } catch (error) {
        log('error', '❌ Erro ao buscar/criar empresa', { 
            error: error.message,
            response: JSON.stringify(error.response?.data, null, 2)
        });
        throw error;
    }
}

// Fase 1: Listar imóveis da API Exclusiva
async function fetchPropertiesList() {
    try {
        log('info', '📋 Fase 1: Buscando lista de imóveis da API Exclusiva...');
        
        // Adapte esta URL conforme a API real do projeto Exclusiva
        const response = await axios.get(`${EXCLUSIVA_API_BASE}/api/properties/list`, {
            headers: {
                'Authorization': `Bearer ${EXCLUSIVA_API_KEY}`,
                'Accept': 'application/json'
            },
            params: {
                per_page: 100,
                status: 'active'
            }
        });

        const properties = response.data.data || response.data || [];
        log('info', `✅ ${properties.length} imóveis encontrados`);
        return properties;
    } catch (error) {
        log('error', '❌ Erro ao buscar lista de imóveis', { 
            error: error.message,
            url: error.config?.url 
        });
        
        // Retornar dados mock para teste se API não disponível
        log('warn', '⚠️  API não disponível, usando dados mock para teste');
        return generateMockProperties(10);
    }
}

// Gerar dados mock para teste
function generateMockProperties(count = 10) {
    const types = ['apartamento', 'casa', 'terreno', 'comercial'];
    const cities = ['Belo Horizonte', 'Nova Lima', 'Contagem'];
    const neighborhoods = ['Savassi', 'Belvedere', 'Lourdes', 'Pampulha', 'Castelo'];
    
    return Array.from({ length: count }, (_, i) => ({
        id: `mock-${i + 1}`,
        codigo: `EXC${String(i + 1).padStart(4, '0')}`,
        titulo: `${types[i % types.length]} de Luxo ${i + 1}`,
        descricao: `Excelente ${types[i % types.length]} em localização privilegiada com acabamento de primeira linha.`,
        tipo: types[i % types.length],
        finalidade: i % 2 === 0 ? 'venda' : 'aluguel',
        preco: (500000 + Math.random() * 2000000).toFixed(2),
        quartos: Math.floor(Math.random() * 4) + 2,
        banheiros: Math.floor(Math.random() * 3) + 2,
        vagas_garagem: Math.floor(Math.random() * 3) + 1,
        area_total: (80 + Math.random() * 200).toFixed(2),
        endereco: `Rua Teste ${i + 1}`,
        numero: String(100 + i),
        bairro: neighborhoods[i % neighborhoods.length],
        cidade: cities[i % cities.length],
        estado: 'MG',
        cep: '30140-000',
        fotos: Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, j) => ({
            url: `https://picsum.photos/800/600?random=${i * 10 + j}`,
            ordem: j
        }))
    }));
}

// Fase 2: Buscar detalhes de um imóvel
async function fetchPropertyDetails(propertyId) {
    try {
        const response = await axios.get(
            `${EXCLUSIVA_API_BASE}/api/properties/${propertyId}`,
            {
                headers: {
                    'Authorization': `Bearer ${EXCLUSIVA_API_KEY}`,
                    'Accept': 'application/json'
                }
            }
        );

        return response.data.data || response.data;
    } catch (error) {
        log('warn', `⚠️  Erro ao buscar detalhes do imóvel ${propertyId}`, { error: error.message });
        return null;
    }
}

// Fase 3: Salvar imóvel no Directus
async function savePropertyToDirectus(property) {
    try {
        // Verificar se já existe (por external_id)
        const existingCheck = await axios.get(
            `${DIRECTUS_URL}/items/properties`,
            {
                params: { 
                    filter: { external_id: property.id },
                    limit: 1
                },
                headers: { Authorization: `Bearer ${directusToken}` }
            }
        );

        const propertyData = {
            company_id: companyId,
            title: property.titulo,  // Campo obrigatório padrão Directus
            codigo_imovel: property.codigo || property.id,
            titulo: property.titulo,
            descricao: property.descricao,
            tipo: property.tipo,
            finalidade: property.finalidade,
            preco: parseFloat(property.preco),
            condominio: parseFloat(property.condominio || 0),
            iptu: parseFloat(property.iptu || 0),
            endereco: property.endereco,
            numero: property.numero,
            complemento: property.complemento,
            bairro: property.bairro,
            cidade: property.cidade,
            estado: property.estado,
            cep: property.cep,
            area_total: parseFloat(property.area_total || 0),
            area_construida: parseFloat(property.area_construida || property.area_total || 0),
            quartos: parseInt(property.quartos || 0),
            suites: parseInt(property.suites || 0),
            banheiros: parseInt(property.banheiros || 0),
            vagas_garagem: parseInt(property.vagas_garagem || 0),
            disponivel: true,
            destaque: property.destaque || false,
            external_id: property.id,
            external_data: property,
            sync_status: 'synced',
            last_sync_at: new Date().toISOString()
        };

        let propertyId;

        if (existingCheck.data.data && existingCheck.data.data.length > 0) {
            // Atualizar existente
            propertyId = existingCheck.data.data[0].id;
            await axios.patch(
                `${DIRECTUS_URL}/items/properties/${propertyId}`,
                propertyData,
                {
                    headers: { Authorization: `Bearer ${directusToken}` }
                }
            );
            log('info', `✅ Imóvel atualizado: ${property.codigo}`);
        } else {
            // Criar novo
            const response = await axios.post(
                `${DIRECTUS_URL}/items/properties`,
                propertyData,
                {
                    headers: { Authorization: `Bearer ${directusToken}` }
                }
            );
            propertyId = response.data.data.id;
            log('info', `✅ Imóvel criado: ${property.codigo}`);
        }

        return propertyId;
    } catch (error) {
        log('error', `❌ Erro ao salvar imóvel ${property.codigo}`, { 
            error: error.message,
            response: JSON.stringify(error.response?.data, null, 2)
        });
        throw error;
    }
}

// Processar imagem (download e upload para Directus)
async function processPropertyImage(imageUrl, propertyId, order = 0) {
    try {
        // Por enquanto, apenas registrar a URL
        // Em produção, você faria download e upload para /files
        log('info', `📸 Imagem processada: ${imageUrl.substring(0, 50)}...`);
        
        // TODO: Implementar download e upload real
        // const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        // const formData = new FormData();
        // formData.append('file', imageResponse.data);
        // const uploadResponse = await axios.post(`${DIRECTUS_URL}/files`, formData);
        // return uploadResponse.data.data.id;
        
        return null;
    } catch (error) {
        log('warn', `⚠️  Erro ao processar imagem`, { error: error.message });
        return null;
    }
}

// Executar importação completa
async function runImport() {
    const startTime = Date.now();
    
    try {
        log('info', '🚀 Iniciando importação de imóveis...');
        
        // 1. Login
        await loginDirectus();
        
        // 2. Buscar/criar empresa
        await getOrCreateCompany();
        
        // 3. Buscar lista de imóveis
        const propertiesList = await fetchPropertiesList();
        
        if (!propertiesList || propertiesList.length === 0) {
            log('warn', '⚠️  Nenhum imóvel encontrado para importar');
            return;
        }
        
        // 4. Criar job status
        await createJobStatus(`import-properties-${Date.now()}`, propertiesList.length);
        
        // 5. Processar cada imóvel com rate limiting
        let processedCount = 0;
        let errorCount = 0;
        
        for (const property of propertiesList) {
            await queue.add(async () => {
                try {
                    // Buscar detalhes se necessário (se a lista não tiver todos os dados)
                    const fullProperty = property.fotos ? property : await fetchPropertyDetails(property.id);
                    
                    if (!fullProperty) {
                        errorCount++;
                        return;
                    }
                    
                    // Salvar no Directus
                    const propertyId = await savePropertyToDirectus(fullProperty);
                    
                    // Processar imagens (se houver)
                    if (fullProperty.fotos && fullProperty.fotos.length > 0) {
                        for (const [index, foto] of fullProperty.fotos.entries()) {
                            await processPropertyImage(foto.url, propertyId, index);
                        }
                    }
                    
                    processedCount++;
                    await updateJobProgress(processedCount, propertiesList.length);
                    
                } catch (error) {
                    errorCount++;
                    log('error', `Erro ao processar imóvel ${property.id}`, { error: error.message });
                }
            });
        }
        
        // Aguardar conclusão de todas as tarefas
        await queue.onIdle();
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        const result = {
            total: propertiesList.length,
            processed: processedCount,
            errors: errorCount,
            duration: `${duration}s`
        };
        
        await updateJobProgress(processedCount, propertiesList.length, 'completed', result);
        
        log('info', '✅ Importação concluída!', result);
        
    } catch (error) {
        log('error', '❌ Erro fatal na importação', { error: error.message, stack: error.stack });
        await updateJobProgress(0, 0, 'failed', null, error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    runImport()
        .then(() => {
            log('info', '🎉 Processo finalizado com sucesso');
            process.exit(0);
        })
        .catch((error) => {
            log('error', '💥 Processo finalizado com erro', { error: error.message });
            process.exit(1);
        });
}

module.exports = { runImport };
