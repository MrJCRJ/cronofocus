<script setup>
/**
 * QuickActions - Botões de ação rápida
 */
const emit = defineEmits(["add-task", "plan", "review", "export"]);
</script>

<template>
  <div class="glass-card p-4">
    <h3 class="font-semibold mb-4 flex items-center gap-2 text-white">
      <span>⚡</span>
      Ações Rápidas
    </h3>

    <div class="space-y-2">
      <button
        @click="emit('add-task')"
        class="w-full btn-premium btn-glass justify-start px-3 py-2.5 text-sm"
      >
        <span class="mr-2">➕</span>
        Adicionar Tarefa
      </button>

      <button
        @click="emit('plan')"
        class="w-full btn-premium btn-glass justify-start px-3 py-2.5 text-sm"
      >
        <span class="mr-2">📋</span>
        Planejar Semana
      </button>

      <button
        @click="emit('review')"
        class="w-full btn-premium btn-glass justify-start px-3 py-2.5 text-sm"
      >
        <span class="mr-2">📊</span>
        Ver Análise
      </button>

      <button
        @click="emit('export')"
        class="w-full btn-premium btn-glass justify-start px-3 py-2.5 text-sm"
      >
        <span class="mr-2">📤</span>
        Exportar Dados
      </button>
    </div>
  </div>
</template>
