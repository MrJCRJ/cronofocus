/**
 * CronoFocus - Timer Composable
 * Timer modularizado com Web Worker
 */

import { onUnmounted } from 'vue'

// Importar módulos
import { createWorker, getWorker } from './timer/worker'
import {
  readonlyState,
  progress,
  remainingMinutes,
  remainingSecondsOnly,
  elapsedMinutes,
  setCallbacks,
  clearCallbacks,
  handleWorkerMessage
} from './timer/state'
import {
  start,
  startMinutes,
  pause,
  resume,
  stop,
  reset,
  addTime,
  addMinutes
} from './timer/controls'
import {
  formattedTime,
  formattedElapsed,
  formatDuration,
  formatMinutes
} from './timer/formatting'

/**
 * Composable do Timer
 */
export function useTimer() {
  // Garante que o worker existe
  if (!getWorker()) {
    createWorker(handleWorkerMessage)
  }

  // Cleanup ao desmontar
  onUnmounted(() => {
    // Não terminamos o worker aqui pois é global
    // Apenas limpamos os callbacks deste componente
    clearCallbacks()
  })

  return {
    // Estado (readonly)
    ...readonlyState,

    // Computed
    progress,
    remainingMinutes,
    remainingSecondsOnly,
    formattedTime,
    formattedElapsed,
    elapsedMinutes,

    // Métodos
    start,
    startMinutes,
    pause,
    resume,
    stop,
    reset,
    addTime,
    addMinutes,
    setCallbacks,
    clearCallbacks
  }
}

// Re-exportar funções de formatação para uso direto
export { formatDuration, formatMinutes }
