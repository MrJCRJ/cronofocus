/**
 * CronoFocus - Time Store
 * Gerenciamento de estado de tarefas e agenda
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useIndexedDB } from '@/composables/useIndexedDB'
import { useAuthStore } from './authStore'

export const useTimeStore = defineStore('time', () => {
  const db = useIndexedDB()
  const authStore = useAuthStore()

  // Estado
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  const tasks = ref([])
  const currentDay = ref(null)
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentTask = ref(null) // Tarefa em execução

  // Getters
  const userId = computed(() => authStore.user?.id)

  const sortedTasks = computed(() => {
    return [...tasks.value].sort((a, b) =>
      a.plannedStart.localeCompare(b.plannedStart)
    )
  })

  const tasksByStatus = computed(() => {
    const grouped = {
      planned: [],
      'in-progress': [],
      completed: [],
      skipped: [],
      paused: []
    }

    tasks.value.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })

    return grouped
  })

  const taskInProgress = computed(() => {
    return tasks.value.find(t => t.status === 'in-progress')
  })

  const dayProgress = computed(() => {
    if (tasks.value.length === 0) return 0
    const completed = tasks.value.filter(t => t.status === 'completed').length
    return Math.round((completed / tasks.value.length) * 100)
  })

  const totalPlannedMinutes = computed(() => {
    return tasks.value.reduce((sum, t) => sum + (t.plannedDuration || 0), 0)
  })

  const totalActualMinutes = computed(() => {
    return tasks.value.reduce((sum, t) => sum + (t.actualDuration || 0), 0)
  })

  // Actions
  async function setDate(date) {
    selectedDate.value = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    await loadDayTasks()
  }

  async function loadDayTasks() {
    if (!userId.value) return

    try {
      loading.value = true
      error.value = null

      // Carregar ou criar dia
      currentDay.value = await db.getOrCreateDay(userId.value, selectedDate.value)

      // Carregar tarefas
      tasks.value = await db.getTasksByDay(userId.value, selectedDate.value)
    } catch (err) {
      error.value = err.message
      console.error('Erro ao carregar tarefas:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadCategories() {
    if (!userId.value) return

    try {
      categories.value = await db.getCategoriesByUser(userId.value)
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
      // Usar categorias padrão
      categories.value = db.DEFAULT_CATEGORIES
    }
  }

  async function createTask(taskData) {
    if (!userId.value) throw new Error('Usuário não autenticado')

    try {
      const task = await db.createTask({
        ...taskData,
        userId: userId.value,
        dayId: currentDay.value?.id,
        date: selectedDate.value
      })

      tasks.value.push(task)
      return task
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function updateTask(taskId, updates) {
    try {
      const taskIndex = tasks.value.findIndex(t => t.id === taskId)
      if (taskIndex === -1) throw new Error('Tarefa não encontrada')

      const updatedTask = await db.update('tasks', {
        ...tasks.value[taskIndex],
        ...updates
      })

      tasks.value[taskIndex] = updatedTask
      return updatedTask
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function deleteTask(taskId) {
    try {
      await db.remove('tasks', taskId)
      tasks.value = tasks.value.filter(t => t.id !== taskId)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function startTask(taskId) {
    // Pausar tarefa atual se houver
    if (taskInProgress.value && taskInProgress.value.id !== taskId) {
      await pauseTask(taskInProgress.value.id)
    }

    const task = await db.updateTaskStatus(taskId, 'in-progress', {
      actualStart: new Date().toISOString()
    })

    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks.value[index] = task
    }

    currentTask.value = task
    return task
  }

  async function pauseTask(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    const updated = await db.updateTaskStatus(taskId, 'paused')

    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks.value[index] = updated
    }

    if (currentTask.value?.id === taskId) {
      currentTask.value = null
    }

    return updated
  }

  async function completeTask(taskId, completionData = {}) {
    const task = await db.updateTaskStatus(taskId, 'completed', completionData)

    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks.value[index] = task
    }

    if (currentTask.value?.id === taskId) {
      currentTask.value = null
    }

    return task
  }

  async function skipTask(taskId, reason = '') {
    const task = await db.updateTaskStatus(taskId, 'skipped', {
      skipReason: reason
    })

    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      tasks.value[index] = task
    }

    return task
  }

  async function addDistraction(taskId, distractionData) {
    if (!userId.value) return

    const distraction = await db.addDistraction(taskId, userId.value, distractionData)

    // Atualizar task local
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      if (!task.distractions) task.distractions = []
      task.distractions.push(distraction)
    }

    return distraction
  }

  async function moveTask(taskId, newStart, newEnd) {
    return updateTask(taskId, {
      plannedStart: newStart,
      plannedEnd: newEnd
    })
  }

  async function duplicateTask(taskId) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    const newTask = await createTask({
      title: task.title,
      category: task.category,
      plannedStart: task.plannedStart,
      plannedEnd: task.plannedEnd,
      plannedDuration: task.plannedDuration,
      description: task.description,
      priority: task.priority
    })

    return newTask
  }

  async function getDayStats() {
    if (!userId.value) return null
    return db.getDayStats(userId.value, selectedDate.value)
  }

  async function getWeekStats(weekStart) {
    if (!userId.value) return null
    return db.getWeekStats(userId.value, weekStart)
  }

  async function getTasksByDateRange(startDate, endDate) {
    if (!userId.value) return []
    return db.getTasksByDateRange(userId.value, startDate, endDate)
  }

  async function updateDayNotes(notes) {
    if (!currentDay.value) return

    currentDay.value = await db.update('days', {
      ...currentDay.value,
      notes
    })
  }

  async function updateDayMood(mood, energyLevel) {
    if (!currentDay.value) return

    currentDay.value = await db.update('days', {
      ...currentDay.value,
      mood,
      energyLevel
    })
  }

  // Reset ao trocar de usuário
  function reset() {
    selectedDate.value = new Date().toISOString().split('T')[0]
    tasks.value = []
    currentDay.value = null
    categories.value = []
    currentTask.value = null
    error.value = null
  }

  return {
    // Estado
    selectedDate,
    tasks,
    currentDay,
    categories,
    loading,
    error,
    currentTask,

    // Getters
    userId,
    sortedTasks,
    tasksByStatus,
    taskInProgress,
    dayProgress,
    totalPlannedMinutes,
    totalActualMinutes,

    // Actions
    setDate,
    loadDayTasks,
    loadCategories,
    createTask,
    updateTask,
    deleteTask,
    startTask,
    pauseTask,
    completeTask,
    skipTask,
    addDistraction,
    moveTask,
    duplicateTask,
    getDayStats,
    getWeekStats,
    getTasksByDateRange,
    updateDayNotes,
    updateDayMood,
    reset
  }
})
