<script setup>
/**
 * DateRangeSelector - Seletor de período para exportação
 */
defineProps({
  dateRanges: { type: Array, required: true },
  dateRangeType: { type: String, required: true },
  customStartDate: { type: String, default: "" },
  customEndDate: { type: String, default: "" },
});

const emit = defineEmits([
  "update:dateRangeType",
  "update:customStartDate",
  "update:customEndDate",
]);
</script>

<template>
  <div>
    <h3 class="font-semibold mb-4 text-white">Período</h3>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="range in dateRanges"
        :key="range.id"
        @click="$emit('update:dateRangeType', range.id)"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          dateRangeType === range.id
            ? 'bg-primary text-white shadow-lg shadow-primary/30'
            : 'bg-white/5 text-gray-300 hover:bg-white/10',
        ]"
      >
        {{ range.name }}
      </button>
    </div>

    <!-- Custom Date Inputs -->
    <div v-if="dateRangeType === 'custom'" class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm mb-2 text-gray-300">Data Inicial</label>
        <input
          :value="customStartDate"
          @input="$emit('update:customStartDate', $event.target.value)"
          type="date"
          class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
      </div>
      <div>
        <label class="block text-sm mb-2 text-gray-300">Data Final</label>
        <input
          :value="customEndDate"
          @input="$emit('update:customEndDate', $event.target.value)"
          type="date"
          class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
      </div>
    </div>
  </div>
</template>
