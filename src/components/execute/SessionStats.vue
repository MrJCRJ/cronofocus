<script setup>
/**
 * SessionStats - Estatísticas da sessão de timer
 */
defineProps({
  elapsedMinutes: {
    type: Number,
    default: 0,
  },
  plannedMinutes: {
    type: Number,
    default: 0,
  },
  distractionCount: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <div class="grid grid-cols-3 gap-4 max-w-lg w-full">
    <div class="glass-card p-4 text-center">
      <div class="text-3xl font-bold text-indigo-400">
        {{ elapsedMinutes }}
      </div>
      <div class="text-xs text-gray-400 mt-1">min decorridos</div>
    </div>
    <div class="glass-card p-4 text-center">
      <div class="text-3xl font-bold text-white">
        {{ plannedMinutes }}
      </div>
      <div class="text-xs text-gray-400 mt-1">min planejados</div>
    </div>
    <div class="glass-card p-4 text-center">
      <div class="text-3xl font-bold text-amber-400">
        {{ distractionCount }}
      </div>
      <div class="text-xs text-gray-400 mt-1">distrações</div>
    </div>
  </div>
</template>
