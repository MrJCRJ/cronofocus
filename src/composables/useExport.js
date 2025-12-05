/**
 * CronoFocus - Export Composable
 * Exportação de dados em CSV, JSON e PNG
 */

import { ref, readonly } from 'vue'
import html2canvas from 'html2canvas'
import { useIndexedDB } from './useIndexedDB'

// Estado
const isExporting = ref(false)
const exportError = ref(null)
const lastExport = ref(null)

/**
 * Composable de exportação
 */
export function useExport() {
  const { logExport, exportAllData } = useIndexedDB()

  /**
   * Formata data para nome de arquivo
   */
  function formatDateForFilename(date) {
    return new Date(date).toISOString().split('T')[0]
  }

  /**
   * Download de blob como arquivo
   */
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Exporta para CSV
   */
  async function exportToCSV(tasks, options = {}) {
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

      lastExport.value = {
        format: 'csv',
        filename,
        taskCount: tasks.length,
        timestamp: new Date().toISOString()
      }

      return { success: true, filename }
    } catch (error) {
      exportError.value = error.message
      console.error('Erro ao exportar CSV:', error)
      return { success: false, error: error.message }
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Exporta para JSON
   */
  async function exportToJSON(data, options = {}) {
    try {
      isExporting.value = true
      exportError.value = null

      const {
        filename = `cronofocus_backup_${formatDateForFilename(new Date())}.json`,
        userId,
        pretty = true,
        includeSettings = true,
        dateRange
      } = options

      // Se for userId, exportar todos os dados do usuário
      let exportData
      if (userId && !data) {
        exportData = await exportAllData(userId)
      } else {
        exportData = {
          meta: {
            exportDate: new Date().toISOString(),
            version: '1.0',
            app: 'CronoFocus',
            dateRange
          },
          ...data
        }
      }

      // Criar JSON
      const jsonContent = pretty
        ? JSON.stringify(exportData, null, 2)
        : JSON.stringify(exportData)

      // Criar blob e fazer download
      const blob = new Blob([jsonContent], { type: 'application/json' })
      downloadBlob(blob, filename)

      // Registrar exportação
      if (userId) {
        await logExport(userId, 'json', {
          dataSize: jsonContent.length,
          dateRange,
          filename
        })
      }

      lastExport.value = {
        format: 'json',
        filename,
        dataSize: jsonContent.length,
        timestamp: new Date().toISOString()
      }

      return { success: true, filename }
    } catch (error) {
      exportError.value = error.message
      console.error('Erro ao exportar JSON:', error)
      return { success: false, error: error.message }
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Exporta para PNG (captura de tela)
   */
  async function exportToPNG(elementId, options = {}) {
    try {
      isExporting.value = true
      exportError.value = null

      const {
        filename = `cronofocus_agenda_${formatDateForFilename(new Date())}.png`,
        userId,
        scale = 2,
        backgroundColor = '#0f172a',
        width = 800,
        padding = 24,
        dateRange
      } = options

      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error(`Elemento #${elementId} não encontrado`)
      }

      // Adicionar classe de exportação para estilos específicos
      element.classList.add('export-mode')

      // Configurar html2canvas
      const canvas = await html2canvas(element, {
        backgroundColor,
        scale,
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId)
          if (clonedElement) {
            clonedElement.style.width = `${width}px`
            clonedElement.style.padding = `${padding}px`
            clonedElement.style.minHeight = 'auto'

            // Remover elementos que não devem aparecer na exportação
            const hideElements = clonedElement.querySelectorAll('[data-export-hide]')
            hideElements.forEach(el => el.style.display = 'none')
          }
        }
      })

      // Restaurar estilos
      element.classList.remove('export-mode')

      // Converter para blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 0.95)
      })

      // Download
      downloadBlob(blob, filename)

      // Registrar exportação
      if (userId) {
        await logExport(userId, 'png', {
          width: canvas.width,
          height: canvas.height,
          dateRange,
          filename
        })
      }

      lastExport.value = {
        format: 'png',
        filename,
        dimensions: { width: canvas.width, height: canvas.height },
        timestamp: new Date().toISOString()
      }

      return { success: true, filename }
    } catch (error) {
      // Garantir que a classe de exportação seja removida mesmo em caso de erro
      const element = document.getElementById(elementId)
      if (element) {
        element.classList.remove('export-mode')
      }

      exportError.value = error.message
      console.error('Erro ao exportar PNG:', error)
      return { success: false, error: error.message }
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Importa dados de JSON
   */
  async function importFromJSON(file) {
    try {
      isExporting.value = true
      exportError.value = null

      const content = await file.text()
      const data = JSON.parse(content)

      // Validar estrutura
      if (!data.meta || data.meta.app !== 'CronoFocus') {
        throw new Error('Arquivo inválido ou de versão incompatível')
      }

      return { success: true, data }
    } catch (error) {
      exportError.value = error.message
      console.error('Erro ao importar JSON:', error)
      return { success: false, error: error.message }
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Gera relatório em texto formatado
   */
  function generateTextReport(data, options = {}) {
    const { title = 'Relatório CronoFocus', dateRange } = options

    let report = `
╔════════════════════════════════════════════════════════════╗
║                     ${title.padStart(20).padEnd(40)}║
╠════════════════════════════════════════════════════════════╣
`

    if (dateRange) {
      report += `║  Período: ${dateRange.start} até ${dateRange.end}`.padEnd(61) + '║\n'
    }

    report += `║  Gerado em: ${new Date().toLocaleString('pt-BR')}`.padEnd(61) + '║\n'
    report += '╠════════════════════════════════════════════════════════════╣\n'

    // Estatísticas gerais
    if (data.stats) {
      report += '║  📊 RESUMO GERAL'.padEnd(61) + '║\n'
      report += '╟────────────────────────────────────────────────────────────╢\n'
      report += `║  • Total de tarefas: ${data.stats.totalTasks}`.padEnd(61) + '║\n'
      report += `║  • Concluídas: ${data.stats.completed} (${data.stats.completionRate}%)`.padEnd(61) + '║\n'
      report += `║  • Tempo planejado: ${Math.round(data.stats.totalPlannedMinutes / 60)}h`.padEnd(61) + '║\n'
      report += `║  • Tempo real: ${Math.round(data.stats.totalActualMinutes / 60)}h`.padEnd(61) + '║\n'
      report += `║  • Distrações: ${data.stats.totalDistractions}`.padEnd(61) + '║\n'
    }

    // Tarefas por categoria
    if (data.stats?.byCategory) {
      report += '╠════════════════════════════════════════════════════════════╣\n'
      report += '║  📁 POR CATEGORIA'.padEnd(61) + '║\n'
      report += '╟────────────────────────────────────────────────────────────╢\n'

      for (const [category, stats] of Object.entries(data.stats.byCategory)) {
        report += `║  • ${category}: ${stats.count} tarefas, ${stats.actualMinutes}min`.padEnd(61) + '║\n'
      }
    }

    // Lista de tarefas
    if (data.tasks?.length > 0) {
      report += '╠════════════════════════════════════════════════════════════╣\n'
      report += '║  📋 TAREFAS DETALHADAS'.padEnd(61) + '║\n'
      report += '╟────────────────────────────────────────────────────────────╢\n'

      for (const task of data.tasks) {
        const status = task.status === 'completed' ? '✅' : task.status === 'skipped' ? '⏭️' : '⏳'
        report += `║  ${status} ${task.date} ${task.plannedStart} - ${task.title.substring(0, 30)}`.padEnd(61) + '║\n'
      }
    }

    report += '╚════════════════════════════════════════════════════════════╝\n'

    return report
  }

  /**
   * Copia relatório para clipboard
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text)
      return { success: true }
    } catch (error) {
      exportError.value = error.message
      return { success: false, error: error.message }
    }
  }

  return {
    // Estado
    isExporting: readonly(isExporting),
    exportError: readonly(exportError),
    lastExport: readonly(lastExport),

    // Métodos
    exportToCSV,
    exportToJSON,
    exportToPNG,
    importFromJSON,
    generateTextReport,
    copyToClipboard,
    downloadBlob
  }
}
