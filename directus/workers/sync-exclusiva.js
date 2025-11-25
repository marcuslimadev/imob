/**
 * Worker de Sincronização Exclusiva → Directus
 * Adaptado de: https://github.com/marcuslimadev/exclusiva/blob/main/backend/sync_worker.php
 * 
 * Duas fases:
 * - Fase 1: Lista completa (dados básicos)
 * - Fase 2: Detalhes (apenas imóveis desatualizados)
 */

const axios = require('axios');
const { createDirectus, rest, authentication, createItem, updateItem, readItems } = require('@directus/sdk');

// ===== CONFIGURAÇÃO =====
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'marcus@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Teste@123';

const API_TOKEN = '$2y$10$Lcn1ct.wEfBonZldcjuVQ.pD5p8gBRNrPlHjVwruaG5HAui2XCG9O';
const API_BASE = 'https://www.exclusivalarimoveis.com.br/api/v1/app/imovel';

const FORCE_FULL_UPDATE = process.env.FORCE_FULL_UPDATE === 'true';

// ===== INICIALIZAÇÃO =====
const directus = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());

let stats = {
    fase1: { total: 0, salvos: 0, erros: 0 },
    fase2: { total: 0, atualizados: 0, erros: 0 },
    comImagens: 0
};

let companyId = null;
let jobId = null;

// ===== HELPERS =====
function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
}

async function logToDirectus(message, level = 'info', context = null) {
    try {
        await directus.request(
            createItem('logs', {
                level,
                message,
                source: 'sync-exclusiva',
                context: context ? JSON.stringify(context) : null
            })
        );
    } catch (err) {
        console.error('Erro ao salvar log:', err.message);
    }
}

async function updateJobStatus(status, progress = null, total = null, error = null) {
    if (!jobId) return;
    
    const update = { status, updated_at: new Date().toISOString() };
    if (progress !== null) update.progress = progress;
    if (total !== null) update.total = total;
    if (error) update.error = error;
    
    try {
        await directus.request(updateItem('job_status', jobId, update));
    } catch (err) {
        console.error('Erro ao atualizar job:', err.message);
    }
}

function callApiGet(url) {
    return axios.get(url, {
        headers: {
            'Accept': 'application/json',
            'token': API_TOKEN,
            'User-Agent': 'iMOBI-Sync/1.0'
        },
        timeout: 60000
    }).then(res => res.data).catch(err => {
        log(`Erro API: ${err.message}`, 'error');
        return null;
    });
}

