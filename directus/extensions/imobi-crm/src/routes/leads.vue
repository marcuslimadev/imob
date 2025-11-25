<template>
  <div class="leads">
    <v-info v-if="!companyId" type="warning" icon="business" title="Nenhuma empresa selecionada">
      Selecione uma empresa no menu superior.
    </v-info>

    <div v-else class="kanban-container">
      <v-info icon="view_kanban" title="Kanban de Leads" type="info">
        Quadro Kanban com drag-and-drop em desenvolvimento
      </v-info>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  companyId: string | null;
}>();
</script>

<style scoped>
.leads {
  padding: var(--content-padding);
  padding-top: var(--content-padding-bottom);
}
</style>
