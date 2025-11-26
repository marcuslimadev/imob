/**
 * Sistema de Pipeline de 17 Stages
 * Gerencia o fluxo completo de conversão de leads imobiliários
 */

/**
 * Definição completa dos 17 stages do pipeline
 */
export const STAGES = {
	// 1. Boas-vindas inicial
	BOAS_VINDAS: {
		key: 'boas_vindas',
		label: 'Boas-vindas',
		description: 'Primeira interação do lead, mensagem de boas-vindas enviada',
		color: '#3B82F6',
		order: 1,
		automated: true
	},
	
	// 2. Coleta de dados básicos
	COLETA_DADOS: {
		key: 'coleta_dados',
		label: 'Coleta de Dados',
		description: 'Coletando informações básicas (nome, orçamento, preferências)',
		color: '#8B5CF6',
		order: 2,
		automated: true
	},
	
	// 3. Aguardando informações complementares
	AGUARDANDO_INFO: {
		key: 'aguardando_info',
		label: 'Aguardando Info',
		description: 'Lead parou de responder, aguardando informações complementares',
		color: '#F59E0B',
		order: 3,
		automated: true
	},
	
	// 4. Realizando matching de imóveis
	MATCHING: {
		key: 'matching',
		label: 'Matching',
		description: 'Critérios suficientes, buscando imóveis compatíveis',
		color: '#10B981',
		order: 4,
		automated: true
	},
	
	// 5. Apresentação de imóveis
	APRESENTACAO: {
		key: 'apresentacao',
		label: 'Apresentação',
		description: 'Imóveis apresentados, aguardando feedback do lead',
		color: '#06B6D4',
		order: 5,
		automated: true
	},
	
	// 6. Lead demonstrou interesse
	INTERESSE: {
		key: 'interesse',
		label: 'Interesse',
		description: 'Lead demonstrou interesse em um ou mais imóveis',
		color: '#14B8A6',
		order: 6,
		automated: false
	},
	
	// 7. Refinamento de busca
	REFINAMENTO: {
		key: 'refinamento',
		label: 'Refinamento',
		description: 'Lead quer refinar critérios de busca (preço, localização, etc)',
		color: '#A855F7',
		order: 7,
		automated: false
	},
	
	// 8. Sem match encontrado
	SEM_MATCH: {
		key: 'sem_match',
		label: 'Sem Match',
		description: 'Nenhum imóvel compatível, oferecendo alternativas',
		color: '#EF4444',
		order: 8,
		automated: true
	},
	
	// 9. Agendamento de visita
	AGENDAMENTO: {
		key: 'agendamento',
		label: 'Agendamento',
		description: 'Agendando visita ao imóvel',
		color: '#F97316',
		order: 9,
		automated: false
	},
	
	// 10. Visita agendada
	VISITA_AGENDADA: {
		key: 'visita_agendada',
		label: 'Visita Agendada',
		description: 'Visita confirmada, aguardando data',
		color: '#84CC16',
		order: 10,
		automated: false
	},
	
	// 11. Pós-visita
	POS_VISITA: {
		key: 'pos_visita',
		label: 'Pós-visita',
		description: 'Visita realizada, coletando feedback',
		color: '#22C55E',
		order: 11,
		automated: false
	},
	
	// 12. Negociação
	NEGOCIACAO: {
		key: 'negociacao',
		label: 'Negociação',
		description: 'Negociando valores e condições',
		color: '#F59E0B',
		order: 12,
		automated: false
	},
	
	// 13. Proposta enviada
	PROPOSTA: {
		key: 'proposta',
		label: 'Proposta',
		description: 'Proposta formal enviada, aguardando aceite',
		color: '#3B82F6',
		order: 13,
		automated: false
	},
	
	// 14. Análise de crédito
	ANALISE_CREDITO: {
		key: 'analise_credito',
		label: 'Análise de Crédito',
		description: 'Análise de crédito em andamento',
		color: '#6366F1',
		order: 14,
		automated: false
	},
	
	// 15. Documentação
	DOCUMENTACAO: {
		key: 'documentacao',
		label: 'Documentação',
		description: 'Coletando e validando documentação',
		color: '#8B5CF6',
		order: 15,
		automated: false
	},
	
	// 16. Finalização
	FINALIZACAO: {
		key: 'finalizacao',
		label: 'Finalização',
		description: 'Processo de fechamento, assinatura de contrato',
		color: '#10B981',
		order: 16,
		automated: false
	},
	
	// 17. Atendimento humano solicitado
	ATENDIMENTO_HUMANO: {
		key: 'atendimento_humano',
		label: 'Atendimento Humano',
		description: 'Lead solicitou falar com corretor humano',
		color: '#EC4899',
		order: 17,
		automated: false
	}
};

/**
 * State machine: define transições válidas entre stages
 * Estrutura: { stageAtual: [stagesPossíveis] }
 */
