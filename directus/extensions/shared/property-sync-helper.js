/**
 * Helper de Sincronização de Imóveis
 * Migrado de: backend/sync_worker.php + PropertySyncService.php
 * 
 * Funções para buscar e normalizar dados de imóveis de APIs externas
 */

/**
 * Buscar lista de imóveis de uma API externa (paginado)
 * @param {string} apiBase - URL base da API
 * @param {string} apiToken - Token de autenticação
 * @param {number} page - Número da página
 * @param {number} perPage - Itens por página
 * @returns {Promise<object>} - { data: [], totalPages, totalItems }
 */
export async function fetchPropertyList(apiBase, apiToken, page = 1, perPage = 50) {
	const queryString = new URLSearchParams({
		status: 'ativo',
		pagina: page,
		limite: perPage
	}).toString();

	const url = `${apiBase}/lista?${queryString}`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'token': apiToken,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`API request failed: ${response.status} ${response.statusText}`);
	}

	const json = await response.json();

	if (!json.resultSet || !json.resultSet.data) {
		throw new Error('Invalid API response structure');
	}

	return {
		data: json.resultSet.data || [],
		totalPages: json.resultSet.total_pages || 1,
		totalItems: json.resultSet.total_items || 0,
		perPage: json.resultSet.per_page || perPage
	};
}

/**
 * Buscar detalhes completos de um imóvel
 * @param {string} apiBase - URL base da API
 * @param {string} apiToken - Token de autenticação
 * @param {string} codigo - Código do imóvel
 * @returns {Promise<object>} - Dados do imóvel
 */
export async function fetchPropertyDetails(apiBase, apiToken, codigo) {
	const url = `${apiBase}/dados/${codigo}`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'token': apiToken,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`API request failed for property ${codigo}: ${response.status}`);
	}

	const json = await response.json();

	if (!json.resultSet) {
		throw new Error(`Property ${codigo} not found in API`);
	}

	return json.resultSet;
}

/**
 * Normalizar dados do imóvel da API para formato Directus
 * @param {object} apiData - Dados brutos da API
 * @returns {object} - Dados normalizados
 */
export function normalizePropertyData(apiData) {
	// Finalidade: apenas vendas
	const finalidadeRaw = apiData.finalidadeImovel || 'Venda';
	
	// Ignorar imóveis que não sejam exclusivos de venda
	if (finalidadeRaw.toLowerCase().includes('aluguel') || finalidadeRaw.toLowerCase().includes('locação')) {
		return null;
	}

	const finalidade = 'Venda';

	// Extrair imagens
	const imagens = [];
	let imagemDestaque = null;

	if (apiData.imagens && Array.isArray(apiData.imagens)) {
		for (const img of apiData.imagens) {
			if (img.url) {
				imagens.push({
					url: img.url,
					descricao: img.descricao || null,
					ordem: img.ordem || 0,
					destaque: img.destaque || false
				});

				if (img.destaque && !imagemDestaque) {
					imagemDestaque = img.url;
				}
			}
		}

		// Se não tiver destaque marcado, usar primeira imagem
		if (!imagemDestaque && imagens.length > 0) {
			imagemDestaque = imagens[0].url;
		}
	}

	// Características
	const caracteristicas = [];
	if (apiData.caracteristicas && Array.isArray(apiData.caracteristicas)) {
		for (const c of apiData.caracteristicas) {
			if (c.nomeCaracteristica) {
				caracteristicas.push(c.nomeCaracteristica);
			}
		}
	}

	// Áreas
	const parseArea = (valor) => {
		if (!valor) return null;
		return parseFloat(String(valor).replace(',', '.'));
	};

	const areaTotal = parseArea(apiData.areaTotal);
	const areaPrivativa = parseArea(apiData.areaPrivativa);
	const areaTerreno = parseArea(apiData.areaTotalTerreno);

	// Coordenadas da API ou placeholder
	const latitude = apiData.endereco?.latitude || null;
	const longitude = apiData.endereco?.longitude || null;

	// Datas
	const parseApiDate = (value) => {
		if (!value) return null;
		if (value instanceof Date) return value.toISOString();
		
		const normalized = String(value).replace('/', '-').trim();
		const timestamp = Date.parse(normalized);
		
		return timestamp ? new Date(timestamp).toISOString() : null;
	};

	return {
		codigo_imovel: apiData.codigoImovel,
		referencia_imovel: apiData.referenciaImovel || null,
		finalidade: finalidade,
		tipo: apiData.descricaoTipoImovel || 'Residencial',
		titulo: apiData.tituloImovel || `${apiData.descricaoTipoImovel} - ${apiData.codigoImovel}`,
		descricao: apiData.descricaoImovel || null,
		
		// Características numéricas
		quartos: apiData.dormitorios || null,
		suites: apiData.suites || null,
		banheiros: apiData.banheiros || null,
		vagas_garagem: apiData.garagem || null,
		salas: apiData.salas || null,
		
		// Valores
		preco: apiData.valorEsperado || null,
		valor_condominio: apiData.taxaCondominio || null,
		valor_iptu: apiData.valorIPTU || null,
		
		// Localização
		cidade: apiData.endereco?.cidade || null,
		estado: apiData.endereco?.estado || null,
		bairro: apiData.endereco?.bairro || null,
		logradouro: apiData.endereco?.logradouro || null,
		numero: apiData.endereco?.numero || null,
		complemento: apiData.endereco?.complemento || null,
		cep: apiData.endereco?.cep || null,
		latitude: latitude,
		longitude: longitude,
		
		// Áreas
		area_total: areaTotal,
		area_privativa: areaPrivativa,
		area_terreno: areaTerreno,
		
		// Imagens
		imagem_destaque: imagemDestaque,
		imagens: JSON.stringify(imagens),
		
		// Características
		caracteristicas: JSON.stringify(caracteristicas),
		
		// Flags booleanas
		em_condominio: apiData.emCondominio ? 1 : 0,
		exclusividade: apiData.exclusividade ? 1 : 0,
		active: 1, // Se está na API, está ativo
		
		// Metadados
		api_data: JSON.stringify(apiData),
		api_created_at: parseApiDate(apiData.dataInsercaoImovel),
		api_updated_at: parseApiDate(apiData.ultimaAtualizacaoImovel)
	};
}

