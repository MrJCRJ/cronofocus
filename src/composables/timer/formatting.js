/**
 * CronoFocus - Timer Formatting Module
 * Funções de formatação de tempo
 */

import { computed } from 'vue'
import { remainingSeconds, elapsedSeconds } from './state'

/**
 * Tempo restante formatado (MM:SS ou HH:MM:SS)
 */
export const formattedTime = computed(() => {
  const hours = Math.floor(remainingSeconds.value / 3600)
  const minutes = Math.floor((remainingSeconds.value % 3600) / 60)
  const seconds = remainingSeconds.value % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

/**
 * Tempo decorrido formatado (MM:SS ou HH:MM:SS)
 */
export const formattedElapsed = computed(() => {
  const hours = Math.floor(elapsedSeconds.value / 3600)
  const minutes = Math.floor((elapsedSeconds.value % 3600) / 60)
  const seconds = elapsedSeconds.value % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

/**
 * Formata segundos para string legível
 */
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  if (minutes > 0) {
    return `${minutes}min ${secs}s`
  }
  return `${secs}s`
}

/**
 * Formata minutos para string legível
 */
export function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }
  return `${mins}min`
}
