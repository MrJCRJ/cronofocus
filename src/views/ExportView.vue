<script setup>
/**
 * ExportView - Exportação refatorada
 * Componentes: FormatSelector, DateRangeSelector, ExportPreview
 */
import { ref, computed } from 'vue'
import { useTimeStore } from '@/stores/timeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useAuthStore } from '@/stores/authStore'
import { useExport } from '@/composables/useExport'

import FormatSelector from '@/components/export/FormatSelector.vue'
import DateRangeSelector from '@/components/export/DateRangeSelector.vue'
import ExportPreview from '@/components/export/ExportPreview.vue'

const timeStore = useTimeStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const { exportToCSV, exportToJSON, exportToPNG, isExporting, lastExport } = useExport()

const exportFormat = ref('csv')
const dateRangeType = ref('week')
const customStartDate = ref('')
const customEndDate = ref('')
const exportSuccess = ref(false)
const exportError = ref('')

const formats = [
  { id: 'csv', name: 'CSV', icon: '📊', description: 'Para Excel/Google Sheets' },
  { id: 'json', name: 'JSON', icon: '📦', description: 'Backup completo' },
  { id: 'png', name: 'PNG', icon: '🖼️', description: 'Imagem da agenda' }
]

const dateRanges = [
  { id: 'today', name: 'Hoje' },
  { id: 'week', name: 'Esta Semana' },
  { id: 'month', name: 'Este Mês' },
  { id: 'all', name: 'Todos os Dados' },
  { id: 'custom', name: 'Período Personalizado' }
]

const dateRange = computed(() => {
  const today = new Date()
  let start, end

  switch (dateRangeType.value) {
    case 'today':
      start = end = today.toISOString().split('T')[0]
      break
    case 'week':
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      start = weekStart.toISOString().split('T')[0]
      end = today.toISOString().split('T')[0]
      break
    case 'month':
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
      end = today.toISOString().split('T')[0]
      break
    case 'all':
      start = '2020-01-01'
      end = today.toISOString().split('T')[0]
      break
    case 'custom':
      start = customStartDate.value || today.toISOString().split('T')[0]
      end = customEndDate.value || today.toISOString().split('T')[0]
      break
  }
  return { start, end }
})

async function handleExport() {
  try {
    exportSuccess.value = false
    exportError.value = ''

    const { start, end } = dateRange.value
    const tasks = await timeStore.getTasksByDateRange(start, end)
    const options = { userId: authStore.user?.id, dateRange: { start, end } }

    let result
    switch (exportFormat.value) {
      case 'csv': result = await exportToCSV(tasks, options); break
      case 'json': result = await exportToJSON(null, options); break
      case 'png': result = await exportToPNG('agenda-timeline', options); break
    }

    if (result.success) {
      exportSuccess.value = true
      setTimeout(() => { exportSuccess.value = false }, 3000)
    } else {
      exportError.value = result.error
    }
  } catch (error) {
    exportError.value = error.message
  }
}

const previewData = computed(() => ({
  format: formats.find(f => f.id === exportFormat.value),
  dateRange: dateRanges.find(d => d.id === dateRangeType.value),
  dates: dateRange.value
}))
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 pt-16">
    <div class="max-w-4xl mx-auto p-4 lg:p-6">
      <!-- Header -->
      <div class="mb-8 animate-fade-in">
        <h1 class="text-2xl lg:text-3xl font-bold flex items-center gap-3 text-white">
          <span>📤</span>Exportar Dados
        </h1>
        <p class="text-gray-400 mt-1">Exporte suas tarefas e estatísticas em diferentes formatos</p>
      </div>

      <!-- Export Form -->
      <div class="glass-card p-6 space-y-8">
        <FormatSelector :formats="formats" v-model:exportFormat="exportFormat" />
        <DateRangeSelector
          :dateRanges="dateRanges"
          v-model:dateRangeType="dateRangeType"
          v-model:customStartDate="customStartDate"
          v-model:customEndDate="customEndDate"
        />
        <ExportPreview :previewData="previewData" :exportFormat="exportFormat" :formatDate="settingsStore.formatDate" />

        <!-- Messages -->
        <div v-if="exportError" class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
          <span class="text-xl">❌</span><span>{{ exportError }}</span>
        </div>
        <div v-if="exportSuccess" class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-3">
          <span class="text-xl">✅</span><span>Exportação realizada com sucesso!</span>
        </div>

        <!-- Export Button -->
        <button @click="handleExport" :disabled="isExporting" class="btn-premium btn-primary w-full py-4 text-lg font-semibold">
          <span v-if="isExporting" class="animate-spin mr-2">⏳</span>
          <span v-else class="mr-2">📥</span>
          Exportar {{ formats.find(f => f.id === exportFormat)?.name }}
        </button>
      </div>

      <!-- Last Export -->
      <div v-if="lastExport" class="mt-6 glass-card p-5">
        <h4 class="font-medium mb-3 text-white flex items-center gap-2"><span>📄</span>Última Exportação</h4>
        <div class="text-sm text-gray-400 space-y-1">
          <p>Arquivo: <span class="text-gray-300">{{ lastExport.filename }}</span></p>
          <p>Formato: <span class="text-gray-300">{{ lastExport.format?.toUpperCase() }}</span></p>
          <p>Data: <span class="text-gray-300">{{ new Date(lastExport.timestamp).toLocaleString('pt-BR') }}</span></p>
        </div>
      </div>

      <!-- Import Section -->
      <div class="mt-8 glass-card p-6">
        <h3 class="font-semibold mb-4 flex items-center gap-2 text-white"><span>📥</span>Importar Dados</h3>
        <p class="text-gray-400 mb-4">Restaure seus dados a partir de um backup JSON exportado anteriormente.</p>
        <input type="file" accept=".json" class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-medium file:cursor-pointer cursor-pointer" />
        <p class="text-xs text-gray-500 mt-3">Apenas arquivos JSON exportados pelo CronoFocus são aceitos.</p>
      </div>
    </div>
  </div>
</template>
