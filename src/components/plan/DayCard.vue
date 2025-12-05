<script setup>
/**
 * DayCard - Card de cada dia da semana
 */
defineProps({
  day: {
    type: Object,
    required: true,
  },
  getTaskCategory: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["add-task", "task-click"]);
</script>

<template>
  <div
    :class="[
      'glass-card overflow-hidden transition-all duration-300 hover:scale-[1.02]',
      day.isToday
        ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20'
        : 'hover:shadow-lg hover:shadow-indigo-500/10',
    ]"
  >
    <!-- Day Header -->
    <div
      :class="[
        'p-3 text-center',
        day.isToday ? 'bg-indigo-500/20' : 'bg-white/5',
      ]"
    >
      <div class="text-xs uppercase tracking-wider text-gray-400 font-medium">
        {{ day.dayName }}
      </div>
      <div
        :class="[
          'text-2xl font-bold',
          day.isToday ? 'text-indigo-400' : 'text-white',
        ]"
      >
        {{ day.dayNumber }}
      </div>
    </div>

    <!-- Tasks List -->
    <div class="p-3 min-h-52 max-h-96 overflow-y-auto">
      <div v-if="day.tasks.length > 0" class="space-y-2">
        <div
          v-for="task in day.tasks"
          :key="task.id"
          :class="[
            'p-3 rounded-xl text-xs border-l-3 transition-all duration-200 cursor-pointer hover:scale-[1.02]',
            task.status === 'completed'
              ? 'bg-emerald-500/10 border-emerald-500'
              : 'bg-white/5 hover:bg-white/10',
          ]"
          :style="{ borderLeftColor: getTaskCategory(task).color }"
          @click="emit('task-click', task)"
        >
          <div class="flex items-start gap-2">
            <span v-if="task.status === 'completed'" class="text-emerald-400"
              >✅</span
            >
            <span v-else>{{ getTaskCategory(task).icon }}</span>
            <div class="flex-1 min-w-0">
              <p
                :class="[
                  'font-medium truncate',
                  task.status === 'completed'
                    ? 'text-gray-400 line-through'
                    : 'text-white',
                ]"
              >
                {{ task.title }}
              </p>
              <p class="text-gray-500 mt-0.5">
                {{ task.plannedStart }} - {{ task.plannedEnd }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="h-full flex items-center justify-center text-gray-500">
        <p class="text-sm">Nenhuma tarefa</p>
      </div>
    </div>

    <!-- Add Task Button -->
    <div class="p-3">
      <button
        @click="emit('add-task', day)"
        class="btn-premium btn-glass w-full py-2 text-sm"
      >
        <svg
          class="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Adicionar
      </button>
    </div>
  </div>
</template>