function parseApiDateTime(value) {
    if (!value) return null;
    const timestamp = new Date(value.replace(/\//g, '-'));
    return isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

function intOrNull(value) {
    if (value === null || value === '' || value === undefined) return null;
    const num = parseInt(value);
    return isNaN(num) ? null : num;
}

function decOrNull(value) {
    if (value === null || value === '' || value === undefined) return null;
    const num = parseFloat(String(value).replace(',', '.'));
    return isNaN(num) ? null : num;
}

function strOrNull(value) {
    return (value === null || value === '' || value === undefined) ? null : String(value);
}

// ===== FASE 1: LISTA COMPLETA =====
async function upsertBasico(row) {
    const finalidadeRaw = row.finalidadeImovel || 'Venda';
    
    // Ignorar imóveis de aluguel (sistema exclusivo para vendas)
    if (finalidadeRaw.toLowerCase().includes('aluguel') || finalidadeRaw.toLowerCase().includes('locação')) {
        return null;
    }
    
    const finalidade = 'Venda';
    const codigo = row.codigoImovel;
    
    const apiCreatedAt = parseApiDateTime(row.dataInsercaoImovel);
    const apiUpdatedAt = parseApiDateTime(row.ultimaAtualizacaoImovel);
    
    // Buscar imóvel existente
    const existing = await directus.request(
        readItems('properties', {
            filter: { external_id: { _eq: codigo }, company_id: { _eq: companyId } },
            limit: 1
        })
    );
    
    const data = {
        company_id: companyId,
        external_id: codigo,
        codigo_imovel: codigo,
        titulo: row.descricaoTipoImovel || 'Imóvel',
        tipo: row.descricaoTipoImovel || 'Residencial',
        finalidade: finalidade,
        disponivel: row.statusImovel ? true : false,
        external_data: JSON.stringify(row),
        sync_status: 'synced',
        last_sync_at: new Date().toISOString()
    };
    
    if (apiCreatedAt) data.date_created = apiCreatedAt;
    
    if (existing.length > 0) {
        await directus.request(updateItem('properties', existing[0].id, data));
        log(`✓ Atualizado básico: ${codigo}`);
    } else {
        await directus.request(createItem('properties', data));
        log(`✓ Criado básico: ${codigo}`);
    }
    
    return codigo;
}

async function fase1() {
    log('\n📋 FASE 1: Salvando lista completa de imóveis...');
    log('═'.repeat(64));
    
    let page = 1;
    const maxPages = 999;
    
    do {
        const url = `${API_BASE}/lista?status=ativo&page=${page}&per_page=100`;
        log(`📄 Página ${page}: ${url}`);
        
        const lista = await callApiGet(url);
        
        if (!lista || !lista.status) {
            log(`⚠ API retornou status false ou vazio na página ${page}`, 'warn');
            break;
        }
        
        const data = lista.data || [];
        if (data.length === 0) {
            log(`ℹ️ Página ${page} vazia. Fim da lista.`);
            break;
        }
        
        for (const row of data) {
            try {
                const codigo = await upsertBasico(row);
                if (codigo) stats.fase1.salvos++;
            } catch (err) {
                log(`❌ Erro ao salvar ${row.codigoImovel}: ${err.message}`, 'error');
                await logToDirectus(`Erro fase1: ${row.codigoImovel}`, 'error', { error: err.message });
                stats.fase1.erros++;
            }
            stats.fase1.total++;
        }
        
        await updateJobStatus('processing', stats.fase1.total, null);
        
        if (page >= maxPages) break;
        page++;
        
    } while (true);
    
    log(`\n✅ Fase 1 concluída: ${stats.fase1.salvos} salvos, ${stats.fase1.erros} erros`);
}

// ===== FASE 2: DETALHES =====
async function upsertDetalhes(codigo, detalhes) {
    const d = detalhes.data || {};
    
    // Buscar imóvel
    const existing = await directus.request(
        readItems('properties', {
            filter: { external_id: { _eq: codigo }, company_id: { _eq: companyId } },
            limit: 1
        })
    );
    
    if (existing.length === 0) {
        log(`⚠ Imóvel ${codigo} não encontrado para atualizar detalhes`, 'warn');
        return;
    }
    
    const property = existing[0];
    
    // Valores
    const valorVenda = decOrNull(d.valorEsperado);
    const endereco = d.endereco || {};
    const area = d.area || {};
    
    // Imagens
    const imagens = [];
    let imagemDestaque = null;
    
    if (Array.isArray(d.imagens)) {
        for (const img of d.imagens) {
            if (img.urlImagem) {
                imagens.push({
                    url: img.urlImagem,
                    destaque: Boolean(img.destaque)
                });
                
                if (img.destaque && !imagemDestaque) {
                    imagemDestaque = img.urlImagem;
                }
            }
        }
    }
    
    if (!imagemDestaque && imagens.length > 0) {
        imagemDestaque = imagens[0].url;
    }
    
    // Características
    const caracteristicas = [];
    if (Array.isArray(d.caracteristicas)) {
        for (const c of d.caracteristicas) {
            if (c.nomeCaracteristica) {
                caracteristicas.push(c.nomeCaracteristica);
            }
        }
    }
    
    const update = {
        titulo: d.descricaoImovel || property.titulo,
        descricao: d.descricaoImovel || property.descricao,
        tipo: d.descricaoTipoImovel || property.tipo,
        quartos: intOrNull(d.dormitorios),
        suites: intOrNull(d.suites),
        banheiros: intOrNull(d.banheiros),
        vagas_garagem: intOrNull(d.garagem),
        preco: valorVenda,
        endereco: strOrNull(endereco.logradouro),
        numero: strOrNull(endereco.numero),
        bairro: strOrNull(endereco.bairro),
        cidade: strOrNull(endereco.cidade),
        estado: strOrNull(endereco.estado),
        cep: strOrNull(endereco.cep),
        latitude: decOrNull(endereco.latitude),
        longitude: decOrNull(endereco.longitude),
        area_total: decOrNull(area.total?.valor),
        area_construida: decOrNull(area.privativa?.valor),
        caracteristicas: caracteristicas.length > 0 ? JSON.stringify(caracteristicas) : null,
        external_data: JSON.stringify(d),
        sync_status: 'synced',
        last_sync_at: new Date().toISOString()
    };
    
    // Só atualiza imagens se tiver pelo menos uma
    if (imagens.length > 0) {
        // TODO: Implementar upload real de imagens para directus_files
        // Por enquanto, salva apenas as URLs no campo JSON
        stats.comImagens++;
    }
    
    await directus.request(updateItem('properties', property.id, update));
    log(`✓ Atualizado detalhes: ${codigo} (${imagens.length} imagens)`);
}

async function fase2() {
    log('\n📋 FASE 2: Atualizando detalhes...');
    log('═'.repeat(64));
    
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    
    // Buscar imóveis que precisam atualização
    let filter;
    
    if (FORCE_FULL_UPDATE) {
        filter = { company_id: { _eq: companyId } };
    } else {
        filter = {
            _and: [
                { company_id: { _eq: companyId } },
                {
                    _or: [
                        { descricao: { _null: true } },
                        { cidade: { _null: true } },
                        { last_sync_at: { _null: true } },
                        { last_sync_at: { _lt: fourHoursAgo } }
                    ]
                }
            ]
        };
    }
    
    const properties = await directus.request(
        readItems('properties', {
            filter,
            fields: ['id', 'external_id'],
            limit: -1
        })
    );
    
    log(`ℹ️ Total de imóveis para atualizar: ${properties.length}`);
    
    for (const prop of properties) {
        try {
            const url = `${API_BASE}/dados/${prop.external_id}`;
            const det = await callApiGet(url);
            
            if (!det || !det.status) {
                log(`⚠ Falha ao obter detalhes do imóvel ${prop.external_id}`, 'warn');
                stats.fase2.erros++;
                continue;
            }
            
            await upsertDetalhes(prop.external_id, det);
            stats.fase2.atualizados++;
            
            await updateJobStatus('processing', stats.fase1.total + stats.fase2.atualizados);
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (err) {
            log(`❌ Erro ao atualizar detalhes ${prop.external_id}: ${err.message}`, 'error');
            await logToDirectus(`Erro fase2: ${prop.external_id}`, 'error', { error: err.message });
            stats.fase2.erros++;
        }
        
        stats.fase2.total++;
    }
    
    log(`\n✅ Fase 2 concluída: ${stats.fase2.atualizados} atualizados, ${stats.fase2.erros} erros`);
}

// ===== MAIN =====
async function main() {
    const startTime = Date.now();
    
    try {
        // Login no Directus
        log('🔐 Fazendo login no Directus...');
        await directus.login(ADMIN_EMAIL, ADMIN_PASSWORD);
        log('✅ Login realizado!');
        
        // Buscar empresa Exclusiva
        log('🏢 Buscando empresa Exclusiva...');
        const companies = await directus.request(
            readItems('companies', {
                filter: { slug: { _eq: 'exclusiva' } },
                limit: 1
            })
        );
        
        if (companies.length === 0) {
            throw new Error('Empresa Exclusiva não encontrada! Execute o setup primeiro.');
        }
        
        companyId = companies[0].id;
        log(`✅ Empresa encontrada: ${companyId}`);
        
        // Criar job de sincronização
        const job = await directus.request(
            createItem('job_status', {
                job_id: `sync-exclusiva-${Date.now()}`,
                status: 'processing',
                progress: 0,
                total: 0
            })
        );
        jobId = job.id;
        log(`✅ Job criado: ${jobId}`);
        
        await logToDirectus('🚀 Iniciando sincronização Exclusiva → Directus');
        
        // FASE 1
        await fase1();
        
        // FASE 2
        await fase2();
        
        // Finalizar
        const duration = Math.round((Date.now() - startTime) / 1000);
        const summary = `
🎉 SINCRONIZAÇÃO COMPLETA!
═══════════════════════════════════════════════
Fase 1 (Lista):
  • Total processados: ${stats.fase1.total}
  • Salvos: ${stats.fase1.salvos}
  • Erros: ${stats.fase1.erros}

Fase 2 (Detalhes):
  • Total processados: ${stats.fase2.total}
  • Atualizados: ${stats.fase2.atualizados}
  • Erros: ${stats.fase2.erros}
  • Com imagens: ${stats.comImagens}

Duração: ${duration}s
═══════════════════════════════════════════════
        `;
        
        log(summary);
        await logToDirectus(summary, 'info');
        
        await updateJobStatus('completed', stats.fase1.total + stats.fase2.total, stats.fase1.total + stats.fase2.total, null);
        
        process.exit(0);
        
    } catch (error) {
        log(`❌ ERRO FATAL: ${error.message}`, 'error');
        await logToDirectus(`ERRO FATAL: ${error.message}`, 'error', { stack: error.stack });
        
        if (jobId) {
            await updateJobStatus('failed', null, null, error.message);
        }
        
        process.exit(1);
    }
}

// Executar
main();
