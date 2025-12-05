/**
 * CronoFocus - Notifications Audio Module
 * Sistema de áudio para notificações
 */

import { ref } from 'vue'

// Cache de áudio
const audioCache = new Map()
const audioContext = ref(null)

// Caminhos dos sons de notificação
export const NOTIFICATION_SOUNDS = {
  taskReminder: '/sounds/soft-alert.mp3',
  taskStart: '/sounds/start-chime.mp3',
  taskComplete: '/sounds/success-bell.mp3',
  dailySummary: '/sounds/evening-summary.mp3',
  timerTick: '/sounds/tick.mp3',
  timerEnd: '/sounds/timer-end.mp3'
}

// Configuração de beeps programáticos (fallback)
const BEEP_CONFIG = {
  taskReminder: { frequency: 523.25, duration: 200 },    // C5
  taskStart: { frequency: 659.25, duration: 150 },       // E5
  taskComplete: { frequency: 783.99, duration: 300 },    // G5
  dailySummary: { frequency: 440, duration: 400 },       // A4
  timerTick: { frequency: 880, duration: 50 },           // A5
  timerEnd: { frequency: 1046.50, duration: 500 }        // C6
}

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
export function playBeep(frequency = 440, duration = 200, volume = 0.3) {
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
 * Pré-carrega todos os sons
 */
export function preloadSounds() {
  Object.keys(NOTIFICATION_SOUNDS).forEach(loadSound)
}

/**
 * Toca som de notificação
 */
export async function playSound(type, volume = 0.3) {
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
