/**
 * CronoFocus - Timer State Module
 * Estado global do timer
 */

import { ref, computed, readonly } from 'vue'

// Estado global do timer (singleton)
export const isRunning = ref(false)
export const isPaused = ref(false)
export const remainingSeconds = ref(0)
export const totalSeconds = ref(0)
export const elapsedSeconds = ref(0)
export const currentTaskId = ref(null)

// Callbacks
let onUpdate = null
let onFinished = null
let onMinute = null
let onWarning = null

/**
 * Define callbacks do timer
 */
export function setCallbacks(callbacks) {
  if (callbacks.onUpdate) onUpdate = callbacks.onUpdate
  if (callbacks.onFinished) onFinished = callbacks.onFinished
  if (callbacks.onMinute) onMinute = callbacks.onMinute
  if (callbacks.onWarning) onWarning = callbacks.onWarning
}

/**
 * Limpa callbacks
 */
export function clearCallbacks() {
  onUpdate = null
  onFinished = null
  onMinute = null
  onWarning = null
}

/**
 * Handler de mensagens do worker
 */
export function handleWorkerMessage(e) {
  const { type, time, minutes } = e.data

  switch (type) {
    case 'update':
      remainingSeconds.value = time
      elapsedSeconds.value = totalSeconds.value - time
      if (onUpdate) onUpdate(time)
      break

    case 'finished':
      isRunning.value = false
      isPaused.value = false
      remainingSeconds.value = 0
      if (onFinished) onFinished()
      break

    case 'paused':
      isPaused.value = true
      remainingSeconds.value = time
      break

    case 'reset':
      remainingSeconds.value = time
      elapsedSeconds.value = 0
      break

    case 'stopped':
      isRunning.value = false
      isPaused.value = false
      break

    case 'minute':
      if (onMinute) onMinute(minutes)
      break

    case 'warning':
      if (onWarning) onWarning(minutes)
      break
  }
}

// Computed properties
export const progress = computed(() => {
  if (totalSeconds.value === 0) return 0
  return ((totalSeconds.value - remainingSeconds.value) / totalSeconds.value) * 100
})

export const remainingMinutes = computed(() => Math.floor(remainingSeconds.value / 60))

export const remainingSecondsOnly = computed(() => remainingSeconds.value % 60)

export const elapsedMinutes = computed(() => Math.floor(elapsedSeconds.value / 60))

/**
 * Estado readonly para consumo externo
 */
export const readonlyState = {
  isRunning: readonly(isRunning),
  isPaused: readonly(isPaused),
  remainingSeconds: readonly(remainingSeconds),
  totalSeconds: readonly(totalSeconds),
  elapsedSeconds: readonly(elapsedSeconds),
  currentTaskId: readonly(currentTaskId)
}
