/**
 * CronoFocus - Notifications Composable
 * Sistema de notificações push com sons
 */

import { ref, readonly } from 'vue'

// Estado
const permissionStatus = ref('default')
const isSupported = ref(false)
const subscription = ref(null)

// Sons de notificação
const NOTIFICATION_SOUNDS = {
  taskReminder: '/sounds/soft-alert.mp3',
  taskStart: '/sounds/start-chime.mp3',
  taskComplete: '/sounds/success-bell.mp3',
  dailySummary: '/sounds/evening-summary.mp3',
  timerTick: '/sounds/tick.mp3',
  timerEnd: '/sounds/timer-end.mp3'
}

// Cache de áudio
const audioCache = new Map()
const audioContext = ref(null)

/**
 * Cria AudioContext para gerar sons programaticamente
 */
function getAudioContext() {
  if (!audioContext.value && typeof AudioContext !== 'undefined') {
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext.value
}

/**
 * Gera beep programático como fallback
 */
function playBeep(frequency = 440, duration = 200, volume = 0.3) {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'
    gainNode.gain.value = volume

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration / 1000)
  } catch (error) {
    console.log('AudioContext não disponível:', error.message)
  }
}

// Configuração de sons programáticos
const BEEP_CONFIG = {
  taskReminder: { frequency: 523.25, duration: 200 },    // C5
  taskStart: { frequency: 659.25, duration: 150 },       // E5
  taskComplete: { frequency: 783.99, duration: 300 },    // G5
  dailySummary: { frequency: 440, duration: 400 },       // A4
  timerTick: { frequency: 880, duration: 50 },           // A5
  timerEnd: { frequency: 1046.50, duration: 500 }        // C6
}

/**
 * Carrega e faz cache do áudio
 */
function loadSound(type) {
  if (!audioCache.has(type) && NOTIFICATION_SOUNDS[type]) {
    const audio = new Audio(NOTIFICATION_SOUNDS[type])
    audio.preload = 'auto'

    // Verificar se o arquivo existe
    audio.onerror = () => {
      audioCache.set(type, null) // Marcar como não disponível
    }

    audioCache.set(type, audio)
  }
  return audioCache.get(type)
}

/**
 * Toca som de notificação
 */
async function playSound(type, volume = 0.3) {
  try {
    const audio = loadSound(type)

    if (audio) {
      audio.volume = volume
      audio.currentTime = 0
      await audio.play()
    } else {
      // Fallback para beep programático
      const config = BEEP_CONFIG[type] || { frequency: 440, duration: 200 }
      playBeep(config.frequency, config.duration, volume)
    }
  } catch (error) {
    // Fallback para beep programático
    const config = BEEP_CONFIG[type] || { frequency: 440, duration: 200 }
    playBeep(config.frequency, config.duration, volume)
  }
}

/**
 * Composable de notificações
 */
export function useNotifications() {
  /**
   * Inicializa o sistema de notificações
   */
  function init() {
    isSupported.value = 'Notification' in window && 'serviceWorker' in navigator

    if (isSupported.value) {
      permissionStatus.value = Notification.permission
    }

    // Pré-carregar sons
    Object.keys(NOTIFICATION_SOUNDS).forEach(loadSound)
  }

  /**
   * Solicita permissão para notificações
   */
  async function requestPermission() {
    if (!isSupported.value) {
      console.warn('Notificações não são suportadas neste navegador')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      permissionStatus.value = permission

      if (permission === 'granted') {
        // Registrar service worker se ainda não estiver
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready

          // Tentar subscrever para push (se VAPID key disponível)
          try {
            // Note: Em produção, usar VAPID key real
            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
            if (vapidKey) {
              subscription.value = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey
              })
            }
          } catch (pushError) {
            console.log('Push subscription não disponível:', pushError.message)
          }
        }

        return true
      }

      return false
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      return false
    }
  }

  /**
   * Envia notificação local
   */
  async function notify(options) {
    const {
      title,
      body,
      icon = '/icons/icon-192x192.png',
      badge = '/icons/badge-72x72.png',
      tag,
      data,
      sound,
      requireInteraction = false,
      actions = []
    } = options

    // Tocar som se especificado
    if (sound) {
      const settings = JSON.parse(localStorage.getItem('cronofocus_settings') || '{}')
      if (settings.soundEnabled !== false) {
        await playSound(sound, settings.soundVolume || 0.3)
      }
    }

    // Verificar permissão
    if (permissionStatus.value !== 'granted') {
      console.log('Notificações não permitidas')
      return null
    }

    try {
      // Usar Service Worker se disponível (melhor para PWA)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, {
          body,
          icon,
          badge,
          tag,
          data,
          requireInteraction,
          actions,
          vibrate: [100, 50, 100]
        })
      } else {
        // Fallback para Notification API básica
        new Notification(title, {
          body,
          icon,
          tag,
          data
        })
      }
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error)
    }
  }

  /**
   * Notificação de lembrete de tarefa
   */
  async function notifyTaskReminder(task, minutesBefore) {
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
  async function notifyTaskStart(task) {
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
  async function notifyTaskComplete(task, stats) {
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
  async function notifyTimerEnd(task) {
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
  async function notifyDailySummary(stats) {
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

  /**
   * Agenda notificações para uma tarefa
   */
  function scheduleTaskNotifications(task, settings) {
    const reminderMinutes = settings.reminderMinutes || 5
    const now = Date.now()
    const taskStart = new Date(`${task.date}T${task.plannedStart}`).getTime()

    // Lembrete antes da tarefa
    const reminderTime = taskStart - (reminderMinutes * 60 * 1000)
    if (reminderTime > now) {
      const reminderTimeout = reminderTime - now
      setTimeout(() => {
        notifyTaskReminder(task, reminderMinutes)
      }, reminderTimeout)
    }

    // Notificação no início
    if (taskStart > now) {
      const startTimeout = taskStart - now
      setTimeout(() => {
        notifyTaskStart(task)
      }, startTimeout)
    }
  }

  /**
   * Agenda resumo diário
   */
  function scheduleDailySummary(hour = 20) {
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

    setTimeout(async () => {
      // Obter estatísticas do dia (implementar integração com store)
      // Por enquanto, apenas re-agendar
      scheduleDailySummary(hour)
    }, timeout)
  }

  /**
   * Cancela notificações agendadas para uma tag
   */
  async function cancelNotification(tag) {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      const notifications = await registration.getNotifications({ tag })
      notifications.forEach(notification => notification.close())
    }
  }

  /**
   * Cancela todas as notificações
   */
  async function cancelAllNotifications() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      const notifications = await registration.getNotifications()
      notifications.forEach(notification => notification.close())
    }
  }

  return {
    // Estado
    permissionStatus: readonly(permissionStatus),
    isSupported: readonly(isSupported),
    subscription: readonly(subscription),

    // Métodos
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

    // Cancelamento
    cancelNotification,
    cancelAllNotifications,

    // Constantes
    NOTIFICATION_SOUNDS
  }
}
