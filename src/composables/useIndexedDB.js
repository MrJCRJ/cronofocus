/**
 * CronoFocus - IndexedDB Composable
 * Sistema de persistência local com schema completo
 */

import { ref, readonly } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const DB_NAME = 'CronoFocusDB'
const DB_VERSION = 1

// Estado global do banco
const db = ref(null)
const isReady = ref(false)
const error = ref(null)

// Schema do banco de dados
const DB_SCHEMA = {
  users: {
    keyPath: 'id',
    indexes: [
      { name: 'username', keyPath: 'username', options: { unique: true } },
      { name: 'email', keyPath: 'email', options: { unique: false } }
    ]
  },
  days: {
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId', options: { unique: false } },
      { name: 'date', keyPath: 'date', options: { unique: false } },
      { name: 'userDate', keyPath: ['userId', 'date'], options: { unique: true } }
    ]
  },
  tasks: {
    keyPath: 'id',
    indexes: [
      { name: 'dayId', keyPath: 'dayId', options: { unique: false } },
      { name: 'userId', keyPath: 'userId', options: { unique: false } },
      { name: 'date', keyPath: 'date', options: { unique: false } },
      { name: 'category', keyPath: 'category', options: { unique: false } },
      { name: 'status', keyPath: 'status', options: { unique: false } },
      { name: 'userDate', keyPath: ['userId', 'date'], options: { unique: false } }
    ]
  },
  categories: {
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId', options: { unique: false } },
      { name: 'color', keyPath: 'color', options: { unique: false } }
    ]
  },
  settings: {
    keyPath: 'userId',
    indexes: [
      { name: 'notificationsEnabled', keyPath: 'notificationsEnabled', options: { unique: false } }
    ]
  },
  exports: {
    keyPath: 'id',
    indexes: [
      { name: 'userId', keyPath: 'userId', options: { unique: false } },
      { name: 'date', keyPath: 'date', options: { unique: false } },
      { name: 'format', keyPath: 'format', options: { unique: false } }
    ]
  },
  distractions: {
    keyPath: 'id',
    indexes: [
      { name: 'taskId', keyPath: 'taskId', options: { unique: false } },
      { name: 'userId', keyPath: 'userId', options: { unique: false } },
      { name: 'timestamp', keyPath: 'timestamp', options: { unique: false } }
    ]
  }
}

// Categorias padrão
const DEFAULT_CATEGORIES = [
  { id: 'work', name: 'Trabalho', color: '#3b82f6', icon: '💼' },
  { id: 'study', name: 'Estudo', color: '#8b5cf6', icon: '📚' },
  { id: 'exercise', name: 'Exercício', color: '#10b981', icon: '🏃' },
  { id: 'personal', name: 'Pessoal', color: '#f59e0b', icon: '✨' },
  { id: 'leisure', name: 'Lazer', color: '#ec4899', icon: '🎮' },
  { id: 'sleep', name: 'Descanso', color: '#6366f1', icon: '😴' },
  { id: 'health', name: 'Saúde', color: '#14b8a6', icon: '❤️' },
  { id: 'social', name: 'Social', color: '#f97316', icon: '👥' }
]

// Configurações padrão
const DEFAULT_SETTINGS = {
  timeInterval: 30, // minutos
  dayStartHour: 6,
  dayEndHour: 23,
  notificationsEnabled: true,
  soundEnabled: true,
  soundVolume: 0.3,
  reminderMinutes: 5,
  theme: 'dark',
  weekStartsOn: 0, // 0 = Domingo
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h'
}

/**
 * Inicializa o banco de dados IndexedDB
 */
function initDB() {
  return new Promise((resolve, reject) => {
    if (db.value) {
      resolve(db.value)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      error.value = event.target.error
      console.error('Erro ao abrir IndexedDB:', event.target.error)
      reject(event.target.error)
    }

    request.onsuccess = (event) => {
      db.value = event.target.result
      isReady.value = true
      console.log('IndexedDB conectado com sucesso')
      resolve(db.value)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Criar stores conforme schema
      Object.entries(DB_SCHEMA).forEach(([storeName, config]) => {
        if (!database.objectStoreNames.contains(storeName)) {
          const store = database.createObjectStore(storeName, {
            keyPath: config.keyPath
          })

          // Criar índices
          config.indexes.forEach(index => {
            store.createIndex(index.name, index.keyPath, index.options)
          })

          console.log(`Store "${storeName}" criado com sucesso`)
        }
      })
    }
  })
}

/**
 * Operações CRUD genéricas
 */
function getStore(storeName, mode = 'readonly') {
  if (!db.value) throw new Error('Database não inicializado')
  const transaction = db.value.transaction(storeName, mode)
  return transaction.objectStore(storeName)
}

async function add(storeName, data) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const item = {
      ...data,
      id: data.id || uuidv4(),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const request = store.add(item)
    request.onsuccess = () => resolve(item)
    request.onerror = () => reject(request.error)
  })
}

async function get(storeName, id) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getAll(storeName) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

