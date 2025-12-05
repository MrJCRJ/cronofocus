/**
 * CronoFocus - Export CSV Module
 * Exportação para formato CSV
 */

import { useIndexedDB } from '../useIndexedDB'
import {
  isExporting,
  exportError,
  formatDateForFilename,
  downloadBlob,
  setLastExport
} from './utils'

/**
 * Exporta tarefas para CSV
 */
export async function exportToCSV(tasks, options = {}) {
  const { logExport } = useIndexedDB()
  
  try {
    isExporting.value = true
    exportError.value = null

    const {
      filename = `cronofocus_${formatDateForFilename(new Date())}.csv`,
      userId,
      includeHeaders = true,
      separator = ',',
      dateRange
    } = options

    // Headers do CSV
    const headers = [
      'Data',
      'Hora Início (Planejado)',
      'Hora Fim (Planejado)',
      'Hora Início (Real)',
      'Hora Fim (Real)',
      'Tarefa',
      'Categoria',
      'Status',
      'Duração Planejada (min)',
      'Duração Real (min)',
      'Distrações',
      'Avaliação',
      'Notas'
    ]

    // Converter tasks para linhas CSV
    const rows = tasks.map(task => [
      task.date,
      task.plannedStart,
      task.plannedEnd,
      task.actualStart || '',
      task.actualEnd || '',
      `"${(task.title || '').replace(/"/g, '""')}"`,
      task.category || '',
      task.status || '',
      task.plannedDuration || '',
      task.actualDuration || '',
      task.distractions?.length || 0,
      task.rating || '',
      `"${(task.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ])

    // Montar conteúdo CSV
    let csvContent = ''
    if (includeHeaders) {
      csvContent += headers.join(separator) + '\n'
    }
    csvContent += rows.map(row => row.join(separator)).join('\n')

    // Criar blob e fazer download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    downloadBlob(blob, filename)

    // Registrar exportação
    if (userId) {
      await logExport(userId, 'csv', {
        taskCount: tasks.length,
        dateRange,
        filename
      })
    }

    setLastExport('csv', filename, { taskCount: tasks.length })

    return { success: true, filename }
  } catch (error) {
    exportError.value = error.message
    console.error('Erro ao exportar CSV:', error)
    return { success: false, error: error.message }
  } finally {
    isExporting.value = false
  }
}
