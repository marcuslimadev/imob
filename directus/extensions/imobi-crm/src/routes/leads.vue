<template>
  <div class="leads">
    <v-info v-if="!companyId" type="warning" icon="business" title="Nenhuma empresa selecionada">
      Selecione uma empresa no menu superior.
    </v-info>

    <template v-else>
      <div class="toolbar">
        <v-input
          v-model="search"
          placeholder="Buscar por nome, email ou telefone"
          icon-left="search"
          :disabled="loading"
        />
        <v-button icon="refresh" :loading="loading" @click="loadLeads">Atualizar</v-button>
      </div>

      <div class="stats-grid">
        <v-card v-for="card in statsCards" :key="card.label">
          <v-card-title>
            <v-icon :name="card.icon" left />
            {{ card.label }}
          </v-card-title>
          <v-card-text class="stat-value">
            {{ card.value }}
          </v-card-text>
        </v-card>
      </div>

      <v-alert v-if="error" type="danger" icon="error" class="mb-4">
        {{ error }}
      </v-alert>

      <v-progress-linear v-if="loading" indeterminate class="mb-4" />

      <div class="board" v-else>
        <div v-for="stage in stages" :key="stage.id" class="column">
          <div class="column-header">
            <div>
              <p class="column-title">{{ stage.label }}</p>
              <small>{{ stageLeads(stage.id).length }} lead(s)</small>
            </div>
            <v-chip small :style="{ background: stage.badge, color: '#fff' }">
              {{ stage.short }}
            </v-chip>
          </div>

          <div class="column-body">
            <div v-if="stageLeads(stage.id).length === 0" class="empty-card">
              <v-icon name="inbox" class="mb-2" />
              <p>Nenhum lead neste estágio</p>
            </div>

            <v-card v-for="lead in stageLeads(stage.id)" :key="lead.id" class="lead-card">
              <div class="lead-header">
                <div>
                  <strong>{{ lead.name || 'Sem nome' }}</strong>
                  <p class="muted">{{ formatDate(lead.created_at) }}</p>
                </div>
                <span class="interest" :style="{ background: stage.badge }">
                  {{ interestLabel(lead.interest_type) }}
                </span>
              </div>

              <div class="lead-info">
                <div class="info-row">
                  <v-icon name="mail" small />
                  <span>{{ lead.email || 'Sem email' }}</span>
                </div>
                <div class="info-row">
                  <v-icon name="phone" small />
                  <span>{{ formatPhone(lead.phone || '') }}</span>
                </div>
                <div class="info-row" v-if="lead.budget_min || lead.budget_max">
                  <v-icon name="attach_money" small />
                  <span>{{ formatBudget(lead.budget_min, lead.budget_max) }}</span>
                </div>
              </div>

              <div class="lead-actions">
                <v-select
                  :model-value="lead.stage"
                  :items="stageOptions"
                  :disabled="updating === lead.id"
                  placeholder="Alterar estágio"
                  @update:modelValue="(value) => updateStage(lead.id, value as string)"
                />
                <div class="action-buttons">
                  <v-button
                    icon="whatsapp"
                    :title="'Conversar com ' + (lead.name || 'lead')"
                    :href="buildWhatsAppUrl(lead.phone)"
                    target="_blank"
                    rel="noopener"
                    secondary
                  />
                  <router-link :to="`/content/leads/${lead.id}`" class="details-link">Ver registro</router-link>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useApi } from '@directus/extensions-sdk';

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  interest_type: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  stage: string;
  created_at: string;
};

const props = defineProps<{
  companyId: string | null;
}>();

const api = useApi();
const leads = ref<Lead[]>([]);
const loading = ref(false);
const error = ref('');
const search = ref('');
const updating = ref<string | null>(null);

