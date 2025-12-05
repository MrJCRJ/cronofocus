/**
 * CronoFocus - Export Composable
 * Sistema de exportação modularizado
 */

// Importar módulos
import { readonlyState, downloadBlob, copyToClipboard } from './export/utils'
import { exportToCSV } from './export/csv'
import { exportToJSON, importFromJSON } from './export/json'
import { exportToPNG } from './export/png'
import { generateTextReport, generateMarkdownReport } from './export/report'

/**
 * Composable de exportação
 */
export function useExport() {
  return {
    // Estado
    ...readonlyState,

    // Métodos de exportação
    exportToCSV,
    exportToJSON,
    exportToPNG,
    importFromJSON,

    // Relatórios
    generateTextReport,
    generateMarkdownReport,

    // Utilitários
    copyToClipboard,
    downloadBlob
  }
}