export const STAGE_TRANSITIONS = {
	boas_vindas: ['coleta_dados', 'atendimento_humano'],
	
	coleta_dados: ['matching', 'aguardando_info', 'atendimento_humano'],
	
	aguardando_info: ['coleta_dados', 'matching', 'atendimento_humano'],
	
	matching: ['apresentacao', 'sem_match', 'atendimento_humano'],
	
	apresentacao: ['interesse', 'refinamento', 'sem_match', 'atendimento_humano'],
	
	interesse: ['agendamento', 'negociacao', 'refinamento', 'atendimento_humano'],
	
	refinamento: ['matching', 'apresentacao', 'atendimento_humano'],
	
	sem_match: ['refinamento', 'coleta_dados', 'atendimento_humano'],
	
	agendamento: ['visita_agendada', 'interesse', 'atendimento_humano'],
	
	visita_agendada: ['pos_visita', 'agendamento', 'atendimento_humano'],
	
	pos_visita: ['negociacao', 'interesse', 'refinamento', 'atendimento_humano'],
	
	negociacao: ['proposta', 'interesse', 'atendimento_humano'],
	
	proposta: ['analise_credito', 'negociacao', 'atendimento_humano'],
	
	analise_credito: ['documentacao', 'proposta', 'atendimento_humano'],
	
	documentacao: ['finalizacao', 'analise_credito', 'atendimento_humano'],
	
	finalizacao: ['atendimento_humano'], // Sucesso! Apenas pode solicitar atendimento
	
	atendimento_humano: [] // Estado final, corretor assume
};

/**
 * Regras de progressão automática de stages
 * Baseadas em critérios objetivos
 */
export const AUTO_PROGRESSION_RULES = {
	/**
	 * boas_vindas -> coleta_dados
	 * Quando: lead responde pela primeira vez
	 */
	boas_vindas: (lead, lastMessage) => {
		return 'coleta_dados';
	},
	
	/**
	 * coleta_dados -> matching OU aguardando_info
	 * Quando: dados suficientes OU sem resposta há 24h
	 */
	coleta_dados: (lead, lastMessage, messageCount) => {
		// Verificar se tem dados suficientes para matching
		const hasOrcamento = lead.orcamento_min || lead.orcamento_max;
		const hasLocation = lead.cidade || lead.bairro || lead.localizacao;
		const hasRooms = lead.quartos_min;
		
		if (hasOrcamento || hasLocation || hasRooms) {
			return 'matching';
		}
		
		// Se já teve várias mensagens mas ainda não tem dados
		if (messageCount > 5) {
			return 'aguardando_info';
		}
		
		return null; // Continua em coleta_dados
	},
	
	/**
	 * aguardando_info -> coleta_dados
	 * Quando: lead volta a responder
	 */
	aguardando_info: (lead, lastMessage) => {
		if (lastMessage && lastMessage.direction === 'incoming') {
			return 'coleta_dados';
		}
		return null;
	},
	
	/**
	 * matching -> apresentacao OU sem_match
	 * Quando: matching executado com resultados
	 */
	matching: (lead, lastMessage, messageCount, matchedProperties) => {
		// Esta lógica é executada após o matching
		if (matchedProperties && matchedProperties.length > 0) {
			return 'apresentacao';
		} else {
			return 'sem_match';
		}
	},
	
	/**
	 * apresentacao -> interesse OU refinamento
	 * Baseado em keywords na resposta do lead
	 */
	apresentacao: (lead, lastMessage) => {
		if (!lastMessage || lastMessage.direction !== 'incoming') return null;
		
		const content = lastMessage.content?.toLowerCase() || '';
		
		// Keywords de interesse
		const interesseKeywords = [
			'gostei', 'interessante', 'quero', 'agendar', 'visitar',
			'mais informações', 'me interessa', 'parece bom',
			'quero ver', 'quero conhecer', 'aceito'
		];
		
		// Keywords de refinamento
		const refinamentoKeywords = [
			'outro', 'diferente', 'mais barato', 'mais caro',
			'outra região', 'outro bairro', 'mais quartos',
			'maior', 'menor', 'não gostei'
		];
		
		if (interesseKeywords.some(kw => content.includes(kw))) {
			return 'interesse';
		}
		
		if (refinamentoKeywords.some(kw => content.includes(kw))) {
			return 'refinamento';
		}
		
		return null;
	},
	
	/**
	 * sem_match -> refinamento
	 * Quando: lead responde querendo refinar
	 */
	sem_match: (lead, lastMessage) => {
		if (!lastMessage || lastMessage.direction !== 'incoming') return null;
		
		const content = lastMessage.content?.toLowerCase() || '';
		const refinamentoKeywords = ['sim', 'quero', 'tentar', 'ok', 'pode ser'];
		
		if (refinamentoKeywords.some(kw => content.includes(kw))) {
			return 'refinamento';
		}
		
		return null;
	},
	
	/**
	 * refinamento -> matching
	 * Quando: lead forneceu novos critérios
	 */
	refinamento: (lead, lastMessage, messageCount, previousMessageCount) => {
		// Se teve nova mensagem, tentar matching novamente
		if (messageCount > previousMessageCount) {
			return 'matching';
		}
		return null;
	}
};

