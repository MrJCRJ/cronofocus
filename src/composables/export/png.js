/**
 * CronoFocus - Export PNG Module
 * Exportação de captura de tela para PNG
 */

import html2canvas from 'html2canvas'
import { useIndexedDB } from '../useIndexedDB'
import {
  isExporting,
  exportError,
  formatDateForFilename,
  downloadBlob,
  setLastExport
} from './utils'

/**
 * Exporta elemento para PNG (captura de tela)
 */
export async function exportToPNG(elementId, options = {}) {
  const { logExport } = useIndexedDB()
  
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

    setLastExport('png', filename, {
      dimensions: { width: canvas.width, height: canvas.height }
    })

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
