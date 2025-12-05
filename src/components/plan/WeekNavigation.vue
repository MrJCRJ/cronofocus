<script setup>
/**
 * WeekNavigation - Navegação entre semanas
 */
defineProps({
  weekLabel: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["navigate", "current"]);
</script>

<template>
  <div class="flex items-center gap-2">
    <button @click="emit('navigate', -1)" class="btn-premium btn-glass p-2.5">
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
      @click="emit('current')"
      class="btn-premium btn-glass px-6 py-2.5 min-w-44 font-medium"
    >
      {{ weekLabel }}
    </button>

    <button @click="emit('navigate', 1)" class="btn-premium btn-glass p-2.5">
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
</template>