/**
 * Verificar se imóvel precisa de atualização
 * @param {object} property - Registro do Directus
 * @param {number} maxHours - Máximo de horas desde última atualização
 * @returns {boolean}
 */
export function needsUpdate(property, maxHours = 4) {
	// Sem descrição ou cidade = precisa atualizar
	if (!property.descricao || !property.cidade) {
		return true;
	}

	// Sem data de atualização = precisa atualizar
	if (!property.updated_at && !property.api_updated_at) {
		return true;
	}

	// Verificar se passou do tempo limite
	const now = new Date();
	const lastUpdate = new Date(property.updated_at || property.api_updated_at);
	const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);

	return hoursSinceUpdate > maxHours;
}

/**
 * Criar filtro para encontrar imóveis que precisam atualização
 * @param {number} maxHours - Horas máximas desde última atualização
 * @returns {object} - Filtro Directus
 */
export function buildNeedsUpdateFilter(maxHours = 4) {
	const cutoffDate = new Date();
	cutoffDate.setHours(cutoffDate.getHours() - maxHours);

	return {
		_or: [
			{ descricao: { _null: true } },
			{ cidade: { _null: true } },
			{ updated_at: { _null: true } },
			{ updated_at: { _lt: cutoffDate.toISOString() } }
		]
	};
}

/**
 * Criar estatísticas de sincronização
 * @returns {object} - Objeto de estatísticas
 */
export function createSyncStats() {
	return {
		phase1: {
			found: 0,
			new: 0,
			updated: 0,
			skipped: 0,
			errors: 0
		},
		phase2: {
			total: 0,
			updated: 0,
			errors: 0
		},
		startTime: Date.now(),
		endTime: null
	};
}

/**
 * Finalizar estatísticas
 * @param {object} stats - Objeto de estatísticas
 * @returns {object} - Estatísticas finalizadas
 */
export function finalizeSyncStats(stats) {
	stats.endTime = Date.now();
	stats.durationMs = stats.endTime - stats.startTime;
	stats.durationSeconds = Math.round(stats.durationMs / 1000);
	
	return stats;
}

/**
 * Formatar relatório de sincronização
 * @param {object} stats - Estatísticas
 * @returns {string} - Relatório formatado
 */
export function formatSyncReport(stats) {
	const lines = [];
	
	lines.push('═══════════════════════════════════════════');
	lines.push('🏠 RELATÓRIO DE SINCRONIZAÇÃO DE IMÓVEIS');
	lines.push('═══════════════════════════════════════════');
	lines.push('');
	lines.push('📋 FASE 1: Lista Completa');
	lines.push(`   • Encontrados: ${stats.phase1.found}`);
	lines.push(`   • Novos: ${stats.phase1.new}`);
	lines.push(`   • Atualizados: ${stats.phase1.updated}`);
	lines.push(`   • Ignorados: ${stats.phase1.skipped}`);
	lines.push(`   • Erros: ${stats.phase1.errors}`);
	lines.push('');
	lines.push('📝 FASE 2: Detalhes');
	lines.push(`   • Total para atualizar: ${stats.phase2.total}`);
	lines.push(`   • Atualizados: ${stats.phase2.updated}`);
	lines.push(`   • Erros: ${stats.phase2.errors}`);
	lines.push('');
	lines.push(`⏱️ Duração: ${stats.durationSeconds}s`);
	lines.push('═══════════════════════════════════════════');
	
	return lines.join('\n');
}

/**
 * Delay helper para rate limiting
 * @param {number} ms - Milissegundos para aguardar
 * @returns {Promise<void>}
 */
export function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
