<script setup>
/**
 * WeeklyChart - Gráfico semanal de progresso
 */
defineProps({
  dailyCompletionData: { type: Array, required: true },
  formatDuration: { type: Function, required: true },
});
</script>

<template>
  <div class="lg:col-span-2 glass-card p-6">
    <h3 class="font-semibold mb-6 flex items-center gap-2 text-white">
      <span>📈</span>
      Planejado vs Realizado (Semana)
    </h3>

    <div class="space-y-5">
      <div
        v-for="day in dailyCompletionData"
        :key="day.date"
        class="flex items-center gap-4 p-3 bg-white/5 rounded-xl transition-all duration-200 hover:bg-white/10"
      >
        <div class="w-16 text-sm text-gray-400 font-medium">
          {{
            new Date(day.date).toLocaleDateString("pt-BR", { weekday: "short" })
          }}
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-1.5">
            <div class="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500"
                :style="{ width: `${day.rate}%` }"
              />
            </div>
            <span class="text-sm font-bold w-12 text-right text-white"
              >{{ day.rate }}%</span
            >
          </div>
          <div class="text-xs text-gray-500">
            {{ day.completed }}/{{ day.total }} tarefas •
            {{ formatDuration(day.minutes) }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="dailyCompletionData.length === 0"
      class="text-center py-8 text-gray-500"
    >
      Sem dados para exibir
    </div>
  </div>
</template>
