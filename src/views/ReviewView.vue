<script setup>
/**
 * ReviewView - Análise refatorada
 * Componentes: StatsOverview, WeeklyChart, CategoryBreakdown, InsightsList
 */
import { ref, computed, onMounted } from 'vue'
import { useTimeStore } from '@/stores/timeStore'
import { useSettingsStore } from '@/stores/settingsStore'

import StatsOverview from '@/components/review/StatsOverview.vue'
import WeeklyChart from '@/components/review/WeeklyChart.vue'
import CategoryBreakdown from '@/components/review/CategoryBreakdown.vue'
import InsightsList from '@/components/review/InsightsList.vue'

const timeStore = useTimeStore()
const settingsStore = useSettingsStore()

const dayStats = ref(null)
const weekStats = ref(null)
const loading = ref(true)

onMounted(loadStats)

async function loadStats() {
  loading.value = true
  try {
    dayStats.value = await timeStore.getDayStats()
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1)
    weekStats.value = await timeStore.getWeekStats(weekStart.toISOString().split('T')[0])
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
  }
  loading.value = false
}

const insights = computed(() => {
  if (!dayStats.value) return []
  const list = []

  if (dayStats.value.completionRate >= 80) {
    list.push({
      type: 'success', icon: '🎉', title: 'Excelente produtividade!',
      message: `Você completou ${dayStats.value.completionRate}% das suas tarefas hoje.`
    })
  } else if (dayStats.value.completionRate < 50 && dayStats.value.totalTasks > 0) {
    list.push({
      type: 'warning', icon: '💪', title: 'Ainda dá tempo!',
      message: `Você tem ${dayStats.value.planned} tarefas pendentes. Foco!`
    })
  }

  if (dayStats.value.efficiencyRate > 100) {
    list.push({
      type: 'info', icon: '⏱️', title: 'Tarefas levando mais tempo',
      message: 'Considere estimar mais tempo para tarefas similares.'
    })
  } else if (dayStats.value.efficiencyRate > 0 && dayStats.value.efficiencyRate < 80) {
    list.push({
      type: 'success', icon: '🚀', title: 'Mais rápido que o esperado!',
      message: 'Você está terminando as tarefas antes do planejado.'
    })
  }

  if (dayStats.value.totalDistractions > 5) {
    list.push({
      type: 'warning', icon: '🔔', title: 'Muitas distrações',
      message: 'Considere desativar notificações durante o foco.'
    })
  } else if (dayStats.value.totalDistractions === 0 && dayStats.value.completed > 0) {
    list.push({
      type: 'success', icon: '🧘', title: 'Foco total!',
      message: 'Nenhuma distração registrada. Excelente concentração!'
    })
  }
  return list
})

const categoryBreakdown = computed(() => {
  if (!dayStats.value?.byCategory) return []
  return Object.entries(dayStats.value.byCategory)
    .map(([id, data]) => {
      const category = timeStore.categories.find(c => c.id === id) || { name: id, color: '#6b7280', icon: '📌' }
      return {
        ...category, ...data,
        percentage: dayStats.value.totalActualMinutes > 0
          ? Math.round((data.actualMinutes / dayStats.value.totalActualMinutes) * 100) : 0
      }
    })
    .sort((a, b) => b.actualMinutes - a.actualMinutes)
})

const dailyCompletionData = computed(() => weekStats.value?.dailyCompletion || [])
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 pt-16">
    <div class="max-w-7xl mx-auto p-4 lg:p-6">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div class="animate-fade-in">
          <h1 class="text-2xl lg:text-3xl font-bold flex items-center gap-3 text-white">
            <span>📊</span>
            Análise do Dia
          </h1>
          <p class="text-gray-400 mt-1">{{ settingsStore.formatDate(timeStore.selectedDate) }}</p>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full"></div>
      </div>

      <template v-else>
        <StatsOverview :dayStats="dayStats" :formatDuration="settingsStore.formatDuration" />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <WeeklyChart :dailyCompletionData="dailyCompletionData" :formatDuration="settingsStore.formatDuration" />
          <CategoryBreakdown :categoryBreakdown="categoryBreakdown" :formatDuration="settingsStore.formatDuration" />
        </div>

        <InsightsList :insights="insights" />
      </template>
    </div>
  </div>
</template>
