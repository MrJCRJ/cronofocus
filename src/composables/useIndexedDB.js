/**
 * CronoFocus - IndexedDB Composable
 * Sistema de persistência local modularizado
 */

import { readonly } from 'vue'

// Importar módulos
import { db, isReady, dbError, initDB } from './db/core'
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './db/schema'
import {
  add,
  get,
  getAll,
  update,
  remove,
  getByIndex,
  getByIndexRange,
  clearStore,
  count
} from './db/crud'
import {
  createUser,
  getUserByUsername,
  updateLastLogin,
  getOrCreateDay,
  getDaysByRange,
  getTasksByDay,
  getTasksByDateRange,
  createTask,
  updateTaskStatus,
  getCategoriesByUser,
  createCategory,
  addDistraction,
  getDistractionsByTask,
  getUserSettings,
  updateUserSettings,
  logExport,
  getExportHistory
} from './db/entities'
import {
  getDayStats,
  getWeekStats,
  exportAllData,
  importData
} from './db/stats'

/**
 * Composable principal para IndexedDB
 * Expõe todas as funcionalidades do banco de dados
 */
export function useIndexedDB() {
  return {
    // Estado
    db: readonly(db),
    isReady: readonly(isReady),
    error: readonly(dbError),

    // Inicialização
    initDB,

    // CRUD genérico
    add,
    get,
    getAll,
    update,
    remove,
    getByIndex,
    getByIndexRange,
    clearStore,
    count,

    // Users
    createUser,
    getUserByUsername,
    updateLastLogin,

    // Days
    getOrCreateDay,
    getDaysByRange,

    // Tasks
    getTasksByDay,
    getTasksByDateRange,
    createTask,
    updateTaskStatus,

    // Categories
    getCategoriesByUser,
    createCategory,
    DEFAULT_CATEGORIES,

    // Distractions
    addDistraction,
    getDistractionsByTask,

    // Settings
    getUserSettings,
    updateUserSettings,
    DEFAULT_SETTINGS,

    // Exports
    logExport,
    getExportHistory,

    // Stats
    getDayStats,
    getWeekStats,

    // Backup
    exportAllData,
    importData
  }
}
