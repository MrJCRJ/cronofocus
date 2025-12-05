/**
 * CronoFocus - Notifications Tasks Module
 * Notificações específicas para tarefas
 */

import { notify } from './push'

/**
 * Notificação de lembrete de tarefa
 */
export async function notifyTaskReminder(task, minutesBefore) {
  await notify({
    title: `⏰ Em ${minutesBefore} minutos`,
    body: task.title,
    tag: `reminder-${task.id}`,
    sound: 'taskReminder',
    data: { type: 'taskReminder', taskId: task.id },
    actions: [
      { action: 'start', title: 'Iniciar Agora' },
      { action: 'snooze', title: 'Adiar 5min' }
    ]
  })
}

/**
 * Notificação de início de tarefa
 */
export async function notifyTaskStart(task) {
  await notify({
    title: '🚀 Hora de começar!',
    body: task.title,
    tag: `start-${task.id}`,
    sound: 'taskStart',
    data: { type: 'taskStart', taskId: task.id },
    requireInteraction: true,
    actions: [
      { action: 'start', title: 'Iniciar Timer' },
      { action: 'skip', title: 'Pular' }
    ]
  })
}

/**
 * Notificação de tarefa completa
 */
export async function notifyTaskComplete(task, stats) {
  await notify({
    title: '✅ Tarefa concluída!',
    body: `${task.title} - ${stats.duration} min`,
    tag: `complete-${task.id}`,
    sound: 'taskComplete',
    data: { type: 'taskComplete', taskId: task.id }
  })
}

/**
 * Notificação de fim do timer
 */
export async function notifyTimerEnd(task) {
  await notify({
    title: '⏱️ Tempo esgotado!',
    body: `${task.title} - Hora de finalizar`,
    tag: `timer-${task.id}`,
    sound: 'timerEnd',
    requireInteraction: true,
    data: { type: 'timerEnd', taskId: task.id },
    actions: [
      { action: 'complete', title: 'Concluir' },
      { action: 'extend', title: '+10 min' }
    ]
  })
}

/**
 * Notificação de resumo diário
 */
export async function notifyDailySummary(stats) {
  await notify({
    title: '📊 Resumo do Dia',
    body: `${stats.completed}/${stats.total} tarefas • ${stats.totalMinutes} min de foco`,
    tag: 'daily-summary',
    sound: 'dailySummary',
    data: { type: 'dailySummary', stats },
    actions: [
      { action: 'view', title: 'Ver Detalhes' }
    ]
  })
}
