/**
 * CronoFocus - Notifications Composable
 * Sistema de notificações modularizado
 */

// Importar módulos
import { NOTIFICATION_SOUNDS, playSound, preloadSounds } from './notifications/audio'
import {
  readonlyState,
  initNotifications,
  requestPermission,
  notify,
  cancelNotification,
  cancelAllNotifications
} from './notifications/push'
import {
  notifyTaskReminder,
  notifyTaskStart,
  notifyTaskComplete,
  notifyTimerEnd,
  notifyDailySummary
} from './notifications/tasks'
import {
  scheduleTaskNotifications,
  scheduleDailySummary,
  cancelScheduledNotifications,
  cancelAllScheduled
} from './notifications/scheduler'

/**
 * Composable de notificações
 */
export function useNotifications() {
  /**
   * Inicializa o sistema de notificações
   */
  function init() {
    initNotifications()
    preloadSounds()
  }

  return {
    // Estado
    ...readonlyState,

    // Métodos base
    init,
    requestPermission,
    notify,
    playSound,

    // Notificações específicas
    notifyTaskReminder,
    notifyTaskStart,
    notifyTaskComplete,
    notifyTimerEnd,
    notifyDailySummary,

    // Agendamento
    scheduleTaskNotifications,
    scheduleDailySummary,
    cancelScheduledNotifications,

    // Cancelamento
    cancelNotification,
    cancelAllNotifications,
    cancelAllScheduled,

    // Constantes
    NOTIFICATION_SOUNDS
  }
}
