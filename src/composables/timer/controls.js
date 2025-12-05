/**
 * CronoFocus - Timer Controls Module
 * Controles do timer
 */

import { createWorker, getWorker, postCommand } from './worker'
import {
  isRunning,
  isPaused,
  remainingSeconds,
  totalSeconds,
  elapsedSeconds,
  currentTaskId,
  handleWorkerMessage
} from './state'

/**
 * Garante que o worker existe
 */
function ensureWorker() {
  if (!getWorker()) {
    createWorker(handleWorkerMessage)
  }
}

/**
 * Inicia o timer
 * @param {number} seconds - Duração em segundos
 * @param {string} taskId - ID da tarefa (opcional)
 */
export function start(seconds, taskId = null) {
  ensureWorker()

  totalSeconds.value = seconds
  remainingSeconds.value = seconds
  elapsedSeconds.value = 0
  currentTaskId.value = taskId
  isRunning.value = true
  isPaused.value = false

  postCommand('start', seconds)
}

/**
 * Inicia timer em minutos
 */
export function startMinutes(minutes, taskId = null) {
  start(minutes * 60, taskId)
}

/**
 * Pausa o timer
 */
export function pause() {
  if (!isRunning.value || isPaused.value) return

  isPaused.value = true
  postCommand('pause')
}

/**
 * Retoma o timer
 */
export function resume() {
  if (!isPaused.value) return

  isPaused.value = false
  isRunning.value = true
  postCommand('resume')
}

/**
 * Para o timer
 */
export function stop() {
  isRunning.value = false
  isPaused.value = false
  postCommand('stop')
}

/**
 * Reseta o timer
 * @param {number} seconds - Nova duração (opcional, usa a original se não especificada)
 */
export function reset(seconds = null) {
  const time = seconds || totalSeconds.value
  totalSeconds.value = time
  remainingSeconds.value = time
  elapsedSeconds.value = 0
  isRunning.value = false
  isPaused.value = false

  postCommand('reset', time)
}

/**
 * Adiciona tempo ao timer
 */
export function addTime(seconds) {
  totalSeconds.value += seconds
  postCommand('add', seconds)
}

/**
 * Adiciona minutos ao timer
 */
export function addMinutes(minutes) {
  addTime(minutes * 60)
}
