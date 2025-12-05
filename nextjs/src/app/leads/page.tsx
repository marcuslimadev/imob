'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  Home,
  Clock,
  User,
  ArrowRight,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { directusClient } from '@/lib/directus/client';
import { aggregate, readItems, updateItem } from '@directus/sdk';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  stage: string;
  source: string;
  created_at: string;
  last_interaction: string;
  budget_min?: number;
  budget_max?: number;
  tipo_imovel?: string;
  location?: string;
  mensagens_count: number;
  imoveis_enviados_count: number;
  requires_human_attention: boolean;
}

interface Message {
  id: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
}

interface StageHistory {
  id: string;
  from_stage: string;
  to_stage: string;
  changed_at: string;
  changed_by: string;
}

interface PropertySent {
  id: string;
  property_code: string;
  property_title: string;
  sent_at: string;
  clicked: boolean;
}

const STAGES = [
  { value: 'lead_novo', label: '🆕 Lead Novo', color: 'bg-blue-500' },
  { value: 'primeiro_contato', label: '👋 Primeiro Contato', color: 'bg-cyan-500' },
  { value: 'coleta_dados', label: '📋 Coleta de Dados', color: 'bg-indigo-500' },
  { value: 'qualificacao', label: '✅ Qualificação', color: 'bg-purple-500' },
  { value: 'refinamento_criterios', label: '🎯 Refinamento de Critérios', color: 'bg-pink-500' },
  { value: 'envio_imoveis', label: '🏠 Envio de Imóveis', color: 'bg-orange-500' },
  { value: 'interesse_demonstrado', label: '💡 Interesse Demonstrado', color: 'bg-yellow-500' },
  { value: 'agendamento_visita', label: '📅 Agendamento de Visita', color: 'bg-green-500' },
  { value: 'visita_realizada', label: '👁️ Visita Realizada', color: 'bg-teal-500' },
  { value: 'negociacao', label: '💰 Negociação', color: 'bg-lime-500' },
  { value: 'proposta_enviada', label: '📄 Proposta Enviada', color: 'bg-emerald-500' },
  { value: 'analise_credito', label: '🔍 Análise de Crédito', color: 'bg-sky-500' },
  { value: 'documentacao', label: '📝 Documentação', color: 'bg-violet-500' },
  { value: 'fechamento', label: '🎉 Fechamento', color: 'bg-green-600' },
  { value: 'pos_venda', label: '🤝 Pós-Venda', color: 'bg-blue-600' },
  { value: 'perdido', label: '❌ Perdido', color: 'bg-red-500' },
  { value: 'inativo', label: '💤 Inativo', color: 'bg-gray-500' },
];

const SOURCES = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'site', label: 'Site' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'outros', label: 'Outros' },
];

