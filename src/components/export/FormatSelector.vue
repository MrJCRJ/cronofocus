<script setup>
/**
 * FormatSelector - Seletor de formato de exportação
 */
defineProps({
  formats: { type: Array, required: true },
  exportFormat: { type: String, required: true },
});

const emit = defineEmits(["update:exportFormat"]);
</script>

<template>
  <div>
    <h3 class="font-semibold mb-4 text-white">Formato de Exportação</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        v-for="format in formats"
        :key="format.id"
        @click="$emit('update:exportFormat', format.id)"
        :class="[
          'p-5 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.02]',
          exportFormat === format.id
            ? 'border-primary bg-primary/15 shadow-lg shadow-primary/20'
            : 'border-white/10 bg-white/5 hover:border-white/20',
        ]"
      >
        <div class="text-4xl mb-3">{{ format.icon }}</div>
        <div class="font-semibold text-white">{{ format.name }}</div>
        <div class="text-sm text-gray-400 mt-1">{{ format.description }}</div>
      </button>
    </div>
  </div>
</template>
