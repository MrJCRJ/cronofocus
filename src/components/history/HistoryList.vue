<script setup>
/**
 * HistoryList - Lista de dias com tarefas
 */
defineProps({
  historyData: { type: Array, required: true },
  formatDuration: { type: Function, required: true },
  getTaskCategory: { type: Function, required: true },
});

const emit = defineEmits(["goToDay"]);
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="historyData.length === 0"
      class="text-center py-12 text-gray-500"
    >
      <div class="text-7xl mb-4">📭</div>
      <p class="text-lg">Nenhuma tarefa neste mês</p>
    </div>

    <div
      v-for="day in historyData"
      :key="day.date"
      class="glass-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
    >
      <!-- Day Header -->
      <div
        class="p-5 border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all duration-200"
        @click="$emit('goToDay', day.date)"
      >
        <div class="flex items-center gap-5">
          <div class="text-center bg-white/5 rounded-xl p-3 min-w-[60px]">
            <div class="text-2xl font-bold text-white">
              {{ new Date(day.date).getDate() }}
            </div>
            <div class="text-xs text-gray-400 uppercase font-medium">
              {{
                new Date(day.date).toLocaleDateString("pt-BR", {
                  weekday: "short",
                })
              }}
            </div>
          </div>
          <div>
            <div class="font-semibold text-white text-lg">
              {{ day.completed }}/{{ day.total }} tarefas
            </div>
            <div class="text-sm text-gray-400">
              {{ formatDuration(day.totalMinutes) }} de foco
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="flex items-center gap-4">
          <div class="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              :style="{ width: `${(day.completed / day.total) * 100}%` }"
            />
          </div>
          <span class="text-sm font-bold text-white min-w-[40px] text-right">
            {{ Math.round((day.completed / day.total) * 100) }}%
          </span>
        </div>
      </div>

      <!-- Tasks -->
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="task in day.tasks"
          :key="task.id"
          :class="[
            'p-4 rounded-xl border-l-3 text-sm transition-all duration-200 hover:scale-[1.02]',
            task.status === 'completed'
              ? 'bg-emerald-500/10 border-emerald-500'
              : 'bg-white/5 hover:bg-white/10',
          ]"
          :style="{ borderLeftColor: getTaskCategory(task).color }"
        >
          <div class="flex items-start gap-3">
            <span v-if="task.status === 'completed'" class="text-emerald-400"
              >✅</span
            >
            <span v-else-if="task.status === 'skipped'" class="text-gray-400"
              >⏭️</span
            >
            <span v-else>{{ getTaskCategory(task).icon }}</span>
            <div class="flex-1 min-w-0">
              <p
                :class="[
                  'font-medium truncate',
                  task.status === 'completed' ? 'text-gray-300' : 'text-white',
                ]"
              >
                {{ task.title }}
              </p>
              <p class="text-gray-500 mt-1">
                {{ task.plannedStart }} - {{ task.plannedEnd }}
                <span
                  v-if="task.actualDuration"
                  class="ml-2 text-emerald-400 font-semibold"
                >
                  {{ task.actualDuration }}min
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
