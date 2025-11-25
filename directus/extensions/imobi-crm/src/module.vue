<template>
  <private-view title="CRM - IMOBI">
    <template #navigation>
      <v-list>
        <v-list-item to="/imobi-crm/dashboard" exact>
          <v-list-item-icon><v-icon name="dashboard" /></v-list-item-icon>
          <v-list-item-content>Dashboard</v-list-item-content>
        </v-list-item>
        
        <v-list-item to="/imobi-crm/conversas" exact>
          <v-list-item-icon><v-icon name="chat" /></v-list-item-icon>
          <v-list-item-content>Conversas WhatsApp</v-list-item-content>
        </v-list-item>
        
        <v-list-item to="/imobi-crm/leads" exact>
          <v-list-item-icon><v-icon name="people" /></v-list-item-icon>
          <v-list-item-content>Leads (Kanban)</v-list-item-content>
        </v-list-item>
        
        <v-list-item to="/imobi-crm/imoveis" exact>
          <v-list-item-icon><v-icon name="home" /></v-list-item-icon>
          <v-list-item-content>Imóveis</v-list-item-content>
        </v-list-item>
      </v-list>
    </template>

    <template #title>
      <v-icon name="business" left />
      CRM Imobiliário
    </template>

    <template #headline>
      <div class="company-selector">
        <v-select
          v-model="selectedCompany"
          :items="companies"
          item-text="nome_fantasia"
          item-value="id"
          placeholder="Selecione a empresa"
        />
      </div>
    </template>

    <div class="crm-container">
      <router-view :company-id="selectedCompany" />
    </div>
  </private-view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '@directus/extensions-sdk';

const api = useApi();
const selectedCompany = ref<string | null>(null);
const companies = ref<any[]>([]);

onMounted(async () => {
  try {
    const response = await api.get('/items/companies', {
      params: {
        filter: { status: { _eq: 'active' } },
        fields: ['id', 'nome_fantasia', 'slug']
      }
    });
    
    companies.value = response.data.data;
    
    // Auto-selecionar primeira empresa
    if (companies.value.length > 0) {
      selectedCompany.value = companies.value[0].id;
    }
  } catch (error) {
    console.error('Erro ao carregar empresas:', error);
  }
});
</script>

<style scoped>
.crm-container {
  padding: var(--content-padding);
  padding-top: var(--content-padding-bottom);
}

.company-selector {
  max-width: 300px;
}
</style>
