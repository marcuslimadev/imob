/**
 * WhatsApp Service Logic - Lógica completa de processamento
 * Migrado de: backend/app/Services/WhatsAppService.php
 * 
 * Funções:
 * - Detecção de intenção
 * - Extração de dados do lead
 * - Matching de imóveis
 * - Progressão de stages
 * - Formatação de mensagens
 */

/**
 * Detectar tipo de mensagem (texto, áudio, imagem, etc)
 */
export function detectMessageType(mediaUrl, mediaType) {
	if (!mediaUrl) return 'text';

	const mediaTypeStr = (mediaType || '').toLowerCase();
	
	if (!mediaTypeStr) {
		const path = new URL(mediaUrl).pathname;
		const ext = path.split('.').pop().toLowerCase();
		
		if (['ogg', 'oga', 'mp3', 'wav'].includes(ext)) return 'audio';
		if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext)) return 'image';
		if (['mp4', 'mov', 'avi'].includes(ext)) return 'video';
		return 'document';
	}

	if (mediaTypeStr.includes('audio')) return 'audio';
	if (mediaTypeStr.includes('image')) return 'image';
	if (mediaTypeStr.includes('video')) return 'video';
	return 'document';
}

/**
 * Extrair nome preferido (primeiro nome)
 */
export function extractPreferredName(fullName) {
	if (!fullName) return null;
	const parts = fullName.trim().split(/\s+/);
	return parts[0];
}

/**
 * Extrair CPF da mensagem
 */
export function extractCpfFromMessage(message) {
	const match = message.match(/(\d{11})|(\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[\-\s]?\d{2})/);
	if (match) {
		const cpf = (match[1] || match[2]).replace(/\D/g, '');
		return cpf.length === 11 ? cpf : null;
	}
	return null;
}

/**
 * Extrair email da mensagem
 */
export function extractEmailFromMessage(message) {
	const match = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
	return match ? match[0].toLowerCase() : null;
}

/**
 * Normalizar valor numérico (orçamento, renda)
 */
export function normalizeNumericValue(value) {
	if (value === null || value === '') return null;
	if (typeof value === 'number') return value;
	
	// Remover R$, espaços
	let clean = String(value).replace(/R\$|\s/g, '');
	// Remover pontos de milhar, manter vírgula decimal
	clean = clean.replace(/\./g, '').replace(/,/g, '.');
	
	const numeric = parseFloat(clean);
	return isNaN(numeric) ? null : numeric;
}

/**
 * Extrair orçamento da mensagem (min/max)
 */
export function extractOrcamentoFromMessage(message) {
	const result = { min: null, max: null };
	const lowerMsg = message.toLowerCase();
	
	// Padrão: "de X a Y" ou "entre X e Y"
	const rangeMatch = lowerMsg.match(/(?:de|entre)[\s:]*(?:r\$)?[\s]*([\d.,]+[\s]?(?:mil(?:hão|hões)?|k)?)[\s]*(?:a|até|e)[\s]*(?:r\$)?[\s]*([\d.,]+[\s]?(?:mil(?:hão|hões)?|k)?)/);
	if (rangeMatch) {
		result.min = parseValue(rangeMatch[1]);
		result.max = parseValue(rangeMatch[2]);
		return result;
	}
	
	// Padrão: "até X" ou "máximo X"
	const maxMatch = lowerMsg.match(/(?:até|máximo|max|no máximo)[\s:]*(?:r\$)?[\s]*([\d.,]+[\s]?(?:mil(?:hão|hões)?|k)?)/);
	if (maxMatch) {
		result.max = parseValue(maxMatch[1]);
		return result;
	}
	
	return result;
}

function parseValue(str) {
	// "1 milhão" ou "1.5 milhões"
	if (/milh/i.test(str)) {
		const num = str.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(/,/g, '.');
		return parseFloat(num) * 1000000;
	}
	// "500 mil" ou "500k"
	if (/mil|k/i.test(str)) {
		const num = str.replace(/[^\d]/g, '');
		return parseFloat(num) * 1000;
	}
	// Número normal
	return normalizeNumericValue(str);
}

