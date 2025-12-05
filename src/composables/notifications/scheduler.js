/**
 * CronoFocus - Notifications Scheduler Module
 * Agendamento de notificações
 */

import { notifyTaskReminder, notifyTaskStart, notifyDailySummary } from './tasks'

// Armazena timeouts ativos para poder cancelar
const scheduledTimeouts = new Map()

/**
 * Agenda notificações para uma tarefa
 */
export function scheduleTaskNotifications(task, settings) {
  const reminderMinutes = settings.reminderMinutes || 5
  const now = Date.now()
  const taskStart = new Date(`${task.date}T${task.plannedStart}`).getTime()

  // Lembrete antes da tarefa
  const reminderTime = taskStart - (reminderMinutes * 60 * 1000)
  if (reminderTime > now) {
    const reminderTimeout = reminderTime - now
    const reminderId = setTimeout(() => {
      notifyTaskReminder(task, reminderMinutes)
      scheduledTimeouts.delete(`reminder-${task.id}`)
    }, reminderTimeout)
    
    scheduledTimeouts.set(`reminder-${task.id}`, reminderId)
  }

  // Notificação no início
  if (taskStart > now) {
    const startTimeout = taskStart - now
    const startId = setTimeout(() => {
      notifyTaskStart(task)
      scheduledTimeouts.delete(`start-${task.id}`)
    }, startTimeout)
    
    scheduledTimeouts.set(`start-${task.id}`, startId)
  }
}

/**
 * Cancela notificações agendadas para uma tarefa
 */
export function cancelScheduledNotifications(taskId) {
  const reminderKey = `reminder-${taskId}`
  const startKey = `start-${taskId}`
  
  if (scheduledTimeouts.has(reminderKey)) {
    clearTimeout(scheduledTimeouts.get(reminderKey))
    scheduledTimeouts.delete(reminderKey)
  }
  
  if (scheduledTimeouts.has(startKey)) {
    clearTimeout(scheduledTimeouts.get(startKey))
    scheduledTimeouts.delete(startKey)
  }
}

/**
 * Agenda resumo diário
 */
export function scheduleDailySummary(hour = 20, getStatsCallback = null) {
  const now = new Date()
  const summaryTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    0,
    0
  )

  // Se já passou, agendar para amanhã
  if (summaryTime <= now) {
    summaryTime.setDate(summaryTime.getDate() + 1)
  }

  const timeout = summaryTime.getTime() - now.getTime()

  const summaryId = setTimeout(async () => {
    // Obter estatísticas do dia se callback fornecido
    if (getStatsCallback) {
      const stats = await getStatsCallback()
      await notifyDailySummary(stats)
    }
    
    // Re-agendar para próximo dia
    scheduleDailySummary(hour, getStatsCallback)
    scheduledTimeouts.delete('daily-summary')
  }, timeout)
  
  scheduledTimeouts.set('daily-summary', summaryId)
}

/**
 * Cancela resumo diário agendado
 */
export function cancelDailySummary() {
  if (scheduledTimeouts.has('daily-summary')) {
    clearTimeout(scheduledTimeouts.get('daily-summary'))
    scheduledTimeouts.delete('daily-summary')
  }
}

/**
 * Cancela todas as notificações agendadas
 */
export function cancelAllScheduled() {
  scheduledTimeouts.forEach((timeoutId) => {
    clearTimeout(timeoutId)
  })
  scheduledTimeouts.clear()
}
