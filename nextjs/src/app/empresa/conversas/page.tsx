'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Search, 
  Phone, 
  Clock, 
  User,
  Send,
  Loader2,
  Filter,
  MoreVertical,
  Check,
  CheckCheck
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { directusClient } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';
import { cn } from '@/lib/utils';

interface Conversa {
  id: string;
  status: string;
  phone_number?: string;
  last_message_content?: string;
  last_message_at?: string;
  unread_count?: number;
  date_created?: string;
  lead?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

interface Mensagem {
  id: string;
  content?: string;
  direction: 'inbound' | 'outbound';
  status?: string;
  date_created?: string;
}

export default function ConversasPage() {
  const { user, loading: authLoading } = useAuth();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [selectedConversa, setSelectedConversa] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchConversas = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      const data = await directusClient.request(
        readItems('conversas', {
          filter: { company_id: { _eq: user.company_id } },
          fields: [
            '*',
            { lead: ['id', 'name', 'phone', 'email'] },
          ],
          sort: ['-last_message_at'],
          limit: 50,
        })
      );

      setConversas(data as unknown as Conversa[]);
    } catch (err) {
      console.error('Erro ao buscar conversas:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.company_id]);

  const fetchMensagens = useCallback(async (conversaId: string) => {
    try {
      setLoadingMessages(true);

      const data = await directusClient.request(
        readItems('mensagens', {
          filter: { conversa_id: { _eq: conversaId } },
          sort: ['date_created'],
          limit: 100,
        })
      );

      setMensagens(data as unknown as Mensagem[]);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (user?.company_id) {
      fetchConversas();
    }
  }, [user?.company_id, fetchConversas]);

  useEffect(() => {
    if (selectedConversa) {
      fetchMensagens(selectedConversa.id);
    }
  }, [selectedConversa, fetchMensagens]);

  const filteredConversas = conversas.filter(c => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      c.lead_id?.name?.toLowerCase().includes(search) ||
      c.whatsapp_number?.includes(search)
    );
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversa) return;
    
    setSending(true);
    // TODO: Implementar envio via API
    setTimeout(() => {
      setSending(false);
      setNewMessage('');
    }, 1000);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Hoje';
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversas</h1>
          <p className="text-gray-500">Gerencie suas conversas do WhatsApp</p>
        </div>
      </div>

      <div className="flex h-[calc(100%-5rem)] bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Lista de conversas */}
        <div className="w-96 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar conversa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : filteredConversas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <MessageSquare className="h-8 w-8 mb-2" />
                <p>Nenhuma conversa encontrada</p>
              </div>
            ) : (
              filteredConversas.map((conversa) => (
                <button
                  key={conversa.id}
                  onClick={() => setSelectedConversa(conversa)}
                  className={cn(
                    'w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors',
                    selectedConversa?.id === conversa.id && 'bg-blue-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {conversa.lead_id?.name || conversa.whatsapp_number}
                        </p>
                        <span className="text-xs text-gray-500">
                          {conversa.last_message_at && formatDate(conversa.last_message_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {conversa.last_message || 'Sem mensagens'}
                      </p>
                      {conversa.unread_count > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-500 rounded-full mt-1">
                          {conversa.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col">
          {selectedConversa ? (
            <>
              {/* Header do chat */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedConversa.lead_id?.name || selectedConversa.whatsapp_number}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedConversa.whatsapp_number}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : mensagens.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <p>Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  mensagens.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'max-w-[70%] p-3 rounded-lg',
                        msg.direction === 'outgoing'
                          ? 'ml-auto bg-green-500 text-white'
                          : 'bg-white border border-gray-200'
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className={cn(
                        'flex items-center justify-end gap-1 mt-1',
                        msg.direction === 'outgoing' ? 'text-green-100' : 'text-gray-400'
                      )}>
                        <span className="text-xs">{formatTime(msg.date_created)}</span>
                        {msg.direction === 'outgoing' && (
                          msg.status === 'read' ? (
                            <CheckCheck className="w-4 h-4" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input de mensagem */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Selecione uma conversa</p>
                <p className="text-sm">Escolha uma conversa para ver as mensagens</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
