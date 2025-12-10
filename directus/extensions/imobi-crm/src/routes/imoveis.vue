<template>
  <div class="imoveis">
    <v-info v-if="!companyId" type="warning" icon="business" title="Nenhuma empresa selecionada">
      Selecione uma empresa no menu superior.
    </v-info>

    <div v-else class="properties-container">
      <v-info icon="home" title="Gerenciamento de Imóveis" type="info">
        Listagem e edição de imóveis em desenvolvimento
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
.imoveis {
  padding: var(--content-padding);
  padding-top: var(--content-padding-bottom);
}
</style>
