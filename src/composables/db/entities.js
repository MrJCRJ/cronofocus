/**
 * CronoFocus - IndexedDB Entity Operations
 * Operações específicas para cada entidade do sistema
 */

import { v4 as uuidv4 } from 'uuid'
import { add, get, getAll, update, getByIndex } from './crud'
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from './schema'
import { formatDateString, now } from './utils'

// ============================================
// USERS
// ============================================

/**
 * Cria um novo usuário com configurações e categorias padrão
 */
export async function createUser(userData) {
  const user = {
    ...userData,
    id: uuidv4(),
    createdAt: now(),
    lastLogin: now()
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

/**
 * Busca usuário por username
 */
export async function getUserByUsername(username) {
  const users = await getByIndex('users', 'username', username)
  return users[0] || null
}

/**
 * Atualiza último login do usuário
 */
export async function updateLastLogin(userId) {
  const user = await get('users', userId)
  if (user) {
    user.lastLogin = now()
    return update('users', user)
  }
}

// ============================================
// DAYS
// ============================================

/**
 * Obtém ou cria um dia para o usuário
 */
export async function getOrCreateDay(userId, date) {
  const dateStr = formatDateString(date)

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

/**
 * Busca dias em um período
 */
export async function getDaysByRange(userId, startDate, endDate) {
  const days = await getAll('days')
  return days.filter(day =>
    day.userId === userId &&
    day.date >= startDate &&
    day.date <= endDate
  ).sort((a, b) => a.date.localeCompare(b.date))
}

// ============================================
// TASKS
// ============================================

/**
 * Busca tarefas de um dia específico
 */
export async function getTasksByDay(userId, date) {
  const dateStr = formatDateString(date)
  const tasks = await getByIndex('tasks', 'userDate', [userId, dateStr])
  return tasks.sort((a, b) => a.plannedStart.localeCompare(b.plannedStart))
}

/**
 * Busca tarefas em um período
 */
export async function getTasksByDateRange(userId, startDate, endDate) {
  const allTasks = await getByIndex('tasks', 'userId', userId)
  return allTasks.filter(task =>
    task.date >= startDate && task.date <= endDate
  ).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.plannedStart.localeCompare(b.plannedStart)
  })
}

/**
 * Cria uma nova tarefa
 */
export async function createTask(taskData) {
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

/**
 * Atualiza status de uma tarefa
 */
export async function updateTaskStatus(taskId, status, additionalData = {}) {
  const task = await get('tasks', taskId)
  if (!task) throw new Error('Task não encontrada')

  const timestamp = now()
  const updates = { ...additionalData, status }

  switch (status) {
    case 'in-progress':
      updates.actualStart = updates.actualStart || timestamp
      break
    case 'completed':
      updates.actualEnd = timestamp
      if (task.actualStart) {
        const start = new Date(task.actualStart)
        const end = new Date(timestamp)
        updates.actualDuration = Math.round((end - start) / 60000) // em minutos
      }
      break
    case 'skipped':
      updates.actualEnd = timestamp
      updates.actualDuration = 0
      break
  }

  return update('tasks', { ...task, ...updates })
}

// ============================================
// CATEGORIES
// ============================================

/**
 * Busca categorias do usuário
 */
export async function getCategoriesByUser(userId) {
  return getByIndex('categories', 'userId', userId)
}

/**
 * Cria uma nova categoria
 */
export async function createCategory(categoryData) {
  return add('categories', {
    ...categoryData,
    isDefault: false
  })
}

// ============================================
// DISTRACTIONS
// ============================================

/**
 * Adiciona uma distração a uma tarefa
 */
export async function addDistraction(taskId, userId, distractionData) {
  return add('distractions', {
    ...distractionData,
    taskId,
    userId,
    timestamp: now()
  })
}

/**
 * Busca distrações de uma tarefa
 */
export async function getDistractionsByTask(taskId) {
  return getByIndex('distractions', 'taskId', taskId)
}

// ============================================
// SETTINGS
// ============================================

/**
 * Obtém configurações do usuário
 */
export async function getUserSettings(userId) {
  const settings = await get('settings', userId)
  return settings || { userId, ...DEFAULT_SETTINGS }
}

/**
 * Atualiza configurações do usuário
 */
export async function updateUserSettings(userId, newSettings) {
  const currentSettings = await getUserSettings(userId)
  return update('settings', {
    ...currentSettings,
    ...newSettings,
    userId
  })
}

// ============================================
// EXPORTS
// ============================================

/**
 * Registra uma exportação
 */
export async function logExport(userId, format, metadata = {}) {
  return add('exports', {
    userId,
    format,
    date: now(),
    ...metadata
  })
}

/**
 * Busca histórico de exportações
 */
export async function getExportHistory(userId) {
  const exports = await getByIndex('exports', 'userId', userId)
  return exports.sort((a, b) => b.date.localeCompare(a.date))
}
