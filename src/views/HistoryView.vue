<script setup>
/**
 * HistoryView - Histórico refatorado
 * Componentes: MonthNavigation, MonthStats, HistoryList, CalendarView
 */
import { ref, computed, onMounted } from 'vue'
import { useTimeStore } from '@/stores/timeStore'
import { useSettingsStore } from '@/stores/settingsStore'

import MonthNavigation from '@/components/history/MonthNavigation.vue'
import MonthStats from '@/components/history/MonthStats.vue'
import HistoryList from '@/components/history/HistoryList.vue'
import CalendarView from '@/components/history/CalendarView.vue'

const timeStore = useTimeStore()
const settingsStore = useSettingsStore()

const viewMode = ref('list')
const selectedMonth = ref(new Date().toISOString().slice(0, 7))
const historyData = ref([])
const loading = ref(true)

onMounted(loadHistory)

async function loadHistory() {
  loading.value = true
  try {
    const [year, month] = selectedMonth.value.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const tasks = await timeStore.getTasksByDateRange(startDate, endDate)

    const grouped = {}
    tasks.forEach(task => {
      if (!grouped[task.date]) grouped[task.date] = []
      grouped[task.date].push(task)
    })

    historyData.value = Object.entries(grouped)
      .map(([date, tasks]) => ({
        date,
        tasks: tasks.sort((a, b) => a.plannedStart.localeCompare(b.plannedStart)),
        completed: tasks.filter(t => t.status === 'completed').length,
        total: tasks.length,
        totalMinutes: tasks.reduce((sum, t) => sum + (t.actualDuration || 0), 0)
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch (error) {
    console.error('Erro ao carregar histórico:', error)
  }
  loading.value = false
}

function navigateMonth(direction) {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const newDate = new Date(year, month - 1 + direction, 1)
  selectedMonth.value = newDate.toISOString().slice(0, 7)
  loadHistory()
}

function goToCurrentMonth() {
  selectedMonth.value = new Date().toISOString().slice(0, 7)
  loadHistory()
}

function goToDay(date) {
  timeStore.setDate(date)
}

function getTaskCategory(task) {
  return timeStore.categories.find(c => c.id === task.category) || { color: '#6b7280', icon: '📌' }
}

const monthLabel = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
})

const monthStats = computed(() => {
  const total = historyData.value.reduce((sum, day) => sum + day.total, 0)
  const completed = historyData.value.reduce((sum, day) => sum + day.completed, 0)
  const totalMinutes = historyData.value.reduce((sum, day) => sum + day.totalMinutes, 0)
  const daysWithTasks = historyData.value.length
  return {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalMinutes,
    daysWithTasks,
    avgTasksPerDay: daysWithTasks > 0 ? Math.round(total / daysWithTasks) : 0
  }
})

const calendarDays = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const days = []

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ date: null, isPlaceholder: true })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayData = historyData.value.find(h => h.date === date)
    days.push({
      date,
      day: d,
      isToday: date === new Date().toISOString().split('T')[0],
      tasks: dayData?.tasks || [],
      completed: dayData?.completed || 0,
      total: dayData?.total || 0
    })
  }
  return days
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 pt-16">
    <div class="max-w-7xl mx-auto p-4 lg:p-6">
      <MonthNavigation
        :monthLabel="monthLabel"
        v-model:viewMode="viewMode"
        @navigate="navigateMonth"
        @goToCurrentMonth="goToCurrentMonth"
      />

      <MonthStats :monthStats="monthStats" :formatDuration="settingsStore.formatDuration" />

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full"></div>
      </div>

      <HistoryList
        v-else-if="viewMode === 'list'"
        :historyData="historyData"
        :formatDuration="settingsStore.formatDuration"
        :getTaskCategory="getTaskCategory"
        @goToDay="goToDay"
      />

      <CalendarView v-else :calendarDays="calendarDays" @goToDay="goToDay" />
    </div>
  </div>
</template>