export default function LeadsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [leadMessages, setLeadMessages] = useState<Message[]>([]);
  const [leadStageHistory, setLeadStageHistory] = useState<StageHistory[]>([]);
  const [leadProperties, setLeadProperties] = useState<PropertySent[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});
  const [error, setError] = useState<string | null>(null);

  // Redirect se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/leads');
    }
  }, [user, authLoading, router]);

  // Carregar leads do Directus
  useEffect(() => {
    const fetchLeads = async () => {
      if (!user?.company_id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Buscar leads com agregações
        const leadsData = await directusClient.request(
          readItems('leads', {
            filter: {
              company_id: { _eq: user.company_id },
            },
            fields: [
              'id',
              'name',
              'phone',
              'email',
              'stage',
              'source',
              'created_at',
              'updated_at',
              'orcamento_minimo',
              'orcamento_maximo',
              'tipo_imovel',
              'cidade',
              'bairro',
              'requires_human_attention',
            ],
            limit: -1,
            sort: ['-updated_at'],
          })
        );

        // Para cada lead, buscar contagens de mensagens e imóveis
        const leadsWithCounts = await Promise.all(
          leadsData.map(async (lead: any) => {
            // Buscar conversas do lead
            const conversas = await directusClient.request(
              readItems('conversas', {
                filter: {
                  lead_id: { _eq: lead.id },
                },
                fields: ['id', 'updated_at'],
                limit: 1,
              })
            );

            const conversaId = conversas[0]?.id;
            let mensagensCount = 0;
            let lastInteraction = lead.updated_at;

            if (conversaId) {
              const mensagensAgg = await directusClient.request(
                aggregate('mensagens', {
                  aggregate: { count: '*' },
                  query: {
                    filter: {
                      conversa_id: { _eq: conversaId },
                    },
                  },
                })
              );
              mensagensCount = mensagensAgg[0]?.count || 0;
              lastInteraction = conversas[0].updated_at;
            }

            // Buscar imóveis enviados (TODO: implementar collection de relacionamento)
            const imoveisEnviadosCount = 0;

            return {
              id: lead.id,
              name: lead.name,
              phone: lead.phone,
              email: lead.email,
              stage: lead.stage || 'lead_novo',
              source: lead.source || 'whatsapp',
              created_at: lead.created_at,
              last_interaction: lastInteraction,
              budget_min: lead.orcamento_minimo,
              budget_max: lead.orcamento_maximo,
              tipo_imovel: lead.tipo_imovel,
              location: lead.cidade && lead.bairro ? `${lead.bairro} - ${lead.cidade}` : lead.cidade,
              mensagens_count: mensagensCount,
              imoveis_enviados_count: imoveisEnviadosCount,
              requires_human_attention: lead.requires_human_attention || false,
            };
          })
        );

        setLeads(leadsWithCounts);
        setFilteredLeads(leadsWithCounts);
      } catch (error) {
        console.error('Erro ao carregar leads:', error);
        setError('Erro ao carregar leads. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.company_id) {
      fetchLeads();
    }
  }, [user]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = leads;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone.includes(searchTerm) ||
          lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de stage
    if (selectedStage !== 'all') {
      filtered = filtered.filter((lead) => lead.stage === selectedStage);
    }

    // Filtro de source
    if (selectedSource !== 'all') {
      filtered = filtered.filter((lead) => lead.source === selectedSource);
    }

    // Filtro de data
    if (dateFrom) {
      filtered = filtered.filter(
        (lead) => new Date(lead.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter(
        (lead) => new Date(lead.created_at) <= new Date(dateTo)
      );
    }

    setFilteredLeads(filtered);
  }, [searchTerm, selectedStage, selectedSource, dateFrom, dateTo, leads]);

  const getStageInfo = (stageValue: string) => {
    return STAGES.find((s) => s.value === stageValue) || STAGES[0];
  };

  const getSourceLabel = (sourceValue: string) => {
    return SOURCES.find((s) => s.value === sourceValue)?.label || sourceValue;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleViewDetails = async (lead: Lead) => {
    setSelectedLead(lead);
    setEditedLead(lead);
    setIsDetailModalOpen(true);
    setIsLoadingDetails(true);
    setIsEditing(false);

    try {
      // Buscar conversas do lead
      const conversas = await directusClient.request(
        readItems('conversas', {
          filter: {
            lead_id: { _eq: lead.id },
          },
          fields: ['id'],
          limit: 1,
        })
      );

      const conversaId = conversas[0]?.id;

      if (conversaId) {
        // Buscar mensagens
        const mensagens = await directusClient.request(
          readItems('mensagens', {
            filter: {
              conversa_id: { _eq: conversaId },
            },
            fields: ['id', 'body', 'direction', 'created_at', 'status'],
            sort: ['created_at'],
            limit: 100,
          })
        );

        setLeadMessages(
          mensagens.map((msg: any) => ({
            id: msg.id,
            content: msg.body,
            direction: msg.direction as 'incoming' | 'outgoing',
            created_at: msg.created_at,
            status: msg.status || 'sent',
          }))
        );
      } else {
        setLeadMessages([]);
      }

      // TODO: Buscar histórico de mudanças de stage
      // Implementar collection stage_history ou buscar de logs
      setLeadStageHistory([]);

      // TODO: Buscar imóveis enviados
      // Implementar collection lead_properties ou relacionamento
      setLeadProperties([]);
    } catch (error) {
      console.error('Erro ao carregar detalhes do lead:', error);
      setLeadMessages([]);
      setLeadStageHistory([]);
      setLeadProperties([]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSaveLead = async () => {
    if (!selectedLead) return;

    try {
      await directusClient.request(
        updateItem('leads', selectedLead.id, {
          name: editedLead.name,
          email: editedLead.email,
          stage: editedLead.stage,
          source: editedLead.source,
          orcamento_minimo: editedLead.budget_min,
          orcamento_maximo: editedLead.budget_max,
          tipo_imovel: editedLead.tipo_imovel,
        })
      );

      // Atualizar lista local
      setLeads(
        leads.map((l) =>
          l.id === selectedLead.id ? { ...l, ...editedLead } : l
        )
      );
      setSelectedLead({ ...selectedLead, ...editedLead });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      alert('Erro ao salvar alterações');
    }
  };

  const handleOpenConversation = (leadId: string) => {
    router.push(`/conversas?lead=${leadId}`);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Nome', 'Telefone', 'Email', 'Stage', 'Origem', 'Data Criação', 'Mensagens', 'Imóveis Enviados'],
      ...filteredLeads.map((lead) => [
        lead.name,
        lead.phone,
        lead.email || '',
        getStageInfo(lead.stage).label,
        getSourceLabel(lead.source),
        formatDate(lead.created_at),
        lead.mensagens_count.toString(),
        lead.imoveis_enviados_count.toString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Loading State */}
      {(authLoading || isLoading) && (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando leads...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <X className="h-5 w-5" />
              <p className="font-semibold">Erro ao carregar dados</p>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!authLoading && !isLoading && !error && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Gerenciamento de Leads</h1>
              <p className="text-muted-foreground mt-1">
                {filteredLeads.length} leads encontrados
              </p>
            </div>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stage */}
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os stages</SelectItem>
                {STAGES.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Source */}
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as origens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as origens</SelectItem>
                {SOURCES.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Data */}
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="De"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                type="date"
                placeholder="Até"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Limpar filtros */}
          {(searchTerm || selectedStage !== 'all' || selectedSource !== 'all' || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedStage('all');
                setSelectedSource('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="mt-4"
            >
              Limpar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Leads */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Última interação</TableHead>
                  <TableHead className="text-center">Mensagens</TableHead>
                  <TableHead className="text-center">Imóveis</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => {
                    const stageInfo = getStageInfo(lead.stage);
                    return (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {lead.name}
                            {lead.requires_human_attention && (
                              <Badge variant="destructive" className="text-xs">
                                Atenção
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                            {lead.email && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${stageInfo.color} text-white`}>
                            {stageInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{getSourceLabel(lead.source)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(lead.created_at)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(lead.last_interaction)}
                        </TableCell>
                        <TableCell className="text-center">{lead.mensagens_count}</TableCell>
                        <TableCell className="text-center">{lead.imoveis_enviados_count}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(lead)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenConversation(lead.id)}
                              title="Abrir conversa"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes do Lead</span>
              <div className="flex items-center gap-2">
                {selectedLead && (
                  <Badge className={`${getStageInfo(selectedLead.stage).color} text-white`}>
                    {getStageInfo(selectedLead.stage).label}
                  </Badge>
                )}
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveLead}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="messages">Mensagens ({selectedLead.mensagens_count})</TabsTrigger>
                <TabsTrigger value="properties">Imóveis ({selectedLead.imoveis_enviados_count})</TabsTrigger>
              </TabsList>

              {/* Tab: Informações */}
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome</label>
                    {isEditing ? (
                      <Input
                        value={editedLead.name || ''}
                        onChange={(e) => setEditedLead({ ...editedLead, name: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.phone}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editedLead.email || ''}
                        onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                        className="mt-1"
                      />
                    ) : selectedLead.email ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.email}</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground mt-1">-</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Origem</label>
                    {isEditing ? (
                      <Select
                        value={editedLead.source || ''}
                        onValueChange={(value) => setEditedLead({ ...editedLead, source: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SOURCES.map((source) => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">{getSourceLabel(selectedLead.source)}</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Imóvel</label>
                    {isEditing ? (
                      <Input
                        value={editedLead.tipo_imovel || ''}
                        onChange={(e) =>
                          setEditedLead({ ...editedLead, tipo_imovel: e.target.value })
                        }
                        className="mt-1"
                        placeholder="Ex: Apartamento"
                      />
                    ) : selectedLead.tipo_imovel ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.tipo_imovel}</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground mt-1">-</div>
                    )}
                  </div>
                  {selectedLead.location && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Localização</label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLead.location}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Orçamento Mínimo
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedLead.budget_min || ''}
                        onChange={(e) =>
                          setEditedLead({ ...editedLead, budget_min: Number(e.target.value) })
                        }
                        className="mt-1"
                        placeholder="R$ 0"
                      />
                    ) : selectedLead.budget_min ? (
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formatCurrency(selectedLead.budget_min)}</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground mt-1">-</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Orçamento Máximo
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedLead.budget_max || ''}
                        onChange={(e) =>
                          setEditedLead({ ...editedLead, budget_max: Number(e.target.value) })
                        }
                        className="mt-1"
                        placeholder="R$ 0"
                      />
                    ) : selectedLead.budget_max ? (
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formatCurrency(selectedLead.budget_max)}</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground mt-1">-</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(selectedLead.created_at)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Última interação</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(selectedLead.last_interaction)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Histórico */}
              <TabsContent value="history">
                <div className="space-y-4">
                  {isLoadingDetails ? (
                    <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                  ) : leadStageHistory.length > 0 ? (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                      {leadStageHistory.map((history, index) => {
                        const fromStage = getStageInfo(history.from_stage);
                        const toStage = getStageInfo(history.to_stage);
                        return (
                          <div key={history.id} className="relative pl-12 pb-8">
                            <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full bg-primary"></div>
                            <div className="text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`${fromStage.color} text-white text-xs`}>
                                  {fromStage.label}
                                </Badge>
                                <ArrowRight className="h-3 w-3" />
                                <Badge className={`${toStage.color} text-white text-xs`}>
                                  {toStage.label}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground">
                                {formatDate(history.changed_at)} • {history.changed_by}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum histórico de mudanças encontrado
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab: Mensagens */}
              <TabsContent value="messages">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {isLoadingDetails ? (
                    <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                  ) : leadMessages.length > 0 ? (
                    leadMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.direction === 'outgoing'
                              ? 'bg-blue-500 text-white'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.direction === 'outgoing'
                                ? 'text-blue-100'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatDate(message.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma mensagem encontrada
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab: Imóveis */}
              <TabsContent value="properties">
                <div className="space-y-4">
                  {isLoadingDetails ? (
                    <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                  ) : leadProperties.length > 0 ? (
                    leadProperties.map((property) => (
                      <div key={property.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{property.property_title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Código: {property.property_code}
                            </p>
                          </div>
                          {property.clicked && (
                            <Badge variant="outline" className="text-green-600">
                              Visualizado
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Enviado em {formatDate(property.sent_at)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum imóvel enviado ainda
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      </> 
      )}
    </div>
  );
}