const stages = [
  { id: 'new', label: 'Novo', short: 'N', badge: '#2563eb' },
  { id: 'contacted', label: 'Contatado', short: 'C', badge: '#7c3aed' },
  { id: 'qualified', label: 'Qualificado', short: 'Q', badge: '#c2410c' },
  { id: 'visit_scheduled', label: 'Visita', short: 'V', badge: '#ea580c' },
  { id: 'negotiating', label: 'Negociando', short: 'Neg', badge: '#0ea5e9' },
  { id: 'won', label: 'Fechado', short: 'F', badge: '#16a34a' },
  { id: 'lost', label: 'Perdido', short: 'P', badge: '#6b7280' },
];

const stageOptions = stages.map((stage) => ({ label: stage.label, value: stage.id }));

const filteredLeads = computed(() => {
  if (!search.value) return leads.value;
  const term = search.value.toLowerCase();
  return leads.value.filter((lead) => [lead.name, lead.email, lead.phone]
    .filter(Boolean)
    .some((field) => field!.toLowerCase().includes(term)));
});

const statsCards = computed(() => [
  { label: 'Total', icon: 'people', value: leads.value.length },
  { label: 'Novos', icon: 'bolt', value: stageLeads('new').length },
  { label: 'Em contato', icon: 'chat', value: stageLeads('contacted').length },
  { label: 'Fechados', icon: 'check_circle', value: stageLeads('won').length },
]);

function stageLeads(stageId: string) {
  return filteredLeads.value.filter((lead) => lead.stage === stageId);
}

function interestLabel(type: string | null) {
  if (!type) return '—';
  const labels: Record<string, string> = {
    buy: 'Compra',
    rent: 'Aluguel',
  };
  return labels[type] || type;
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone || 'Sem telefone';
}

function formatBudget(min?: number | null, max?: number | null) {
  if (!min && !max) return 'Sem orçamento';
  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  return formatter.format(min || max || 0);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function buildWhatsAppUrl(phone: string | null) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  const message = encodeURIComponent('Olá! Recebemos seu contato pelo site iMOBI.');
  return `https://wa.me/${digits}?text=${message}`;
}

async function loadLeads() {
  if (!props.companyId) return;
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/items/leads', {
      params: {
        filter: { company_id: { _eq: props.companyId } },
        sort: ['-created_at'],
        fields: [
          'id',
          'name',
          'email',
          'phone',
          'interest_type',
          'budget_min',
          'budget_max',
          'stage',
          'created_at',
        ],
      },
    });

    leads.value = response.data.data || [];
  } catch (err) {
    console.error('Erro ao carregar leads:', err);
    error.value = 'Não foi possível carregar os leads. Tente novamente.';
  } finally {
    loading.value = false;
  }
}

async function updateStage(leadId: string, stage: string) {
  if (updating.value) return;
  updating.value = leadId;

  try {
    await api.patch(`/items/leads/${leadId}`, { stage });
    const lead = leads.value.find((item) => item.id === leadId);
    if (lead) lead.stage = stage;
  } catch (err) {
    console.error('Erro ao atualizar estágio:', err);
    error.value = 'Não foi possível alterar o estágio do lead.';
  } finally {
    updating.value = null;
  }
}

watch(
  () => props.companyId,
  (value) => {
    if (value) {
      loadLeads();
    } else {
      leads.value = [];
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.leads {
  padding: var(--content-padding);
  padding-top: var(--content-padding-bottom);
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.column {
  background: var(--theme--background-subdued);
  border-radius: var(--theme--border-radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.column-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-card {
  background: var(--theme--background);
  border: 1px dashed var(--theme--border-color-subdued);
  border-radius: var(--theme--border-radius);
  padding: 20px;
  text-align: center;
  color: var(--theme--foreground-subdued);
}

.lead-card {
  background: var(--theme--background);
}

.lead-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.muted {
  color: var(--theme--foreground-subdued);
  font-size: 0.85rem;
}

.interest {
  padding: 4px 8px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}

.lead-info {
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.lead-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.details-link {
  font-weight: 600;
  color: var(--theme--primary);
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
