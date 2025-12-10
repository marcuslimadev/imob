import OpenAI from 'openai';

export interface LeadDiagnosticInput {
  lead: any;
  conversationHistory: string;
  properties: any[];
}

export interface LeadDiagnosticResult {
  success: boolean;
  content?: string;
  error?: string;
}

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  /**
   * Gerar diagnóstico inteligente do lead
   * Analisa histórico de conversas e preferências para criar perfil completo
   */
  async generateLeadDiagnostic(
    input: LeadDiagnosticInput
  ): Promise<LeadDiagnosticResult> {
    try {
      const { lead, conversationHistory, properties } = input;

      const systemPrompt = `Você é um assistente especializado em análise de leads imobiliários.

Sua tarefa é analisar as informações do lead e criar um diagnóstico completo e estruturado.

INFORMAÇÕES DO LEAD:
- Nome: ${lead.name || 'Não informado'}
- Email: ${lead.email || 'Não informado'}
- Telefone: ${lead.phone || 'Não informado'}
- Orçamento: ${lead.budget_min ? `R$ ${lead.budget_min}` : 'Min não informado'} - ${lead.budget_max ? `R$ ${lead.budget_max}` : 'Max não informado'}
- Localização preferida: ${lead.preferred_neighborhoods?.join(', ') || 'Não informado'}
- Quartos: ${lead.bedrooms_min || 'Não especificado'}
- Tipo de imóvel: ${lead.property_types?.join(', ') || 'Qualquer'}
- Fonte do lead: ${lead.lead_source || 'Não informado'}
- Pontuação: ${lead.lead_score || 0}/100

HISTÓRICO DE CONVERSAS:
${conversationHistory || 'Sem histórico de conversas'}

IMÓVEIS COMPATÍVEIS ENCONTRADOS:
${properties.length > 0 ? properties.map((p, i) => `${i + 1}. ${p.tipo} - ${p.bairro}, ${p.cidade} - R$ ${p.valor}`).join('\n') : 'Nenhum imóvel compatível encontrado'}

INSTRUÇÕES:
1. Analise o perfil do lead considerando todos os dados disponíveis
2. Identifique padrões nas conversas (se houver)
3. Avalie a qualificação do lead (quente, morno, frio)
4. Sugira próximas ações para o corretor
5. Destaque pontos de atenção

FORMATO DE RESPOSTA (use Markdown):

## 📊 Perfil do Lead
[Resumo em 2-3 linhas sobre o lead]

## 🎯 Qualificação
**Status:** [Quente/Morno/Frio]
**Probabilidade de conversão:** [Alta/Média/Baixa]
**Justificativa:** [Explique brevemente]

## 💡 Insights da Conversa
[Liste os principais insights extraídos das conversas]

## 🏠 Compatibilidade de Imóveis
[Analise os imóveis encontrados e comente sobre a compatibilidade]

## ✅ Próximas Ações Recomendadas
1. [Ação 1]
2. [Ação 2]
3. [Ação 3]

## ⚠️ Pontos de Atenção
[Liste possíveis objeções ou dificuldades]`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: 'Gere o diagnóstico completo deste lead.',
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        return {
          success: false,
          error: 'Resposta vazia da IA',
        };
      }

      return {
        success: true,
        content,
      };
    } catch (error: any) {
      console.error('Erro ao gerar diagnóstico IA:', error);
      
return {
        success: false,
        error: error.message || 'Erro desconhecido',
      };
    }
  }

  /**
   * Transcrever áudio usando Whisper
   */
  async transcribeAudio(audioUrl: string): Promise<string | null> {
    try {
      // Baixar o áudio
      const response = await fetch(audioUrl);
      const audioBuffer = await response.arrayBuffer();
      const audioFile = new File([audioBuffer], 'audio.ogg', {
        type: 'audio/ogg',
      });

      // Transcrever com Whisper
      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'pt',
      });

      return transcription.text;
    } catch (error: any) {
      console.error('Erro ao transcrever áudio:', error);
      
return null;
    }
  }

  /**
   * Chat conversacional com contexto
   */
  async chat(messages: Array<{ role: string; content: string }>): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any,
        temperature: 0.8,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        return {
          success: false,
          error: 'Resposta vazia da IA',
        };
      }

      return {
        success: true,
        message: content,
      };
    } catch (error: any) {
      console.error('Erro no chat IA:', error);
      
return {
        success: false,
        error: error.message || 'Erro desconhecido',
      };
    }
  }

  /**
   * Extrair dados estruturados de mensagem de lead
   */
  async extractLeadData(message: string): Promise<{
    budget_min?: number;
    budget_max?: number;
    bedrooms?: number;
    location?: string;
    property_type?: string;
  }> {
    try {
      const systemPrompt = `Você extrai dados estruturados de mensagens de leads imobiliários.

Extraia as seguintes informações (se mencionadas):
- Orçamento (min e max)
- Número de quartos
- Localização desejada
- Tipo de imóvel

Retorne APENAS um JSON válido, sem texto adicional.

Exemplo:
{
  "budget_min": 300000,
  "budget_max": 500000,
  "bedrooms": 3,
  "location": "Savassi",
  "property_type": "apartment"
}`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        return {};
      }

      // Parsear JSON
      const data = JSON.parse(content);
      
return data;
    } catch (error: any) {
      console.error('Erro ao extrair dados:', error);
      
return {};
    }
  }
}
