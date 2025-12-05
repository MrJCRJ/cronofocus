/**
 * CronoFocus - Export Utils Module
 * Funções auxiliares para exportação
 */

import { ref, readonly } from 'vue'

// Estado global de exportação
export const isExporting = ref(false)
export const exportError = ref(null)
export const lastExport = ref(null)

/**
 * Formata data para nome de arquivo
 */
export function formatDateForFilename(date) {
  return new Date(date).toISOString().split('T')[0]
}

/**
 * Download de blob como arquivo
 */
export function downloadBlob(blob, filename) {
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
 * Registra resultado de exportação
 */
export function setLastExport(format, filename, extraData = {}) {
  lastExport.value = {
    format,
    filename,
    timestamp: new Date().toISOString(),
    ...extraData
  }
}

/**
 * Copia texto para clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return { success: true }
  } catch (error) {
    exportError.value = error.message
    return { success: false, error: error.message }
  }
}

/**
 * Estado readonly para consumo externo
 */
export const readonlyState = {
  isExporting: readonly(isExporting),
  exportError: readonly(exportError),
  lastExport: readonly(lastExport)
}
