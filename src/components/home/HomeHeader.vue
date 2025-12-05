<script setup>
/**
 * HomeHeader - Cabeçalho da Home com data e navegação
 */
import { computed } from "vue";

const props = defineProps({
  selectedDate: {
    type: [Date, String],
    required: true,
  },
  tasksToday: {
    type: Number,
    default: 0,
  },
  completedToday: {
    type: Number,
    default: 0,
  },
  formatDate: {
    type: Function,
    default: (d) => new Date(d).toLocaleDateString(),
  },
});

const emit = defineEmits(["navigate-date", "go-today"]);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
});
</script>

<template>
  <div
    class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6"
  >
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-white">
        {{ greeting }}! 👋
      </h1>
      <p class="text-gray-400 mt-1">
        {{ tasksToday }} tarefas para hoje • {{ completedToday }} concluídas
      </p>
    </div>

    <!-- Date Navigation -->
    <div class="flex items-center gap-2">
      <button
        @click="emit('navigate-date', -1)"
        class="btn-premium btn-glass p-2 rounded-xl"
        aria-label="Dia anterior"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        @click="emit('go-today')"
        class="btn-premium btn-outline-primary px-4 py-2 min-w-[160px] text-sm"
      >
        {{ formatDate(selectedDate) }}
      </button>

      <button
        @click="emit('navigate-date', 1)"
        class="btn-premium btn-glass p-2 rounded-xl"
        aria-label="Próximo dia"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
