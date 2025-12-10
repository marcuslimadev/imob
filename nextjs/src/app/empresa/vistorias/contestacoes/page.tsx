'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { directusClient } from '@/lib/directus/client';
import { readItems, createItem, updateItem } from '@directus/sdk';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Gavel, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  FileText,
  Plus,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Contestacao {
  id: string;
  vistoria_id: {
    id: string;
    codigo: string;
  };
  vistoria_item_id?: {
    id: string;
    comodo: string;
    item: string;
  };
  contestante: 'locatario' | 'proprietario' | 'imobiliaria';
  motivo: string;
  status: 'apontada' | 'em_analise' | 'aceita' | 'rejeitada' | 'finalizada';
  resposta?: string;
  created_at: string;
  updated_at?: string;
}

interface Vistoria {
  id: string;
  codigo: string;
}

const statusConfig = {
  apontada: { 
    text: 'Apontada', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle
  },
  em_analise: { 
    text: 'Em Análise', 
    color: 'bg-blue-100 text-blue-800',
    icon: Clock
  },
  aceita: { 
    text: 'Aceita', 
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  rejeitada: { 
    text: 'Rejeitada', 
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  },
  finalizada: { 
    text: 'Finalizada', 
    color: 'bg-gray-100 text-gray-800',
    icon: FileText
  },
};

const contestanteLabels = {
  locatario: 'Locatário',
  proprietario: 'Proprietário',
  imobiliaria: 'Imobiliária',
};

export default function VistoriasContestacoesPage() {
  const { user } = useAuth();
  const [contestacoes, setContestacoes] = useState<Contestacao[]>([]);
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContestacao, setSelectedContestacao] = useState<Contestacao | null>(null);
  const [resposta, setResposta] = useState('');
  const [novoStatus, setNovoStatus] = useState<string>('');

  // Estado para nova contestação
  const [novaContestacaoOpen, setNovaContestacaoOpen] = useState(false);
  const [novaContestacao, setNovaContestacao] = useState({
    vistoria_id: '',
    contestante: 'locatario' as const,
    motivo: '',
  });

  useEffect(() => {
    if (user?.company_id) {
      carregarDados();
    }
  }, [user?.company_id]);

  const carregarDados = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      
      const [contestacoesData, vistoriasData] = await Promise.all([
        directusClient.request(
          readItems('vistoria_contestacoes', {
            filter: { 
              vistoria_id: { 
                company_id: { _eq: user.company_id }
              }
            },
            fields: [
              '*',
              { vistoria_id: ['id', 'codigo'] },
              { vistoria_item_id: ['id', 'comodo', 'item'] }
            ],
            sort: ['-created_at']
          })
        ),
        directusClient.request(
          readItems('vistorias', {
            filter: { 
              company_id: { _eq: user.company_id },
              status: { _in: ['concluida', 'em_andamento'] }
            },
            fields: ['id', 'codigo']
          })
        )
      ]);

      setContestacoes(contestacoesData as Contestacao[]);
      setVistorias(vistoriasData as Vistoria[]);
    } catch (error) {
      console.error('Erro ao carregar contestações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async () => {
    if (!selectedContestacao || !resposta.trim() || !novoStatus) return;

    try {
      await directusClient.request(
        updateItem('vistoria_contestacoes', selectedContestacao.id, {
          resposta,
          status: novoStatus,
        })
      );

      await carregarDados();
      setDialogOpen(false);
      setSelectedContestacao(null);
      setResposta('');
      setNovoStatus('');
    } catch (error) {
      console.error('Erro ao responder contestação:', error);
      alert('Erro ao responder contestação');
    }
  };

  const handleCriarContestacao = async () => {
    if (!novaContestacao.vistoria_id || !novaContestacao.motivo.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await directusClient.request(
        createItem('vistoria_contestacoes', {
          ...novaContestacao,
          status: 'apontada',
        })
      );

      await carregarDados();
      setNovaContestacaoOpen(false);
      setNovaContestacao({
        vistoria_id: '',
        contestante: 'locatario',
        motivo: '',
      });
    } catch (error) {
      console.error('Erro ao criar contestação:', error);
      alert('Erro ao criar contestação');
    }
  };

  const contestacoesFiltradas = statusFilter
    ? contestacoes.filter(c => c.status === statusFilter)
    : contestacoes;

  const contarPorStatus = (status: string) => 
    contestacoes.filter(c => c.status === status).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/empresa/vistorias">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Contestações de Vistoria</h1>
            <p className="text-gray-600 mt-1">
              Gerencie divergências e disputas nas vistorias
            </p>
          </div>
        </div>

        <Dialog open={novaContestacaoOpen} onOpenChange={setNovaContestacaoOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Contestação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Contestação</DialogTitle>
              <DialogDescription>
                Registre uma nova contestação para uma vistoria
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Vistoria</Label>
                <Select
                  value={novaContestacao.vistoria_id}
                  onValueChange={(value) => setNovaContestacao({ ...novaContestacao, vistoria_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma vistoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {vistorias.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.codigo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Contestante</Label>
                <Select
                  value={novaContestacao.contestante}
                  onValueChange={(value: any) => setNovaContestacao({ ...novaContestacao, contestante: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="locatario">Locatário</SelectItem>
                    <SelectItem value="proprietario">Proprietário</SelectItem>
                    <SelectItem value="imobiliaria">Imobiliária</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Motivo da Contestação</Label>
                <Textarea
                  value={novaContestacao.motivo}
                  onChange={(e) => setNovaContestacao({ ...novaContestacao, motivo: e.target.value })}
                  placeholder="Descreva detalhadamente o motivo da contestação..."
                  rows={6}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setNovaContestacaoOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCriarContestacao}>
                Criar Contestação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => (
          <Card 
            key={key} 
            className={`cursor-pointer transition-all ${statusFilter === key ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setStatusFilter(statusFilter === key ? null : key)}
          >
            <CardContent className="p-4 text-center">
              <config.icon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="text-2xl font-bold">{contarPorStatus(key)}</div>
              <div className="text-sm text-gray-600">{config.text}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Contestações */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : contestacoesFiltradas.length > 0 ? (
          contestacoesFiltradas.map(contestacao => {
            const StatusIcon = statusConfig[contestacao.status].icon;
            return (
              <Card key={contestacao.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          Vistoria: {contestacao.vistoria_id.codigo}
                        </CardTitle>
                        <Badge className={statusConfig[contestacao.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[contestacao.status].text}
                        </Badge>
                        <Badge variant="outline">
                          {contestanteLabels[contestacao.contestante]}
                        </Badge>
                      </div>
                      {contestacao.vistoria_item_id && (
                        <CardDescription>
                          Item: {contestacao.vistoria_item_id.comodo} - {contestacao.vistoria_item_id.item}
                        </CardDescription>
                      )}
                      <CardDescription>
                        Criada em {format(new Date(contestacao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </CardDescription>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContestacao(contestacao);
                        setResposta(contestacao.resposta || '');
                        setNovoStatus(contestacao.status);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {contestacao.status === 'apontada' ? 'Responder' : 'Ver Detalhes'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-semibold">Motivo:</Label>
                      <div 
                        className="mt-1 text-sm text-gray-700 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: contestacao.motivo }}
                      />
                    </div>

                    {contestacao.resposta && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <Label className="text-sm font-semibold text-blue-900">Resposta:</Label>
                        <div 
                          className="mt-1 text-sm text-blue-800 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: contestacao.resposta }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Gavel className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                {statusFilter 
                  ? `Nenhuma contestação com status "${statusConfig[statusFilter].text}"`
                  : 'Nenhuma contestação registrada'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Resposta */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedContestacao?.vistoria_id.codigo} - Contestação
            </DialogTitle>
            <DialogDescription>
              Contestante: {selectedContestacao && contestanteLabels[selectedContestacao.contestante]}
            </DialogDescription>
          </DialogHeader>

          {selectedContestacao && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Motivo da Contestação:</Label>
                <div 
                  className="mt-2 p-3 bg-gray-50 rounded-lg text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedContestacao.motivo }}
                />
              </div>

              <div>
                <Label>Novo Status</Label>
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="aceita">Aceita</SelectItem>
                    <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Resposta</Label>
                <Textarea
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  placeholder="Digite a resposta à contestação..."
                  rows={6}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResponder}>
              Salvar Resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
