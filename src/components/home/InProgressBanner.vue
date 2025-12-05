<script setup>
/**
 * InProgressBanner - Banner de tarefa em andamento
 */
defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["continue"]);
</script>

<template>
  <div
    class="mb-6 p-4 rounded-xl glass-card bg-linear-to-r from-amber-500/10 to-orange-500/10 animate-pulse-glow"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
        >
          <span class="text-2xl">⏱️</span>
        </div>
        <div>
          <p class="text-sm text-amber-400 font-medium">Em andamento</p>
          <h3 class="font-semibold text-lg text-white">
            {{ task.title }}
          </h3>
        </div>
      </div>
      <button
        @click="emit('continue')"
        class="btn-premium btn-gradient-warning px-4 py-2"
      >
        Continuar
      </button>
    </div>
  </div>
</template>
