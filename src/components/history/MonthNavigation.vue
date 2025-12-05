<script setup>
/**
 * MonthNavigation - Navegação entre meses do histórico
 */
defineProps({
  monthLabel: { type: String, required: true },
  viewMode: { type: String, required: true },
});

const emit = defineEmits(["navigate", "goToCurrentMonth", "update:viewMode"]);
</script>

<template>
  <div
    class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
  >
    <div class="animate-fade-in">
      <h1
        class="text-2xl lg:text-3xl font-bold flex items-center gap-3 text-white"
      >
        <span>📜</span>
        Histórico
      </h1>
      <p class="text-gray-400 mt-1 capitalize">{{ monthLabel }}</p>
    </div>

    <div class="flex items-center gap-4">
      <!-- View Toggle -->
      <div class="flex bg-white/5 rounded-xl p-1">
        <button
          @click="$emit('update:viewMode', 'list')"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            viewMode === 'list'
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'text-gray-400 hover:text-white',
          ]"
        >
          📋 Lista
        </button>
        <button
          @click="$emit('update:viewMode', 'calendar')"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            viewMode === 'calendar'
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'text-gray-400 hover:text-white',
          ]"
        >
          📅 Calendário
        </button>
      </div>

      <!-- Month Navigation -->
      <div class="flex items-center gap-2">
        <button
          @click="$emit('navigate', -1)"
          class="btn-premium btn-glass p-2.5"
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
          @click="$emit('goToCurrentMonth')"
          class="btn-premium btn-glass px-5 py-2.5 min-w-36 capitalize font-medium"
        >
          {{ monthLabel }}
        </button>
        <button
          @click="$emit('navigate', 1)"
          class="btn-premium btn-glass p-2.5"
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
  </div>
</template>
