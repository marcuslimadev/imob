'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Send, Phone, MoreVertical, Archive, Check, CheckCheck, Loader2, X } from 'lucide-react';
import { directusClient } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Conversa {
	id: string;
	lead_id: {
		nome: string;
		telefone: string;
	};
	stage: string;
	last_message: string;
	last_message_time: string;
	unread_count: number;
	archived: boolean;
}

interface Mensagem {
	id: string;
	direction: 'incoming' | 'outgoing';
	content: string;
	message_type: string;
	media_url?: string;
	status?: string;
	created_at: string;
	read_at?: string;
}

export default function ConversasPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [conversas, setConversas] = useState<Conversa[]>([]);
	const [selectedConversa, setSelectedConversa] = useState<Conversa | null>(null);
	const [mensagens, setMensagens] = useState<Mensagem[]>([]);
	const [newMessage, setNewMessage] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Redirect se não autenticado
	useEffect(() => {
		if (!authLoading && !user) {
			router.push('/login?redirect=/conversas');
		}
	}, [user, authLoading, router]);

	useEffect(() => {
		if (user?.company_id) {
			fetchConversas();
		}
	}, [user]);

	useEffect(() => {
		if (selectedConversa) {
			fetchMensagens(selectedConversa.id);
		}
	}, [selectedConversa]);

	const fetchConversas = async () => {
		if (!user?.company_id) return;

		try {
			setLoading(true);
			setError(null);

			// Buscar conversas da empresa
			const conversasData = await directusClient.request(
				readItems('conversas', {
					filter: {
						company_id: { _eq: user.company_id }
					},
					fields: [
						'id',
						'stage',
						'whatsapp_name',
						'telefone',
						'archived',
						'updated_at',
						{ lead_id: ['id', 'name', 'phone'] }
					],
					sort: ['-updated_at'],
					limit: -1
				})
			);

			// Buscar última mensagem de cada conversa
			const conversasComMensagens = await Promise.all(
				conversasData.map(async (conv: any) => {
					try {
						const lastMessages = await directusClient.request(
							readItems('mensagens', {
								filter: {
									conversa_id: { _eq: conv.id }
								},
								fields: ['content', 'created_at', 'direction', 'read_at'],
								sort: ['-created_at'],
								limit: 1
							})
						);

						const lastMsg = lastMessages[0];
						
						// Contar mensagens não lidas (incoming e sem read_at)
						const unreadMessages = await directusClient.request(
							readItems('mensagens', {
								filter: {
									conversa_id: { _eq: conv.id },
									direction: { _eq: 'incoming' },
									read_at: { _null: true }
								},
								aggregate: { count: '*' }
							})
						);

						return {
							id: conv.id,
							lead_id: {
								nome: conv.lead_id?.name || conv.whatsapp_name || 'Sem nome',
								telefone: conv.telefone
							},
							stage: conv.stage || 'novo',
							last_message: lastMsg?.content || 'Sem mensagens',
							last_message_time: formatTime(lastMsg?.created_at || conv.updated_at),
							unread_count: unreadMessages.length > 0 ? unreadMessages[0].count.id : 0,
							archived: conv.archived || false
						};
					} catch (err) {
						console.error('Erro ao processar conversa:', err);
						return null;
					}
				})
			);

			setConversas(conversasComMensagens.filter(c => c !== null) as Conversa[]);
		} catch (error) {
			console.error('Erro ao carregar conversas:', error);
			setError('Erro ao carregar conversas. Tente novamente.');
		} finally {
			setLoading(false);
		}
	};

	const fetchMensagens = async (conversaId: string) => {
		try {
			const mensagensData = await directusClient.request(
				readItems('mensagens', {
					filter: {
						conversa_id: { _eq: conversaId }
					},
					fields: [
						'id',
						'direction',
						'content',
						'message_type',
						'media_url',
						'status',
						'created_at',
						'read_at'
					],
					sort: ['created_at'],
					limit: -1
				})
			);

			setMensagens(mensagensData as Mensagem[]);

			// Marcar mensagens incoming como lidas
			const unreadIncoming = mensagensData.filter(
				(msg: any) => msg.direction === 'incoming' && !msg.read_at
			);

			if (unreadIncoming.length > 0) {
				// TODO: Implementar update batch para marcar como lido
				console.log('Mensagens a marcar como lidas:', unreadIncoming.length);
			}
		} catch (error) {
			console.error('Erro ao carregar mensagens:', error);
		}
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
		} else if (diffDays === 1) {
			return 'Ontem';
		} else if (diffDays < 7) {
			return `${diffDays} dias atrás`;
		} else {
			return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
		}
	};

	const sendMessage = async () => {
		if (!newMessage.trim() || !selectedConversa) return;

		try {
			// TODO: Chamar endpoint /twilio/send-message
			const novaMensagem: Mensagem = {
				id: Date.now().toString(),
				direction: 'outgoing',
				content: newMessage,
				message_type: 'text',
				status: 'sent',
				created_at: new Date().toISOString()
			};

			setMensagens([...mensagens, novaMensagem]);
			setNewMessage('');

			// Scroll para o final
			setTimeout(() => {
				const chat = document.getElementById('chat-messages');
				if (chat) chat.scrollTop = chat.scrollHeight;
			}, 100);

		} catch (error) {
			console.error('Erro ao enviar mensagem:', error);
		}
	};

	const getStageColor = (stage: string) => {
		const colors: Record<string, string> = {
			boas_vindas: 'bg-blue-100 text-blue-700',
			coleta_dados: 'bg-purple-100 text-purple-700',
			matching: 'bg-green-100 text-green-700',
			apresentacao: 'bg-cyan-100 text-cyan-700',
			interesse: 'bg-teal-100 text-teal-700',
			agendamento: 'bg-orange-100 text-orange-700',
			negociacao: 'bg-yellow-100 text-yellow-700',
			atendimento_humano: 'bg-pink-100 text-pink-700'
		};
		return colors[stage] || 'bg-gray-100 text-gray-700';
	};

	const getStageLabel = (stage: string) => {
		const labels: Record<string, string> = {
			boas_vindas: 'Boas-vindas',
			coleta_dados: 'Coleta',
			matching: 'Matching',
			apresentacao: 'Apresentação',
			interesse: 'Interesse',
			agendamento: 'Agendamento',
			negociacao: 'Negociação',
			atendimento_humano: 'Humano'
		};
		return labels[stage] || stage;
	};

	const filteredConversas = conversas.filter(conv =>
		conv.lead_id.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
		conv.lead_id.telefone.includes(searchTerm)
	);

	// Loading State
	if (authLoading || loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
					<p className="text-gray-600">Carregando conversas...</p>
				</div>
			</div>
		);
	}

	// Error State
	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card className="max-w-md border-destructive">
					<div className="p-6">
						<div className="flex items-center gap-2 text-destructive mb-2">
							<X className="h-5 w-5" />
							<p className="font-semibold">Erro ao carregar conversas</p>
						</div>
						<p className="text-sm text-muted-foreground mb-4">{error}</p>
						<Button onClick={() => window.location.reload()} variant="outline">
							Tentar Novamente
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar - Lista de Conversas */}
			<div className="w-96 bg-white border-r border-gray-200 flex flex-col">
				{/* Header */}
				<div className="p-4 bg-gray-50 border-b border-gray-200">
					<h1 className="text-xl font-bold text-gray-900 mb-3">Conversas</h1>
					<div className="relative">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
						<Input
							type="text"
							placeholder="Buscar conversas..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>

				{/* Lista de Conversas */}
				<div className="flex-1 overflow-y-auto">
					{filteredConversas.map((conversa) => (
						<div
							key={conversa.id}
							onClick={() => setSelectedConversa(conversa)}
							className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
								selectedConversa?.id === conversa.id
									? 'bg-blue-50 border-l-4 border-l-blue-600'
									: 'hover:bg-gray-50'
							}`}
						>
							<div className="flex items-start justify-between mb-1">
								<h3 className="font-semibold text-gray-900">{conversa.lead_id.nome}</h3>
								<span className="text-xs text-gray-500">{conversa.last_message_time}</span>
							</div>
							<div className="flex items-center justify-between">
								<p className="text-sm text-gray-600 truncate flex-1 mr-2">
									{conversa.last_message}
								</p>
								{conversa.unread_count > 0 && (
									<Badge className="bg-blue-600 text-white text-xs">
										{conversa.unread_count}
									</Badge>
								)}
							</div>
							<div className="mt-2">
								<Badge className={`text-xs ${getStageColor(conversa.stage)}`}>
									{getStageLabel(conversa.stage)}
								</Badge>
							</div>
						</div>
					))}

					{filteredConversas.length === 0 && (
						<div className="text-center text-gray-500 py-8">
							<p>Nenhuma conversa encontrada</p>
						</div>
					)}
				</div>
			</div>

			{/* Área de Chat */}
			{selectedConversa ? (
				<div className="flex-1 flex flex-col bg-gray-50">
					{/* Header do Chat */}
					<div className="bg-white border-b border-gray-200 p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
									{selectedConversa.lead_id.nome.charAt(0).toUpperCase()}
								</div>
								<div>
									<h2 className="font-semibold text-gray-900">
										{selectedConversa.lead_id.nome}
									</h2>
									<p className="text-xs text-gray-500">
										{selectedConversa.lead_id.telefone}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="ghost" size="icon">
									<Phone className="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="icon">
									<Archive className="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="icon">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					{/* Mensagens */}
					<div 
						id="chat-messages"
						className="flex-1 overflow-y-auto p-4 space-y-4"
						style={{ 
							backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23f3f4f6\'/%3E%3Cpath d=\'M20 20l60 60M80 20L20 80\' stroke=\'%23e5e7eb\' stroke-width=\'0.5\' opacity=\'0.2\'/%3E%3C/svg%3E")',
							backgroundSize: '100px 100px'
						}}
					>
						{mensagens.map((mensagem) => (
							<div
								key={mensagem.id}
								className={`flex ${
									mensagem.direction === 'outgoing' ? 'justify-end' : 'justify-start'
								}`}
							>
								<div
									className={`max-w-[70%] rounded-lg p-3 ${
										mensagem.direction === 'outgoing'
											? 'bg-blue-600 text-white'
											: 'bg-white text-gray-900 border border-gray-200'
									}`}
								>
									<p className="text-sm whitespace-pre-wrap">{mensagem.content}</p>
									<div className="flex items-center justify-end gap-1 mt-1">
										<span className={`text-xs ${
											mensagem.direction === 'outgoing' 
												? 'text-blue-100' 
												: 'text-gray-500'
										}`}>
											{formatTime(mensagem.created_at)}
										</span>
										{mensagem.direction === 'outgoing' && (
											mensagem.status === 'read' ? (
												<CheckCheck className="h-3 w-3 text-blue-100" />
											) : (
												<Check className="h-3 w-3 text-blue-100" />
											)
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Input de Mensagem */}
					<div className="bg-white border-t border-gray-200 p-4">
						<div className="flex items-center gap-2">
							<Input
								type="text"
								placeholder="Digite uma mensagem..."
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										sendMessage();
									}
								}}
								className="flex-1"
							/>
							<Button 
								onClick={sendMessage}
								disabled={!newMessage.trim()}
								className="bg-blue-600 hover:bg-blue-700"
							>
								<Send className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center bg-gray-50">
					<div className="text-center text-gray-500">
						<MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
						<p className="text-lg font-medium">Selecione uma conversa</p>
						<p className="text-sm">Escolha uma conversa à esquerda para começar</p>
					</div>
				</div>
			)}
		</div>
	);
}