async function update(storeName, data) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const item = {
      ...data,
      updatedAt: new Date().toISOString()
    }

    const request = store.put(item)
    request.onsuccess = () => resolve(item)
    request.onerror = () => reject(request.error)
  })
}

async function remove(storeName, id) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const request = store.delete(id)
    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}

async function getByIndex(storeName, indexName, value) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const index = store.index(indexName)
    const request = index.getAll(value)
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

async function getByIndexRange(storeName, indexName, lowerBound, upperBound) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const index = store.index(indexName)
    const range = IDBKeyRange.bound(lowerBound, upperBound)
    const request = index.getAll(range)
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

async function clearStore(storeName) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite')
    const request = store.clear()
    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}

async function count(storeName) {
  await initDB()
  return new Promise((resolve, reject) => {
    const store = getStore(storeName)
    const request = store.count()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Operações específicas para Users
 */
async function createUser(userData) {
  const user = {
    ...userData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }

  // Criar configurações padrão para o usuário
  await add('settings', {
    userId: user.id,
    ...DEFAULT_SETTINGS
  })

  // Criar categorias padrão
  for (const category of DEFAULT_CATEGORIES) {
    await add('categories', {
      ...category,
      userId: user.id,
      isDefault: true
    })
  }

  return add('users', user)
}

async function getUserByUsername(username) {
  const users = await getByIndex('users', 'username', username)
  return users[0] || null
}

async function updateLastLogin(userId) {
  const user = await get('users', userId)
  if (user) {
    user.lastLogin = new Date().toISOString()
    return update('users', user)
  }
}

/**
 * Operações específicas para Days
 */
async function getOrCreateDay(userId, date) {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]

  // Tentar buscar dia existente
  const days = await getByIndex('days', 'userDate', [userId, dateStr])

  if (days.length > 0) {
    return days[0]
  }

  // Criar novo dia
  const newDay = {
    id: uuidv4(),
    userId,
    date: dateStr,
    notes: '',
    mood: null,
    energyLevel: null,
    goals: [],
    summary: null
  }

  return add('days', newDay)
}

async function getDaysByRange(userId, startDate, endDate) {
  const days = await getAll('days')
  return days.filter(day =>
    day.userId === userId &&
    day.date >= startDate &&
    day.date <= endDate
  ).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Operações específicas para Tasks
 */
async function getTasksByDay(userId, date) {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
  const tasks = await getByIndex('tasks', 'userDate', [userId, dateStr])
  return tasks.sort((a, b) => a.plannedStart.localeCompare(b.plannedStart))
}

async function getTasksByDateRange(userId, startDate, endDate) {
  const allTasks = await getByIndex('tasks', 'userId', userId)
  return allTasks.filter(task =>
    task.date >= startDate && task.date <= endDate
  ).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.plannedStart.localeCompare(b.plannedStart)
  })
}

async function createTask(taskData) {
  const task = {
    id: uuidv4(),
    ...taskData,
    status: taskData.status || 'planned',
    actualStart: null,
    actualEnd: null,
    actualDuration: null,
    distractions: [],
    notes: taskData.notes || '',
    rating: null,
    completionNotes: ''
  }

  return add('tasks', task)
}

async function updateTaskStatus(taskId, status, additionalData = {}) {
  const task = await get('tasks', taskId)
  if (!task) throw new Error('Task não encontrada')

  const now = new Date().toISOString()
  const updates = { ...additionalData, status }

  switch (status) {
    case 'in-progress':
      updates.actualStart = updates.actualStart || now
      break
    case 'completed':
      updates.actualEnd = now
      if (task.actualStart) {
        const start = new Date(task.actualStart)
        const end = new Date(now)
        updates.actualDuration = Math.round((end - start) / 60000) // em minutos
      }
      break
    case 'skipped':
      updates.actualEnd = now
      updates.actualDuration = 0
      break
  }

  return update('tasks', { ...task, ...updates })
}

/**
 * Operações específicas para Categories
 */
async function getCategoriesByUser(userId) {
  return getByIndex('categories', 'userId', userId)
}

async function createCategory(categoryData) {
  return add('categories', {
    ...categoryData,
    isDefault: false
  })
}

/**
 * Operações específicas para Distractions
 */
async function addDistraction(taskId, userId, distractionData) {
  return add('distractions', {
    ...distractionData,
    taskId,
    userId,
    timestamp: new Date().toISOString()
  })
}

async function getDistractionsByTask(taskId) {
  return getByIndex('distractions', 'taskId', taskId)
}

/**
 * Operações específicas para Settings
 */
async function getUserSettings(userId) {
  const settings = await get('settings', userId)
  return settings || { userId, ...DEFAULT_SETTINGS }
}

async function updateUserSettings(userId, newSettings) {
  const currentSettings = await getUserSettings(userId)
  return update('settings', {
    ...currentSettings,
    ...newSettings,
    userId
  })
}

/**
 * Operações específicas para Exports
 */
async function logExport(userId, format, metadata = {}) {
  return add('exports', {
    userId,
    format,
    date: new Date().toISOString(),
    ...metadata
  })
}

async function getExportHistory(userId) {
  const exports = await getByIndex('exports', 'userId', userId)
  return exports.sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Estatísticas e análises
 */
async function getDayStats(userId, date) {
  const tasks = await getTasksByDay(userId, date)

  const stats = {
    totalTasks: tasks.length,
    completed: 0,
    skipped: 0,
    inProgress: 0,
    planned: 0,
    totalPlannedMinutes: 0,
    totalActualMinutes: 0,
    totalDistractions: 0,
    completionRate: 0,
    efficiencyRate: 0,
    byCategory: {}
  }

  for (const task of tasks) {
    stats[task.status]++
    stats.totalPlannedMinutes += task.plannedDuration || 0
    stats.totalActualMinutes += task.actualDuration || 0
    stats.totalDistractions += task.distractions?.length || 0

    // Por categoria
    if (!stats.byCategory[task.category]) {
      stats.byCategory[task.category] = {
        count: 0,
        plannedMinutes: 0,
        actualMinutes: 0,
        completed: 0
      }
    }
    stats.byCategory[task.category].count++
    stats.byCategory[task.category].plannedMinutes += task.plannedDuration || 0
    stats.byCategory[task.category].actualMinutes += task.actualDuration || 0
    if (task.status === 'completed') {
      stats.byCategory[task.category].completed++
    }
  }

  // Calcular taxas
  if (stats.totalTasks > 0) {
    stats.completionRate = Math.round((stats.completed / stats.totalTasks) * 100)
  }
  if (stats.totalPlannedMinutes > 0) {
    stats.efficiencyRate = Math.round((stats.totalActualMinutes / stats.totalPlannedMinutes) * 100)
  }

  return stats
}

async function getWeekStats(userId, weekStartDate) {
  const startDate = new Date(weekStartDate)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const tasks = await getTasksByDateRange(
    userId,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  )

  const dailyStats = {}
  const weekStats = {
    totalTasks: 0,
    completed: 0,
    totalPlannedMinutes: 0,
    totalActualMinutes: 0,
    mostProductiveDay: null,
    mostProductiveHour: null,
    byCategory: {},
    dailyCompletion: []
  }

  // Agrupar por dia
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    dailyStats[dateStr] = { completed: 0, total: 0, minutes: 0 }
  }

  for (const task of tasks) {
    weekStats.totalTasks++
    weekStats.totalPlannedMinutes += task.plannedDuration || 0
    weekStats.totalActualMinutes += task.actualDuration || 0

    if (dailyStats[task.date]) {
      dailyStats[task.date].total++
      if (task.status === 'completed') {
        dailyStats[task.date].completed++
        dailyStats[task.date].minutes += task.actualDuration || 0
        weekStats.completed++
      }
    }

    // Por categoria
    if (!weekStats.byCategory[task.category]) {
      weekStats.byCategory[task.category] = 0
    }
    weekStats.byCategory[task.category]++
  }

  // Calcular dia mais produtivo
  let maxMinutes = 0
  for (const [date, stats] of Object.entries(dailyStats)) {
    weekStats.dailyCompletion.push({
      date,
      completed: stats.completed,
      total: stats.total,
      minutes: stats.minutes,
      rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    })

    if (stats.minutes > maxMinutes) {
      maxMinutes = stats.minutes
      weekStats.mostProductiveDay = date
    }
  }

  return weekStats
}

/**
 * Backup e restauração
 */
async function exportAllData(userId) {
  const [user, days, tasks, categories, settings, distractions] = await Promise.all([
    get('users', userId),
    getByIndex('days', 'userId', userId),
    getByIndex('tasks', 'userId', userId),
    getByIndex('categories', 'userId', userId),
    get('settings', userId),
    getByIndex('distractions', 'userId', userId)
  ])

  return {
    meta: {
      exportDate: new Date().toISOString(),
      version: DB_VERSION,
      app: 'CronoFocus'
    },
    user: { ...user, passwordHash: undefined },
    days,
    tasks,
    categories,
    settings,
    distractions
  }
}

async function importData(data, userId) {
  // Validar estrutura
  if (!data.meta || data.meta.app !== 'CronoFocus') {
    throw new Error('Formato de arquivo inválido')
  }

  // Importar dias
  for (const day of data.days || []) {
    await add('days', { ...day, userId, id: uuidv4() })
  }

  // Importar tasks
  for (const task of data.tasks || []) {
    await add('tasks', { ...task, userId, id: uuidv4() })
  }

  // Importar categorias (apenas customizadas)
  for (const category of data.categories || []) {
    if (!category.isDefault) {
      await add('categories', { ...category, userId, id: uuidv4() })
    }
  }

  return true
}

/**
 * Composable principal
 */
export function useIndexedDB() {
  return {
    // Estado
    db: readonly(db),
    isReady: readonly(isReady),
    error: readonly(error),

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