/**
 * Extrair renda mensal da mensagem
 */
export function extractRendaMensalFromMessage(message) {
	const lowerMsg = message.toLowerCase();
	
	// "renda de X" ou "ganho X mil"
	const match = lowerMsg.match(/renda.*?(\d+[\s]?mil|\d{4,})/);
	if (match) {
		const value = match[1];
		if (value.includes('mil')) {
			const num = value.replace(/\D/g, '');
			return parseFloat(num) * 1000;
		}
		return normalizeNumericValue(value);
	}
	
	// Número isolado entre 1000 e 1000000 (provavelmente renda)
	const isolatedMatch = lowerMsg.match(/^\s*(\d{4,})\s*$/);
	if (isolatedMatch) {
		const num = parseFloat(isolatedMatch[1]);
		if (num >= 1000 && num <= 1000000) return num;
	}
	
	return null;
}

/**
 * Formatar valor em moeda brasileira
 */
export function formatCurrencyValue(value) {
	if (!value || value === 0) return 'Sob consulta';
	return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
}

/**
 * Extrair destaques do imóvel
 */
export function extractPropertyHighlights(property) {
	const highlights = [];
	
	if (property.caracteristicas) {
		try {
			const parsed = JSON.parse(property.caracteristicas);
			if (Array.isArray(parsed)) {
				highlights.push(...parsed);
			}
		} catch (e) {
			// Se não for JSON, dividir por vírgula
			highlights.push(...property.caracteristicas.split(',').map(s => s.trim()));
		}
	}
	
	if (highlights.length === 0 && property.descricao) {
		const lines = property.descricao.split(/\r?\n/).filter(l => l.trim());
		highlights.push(...lines.slice(0, 3));
	}
	
	return highlights.slice(0, 3).filter(h => h && h.length > 0);
}

/**
 * Construir mensagem de preview do imóvel
 */
export function buildPropertyPreviewMessage(property) {
	const valor = formatCurrencyValue(property.valor_venda);
	const quartos = property.dormitorios || '-';
	const suites = property.suites || '-';
	const vagas = property.garagem || '-';
	const highlights = extractPropertyHighlights(property);
	
	let msg = `🏡 *${property.tipo_imovel}* - ${property.bairro}, ${property.cidade}\n`;
	
	if (property.codigo_imovel) {
		msg += `📎 Código: ${property.codigo_imovel}\n`;
	}
	
	msg += `💰 Valor: ${valor}\n`;
	msg += `🛏️  Quartos: ${quartos} | Suítes: ${suites} | Vagas: ${vagas}\n`;
	
	if (highlights.length > 0) {
		msg += `✨ Destaques:\n- ${highlights.join('\n- ')}\n`;
	}
	
	msg += `\nFico à disposição para tirar qualquer dúvida sobre esse imóvel!`;
	
	return msg;
}

/**
 * Verificar se tem dados suficientes para matching
 */
export function hasEnoughDataForMatching(lead) {
	return (lead.budget_min || lead.budget_max) && lead.localizacao && lead.quartos;
}

/**
 * Construir query de busca de imóveis
 */
export function buildPropertyMatchQuery(lead) {
	const filters = {
		active: { _eq: true },
		exibir_imovel: { _eq: true },
		finalidade_imovel: { _eq: 'Venda' }
	};
	
	// Filtro de orçamento
	if (lead.budget_min && lead.budget_max) {
		filters.valor_venda = {
			_between: [lead.budget_min, lead.budget_max]
		};
	} else if (lead.budget_max) {
		filters.valor_venda = {
			_lte: lead.budget_max
		};
	}
	
	// Filtro de quartos
	if (lead.quartos) {
		filters.dormitorios = {
			_gte: lead.quartos
		};
	}
	
	// Filtro de localização (busca parcial no bairro/cidade)
	if (lead.localizacao) {
		filters._or = [
			{ bairro: { _contains: lead.localizacao } },
			{ cidade: { _contains: lead.localizacao } }
		];
	}
	
	return filters;
}

