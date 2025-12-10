'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { directusClient } from '@/lib/directus/client';
import { readItems } from '@directus/sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  List, 
  Plus,
  ChevronLeft,
  Building2,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Vistoria {
  id: string;
  codigo: string;
  status: 'solicitada' | 'designada' | 'em_andamento' | 'concluida' | 'cancelada';
  tipo: 'entrada' | 'saida' | 'periodica';
  data_solicitacao: string;
  data_agendada?: string;
  tempo_estimado?: number;
  property_id?: {
    id: string;
    titulo: string;
    endereco_rua: string;
  };
  lead_id?: {
    id: string;
    nome: string;
  };
  vistoriador_id?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

const statusLabels = {
  solicitada: { text: 'Solicitada', color: 'bg-blue-100 text-blue-800' },
  designada: { text: 'Designada', color: 'bg-yellow-100 text-yellow-800' },
  em_andamento: { text: 'Em Andamento', color: 'bg-purple-100 text-purple-800' },
  concluida: { text: 'Concluída', color: 'bg-green-100 text-green-800' },
  cancelada: { text: 'Cancelada', color: 'bg-red-100 text-red-800' },
};

const tipoLabels = {
  entrada: { text: 'Entrada', color: 'bg-green-50 text-green-700 border-green-200' },
  saida: { text: 'Saída', color: 'bg-red-50 text-red-700 border-red-200' },
  periodica: { text: 'Periódica', color: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export default function VistoriasSolicitacoesPage() {
  const { user } = useAuth();
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'kanban' | 'calendar' | 'list'>('kanban');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (user?.company_id) {
      carregarVistorias();
    }
  }, [user?.company_id]);

  const carregarVistorias = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      const data = await directusClient.request(
        readItems('vistorias', {
          filter: { 
            company_id: { _eq: user.company_id },
            status: { _in: ['solicitada', 'designada', 'em_andamento'] }
          },
          fields: [
            '*',
            { property_id: ['id', 'titulo', 'endereco_rua'] },
            { lead_id: ['id', 'nome'] },
            { vistoriador_id: ['id', 'first_name', 'last_name'] }
          ],
          sort: ['-data_solicitacao']
        })
      );
      setVistorias(data as Vistoria[]);
    } catch (error) {
      console.error('Erro ao carregar vistorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVistoriasPorStatus = (status: string) => {
    return vistorias.filter(v => v.status === status);
  };

  const getVistoriasPorData = (date: Date) => {
    return vistorias.filter(v => {
      if (!v.data_agendada) return false;
      const vistoriaDate = new Date(v.data_agendada);
      return (
        vistoriaDate.getDate() === date.getDate() &&
        vistoriaDate.getMonth() === date.getMonth() &&
        vistoriaDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const VistoriaCard = ({ vistoria }: { vistoria: Vistoria }) => (
    <Link href={`/empresa/vistorias/${vistoria.id}`}>
      <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <span className="font-mono text-sm font-semibold">{vistoria.codigo}</span>
            <Badge className={tipoLabels[vistoria.tipo].color}>
              {tipoLabels[vistoria.tipo].text}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{vistoria.property_id?.titulo}</p>
                <p className="text-gray-500 text-xs">{vistoria.property_id?.endereco_rua}</p>
              </div>
            </div>

            {vistoria.lead_id && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{vistoria.lead_id.nome}</span>
              </div>
            )}

            {vistoria.vistoriador_id && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>
                  Vistoriador: {vistoria.vistoriador_id.first_name} {vistoria.vistoriador_id.last_name}
                </span>
              </div>
            )}

            {vistoria.data_agendada && (
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarIcon className="w-4 h-4" />
                <span>{format(new Date(vistoria.data_agendada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
            )}

            {vistoria.tempo_estimado && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{vistoria.tempo_estimado} minutos</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const KanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Coluna: Solicitada */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900">Solicitadas</h3>
          <Badge variant="secondary">{getVistoriasPorStatus('solicitada').length}</Badge>
        </div>
        <div className="space-y-3">
          {getVistoriasPorStatus('solicitada').map(v => (
            <VistoriaCard key={v.id} vistoria={v} />
          ))}
          {getVistoriasPorStatus('solicitada').length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">Nenhuma vistoria solicitada</p>
          )}
        </div>
      </div>

      {/* Coluna: Designada */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-900">Designadas</h3>
          <Badge variant="secondary">{getVistoriasPorStatus('designada').length}</Badge>
        </div>
        <div className="space-y-3">
          {getVistoriasPorStatus('designada').map(v => (
            <VistoriaCard key={v.id} vistoria={v} />
          ))}
          {getVistoriasPorStatus('designada').length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">Nenhuma vistoria designada</p>
          )}
        </div>
      </div>

      {/* Coluna: Em Andamento */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-900">Em Andamento</h3>
          <Badge variant="secondary">{getVistoriasPorStatus('em_andamento').length}</Badge>
        </div>
        <div className="space-y-3">
          {getVistoriasPorStatus('em_andamento').map(v => (
            <VistoriaCard key={v.id} vistoria={v} />
          ))}
          {getVistoriasPorStatus('em_andamento').length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">Nenhuma vistoria em andamento</p>
          )}
        </div>
      </div>
    </div>
  );

  const CalendarView = () => {
    const vistoriasNaData = selectedDate ? getVistoriasPorData(selectedDate) : [];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Selecione uma Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? `Vistorias em ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                  : 'Selecione uma data'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vistoriasNaData.length > 0 ? (
                <div className="space-y-3">
                  {vistoriasNaData.map(v => (
                    <VistoriaCard key={v.id} vistoria={v} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Nenhuma vistoria agendada para esta data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const ListView = () => (
    <div className="space-y-3">
      {vistorias.map(v => (
        <Card key={v.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono font-semibold">{v.codigo}</span>
                  <Badge className={statusLabels[v.status].color}>
                    {statusLabels[v.status].text}
                  </Badge>
                  <Badge className={tipoLabels[v.tipo].color}>
                    {tipoLabels[v.tipo].text}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{v.property_id?.titulo}</span>
                  </div>
                  {v.lead_id && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{v.lead_id.nome}</span>
                    </div>
                  )}
                  {v.data_agendada && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{format(new Date(v.data_agendada), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                    </div>
                  )}
                </div>
              </div>

              <Link href={`/empresa/vistorias/${v.id}`}>
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}

      {vistorias.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma solicitação de vistoria pendente</p>
        </div>
      )}
    </div>
  );

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
            <h1 className="text-3xl font-bold">Solicitações de Vistoria</h1>
            <p className="text-gray-600 mt-1">
              Visualize e gerencie solicitações em diferentes formatos
            </p>
          </div>
        </div>

        <Link href="/empresa/vistorias/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Vistoria
          </Button>
        </Link>
      </div>

      {/* Views Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
        <TabsList>
          <TabsTrigger value="kanban">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : (
            <KanbanView />
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : (
            <CalendarView />
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : (
            <ListView />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
