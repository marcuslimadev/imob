'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Send, Phone, MoreVertical, Archive, Check, CheckCheck, Loader2, X, MessageSquare } from 'lucide-react';
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

        const unreadTotal = conversas.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
        const activePipelines = conversas.filter((conv) => conv.stage !== 'atendimento_humano').length;
        const humanTransfers = conversas.filter((conv) => conv.stage === 'atendimento_humano').length;

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
		<div className="relative min-h-screen px-4 py-8">
			<div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
				<div className="bauhaus-grid absolute inset-6 rounded-[32px] border-[3px] border-[var(--foreground-color)]" />
				<div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--accent-color)]/12 to-[var(--accent-color-light)]/10 mix-blend-multiply" />
			</div>

			<div className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
				<div className="bauhaus-card rounded-3xl p-8">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-3">
							<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Central de Conversas</p>
                                                    <h1 className="text-4xl font-black leading-tight">Desk de conversas — blocos sólidos, cores fortes e foco em velocidade.</h1>
							<p className="text-muted-foreground max-w-2xl">Monitore unread, transfira para humano e mantenha contexto visual com um layout modular.</p>
							<div className="flex flex-wrap gap-3">
								<span className="bauhaus-pill bg-[var(--accent-color)] text-white">Operação</span>
								<span className="bauhaus-pill bg-[var(--accent-color-soft)] text-black">IA ativa</span>
								<span className="bauhaus-pill bg-[var(--accent-color-light)] text-black">Escuta</span>
							</div>
						</div>
						<div className="grid grid-cols-1 gap-3">
							<div className="bauhaus-surface rounded-2xl p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Mensagens não lidas</p>
								<div className="flex items-baseline gap-2 mt-1">
									<span className="text-4xl font-black">{unreadTotal}</span>
									<span className="text-xs uppercase tracking-[0.18em] text-[var(--accent-color)]">pulse</span>
								</div>
							</div>
							<div className="bauhaus-surface rounded-2xl p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pipelines ativos</p>
								<div className="flex items-baseline gap-2 mt-1">
									<span className="text-3xl font-black">{activePipelines}</span>
									<span className="text-xs uppercase tracking-[0.18em] text-[var(--accent-color-soft)]">automação</span>
								</div>
							</div>
							<div className="bauhaus-surface rounded-2xl p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Transferidos para humano</p>
								<div className="flex items-baseline gap-2 mt-1">
									<span className="text-3xl font-black">{humanTransfers}</span>
									<span className="text-xs uppercase tracking-[0.18em] text-[var(--accent-color-light)]">prioridade</span>
								</div>
							</div>
					</div>
				</div>
			</div>

			<div className="bauhaus-card rounded-3xl p-8 grid grid-cols-2 gap-3">
				{["Boas-vindas", "Coleta", "Matching", "Apresentação"].map((label, index) => (
					<div key={label} className="bauhaus-stripe rounded-2xl bg-[var(--background-color-muted)] px-4 py-3 flex items-center justify-between">
						<span className="text-xs uppercase tracking-[0.2em] font-semibold">{label}</span>
						<span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stage {index + 1}</span>
					</div>
				))}
			</div>
		</div>

		<div className="grid gap-6 lg:grid-cols-[400px_1fr]">
			{/* Sidebar - Lista de Conversas */}
			<div className="bauhaus-card rounded-3xl border-[3px] border-[var(--foreground-color)] shadow-[10px_10px_0_#0c0c0c] flex flex-col">
				<div className="border-b border-[var(--foreground-color)] bg-[var(--accent-color)] text-white p-4">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-xs uppercase tracking-[0.2em]">Conversas</p>
							<p className="text-sm opacity-80">{filteredConversas.length} threads</p>
						</div>
						<div className="bauhaus-pill bg-white text-[var(--foreground-color)]">Inbox</div>
					</div>
					<div className="relative mt-3">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-white/70" />
						<Input
							type="text"
							placeholder="Buscar conversas..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9 border-2 border-[var(--foreground-color)] bg-white text-[var(--foreground-color)]"
						/>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto divide-y divide-[var(--foreground-color)]/10">
					{filteredConversas.map((conversa) => (
						<div
							key={conversa.id}
							onClick={() => setSelectedConversa(conversa)}
							className={`cursor-pointer p-4 transition-transform duration-150 ${selectedConversa?.id === conversa.id ? 'bg-[var(--background-color-muted)] border-l-4 border-[var(--accent-color)]' : 'hover:bg-white'}`}
						>
							<div className="flex items-start justify-between mb-1">
								<h3 className="font-semibold text-lg">{conversa.lead_id.nome}</h3>
								<span className="text-xs text-muted-foreground">{conversa.last_message_time}</span>
							</div>
							<div className="flex items-center justify-between gap-2">
								<p className="text-sm text-muted-foreground truncate flex-1">{conversa.last_message}</p>
								{conversa.unread_count > 0 && (
									<Badge className="border-[2px] border-[var(--foreground-color)] bg-[var(--accent-color)] text-white text-xs">
										{conversa.unread_count}
									</Badge>
								)}
							</div>
							<div className="mt-2 flex items-center gap-2">
								<Badge className={`border-2 ${getStageColor(conversa.stage)} uppercase tracking-[0.12em]`}>
									{getStageLabel(conversa.stage)}
								</Badge>
							</div>
						</div>
					))}

					{filteredConversas.length === 0 && (
						<div className="text-center text-muted-foreground py-8">
							<p>Nenhuma conversa encontrada</p>
						</div>
					)}
				</div>
			</div>

			{/* Área de Chat */}
			{selectedConversa ? (
				<div className="bauhaus-card rounded-3xl flex flex-col border-[3px] border-[var(--foreground-color)] shadow-[12px_12px_0_#0c0c0c]">
					<div className="border-b border-[var(--foreground-color)] bg-[var(--background-color-muted)] p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white font-black">
									{selectedConversa.lead_id.nome.charAt(0).toUpperCase()}
								</div>
								<div>
									<h2 className="font-semibold text-xl">{selectedConversa.lead_id.nome}</h2>
									<p className="text-xs text-muted-foreground">{selectedConversa.lead_id.telefone}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="ghost" size="icon" className="border-2 border-[var(--foreground-color)] rounded-full">
									<Phone className="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="icon" className="border-2 border-[var(--foreground-color)] rounded-full">
									<Archive className="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="icon" className="border-2 border-[var(--foreground-color)] rounded-full">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					<div
						id="chat-messages"
						className="flex-1 overflow-y-auto p-6 space-y-4 bg-white"
						style={{
							backgroundImage: 'repeating-linear-gradient(90deg, rgba(12,12,12,0.04) 0, rgba(12,12,12,0.04) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(0deg, rgba(12,12,12,0.04) 0, rgba(12,12,12,0.04) 1px, transparent 1px, transparent 16px)'
						}}
					>
						{mensagens.map((mensagem) => (
							<div
								key={mensagem.id}
								className={`flex ${mensagem.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
							>
								<div
									className={`max-w-[70%] rounded-2xl border-[3px] p-3 ${
										mensagem.direction === 'outgoing'
											? 'bg-[var(--accent-color)] text-white border-[var(--foreground-color)] shadow-[6px_6px_0_#0c0c0c]'
											: 'bg-[var(--background-color-muted)] text-[var(--foreground-color)] border-[var(--foreground-color)]/70'
									}`}
								>
									<p className="text-sm whitespace-pre-wrap">{mensagem.content}</p>
									<div className="flex items-center justify-end gap-1 mt-1">
										<span className={`text-xs ${mensagem.direction === 'outgoing' ? 'text-white/80' : 'text-muted-foreground'}`}>
											{new Date(mensagem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
										</span>
										{mensagem.direction === 'outgoing' && (
											<>
												{mensagem.status === 'read' ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
											</>
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="p-4 border-t border-[var(--foreground-color)] bg-[var(--background-color-muted)]">
						<div className="flex items-center gap-2">
							<Input
								placeholder="Digite uma mensagem..."
								value={newMessage}
								onChange={(e) => setNewMessage(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										handleSendMessage();
									}
								}}
								className="border-[3px] border-[var(--foreground-color)]"
							/>
							<Button onClick={handleSendMessage} className="border-[3px] border-[var(--foreground-color)] bg-[var(--accent-color)] text-white">
								<Send className="h-4 w-4 mr-2" />
								Enviar
							</Button>
						</div>
					</div>
				</div>
			) : (
				<div className="bauhaus-card rounded-3xl flex items-center justify-center border-[3px] border-[var(--foreground-color)] shadow-[12px_12px_0_#0c0c0c]">
					<div className="text-center max-w-md p-10 space-y-3">
						<MessageSquare className="h-12 w-12 text-[var(--accent-color)] mx-auto" />
						<h3 className="text-2xl font-black">Selecione uma conversa</h3>
						<p className="text-muted-foreground">
							Escolha um lead na coluna da esquerda para visualizar o histórico e responder rapidamente.
						</p>
					</div>
				</div>
			)}
		</div>
	</div>
);
}
