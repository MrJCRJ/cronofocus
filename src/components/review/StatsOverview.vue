<script setup>
/**
 * StatsOverview - Cards de estatísticas do dia
 */
defineProps({
  dayStats: { type: Object, default: null },
  formatDuration: { type: Function, required: true },
});
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div class="glass-card p-5">
      <div class="text-gray-400 text-sm mb-2">Tarefas</div>
      <div class="text-3xl font-bold text-white">
        {{ dayStats?.completed || 0 }}/{{ dayStats?.totalTasks || 0 }}
      </div>
      <div class="text-sm text-emerald-400 mt-1">
        {{ dayStats?.completionRate || 0 }}% concluídas
      </div>
    </div>

    <div class="glass-card p-5">
      <div class="text-gray-400 text-sm mb-2">Tempo Real</div>
      <div class="text-3xl font-bold text-white">
        {{ formatDuration(dayStats?.totalActualMinutes || 0) }}
      </div>
      <div class="text-sm text-primary mt-1">
        de {{ formatDuration(dayStats?.totalPlannedMinutes || 0) }} planejadas
      </div>
    </div>

    <div class="glass-card p-5">
      <div class="text-gray-400 text-sm mb-2">Eficiência</div>
      <div class="text-3xl font-bold text-white">
        {{ dayStats?.efficiencyRate || 0 }}%
      </div>
      <div
        class="text-sm mt-1"
        :class="
          dayStats?.efficiencyRate > 100 ? 'text-amber-400' : 'text-emerald-400'
        "
      >
        {{
          dayStats?.efficiencyRate > 100
            ? "Acima do planejado"
            : "Dentro do esperado"
        }}
      </div>
    </div>

    <div class="glass-card p-5">
      <div class="text-gray-400 text-sm mb-2">Distrações</div>
      <div
        class="text-3xl font-bold"
        :class="
          dayStats?.totalDistractions > 3 ? 'text-amber-400' : 'text-white'
        "
      >
        {{ dayStats?.totalDistractions || 0 }}
      </div>
      <div class="text-sm text-gray-500 mt-1">interrupções</div>
    </div>
  </div>
</template>
