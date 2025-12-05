<script setup>
/**
 * TimerControls - Botões de controle do timer
 */
defineProps({
  isPaused: {
    type: Boolean,
    default: false,
  },
  distractionCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  "toggle",
  "complete",
  "skip",
  "add-time",
  "distraction",
]);
</script>

<template>
  <div class="flex flex-col items-center gap-6">
    <!-- Main Buttons -->
    <div class="flex items-center gap-5">
      <button
        @click="emit('toggle')"
        class="btn-premium w-16 h-16 rounded-full flex items-center justify-center"
        :class="isPaused ? 'btn-gradient-success' : 'btn-gradient-warning'"
        :title="isPaused ? 'Continuar' : 'Pausar'"
      >
        <span class="text-3xl">{{ isPaused ? "▶️" : "⏸️" }}</span>
      </button>

      <button
        @click="emit('complete')"
        class="btn-premium btn-gradient-success w-16 h-16 rounded-full flex items-center justify-center"
        title="Concluir tarefa"
      >
        <span class="text-3xl">✅</span>
      </button>

      <button
        @click="emit('skip')"
        class="btn-premium btn-gradient-danger w-16 h-16 rounded-full flex items-center justify-center"
        title="Pular tarefa"
      >
        <span class="text-3xl">⏭️</span>
      </button>
    </div>

    <!-- Quick Actions -->
    <div class="flex flex-wrap justify-center gap-3">
      <button
        @click="emit('add-time', 5)"
        class="btn-premium btn-glass px-4 py-2 text-sm"
      >
        <span class="mr-1">⏰</span> +5 min
      </button>
      <button
        @click="emit('add-time', 10)"
        class="btn-premium btn-glass px-4 py-2 text-sm"
      >
        <span class="mr-1">⏰</span> +10 min
      </button>
      <button
        @click="emit('distraction')"
        class="btn-premium btn-gradient-warning px-4 py-2 text-sm"
      >
        🚨 Distração
        <span
          v-if="distractionCount > 0"
          class="ml-2 px-2 py-0.5 bg-amber-500/30 rounded-full text-xs font-bold"
        >
          {{ distractionCount }}
        </span>
      </button>
    </div>
  </div>
</template>