/**
 * Valida se uma transição de stage é permitida
 * @param {string} currentStage - Stage atual
 * @param {string} targetStage - Stage desejado
 * @returns {boolean} - Se a transição é válida
 */
export function isValidTransition(currentStage, targetStage) {
	if (!currentStage || !targetStage) return false;
	
	const allowedTransitions = STAGE_TRANSITIONS[currentStage];
	if (!allowedTransitions) return false;
	
	return allowedTransitions.includes(targetStage);
}

/**
 * Calcula o próximo stage baseado nas regras de progressão automática
 * @param {string} currentStage - Stage atual
 * @param {object} lead - Dados do lead
 * @param {object} lastMessage - Última mensagem
 * @param {number} messageCount - Total de mensagens
 * @param {array} matchedProperties - Imóveis encontrados (opcional)
 * @returns {string|null} - Próximo stage ou null se não deve mudar
 */
export function calculateNextStage(currentStage, lead, lastMessage, messageCount, matchedProperties = null) {
	const rule = AUTO_PROGRESSION_RULES[currentStage];
	
	if (!rule) return null;
	
	// Executar regra
	const nextStage = rule(lead, lastMessage, messageCount, matchedProperties);
	
	// Validar transição
	if (nextStage && isValidTransition(currentStage, nextStage)) {
		return nextStage;
	}
	
	return null;
}

/**
 * Retorna informações completas de um stage
 * @param {string} stageKey - Chave do stage
 * @returns {object|null} - Dados do stage
 */
export function getStageInfo(stageKey) {
	return Object.values(STAGES).find(s => s.key === stageKey) || null;
}

/**
 * Retorna lista de todos os stages ordenados
 * @returns {array} - Array de stages
 */
export function getAllStages() {
	return Object.values(STAGES).sort((a, b) => a.order - b.order);
}

/**
 * Verifica se um stage permite progressão automática
 * @param {string} stageKey - Chave do stage
 * @returns {boolean}
 */
export function isAutomatedStage(stageKey) {
	const stage = getStageInfo(stageKey);
	return stage?.automated || false;
}

/**
 * Detecta se lead solicitou atendimento humano
 * @param {string} message - Conteúdo da mensagem
 * @returns {boolean}
 */
export function detectHumanRequestKeywords(message) {
	if (!message) return false;
	
	const content = message.toLowerCase();
	const keywords = [
		'falar com', 'atendente', 'corretor', 'humano', 'pessoa',
		'gerente', 'responsável', 'alguém', 'ligar',
		'telefone de contato', 'whatsapp de', 'não consigo',
		'não está entendendo', 'quero falar'
	];
	
	return keywords.some(kw => content.includes(kw));
}

/**
 * Obtém mensagem padrão para cada stage (para log/notificação)
 * @param {string} stageKey - Chave do stage
 * @returns {string}
 */
export function getStageMessage(stageKey) {
	const messages = {
		boas_vindas: '👋 Boas-vindas enviadas',
		coleta_dados: '📝 Coletando informações do cliente',
		aguardando_info: '⏳ Aguardando resposta do cliente',
		matching: '🔍 Buscando imóveis compatíveis',
		apresentacao: '🏠 Imóveis apresentados',
		interesse: '✨ Cliente demonstrou interesse!',
		refinamento: '🔧 Refinando critérios de busca',
		sem_match: '❌ Sem imóveis compatíveis no momento',
		agendamento: '📅 Agendando visita',
		visita_agendada: '✅ Visita confirmada',
		pos_visita: '🔍 Feedback pós-visita',
		negociacao: '💰 Negociando proposta',
		proposta: '📄 Proposta enviada',
		analise_credito: '💳 Análise de crédito em andamento',
		documentacao: '📋 Coletando documentação',
		finalizacao: '🎉 Fechamento em andamento!',
		atendimento_humano: '👤 Transferido para corretor'
	};
	
	return messages[stageKey] || `Stage: ${stageKey}`;
}

/**
 * Calcula % de progresso no funil baseado no stage
 * @param {string} stageKey - Chave do stage
 * @returns {number} - Percentual de 0 a 100
 */
export function calculateFunnelProgress(stageKey) {
	const stage = getStageInfo(stageKey);
	if (!stage) return 0;
	
	// Stages finais valem mais
	const progressMap = {
		boas_vindas: 5,
		coleta_dados: 10,
		aguardando_info: 8,
		matching: 15,
		apresentacao: 25,
		interesse: 40,
		refinamento: 20,
		sem_match: 5,
		agendamento: 50,
		visita_agendada: 60,
		pos_visita: 65,
		negociacao: 75,
		proposta: 85,
		analise_credito: 90,
		documentacao: 95,
		finalizacao: 100,
		atendimento_humano: 30 // Variável, depende do estágio anterior
	};
	
	return progressMap[stageKey] || 0;
}
