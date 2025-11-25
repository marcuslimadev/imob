<template>
  <div class="conversas">
    <v-info v-if="!companyId" type="warning" icon="business" title="Nenhuma empresa selecionada">
      Selecione uma empresa no menu superior.
    </v-info>

    <div v-else class="chat-container">
      <v-info icon="chat" title="Conversas WhatsApp" type="info">
        Interface de chat WhatsApp em desenvolvimento
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
.conversas {
  padding: var(--content-padding);
  padding-top: var(--content-padding-bottom);
}
</style>
