/**
 * CronoFocus - Export JSON Module
 * Exportação e importação para formato JSON
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
 * Exporta dados para JSON
 */
export async function exportToJSON(data, options = {}) {
  const { logExport, exportAllData } = useIndexedDB()

  try {
    isExporting.value = true
    exportError.value = null

    const {
      filename = `cronofocus_backup_${formatDateForFilename(new Date())}.json`,
      userId,
      pretty = true,
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

    setLastExport('json', filename, { dataSize: jsonContent.length })

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
 * Importa dados de JSON
 */
export async function importFromJSON(file) {
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
