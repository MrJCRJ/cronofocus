<script setup>
/**
 * InsightsList - Lista de insights e sugestões
 */
defineProps({
  insights: { type: Array, required: true },
});
</script>

<template>
  <div v-if="insights.length > 0" class="mt-8">
    <h3 class="font-semibold mb-4 flex items-center gap-2 text-white">
      <span>💡</span>
      Insights
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(insight, index) in insights"
        :key="index"
        :class="[
          'glass-card p-5 transition-all duration-300 hover:scale-[1.02]',
          insight.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : '',
          insight.type === 'warning'
            ? 'bg-amber-500/10 border-amber-500/30'
            : '',
          insight.type === 'info' ? 'bg-blue-500/10 border-blue-500/30' : '',
        ]"
      >
        <div class="flex items-start gap-4">
          <span class="text-3xl">{{ insight.icon }}</span>
          <div>
            <h4 class="font-semibold text-white">{{ insight.title }}</h4>
            <p class="text-sm text-gray-400 mt-1">{{ insight.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
