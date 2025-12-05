<script setup>
/**
 * MonthStats - Estatísticas do mês
 */
defineProps({
  monthStats: { type: Object, required: true },
  formatDuration: { type: Function, required: true },
});
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
    <div class="glass-card p-4 text-center">
      <div class="text-3xl font-bold text-white">{{ monthStats.total }}</div>
      <div class="text-xs text-gray-400 mt-1">Tarefas</div>
    </div>
    <div class="glass-card p-4 text-center">
      <div class="text-3xl font-bold text-emerald-400">
        {{ monthStats.completed }}
      </div>
      <div class="text-xs text-gray-400 mt-1">Concluídas</div>
    </div>
    <div class="glass-card p-4 text-center">
      <div class="text-3xl font-bold text-primary">
        {{ monthStats.completionRate }}%
      </div>
      <div class="text-xs text-gray-400 mt-1">Taxa Conclusão</div>
    </div>
    <div class="glass-card p-4 text-center">
      <div class="text-3xl font-bold text-white">
        {{ formatDuration(monthStats.totalMinutes) }}
      </div>
      <div class="text-xs text-gray-400 mt-1">Tempo Total</div>
    </div>
    <div class="glass-card p-4 text-center">
      <div class="text-3xl font-bold text-cyan-400">
        {{ monthStats.daysWithTasks }}
      </div>
      <div class="text-xs text-gray-400 mt-1">Dias Ativos</div>
    </div>
  </div>
</template>
