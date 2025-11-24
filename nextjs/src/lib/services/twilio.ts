import twilio from 'twilio';

export class TwilioService {
  private client: any;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
  }

  /**
   * Enviar mensagem de texto via WhatsApp
   */
  async sendMessage(to: string, body: string): Promise<{
    success: boolean;
    messageSid?: string;
    error?: string;
  }> {
    try {
      // Formatar número para WhatsApp (whatsapp:+5531...)
      const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const fromWhatsApp = this.fromNumber.startsWith('whatsapp:')
        ? this.fromNumber
        : `whatsapp:${this.fromNumber}`;

      const message = await this.client.messages.create({
        body,
        from: fromWhatsApp,
        to: toWhatsApp,
      });

      return {
        success: true,
        messageSid: message.sid,
      };
    } catch (error: any) {
      console.error('Erro ao enviar mensagem Twilio:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido',
      };
    }
  }

  /**
   * Enviar mensagem com mídia (imagem, documento, etc)
   */
  async sendMediaMessage(
    to: string,
    body: string,
    mediaUrl: string
  ): Promise<{
    success: boolean;
    messageSid?: string;
    error?: string;
  }> {
    try {
      const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const fromWhatsApp = this.fromNumber.startsWith('whatsapp:')
        ? this.fromNumber
        : `whatsapp:${this.fromNumber}`;

      const message = await this.client.messages.create({
        body,
        from: fromWhatsApp,
        to: toWhatsApp,
        mediaUrl: [mediaUrl],
      });

      return {
        success: true,
        messageSid: message.sid,
      };
    } catch (error: any) {
      console.error('Erro ao enviar mensagem com mídia:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido',
      };
    }
  }

  /**
   * Enviar template message (para mensagens fora da janela de 24h)
   */
  async sendTemplateMessage(
    to: string,
    templateSid: string,
    contentVariables: Record<string, string>
  ): Promise<{
    success: boolean;
    messageSid?: string;
    error?: string;
  }> {
    try {
      const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const fromWhatsApp = this.fromNumber.startsWith('whatsapp:')
        ? this.fromNumber
        : `whatsapp:${this.fromNumber}`;

      const message = await this.client.messages.create({
        from: fromWhatsApp,
        to: toWhatsApp,
        contentSid: templateSid,
        contentVariables: JSON.stringify(contentVariables),
      });

      return {
        success: true,
        messageSid: message.sid,
      };
    } catch (error: any) {
      console.error('Erro ao enviar template message:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido',
      };
    }
  }

  /**
   * Buscar status de mensagem
   */
  async getMessageStatus(messageSid: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      const message = await this.client.messages(messageSid).fetch();

      return {
        success: true,
        status: message.status,
      };
    } catch (error: any) {
      console.error('Erro ao buscar status da mensagem:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido',
      };
    }
  }
}
