<script setup>
/**
 * CalendarView - Visualização de calendário do histórico
 */
defineProps({
  calendarDays: { type: Array, required: true },
});

const emit = defineEmits(["goToDay"]);

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
</script>

<template>
  <div class="glass-card p-6">
    <!-- Week Headers -->
    <div class="grid grid-cols-7 gap-2 mb-4">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-sm font-semibold text-gray-400"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="[
          'aspect-square p-2 rounded-xl transition-all duration-200',
          day.isPlaceholder ? '' : 'bg-white/5 hover:bg-white/10',
          day.isToday ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : '',
          day.total > 0 ? 'cursor-pointer' : '',
        ]"
        @click="day.date && $emit('goToDay', day.date)"
      >
        <template v-if="!day.isPlaceholder">
          <div
            :class="[
              'text-sm font-semibold mb-1',
              day.isToday ? 'text-primary' : 'text-white',
            ]"
          >
            {{ day.day }}
          </div>

          <div v-if="day.total > 0" class="space-y-1">
            <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                :style="{ width: `${(day.completed / day.total) * 100}%` }"
              />
            </div>
            <div class="text-[10px] text-gray-400 font-medium">
              {{ day.completed }}/{{ day.total }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