/**
 * Calcular score de matching (simplificado)
 */
export function calculateMatchScore(property, lead) {
	let score = 50; // Base
	
	// Score por preço
	if (lead.budget_min && lead.budget_max) {
		const priceMid = (lead.budget_min + lead.budget_max) / 2;
		const priceDiff = Math.abs(property.valor_venda - priceMid);
		const priceRange = lead.budget_max - lead.budget_min;
		const priceScore = Math.max(0, 30 - (priceDiff / priceRange) * 30);
		score += priceScore;
	}
	
	// Score por quartos
	if (lead.quartos && property.dormitorios >= lead.quartos) {
		score += 10;
		if (property.dormitorios === lead.quartos) score += 5; // Exatamente o solicitado
	}
	
	// Score por localização
	if (lead.localizacao) {
		const loc = lead.localizacao.toLowerCase();
		if (property.bairro && property.bairro.toLowerCase().includes(loc)) {
			score += 15;
		} else if (property.cidade && property.cidade.toLowerCase().includes(loc)) {
			score += 10;
		}
	}
	
	return Math.min(100, score);
}

/**
 * Detectar progressão de stage baseada no contexto
 */
export function detectStageProgression(currentStage, lead, lastMessage) {
	const lowerMsg = (lastMessage || '').toLowerCase();
	
	switch (currentStage) {
		case 'coleta_dados':
			// Se já tem orçamento OU localização OU quartos
			if (lead.budget_min || lead.budget_max || lead.localizacao || lead.quartos) {
				return 'matching';
			}
			return 'aguardando_info';
			
		case 'apresentacao':
			// Cliente demonstra interesse
			if (lowerMsg.includes('interesse') || 
			    lowerMsg.includes('visita') || 
			    lowerMsg.includes('ver') ||
			    lowerMsg.includes('conhecer')) {
				return 'interesse';
			}
			break;
			
		case 'interesse':
			// Cliente solicita agendamento
			if (lowerMsg.includes('agendar') || 
			    lowerMsg.includes('visitar') ||
			    lowerMsg.includes('quando posso')) {
				return 'agendamento';
			}
			break;
			
		case 'sem_match':
			// Cliente aceita refinar
			if (lowerMsg.includes('sim') || 
			    lowerMsg.includes('vamos') ||
			    lowerMsg.includes('pode')) {
				return 'refinamento';
			}
			break;
	}
	
	return currentStage; // Mantém atual
}

/**
 * Construir mensagem de boas-vindas genérica
 */
export function buildGenericWelcomeMessage(assistantName, preferredName) {
	const saudacao = getTimeBasedGreeting();
	const nomeParte = preferredName ? `, ${preferredName}` : '';
	
	return `${saudacao}${nomeParte}! 👋\n\n` +
		   `Eu sou a *${assistantName}*, da *Exclusiva Lar Imóveis*. 🏡\n\n` +
		   `Estou aqui para te ajudar a encontrar o imóvel ideal! Vamos conversar sobre:\n\n` +
		   `💰 Qual o valor que você pretende investir?\n` +
		   `📍 Em qual região você procura?\n` +
		   `🛏️  Quantos quartos você precisa?\n\n` +
		   `Me conta um pouco do que você está procurando que eu já começo a buscar opções perfeitas pra você! 😊`;
}

/**
 * Construir mensagem de boas-vindas com imóvel específico
 */
