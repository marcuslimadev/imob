/**
 * Directus Extension: OpenAI Service
 * Migrado de: backend/app/Services/OpenAIService.php
 * 
 * Endpoints disponíveis:
 * - POST /openai/transcribe - Transcrever áudio (Whisper)
 * - POST /openai/chat - Chat completion (GPT-4o-mini)
 * - POST /openai/extract - Extrair dados estruturados
 * - POST /openai/diagnostic - Gerar diagnóstico de lead
 */

import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';

export default (router, { env, logger }) => {
	const OPENAI_API_KEY = env.OPENAI_API_KEY;
	const OPENAI_MODEL = env.OPENAI_MODEL || 'gpt-4o-mini';
	const AI_ASSISTANT_NAME = env.AI_ASSISTANT_NAME || 'Teresa';

	/**
	 * POST /openai/transcribe
	 * Transcrever áudio usando Whisper API
	 * 
	 * Body: { audioPath: string } ou FormData com file
	 */
	router.post('/transcribe', async (req, res) => {
		try {
			const { audioPath } = req.body;

			if (!audioPath && !req.files?.file) {
				return res.status(400).json({
					success: false,
					error: 'audioPath ou file é obrigatório'
				});
			}

			logger.info('🎤 Iniciando transcrição Whisper', { audioPath });

			const formData = new FormData();
			
			if (req.files?.file) {
				// Arquivo enviado via multipart
				formData.append('file', req.files.file.data, {
					filename: req.files.file.name,
					contentType: req.files.file.mimetype
				});
			} else {
				// Arquivo no sistema de arquivos
				formData.append('file', fs.createReadStream(audioPath));
			}

			formData.append('model', 'whisper-1');
			formData.append('language', 'pt');

			const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${OPENAI_API_KEY}`,
					...formData.getHeaders()
				},
				body: formData
			});

			const data = await response.json();

			if (response.status === 200) {
				logger.info('✅ Transcrição bem-sucedida', {
					text: data.text,
					length: data.text.length
				});

				return res.json({
					success: true,
					text: data.text
				});
			}

			logger.error('❌ Falha na transcrição', {
				status: response.status,
				data
			});

			return res.status(response.status).json({
				success: false,
				error: 'Transcription failed',
				details: data
			});

		} catch (error) {
			logger.error('❌ Erro ao transcrever áudio', {
				error: error.message,
				stack: error.stack
			});

			return res.status(500).json({
				success: false,
				error: error.message
			});
		}
	});

	/**
	 * POST /openai/chat
	 * Chat completion com GPT
	 * 
	 * Body: {
	 *   systemPrompt: string,
	 *   userPrompt: string,
	 *   temperature?: number,
	 *   maxTokens?: number
	 * }
	 */
	router.post('/chat', async (req, res) => {
		try {
			const {
				systemPrompt,
				userPrompt,
				temperature = 0.7,
				maxTokens = 500
			} = req.body;

			if (!systemPrompt || !userPrompt) {
				return res.status(400).json({
					success: false,
					error: 'systemPrompt e userPrompt são obrigatórios'
				});
			}

			logger.info('🤖 Chat completion solicitado', {
				systemPromptLength: systemPrompt.length,
				userPromptLength: userPrompt.length
			});

			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${OPENAI_API_KEY}`
				},
				body: JSON.stringify({
					model: OPENAI_MODEL,
					messages: [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: userPrompt }
					],
					temperature,
					max_tokens: maxTokens
				})
			});

			const data = await response.json();

			if (response.status === 200) {
				const content = data.choices[0]?.message?.content || '';

				logger.info('✅ Chat completion bem-sucedido', {
					contentLength: content.length
				});

				return res.json({
					success: true,
					content: content.trim()
				});
			}

			logger.error('❌ Falha no chat completion', {
				status: response.status,
				data
			});

			return res.status(response.status).json({
				success: false,
				error: 'Chat completion failed',
				details: data
			});

		} catch (error) {
			logger.error('❌ Erro no chat completion', {
				error: error.message,
				stack: error.stack
			});

			return res.status(500).json({
				success: false,
				error: error.message
			});
		}
	});

	/**
	 * POST /openai/extract
	 * Extrair dados estruturados do lead
	 * 
	 * Body: { conversationHistory: string }
	 */
	router.post('/extract', async (req, res) => {
		try {
			const { conversationHistory } = req.body;

			if (!conversationHistory) {
				return res.status(400).json({
					success: false,
					error: 'conversationHistory é obrigatório'
				});
			}

			logger.info('📊 Extração de dados solicitada');

			const systemPrompt = `Você é um analista que lê conversas de atendimento imobiliário e transforma tudo em dados estruturados.

⚠️ FOQUE NAS ÚLTIMAS MENSAGENS - elas têm PRIORIDADE TOTAL!

Extraia SEMPRE um JSON com as seguintes chaves (use null se não houver dado):
{
  "budget_min": número (apenas dígitos, sem formatação),
  "budget_max": número (apenas dígitos, sem formatação),
  "localizacao": string (bairro ou região mencionada),
  "quartos": número inteiro,
  "suites": número inteiro,
  "garagem": número inteiro,
  "caracteristicas_desejadas": string,
  "cpf": CPF apenas com 11 dígitos (sem pontos ou traços),
  "renda_mensal": número (apenas dígitos, sem formatação),
  "estado_civil": string,
  "composicao_familiar": string,
  "profissao": string,
  "fonte_renda": string,
  "financiamento_status": string,
  "prazo_compra": string,
  "objetivo_compra": string,
  "preferencia_tipo_imovel": string,
  "preferencia_bairro": string,
  "preferencia_lazer": string,
  "preferencia_seguranca": string,
  "observacoes_cliente": string
}

⚠️ REGRAS CRÍTICAS:
1. Se houver múltiplos valores, SEMPRE escolha o MAIS RECENTE (última mensagem tem prioridade)
2. Extraia CPF mesmo sem formatação (ex: 91963214234)
3. Renda mensal: converta valores como "150000" ou "5 mil" para número puro
4. NÃO invente informações - retorne null se não tiver certeza
5. Retorne SOMENTE o JSON, sem texto adicional

Exemplos de extração:
- Cliente: "Meu CPF é 91963214234" → {"cpf": "91963214234"}
- Cliente: "150000" ou "minha renda mensal é de 150000" → {"renda_mensal": 150000}
- Cliente: "quero 3 quartos" → {"quartos": 3}`;

			const userPrompt = `Conversa:\n\n${conversationHistory}\n\nResponda apenas com o JSON solicitado. FOQUE NAS ÚLTIMAS MENSAGENS!`;

			const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${OPENAI_API_KEY}`
				},
				body: JSON.stringify({
					model: OPENAI_MODEL,
					messages: [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: userPrompt }
					],
					temperature: 0.7,
					max_tokens: 500
				})
			});

			const chatData = await chatResponse.json();

			if (chatResponse.status === 200) {
				const content = chatData.choices[0]?.message?.content || '';

				try {
					const extracted = JSON.parse(content);

					logger.info('✅ Dados extraídos com sucesso', {
						fieldsExtracted: Object.keys(extracted).filter(k => extracted[k] !== null)
					});

					return res.json({
						success: true,
						data: extracted
					});
				} catch (parseError) {
					logger.error('❌ Falha ao parsear JSON da resposta', {
						content
					});

					return res.status(422).json({
						success: false,
						error: 'Failed to parse JSON response',
						rawContent: content
					});
				}
			}

			logger.error('❌ Falha na extração de dados', {
				status: chatResponse.status,
				data: chatData
			});

			return res.status(chatResponse.status).json({
				success: false,
				error: 'Data extraction failed',
				details: chatData
			});

		} catch (error) {
			logger.error('❌ Erro ao extrair dados', {
				error: error.message,
				stack: error.stack
			});

			return res.status(500).json({
				success: false,
				error: error.message
			});
		}
	});

	/**
	 * POST /openai/diagnostic
	 * Gerar diagnóstico inteligente de lead
	 * 
	 * Body: {
	 *   leadProfile: object,
	 *   conversationHistory: string,
	 *   availableProperties: array
	 * }
	 */
	router.post('/diagnostic', async (req, res) => {
		try {
			const {
				leadProfile,
				conversationHistory,
				availableProperties = []
			} = req.body;

			if (!leadProfile || !conversationHistory) {
				return res.status(400).json({
					success: false,
					error: 'leadProfile e conversationHistory são obrigatórios'
				});
			}

			logger.info('🩺 Diagnóstico de lead solicitado', {
				leadId: leadProfile.id
			});

			const systemPrompt = `Você é um especialista imobiliário que prepara diagnósticos para corretores humanos.
Monte um relatório objetivo com os blocos: 
1. Perfil geral do cliente
2. Capacidade financeira (inclua renda, orçamento e viabilidade)
3. Preferências e gatilhos emocionais
4. Riscos e pontos de atenção
5. Sugestões de abordagem para o corretor.

Use apenas informações confirmadas. Se faltar algum dado relevante, sinalize como 'Pendentes'.`;

			const profileJson = JSON.stringify(leadProfile, null, 2);
			const propertiesJson = JSON.stringify(availableProperties, null, 2);

			const userPrompt = `DADOS DO LEAD:\n${profileJson}\n\nHISTÓRICO DA CONVERSA:\n${conversationHistory}\n\nIMÓVEIS INDICADOS:\n${propertiesJson}\n\nGere o diagnóstico conforme solicitado.`;

			const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${OPENAI_API_KEY}`
				},
				body: JSON.stringify({
					model: OPENAI_MODEL,
					messages: [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: userPrompt }
					],
					temperature: 0.7,
					max_tokens: 500
				})
			});

			const chatData = await chatResponse.json();

			if (chatResponse.status === 200) {
				const content = chatData.choices[0]?.message?.content || '';

				logger.info('✅ Diagnóstico gerado com sucesso', {
					contentLength: content.length
				});

				return res.json({
					success: true,
					content: content.trim()
				});
			}

			logger.error('❌ Falha ao gerar diagnóstico', {
				status: chatResponse.status,
				data: chatData
			});

			return res.status(chatResponse.status).json({
				success: false,
				error: 'Diagnostic generation failed',
				details: chatData
			});

		} catch (error) {
			logger.error('❌ Erro ao gerar diagnóstico', {
				error: error.message,
				stack: error.stack
			});

			return res.status(500).json({
				success: false,
				error: error.message
			});
		}
	});

	/**
	 * POST /openai/process-message
	 * Processar mensagem e gerar resposta contextual
	 * 
	 * Body: {
	 *   message: string,
	 *   context?: string,
	 *   isFromAudio?: boolean,
	 *   availableProperties?: array,
	 *   leadData?: object
	 * }
	 */
	router.post('/process-message', async (req, res) => {
		try {
			const {
				message,
				context = '',
				isFromAudio = false,
				availableProperties = [],
				leadData = null
			} = req.body;

			if (!message) {
				return res.status(400).json({
					success: false,
					error: 'message é obrigatório'
				});
			}

			logger.info('💬 Processando mensagem', {
				messageLength: message.length,
				isFromAudio,
				hasProperties: availableProperties.length > 0,
				hasLeadData: !!leadData
			});

			const audioInstruction = isFromAudio
				? "\n- O cliente acabou de enviar um ÁUDIO que foi transcrito. Responda de forma natural, mostrando que você OUVIU e ENTENDEU o que ele disse. Use expressões como 'Entendi!', 'Certo!', 'Perfeito!' para confirmar que você ouviu."
				: "";

			// Verificar dados faltantes do lead
			let dataCollectionContext = '';
			const dadosFaltantes = [];

			if (leadData) {
				// Prioridade 1: Dados cadastrais básicos
				if (!leadData.nome) dadosFaltantes.push('nome');
				if (!leadData.telefone) dadosFaltantes.push('telefone');
				if (!leadData.cpf) dadosFaltantes.push('CPF');
				if (!leadData.email) dadosFaltantes.push('email');

				// Prioridade 2: Dados financeiros
				if (!leadData.renda_mensal) dadosFaltantes.push('renda mensal');
				if (!leadData.budget_min) dadosFaltantes.push('orçamento mínimo');
				if (!leadData.budget_max) dadosFaltantes.push('orçamento máximo');

				// Prioridade 3: Dados pessoais
				if (!leadData.estado_civil) dadosFaltantes.push('estado civil');
				if (!leadData.composicao_familiar) dadosFaltantes.push('composição familiar');
				if (!leadData.profissao) dadosFaltantes.push('profissão');
				if (!leadData.fonte_renda) dadosFaltantes.push('fonte de renda');

				// Prioridade 4: Preferências de imóvel
				if (!leadData.localizacao) dadosFaltantes.push('localização desejada');
				if (!leadData.quartos) dadosFaltantes.push('quantidade de quartos');
				if (!leadData.objetivo_compra) dadosFaltantes.push('objetivo da compra');

				if (dadosFaltantes.length > 0) {
					dataCollectionContext = `\n\n⚠️ DADOS FALTANTES DO LEAD (pergunte de forma SUTIL):\n- ${dadosFaltantes.join('\n- ')}\n`;
					dataCollectionContext += `\n💡 Estratégia: Termine SEMPRE perguntando por UM dado faltante (escolha o mais importante).\n`;
				}
			}

			// Contexto de imóveis disponíveis
			let propertiesContext = '';
			if (availableProperties.length > 0) {
				propertiesContext = "\n\n=== IMÓVEIS DISPONÍVEIS NO BANCO DE DADOS (DADOS REAIS) ===\n";
				
				availableProperties.forEach(prop => {
					const totalQuartos = (prop.dormitorios || 0) + (prop.suites || 0);
					
					let imagens = prop.imagens;
					if (typeof imagens === 'string') {
						try {
							imagens = JSON.parse(imagens);
						} catch {
							imagens = null;
						}
					}

					let imageLinks = '';
					if (Array.isArray(imagens) && imagens.length > 0) {
						const validImages = imagens
							.map(img => typeof img === 'string' ? img : img?.url)
							.filter(Boolean)
							.slice(0, 5);
						
						if (validImages.length > 0) {
							imageLinks = validImages.join('\n  ');
						}
					}

					propertiesContext += `
📍 ${prop.codigo_imovel || 'S/N'} - ${prop.tipo_imovel || 'Imóvel'}
   Localização: ${prop.bairro || 'N/A'}, ${prop.cidade || 'N/A'}
   Valor: R$ ${prop.valor_venda ? prop.valor_venda.toLocaleString('pt-BR') : 'N/A'}
   Quartos: ${totalQuartos} (${prop.dormitorios || 0} dormitórios + ${prop.suites || 0} suítes)
   Descrição: ${prop.descricao || 'N/A'}${imageLinks ? `\n   Fotos:\n  ${imageLinks}` : ''}
`;
				});

				propertiesContext += "⚠️ IMPORTANTE: Quando o cliente pedir 'X quartos', considere o TOTAL (dormitórios + suítes)!\n";
				propertiesContext += "⚠️ FOTOS: Quando o cliente pedir fotos de um imóvel, ENVIE os links diretamente se disponíveis acima!\n";
			}

			const systemPrompt = `Você é ${AI_ASSISTANT_NAME}, atendente virtual da Exclusiva Lar Imóveis, uma imobiliária especializada.

Seu objetivo é:
- Se apresentar como ${AI_ASSISTANT_NAME} e confirmar como o cliente prefere ser chamado
- Ser cordial, profissional mas CASUAL e leve na conversa
- **COLETAR DADOS IMPORTANTES de forma PERSISTENTE mas GENTIL**
- SEMPRE terminar sua resposta perguntando por UM dado faltante (veja contexto abaixo)
- Quando o cliente fornecer CPF ou renda, AGRADEÇA e confirme que registrou
- Não fazer muitas perguntas de uma vez - 1 pergunta de dados por resposta
- Quando receber documentos, avisar que um corretor validará
- Manter tom conversacional e amigável${audioInstruction}
${propertiesContext}
${dataCollectionContext}

REGRAS CRÍTICAS:
- Respostas curtas e diretas (máximo 3 linhas)
- ⚠️ SEMPRE termine com uma pergunta sobre um dado faltante (CPF, renda, orçamento, localização ou quartos)
- ⚠️ Seja SUTIL: não diga "preciso" ou "é obrigatório", diga "pra te ajudar melhor" ou "só pra agilizar"
- ⚠️ NUNCA diga que não temos um imóvel sem CONSULTAR a lista acima
- ⚠️ Quando o cliente pedir X quartos, considere TOTAL (dormitórios + suítes)`;

			const userPrompt = (context ? `Contexto anterior:\n${context}\n\n` : "") + `Cliente: ${message}\n\nResponda:`;

			const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${OPENAI_API_KEY}`
				},
				body: JSON.stringify({
					model: OPENAI_MODEL,
					messages: [
						{ role: 'system', content: systemPrompt },
						{ role: 'user', content: userPrompt }
					],
					temperature: 0.7,
					max_tokens: 500
				})
			});

			const chatData = await chatResponse.json();

			if (chatResponse.status === 200) {
				const content = chatData.choices[0]?.message?.content || '';

				logger.info('✅ Mensagem processada com sucesso', {
					responseLength: content.length
				});

				return res.json({
					success: true,
					content: content.trim()
				});
			}

			logger.error('❌ Falha ao processar mensagem', {
				status: chatResponse.status,
				data: chatData
			});

			return res.status(chatResponse.status).json({
				success: false,
				error: 'Message processing failed',
				details: chatData
			});

		} catch (error) {
			logger.error('❌ Erro ao processar mensagem', {
				error: error.message,
				stack: error.stack
			});

			return res.status(500).json({
				success: false,
				error: error.message
			});
		}
	});
};
