<template>
  <private-view title="CRM">
    <template #headline>
      <v-breadcrumb :items="[{ name: 'CRM Imobiliário', to: '/imobi-crm' }]" />
    </template>

    <template #title-outer:prepend>
      <v-button class="header-icon" rounded icon secondary disabled>
        <v-icon name="business" />
      </v-button>
    </template>

    <template #actions>
      <v-select
        v-model="selectedCompany"
        :items="companies"
        item-text="nome_fantasia"
        item-value="id"
        placeholder="Selecione a empresa"
        class="company-selector"
      >
        <template #prepend>
          <v-icon name="business" small />
        </template>
      </v-select>
    </template>

    <template #navigation>
      <v-list nav>
        <v-list-item to="/imobi-crm/dashboard">
          <v-list-item-icon><v-icon name="dashboard" /></v-list-item-icon>
          <v-list-item-content>Dashboard</v-list-item-content>
        </v-list-item>
        
        <v-list-item to="/imobi-crm/conversas">
          <v-list-item-icon><v-icon name="chat" /></v-list-item-icon>
          <v-list-item-content>Conversas WhatsApp</v-list-item-content>
        </v-list-item>
        
        <v-list-item to="/imobi-crm/leads">
          <v-list-item-icon><v-icon name="people" /></v-list-item-icon>
          <v-list-item-content>Leads (Kanban)</v-list-item-content>
        </v-list-item>
        
        <v-list-item to="/imobi-crm/imoveis">
          <v-list-item-icon><v-icon name="home" /></v-list-item-icon>
          <v-list-item-content>Imóveis</v-list-item-content>
        </v-list-item>
      </v-list>
    </template>

    <router-view :company-id="selectedCompany" />
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
        fields: ['id', 'nome_fantasia', 'slug'],
        sort: ['nome_fantasia']
      }
    });
    
    companies.value = response.data.data;
    
    if (companies.value.length > 0) {
      selectedCompany.value = companies.value[0].id;
    }
  } catch (error) {
    console.error('Erro ao carregar empresas:', error);
  }
});
</script>

<style scoped>
.company-selector {
  min-width: 250px;
}

.header-icon {
  --v-button-width: 60px;
  --v-button-height: 60px;
  --v-button-font-size: 32px;
  --v-button-background-color: var(--theme--primary-background);
  --v-button-color: var(--theme--primary);
  --v-button-background-color-hover: var(--theme--primary-subdued);
  --v-button-color-hover: var(--theme--primary);
}
</style>