export function buildPropertyWelcomeMessage(assistantName, preferredName, property) {
	const saudacao = getTimeBasedGreeting();
	const nomeParte = preferredName ? `, ${preferredName}` : '';
	const valor = formatCurrencyValue(property.valor_venda);
	const localizacao = [property.bairro, property.cidade].filter(Boolean).join(', ');
	const referencia = property.referencia_imovel || property.codigo_imovel;
	
	let msg = `${saudacao}${nomeParte}! Eu sou a *${assistantName}*, da *Exclusiva Lar Imóveis*. 🏡\n\n`;
	msg += `Vi que você se interessou pelo ${property.tipo_imovel}`;
	
	if (localizacao) msg += ` em ${localizacao}`;
	if (referencia) msg += ` (Ref: ${referencia})`;
	
	msg += `!\n\n💰 Valor: ${valor}\n`;
	msg += `🛏️  ${property.dormitorios || '-'} quartos | ${property.suites || '-'} suítes | ${property.garagem || '-'} vagas\n\n`;
	
	const highlights = extractPropertyHighlights(property);
	if (highlights.length > 0) {
		msg += `✨ Destaques:\n- ${highlights.join('\n- ')}\n\n`;
	}
	
	if (preferredName) {
		msg += `Posso te chamar de ${preferredName}? Se preferir outro nome, é só me avisar.\n\n`;
	} else {
		msg += `Como posso te chamar para registrar direitinho no nosso atendimento?\n\n`;
	}
	
	msg += `Fico à disposição para te passar mais detalhes e responder suas dúvidas! 😊`;
	
	return msg;
}

/**
 * Obter saudação baseada no horário
 */
function getTimeBasedGreeting() {
	const hour = new Date().getHours();
	if (hour >= 6 && hour < 12) return 'Bom dia';
	if (hour >= 12 && hour < 18) return 'Boa tarde';
	return 'Boa noite';
}

/**
 * Construir mensagem "sem imóveis encontrados"
 */
export function buildNoMatchMessage(lead) {
	let msg = `😔 Infelizmente não encontrei imóveis que atendam exatamente aos seus critérios neste momento.\n\n`;
	
	msg += `📋 Você procura:\n`;
	if (lead.budget_min && lead.budget_max) {
		msg += `💰 Orçamento: ${formatCurrencyValue(lead.budget_min)} - ${formatCurrencyValue(lead.budget_max)}\n`;
	}
	if (lead.localizacao) {
		msg += `📍 Localização: ${lead.localizacao}\n`;
	}
	if (lead.quartos) {
		msg += `🛏️  Quartos: ${lead.quartos}\n`;
	}
	
	msg += `\nMas não desanime! Temos algumas opções:\n\n`;
	msg += `1️⃣ Podemos ajustar um pouco o orçamento ou a região?\n`;
	msg += `2️⃣ Cadastro seu interesse e te aviso assim que chegar algo perfeito!\n`;
	msg += `3️⃣ Posso te mostrar opções bem próximas do que você quer?\n\n`;
	msg += `O que você prefere? 😊`;
	
	return msg;
}

/**
 * Formatar histórico de conversa para IA
 */
export function formatConversationHistory(mensagens) {
	return mensagens.map(msg => {
		const remetente = msg.direction === 'incoming' ? 'Cliente' : 'Atendente';
		const texto = msg.transcription || msg.content || '';
		return `${remetente}: ${texto.trim()}`;
	}).join('\n');
}

/**
 * Validar CPF (algoritmo)
 */
export function validateCPF(cpf) {
	if (!cpf || cpf.length !== 11) return false;
	
	// CPFs inválidos conhecidos
	const invalidCPFs = [
		'00000000000', '11111111111', '22222222222', '33333333333',
		'44444444444', '55555555555', '66666666666', '77777777777',
		'88888888888', '99999999999'
	];
	
	if (invalidCPFs.includes(cpf)) return false;
	
	// Validar dígitos verificadores
	let sum = 0;
	for (let i = 0; i < 9; i++) {
		sum += parseInt(cpf.charAt(i)) * (10 - i);
	}
	let digit = 11 - (sum % 11);
	if (digit >= 10) digit = 0;
	if (digit !== parseInt(cpf.charAt(9))) return false;
	
	sum = 0;
	for (let i = 0; i < 10; i++) {
		sum += parseInt(cpf.charAt(i)) * (11 - i);
	}
	digit = 11 - (sum % 11);
	if (digit >= 10) digit = 0;
	if (digit !== parseInt(cpf.charAt(10))) return false;
	
	return true;
}
