<script setup>
/**
 * CategoryBreakdown - Breakdown por categoria
 */
defineProps({
  categoryBreakdown: { type: Array, required: true },
  formatDuration: { type: Function, required: true },
});
</script>

<template>
  <div class="glass-card p-6">
    <h3 class="font-semibold mb-6 flex items-center gap-2 text-white">
      <span>🏷️</span>
      Por Categoria
    </h3>

    <div v-if="categoryBreakdown.length > 0" class="space-y-5">
      <div v-for="cat in categoryBreakdown" :key="cat.id" class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="flex items-center gap-2 text-gray-300">
            <span class="text-lg">{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
          </span>
          <span class="font-bold text-white">{{ cat.percentage }}%</span>
        </div>
        <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-500"
            :style="{
              width: `${cat.percentage}%`,
              backgroundColor: cat.color,
              boxShadow: `0 0 10px ${cat.color}60`,
            }"
          />
        </div>
        <div class="text-xs text-gray-500">
          {{ cat.completed }}/{{ cat.count }} tarefas •
          {{ formatDuration(cat.actualMinutes) }}
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      Nenhuma categoria ainda
    </div>
  </div>
</template>
