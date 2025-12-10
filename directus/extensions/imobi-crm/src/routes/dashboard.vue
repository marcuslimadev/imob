<template>
  <div class="dashboard">
    <v-info v-if="!companyId" type="warning" icon="business" title="Nenhuma empresa selecionada">
      Selecione uma empresa no menu superior para visualizar o dashboard.
    </v-info>

    <template v-else>
      <!-- Estatísticas -->
      <div class="stats-grid">
        <v-info icon="people" title="Leads" :value="stats.leads.toString()" color="blue" />
        <v-info icon="home" title="Imóveis" :value="stats.properties.toString()" color="green" />
        <v-info icon="chat" title="Conversas" :value="stats.conversas.toString()" color="purple" />
        <v-info icon="attach_money" title="Vendas" value="--" color="orange" />
      </div>

      <!-- Funil de Vendas -->
      <div class="content-grid">
        <div class="funnel-section">
          <v-card>
            <v-card-title>
              <v-icon name="funnel" left />
              Funil de Vendas
            </v-card-title>
            <v-card-text>
              <div v-if="leadsByStage.length === 0" class="empty-state">
                <v-icon name="inbox" large />
                <p>Nenhum lead cadastrado ainda</p>
              </div>
              <div v-else class="stages">
                <div v-for="stage in leadsByStage" :key="stage.stage" class="stage-item">
                  <div class="stage-label">{{ formatStage(stage.stage) }}</div>
                  <div class="stage-bar">
                    <div 
                      class="stage-fill" 
                      :style="{ width: getStageWidth(stage.count) + '%' }"
                    ></div>
                    <span class="stage-count">{{ stage.count }}</span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Atividades Recentes -->
        <div class="activities-section">
          <v-card>
            <v-card-title>
              <v-icon name="history" left />
              Atividades Recentes
            </v-card-title>
            <v-card-text>
              <div class="empty-state">
                <v-icon name="event_note" large />
                <p>Em desenvolvimento</p>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useApi } from '@directus/extensions-sdk';

const props = defineProps<{
  companyId: string | null;
}>();

const api = useApi();
const stats = ref({ leads: 0, properties: 0, conversas: 0 });
const leadsByStage = ref<any[]>([]);

const stageNames: Record<string, string> = {
  novo: 'Novo',
  contato: 'Contato',
  qualificado: 'Qualificado',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

function formatStage(stage: string): string {
  return stageNames[stage] || stage;
}

function getStageWidth(count: number): number {
  if (leadsByStage.value.length === 0) return 0;
  const max = Math.max(...leadsByStage.value.map(s => s.count));
  return (count / max) * 100;
}

async function loadStats() {
  if (!props.companyId) return;

  try {
    const [leadsRes, propertiesRes, conversasRes, stagesRes] = await Promise.all([
      api.get('/items/leads', {
        params: {
          filter: { company_id: { _eq: props.companyId } },
          aggregate: { count: '*' },
        },
      }),
      api.get('/items/properties', {
        params: {
          filter: { company_id: { _eq: props.companyId } },
          aggregate: { count: '*' },
        },
      }),
      api.get('/items/conversas', {
        params: {
          filter: { company_id: { _eq: props.companyId }, archived: { _neq: true } },
          aggregate: { count: '*' },
        },
      }),
      api.get('/items/leads', {
        params: {
          filter: { company_id: { _eq: props.companyId } },
          groupBy: ['stage'],
          aggregate: { count: '*' },
        },
      }),
    ]);

    stats.value = {
      leads: leadsRes.data.data[0]?.count || 0,
      properties: propertiesRes.data.data[0]?.count || 0,
      conversas: conversasRes.data.data[0]?.count || 0,
    };

    leadsByStage.value = stagesRes.data.data || [];
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}

watch(() => props.companyId, loadStats, { immediate: true });
</script>

<style scoped>
.dashboard {
  padding: var(--content-padding);
  padding-top: var(--content-padding-bottom);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.stages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stage-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stage-label {
  min-width: 120px;
  font-weight: 500;
}

.stage-bar {
  flex: 1;
  height: 32px;
  background: var(--theme--background-subdued);
  border-radius: var(--theme--border-radius);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.stage-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--theme--primary);
  transition: width 0.3s ease;
  opacity: 0.2;
}

.stage-count {
  position: relative;
  z-index: 1;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--theme--foreground-subdued);
  text-align: center;
}

.empty-state .v-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
