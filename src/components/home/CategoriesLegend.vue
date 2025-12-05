<script setup>
/**
 * CategoriesLegend - Legenda de categorias
 */
defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div class="glass-card p-4">
    <h3 class="font-semibold mb-4 flex items-center gap-2 text-white">
      <span>🏷️</span>
      Categorias
    </h3>

    <div class="space-y-2">
      <div
        v-for="category in categories"
        :key="category.id"
        class="flex items-center gap-3 text-sm text-gray-300"
      >
        <div
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: category.color }"
        />
        <span>{{ category.icon }} {{ category.name }}</span>
      </div>

      <p v-if="!categories.length" class="text-sm text-gray-500">
        Nenhuma categoria cadastrada
      </p>
    </div>
  </div>
</template>
