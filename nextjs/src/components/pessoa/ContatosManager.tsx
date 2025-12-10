'use client';

import { useState, useEffect } from 'react';
import { directusClient } from '@/lib/directus/client';
import { createItem, deleteItem, readItems, updateItem } from '@directus/sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  Star, 
  Loader2,
  MessageSquare,
  PhoneCall
} from 'lucide-react';

interface Contato {
  id?: string;
  lead_id?: string;
  tipo: 'celular' | 'fixo' | 'whatsapp' | 'email' | 'outro';
  contato: string;
  descricao?: string;
  principal: boolean;
}

interface ContatosManagerProps {
  leadId?: string;
  companyId: string;
}

const TIPO_ICONS = {
  celular: PhoneCall,
  fixo: Phone,
  whatsapp: MessageSquare,
  email: Mail,
  outro: Phone,
};

const TIPO_LABELS = {
  celular: 'Celular',
  fixo: 'Telefone Fixo',
  whatsapp: 'WhatsApp',
  email: 'Email',
  outro: 'Outro',
};

export function ContatosManager({ leadId, companyId }: ContatosManagerProps) {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [novoContato, setNovoContato] = useState<Contato>({
    tipo: 'celular',
    contato: '',
    descricao: '',
    principal: false,
  });

  useEffect(() => {
    if (leadId) {
      carregarContatos();
    }
  }, [leadId]);

  const carregarContatos = async () => {
    if (!leadId) return;

    try {
      setLoading(true);

      const data = await directusClient.request(
        readItems('pessoa_contatos', {
          filter: { lead_id: { _eq: leadId } },
          sort: ['-principal', 'date_created'],
        })
      );

      setContatos(data as Contato[]);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarContato = async () => {
    if (!novoContato.contato.trim() || !leadId) return;

    try {
      setSaving(true);

      // Se marcar como principal, desmarcar os outros
      if (novoContato.principal) {
        await Promise.all(
          contatos
            .filter((c) => c.principal && c.id)
            .map((c) =>
              directusClient.request(
                updateItem('pessoa_contatos', c.id!, { principal: false })
              )
            )
        );
      }

      const created = await directusClient.request(
        createItem('pessoa_contatos', {
          ...novoContato,
          lead_id: leadId,
        })
      );

      setContatos([created as Contato, ...contatos.map(c => 
        novoContato.principal ? { ...c, principal: false } : c
      )]);

      setNovoContato({
        tipo: 'celular',
        contato: '',
        descricao: '',
        principal: false,
      });
    } catch (error) {
      console.error('Erro ao adicionar contato:', error);
      alert('Erro ao adicionar contato. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const removerContato = async (contatoId: string) => {
    if (!confirm('Deseja realmente remover este contato?')) return;

    try {
      await directusClient.request(deleteItem('pessoa_contatos', contatoId));
      setContatos(contatos.filter((c) => c.id !== contatoId));
    } catch (error) {
      console.error('Erro ao remover contato:', error);
      alert('Erro ao remover contato.');
    }
  };

  const tornarPrincipal = async (contatoId: string) => {
    try {
      // Desmarcar todos
      await Promise.all(
        contatos
          .filter((c) => c.principal && c.id)
          .map((c) =>
            directusClient.request(
              updateItem('pessoa_contatos', c.id!, { principal: false })
            )
          )
      );

      // Marcar o selecionado
      await directusClient.request(
        updateItem('pessoa_contatos', contatoId, { principal: true })
      );

      setContatos(
        contatos.map((c) => ({
          ...c,
          principal: c.id === contatoId,
        }))
      );
    } catch (error) {
      console.error('Erro ao definir contato principal:', error);
      alert('Erro ao definir contato principal.');
    }
  };

  if (!leadId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Salve a pessoa primeiro para gerenciar contatos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulário para adicionar novo contato */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Tipo</label>
                <Select
                  value={novoContato.tipo}
                  onValueChange={(value) =>
                    setNovoContato({ ...novoContato, tipo: value as Contato['tipo'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celular">Celular</SelectItem>
                    <SelectItem value="fixo">Telefone Fixo</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Contato *</label>
                <Input
                  value={novoContato.contato}
                  onChange={(e) =>
                    setNovoContato({ ...novoContato, contato: e.target.value })
                  }
                  placeholder={
                    novoContato.tipo === 'email'
                      ? 'email@exemplo.com'
                      : '(11) 99999-9999'
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Descrição (opcional)</label>
              <Input
                value={novoContato.descricao || ''}
                onChange={(e) =>
                  setNovoContato({ ...novoContato, descricao: e.target.value })
                }
                placeholder="Ex: Comercial, Pessoal, Mãe, Escritório..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="principal"
                checked={novoContato.principal}
                onChange={(e) =>
                  setNovoContato({ ...novoContato, principal: e.target.checked })
                }
                className="rounded"
              />
              <label htmlFor="principal" className="text-sm cursor-pointer">
                Marcar como contato principal
              </label>
            </div>

            <Button
              onClick={adicionarContato}
              disabled={!novoContato.contato.trim() || saving}
              className="w-full gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Adicionar Contato
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de contatos */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Contatos Cadastrados ({contatos.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : contatos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum contato cadastrado ainda.</p>
            <p className="text-sm mt-1">Adicione o primeiro contato acima.</p>
          </div>
        ) : (
          contatos.map((contato) => {
            const Icon = TIPO_ICONS[contato.tipo];
            return (
              <Card key={contato.id} className={contato.principal ? 'border-blue-500 border-2' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{contato.contato}</span>
                          <Badge variant="secondary" className="text-xs">
                            {TIPO_LABELS[contato.tipo]}
                          </Badge>
                          {contato.principal && (
                            <Badge className="bg-blue-500 text-white text-xs gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        {contato.descricao && (
                          <p className="text-sm text-muted-foreground">
                            {contato.descricao}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {!contato.principal && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => tornarPrincipal(contato.id!)}
                          title="Tornar principal"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removerContato(contato.id!)}
                        className="text-red-600 hover:text-red-700"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
