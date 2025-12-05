/**
 * CronoFocus - IndexedDB Statistics
 * Estatísticas e análises de dados
 */

import { add, get, getByIndex } from './crud'
import { getTasksByDay, getTasksByDateRange } from './entities'
import { DB_VERSION } from './schema'

/**
 * Calcula estatísticas de um dia específico
 */
export async function getDayStats(userId, date) {
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

/**
 * Calcula estatísticas de uma semana
 */
export async function getWeekStats(userId, weekStartDate) {
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
 * Exporta todos os dados de um usuário para backup
 */
export async function exportAllData(userId) {
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

/**
 * Importa dados de backup
 */
export async function importData(data, userId) {
  const { v4: uuidv4 } = await import('uuid')

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
